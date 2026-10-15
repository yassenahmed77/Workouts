'use client';

import React from 'react';

/**
 * NutritionPulseTile (Clean Architecture - Atomic Mobile Widget)
 *
 * Brand Identity & Unified Luxury Palette:
 * - Unified website brand colors (no clashing rainbow palette)
 * - Crisp text-white macro numbers with unified progress lines
 * - Guaranteed single-line hero calorie numbers (no wrapping)
 * - Zero decorative icons (Rule 2 compliant).
 */
export const NutritionPulseTile = ({
  consumedCalories,
  targetCalories,
  consumedProtein,
  targetProtein = 160,
  consumedCarbs,
  targetCarbs = 240,
  consumedFats,
  targetFats = 60,
  adherencePct,
  onClick
}) => {
  const calPercent = Math.min(100, Math.round((consumedCalories / Math.max(1, targetCalories)) * 100));

  return (
    <div
      onClick={onClick}
      className="bg-[var(--card-bg)]/90 backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-2.5 flex flex-col justify-between shadow-md cursor-pointer transition-all active:scale-[0.98] group h-full select-none"
      title="Click to view daily prescribed meals & macros pipeline"
    >
      {/* 1. Header: Label + Adherence Badge (Unified Brand Identity) */}
      <div className="flex items-center justify-between gap-1 text-[9px] font-mono pb-1 border-b border-white/[0.05] flex-shrink-0">
        <span className="font-semibold text-slate-400 tracking-wider uppercase">NUTRITION</span>
        <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold whitespace-nowrap bg-white/[0.05] text-slate-300 border border-white/[0.08]">
          {adherencePct}% TRACK
        </span>
      </div>

      {/* 2. Hero Calories & Calorie Track (Single-Line Layout & Brand Identity) */}
      <div className="my-1 flex flex-col gap-1 flex-shrink-0 font-mono">
        <div className="flex items-baseline justify-between sm:justify-center sm:gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-white tracking-tight">
              {consumedCalories.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              / {targetCalories.toLocaleString()}
            </span>
            <span className="text-[8px] text-slate-400 uppercase tracking-wider ml-0.5">
              kcal
            </span>
          </div>
          <span className="text-[8px] text-slate-400">
            ({calPercent}%)
          </span>
        </div>

        {/* Visual Calorie Track Bar (Clean Brand Color) */}
        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--main-color)] transition-all duration-300"
            style={{ width: `${calPercent}%` }}
          />
        </div>
      </div>

      {/* 3. 3 Macro Pillars - Clean, Natural, Unified Brand Typography */}
      <div className="grid grid-cols-3 gap-1 flex-1 min-h-[58px] sm:min-h-[72px] my-1 items-stretch">
        {/* Protein */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-1.5 flex flex-col items-center justify-between text-center">
          <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
            PRO
          </span>
          <span className="text-xs font-mono font-bold text-white block my-auto">
            {consumedProtein}g
          </span>
          <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--main-color)] rounded-full"
              style={{ width: `${Math.min(100, Math.round((consumedProtein / Math.max(1, targetProtein)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-1.5 flex flex-col items-center justify-between text-center">
          <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
            CARB
          </span>
          <span className="text-xs font-mono font-bold text-white block my-auto">
            {consumedCarbs}g
          </span>
          <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--main-color)] rounded-full"
              style={{ width: `${Math.min(100, Math.round((consumedCarbs / Math.max(1, targetCarbs)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Fats */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-1.5 flex flex-col items-center justify-between text-center">
          <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
            FAT
          </span>
          <span className="text-xs font-mono font-bold text-white block my-auto">
            {consumedFats}g
          </span>
          <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--main-color)] rounded-full"
              style={{ width: `${Math.min(100, Math.round((consumedFats / Math.max(1, targetFats)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Bottom Directive (Single Line, No Wrap) */}
      <div className="pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[8px] font-mono text-slate-400 flex-shrink-0">
        <span className="truncate">
          {adherencePct}% prescribed meals on track
        </span>
        <span className="text-[var(--main-color)] font-bold ml-1 opacity-80">
          &rarr;
        </span>
      </div>
    </div>
  );
};
