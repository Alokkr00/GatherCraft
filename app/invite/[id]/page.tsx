'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PartyPopper, Calendar, Clock, MapPin, Target, CheckCircle2, 
  Users, Utensils, Heart, Plus, Sparkles, ArrowRight, ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { PartyEvent, Guest, RSVPStatus } from '@/lib/types';
import { getEventById, getGuests, updateGuestRSVP } from '@/lib/storage';
import SkeletonLoader from '@/components/SkeletonLoader';

function InviteContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const guestIdParam = searchParams.get('guestId');

  const [event, setEvent] = useState<PartyEvent | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // RSVP Form state
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('yes');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plusOnesActual, setPlusOnesActual] = useState(0);
  const [dietary, setDietary] = useState('');
  const [accessibility, setAccessibility] = useState('');

  useEffect(() => {
    loadInviteData();
  }, [eventId]);

  const loadInviteData = () => {
    const ev = getEventById(eventId);
    if (ev) {
      setEvent(ev);
    }
    if (guestIdParam) {
      const gsts = getGuests(eventId);
      const existing = gsts.find(g => g.id === guestIdParam);
      if (existing) {
        setGuest(existing);
        setName(existing.name);
        setEmail(existing.email || '');
        setPhone(existing.phone || '');
        setRsvpStatus(existing.rsvpStatus === 'pending' ? 'yes' : existing.rsvpStatus);
        setPlusOnesActual(existing.plusOnesActual || 0);
        setDietary(existing.dietary || '');
        setAccessibility(existing.accessibility || '');
      }
    }
    setIsLoaded(true);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedGuest = updateGuestRSVP(eventId, guest?.id || name.trim(), {
      rsvpStatus,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      plusOnesActual: Number(plusOnesActual) || 0,
      dietary: dietary.trim() || undefined,
      accessibility: accessibility.trim() || undefined
    });

    setGuest(updatedGuest);
    setHasSubmitted(true);

    if (rsvpStatus === 'yes') {
      try {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error('Confetti animation error:', err);
      }
    }
  };

  const generateGoogleCalendarUrl = (ev: PartyEvent) => {
    const startDate = new Date(`${ev.date}T${ev.startTime}:00`);
    const endDate = new Date(`${ev.date}T${ev.endTime}:00`);
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const dates = `${fmt(startDate)}/${fmt(endDate)}`;
    const details = ev.purpose?.selectedStatement ? `Purpose: ${ev.purpose.selectedStatement}` : 'GatherCraft Event';
    const loc = ev.location?.isTBD ? 'TBD' : `${ev.location?.name || ''} ${ev.location?.address || ''}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(loc)}`;
  };

  if (!isLoaded) {
    return <SkeletonLoader label="Loading invitation details..." />;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 p-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center space-y-4 border border-rose-500/30">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Event Not Found</h2>
          <p className="text-xs text-slate-300">
            This invitation link may have expired or been removed by the host.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500"
          >
            <span>Go to GatherCraft Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPublicPurpose = !event.purpose?.isPrivate;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-6 sm:py-12 px-4 animate-fade-in">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Header Invitation Card */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950">
          <div className="h-64 relative overflow-hidden bg-slate-900">
            <img
              src={event.coverAssetUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>You're Invited</span>
            </div>

            <div className="absolute bottom-4 left-6 right-6">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{event.title}</h1>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Event Time & Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <Calendar className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Date & Time</p>
                  <p className="text-sm font-bold text-white">{event.date}</p>
                  <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                    {event.startTime} - {event.endTime} ({event.timezone})
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Location</p>
                  {event.location?.isTBD ? (
                    <p className="text-sm font-bold text-amber-300">Location TBD (Host will update)</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-white">{event.location?.name || 'Host Residence'}</p>
                      <p className="text-xs text-slate-300">{event.location?.address}</p>
                      {event.location?.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">{event.location.notes}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Public Purpose Statement Box */}
            {isPublicPurpose && event.purpose?.selectedStatement && (
              <div className="space-y-2 bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/20">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Target className="w-3.5 h-3.5" />
                  <span>The Gathering Purpose</span>
                </div>
                <p className="text-sm text-slate-200 italic">
                  "{event.purpose.selectedStatement}"
                </p>
              </div>
            )}

            {/* Confirmation State Banner */}
            {hasSubmitted ? (
              <div className="space-y-4 pt-4 border-t border-slate-800 text-center animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">
                    {rsvpStatus === 'yes' ? "You're on the guest list!" : rsvpStatus === 'maybe' ? "RSVP set to Maybe" : "Response Recorded"}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {rsvpStatus === 'yes'
                      ? `We can't wait to see you on ${event.date} at ${event.startTime}.`
                      : "Thanks for letting the host know!"}
                  </p>
                </div>

                {rsvpStatus === 'yes' && (
                  <div className="pt-2 flex justify-center">
                    <a
                      href={generateGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Add to Google Calendar</span>
                    </a>
                  </div>
                )}

                <button
                  onClick={() => setHasSubmitted(false)}
                  className="text-xs text-slate-400 hover:text-white pt-2 underline block mx-auto"
                >
                  Update your RSVP response
                </button>
              </div>
            ) : (
              /* RSVP Form */
              <form onSubmit={handleRsvpSubmit} className="space-y-5 pt-4 border-t border-slate-800">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Will you be attending? *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { status: 'yes', label: 'Attending (Yes)', color: 'bg-emerald-600 text-white' },
                      { status: 'maybe', label: 'Maybe', color: 'bg-amber-600 text-white' },
                      { status: 'no', label: 'Can\'t Come', color: 'bg-rose-600 text-white' }
                    ].map((opt) => (
                      <button
                        key={opt.status}
                        type="button"
                        onClick={() => setRsvpStatus(opt.status as RSVPStatus)}
                        className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                          rsvpStatus === opt.status
                            ? `${opt.color} border-white/20 shadow-lg`
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Lee"
                      className="w-full p-3 rounded-xl glass-input text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jordan@example.com"
                        className="w-full p-3 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Plus-Ones</label>
                      <select
                        value={plusOnesActual}
                        onChange={(e) => setPlusOnesActual(parseInt(e.target.value) || 0)}
                        className="w-full p-3 rounded-xl glass-input text-xs"
                      >
                        <option value={0}>Just me (0 plus-ones)</option>
                        <option value={1}>Me + 1 Guest (+1)</option>
                        <option value={2}>Me + 2 Guests (+2)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Dietary Restrictions / Allergies</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="e.g. Vegetarian, Gluten-Free, Nut allergy..."
                      className="w-full p-3 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <PartyPopper className="w-5 h-5" />
                  <span>Submit RSVP</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Powered by <strong>GatherCraft</strong> — Purpose-First Party Planning
        </p>
      </div>
    </div>
  );
}

export default function PublicInvitePage() {
  return (
    <Suspense fallback={<div className="text-center p-12 text-slate-400">Loading Invitation...</div>}>
      <InviteContent />
    </Suspense>
  );
}
