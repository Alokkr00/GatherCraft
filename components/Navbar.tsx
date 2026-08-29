'use client';

import Link from 'next/link';
import { Sparkles, Calendar, PlusCircle, PartyPopper, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth, signInWithGoogle, signOutUser } from '@/lib/auth';

export default function Navbar() {
  const { user, loading, isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <PartyPopper className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              GatherCraft
            </span>
            <p className="text-[10px] text-slate-400 font-medium">Purpose-First Party Planner</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/events/create"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan Gathering</span>
          </Link>

          {/* Auth State Button */}
          {isConfigured && (
            <div className="ml-1 pl-2 border-l border-slate-800">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0] || 'Host'}</span>
                  </div>
                  <button
                    onClick={() => signOutUser()}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Host Sign In</span>
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
