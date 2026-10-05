'use client';

import React from 'react';
import { 
  UserHabit, 
  getTodayRecordForHabit, 
  calculateHabitStreak,
  getHabitWeekHistory 
} from '@/lib/habitsEngine';
import { 
  Flame, 
  Edit3, 
  Trash2, 
  Check, 
  Plus, 
  Minus 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RenderHabitIcon } from './RenderHabitIcon';

interface DailyHabitCardProps {
  habit: UserHabit;
  userId: string;
  onOpenEditModal: (habit: UserHabit) => void;
  onDeleteHabit: (habit: UserHabit) => void;
  onToggleBoolean: (habit: UserHabit) => void;
  onAdjustNumeric: (habit: UserHabit, delta: number) => void;
}

export const DailyHabitCard: React.FC<DailyHabitCardProps> = ({
  habit,
  userId,
  onOpenEditModal,
  onDeleteHabit,
  onToggleBoolean,
  onAdjustNumeric
}) => {
  const record = getTodayRecordForHabit(userId, habit);
  const streak = calculateHabitStreak(userId, habit.id);
  const weekHistory = getHabitWeekHistory(userId, habit.id);

  const pct = habit.type === 'boolean'
    ? (record.completed ? 100 : 0)
    : Math.min(100, Math.round((record.value / habit.targetValue) * 100));

  const handleToggleWithConfetti = () => {
    if (!record.completed) {
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.8 },
          colors: [habit.color || '#2f80ed', '#00f0ff', '#10b981']
        });
      } catch {
        // Safe fallback in test or SSR
      }
    }
    onToggleBoolean(habit);
  };

  const handleAdjustWithConfetti = (delta: number) => {
    const newVal = Math.max(0, record.value + delta);
    if (record.value < habit.targetValue && newVal >= habit.targetValue) {
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.8 },
          colors: [habit.color || '#2f80ed', '#00f0ff', '#10b981']
        });
      } catch {
        // Safe fallback
      }
    }
    onAdjustNumeric(habit, delta);
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3.5 ${
        record.completed
          ? 'bg-[#18191e] border-[#2f80ed]/40 shadow-lg shadow-[#2f80ed]/5'
          : 'bg-[#18191e] border-[#24262e] hover:border-zinc-700'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[#141519] border border-[#24262e] shadow-sm"
            style={{ color: habit.color || '#2f80ed' }}
          >
            <RenderHabitIcon iconKey={habit.iconKey} className="w-4 h-4" />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white tracking-tight leading-tight truncate">
                {habit.title}
              </h3>
              {streak > 0 && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/20 flex items-center gap-1 flex-shrink-0">
                  <Flame className="w-3 h-3 fill-current" />
                  {streak}d
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-medium truncate">
              {habit.category} • {habit.type === 'boolean' ? 'Daily Check' : `Goal: ${habit.targetValue} ${habit.unit}`}
            </p>
          </div>
        </div>

        {/* Edit & Delete Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onOpenEditModal(habit)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Edit Habit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteHabit(habit)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Delete Habit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7-Day Consistency Dots */}
      <div className="pt-2.5 border-t border-[#24262e]/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            7-Day Consistency
          </span>
          <span className="text-[10px] font-numeric text-zinc-400 font-bold">
            {weekHistory.filter((d) => d.completed).length} / 7 Days
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekHistory.map((day) => (
            <div 
              key={day.dateStr} 
              className="flex flex-col items-center gap-1"
              title={`${day.dateStr}: ${day.completed ? 'Completed' : day.isToday ? 'Today (Pending)' : 'Missed'}`}
            >
              <span className={`text-[9px] font-mono font-bold ${day.isToday ? 'text-[#2f80ed]' : 'text-zinc-500'}`}>
                {day.dayLabel}
              </span>
              <div 
                className={`w-full aspect-square max-w-[28px] rounded-lg flex items-center justify-center transition-all ${
                  day.completed 
                    ? 'shadow-sm text-white' 
                    : day.isToday 
                    ? 'border border-dashed border-[#2f80ed]/60 bg-[#141519]' 
                    : 'bg-[#141519] border border-[#24262e]'
                }`}
                style={day.completed ? { backgroundColor: habit.color || '#2f80ed' } : undefined}
              >
                {day.completed ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : (
                  <span className={`w-1 h-1 rounded-full ${day.isToday ? 'bg-[#2f80ed]' : 'bg-zinc-600'}`} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress & Tracking Section */}
      {habit.type === 'boolean' ? (
        <div className="flex items-center justify-between pt-2.5 border-t border-[#24262e] gap-3">
          <span className="text-xs text-zinc-400 font-medium truncate">
            {record.completed ? 'Protocol completed today' : 'Tap checkmark when done today'}
          </span>

          <button
            type="button"
            onClick={handleToggleWithConfetti}
            className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 flex-shrink-0 ${
              record.completed
                ? 'bg-[#2f80ed] text-white shadow-md shadow-[#2f80ed]/25'
                : 'bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] hover:border-zinc-600 text-zinc-500 hover:text-white'
            }`}
            aria-label={record.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      ) : (
        <div className="pt-2.5 border-t border-[#24262e] space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-numeric">
              <span className="text-xs sm:text-sm font-extrabold text-white">{record.value}</span>
              <span className="text-zinc-500">/ {habit.targetValue} {habit.unit}</span>
              <span className="text-[10px] font-mono font-bold text-[#2f80ed]">({pct}%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAdjustWithConfetti(-1)}
                className="w-7 h-7 rounded-lg bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] text-zinc-300 hover:text-white flex items-center justify-center font-bold transition-colors cursor-pointer active:scale-95"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustWithConfetti(1)}
                className="w-7 h-7 rounded-lg bg-[#2f80ed] hover:bg-[#3897f0] text-white flex items-center justify-center font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[#141519] overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${pct}%`,
                backgroundColor: habit.color || '#2f80ed'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
