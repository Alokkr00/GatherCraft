'use client';

import Link from 'next/link';
import { Sparkles, Calendar, PlusCircle, PartyPopper } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <PartyPopper className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              GatherCraft <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">v0.3 Live</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium">Purpose-First Party Planner</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/events/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan Event</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
