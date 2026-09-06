'use client';

import { useState } from 'react';
import { ShoppingCart, CheckSquare, DollarSign, Sparkles } from 'lucide-react';
import TaskManager from '@/components/TaskManager';
import ShoppingList from '@/components/ShoppingList';
import BudgetTracker from '@/components/BudgetTracker';

interface EventPrepViewProps {
  eventId: string;
  eventTitle: string;
  totalBudget?: number;
  currency?: string;
  confirmedHeadcount?: number;
}

export default function EventPrepView({
  eventId,
  eventTitle,
  totalBudget = 0,
  currency = 'USD',
  confirmedHeadcount = 10,
}: EventPrepViewProps) {
  const [activeSection, setActiveSection] = useState<'shopping' | 'tasks' | 'budget'>('shopping');

  return (
    <div className="space-y-6">
      {/* Sub-navigation Header */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Event Preparation Center</span>
          </h2>
          <p className="text-xs text-slate-400">
            Everything needed to prepare for the gathering in one unified place.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveSection('shopping')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === 'shopping'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Supplies & Shopping</span>
          </button>

          <button
            onClick={() => setActiveSection('tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === 'tasks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks & Setup</span>
          </button>

          <button
            onClick={() => setActiveSection('budget')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === 'budget'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Budget Overview</span>
          </button>
        </div>
      </div>

      {/* Render Active Section */}
      <div>
        {activeSection === 'shopping' && (
          <ShoppingList eventId={eventId} confirmedHeadcount={confirmedHeadcount} />
        )}
        {activeSection === 'tasks' && (
          <TaskManager eventId={eventId} eventTitle={eventTitle} />
        )}
        {activeSection === 'budget' && (
          <BudgetTracker eventId={eventId} totalBudgetLimit={totalBudget} currency={currency} />
        )}
      </div>
    </div>
  );
}
