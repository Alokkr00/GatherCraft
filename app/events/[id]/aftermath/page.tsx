'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PartyPopper, Sparkles, Heart, Copy, CheckCircle2, 
  ArrowLeft, Star, Bookmark, Share2, MessageSquare, Check
} from 'lucide-react';
import { PartyEvent, Guest, HostRetrospective } from '@/lib/types';
import { 
  getEventById, getGuests, closeEvent, 
  generateThankYouMessage, saveEvent 
} from '@/lib/storage';

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

  if (!event) return <div className="text-center py-12 text-slate-400">Loading Aftermath...</div>;

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

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Stage 8 — Aftermath & Closeout
        </span>
      </div>

      {/* Hero Completion Banner */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-indigo-500/30 text-center space-y-4 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-500/30">
          <PartyPopper className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white">Event Closed: {event.title}</h1>
          <p className="text-sm text-slate-300">
            Congratulations on hosting an intentional gathering! Send appreciation notes and reflect on your evening.
          </p>
        </div>
      </div>

      {/* AI Thank-You Note Generator */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Personalized Thank-You Generator
            </h2>
            <p className="text-xs text-slate-400">1-click copy personalized appreciation texts for your confirmed guests.</p>
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

      {/* Host Retrospective Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            Host Retrospective & Reflection
          </h2>
          <p className="text-xs text-slate-400">Record insights to make your next party even smoother.</p>
        </div>

        <form onSubmit={handleSaveRetro} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Overall Host Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl transition-all ${
                    star <= rating ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600 bg-slate-900'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              What worked really well?
            </label>
            <textarea
              rows={3}
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="e.g. Enforcing the 2-hour hard end time left guests wanting more! The icebreaker started strong..."
              className="w-full p-3 rounded-xl glass-input text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              What to improve next time?
            </label>
            <textarea
              rows={3}
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
              placeholder="e.g. Buy 1 more bag of ice next time; chill drinks 2 hours earlier..."
              className="w-full p-3 rounded-xl glass-input text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isRetroSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Retrospective Saved!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
            >
              Save Retrospective
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
