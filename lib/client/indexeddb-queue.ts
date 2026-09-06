/**
 * IndexedDB Offline Binary Media Queue
 * Handles spotty venue Wi-Fi, background retry, and tab-lifecycle persistence.
 */

export interface QueuedMediaItem {
  id: string;
  eventId: string;
  uploaderName: string;
  guestId?: string;
  guestToken?: string;
  blob: Blob;
  thumbnailDataUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  purposeTag?: string;
  caption?: string;
  status: 'queued' | 'uploading' | 'synced' | 'failed';
  retryCount: number;
  createdAt: number;
  errorReason?: string;
}

const DB_NAME = 'gathercraft_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_queue';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('IndexedDB not supported on server'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by_eventId', 'eventId', { unique: false });
        store.createIndex('by_status', 'status', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueMediaItem(item: Omit<QueuedMediaItem, 'status' | 'retryCount' | 'createdAt'>): Promise<QueuedMediaItem> {
  const db = await openDB();
  const queued: QueuedMediaItem = {
    ...item,
    status: 'queued',
    retryCount: 0,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(queued);
    req.onsuccess = () => resolve(queued);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingMediaCount(eventId?: string): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items: QueuedMediaItem[] = req.result || [];
        const count = items.filter(
          (i) => (!eventId || i.eventId === eventId) && (i.status === 'queued' || i.status === 'uploading' || i.status === 'failed')
        ).length;
        resolve(count);
      };
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

export async function getPendingMediaItems(eventId?: string): Promise<QueuedMediaItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items: QueuedMediaItem[] = req.result || [];
        resolve(items.filter((i) => !eventId || i.eventId === eventId));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function updateMediaItemStatus(id: string, status: QueuedMediaItem['status'], errorReason?: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const item: QueuedMediaItem = req.result;
        if (!item) return resolve();
        item.status = status;
        if (status === 'failed') {
          item.retryCount += 1;
          item.errorReason = errorReason;
        }
        store.put(item);
        resolve();
      };
      req.onerror = () => resolve();
    });
  } catch {
    // Graceful fallback
  }
}

export async function removeMediaItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Flushes pending items in the IndexedDB queue
 */
export async function flushMediaQueue(
  eventId: string,
  onItemUploaded?: (item: QueuedMediaItem) => void
): Promise<{ successCount: number; failureCount: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { successCount: 0, failureCount: 0 };
  }

  const items = await getPendingMediaItems(eventId);
  const pending = items.filter((i) => i.status === 'queued' || i.status === 'failed');

  let successCount = 0;
  let failureCount = 0;

  for (const item of pending) {
    try {
      await updateMediaItemStatus(item.id, 'uploading');

      // 1. Request presigned upload URL from Next.js API
      const presignRes = await fetch(`/api/events/${eventId}/media/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: item.fileName,
          fileSize: item.fileSize,
          mimeType: item.mimeType,
          uploaderName: item.uploaderName,
          guestId: item.guestId,
          guestToken: item.guestToken,
          purposeTag: item.purposeTag,
          caption: item.caption,
          blurHash: item.thumbnailDataUrl,
          width: item.width,
          height: item.height,
        }),
      });

      if (!presignRes.ok) {
        throw new Error(`Presign failed: ${presignRes.status}`);
      }

      const { assetId, uploadUrl } = await presignRes.json();

      // 2. Direct binary stream PUT to storage
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': item.mimeType },
        body: item.blob,
      });

      if (!uploadRes.ok && uploadRes.status !== 0) {
        throw new Error(`Upload stream failed: ${uploadRes.status}`);
      }

      // 3. Mark completed on backend
      await fetch(`/api/events/${eventId}/media/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      });

      await updateMediaItemStatus(item.id, 'synced');
      // Clean up after 1 minute of successful sync
      setTimeout(() => removeMediaItem(item.id), 60000);

      successCount++;
      onItemUploaded?.(item);
    } catch (err: any) {
      console.warn(`Failed to flush media item ${item.id}:`, err);
      await updateMediaItemStatus(item.id, 'failed', err?.message || 'Network error');
      failureCount++;
    }
  }

  return { successCount, failureCount };
}
