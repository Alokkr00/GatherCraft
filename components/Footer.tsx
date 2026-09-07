'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Isolate immersive guest invite, live day-of HUD, and memory capsule views from desktop footer
  if (pathname && (pathname.startsWith('/invite') || pathname.includes('/live') || pathname.startsWith('/capsule'))) {
    return null;
  }

  return (
    <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-400 bg-slate-950/60 safe-pb">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 GatherCraft. Purpose-First Event Architecture.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            System Active
          </span>
        </div>
      </div>
    </footer>
  );
}
