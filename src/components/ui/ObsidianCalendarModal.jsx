'use client';

import React, { useState, useMemo, useEffect } from 'react';

/**
 * ObsidianCalendarModal (Presentation Layer - Atomic UI Component)
 *
 * Dedicated obsidian-themed calendar picker matching the Workouts Pro design system:
 * - Saturday-first Egyptian training cycle layout (Sa, Su, Mo, Tu, We, Th, Fr)
 * - Highlights the active weekly cycle strip
 * - Month & year navigation
 * - Quick jump to "Current Week"
 * - Escape key & backdrop dismissal
 * - Rule 2 compliant (Zero decorative icons - pure typography navigation)
 */
export const ObsidianCalendarModal = ({
  isOpen,
  onClose,
  selectedDate,
  activeWeekStartStr,
  activeWeekEndStr,
  onSelectDate
}) => {
  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // View month & year state
  const initialDate = useMemo(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0])) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    return new Date();
  }, [selectedDate]);

  const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth());

  // Keep in sync when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0])) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Saturday-first day labels (Egyptian Gym Culture Standard)
  const weekDays = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];

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

  // Generate grid cells for the month (aligned with Saturday as col 0)
  const calendarCells = useMemo(() => {
    // getDay(): 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    // In Saturday-first alignment: Saturday is col 0, Sunday is col 1, ..., Friday is col 6
    const firstDay = new Date(viewYear, viewMonth, 1);
    const dayOfWeek = firstDay.getDay(); // 0 (Sun) -> col 1, 6 (Sat) -> col 0
    const startOffset = (dayOfWeek + 1) % 7;

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Prev month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNum,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true
      });
    }

    // Next month padding to complete grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  if (!isOpen) return null;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handleSelectDay = (dateStr) => {
    onSelectDate(dateStr);
    onClose();
  };

  const handleJumpToToday = () => {
    onSelectDate(todayStr);
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xs rounded-2xl bg-[#0f1117] border border-white/[0.12] p-4 shadow-2xl shadow-black/95 animate-in zoom-in-95 duration-150 flex flex-col space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Month / Year + Navigation */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            {monthNames[viewMonth]} <span className="text-[var(--main-color)]">{viewYear}</span>
          </span>

          <div className="flex items-center gap-1 font-mono">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
              title="Previous month"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
              title="Next month"
            >
              &rarr;
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold ml-1"
              title="Close calendar (Esc)"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Days of Week Header (Saturday First) */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d) => (
            <span key={d} className="text-[10px] font-mono font-bold text-slate-400 py-0.5">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
          {calendarCells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            const isInActiveCycle =
              activeWeekStartStr &&
              activeWeekEndStr &&
              cell.dateStr >= activeWeekStartStr &&
              cell.dateStr <= activeWeekEndStr;
            const isSelected = cell.dateStr === selectedDate;

            let cellClass = 'text-slate-300 hover:bg-white/[0.08] hover:text-white';

            if (!cell.isCurrentMonth) {
              cellClass = 'text-slate-600 opacity-40 hover:opacity-80';
            } else if (isSelected) {
              cellClass = 'bg-[var(--main-color)] text-white font-bold shadow-md shadow-[var(--main-color)]/30 scale-105 z-10';
            } else if (isInActiveCycle) {
              cellClass = 'bg-[var(--main-color)]/15 text-[var(--main-color)] border border-[var(--main-color)]/30 font-semibold';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDay(cell.dateStr)}
                className={`h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${cellClass}`}
                title={cell.dateStr}
              >
                {cell.dayNum}
                {isToday && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[var(--main-color)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Actions Footer */}
        <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between font-mono text-xs">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="text-[var(--main-color)] hover:underline font-semibold cursor-pointer text-[11px]"
          >
            Current Week
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
