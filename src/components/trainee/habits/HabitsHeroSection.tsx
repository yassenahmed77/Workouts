'use client';

import React from 'react';

interface HabitsHeroSectionProps {
  summary: {
    todayCompletedCount: number;
    todayTotalCount: number;
    adherencePercentage: number;
    activeStreak: number;
  };
  quitSavings: {
    totalSaved: number;
    currency: string;
  };
  totalHabitsCount: number;
}

export const HabitsHeroSection: React.FC<HabitsHeroSectionProps> = ({
  summary,
  quitSavings,
  totalHabitsCount
}) => {
  const { todayCompletedCount, todayTotalCount, adherencePercentage, activeStreak } = summary;

  // Arc math for SVG circular dial
  const radius = 42;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const safePercentage = Math.min(100, Math.max(0, adherencePercentage));
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  // Motivational message
  const getMotivationalMessage = () => {
    if (totalHabitsCount === 0) return 'Add your first habit protocol below to start your streak.';
    if (safePercentage === 100 && todayTotalCount > 0) return 'Flawless discipline! 100% protocols locked in today.';
    if (safePercentage >= 50) return 'Strong momentum! You are crushing your daily standard.';
    if (todayCompletedCount > 0) return 'Great start! Keep the chain unbroken.';
    return 'Make today count. Check off your first habit protocol.';
  };

  return (
    <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#18191e] to-[#141519] border border-[#24262e] p-4 sm:p-5 shadow-2xl overflow-hidden space-y-3.5">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#2f80ed]/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00f0ff]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Hero Header + Radial Dial Row */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-3 sm:gap-4">
        {/* Left Side: Message & Title */}
        <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
            Daily Execution & Focus
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium max-w-md">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Right Side: Circular Radial Progress Dial */}
        <div className="flex items-center justify-center flex-shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="habitsHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2f80ed" />
                  <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
              </defs>

              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#1f2129"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {/* Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#habitsHeroGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(47, 128, 237, 0.45))'
                }}
              />
            </svg>

            {/* Inner Percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center font-numeric select-none">
              <span className="text-lg sm:text-xl font-black text-white leading-none tracking-tight">
                {safePercentage}%
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
                {todayCompletedCount}/{todayTotalCount} Done
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Badges Bar (Zero Icons - Swiss Tabular Clarity - Centered) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-2 border-t border-[#24262e] relative z-10 font-numeric">
        {/* Streak Tile */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#141519]/80 border border-[#24262e] flex flex-col items-center justify-center text-center w-full">
          <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-zinc-500 truncate mb-0.5 text-center w-full block">
            Streak
          </span>
          <div className="flex items-baseline justify-center text-center w-full gap-1">
            <span className="text-xs sm:text-sm font-black text-white">
              {activeStreak}
            </span>
            <span className="text-[9px] text-zinc-400 font-mono">
              {activeStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* Today's Protocols */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#141519]/80 border border-[#24262e] flex flex-col items-center justify-center text-center w-full">
          <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-zinc-500 truncate mb-0.5 text-center w-full block">
            Today
          </span>
          <div className="flex items-baseline justify-center text-center w-full gap-1">
            <span className="text-xs sm:text-sm font-black text-white">
              {todayCompletedCount}
            </span>
            <span className="text-[9px] text-zinc-400 font-mono">
              / {todayTotalCount} done
            </span>
          </div>
        </div>

        {/* Savings or Rate Tile */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#141519]/80 border border-[#24262e] flex flex-col items-center justify-center text-center w-full">
          <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-zinc-500 truncate mb-0.5 text-center w-full block">
            {quitSavings.totalSaved > 0 ? 'Total Saved' : 'Adherence'}
          </span>
          <div className="flex items-baseline justify-center text-center w-full gap-1 truncate">
            <span className="text-xs sm:text-sm font-black text-white truncate">
              {quitSavings.totalSaved > 0 ? quitSavings.totalSaved.toLocaleString() : `${safePercentage}%`}
            </span>
            <span className="text-[8px] text-zinc-400 font-mono">
              {quitSavings.totalSaved > 0 ? quitSavings.currency : 'rate'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
