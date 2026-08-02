'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // Accepts "07:00 PM", "19:00", "07:00", etc.
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomTimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  className = '',
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to parse 12hr time object
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: '07', minute: '00', period: 'PM' };

    // Check if format is "07:00 PM" or "19:00"
    const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match12) {
      let h = parseInt(match12[1], 10);
      let m = match12[2];
      let p = (match12[3] || 'PM').toUpperCase();

      if (!match12[3]) {
        // 24hr format
        if (h >= 12) {
          p = 'PM';
          if (h > 12) h -= 12;
        } else {
          p = 'AM';
          if (h === 0) h = 12;
        }
      }

      return {
        hour: String(h).padStart(2, '0'),
        minute: m,
        period: p,
      };
    }
    return { hour: '07', minute: '00', period: 'PM' };
  };

  const timeObj = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(timeObj.hour);
  const [selectedMinute, setSelectedMinute] = useState(timeObj.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(timeObj.period);

  useEffect(() => {
    if (value) {
      const parsed = parseTime(value);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emitTimeChange = (h: string, m: string, p: string) => {
    const formatted = `${h}:${m} ${p}`;
    onChange(formatted);
  };

  const handleHourSelect = (h: string) => {
    setSelectedHour(h);
    emitTimeChange(h, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (m: string) => {
    setSelectedMinute(m);
    emitTimeChange(selectedHour, m, selectedPeriod);
  };

  const handlePeriodToggle = (p: string) => {
    setSelectedPeriod(p);
    emitTimeChange(selectedHour, selectedMinute, p);
  };

  const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutes = ['00', '15', '30', '45'];
  const presets = ['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'];

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      {/* Input Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 p-3 rounded-xl glass-input text-xs font-medium transition-all ${
          isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className={value ? 'text-slate-100 font-bold' : 'text-slate-400'}>
            {value || placeholder}
          </span>
        </span>
      </button>

      {/* Glassmorphism Time Picker Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-72 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Preset Buttons Header */}
          <div className="mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Popular Presets
            </span>
            <div className="flex flex-wrap gap-1">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    onChange(preset);
                    setIsOpen(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    value === preset
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* AM / PM Toggle */}
          <div className="flex items-center justify-center p-1 bg-slate-950 rounded-xl mb-3 border border-slate-800">
            {['AM', 'PM'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => handlePeriodToggle(period)}
                className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Hours & Minutes Selectors */}
          <div className="grid grid-cols-2 gap-3">
            {/* Hours Column */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Hour
              </span>
              <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto pr-1">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourSelect(h)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedHour === h
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Minute
              </span>
              <div className="flex flex-col gap-1">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteSelect(m)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                      selectedMinute === m
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    :{m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Close Button */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
