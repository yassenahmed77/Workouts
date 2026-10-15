'use client';

import React from 'react';

/**
 * HealthStatusPulseTile (Clean Architecture - Atomic Mobile Widget)
 *
 * Refined Swiss Aesthetics & Visual Harmony:
 * - Single-word header 'HEALTH' (guaranteed 1 line, zero wrap)
 * - Restrained, cohesive color palette (no clashing harsh tones)
 * - Proportional typography (balanced hierarchy)
 * - 5-segment volume capacity gauge
 * - Zero decorative icons (Rule 2 compliant).
 */
export const HealthStatusPulseTile = ({
  attention,
  hasActiveInjury,
  hasWarning
}) => {
  const readinessSegments = hasActiveInjury ? 1 : hasWarning ? 3 : 5;

  return (
    <div className="bg-[var(--card-bg)]/90 backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-2.5 flex flex-col justify-between shadow-md h-full select-none group transition-all">
      {/* 1. Header: Single-Word Label 'HEALTH' + Cohesive Status Badge */}
      <div className="flex items-center justify-between gap-1 text-[9px] font-mono pb-1 border-b border-white/[0.05] flex-shrink-0">
        <span className="font-semibold text-slate-400 tracking-wider uppercase">HEALTH</span>
        <span
          className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold whitespace-nowrap ${
            hasActiveInjury
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
              : hasWarning
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
          }`}
        >
          {hasActiveInjury ? 'FLAGGED' : hasWarning ? 'CAUTION' : 'OPTIMAL'}
        </span>
      </div>

      {/* 2. Hero Headline Status */}
      <div className="my-1 flex flex-col gap-0.5 flex-shrink-0 font-mono sm:items-center sm:text-center">
        <div className="flex items-baseline justify-between sm:justify-center sm:gap-2 w-full">
          <span
            className={`text-base font-bold tracking-tight ${
              hasActiveInjury
                ? 'text-rose-400'
                : hasWarning
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {hasActiveInjury ? 'Injury Flag' : hasWarning ? 'Caution' : '100% Fit'}
          </span>
          <span className="text-[8px] text-slate-500 uppercase tracking-wider">
            {hasActiveInjury ? 'Review' : 'Healthy'}
          </span>
        </div>

        <span className="text-[8.5px] text-slate-400 truncate sm:text-center">
          {attention?.timeframe || 'Zero injury flags'}
        </span>
      </div>

      {/* 3. 5-Segment Volume Capacity Gauge (Harmonious & Sleek) */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-2 flex flex-col justify-between flex-1 min-h-[58px] sm:min-h-[72px] my-1">
        <div className="flex items-center justify-between text-[7.5px] font-mono text-slate-400">
          <span className="uppercase tracking-wider">Load Capacity</span>
          <span className={`font-bold ${hasActiveInjury ? 'text-rose-400' : 'text-emerald-400'}`}>
            {readinessSegments * 20}%
          </span>
        </div>

        {/* 5 Sleek Capacity Bars */}
        <div className="grid grid-cols-5 gap-1 my-auto">
          {[1, 2, 3, 4, 5].map((seg) => {
            const isActive = seg <= readinessSegments;
            const barClass = isActive
              ? hasActiveInjury
                ? 'bg-rose-500/80 shadow-[0_0_4px_rgba(244,63,94,0.4)]'
                : hasWarning
                ? 'bg-amber-400/80 shadow-[0_0_4px_rgba(245,158,11,0.4)]'
                : 'bg-emerald-400/80 shadow-[0_0_4px_rgba(52,211,153,0.3)]'
              : 'bg-white/[0.05]';

            return (
              <div
                key={seg}
                className={`h-1.5 rounded-full transition-all duration-300 ${barClass}`}
              />
            );
          })}
        </div>

        <span className="text-[7.5px] font-mono text-slate-500 block truncate">
          {hasActiveInjury ? 'Deload recommended' : 'High volume tolerance ready'}
        </span>
      </div>

      {/* 4. Bottom Directive (Single Line, No Wrap) */}
      <div className="pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[8px] font-mono text-slate-400 flex-shrink-0">
        <span className="truncate">
          {hasActiveInjury ? 'Needs coach review' : 'Ready for heavy volume'}
        </span>
        <span className="text-[7.5px] text-slate-500 font-mono uppercase font-bold ml-1">
          {hasActiveInjury ? 'REST' : 'FULL'}
        </span>
      </div>
    </div>
  );
};
