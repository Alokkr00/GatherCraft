'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Sparkles, X, Check, Upload, WifiOff } from 'lucide-react';
import { compressImageClient } from '@/lib/client/media-compressor';
import { enqueueMediaItem, flushMediaQueue, getPendingMediaCount } from '@/lib/client/indexeddb-queue';

interface Props {
  eventId: string;
  uploaderName: string;
  guestId?: string;
  guestToken?: string;
  purposeStatement?: string;
  onMediaUploaded?: () => void;
}

const PURPOSE_TAGS = ['✨ Quiet Win', '🥂 The Toast', '😂 Pure Joy', '🍕 Food & Feast', '🤫 Behind the Scenes'];

export default function MobileMediaUploadDrawer({
  eventId,
  uploaderName,
  guestId,
  guestToken,
  purposeStatement,
  onMediaUploaded,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [activeBlob, setActiveBlob] = useState<Blob | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>(PURPOSE_TAGS[0]);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Non-blocking upload pill state
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPendingMediaCount(eventId).then(setPendingCount);

    const handleOnline = () => {
      flushMediaQueue(eventId, () => {
        onMediaUploaded?.();
        getPendingMediaCount(eventId).then(setPendingCount);
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [eventId, onMediaUploaded]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const result = await compressImageClient(file);
      setActiveFile(result.file);
      setActiveBlob(result.blob);
      setPreviewUrl(result.thumbnailDataUrl || URL.createObjectURL(result.blob));
      setIsOpen(true);
    } catch (err) {
      console.error('Image optimization failed:', err);
      alert('Could not prepare photo for upload. Please try again.');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    if (!activeBlob || !activeFile) return;

    setIsOpen(false);
    setUploadStatus('Queueing...');

    try {
      await enqueueMediaItem({
        id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        uploaderName,
        guestId,
        guestToken,
        blob: activeBlob,
        thumbnailDataUrl: previewUrl || '',
        fileName: activeFile.name,
        mimeType: activeFile.type || 'image/webp',
        fileSize: activeBlob.size,
        purposeTag: selectedTag,
        caption: caption.trim() || undefined,
      });

      // Clear staged form
      setActiveBlob(null);
      setActiveFile(null);
      setPreviewUrl(null);
      setCaption('');

      setUploadStatus('Uploading...');
      getPendingMediaCount(eventId).then(setPendingCount);

      // Kick off non-blocking background flush
      flushMediaQueue(eventId, () => {
        onMediaUploaded?.();
        getPendingMediaCount(eventId).then(setPendingCount);
      }).then(({ successCount, failureCount }) => {
        if (successCount > 0) {
          setUploadStatus('Saved to Vault! ✨');
          setTimeout(() => setUploadStatus(null), 3500);
        } else if (failureCount > 0) {
          setUploadStatus('Saved offline. Will sync when online.');
          setTimeout(() => setUploadStatus(null), 4000);
        } else {
          setUploadStatus(null);
        }
      });
    } catch (err) {
      console.error('Upload queue error:', err);
      setUploadStatus('Queued offline');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  return (
    <>
      {/* Native Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Trigger Buttons Bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isCompressing}
          className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all touch-manipulation flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>{isCompressing ? 'Preparing...' : 'Take Photo'}</span>
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={isCompressing}
          className="min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 active:scale-95 transition-all touch-manipulation flex items-center gap-1.5"
          title="Upload from gallery"
        >
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Gallery</span>
        </button>
      </div>

      {/* Non-Blocking Floating Upload Status Pill */}
      {uploadStatus && (
        <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 text-white border border-indigo-500/40 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <Upload className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
          <span>{uploadStatus}</span>
          {pendingCount > 1 && (
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px]">
              {pendingCount}
            </span>
          )}
        </div>
      )}

      {/* Purpose-Anchored Confirmation Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="drawer-title"
            className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90dvh] safe-pb overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 id="drawer-title" className="text-sm font-bold text-white">Add to Memory Vault</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close upload drawer"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Purpose Anchor */}
            {purposeStatement && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs italic text-amber-200">
                "{purposeStatement}"
              </div>
            )}

            {/* Preview Thumbnail */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}

            {/* Emotional Intent Tags */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Intent Tag
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PURPOSE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedTag === tag
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection Caption */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Reflection or Caption (Optional)
              </label>
              <input
                type="text"
                maxLength={100}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Maya telling her graduation story..."
                className="w-full p-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs hover:bg-slate-800 border border-slate-800 min-h-[48px]"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 min-h-[48px]"
              >
                <Check className="w-4 h-4" />
                <span>Save to Vault</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
