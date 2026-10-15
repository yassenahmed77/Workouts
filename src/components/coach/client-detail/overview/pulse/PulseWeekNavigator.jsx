'use client';

import React from 'react';

/**
 * PulseWeekNavigator (Clean Architecture - Atomic Component)
 *
 * Reusable typographic week cycle switcher and calendar trigger.
 * Zero decorative icons (Rule 2 compliant).
 */
export const PulseWeekNavigator = ({
  weekOffset = 0,
  setWeekOffset,
  dateRangeLabel,
  onOpenCalendar,
  isMobile = false
}) => {
  return (
    <div className={`flex items-center gap-1 font-mono ${isMobile ? 'w-full justify-between' : ''}`}>
      <div
        className={`flex items-center bg-black/60 border border-white/[0.08] rounded-xl px-1.5 py-0.5 shadow-sm ${
          isMobile ? 'w-full justify-between' : 'rounded-md px-1'
        }`}
      >
        <button
          type="button"
          onClick={() => setWeekOffset && setWeekOffset((prev) => prev - 1)}
          className="text-slate-400 hover:text-white px-2 font-bold text-xs cursor-pointer transition-colors"
          title="Previous cycle"
        >
          &larr;
        </button>

        <button
          type="button"
          onClick={onOpenCalendar}
          className="text-[10px] text-slate-200 px-2 font-semibold flex items-center justify-center gap-1 cursor-pointer hover:text-[var(--main-color)] transition-colors flex-1"
          title="Open Obsidian Calendar"
        >
          <span>{weekOffset === 0 ? 'This Week' : dateRangeLabel}</span>
          <span className="text-[8px] text-[var(--main-color)] font-mono">&bull; CAL</span>
        </button>

        <button
          type="button"
          onClick={() => setWeekOffset && setWeekOffset((prev) => prev + 1)}
          className="text-slate-400 hover:text-white px-2 font-bold text-xs cursor-pointer transition-colors"
          title="Next cycle"
        >
          &rarr;
        </button>
      </div>

      {weekOffset !== 0 && (
        <button
          type="button"
          onClick={() => setWeekOffset && setWeekOffset(0)}
          className="text-[9px] px-1.5 py-0.5 rounded-lg bg-[var(--main-color)]/20 text-[var(--main-color)] border border-[var(--main-color)]/30 font-bold hover:bg-[var(--main-color)]/30 transition-colors cursor-pointer flex-shrink-0"
          title="Reset to current week"
        >
          Now
        </button>
      )}
    </div>
  );
};
