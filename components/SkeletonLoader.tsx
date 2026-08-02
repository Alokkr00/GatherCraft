'use client';

import { PartyPopper } from 'lucide-react';

interface SkeletonLoaderProps {
  label?: string;
  type?: 'card' | 'page' | 'list';
}

export default function SkeletonLoader({ label = 'Loading gathering data...', type = 'page' }: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded-full w-1/3" />
        <div className="h-8 bg-slate-800 rounded-2xl w-2/3" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-800/60 rounded-full w-full" />
          <div className="h-3 bg-slate-800/60 rounded-full w-4/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-6 max-w-xl mx-auto text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-bounce">
        <PartyPopper className="w-8 h-8" />
      </div>

      <div className="space-y-2 w-full">
        <p className="text-sm font-bold text-white tracking-wide">{label}</p>
        <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="w-full space-y-3 pt-4">
        <div className="h-12 bg-slate-900/60 border border-slate-800/80 rounded-2xl w-full animate-pulse" />
        <div className="h-24 bg-slate-900/40 border border-slate-800/40 rounded-2xl w-full animate-pulse" />
      </div>
    </div>
  );
}
