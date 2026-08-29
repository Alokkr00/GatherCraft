'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, Plus, CheckCircle2, Circle, Trash2, User, 
  Sparkles, AlertCircle, ArrowDown, Play
} from 'lucide-react';
import { TimelineItem } from '@/lib/types';
import { getTimelineItems, saveTimelineItem, deleteTimelineItem } from '@/lib/storage';
import { generatePrefixedId } from '@/lib/id';
import ConfirmModal from '@/components/ConfirmModal';

interface TimelineEditorProps {
  eventId: string;
  startTime: string;
}

export default function TimelineEditor({ eventId, startTime }: TimelineEditorProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [offsetMinutes, setOffsetMinutes] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [assigneeName, setAssigneeName] = useState('Host (You)');

  useEffect(() => {
    loadTimeline();
  }, [eventId]);

  const loadTimeline = () => {
    setItems(getTimelineItems(eventId));
  };

  const calculateActualTime = (baseTime: string, offsetMins: number): string => {
    if (!baseTime) return '+ ' + offsetMins + 'm';
    const [h, m] = baseTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h ?? 19, m ?? 0, 0, 0);
    date.setMinutes(date.getMinutes() + offsetMins);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleToggleComplete = (item: TimelineItem) => {
    const updated = { ...item, isCompleted: !item.isCompleted };
    saveTimelineItem(updated);
    loadTimeline();
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTimelineItem(deleteId);
      setDeleteId(null);
      loadTimeline();
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: TimelineItem = {
      id: generatePrefixedId('tl'),
      eventId,
      title: title.trim(),
      description: description.trim() || undefined,
      offsetMinutes: Number(offsetMinutes) || 0,
      durationMinutes: Number(durationMinutes) || 15,
      assigneeName: assigneeName.trim() || 'Host (You)',
      isCompleted: false,
      orderIndex: items.length
    };

    saveTimelineItem(newItem);
    setTitle('');
    setDescription('');
    setOffsetMinutes(0);
    setDurationMinutes(15);
    setShowAddModal(false);
    loadTimeline();
  };

  const completedCount = items.filter(i => i.isCompleted).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Progress */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Run-of-Show Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Event Start Time: <strong className="text-white">{startTime || '19:00'}</strong> — Timed steps keep your party moving smoothly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-medium">Timeline Progress</p>
            <p className="text-sm font-bold text-emerald-400">{completedCount} / {items.length} Done ({progressPercent}%)</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Timed Step</span>
          </button>
        </div>
      </div>

      {/* Timeline Steps Stream */}
      {items.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <Clock className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No timeline steps yet</h3>
          <p className="text-xs text-slate-400">Add your first timed step to give your party an intentional structure.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
          >
            + Add First Step
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-500/30">
          {items.map((item, idx) => {
            const formattedTime = calculateActualTime(startTime, item.offsetMinutes);

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Marker Dot */}
                <button
                  onClick={() => handleToggleComplete(item)}
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    item.isCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                      : 'bg-slate-900 border-2 border-indigo-500 text-indigo-400 hover:border-indigo-400'
                  }`}
                >
                  {item.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
                </button>

                {/* Step Card */}
                <div className={`glass-card p-5 rounded-2xl border transition-all ${
                  item.isCompleted
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                    : 'border-slate-800 hover:border-indigo-500/40'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {formattedTime} (+{item.offsetMinutes}m)
                      </span>
                      <h3 className={`font-bold text-base text-white ${item.isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.durationMinutes > 0 && (
                        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {item.durationMinutes} mins
                        </span>
                      )}

                      {item.assigneeName && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded border border-violet-500/20">
                          <User className="w-3 h-3" />
                          {item.assigneeName}
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Delete step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-300 mt-2 pl-1 border-l-2 border-slate-700">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Step Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-4 border border-indigo-500/30">
            <h3 className="text-lg font-bold text-white">Add Timed Timeline Step</h3>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Step Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Welcome Drinks & Music Kickoff"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Host Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Gather everyone around the island for quick introductions..."
                  className="w-full p-3 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Offset (Mins from Start)</label>
                  <input
                    type="number"
                    min={0}
                    value={offsetMinutes}
                    onChange={(e) => setOffsetMinutes(parseInt(e.target.value) || 0)}
                    className="w-full p-3 rounded-xl glass-input text-xs font-bold text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 15)}
                    className="w-full p-3 rounded-xl glass-input text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee / Leader</label>
                <input
                  type="text"
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  placeholder="e.g. Host (You) or Alex Rivera"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Save Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Timeline Step"
        message="Are you sure you want to delete this timeline step?"
        confirmText="Delete Step"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
