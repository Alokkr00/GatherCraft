'use client';

/**
 * Event-Night Offline Check-in Queue
 *
 * Provides graceful degradation when internet connectivity drops at the venue.
 * 1. Checks in guests immediately in local UI and caches changes locally.
 * 2. Queues the mutation in localStorage.
 * 3. Automatically flushes and syncs to Neon PostgreSQL when connectivity returns.
 */

export interface OfflineCheckIn {
  guestId: string;
  eventId: string;
  checkInAt: string | null;
  timestamp: number;
}

const STORAGE_KEY = 'gathercraft_offline_queue';

export function getOfflineQueue(): OfflineCheckIn[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineCheckIn(eventId: string, guestId: string, checkInAt: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = getOfflineQueue();
    // Update or append
    const existingIdx = queue.findIndex(q => q.guestId === guestId && q.eventId === eventId);
    if (existingIdx >= 0) {
      queue[existingIdx] = { guestId, eventId, checkInAt, timestamp: Date.now() };
    } else {
      queue.push({ guestId, eventId, checkInAt, timestamp: Date.now() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to queue offline check-in:', err);
  }
}

export function removeOfflineCheckIn(eventId: string, guestId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = getOfflineQueue().filter(q => !(q.guestId === guestId && q.eventId === eventId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to remove queued item:', err);
  }
}

export async function flushOfflineQueue(eventId?: string): Promise<{ syncedCount: number; errors: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { syncedCount: 0, errors: 0 };
  }

  const queue = getOfflineQueue();
  const toSync = eventId ? queue.filter(q => q.eventId === eventId) : queue;
  if (toSync.length === 0) return { syncedCount: 0, errors: 0 };

  let syncedCount = 0;
  let errors = 0;

  for (const item of toSync) {
    try {
      const res = await fetch(`/api/events/${item.eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.guestId,
          checkInAt: item.checkInAt,
        }),
      });

      if (res.ok) {
        removeOfflineCheckIn(item.eventId, item.guestId);
        syncedCount++;
      } else {
        errors++;
      }
    } catch {
      errors++;
      // Still offline or network blip; keep in queue for next retry
    }
  }

  return { syncedCount, errors };
}

export function getPendingQueueCount(eventId?: string): number {
  const queue = getOfflineQueue();
  if (eventId) {
    return queue.filter(q => q.eventId === eventId).length;
  }
  return queue.length;
}
