'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, Plus, Trash2, AlertTriangle, CheckCircle2, 
  ExternalLink, FileText, TrendingUp, TrendingDown
} from 'lucide-react';
import { BudgetItem } from '@/lib/types';
import { getBudgetItems, saveBudgetItem, deleteBudgetItem } from '@/lib/storage';
import { generatePrefixedId } from '@/lib/id';
import CustomSelect from '@/components/CustomSelect';
import ConfirmModal from '@/components/ConfirmModal';

interface BudgetTrackerProps {
  eventId: string;
  totalBudgetLimit: number;
  currency: string;
}

export default function BudgetTracker({ eventId, totalBudgetLimit, currency }: BudgetTrackerProps) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Drinks');
  const [plannedAmount, setPlannedAmount] = useState(50);
  const [actualAmount, setActualAmount] = useState(50);
  const [vendor, setVendor] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadBudget();
  }, [eventId]);

  const loadBudget = () => {
    setItems(getBudgetItems(eventId));
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteBudgetItem(deleteId);
      setDeleteId(null);
      loadBudget();
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: BudgetItem = {
      id: generatePrefixedId('bg'),
      eventId,
      category,
      name: name.trim(),
      plannedAmount: Number(plannedAmount) || 0,
      actualAmount: Number(actualAmount) || 0,
      vendor: vendor.trim() || undefined,
      receiptUrl: receiptUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString()
    };

    saveBudgetItem(newItem);
    setName('');
    setVendor('');
    setReceiptUrl('');
    setNotes('');
    setShowAddModal(false);
    loadBudget();
  };

  const totalPlanned = items.reduce((acc, i) => acc + (i.plannedAmount || 0), 0);
  const totalActual = items.reduce((acc, i) => acc + (i.actualAmount || 0), 0);
  const limit = totalBudgetLimit > 0 ? totalBudgetLimit : 200;

  const rawPercent = Math.round((totalActual / limit) * 100);
  const actualPercent = Math.min(100, rawPercent);
  const isOverBudget = totalActual > limit;
  const isNearBudget = totalActual >= limit * 0.85 && !isOverBudget;

  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview Cards & Health Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-medium">Budget Target Limit</p>
          <p className="text-2xl font-bold text-white">{symbol}{limit}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-medium">Total Planned Spend</p>
          <p className="text-2xl font-bold text-indigo-400">{symbol}{totalPlanned}</p>
        </div>

        <div className={`glass-panel p-5 rounded-2xl border space-y-1 ${
          isOverBudget ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'
        }`}>
          <p className="text-xs text-slate-400 font-medium">Actual Spent</p>
          <p className={`text-2xl font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
            {symbol}{totalActual}
          </p>
        </div>
      </div>

      {/* Health Progress Meter & Alert */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Budget Health Indicator</h2>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Line Item</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Budget Used:</span>
            <span className={isOverBudget ? 'text-rose-400' : isNearBudget ? 'text-amber-400' : 'text-emerald-400'}>
              {symbol}{totalActual} / {symbol}{limit} ({rawPercent}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : isNearBudget
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
              }`}
              style={{ width: `${actualPercent}%` }}
            />
          </div>
        </div>

        {isOverBudget && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Budget Exceeded! You are {symbol}{totalActual - limit} over your initial limit target.</span>
          </div>
        )}
      </div>

      {/* Budget Line Items Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        {items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No budget items added</h3>
            <p className="text-xs text-slate-400">Keep your event costs on track by adding line items.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              + Add Budget Line Item
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            <div className="p-4 bg-slate-900/60 font-semibold text-xs text-slate-400 flex items-center justify-between">
              <span>Item & Category</span>
              <div className="flex items-center gap-8">
                <span>Planned</span>
                <span>Actual</span>
                <span>Actions</span>
              </div>
            </div>

            {items.map((i) => {
              const diff = i.actualAmount - i.plannedAmount;

              return (
                <div key={i.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{i.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                        {i.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {i.vendor && <span>Vendor: {i.vendor}</span>}
                      {i.receiptUrl && (
                        <a href={i.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-400 hover:underline">
                          <FileText className="w-3 h-3" />
                          Receipt
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-xs font-bold">
                    <span className="text-slate-300">{symbol}{i.plannedAmount}</span>

                    <span className={`flex items-center gap-1 ${diff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {diff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {symbol}{i.actualAmount}
                    </span>

                    <button
                      onClick={() => handleDelete(i.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-4 border border-indigo-500/30">
            <h3 className="text-lg font-bold text-white">Add Budget Line Item</h3>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Spirits & Bitters"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <CustomSelect
                    value={category}
                    options={[
                      { value: 'Drinks', label: 'Drinks' },
                      { value: 'Food', label: 'Food' },
                      { value: 'Venue', label: 'Venue' },
                      { value: 'Decor', label: 'Decor' },
                      { value: 'Music', label: 'Music' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    onChange={(val) => setCategory(val)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Planned ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={plannedAmount}
                    onChange={(e) => setPlannedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded-xl glass-input text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Actual ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={actualAmount}
                    onChange={(e) => setActualAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded-xl glass-input text-xs font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vendor / Store Name</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Trader Joe's / BevMo"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Receipt URL (Optional)</label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://..."
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
                  Save Line Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Budget Line Item"
        message="Are you sure you want to remove this line item from your budget?"
        confirmText="Remove Item"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
