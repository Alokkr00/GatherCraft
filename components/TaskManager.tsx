'use client';

import { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Trash2, Sparkles, Filter, User, 
  AlertCircle, CheckCircle2, Clock, Calendar
} from 'lucide-react';
import { TaskItem, TaskCategory, TaskPriority, TaskStatus } from '@/lib/types';
import { getTasks, saveTask, deleteTask, generateDefaultTasks } from '@/lib/storage';

interface TaskManagerProps {
  eventId: string;
  eventTitle: string;
}

export default function TaskManager({ eventId, eventTitle }: TaskManagerProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Setup');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeName, setAssigneeName] = useState('Host (You)');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadTasks();
  }, [eventId]);

  const loadTasks = () => {
    setTasks(getTasks(eventId));
  };

  const handleStatusChange = (task: TaskItem, newStatus: TaskStatus) => {
    saveTask({ ...task, status: newStatus });
    loadTasks();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this task?')) {
      deleteTask(id);
      loadTasks();
    }
  };

  const handleGenerateDefaultTasks = () => {
    generateDefaultTasks(eventId, eventTitle);
    loadTasks();
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: TaskItem = {
      id: 'tk_' + Math.random().toString(36).substring(2, 9),
      eventId,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      status: 'todo',
      assigneeName: assigneeName.trim() || 'Host (You)',
      dueDate: dueDate || undefined,
      updatedAt: new Date().toISOString()
    };

    saveTask(newTask);
    setTitle('');
    setDescription('');
    setShowAddModal(false);
    loadTasks();
  };

  const filteredTasks = tasks.filter(t => {
    if (activeCategory === 'All') return true;
    return t.category === activeCategory;
  });

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const progressPercent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Logistics & Tasks Checklist
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize setup, food, drinks, decor, and cleanup responsibilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tasks.length === 0 && (
            <button
              onClick={handleGenerateDefaultTasks}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Generate Tasks</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Tasks Completion Rate:</span>
            <span className="text-emerald-400">{doneCount} / {tasks.length} Done ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
        {['All', 'Setup', 'Food', 'Drinks', 'Decor', 'Cleanup', 'Other'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tasks Stream */}
      {filteredTasks.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <CheckSquare className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No tasks in this category</h3>
          <p className="text-xs text-slate-400">Create a task or click "Auto-Generate Tasks" to populate default party steps.</p>
          <button
            onClick={handleGenerateDefaultTasks}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
          >
            Auto-Generate Party Tasks
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`glass-card p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                t.status === 'done' ? 'bg-slate-900/40 border-slate-800/60 opacity-75' : 'border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className={`font-bold text-sm text-white ${t.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                    {t.title}
                  </h3>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.priority === 'high'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : t.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {t.priority}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                    {t.category}
                  </span>
                </div>

                {t.description && <p className="text-xs text-slate-300">{t.description}</p>}

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  {t.assigneeName && (
                    <span className="flex items-center gap-1 text-violet-300">
                      <User className="w-3 h-3" />
                      {t.assigneeName}
                    </span>
                  )}
                  {t.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      Due {t.dueDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t, e.target.value as TaskStatus)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border capitalize ${
                    t.status === 'done'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : t.status === 'in_progress'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-4 border border-indigo-500/30">
            <h3 className="text-lg font-bold text-white">Add Logistics Task</h3>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Buy cubed ice bags & lemon slices"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes, store locations, or details..."
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  >
                    <option value="Setup">Setup</option>
                    <option value="Food">Food</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Decor">Decor</option>
                    <option value="Cleanup">Cleanup</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    placeholder="Host (You)"
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  />
                </div>
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
