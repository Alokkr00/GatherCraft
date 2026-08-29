'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, Target, Calendar, Clock, MapPin, DollarSign, 
  Users, CheckCircle2, ArrowRight, ArrowLeft, Lock, Globe,
  PartyPopper, Wand2, Shield, AlertCircle
} from 'lucide-react';
import { STARTER_TEMPLATES } from '@/lib/templates';
import { PartyEvent, StarterTemplate } from '@/lib/types';
import { saveEvent, saveEventAsync } from '@/lib/storage';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTimePicker from '@/components/CustomTimePicker';

function EventCreateWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');

  const [step, setStep] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<StarterTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [rawPurpose, setRawPurpose] = useState('');
  const [selectedStatement, setSelectedStatement] = useState('');
  const [suggestions, setSuggestions] = useState<{ warm: string; bold: string; minimal: string }>({
    warm: '',
    bold: '',
    minimal: ''
  });
  const [successCriteria, setSuccessCriteria] = useState<string[]>([]);
  const [isPurposePrivate, setIsPurposePrivate] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Basics State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:00');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [isTBD, setIsTBD] = useState(false);
  const [capacity, setCapacity] = useState<number>(15);
  const [totalBudget, setTotalBudget] = useState<number>(200);
  const [currency, setCurrency] = useState('USD');

  // Preload template if passed via URL
  useEffect(() => {
    if (templateParam) {
      const tmpl = STARTER_TEMPLATES.find(t => t.id === templateParam);
      if (tmpl) {
        applyTemplate(tmpl);
      }
    }
  }, [templateParam]);

  const applyTemplate = (tmpl: StarterTemplate) => {
    setSelectedTemplate(tmpl);
    setTitle(tmpl.title);
    setRawPurpose(tmpl.defaultPurpose);
    setSelectedStatement(tmpl.defaultPurpose);
    setCapacity(tmpl.suggestedCapacity);
    setTotalBudget(tmpl.suggestedBudget);
    setSuccessCriteria(tmpl.defaultSuccessCriteria);
  };

  const handleRefinePurpose = async () => {
    if (!rawPurpose.trim()) {
      setAiError('Please enter a short idea for your party purpose first.');
      return;
    }
    setIsAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/refine-purpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPurpose,
          title,
          category: selectedTemplate?.category || 'General'
        })
      });

      if (!res.ok) throw new Error('Failed to refine purpose');
      const data = await res.json();

      setSuggestions(data.suggestions);
      setSuccessCriteria(data.successCriteria || []);
      // default to warm statement
      if (data.suggestions.warm) {
        setSelectedStatement(data.suggestions.warm);
      }
    } catch (err: any) {
      console.error(err);
      setAiError('Unable to refine via AI right now. You can still write your own purpose statement below.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddCriterion = () => {
    setSuccessCriteria([...successCriteria, '']);
  };

  const handleCriterionChange = (index: number, val: string) => {
    const updated = [...successCriteria];
    updated[index] = val;
    setSuccessCriteria(updated);
  };

  const handleRemoveCriterion = (index: number) => {
    setSuccessCriteria(successCriteria.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      const newEvent = await saveEventAsync({
        title: title.trim() || (selectedTemplate ? selectedTemplate.title : 'My Gathering'),
        ownerId: 'current-host',
        templateId: selectedTemplate?.id,
        status: 'planning',
        purpose: {
          rawInput: rawPurpose,
          selectedStatement: selectedStatement || rawPurpose,
          suggestions,
          successCriteria: successCriteria.filter(c => c.trim().length > 0),
          isPrivate: isPurposePrivate
        },
        date,
        startTime,
        endTime,
        timezone,
        location: {
          name: locationName,
          address,
          notes: locationNotes,
          isTBD
        },
        capacity: Number(capacity) || 15,
        totalBudget: Number(totalBudget) || 150,
        currency,
        coverAssetUrl: selectedTemplate?.coverImage || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
        themeColor: selectedTemplate?.themeColor || 'from-indigo-600 to-violet-600',
      });

      router.push(`/events/${newEvent.id}`);
    } catch (err) {
      console.error('Failed to create event:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Wizard Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.push('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <span className="text-xs font-bold tracking-wider uppercase text-indigo-400">
            Step {step} of 3 — {step === 1 ? 'Template & Vibe' : step === 2 ? 'Purpose Engine' : 'Basics Lock-in'}
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Template Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h1 className="text-3xl font-black text-white tracking-tight">Choose your event blueprint</h1>
            <p className="text-sm text-slate-400">
              Start with a structured gathering format or create a custom event blueprint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => applyTemplate(tmpl)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all space-y-3 relative ${
                  selectedTemplate?.id === tmpl.id
                    ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl'
                    : 'glass-card border-slate-800 hover:border-slate-700'
                }`}
              >
                {selectedTemplate?.id === tmpl.id && (
                  <span className="absolute top-3 right-3 p-1 rounded-full bg-indigo-500 text-white">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}

                <div className="h-28 rounded-xl overflow-hidden relative">
                  <img src={tmpl.coverImage} alt={tmpl.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-amber-300 border border-amber-500/30">
                    {tmpl.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-white">{tmpl.title}</h3>
                  <p className="text-xs text-slate-300 mt-1">{tmpl.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Capacity: ~{tmpl.suggestedCapacity} guests</span>
                  <span>Duration: {tmpl.defaultDurationHours} hours</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <span>Next: Purpose Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Purpose Engine */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Target className="w-3.5 h-3.5" />
              <span>Step 2 — The Purpose Engine</span>
            </div>
            <h1 className="text-3xl font-black text-white">Define your gathering's purpose</h1>
            <p className="text-sm text-slate-400">
              A great party starts with a clear, specific, and purpose-driven vision statement.
            </p>
          </div>

          {/* Raw Input + AI Refinement Button */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <label className="block text-sm font-semibold text-slate-200">
              1. What is the raw idea or intention behind this party?
            </label>
            <textarea
              rows={3}
              value={rawPurpose}
              onChange={(e) => setRawPurpose(e.target.value)}
              placeholder="e.g. Want to bring friends together for cocktails and introduce people who work in creative fields..."
              className="w-full p-4 rounded-xl glass-input text-sm resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Tip: The AI will turn your idea into 3 disputable purpose versions.
              </span>
              <button
                type="button"
                onClick={handleRefinePurpose}
                disabled={isAiLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Wand2 className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>{isAiLoading ? 'Refining with Gemini AI...' : 'Refine with Gemini AI'}</span>
              </button>
            </div>

            {aiError && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {/* AI Suggestions Selection Cards */}
          {(suggestions.warm || suggestions.bold || suggestions.minimal) && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-200">
                2. Select an AI-Refined Purpose Statement:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { key: 'warm', label: 'Warm & Welcoming', text: suggestions.warm, color: 'border-indigo-500/50' },
                  { key: 'bold', label: 'Bold & High-Impact', text: suggestions.bold, color: 'border-amber-500/50' },
                  { key: 'minimal', label: 'Clean & Minimalist', text: suggestions.minimal, color: 'border-emerald-500/50' }
                ].map((sug) => (
                  <div
                    key={sug.key}
                    onClick={() => setSelectedStatement(sug.text)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all space-y-2 ${
                      selectedStatement === sug.text
                        ? 'bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/40'
                        : 'glass-card border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
                      {sug.label}
                    </span>
                    <p className="text-xs text-slate-200 italic">"{sug.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Statement Editing Box */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <label className="block text-sm font-semibold text-slate-200">
              3. Final Selected Purpose Statement (Editable)
            </label>
            <input
              type="text"
              value={selectedStatement}
              onChange={(e) => setSelectedStatement(e.target.value)}
              placeholder="Your refined purpose statement..."
              className="w-full p-4 rounded-xl glass-input text-sm font-medium text-white"
            />

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {isPurposePrivate ? (
                  <Lock className="w-4 h-4 text-amber-400" />
                ) : (
                  <Globe className="w-4 h-4 text-emerald-400" />
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {isPurposePrivate ? 'Private Purpose (Host & Co-hosts Only)' : 'Public Purpose (Visible to Guests on Invite)'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isPurposePrivate ? 'Keep your guiding purpose hidden from guests' : 'Guests can read your intention when RSVPing'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPurposePrivate(!isPurposePrivate)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isPurposePrivate
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isPurposePrivate ? 'Make Public' : 'Make Private'}
              </button>
            </div>
          </div>

          {/* Success Criteria List */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-200">
                  4. Gathering Success Criteria (What does good look like?)
                </label>
                <p className="text-xs text-slate-400">Add 1 to 3 measurable goals for your night.</p>
              </div>

              <button
                type="button"
                onClick={handleAddCriterion}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                + Add Criterion
              </button>
            </div>

            <div className="space-y-2">
              {successCriteria.map((crit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={crit}
                    onChange={(e) => handleCriterionChange(idx, e.target.value)}
                    placeholder={`e.g. Guests meet at least 3 people they did not know before...`}
                    className="flex-1 p-2.5 rounded-xl glass-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(idx)}
                    className="text-slate-500 hover:text-rose-400 px-2 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Back to Templates
            </button>

            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <span>Next: Basics Lock-in</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Event Core (Basics Lock-in) */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>Step 3 — Basics Lock-in</span>
            </div>
            <h1 className="text-3xl font-black text-white">Set date, location & budget</h1>
            <p className="text-sm text-slate-400">
              Hard end times and clear location details reduce host stress and improve attendance.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Event Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Friday Sunset Cocktails & Bites"
                className="w-full p-3.5 rounded-xl glass-input text-base font-semibold"
              />
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Event Date
                </label>
                <CustomDatePicker
                  value={date}
                  onChange={(val) => setDate(val)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Start Time
                </label>
                <CustomTimePicker
                  value={startTime}
                  onChange={(val) => setStartTime(val)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Hard End Time</span>
                  <span className="text-[10px] text-amber-400 font-normal">Encouraged</span>
                </label>
                <CustomTimePicker
                  value={endTime}
                  onChange={(val) => setEndTime(val)}
                />
              </div>
            </div>
            {startTime && endTime && startTime >= endTime && (
              <p className="text-xs text-rose-400 font-semibold pt-1">
                ⚠️ Note: End time should be after start time.
              </p>
            )}

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
                    placeholder="Full Address (e.g. 742 Evergreen Terrace, San Francisco)"
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  />

                  <input
                    type="text"
                    value={locationNotes}
                    onChange={(e) => setLocationNotes(e.target.value)}
                    placeholder="Location Notes (Parking, entrance instructions, buzzer code)"
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  />
                </div>
              )}
            </div>

            {/* Capacity & Budget Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Capacity Soft Limit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setCapacity(isNaN(v) ? 15 : v);
                    }}
                    className="w-full p-3 pl-9 rounded-xl glass-input text-xs font-bold"
                  />
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Total Budget Target
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={totalBudget}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setTotalBudget(isNaN(v) ? 0 : v);
                    }}
                    className="w-full p-3 pl-9 rounded-xl glass-input text-xs font-bold"
                  />
                  <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-3.5" />
                </div>
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
                  onChange={(val) => setCurrency(val)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-3 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Back to Purpose
            </button>

            <button
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-500 via-indigo-600 to-violet-600 hover:from-emerald-400 hover:to-indigo-500 shadow-2xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <PartyPopper className="w-5 h-5" />
              <span>Lock in Event & Manage Guests</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div className="text-center p-12 text-slate-400">Loading Wizard...</div>}>
      <EventCreateWizard />
    </Suspense>
  );
}
