'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, CheckCircle2, Circle, Trash2, 
  Sparkles, RefreshCw, Layers
} from 'lucide-react';
import { ShoppingItem } from '@/lib/types';
import { getShoppingItems, saveShoppingItem, deleteShoppingItem, generateShoppingList } from '@/lib/storage';

interface ShoppingListProps {
  eventId: string;
  confirmedHeadcount: number;
}

export default function ShoppingList({ eventId, confirmedHeadcount }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Drinks');
  const [quantity, setQuantity] = useState('1 pack');

  useEffect(() => {
    loadShopping();
  }, [eventId]);

  const loadShopping = () => {
    setItems(getShoppingItems(eventId));
  };

  const handleTogglePurchased = (item: ShoppingItem) => {
    saveShoppingItem({ ...item, isPurchased: !item.isPurchased });
    loadShopping();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete shopping item?')) {
      deleteShoppingItem(id);
      loadShopping();
    }
  };

  const handleGenerate = () => {
    generateShoppingList(eventId, confirmedHeadcount);
    loadShopping();
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: ShoppingItem = {
      id: 'shop_' + Math.random().toString(36).substring(2, 9),
      eventId,
      category,
      name: name.trim(),
      quantity: quantity.trim() || '1',
      isPurchased: false
    };

    saveShoppingItem(newItem);
    setName('');
    setShowAddModal(false);
    loadShopping();
  };

  const filteredItems = items.filter(i => {
    if (activeCategory === 'All') return true;
    return i.category === activeCategory;
  });

  const purchasedCount = items.filter(i => i.isPurchased).length;
  const progressPercent = items.length > 0 ? Math.round((purchasedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            Quantified Shopping List
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculated for <strong className="text-emerald-400">{confirmedHeadcount} confirmed guests</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length === 0 && (
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Generate Supplies</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {items.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Items Purchased:</span>
            <span className="text-emerald-400">{purchasedCount} / {items.length} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
        {['All', 'Drinks', 'Food', 'Supplies', 'Other'].map((cat) => (
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

      {/* Shopping Stream */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <ShoppingCart className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No shopping items</h3>
          <p className="text-xs text-slate-400">Click "Generate Supplies" to estimate drinks, ice, and plates based on headcount.</p>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
          >
            Generate Supplies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleTogglePurchased(item)}
              className={`cursor-pointer glass-card p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.isPurchased
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                  : 'border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  item.isPurchased ? 'bg-emerald-500 text-white' : 'text-slate-500'
                }`}>
                  {item.isPurchased ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </span>

                <div>
                  <h4 className={`font-bold text-sm text-white ${item.isPurchased ? 'line-through text-slate-400' : ''}`}>
                    {item.name}
                  </h4>
                  <span className="text-[11px] text-indigo-300 font-semibold">{item.quantity}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                  {item.category}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-4 border border-indigo-500/30">
            <h3 className="text-lg font-bold text-white">Add Shopping Item</h3>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lime slices & tonic water"
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-xs"
                  >
                    <option value="Drinks">Drinks</option>
                    <option value="Food">Food</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 2 packs"
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
