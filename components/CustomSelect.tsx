'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  icon?: ReactNode;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder = 'Select option...',
  className = '',
  size = 'md',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 glass-input rounded-xl transition-all ${
          isSmall ? 'px-3 py-1.5 text-xs' : 'p-3 text-xs'
        } ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}
      >
        <span className="flex items-center gap-2 truncate font-medium text-slate-100">
          {selectedOption ? (
            <>
              {selectedOption.icon}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Glassmorphism Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 left-0 mt-2 z-50 rounded-xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-600/30 text-indigo-300'
                    : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
