'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PartyPopper, Plus, Calendar, Users, Target, ArrowRight, 
  Sparkles, CheckCircle2, Copy, ExternalLink, Clock, MapPin, 
  Trash2, DollarSign, Bookmark
} from 'lucide-react';
import { PartyEvent, Guest } from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/templates';
import { getEvents, getGuests, deleteEvent, saveEvent } from '@/lib/storage';

export default function DashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<PartyEvent[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const evs = getEvents();
    const gsts = getGuests();
    setEvents(evs);
    setGuests(gsts);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
      loadData();
    }
  };

  const handleCopyInviteLink = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const link = `${window.location.origin}/invite/${eventId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(eventId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredEvents = events.filter(ev => {
    if (filterStatus === 'all') return true;
    return ev.status === filterStatus;
  });

  // Calculate global summary metrics
  const totalGuests = guests.length;
  const confirmedRSVPs = guests.filter(g => g.rsvpStatus === 'yes').length;
  const activeEventsCount = events.filter(e => e.status !== 'completed' && e.status !== 'archived').length;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900/80 to-purple-900/40 p-8 sm:p-10 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Purpose-First Gathering Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Craft events people actually <span className="gradient-text">want to attend.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Move from vague ideas to memorable gatherings. Define your disputable purpose, lock in basics, and manage 1-click guest RSVPs effortlessly.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Plan a New Event</span>
            </Link>

            <button
              onClick={() => {
                const el = document.getElementById('templates-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-all"
            >
              <Bookmark className="w-4.5 h-4.5 text-amber-400" />
              <span>Explore Templates</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Active Events</p>
            <p className="text-2xl font-bold text-white">{activeEventsCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Invited Guests</p>
            <p className="text-2xl font-bold text-indigo-400">{totalGuests}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Confirmed RSVPs</p>
            <p className="text-2xl font-bold text-emerald-400">{confirmedRSVPs}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Avg RSVP Rate</p>
            <p className="text-2xl font-bold text-purple-400">
              {totalGuests > 0 ? Math.round((confirmedRSVPs / totalGuests) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Starter Templates Carousel / Grid Section */}
      <div id="templates-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Starter Event Formats
            </h2>
            <p className="text-sm text-slate-400">Proven frameworks inspired by high-impact gathering guides.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STARTER_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => router.push(`/events/create?template=${tmpl.id}`)}
              className="group cursor-pointer glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-32 rounded-xl overflow-hidden relative">
                  <img
                    src={tmpl.coverImage}
                    alt={tmpl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/80 text-amber-300 border border-amber-500/30">
                    {tmpl.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {tmpl.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {tmpl.defaultDurationHours} hrs
                </span>
                <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  Use Template <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Host Events List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-400" />
              Your Planned Gatherings
            </h2>
            <p className="text-sm text-slate-400">Track RSVPs, manage guests, and access your event links.</p>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
            {['all', 'planning', 'confirmed', 'live', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
              <PartyPopper className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No gatherings found</h3>
            <p className="text-sm text-slate-400">
              {filterStatus === 'all'
                ? "You haven't created any events yet. Start with a purpose statement or choose a starter template above!"
                : `No events currently match the "${filterStatus}" status filter.`}
            </p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Event</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const eventGuests = guests.filter(g => g.eventId === ev.id);
              const confirmedCount = eventGuests.filter(g => g.rsvpStatus === 'yes').length;
              const pendingCount = eventGuests.filter(g => g.rsvpStatus === 'pending').length;
              const capacity = ev.capacity || 20;
              const rsvpPercentage = Math.min(100, Math.round((confirmedCount / capacity) * 100));

              return (
                <div
                  key={ev.id}
                  onClick={() => router.push(`/events/${ev.id}`)}
                  className="group cursor-pointer glass-card rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 overflow-hidden flex flex-col justify-between"
                >
                  {/* Cover Header */}
                  <div className="h-44 relative overflow-hidden bg-slate-900">
                    {ev.coverAssetUrl ? (
                      <img
                        src={ev.coverAssetUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                        <PartyPopper className="w-12 h-12 text-indigo-300/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border backdrop-blur-md ${
                        ev.status === 'confirmed' || ev.status === 'live'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}>
                        {ev.status}
                      </span>

                      <button
                        onClick={(e) => handleDelete(ev.id, e)}
                        title="Delete Event"
                        className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {ev.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {ev.startTime} - {ev.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    {/* Purpose Statement snippet */}
                    <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                        <Target className="w-3.5 h-3.5" />
                        <span>Purpose Statement</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 italic">
                        "{ev.purpose?.selectedStatement || ev.purpose?.rawInput || 'No purpose statement set'}"
                      </p>
                    </div>

                    {/* RSVP & Capacity Meter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          RSVPs: <strong className="text-white">{confirmedCount}</strong> / {capacity}
                        </span>
                        <span className="text-emerald-400 font-semibold">{rsvpPercentage}% Full</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${rsvpPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Action Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopyInviteLink(ev.id, e)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                      >
                        {copiedId === ev.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Invite Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Copy Invite Link</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/events/${ev.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
