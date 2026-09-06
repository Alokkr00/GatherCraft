'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Calendar, Heart, ArrowRight, Share2, 
  Copy, Check, UserCheck, ShieldCheck, PartyPopper 
} from 'lucide-react';
import SkeletonLoader from '@/components/SkeletonLoader';

interface CapsuleData {
  id: string;
  capsuleToken: string;
  heroQuote?: string;
  summaryStory?: string;
  viewsCount: number;
  publishedAt?: string;
  event: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    timezone: string;
    purposeStatement?: string;
    coverAssetUrl?: string;
    guests: Array<{ id: string; name: string; role: string }>;
  };
}

interface MediaItem {
  id: string;
  cdnUrl: string;
  uploaderName: string;
  purposeTag?: string;
  caption?: string;
}

export default function MemoryCapsulePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [capsule, setCapsule] = useState<CapsuleData | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCapsule() {
      try {
        const res = await fetch(`/api/events/${token}/capsule`);
        if (res.ok) {
          const data = await res.json();
          setCapsule(data.capsule);

          // Also fetch event media
          if (data.capsule?.event?.id) {
            const mediaRes = await fetch(`/api/events/${data.capsule.event.id}/media`);
            if (mediaRes.ok) {
              const mediaData = await mediaRes.json();
              setMedia(mediaData.media || []);
            }
          }
        }
      } catch (err) {
        console.error('Error loading memory capsule:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCapsule();
  }, [token]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading) {
    return <SkeletonLoader label="Unsealing Memory Capsule..." />;
  }

  if (!capsule) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center space-y-4 border border-slate-800">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
          <h2 className="text-xl font-bold text-white">Memory Capsule Not Found</h2>
          <p className="text-xs text-slate-400">
            This gathering's retrospective has not yet been sealed or the link is invalid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500"
          >
            <span>Return to GatherCraft</span>
          </Link>
        </div>
      </div>
    );
  }

  const { event } = capsule;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* 1. Hero Memory Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
        <div className="h-64 sm:h-80 relative overflow-hidden">
          <img
            src={event.coverAssetUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1600&auto=format&fit=crop'}
            alt="Gathering Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Share Button Pill */}
          <div className="absolute top-4 right-4">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-slate-700/60 flex items-center gap-1.5 shadow-lg transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copied ? 'Link Copied!' : 'Share Capsule'}</span>
            </button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              <span>Memory Capsule</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">{event.title}</h1>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{event.date} • {event.startTime} - {event.endTime}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Pinned Purpose Verdict */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/25 via-slate-900 to-indigo-950/20 space-y-3 text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
          The Purpose Behind Tonight
        </p>
        <p className="text-lg sm:text-xl font-serif italic text-slate-100 font-medium max-w-xl mx-auto">
          "{capsule.heroQuote || event.purposeStatement || 'Gathering on purpose'}"
        </p>
        {capsule.summaryStory && (
          <p className="text-xs text-slate-300 max-w-lg mx-auto pt-2 border-t border-slate-800/80 leading-relaxed">
            {capsule.summaryStory}
          </p>
        )}
      </div>

      {/* 3. Photo Highlights from the Vault */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Moments From Tonight</h2>
            <p className="text-xs text-slate-400">Candid memories captured during the gathering.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {media.length} Photos
          </span>
        </div>

        {media.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl text-center text-slate-500 border border-slate-800">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-slate-400">The photo vault was quiet tonight</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square shadow-md"
              >
                <img
                  src={item.cdnUrl}
                  alt={item.caption || 'Memory'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-2 right-2 space-y-0.5">
                  {item.purposeTag && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 inline-block">
                      {item.purposeTag}
                    </span>
                  )}
                  {item.caption && (
                    <p className="text-[10px] text-white line-clamp-1">"{item.caption}"</p>
                  )}
                  <p className="text-[9px] text-slate-400">by {item.uploaderName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. The Gathered Circle */}
      {event.guests && event.guests.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>The Gathered Circle</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {event.guests.map((g) => (
              <span
                key={g.id}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium"
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. The Viral Growth Call to Action: "Remix This Blueprint" */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-950 border-2 border-indigo-500/40 shadow-2xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <PartyPopper className="w-4 h-4 text-amber-400" />
          <span>Host Your Own Gathering</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Inspired by this evening?
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            GatherCraft turns vague ideas into memorable evenings. You can clone the exact purpose template, run-of-show timing, and preparation checklists from this event in 60 seconds.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            href={`/events/create?remixFrom=${event.id}`}
            className="min-h-[48px] px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 shadow-xl shadow-rose-500/25 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 touch-manipulation"
          >
            <span>Remix This Gathering Blueprint</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
