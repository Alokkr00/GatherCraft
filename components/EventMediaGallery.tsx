'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Trash2, CheckCircle2, User, EyeOff } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export interface MediaItemView {
  id: string;
  cdnUrl: string;
  blurHash?: string | null;
  uploaderName: string;
  purposeTag?: string | null;
  caption?: string | null;
  createdAt: string;
}

interface Props {
  eventId: string;
  media?: MediaItemView[];
  onMediaDeleted?: (assetId: string) => void;
  refreshTrigger?: number;
}

export default function EventMediaGallery({ eventId, media: initialMedia, onMediaDeleted, refreshTrigger }: Props) {
  const [internalMedia, setInternalMedia] = useState<MediaItemView[]>(initialMedia || []);
  const [loading, setLoading] = useState<boolean>(!initialMedia);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/media`);
      if (res.ok) {
        const data = await res.json();
        setInternalMedia(data.media || []);
      }
    } catch (err) {
      console.warn('Could not fetch event media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialMedia) {
      setInternalMedia(initialMedia);
    } else {
      fetchMedia();
    }
  }, [eventId, initialMedia, refreshTrigger]);

  const handleSelfDelete = (assetId: string) => {
    setDeleteTargetId(assetId);
  };

  const confirmExecuteSelfDelete = async () => {
    if (!deleteTargetId) return;
    const assetId = deleteTargetId;
    setDeleteTargetId(null);
    setRemovingId(assetId);

    try {
      const res = await fetch(`/api/events/${eventId}/media/self-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      });

      if (res.ok) {
        setRemovedIds((prev) => new Set([...Array.from(prev), assetId]));
        onMediaDeleted?.(assetId);
      }
    } catch (err) {
      console.error('Self-delete failed:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const visibleMedia = internalMedia.filter((m) => !removedIds.has(m.id));

  if (loading) {
    return (
      <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
        Loading shared vault moments...
      </div>
    );
  }

  if (visibleMedia.length === 0) {
    return (
      <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">
        <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
        <p className="text-sm font-semibold text-slate-300">The Memory Vault is ready</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Capture and share candid moments during the gathering. All uploads are anchored to tonight's purpose.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {visibleMedia.map((item) => (
        <div
          key={item.id}
          className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square transition-all hover:border-slate-700 shadow-md"
        >
          <img
            src={item.cdnUrl}
            alt={item.caption || 'Gathering memory'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Top Pill: Intent Tag */}
          {item.purposeTag && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow-sm backdrop-blur-sm">
                {item.purposeTag}
              </span>
            </div>
          )}

          {/* Top Right: 1-Tap "Remove Me" Protocol */}
          <div className="absolute top-2 right-2 opacity-90 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => handleSelfDelete(item.id)}
              disabled={removingId === item.id}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center p-2 rounded-full bg-slate-950/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-rose-500 border border-slate-700/60 transition-colors"
              title="1-Tap Remove Me (Immediately hides photo from shared gallery)"
              aria-label="1-Tap Remove Me (Hide photo from shared gallery)"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Captions & Author */}
          <div className="absolute bottom-2 left-2 right-2 space-y-0.5 pointer-events-none">
            {item.caption && (
              <p className="text-[11px] font-medium text-white line-clamp-1 drop-shadow">
                "{item.caption}"
              </p>
            )}
            <p className="text-[10px] text-slate-300 flex items-center gap-1 opacity-90">
              <User className="w-2.5 h-2.5 text-slate-400" />
              <span className="truncate">{item.uploaderName}</span>
            </p>
          </div>
        </div>
      ))}

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Remove Photo from Vault"
        message="Are you sure you want to remove this photo from the shared party gallery? It will be removed immediately."
        confirmText="Remove Photo"
        variant="danger"
        onConfirm={confirmExecuteSelfDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
