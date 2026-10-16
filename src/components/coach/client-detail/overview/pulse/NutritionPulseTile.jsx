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
  telemetry,
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
  const hasDietPlan = telemetry ? telemetry.hasDietPlan : true;
  const targetCal = telemetry ? telemetry.targetCalories : (targetCalories || 2200);
  const avgCal = telemetry ? telemetry.avgCalories : (consumedCalories || 1850);
  const targetProt = telemetry ? telemetry.targetProteinG : targetProtein;
  const avgProt = telemetry ? telemetry.avgProteinG : (consumedProtein || 140);
  const targetCarb = telemetry ? telemetry.targetCarbsG : targetCarbs;
  const avgCarb = telemetry ? telemetry.avgCarbsG : (consumedCarbs || 220);
  const targetFat = telemetry ? telemetry.targetFatsG : targetFats;
  const avgFat = telemetry ? telemetry.avgFatsG : (consumedFats || 55);

  const statusLabel = telemetry?.statusLabel || (adherencePct ? `${adherencePct}% TRACK` : 'ON TRACK');
  const pillClass = telemetry?.pillClass || 'bg-white/[0.05] text-slate-300 border-white/08';
  const deltaText = telemetry?.deltaText;
  const status = telemetry?.status;

  const calPercent = targetCal > 0 ? Math.min(100, Math.round((avgCal / targetCal) * 100)) : 0;

  return (
    <div
      onClick={onClick}
      className="bg-[var(--card-bg)]/90 backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-2 min-[390px]:p-2.5 flex flex-col justify-between shadow-md cursor-pointer transition-all active:scale-[0.98] group h-full select-none"
      title="Click to view daily prescribed meals & macros pipeline"
    >
      {/* 1. Header: Label + Adherence/Variance Badge (Coach Magic Eye) */}
      <div className="flex items-center justify-between gap-1 text-[8.5px] min-[390px]:text-[9px] font-mono pb-1 border-b border-white/[0.05] flex-shrink-0">
        <span className="font-semibold text-slate-400 tracking-wider uppercase">NUTRITION</span>
        <span className={`px-1.5 py-0.5 rounded-md text-[7.5px] min-[390px]:text-[8px] font-bold whitespace-nowrap border ${pillClass}`}>
          {statusLabel}
        </span>
      </div>

      {!hasDietPlan ? (
        <div className="flex-1 flex flex-col items-center justify-center p-2 text-center font-mono">
          <span className="text-[10px] text-slate-400 font-semibold">NO DIET PLAN</span>
          <span className="text-[8px] text-slate-500 mt-0.5">Tap to assign protocol</span>
        </div>
      ) : (
        <>
          {/* 2. Hero Calories & Calorie Track (Single-Line Layout & Brand Identity) */}
          <div className="my-0.5 min-[390px]:my-1 flex flex-col gap-0.5 min-[390px]:gap-1 flex-shrink-0 font-mono">
            <div className="flex items-baseline justify-between sm:justify-center sm:gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-sm min-[390px]:text-base font-bold text-white tracking-tight">
                  {avgCal.toLocaleString()}
                </span>
                <span className="text-[9px] min-[390px]:text-[10px] text-slate-500 font-medium">
                  / {targetCal.toLocaleString()}
                </span>
                <span className="text-[7.5px] min-[390px]:text-[8px] text-slate-400 uppercase tracking-wider ml-0.5">
                  kcal
                </span>
              </div>
              {deltaText && deltaText !== '±0 kcal' ? (
                <span className="text-[8px] min-[390px]:text-[8.5px] font-semibold text-slate-300">
                  ({deltaText})
                </span>
              ) : (
                <span className="text-[7.5px] min-[390px]:text-[8px] text-slate-400 font-medium">
                  (On target)
                </span>
              )}
            </div>

            {/* Visual Calorie Track Bar */}
            <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 bg-[var(--main-color)]"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          {/* 3. 3 Macro Pillars - Clean, Natural, Unified Brand Typography */}
          <div className="grid grid-cols-3 gap-0.5 min-[390px]:gap-1 flex-1 min-h-0 my-0.5 min-[390px]:my-1 items-stretch">
            {/* Protein */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg min-[390px]:rounded-xl p-1 min-[390px]:p-1.5 flex flex-col items-center justify-between text-center">
              <span className="text-[7px] min-[390px]:text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
                PRO
              </span>
              <span className="text-[11px] min-[390px]:text-xs font-mono font-bold text-white block my-auto">
                {avgProt}g
              </span>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden" title={`${avgProt}g / ${targetProt}g`}>
                <div
                  className="h-full bg-[var(--main-color)] rounded-full"
                  style={{ width: `${Math.min(100, Math.round((avgProt / Math.max(1, targetProt)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg min-[390px]:rounded-xl p-1 min-[390px]:p-1.5 flex flex-col items-center justify-between text-center">
              <span className="text-[7px] min-[390px]:text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
                CARB
              </span>
              <span className="text-[11px] min-[390px]:text-xs font-mono font-bold text-white block my-auto">
                {avgCarb}g
              </span>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden" title={`${avgCarb}g / ${targetCarb}g`}>
                <div
                  className="h-full bg-white/40 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((avgCarb / Math.max(1, targetCarb)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg min-[390px]:rounded-xl p-1 min-[390px]:p-1.5 flex flex-col items-center justify-between text-center">
              <span className="text-[7px] min-[390px]:text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
                FAT
              </span>
              <span className="text-[11px] min-[390px]:text-xs font-mono font-bold text-white block my-auto">
                {avgFat}g
              </span>
              <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden" title={`${avgFat}g / ${targetFat}g`}>
                <div
                  className="h-full bg-white/20 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((avgFat / Math.max(1, targetFat)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 4. Bottom Directive (Single Line, No Wrap) */}
      <div className="pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[8px] font-mono text-slate-400 flex-shrink-0">
        <span className="truncate">
          {telemetry
            ? `${telemetry.loggedDaysCount}/${telemetry.totalDays} days logged • ${telemetry.adherencePct}% energy track`
            : `${adherencePct}% prescribed meals on track`}
        </span>
        <span className="text-[var(--main-color)] font-bold ml-1 opacity-80">
          &rarr;
        </span>
      </div>
    </div>
  );
};
