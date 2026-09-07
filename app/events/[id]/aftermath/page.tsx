'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PartyPopper, Sparkles, Heart, Copy, CheckCircle2, 
  ArrowLeft, Star, Bookmark, Share2, MessageSquare, Check,
  Camera, ExternalLink
} from 'lucide-react';
import { PartyEvent, Guest, HostRetrospective } from '@/lib/types';
import { 
  getEventById, getGuests, closeEvent, 
  generateThankYouMessage, saveEvent 
} from '@/lib/storage';

import SkeletonLoader from '@/components/SkeletonLoader';
import StreamlinedEventChat from '@/components/StreamlinedEventChat';
import EventMediaGallery from '@/components/EventMediaGallery';

export default function AftermathPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<PartyEvent | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedTone, setSelectedTone] = useState<'warm' | 'fun' | 'short'>('warm');
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  // Retrospective Form State
  const [rating, setRating] = useState(5);
  const [whatWorked, setWhatWorked] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [isRetroSaved, setIsRetroSaved] = useState(false);

  // Memory Capsule State
  const [capsule, setCapsule] = useState<any>(null);
  const [isPublishingCapsule, setIsPublishingCapsule] = useState(false);
  const [capsuleCopied, setCapsuleCopied] = useState(false);

  useEffect(() => {
    loadAftermathData();
  }, [eventId]);

  const loadAftermathData = () => {
    const ev = getEventById(eventId);
    if (!ev) {
      router.push('/');
      return;
    }
    setEvent(ev);
    setGuests(getGuests(eventId));

    if (ev.retrospective) {
      setRating(ev.retrospective.rating || 5);
      setWhatWorked(ev.retrospective.whatWorked || '');
      setWhatToImprove(ev.retrospective.whatToImprove || '');
      setIsRetroSaved(true);
    }

    // Load capsule status
    fetch(`/api/events/${eventId}/capsule`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.capsule) setCapsule(data.capsule);
      })
      .catch(() => {});
  };

  const handlePublishCapsule = async () => {
    setIsPublishingCapsule(true);
    try {
      const res = await fetch(`/api/events/${eventId}/capsule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroQuote: whatWorked || event?.purpose?.selectedStatement || 'Gathering on purpose',
          summaryStory: whatWorked || 'A night of genuine connection and shared presence.',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCapsule(data.capsule);
      }
    } catch (err) {
      console.error('Publish capsule error:', err);
    } finally {
      setIsPublishingCapsule(false);
    }
  };

  const handleCopyCapsuleLink = () => {
    if (!capsule) return;
    const fullUrl = `${window.location.origin}/capsule/${capsule.capsuleToken}`;
    navigator.clipboard.writeText(fullUrl);
    setCapsuleCopied(true);
    setTimeout(() => setCapsuleCopied(false), 2500);
  };

  const handleCopyThankYou = async (guest: Guest) => {
    if (!event) return;
    try {
      const res = await fetch('/api/generate-thank-you', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guest.name,
          role: guest.role,
          tone: selectedTone,
          eventTitle: event.title,
          purposeStatement: event.purpose?.selectedStatement,
          retrospectiveNotes: whatWorked
        })
      });
      const data = await res.json();
      const msg = data.message || generateThankYouMessage(event.title, guest.name, selectedTone);
      navigator.clipboard.writeText(msg);
      setCopiedGuestId(guest.id);
      setTimeout(() => setCopiedGuestId(null), 2500);
    } catch (err) {
      console.error('Copy thank-you error:', err);
      const fallback = generateThankYouMessage(event.title, guest.name, selectedTone);
      navigator.clipboard.writeText(fallback);
      setCopiedGuestId(guest.id);
      setTimeout(() => setCopiedGuestId(null), 2500);
    }
  };

  const handleSaveRetro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const retro: HostRetrospective = {
      rating,
      whatWorked,
      whatToImprove,
      completedAt: new Date().toISOString(),
      savedAsTemplate: false
    };

    closeEvent(eventId, retro);
    setIsRetroSaved(true);
    loadAftermathData();
  };

  if (!event) return <SkeletonLoader label="Loading post-event aftermath..." />;

  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'yes');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/events/${eventId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Hub</span>
        </button>

        <div className="purpose-badge">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Post-Event Recap & Gratitude</span>
        </div>
      </div>

      {/* Hero Completion Banner — warm amber ambient */}
      <div className="ambient-hero glass-panel p-8 sm:p-10 rounded-3xl border border-amber-500/25 text-center space-y-5 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-amber-500/25">
          <PartyPopper className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">The gathering has ended</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white">{event.title}</h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
            You hosted something meaningful. Take a breath, send your gratitude, and capture what made tonight matter.
          </p>
        </div>
      </div>

      {/* Purpose Fulfillment Reflection Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-950/25 via-slate-900 to-indigo-950/20 space-y-4">
        <div className="purpose-badge">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Did we fulfill our purpose?</span>
        </div>
        <p className="purpose-quote text-lg sm:text-2xl">
          "{event.purpose?.selectedStatement || event.purpose?.rawInput || 'Bringing people together'}"
        </p>
        {event.purpose?.successCriteria && event.purpose.successCriteria.length > 0 && (
          <div className="pt-2 space-y-2">
            <p className="text-xs font-semibold text-slate-400">Intended outcomes tonight:</p>
            <div className="flex flex-wrap gap-2">
              {event.purpose.successCriteria.map((crit, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-800 text-amber-200 border border-amber-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{crit}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post-Event Memory Capsule (Viral Growth Loop) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/25 via-slate-900 to-indigo-950/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Post-Event Memory Capsule</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Distill tonight's gathering into a beautiful storytelling capsule. Guests can relive memories and 1-click remix your blueprint to host their own.
            </p>
          </div>

          {capsule ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyCapsuleLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                {capsuleCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={`/capsule/${capsule.capsuleToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all"
              >
                <span>View Capsule</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <button
              onClick={handlePublishCapsule}
              disabled={isPublishingCapsule}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all disabled:opacity-50 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPublishingCapsule ? 'Generating Capsule...' : 'Publish Memory Capsule'}</span>
            </button>
          )}
        </div>

        {capsule && (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-200">Public Capsule Link Active</p>
              <p className="text-slate-500 font-mono text-[11px]">/capsule/{capsule.capsuleToken}</p>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-indigo-300 font-bold">{capsule.viewsCount || 0}</span> Views
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/20 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">{capsule.cloneCount || 0}</span> Blueprint Remixes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Captured Moments & Memory Vault */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Captured Moments & Vault</h2>
          </div>
          <span className="text-xs text-slate-400">Preserved with guest consent</span>
        </div>
        <EventMediaGallery eventId={eventId} />
      </div>

      {/* Personalized Gratitude & Thank-You Notes */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              Personalized Gratitude & Thank-You Notes
            </h2>
            <p className="text-xs text-slate-400">1-click copy heartfelt appreciation texts for your confirmed guests.</p>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { tone: 'warm', label: 'Warm & Heartfelt' },
              { tone: 'fun', label: 'High Energy & Fun' },
              { tone: 'short', label: 'Short & Sweet' }
            ].map((t) => (
              <button
                key={t.tone}
                onClick={() => setSelectedTone(t.tone as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTone === t.tone ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guests List with Generated Note Preview */}
        {confirmedGuests.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">No confirmed guests to send thank-you notes to.</p>
        ) : (
          <div className="space-y-3">
            {confirmedGuests.map((g) => {
              const previewMsg = generateThankYouMessage(event.title, g.name, selectedTone);

              return (
                <div key={g.id} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{g.name}</span>

                    <button
                      onClick={() => handleCopyThankYou(g)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 transition-colors"
                    >
                      {copiedGuestId === g.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Note</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    "{previewMsg}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 72-Hour Post-Event Gratitude Chat Stream */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">72-Hour Gratitude Chat</h2>
          </div>
          <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/15 px-2.5 py-1 rounded-full border border-indigo-500/30">
            Gratitude Mode Active
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Exchange final memories, laughs, and thank-yous. This thread automatically sunsets into a read-only memory archive after 72 hours.
        </p>
        <StreamlinedEventChat
          eventId={eventId}
          isHost={true}
          currentPhase="completed"
          currentUserName="Host"
          currentUserRole="host"
          purposeStatement={event.purpose?.selectedStatement || event.purpose?.rawInput}
        />
      </div>

      {/* Host Retrospective Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-rose-500/15 bg-gradient-to-br from-rose-950/10 via-slate-900 to-slate-950">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            Reflection & Retrospective
          </h2>
          <p className="text-xs text-slate-400 mt-1">Capture what made tonight matter—so you can recreate it.</p>
        </div>

        <form onSubmit={handleSaveRetro} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              How did tonight feel?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl transition-all hover:scale-110 ${
                    star <= rating ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30' : 'text-slate-600 bg-slate-900 border border-slate-800'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
              <span className="text-xs text-slate-400 ml-2">
                {rating === 5 ? 'Magical ✨' : rating === 4 ? 'Really good' : rating === 3 ? 'Decent' : rating === 2 ? 'Room to grow' : 'Tough night'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              What made tonight feel alive?
            </label>
            <textarea
              rows={3}
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="e.g. Enforcing the hard end time left guests wanting more. The icebreaker opened the room in 5 minutes..."
              className="w-full p-3 rounded-xl glass-input text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              What would you do differently?
            </label>
            <textarea
              rows={3}
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
              placeholder="e.g. Buy 1 more bag of ice next time; chill drinks 2 hours earlier. Arrive 30 min before guests..."
              className="w-full p-3 rounded-xl glass-input text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isRetroSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Reflection saved!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-md shadow-rose-600/20 transition-all"
            >
              Save Reflection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
