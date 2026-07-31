import Link from 'next/link';
import { PartyPopper, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center space-y-4 border border-indigo-500/30">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
          <PartyPopper className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">404 — Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The page or invitation you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500"
        >
          <Home className="w-4 h-4" />
          <span>Back to Gathering Hub</span>
        </Link>
      </div>
    </div>
  );
}
