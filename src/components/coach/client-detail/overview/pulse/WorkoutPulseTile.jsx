'use client';

import React from 'react';

/**
 * WorkoutPulseTile (Clean Architecture - Atomic Mobile Widget)
 *
 * Refined Swiss Aesthetics & Visual Harmony:
 * - Balanced typography scale (no oversized bulky headings)
 * - Restrained, cohesive dark-mode palette
 * - Elegant vertical day pillars (Sat-Fri) with subtle, muted status accents
 * - Clean single-line footer directive
 * - Zero decorative icons (Rule 2 compliant).
 */
export const WorkoutPulseTile = ({
  weekAttendance,
  weekOffset,
  onClick
}) => {
  const completed = weekAttendance.completedCount || 0;
  const target = weekAttendance.targetSessions || 4;
  const percentage = Math.min(100, Math.round((completed / Math.max(1, target)) * 100));
  const remaining = Math.max(0, target - completed);

  return (
    <div
      onClick={onClick}
      className="bg-[var(--card-bg)]/90 backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-2.5 flex flex-col justify-between shadow-md cursor-pointer transition-all active:scale-[0.98] group h-full select-none"
      title="Click to view weekly workout sessions pipeline"
    >
      {/* 1. Header: Label + Completion Badge (Guaranteed 1 Line) */}
      <div className="flex items-center justify-between gap-1 text-[9px] font-mono pb-1 border-b border-white/[0.05] flex-shrink-0">
        <span className="font-semibold text-slate-400 tracking-wider uppercase">WORKOUTS</span>
        <span
          className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${
            percentage >= 100
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
              : 'bg-white/[0.05] text-slate-300 border border-white/[0.06]'
          }`}
        >
          {percentage}%
        </span>
      </div>

      {/* 2. Hero Telemetry & Visual Progress Track */}
      <div className="my-1 flex flex-col gap-1 flex-shrink-0">
        <div className="flex items-baseline justify-between sm:justify-center sm:gap-2 font-mono">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-white tracking-tight">
              {completed}
              <span className="text-slate-500 font-normal text-xs mx-0.5">/</span>
              {target}
            </span>
            <span className="text-[8px] text-slate-400 uppercase tracking-wider">
              {target === 1 ? 'session' : 'sessions'}
            </span>
          </div>
          <span className="text-[8px] font-mono text-slate-400">
            {remaining > 0 ? `(${remaining} left)` : '(Completed)'}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--main-color)] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 3. Tall Vertical 7-Day Pillars (Sat to Fri) - Harmonious Palette */}
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-[58px] sm:min-h-[72px] my-1 items-stretch">
        {(weekAttendance.days || []).map((day) => {
          let badgeClass = 'bg-white/[0.02] text-slate-600 border-white/[0.04]';
          let symbol = '·';
          let symbolClass = 'text-slate-600 text-sm';

          if (day.hasWorkout) {
            badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 font-bold';
            symbol = '✓';
            symbolClass = 'text-emerald-400 text-xs font-bold';
          } else if (weekOffset < 0 || day.isPast) {
            badgeClass = 'bg-rose-500/10 text-rose-400/80 border-rose-500/20 font-bold';
            symbol = '✕';
            symbolClass = 'text-rose-400/80 text-[11px] font-bold';
          } else if (day.isToday) {
            badgeClass = 'bg-white/[0.08] text-white border-white/25 font-bold shadow-xs';
            symbol = '⏱';
            symbolClass = 'text-white text-[11px] font-bold';
          }

          return (
            <div
              key={day.dateStr}
              className={`rounded-xl border flex flex-col items-center justify-between py-1.5 transition-all ${badgeClass}`}
              title={`${day.dayName} ${day.dayNum}`}
            >
              <span className="text-[7.5px] font-mono block leading-none opacity-60 uppercase font-semibold">
                {day.dayName[0]}
              </span>

              <span className={`font-mono leading-none block my-auto ${symbolClass}`}>
                {symbol}
              </span>

              <span className="text-[6.5px] font-mono leading-none opacity-40">
                {day.dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Directive (Single Line, No Wrap) */}
      <div className="pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[8px] font-mono text-slate-400 flex-shrink-0">
        <span className="truncate">
          {weekOffset < 0
            ? `${remaining} missed in cycle`
            : `${percentage}% cycle completed`}
        </span>
        <span className="text-[var(--main-color)] font-bold ml-1 opacity-80">
          &rarr;
        </span>
      </div>
    </div>
  );
};
