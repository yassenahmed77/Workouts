'use client';

import React from 'react';
import { WorkoutLog } from '@/types';

interface ProtocolReadinessCardProps {
  isSelectedDateToday: boolean;
  selectedDate: string;
  isEffectiveRestDay: boolean;
  onToggleRestDay: () => void;
  adherenceScore: number;
  motivationalQuote: string;
  isSelectedDateWorkoutCompleted: boolean;
  selectedDateWorkoutLog?: WorkoutLog | null;
  targetExercisesCount: number;
  habitsCompletedCount: number;
  habitsTotalCount: number;
}

export const ProtocolReadinessCard: React.FC<ProtocolReadinessCardProps> = React.memo(({
  isSelectedDateToday,
  selectedDate,
  isEffectiveRestDay,
  onToggleRestDay,
  adherenceScore,
  motivationalQuote,
  isSelectedDateWorkoutCompleted,
  selectedDateWorkoutLog,
  targetExercisesCount,
  habitsCompletedCount,
  habitsTotalCount
}) => {
  return (
    <div className="relative p-4 sm:p-5 rounded-3xl bg-[#18191e] border border-[#24262e] overflow-hidden shadow-lg">
      {/* Soft Warm Sunrise Glow in Top Arc Area */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 pointer-events-none opacity-40">
        <div className="w-full h-full rounded-b-full bg-gradient-to-b from-[#b88647]/30 via-[#36281a]/15 to-transparent blur-2xl" />
      </div>

      {/* Top Control Bar: Progress Title & Rest Day Light Switch */}
      <div className="relative z-10 flex items-center justify-between w-full mb-1.5">
        <span className="text-[11px] font-mono text-zinc-400 font-semibold tracking-wide truncate mr-2">
          {isSelectedDateToday ? "Today's Progress" : `Progress • ${selectedDate}`}
        </span>

        {/* Sleek iOS / Light-Switch Style Toggle: Grey (matfy) when OFF, Vibrant Green when ON */}
        <button
          type="button"
          role="switch"
          aria-checked={isEffectiveRestDay}
          aria-label="Toggle Rest Day"
          onClick={onToggleRestDay}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#121317] border border-[#24262e] hover:border-zinc-700 transition-all cursor-pointer group active:scale-95 flex-shrink-0"
        >
          <span
            className={`text-[11px] font-mono font-semibold transition-colors ${
              isEffectiveRestDay ? 'text-emerald-400 font-bold' : 'text-zinc-400 group-hover:text-zinc-200'
            }`}
          >
            Rest Day
          </span>

          {/* Switcher Track: Grey (matfy) when OFF, Vibrant Emerald Green when ON */}
          <div
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              isEffectiveRestDay
                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)] border border-emerald-400/40'
                : 'bg-[#2a2d36] border border-zinc-700/60'
            }`}
          >
            {/* Sliding Knob Circle */}
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                isEffectiveRestDay ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Horizon Arc SVG Gauge */}
        <div className="relative w-48 h-24 flex items-end justify-center overflow-hidden">
          <svg className="w-48 h-48 absolute top-0" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="sunriseHorizonGrad" x1="0%" y1="100%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#36281a" />
                <stop offset="50%" stopColor="#b88647" />
                <stop offset="100%" stopColor="#f3c88e" />
              </linearGradient>
            </defs>

            {/* Background Arc Track (Semi-circle top half) */}
            <path
              d="M 12 50 A 38 38 0 0 1 88 50"
              fill="none"
              stroke="#24262e"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Dynamic Gradient Horizon Arc */}
            <path
              d="M 12 50 A 38 38 0 0 1 88 50"
              fill="none"
              stroke="url(#sunriseHorizonGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="119.4"
              strokeDashoffset={119.4 - (119.4 * adherenceScore) / 100}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Score in Arc Center */}
          <div className="flex flex-col items-center mb-1">
            <span className="text-2xl font-black font-mono tabular-nums text-white tracking-tight leading-none">
              {adherenceScore}%
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f3c88e] font-semibold mt-1">
              Daily Progress
            </span>
          </div>
        </div>

        <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium mt-0.5 text-center leading-snug max-w-[280px]">
          {motivationalQuote}
        </p>

        {/* 3-Pill Daily Statistics Row (Sessions, Exercises, Habits) */}
        <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-[#24262e]/80">
          {/* Pill 1: Sessions */}
          <div className="p-2 rounded-xl bg-[#15161a] border border-[#24262e] text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8e8e93] block font-semibold">
              Sessions
            </span>
            <span className="text-xs font-mono font-bold text-white tabular-nums mt-0.5 block">
              {isEffectiveRestDay ? (
                <span className="text-amber-400">0 / 0</span>
              ) : (
                <>
                  <span className="text-[#2f80ed]">{isSelectedDateWorkoutCompleted ? 1 : 0}</span> / 1
                </>
              )}
            </span>
          </div>

          {/* Pill 2: Exercises */}
          <div className="p-2 rounded-xl bg-[#15161a] border border-[#24262e] text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8e8e93] block font-semibold">
              Exercises
            </span>
            <span className="text-xs font-mono font-bold text-white tabular-nums mt-0.5 block">
              {isEffectiveRestDay ? (
                <span className="text-[#8e8e93]">0 / 0</span>
              ) : isSelectedDateWorkoutCompleted && selectedDateWorkoutLog ? (
                <span className="text-[#2f80ed]">
                  {selectedDateWorkoutLog.completedExercises.length} / {targetExercisesCount || selectedDateWorkoutLog.completedExercises.length}
                </span>
              ) : (
                <>
                  <span className="text-[#2f80ed]">0</span> / {targetExercisesCount}
                </>
              )}
            </span>
          </div>

          {/* Pill 3: Habits */}
          <div className="p-2 rounded-xl bg-[#15161a] border border-[#24262e] text-center">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8e8e93] block font-semibold">
              Habits
            </span>
            <span className="text-xs font-mono font-bold text-white tabular-nums mt-0.5 block">
              <span className="text-[#2f80ed]">{habitsCompletedCount}</span> / {habitsTotalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
