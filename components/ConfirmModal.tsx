'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const prevActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    prevActiveElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Auto-focus the cancel button or first action button
    const initialBtn = modalRef.current?.querySelector<HTMLButtonElement>('button:not([aria-label="Close confirmation dialog"])');
    initialBtn?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      prevActiveElement.current?.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const btnBg = variant === 'danger' 
    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30';

  const iconColor = variant === 'danger' ? 'text-rose-400' : 'text-amber-400';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl relative"
      >
        <button
          onClick={onCancel}
          aria-label="Close confirmation dialog"
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 ${iconColor}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="confirm-modal-title" className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={onCancel}
            className="px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 min-h-[40px] rounded-xl text-xs font-bold text-white shadow-md transition-all ${btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
