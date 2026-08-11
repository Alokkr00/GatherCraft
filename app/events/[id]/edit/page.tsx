'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PartyPopper, Calendar, Clock, MapPin, DollarSign, Users, 
  ArrowLeft, CheckCircle2, Save, AlertCircle
} from 'lucide-react';
import { PartyEvent } from '@/lib/types';
import { getEventById, saveEvent } from '@/lib/storage';
import SkeletonLoader from '@/components/SkeletonLoader';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTimePicker from '@/components/CustomTimePicker';
import CustomSelect from '@/components/CustomSelect';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<PartyEvent | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [isTBD, setIsTBD] = useState(false);
  const [capacity, setCapacity] = useState(20);
  const [totalBudget, setTotalBudget] = useState(150);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const ev = getEventById(eventId);
    if (!ev) {
      router.push('/');
      return;
    }
    setEvent(ev);
    setTitle(ev.title);
    setDate(ev.date);
    setStartTime(ev.startTime);
    setEndTime(ev.endTime || '');
    setLocationName(ev.location?.name || '');
    setAddress(ev.location?.address || '');
    setLocationNotes(ev.location?.notes || '');
    setIsTBD(Boolean(ev.location?.isTBD));
    setCapacity(ev.capacity || 20);
    setTotalBudget(ev.totalBudget || 150);
    setCurrency(ev.currency || 'USD');
    setIsLoaded(true);
  }, [eventId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !title.trim()) return;

    const updatedEvent: PartyEvent = {
      ...event,
      title: title.trim(),
      date,
      startTime,
      endTime: endTime || '',
      location: {
        name: isTBD ? 'Location TBD' : locationName.trim(),
        address: isTBD ? '' : address.trim(),
        notes: locationNotes.trim() || undefined,
        isTBD,
      },
      capacity: Number(capacity) || 20,
      totalBudget: Number(totalBudget) || 0,
      currency,
      updatedAt: new Date().toISOString(),
    };

    saveEvent(updatedEvent);
    setIsSaved(true);
    setTimeout(() => {
      router.push(`/events/${eventId}`);
    }, 800);
  };

  if (!isLoaded || !event) {
    return <SkeletonLoader label="Loading Event Details..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Hub</span>
        </Link>
        <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
          Edit Event Details
        </span>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white">Edit Gathering Basics</h1>
          <p className="text-xs text-slate-400">Update event details, venue location, capacity, or budget goals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Gathering Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event Title"
              className="w-full p-3.5 rounded-xl glass-input text-sm font-semibold"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Event Date
              </label>
              <CustomDatePicker value={date} onChange={setDate} />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Start Time
              </label>
              <CustomTimePicker value={startTime} onChange={setStartTime} />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Hard End Time
              </label>
              <CustomTimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Location Details
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTBD}
                  onChange={(e) => setIsTBD(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Location TBD (Share later)</span>
              </label>
            </div>

            {!isTBD && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Venue Name (e.g. Host Residence / Terrace)"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full Address"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
                <input
                  type="text"
                  value={locationNotes}
                  onChange={(e) => setLocationNotes(e.target.value)}
                  placeholder="Location Notes (Parking, buzzer code)"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>
            )}
          </div>

          {/* Capacity & Budget Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Capacity Limit
              </label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 20)}
                className="w-full p-3 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Budget Target
              </label>
              <input
                type="number"
                min={0}
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseInt(e.target.value) || 0)}
                className="w-full p-3 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Currency
              </label>
              <CustomSelect
                value={currency}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'CAD', label: 'CAD ($)' },
                  { value: 'AUD', label: 'AUD ($)' },
                ]}
                onChange={setCurrency}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Link
              href={`/events/${eventId}`}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Saved! Redirecting...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
