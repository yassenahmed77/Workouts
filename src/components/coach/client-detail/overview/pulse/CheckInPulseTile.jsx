'use client';

import React from 'react';

/**
 * CheckInPulseTile (Clean Architecture - Atomic Mobile Widget)
 *
 * Brand Identity & Unified Luxury Palette:
 * - Unified website brand colors (zero clashing orange/multi-color circus)
 * - Cohesive text-white protocol values
 * - Proportional typography hierarchy
 * - Zero decorative icons (Rule 2 compliant).
 */
export const CheckInPulseTile = ({
  client,
  onNavigateSubTab
}) => {
  return (
    <div
      onClick={() => onNavigateSubTab('checkins')}
      className="bg-[var(--card-bg)]/90 backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-2.5 flex flex-col justify-between shadow-md cursor-pointer transition-all active:scale-[0.98] group h-full select-none"
      title="Click to view weekly check-in photos & measurements"
    >
      {/* 1. Header: Label + Action Badge (Guaranteed 1 Line) */}
      <div className="flex items-center justify-between gap-1 text-[9px] font-mono pb-1 border-b border-white/[0.05] flex-shrink-0">
        <span className="font-semibold text-slate-400 tracking-wider uppercase">CHECK-IN</span>
        <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-[var(--main-color)]/10 text-[var(--main-color)] border border-[var(--main-color)]/20 whitespace-nowrap">
          AUDIT &rarr;
        </span>
      </div>

      {/* 2. Hero Headline Date */}
      <div className="my-1 flex flex-col gap-0.5 flex-shrink-0 font-mono sm:items-center sm:text-center">
        <div className="flex items-baseline justify-between sm:justify-center w-full">
          <span className="text-base font-bold text-white tracking-tight truncate sm:text-center">
            {client?.lastCheckInDate ? `Last: ${client.lastCheckInDate}` : 'Friday Due'}
          </span>
        </div>
        <span className="text-[8.5px] text-slate-400 font-medium truncate sm:text-center">
          Weekly progress audit
        </span>
      </div>

      {/* 3. 3 Protocol Pillars - Unified Website Brand Identity (Zero Rainbow Colors) */}
      <div className="grid grid-cols-3 gap-1 flex-1 min-h-[58px] sm:min-h-[72px] my-1 items-stretch">
        {/* Scale */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-1.5 flex flex-col items-center justify-between text-center">
          <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
            SCALE
          </span>
          <span className="text-xs font-mono font-bold text-white block my-auto">
            ✓ Log
          </span>
          <span className="text-[7px] font-mono text-slate-500 block uppercase">
            Weight
          </span>
        </div>

        {/* Photos */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-1.5 flex flex-col items-center justify-between text-center">
          <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
            PHOTOS
          </span>
          <span className="text-xs font-mono font-bold text-white block my-auto">
            3 Angles
          </span>
          <span className="text-[7px] font-mono text-slate-500 block uppercase">
            Visual
          </span>
        </div>

        {/* Tape */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-1.5 flex flex-col items-center justify-between text-center">
          <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
            TAPE
          </span>
          <span className="text-xs font-mono font-bold text-white block my-auto">
            cm
          </span>
          <span className="text-[7px] font-mono text-slate-500 block uppercase">
            Girth
          </span>
        </div>
      </div>

      {/* 4. Bottom Directive (Single Line, No Wrap) */}
      <div className="pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[8px] font-mono text-slate-400 flex-shrink-0">
        <span className="truncate">
          Scale • Photos • Tape
        </span>
        <span className="text-[var(--main-color)] font-bold ml-1 opacity-80">
          &rarr;
        </span>
      </div>
    </div>
  );
};
