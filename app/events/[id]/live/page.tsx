'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PartyPopper, Clock, Users, CheckCircle2, Circle, 
  MapPin, Sparkles, AlertCircle, ArrowLeft, ArrowRight, 
  Phone, UserCheck, ShieldCheck, Flag
} from 'lucide-react';
import { PartyEvent, Guest, TimelineItem } from '@/lib/types';
import { 
  getEventById, getGuests, getTimelineItems, 
  toggleGuestCheckIn, saveTimelineItem, closeEvent 
} from '@/lib/storage';
import { getActiveTimelineStep } from '@/lib/event-time';

import SkeletonLoader from '@/components/SkeletonLoader';
import ConfirmModal from '@/components/ConfirmModal';

export default function LiveModePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<PartyEvent | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [now, setNow] = useState(new Date());

  const [aiTip, setAiTip] = useState<string>('');
  const [aiTipLoading, setAiTipLoading] = useState<boolean>(false);

  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'yes');
  const checkedInGuests = guests.filter(g => Boolean(g.checkInAt));
  const totalHeadcount = confirmedGuests.reduce((acc, g) => acc + 1 + (g.plusOnesActual || 0), 0);
  const checkedInCount = checkedInGuests.reduce((acc, g) => acc + 1 + (g.plusOnesActual || 0), 0);

  const activeStep = timeline.find(t => !t.isCompleted);
  const completedSteps = timeline.filter(t => t.isCompleted).length;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const timelineStatus = event 
    ? getActiveTimelineStep(event.date, event.startTime, timeline, now)
    : { activeStep: null, nextStep: null, status: 'complete' as const, driftMinutes: 0, humanDrift: 'Loading...' };

  const currentDisplayStep = activeStep || timelineStatus.activeStep;
  const nextDisplayStep = timelineStatus.nextStep;

  useEffect(() => {
    loadLiveData();
  }, [eventId]);

  const fetchLiveCoaching = async (currentStep?: TimelineItem | null) => {
    if (!event) return;
    setAiTipLoading(true);
    try {
      const res = await fetch('/api/live-coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStepTitle: currentStep?.title || 'General Party Flow',
          offsetMinutes: currentStep?.offsetMinutes || 0,
          checkedInCount,
          totalGuests: totalHeadcount,
          purposeStatement: event.purpose?.selectedStatement,
          eventTitle: event.title
        })
      });
      const data = await res.json();
      if (data.tip) {
        setAiTip(data.tip);
      }
    } catch (err) {
      console.error('Fetch live coaching error:', err);
    } finally {
      setAiTipLoading(false);
    }
  };

  useEffect(() => {
    if (event) {
      fetchLiveCoaching(activeStep);
    }
  }, [event?.id, activeStep?.id]);

  const loadLiveData = () => {
    const ev = getEventById(eventId);
    if (!ev) {
      router.push('/');
      return;
    }
    setEvent(ev);
    setGuests(getGuests(eventId));
    setTimeline(getTimelineItems(eventId));
  };

  const handleCheckInToggle = (g: Guest) => {
    toggleGuestCheckIn(g);
    loadLiveData();
  };

  const handleStepComplete = (item: TimelineItem) => {
    saveTimelineItem({ ...item, isCompleted: true });
    loadLiveData();
  };

  const [showEndModal, setShowEndModal] = useState(false);

  const handleEndEvent = () => {
    setShowEndModal(true);
  };

  const confirmEndEvent = () => {
    closeEvent(eventId);
    setShowEndModal(false);
    router.push(`/events/${eventId}/aftermath`);
  };

  if (!event) return <SkeletonLoader label="Loading Live Mode Copilot..." />;

  const filteredGuests = guests.filter(g => g.name.toLowerCase().includes(guestSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6 max-w-3xl mx-auto animate-fade-in pb-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => router.push(`/events/${eventId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Live Mode</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
          <span>LIVE MODE ACTIVE</span>
        </div>

        <button
          onClick={handleEndEvent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Close Event</span>
        </button>
      </div>

      {/* Main Title Card */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white">{event.title}</h1>
        <p className="text-xs text-slate-400">
          {event.date} • {event.startTime} - {event.endTime} ({event.timezone})
        </p>
      </div>

      {/* Real-time Headcount Check-in Ticker */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/20 text-center space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Live Arrival Ticker
        </p>
        <p className="text-4xl sm:text-5xl font-black text-white">
          {checkedInCount} <span className="text-xl text-slate-400 font-normal">/ {totalHeadcount} Arrived</span>
        </p>
        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden max-w-md mx-auto">
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${totalHeadcount > 0 ? Math.min(100, (checkedInCount / totalHeadcount) * 100) : 0}%` }}
          />
        </div>

        {/* Dietary Summary Glance Bar */}
        {guests.some(g => g.dietary && g.dietary.trim() && g.dietary.toLowerCase() !== 'none') && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto">
            {Array.from(new Set(guests.map(g => g.dietary?.trim()).filter(Boolean))).map((diet, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⚠️ {diet}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Glanceable Heads-Up Display: NOW & NEXT */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Clock className="w-4 h-4" />
            <span>Run-of-Show HUD ({completedSteps}/{timeline.length})</span>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            timelineStatus.driftMinutes > 5
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            {timelineStatus.humanDrift}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NOW Card */}
          <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white">
                NOW ACTIVE
              </span>
              {currentDisplayStep && (
                <span className="text-[11px] font-mono text-indigo-300">
                  +{currentDisplayStep.offsetMinutes}m • {currentDisplayStep.durationMinutes}m duration
                </span>
              )}
            </div>

            {currentDisplayStep ? (
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-black text-white">{currentDisplayStep.title}</h3>
                {currentDisplayStep.description && (
                  <p className="text-xs text-slate-300 line-clamp-2">{currentDisplayStep.description}</p>
                )}
                {currentDisplayStep.assigneeName && (
                  <p className="text-[11px] text-violet-300 font-semibold">
                    Leader: {currentDisplayStep.assigneeName}
                  </p>
                )}
                <button
                  onClick={() => handleStepComplete(currentDisplayStep)}
                  className="mt-2 w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">All milestones concluded or scheduled time complete.</p>
            )}
          </div>

          {/* NEXT Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300">
                UPCOMING NEXT
              </span>
              {nextDisplayStep && (
                <span className="text-[11px] font-mono text-slate-400">
                  +{nextDisplayStep.offsetMinutes}m • {nextDisplayStep.durationMinutes}m
                </span>
              )}
            </div>

            {nextDisplayStep ? (
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-200">{nextDisplayStep.title}</h3>
                {nextDisplayStep.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{nextDisplayStep.description}</p>
                )}
                {nextDisplayStep.assigneeName && (
                  <p className="text-[11px] text-slate-400">Leader: {nextDisplayStep.assigneeName}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4">Final activity of the gathering.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Host Coaching Prompt */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Host Coaching Prompt</span>
          </div>
          <button
            onClick={() => fetchLiveCoaching(activeStep)}
            disabled={aiTipLoading}
            className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline disabled:opacity-50"
          >
            {aiTipLoading ? 'Coaching...' : 'Refresh Tip'}
          </button>
        </div>
        <p className="text-xs text-slate-200 italic">
          "{aiTip || (activeStep 
            ? `Keep energy high! Introduce new arrivals to guests who share similar interests before starting "${activeStep.title}".`
            : "Great hosting! Hand out leftovers, capture final selfies, and send guests off with warm gratitude.")}"
        </p>
      </div>

      {/* Quick Guest Check-in List */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Guest Arrival Check-in
          </h2>

          <input
            type="text"
            value={guestSearch}
            onChange={(e) => setGuestSearch(e.target.value)}
            placeholder="Search guest name..."
            className="p-2.5 rounded-xl glass-input text-xs w-full sm:w-48"
          />
        </div>

        <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto pr-1">
          {filteredGuests.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No guests found matching search.</p>
          ) : (
            filteredGuests.map((g) => {
              const isCheckedIn = Boolean(g.checkInAt);

              return (
                <div key={g.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className={`font-bold text-sm ${isCheckedIn ? 'text-emerald-300' : 'text-white'}`}>
                      {g.name} {g.plusOnesActual > 0 ? `(+${g.plusOnesActual})` : ''}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {g.role} • {g.rsvpStatus} {g.dietary ? `• ${g.dietary}` : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCheckInToggle(g)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isCheckedIn
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    {isCheckedIn ? '✓ Arrived' : 'Check In'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Venue & Emergency Quick Card */}
      {event.location && !event.location.isTBD && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
          <p className="font-bold text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-400" />
            Venue & Location Quick Reference
          </p>
          <p>{event.location.name || 'Host Residence'} — {event.location.address}</p>
          {event.location.notes && <p className="italic text-slate-400">Notes: {event.location.notes}</p>}
        </div>
      )}

      <ConfirmModal
        isOpen={showEndModal}
        title="End Gathering & Close Out"
        message="Are you ready to end the party and proceed to post-event closeout & thank-you notes?"
        confirmText="End Event & Close Out"
        variant="info"
        onConfirm={confirmEndEvent}
        onCancel={() => setShowEndModal(false)}
      />
    </div>
  );
}
