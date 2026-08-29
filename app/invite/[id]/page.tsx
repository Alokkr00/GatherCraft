'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PartyPopper, Calendar, Clock, MapPin, Target, CheckCircle2, 
  Users, Utensils, Heart, Plus, Sparkles, ArrowRight, ShieldCheck,
  AlertCircle, Hourglass
} from 'lucide-react';
import { PartyEvent, Guest, RSVPStatus, PublicInviteView } from '@/lib/types';
import { getEventById, getGuests, updateGuestRSVP } from '@/lib/storage';
import { subscribeToEvent, saveGuestCloud } from '@/lib/db';
import SkeletonLoader from '@/components/SkeletonLoader';
import CustomSelect from '@/components/CustomSelect';

function InviteContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const guestIdParam = searchParams.get('guestId');

  const [event, setEvent] = useState<PublicInviteView | PartyEvent | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RSVP Form state
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('yes');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plusOnesActual, setPlusOnesActual] = useState(0);
  const [dietary, setDietary] = useState('');
  const [accessibility, setAccessibility] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadInvite() {
      // 1. Check local cache first for instant feedback if on creator's machine
      const localEv = getEventById(eventId);
      if (localEv && isMounted) {
        setEvent(localEv);
      }

      // 2. Fetch authoritative public invite from server API
      try {
        const res = await fetch(`/api/invite/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.invite && isMounted) {
            setEvent(data.invite);
          }
        }
      } catch (err) {
        console.warn('Could not fetch server invite:', err);
      }

      // 3. Real-time Firestore Cloud Subscription if configured
      const unsubscribe = subscribeToEvent(eventId, (cloudEv) => {
        if (cloudEv && isMounted) {
          setEvent(cloudEv);
        }
      });

      // 4. Pre-fill guest data if guestIdParam is provided
      if (guestIdParam) {
        const gsts = getGuests(eventId);
        const existing = gsts.find(g => g.id === guestIdParam);
        if (existing && isMounted) {
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

      if (isMounted) {
        setIsLoaded(true);
      }

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }

    loadInvite();

    return () => {
      isMounted = false;
    };
  }, [eventId, guestIdParam]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your name to RSVP.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Submit validated RSVP to Server API
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventIdOrToken: eventId,
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          rsvpStatus,
          plusOnesActual: Number(plusOnesActual) || 0,
          dietary: dietary.trim() || undefined,
          accessibility: accessibility.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      const savedGuest = data.guest || {
        id: guest?.id || `gst_${Date.now()}`,
        eventId: event?.id || eventId,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role: 'guest',
        rsvpStatus: data.waitlisted ? 'waitlist' : rsvpStatus,
        plusOnesAllowed: 1,
        plusOnesActual: Number(plusOnesActual) || 0,
        dietary: dietary.trim() || undefined,
        accessibility: accessibility.trim() || undefined,
        updatedAt: new Date().toISOString()
      };

      // 2. Update local storage & cloud
      updateGuestRSVP(event?.id || eventId, savedGuest.id, savedGuest);
      saveGuestCloud(savedGuest).catch(console.error);

      setGuest(savedGuest);
      setIsWaitlisted(Boolean(data.waitlisted));
      setHasSubmitted(true);

      if (rsvpStatus === 'yes' && !data.waitlisted) {
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
    } catch (err: any) {
      console.error('RSVP submission error:', err);
      setErrorMessage(err.message || 'Could not submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPartyEvent = (ev: PublicInviteView | PartyEvent): ev is PartyEvent => {
    return 'purpose' in ev && Boolean(ev.purpose);
  };

  const generateGoogleCalendarUrl = (ev: PublicInviteView | PartyEvent) => {
    try {
      const cleanStartTime = (ev.startTime || '19:00').split(' ')[0];
      const cleanEndTime = (ev.endTime || '21:00').split(' ')[0];

      let startDate = new Date(`${ev.date}T${cleanStartTime}:00`);
      let endDate = new Date(`${ev.date}T${cleanEndTime}:00`);

      if (isNaN(startDate.getTime())) startDate = new Date();
      if (isNaN(endDate.getTime()) || endDate <= startDate) {
        endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      }

      const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const dates = `${fmt(startDate)}/${fmt(endDate)}`;
      const purposeText = isPartyEvent(ev) ? ev.purpose?.selectedStatement : ev.publicPurpose;
      const details = purposeText ? `Purpose: ${purposeText}` : 'GatherCraft Event';
      
      const locName = isPartyEvent(ev) ? ev.location?.name : ev.locationName;
      const locAddr = isPartyEvent(ev) ? ev.location?.address : ev.address;
      const isTbd = isPartyEvent(ev) ? ev.location?.isTBD : ev.isTBD;
      const loc = isTbd ? 'Location to be announced' : `${locName || ''} ${locAddr || ''}`.trim();

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(loc)}`;
    } catch (err) {
      return 'https://calendar.google.com';
    }
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
          <h2 className="text-xl font-bold text-white">Invitation Not Found</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            We couldn't locate this invitation. Please check that you have the complete link from your host.
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

  const publicPurpose = isPartyEvent(event) 
    ? (event.purpose?.isPrivate ? undefined : event.purpose?.selectedStatement) 
    : event.publicPurpose;
  const locName = isPartyEvent(event) ? event.location?.name : event.locationName;
  const locAddr = isPartyEvent(event) ? event.location?.address : event.address;
  const isTbd = isPartyEvent(event) ? event.location?.isTBD : event.isTBD;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Event Header Banner */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="h-56 relative overflow-hidden bg-slate-900">
          <img
            src={event.coverAssetUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 backdrop-blur-md">
              <PartyPopper className="w-3.5 h-3.5" />
              You're Invited
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{event.title}</h1>
          </div>
        </div>

        {/* Purpose Statement (if public) */}
        {publicPurpose && (
          <div className="p-6 bg-slate-900/60 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <Target className="w-3.5 h-3.5" />
              <span>Why We're Gathering</span>
            </div>
            <p className="text-sm text-slate-200 font-medium italic bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-500/20">
              "{publicPurpose}"
            </p>
          </div>
        )}

        {/* Date, Time & Venue Specs */}
        <div className="p-6 space-y-3 border-t border-slate-800 bg-slate-950/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                <p className="text-xs font-bold text-white">{event.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Time</p>
                <p className="text-xs font-bold text-white">
                  {event.startTime} - {event.endTime}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
              <p className="text-xs font-bold text-white">
                {isTbd ? 'Location to be shared by host' : (locName || 'Venue to be announced')}
              </p>
              {!isTbd && locAddr && (
                <p className="text-[11px] text-slate-400 mt-0.5">{locAddr}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Interactive Area */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        {hasSubmitted ? (
          <div className="text-center space-y-4 py-4 animate-scale-in">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              isWaitlisted 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : rsvpStatus === 'yes' 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isWaitlisted ? (
                <Hourglass className="w-8 h-8" />
              ) : rsvpStatus === 'yes' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <PartyPopper className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">
                {isWaitlisted
                  ? "You're on the Waitlist!"
                  : rsvpStatus === 'yes' 
                    ? "You're on the Guest List!" 
                    : rsvpStatus === 'maybe' 
                      ? "RSVP Recorded (Maybe)" 
                      : "RSVP Recorded (Can't make it)"}
              </h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                {isWaitlisted
                  ? `Thanks ${name}! This gathering reached its capacity limit, so we've placed you on the priority waitlist.`
                  : rsvpStatus === 'yes'
                    ? `Awesome, ${name}! The host has been notified. We look forward to seeing you!`
                    : `Thanks for letting the host know, ${name}. Hope to see you at the next one!`}
              </p>
            </div>

            {rsvpStatus === 'yes' && !isWaitlisted && (
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

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setHasSubmitted(false)}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Change or update your RSVP
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRsvpSubmit} className="space-y-6">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-xl font-black text-white">Will you be attending?</h2>
              <p className="text-xs text-slate-400">1-click RSVP — no account needed.</p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* RSVP Status Selection Pills */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'yes', label: 'Attending', emoji: '🎉', activeClass: 'bg-emerald-600 text-white border-emerald-500' },
                { id: 'maybe', label: 'Maybe', emoji: '🤔', activeClass: 'bg-amber-600 text-white border-amber-500' },
                { id: 'no', label: 'Can’t Make It', emoji: '💌', activeClass: 'bg-slate-800 text-slate-200 border-slate-700' },
              ].map((pill) => {
                const isSelected = rsvpStatus === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setRsvpStatus(pill.id as RSVPStatus)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                      isSelected
                        ? `${pill.activeClass} shadow-lg scale-[1.02]`
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="text-base">{pill.emoji}</span>
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Guest Form Fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full p-3 rounded-xl glass-input text-xs"
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
                  <CustomSelect
                    value={String(plusOnesActual)}
                    options={[
                      { value: '0', label: 'Just me (0 plus-ones)' },
                      { value: '1', label: 'Me + 1 Guest (+1)' },
                      { value: '2', label: 'Me + 2 Guests (+2)' },
                    ]}
                    onChange={(val) => setPlusOnesActual(parseInt(val) || 0)}
                  />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Phone Number</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Accessibility / Mobility Needs</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={accessibility}
                    onChange={(e) => setAccessibility(e.target.value)}
                    placeholder="e.g. Wheelchair access, step-free..."
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <PartyPopper className="w-5 h-5" />
              <span>{isSubmitting ? 'Submitting RSVP...' : 'Submit RSVP'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PublicInvitePage() {
  return (
    <Suspense fallback={<SkeletonLoader label="Loading invitation..." />}>
      <InviteContent />
    </Suspense>
  );
}
