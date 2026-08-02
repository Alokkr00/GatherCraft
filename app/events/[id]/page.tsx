'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PartyPopper, Calendar, Clock, MapPin, Users, Target, 
  Share2, Copy, CheckCircle2, Plus, Upload, Trash2, Edit2, 
  ExternalLink, Mail, MessageSquare, AlertTriangle, ShieldCheck, 
  DollarSign, ArrowLeft, Utensils, Sparkles, Filter, Check,
  CheckSquare, ShoppingCart, Layers
} from 'lucide-react';
import { PartyEvent, Guest, DietarySummary, RSVPStatus, GuestRole } from '@/lib/types';
import { 
  getEventById, saveEvent, getGuests, saveGuest, 
  saveGuestsBulk, deleteGuest, calculateDietarySummary 
} from '@/lib/storage';
import { subscribeToGuests, subscribeToEvent } from '@/lib/db';

import SkeletonLoader from '@/components/SkeletonLoader';
import ConfirmModal from '@/components/ConfirmModal';

// v0.2 Components
import TimelineEditor from '@/components/TimelineEditor';
import TaskManager from '@/components/TaskManager';
import BudgetTracker from '@/components/BudgetTracker';
import ShoppingList from '@/components/ShoppingList';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<PartyEvent | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoHost, setCopiedCoHost] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'tasks' | 'budget' | 'shopping'>('overview');
  const [rsvpFilter, setRsvpFilter] = useState<'all' | RSVPStatus>('all');

  // Modal States
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvRawText, setCsvRawText] = useState('');
  const [deleteGuestId, setDeleteGuestId] = useState<string | null>(null);

  // New Guest Form
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestRole, setGuestRole] = useState<GuestRole>('guest');
  const [plusOnesAllowed, setPlusOnesAllowed] = useState(0);

  useEffect(() => {
    loadEventData();

    // Attach real-time cloud Firestore listeners
    const unsubGuests = subscribeToGuests(eventId, (realtimeGuests) => {
      if (realtimeGuests.length > 0) {
        setGuests(realtimeGuests);
      }
    });

    const unsubEvent = subscribeToEvent(eventId, (realtimeEvent) => {
      if (realtimeEvent) {
        setEvent(realtimeEvent);
      }
    });

    return () => {
      unsubGuests?.();
      unsubEvent?.();
    };
  }, [eventId]);

  const loadEventData = () => {
    const ev = getEventById(eventId);
    if (!ev) {
      router.push('/');
      return;
    }
    setEvent(ev);
    const gsts = getGuests(eventId);
    setGuests(gsts);
  };

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/invite/${eventId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCoHostLink = () => {
    const link = `${window.location.origin}/events/${eventId}?cohost=true`;
    navigator.clipboard.writeText(link);
    setCopiedCoHost(true);
    setTimeout(() => setCopiedCoHost(false), 2500);
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newGuest: Guest = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      eventId,
      name: guestName.trim(),
      email: guestEmail.trim() || undefined,
      phone: guestPhone.trim() || undefined,
      role: guestRole,
      rsvpStatus: 'pending',
      plusOnesAllowed: Number(plusOnesAllowed) || 0,
      plusOnesActual: 0,
      updatedAt: new Date().toISOString()
    };

    saveGuest(newGuest);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setShowAddGuest(false);
    loadEventData();
  };

  const handleCsvImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvRawText.trim()) return;

    const lines = csvRawText.split('\n');
    const parsedGuests: Guest[] = [];

    lines.forEach((line) => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 1 && parts[0]) {
        parsedGuests.push({
          id: 'guest_' + Math.random().toString(36).substring(2, 9),
          eventId,
          name: parts[0],
          email: parts[1] || undefined,
          phone: parts[2] || undefined,
          role: (parts[3] as GuestRole) || 'guest',
          rsvpStatus: 'pending',
          plusOnesAllowed: 0,
          plusOnesActual: 0,
          updatedAt: new Date().toISOString()
        });
      }
    });

    if (parsedGuests.length > 0) {
      saveGuestsBulk(parsedGuests);
      setCsvRawText('');
      setShowCsvImport(false);
      loadEventData();
    }
  };

  const confirmDeleteGuest = () => {
    if (deleteGuestId) {
      deleteGuest(deleteGuestId);
      setDeleteGuestId(null);
      loadEventData();
    }
  };

  const handleDeleteGuest = (id: string) => {
    setDeleteGuestId(id);
  };

  const handleToggleRSVP = (guest: Guest, newStatus: RSVPStatus) => {
    saveGuest({
      ...guest,
      rsvpStatus: newStatus,
      updatedAt: new Date().toISOString()
    });
    loadEventData();
  };

  if (!event) return <SkeletonLoader label="Loading gathering workspace..." />;

  // Metrics
  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'yes');
  const confirmedCount = confirmedGuests.reduce((acc, g) => acc + 1 + (g.plusOnesActual || 0), 0);
  const pendingCount = guests.filter(g => g.rsvpStatus === 'pending').length;
  const maybeCount = guests.filter(g => g.rsvpStatus === 'maybe').length;
  const declinedCount = guests.filter(g => g.rsvpStatus === 'no').length;

  const capacity = event.capacity || 20;
  const rsvpPercentage = Math.min(100, Math.round((confirmedCount / capacity) * 100));

  const filteredGuests = guests.filter(g => {
    if (rsvpFilter === 'all') return true;
    return g.rsvpStatus === rsvpFilter;
  });

  const dietarySummary: DietarySummary = calculateDietarySummary(guests);

  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/invite/${eventId}` : '';
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(`You're invited to ${event.title}! RSVP here: ${inviteUrl}`)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(`You're invited: ${event.title}`)}&body=${encodeURIComponent(`Hi,\n\nI'd love for you to join us for ${event.title}!\n\nDate: ${event.date}\nTime: ${event.startTime}\n\nPlease RSVP here: ${inviteUrl}\n\nHope to see you there!`)}`;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Status: {event.status}
          </span>

          <Link
            href={`/events/${eventId}/live`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 shadow-md shadow-rose-500/20 transition-all animate-pulse"
          >
            <PartyPopper className="w-3.5 h-3.5" />
            <span>Enter Live Mode</span>
          </Link>

          <Link
            href={`/events/${eventId}/aftermath`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Aftermath & Close</span>
          </Link>

          <button
            onClick={handleCopyCoHostLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>{copiedCoHost ? 'Co-host Link Copied!' : 'Invite Co-host'}</span>
          </button>

          <Link
            href={`/invite/${eventId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/25"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Guest Page Preview</span>
          </Link>
        </div>
      </div>

      {/* Main Event Header Banner */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl">
        <div className="h-56 relative overflow-hidden bg-slate-900">
          <img
            src={event.coverAssetUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {event.date}
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <Clock className="w-4 h-4 text-indigo-400" />
                {event.startTime} - {event.endTime} ({event.timezone})
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {event.location.isTBD ? 'Location TBD' : (event.location.name || event.location.address)}
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Budget: ${event.totalBudget} {event.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Purpose Statement Highlight Banner */}
        <div className="p-6 sm:p-8 bg-slate-900/60 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Target className="w-4 h-4" />
            <span>Event Purpose Statement ({event.purpose?.isPrivate ? 'Private' : 'Public'})</span>
          </div>

          <p className="text-base sm:text-lg text-slate-100 font-medium italic bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/20">
            "{event.purpose?.selectedStatement || event.purpose?.rawInput || 'No purpose statement specified'}"
          </p>

          {event.purpose?.successCriteria && event.purpose.successCriteria.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-slate-400">Success Criteria:</p>
              <div className="flex flex-wrap gap-2">
                {event.purpose.successCriteria.map((crit, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {crit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabbed Navigation Bar */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 overflow-x-auto shadow-xl">
        {[
          { id: 'overview', label: 'Overview & Guests', icon: Users },
          { id: 'timeline', label: 'Run-of-Show Timeline', icon: Clock },
          { id: 'tasks', label: 'Tasks & Logistics', icon: CheckSquare },
          { id: 'budget', label: 'Budget Tracker', icon: DollarSign },
          { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW & GUESTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Shareable Invite Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-400" />
                  Shareable Guest Invitation Link
                </h2>
                <p className="text-xs text-slate-400">Guests can RSVP with 1 click without creating an account.</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={waShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={emailShareUrl}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-colors"
                >
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 p-3 rounded-xl glass-input text-xs font-mono text-slate-300 select-all"
              />
              <button
                onClick={handleCopyInvite}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guest Graph & RSVP Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Guest List ({guests.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    {confirmedCount} Confirmed Headcount / {capacity} Capacity Limit
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCsvImport(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Import CSV</span>
                  </button>

                  <button
                    onClick={() => setShowAddGuest(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Guest</span>
                  </button>
                </div>
              </div>

              {/* RSVP Status Filter Tabs */}
              <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
                {[
                  { id: 'all', label: `All (${guests.length})` },
                  { id: 'yes', label: `Confirmed (${guests.filter(g => g.rsvpStatus === 'yes').length})` },
                  { id: 'maybe', label: `Maybe (${maybeCount})` },
                  { id: 'pending', label: `Pending (${pendingCount})` },
                  { id: 'no', label: `Declined (${declinedCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRsvpFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      rsvpFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Guest List Table */}
              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
                {filteredGuests.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No guests found matching this status filter.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {filteredGuests.map((g) => (
                      <div key={g.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{g.name}</span>
                            {g.plusOnesActual > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                +{g.plusOnesActual} Guest
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-slate-800 text-slate-400">
                              {g.role}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            {g.email && <span>{g.email}</span>}
                            {g.phone && <span>{g.phone}</span>}
                            {g.dietary && (
                              <span className="text-amber-400 font-medium">Dietary: {g.dietary}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={g.rsvpStatus}
                            onChange={(e) => handleToggleRSVP(g, e.target.value as RSVPStatus)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                              g.rsvpStatus === 'yes'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : g.rsvpStatus === 'no'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : g.rsvpStatus === 'maybe'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <option value="yes">Attending (Yes)</option>
                            <option value="maybe">Maybe</option>
                            <option value="pending">Pending</option>
                            <option value="no">Declined (No)</option>
                          </select>

                          <button
                            onClick={() => handleDeleteGuest(g.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove guest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Dietary & Capacity */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  RSVP Capacity Meter
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Headcount vs Capacity:</span>
                    <span className="text-emerald-400">{confirmedCount} / {capacity}</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${rsvpPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Confirmed:</span> <strong className="text-emerald-400">{confirmedCount}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Pending:</span> <strong className="text-indigo-400">{pendingCount}</strong>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl space-y-4 border border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-slate-900">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <Utensils className="w-5 h-5" />
                  <h3>Dietary Summary</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Auto-aggregated for menu & catering planning ({dietarySummary.total} total guests).
                </p>

                <div className="space-y-2 text-xs">
                  {dietarySummary.vegetarian > 0 && (
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-300">Vegetarian:</span>
                      <span className="font-bold text-amber-300">{dietarySummary.vegetarian}</span>
                    </div>
                  )}
                  {dietarySummary.vegan > 0 && (
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-300">Vegan:</span>
                      <span className="font-bold text-emerald-300">{dietarySummary.vegan}</span>
                    </div>
                  )}
                  {dietarySummary.glutenFree > 0 && (
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-300">Gluten-Free:</span>
                      <span className="font-bold text-indigo-300">{dietarySummary.glutenFree}</span>
                    </div>
                  )}
                  {dietarySummary.nutAllergy > 0 && (
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-300">Nut Allergy:</span>
                      <span className="font-bold text-rose-300">{dietarySummary.nutAllergy}</span>
                    </div>
                  )}
                  {dietarySummary.dairyFree > 0 && (
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-300">Dairy-Free:</span>
                      <span className="font-bold text-purple-300">{dietarySummary.dairyFree}</span>
                    </div>
                  )}

                  {dietarySummary.customList.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-2">
                      No dietary restrictions specified by confirmed guests yet.
                    </p>
                  )}

                  {dietarySummary.customList.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-400">Specific Guest Notes:</p>
                      {dietarySummary.customList.map((item, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-900 text-[11px] text-slate-300">
                          <strong>{item.guestName}:</strong> {item.note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TIMELINE */}
      {activeTab === 'timeline' && (
        <TimelineEditor eventId={eventId} startTime={event.startTime} />
      )}

      {/* TAB CONTENT 3: TASKS */}
      {activeTab === 'tasks' && (
        <TaskManager eventId={eventId} eventTitle={event.title} />
      )}

      {/* TAB CONTENT 4: BUDGET */}
      {activeTab === 'budget' && (
        <BudgetTracker eventId={eventId} totalBudgetLimit={event.totalBudget || 200} currency={event.currency} />
      )}

      {/* TAB CONTENT 5: SHOPPING */}
      {activeTab === 'shopping' && (
        <ShoppingList eventId={eventId} confirmedHeadcount={confirmedCount} />
      )}

      {/* Add Single Guest Modal */}
      {showAddGuest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-4 border border-indigo-500/30">
            <h3 className="text-lg font-bold text-white">Add New Guest</h3>

            <form onSubmit={handleAddGuest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+1 415 555 0192"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={guestRole}
                    onChange={(e) => setGuestRole(e.target.value as GuestRole)}
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  >
                    <option value="guest">Guest</option>
                    <option value="co-host">Co-host</option>
                    <option value="helper">Helper</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plus-Ones Allowed</label>
                  <input
                    type="number"
                    min={0}
                    value={plusOnesAllowed}
                    onChange={(e) => setPlusOnesAllowed(parseInt(e.target.value) || 0)}
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddGuest(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showCsvImport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl space-y-4 border border-indigo-500/30">
            <h3 className="text-lg font-bold text-white">Bulk Import Guests via CSV</h3>
            <p className="text-xs text-slate-400">
              Paste one guest per line in format: <code className="text-indigo-300 font-mono">Name, Email, Phone, Role</code>
            </p>

            <textarea
              rows={6}
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              placeholder="Alex Rivera, alex@example.com, +1 415-555-0192, guest&#10;Sarah Chen, sarah@example.com, , vip"
              className="w-full p-3 rounded-xl glass-input text-xs font-mono resize-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCsvImport(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvImportSubmit}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
              >
                Import Guests
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteGuestId)}
        title="Remove Guest"
        message="Are you sure you want to remove this guest from your guest list?"
        confirmText="Remove Guest"
        variant="danger"
        onConfirm={confirmDeleteGuest}
        onCancel={() => setDeleteGuestId(null)}
      />
    </div>
  );
}
