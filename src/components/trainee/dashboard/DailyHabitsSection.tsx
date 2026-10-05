'use client';

import React, { useState, useEffect } from 'react';
import { HabitDailyRecord, QuitLiveStats, UserHabit } from '@/lib/habitsEngine';
import { User } from '@/types';
import { Check, X } from 'lucide-react';

interface DailyHabitsSectionProps {
  userHabits: UserHabit[];
  currentUser: User | null;
  onNavigateToHabits: () => void;
  onToggleHabit: (habit: UserHabit, nextCompleted: boolean, targetValue: number) => void;
  calculateQuitLiveStats: (habit: UserHabit) => QuitLiveStats;
  getTodayRecordForHabit: (userId: string, habit: UserHabit) => HabitDailyRecord;
  calculateHabitStreak: (userId: string, habitId: string) => number;
}

export const DailyHabitsSection: React.FC<DailyHabitsSectionProps> = React.memo(({
  userHabits,
  currentUser,
  onNavigateToHabits,
  onToggleHabit,
  calculateQuitLiveStats,
  getTodayRecordForHabit,
  calculateHabitStreak
}) => {
  // Live 1-second ticking timer for Quit / Sobriety live counters (isolated to this component only!)
  const [, setLiveTick] = useState(0);
  useEffect(() => {
    const hasQuitHabit = userHabits.some((h) => h.type === 'quit');
    if (!hasQuitHabit) return;
    const interval = setInterval(() => {
      setLiveTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [userHabits]);

  if (userHabits.length === 0) return null;

  return (
    <div className="p-3 rounded-2xl bg-[#18191e] border border-[#24262e] shadow-sm space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#24262e]/60">
        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          Daily Habits ({userHabits.length})
        </span>

        <button
          onClick={onNavigateToHabits}
          className="text-[11px] font-mono font-medium text-[#2f80ed] hover:underline cursor-pointer"
        >
          Manage
        </button>
      </div>

      {/* Habit Items */}
      <div className="space-y-1.5">
        {userHabits.slice(0, 4).map((habit) => {
          if (habit.type === 'quit') {
            const qStats = calculateQuitLiveStats(habit);
            return (
              <div
                key={habit.id}
                onClick={onNavigateToHabits}
                className="p-2.5 rounded-xl bg-[#141519] border border-[#24262e] hover:border-[#2f80ed]/40 transition-all cursor-pointer active:scale-98 space-y-1.5"
              >
                {/* Top Row: Habit Name & Percentage on Right */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white truncate block">{habit.title}</span>
                  <span className="text-[10px] font-mono font-bold text-[#2f80ed]">
                    {qStats.progressPercentage}%
                  </span>
                </div>

                {/* Progress Bar (Full Width, Sleek Minimal) */}
                <div className="w-full h-2 rounded-full bg-[#101114] border border-[#24262e] overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2f80ed] to-[#56ccf2] shadow-[0_0_8px_rgba(47,128,237,0.4)] transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, qStats.progressPercentage))}%` }}
                  />
                </div>

                {/* Under Progress: Start is elapsed time, End is target */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>{qStats.days}d {String(qStats.hours).padStart(2, '0')}h clean</span>
                  <span>Target: {qStats.targetDays}d</span>
                </div>
              </div>
            );
          }

          const record = currentUser ? getTodayRecordForHabit(currentUser.id, habit) : { completed: false, value: 0, habitId: habit.id, date: '', userId: '' };
          const streak = currentUser ? calculateHabitStreak(currentUser.id, habit.id) : 0;
          const hasTarget = habit.targetValue && (habit.type !== 'boolean' || habit.targetValue > 1 || (habit.unit && habit.unit !== 'done'));

          return (
            <div
              key={habit.id}
              onClick={() => {
                const next = !record.completed;
                const target = habit.targetValue || 1;
                onToggleHabit(habit, next, target);
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer group active:scale-98 space-y-1.5 ${
                record.completed
                  ? 'bg-[#2f80ed]/5 border-[#2f80ed]/25 hover:border-[#2f80ed]/40'
                  : 'bg-[#141519] border-[#24262e] hover:border-[#2f80ed]/40'
              }`}
            >
              {/* Top Row: Habit Name & Streak on Left, Switcher Sa7 / Ghalat on Right */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                  <span className={`text-xs font-bold block truncate transition-colors ${
                    record.completed ? 'text-zinc-400 line-through' : 'text-white'
                  }`}>
                    {habit.title}
                  </span>
                  {streak > 0 && (
                    <span className="text-[10px] text-zinc-400 font-mono flex-shrink-0">
                      • {streak}d
                    </span>
                  )}
                </div>

                {/* Switcher Sa7 & Ghalat (✓ / ✕) in Top Row at the End */}
                <div className="flex items-center p-0.5 rounded-md bg-[#18191e] border border-[#24262e] flex-shrink-0">
                  {/* Ghalat Button (✕) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (record.completed) {
                        onToggleHabit(habit, false, 0);
                      }
                    }}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                      !record.completed
                        ? 'bg-zinc-800 text-zinc-200 border border-zinc-700/80 shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                    title="Ghalat (Not Done)"
                    aria-label={`Mark ${habit.title} as incomplete`}
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>

                  {/* Sa7 Button (✓) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!record.completed) {
                        const target = habit.targetValue || 1;
                        onToggleHabit(habit, true, target);
                      }
                    }}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                      record.completed
                        ? 'bg-[#2f80ed] text-white border border-[#2f80ed] shadow-[0_0_6px_rgba(47,128,237,0.4)]'
                        : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                    title="Sa7 (Done)"
                    aria-label={`Mark ${habit.title} as complete`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Middle Row: Full Width Sleek Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#101114] border border-[#24262e] overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    record.completed
                      ? 'w-full bg-[#2f80ed] shadow-[0_0_8px_rgba(47,128,237,0.5)]'
                      : (habit.type !== 'boolean' && record.value > 0
                          ? 'bg-[#2f80ed]/70'
                          : 'w-0 bg-transparent')
                  }`}
                  style={
                    !record.completed && habit.type !== 'boolean' && record.value > 0
                      ? { width: `${Math.min(100, Math.round((record.value / (habit.targetValue || 1)) * 100))}%` }
                      : undefined
                  }
                />
              </div>

              {/* Under Progress Bar: Target Info in Simple Font */}
              {hasTarget && (
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>
                    {record.completed
                      ? `${habit.targetValue} ${habit.unit}`
                      : `${record.value || 0} ${habit.unit}`}
                  </span>
                  <span>Target: {habit.targetValue} {habit.unit}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
