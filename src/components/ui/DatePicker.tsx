'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  required?: boolean;
  error?: string;
  value: string; // ISO format: YYYY-MM-DD
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  align?: 'left' | 'right' | 'auto';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  required = false,
  error,
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Select date...',
  align = 'auto'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse current value or fallback to today
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return null;
  }, [value]);

  // Calendar viewing month/year state
  const [viewYear, setViewYear] = useState<number>(() => selectedDate?.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => selectedDate?.getMonth() ?? new Date().getMonth());

  // Sync view when value changes from outside
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  // Position calculation for Portal rendering
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = 264;
    const popoverHeight = 280;

    // Check space below vs above
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

    let top = openUpward ? rect.top - popoverHeight - 6 : rect.bottom + 6;
    top = Math.max(8, Math.min(window.innerHeight - popoverHeight - 8, top));

    let left = rect.left;
    if (align === 'right' || rect.left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, rect.right - popoverWidth);
    } else {
      left = Math.max(12, Math.min(window.innerWidth - popoverWidth - 12, left));
    }

    setCoords({ top, left });
  }, [align]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
      return () => {
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Outside click & escape listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Build days grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isSelected: boolean; isToday: boolean }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isSelected: value === dateStr,
        isToday: false
      });
    }

    // Current month days
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isSelected: value === dateStr,
        isToday: dateStr === todayStr
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isSelected: value === dateStr,
        isToday: false
      });
    }

    return days;
  }, [viewYear, viewMonth, value]);

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onChange(todayStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Display formatted label (e.g. 10/14/2026)
  const displayLabel = useMemo(() => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return value;
  }, [value]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
          {error && (
            <span className="text-[9px] text-rose-400 font-mono font-medium ml-1 truncate">{error}</span>
          )}
        </div>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full px-2.5 py-1.5 h-8 rounded-xl bg-[var(--input-bg)] border ${
          error ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
        } text-white flex items-center justify-between transition-all cursor-pointer select-none focus:outline-none hover:border-white/[0.18] active:scale-[0.99] font-mono text-xs ${
          isOpen ? 'border-[var(--main-color)] ring-1 ring-[var(--main-color)]/25' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate">
          {displayLabel || <span className="text-slate-500 font-sans">{placeholder}</span>}
        </span>
        <Calendar className={`w-3.5 h-3.5 ml-1.5 text-slate-400 flex-shrink-0 transition-colors ${isOpen ? 'text-[var(--main-color)]' : ''}`} />
      </button>

      {/* Custom Obsidian Theme DatePicker Popover in Portal (Prevents Modal Clipping) */}
      {mounted && isOpen && coords && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 99999
          }}
          className="w-[264px] p-3 rounded-2xl bg-[#0f1117] border border-white/[0.12] shadow-2xl shadow-black/95 backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-150 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header: Month / Year + Navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
            <span className="text-xs font-bold text-white tracking-tight">
              {MONTH_NAMES[viewMonth]} <span className="text-[var(--main-color)]">{viewYear}</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[10px] font-mono font-semibold text-slate-400 py-0.5">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((cell, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDay(cell.dateStr)}
                className={`h-7 rounded-lg text-xs font-mono font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                  cell.isSelected
                    ? 'bg-[var(--main-color)] text-white font-bold shadow-sm shadow-[var(--main-color)]/40 scale-105 z-10'
                    : cell.isCurrentMonth
                    ? 'text-slate-200 hover:bg-white/[0.08] hover:text-white'
                    : 'text-slate-600 opacity-40 hover:opacity-80'
                }`}
              >
                {cell.dayNum}
                {cell.isToday && !cell.isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[var(--main-color)]" />
                )}
              </button>
            ))}
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/[0.08] text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer font-medium"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[var(--main-color)] hover:text-[var(--main-color-hover)] transition-colors cursor-pointer font-semibold"
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
