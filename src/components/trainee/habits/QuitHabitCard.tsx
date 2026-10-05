'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserHabit, 
  calculateQuitLiveStats 
} from '@/lib/habitsEngine';
import { 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Wallet, 
  CigaretteOff, 
  Clock, 
  TrendingUp, 
  ChevronDown 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '@/context/ToastContext';
import { RenderHabitIcon } from './RenderHabitIcon';

interface QuitHabitCardProps {
  habit: UserHabit;
  onOpenRelapseModal: (habit: UserHabit) => void;
  onOpenEditModal: (habit: UserHabit) => void;
  onDeleteHabit: (habit: UserHabit) => void;
}

export const QuitHabitCard: React.FC<QuitHabitCardProps> = ({
  habit,
  onOpenRelapseModal,
  onOpenEditModal,
  onDeleteHabit
}) => {
  const { showToast } = useToast();
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false);

  // Localized live ticking interval for high-precision live countdown
  // Automatically destroyed when card is unmounted
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 1000000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = calculateQuitLiveStats(habit);
  const isSmoking = 
    habit.quitConfig?.quitCategory === 'smoking' || 
    habit.title.toLowerCase().includes('smoke') || 
    habit.title.toLowerCase().includes('cig');

  // SVG Circular Radial Progress Math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, stats.progressPercentage));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative rounded-3xl bg-[#18191e] border border-[#24262e] p-4 sm:p-5 shadow-xl overflow-hidden space-y-4">
      {/* Subtle Ambient Glow */}
      <div 
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-15"
        style={{ backgroundColor: stats.currentStage.color || habit.color || '#2f80ed' }}
      />

      {/* 1. Header: Full-Width Title & Icon (Row 1), Goal Info & Actions (Row 2) */}
      <div className="space-y-2.5 relative z-10 pb-2.5 border-b border-[#24262e]">
        {/* Row 1: Full-Width Icon + Title (No Truncation) */}
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/25 shadow-sm"
          >
            <RenderHabitIcon iconKey={habit.iconKey} className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight break-words">
              {habit.title}
            </h2>
            <span className="text-[10px] text-zinc-400 font-medium block mt-0.5">
              Sobriety & Recovery Goal
            </span>
          </div>
        </div>

        {/* Row 2: Target Goal on Left, Action Buttons on Right */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-zinc-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] bg-white/[0.04] border border-[#24262e]">
              <span>{stats.targetDays} Days Goal</span>
            </span>
            <span className="text-zinc-400 font-mono text-[10px] font-bold whitespace-nowrap">
              {stats.progressPercentage}% Done
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onOpenRelapseModal(habit)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-95"
              title="Reset Timer (Relapse)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenEditModal(habit)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-95"
              title="Edit Habit"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteHabit(habit)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-95"
              title="Delete Habit"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Circular Radial Progress Dial */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141519] border border-[#24262e] relative z-10 flex flex-col items-center justify-center">
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            <defs>
              <linearGradient id={`circleGrad-${habit.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2f80ed" />
                <stop offset="100%" stopColor="#00f0ff" />
              </linearGradient>
            </defs>

            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#24262e"
              strokeWidth="9"
              fill="transparent"
            />

            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={`url(#circleGrad-${habit.id})`}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px rgba(47, 128, 237, 0.45))`
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-numeric select-none">
            <span className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">
              {stats.days}
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 mt-1">
              {stats.days === 1 ? 'DAY CLEAN' : 'DAYS CLEAN'}
            </span>

            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#18191e] border border-[#24262e] text-[10px] font-mono font-bold text-[#2f80ed] tracking-wider">
              {String(stats.hours).padStart(2, '0')}:{String(stats.minutes).padStart(2, '0')}:{String(stats.seconds).padStart(2, '0')}
            </div>

            <span className="text-[10px] font-mono text-emerald-400 font-extrabold mt-1">
              {stats.progressPercentage}%
            </span>
          </div>
        </div>

        {/* Removed duplicate "Target 90 Days Clean" since it is already in the header goal badge */}
        {stats.nextMilestone && (
          <div className="w-full mt-2.5 pt-2 border-t border-[#24262e] text-center text-xs font-mono">
            <span className="text-[#2f80ed] font-bold text-[11px]">
              Next milestone in {stats.nextMilestone.remainingDays > 0 ? `${stats.nextMilestone.remainingDays}d ` : ''}{stats.nextMilestone.remainingHours}h {stats.nextMilestone.remainingMinutes}m
            </span>
          </div>
        )}
      </div>

      {/* 3. Simplified Financial & Physical Impact Tiles (Differentiated Header vs Value) */}
      <div className="grid grid-cols-2 gap-2 font-numeric relative z-10 text-xs">
        {/* Tile 1: Saved So Far */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#141519] border border-[#24262e] flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2f80ed]/10 text-[#2f80ed] flex items-center justify-center font-bold flex-shrink-0">
            <Wallet className="w-3 h-3" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-wider truncate block">
              Saved So Far
            </span>
            <span className="text-xs sm:text-sm font-black text-white truncate block">
              {stats.moneySaved.toLocaleString()} <span className="text-[10px] text-zinc-400 font-mono font-medium">{stats.currency}</span>
            </span>
          </div>
        </div>

        {/* Tile 2: Cigs / Units Avoided */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#141519] border border-[#24262e] flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2f80ed]/10 text-[#2f80ed] flex items-center justify-center font-bold flex-shrink-0">
            <CigaretteOff className="w-3 h-3" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-wider truncate block">
              {isSmoking ? 'Cigs Avoided' : 'Units Avoided'}
            </span>
            <span className="text-xs sm:text-sm font-black text-white truncate block">
              {stats.exactCigarettesAvoided.toLocaleString()} <span className="text-[10px] text-zinc-400 font-mono font-medium">{isSmoking ? 'cigs' : stats.unitLabel}</span>
            </span>
          </div>
        </div>

        {/* Tile 3: Time Gained / Monthly Savings */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#141519] border border-[#24262e] flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2f80ed]/10 text-[#2f80ed] flex items-center justify-center font-bold flex-shrink-0">
            <Clock className="w-3 h-3" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-wider truncate block">
              {isSmoking ? 'Time Gained' : 'Monthly Savings'}
            </span>
            <span className="text-xs sm:text-sm font-black text-white truncate block">
              {isSmoking ? `+${stats.lifeHoursRegained}` : stats.projectedMonthlySavings.toLocaleString()} <span className="text-[10px] text-zinc-400 font-mono font-medium">{isSmoking ? 'Hours' : stats.currency}</span>
            </span>
          </div>
        </div>

        {/* Tile 4: 1-Year Savings */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#141519] border border-[#24262e] flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2f80ed]/10 text-[#2f80ed] flex items-center justify-center font-bold flex-shrink-0">
            <TrendingUp className="w-3 h-3" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-wider truncate block">
              1-Year Savings
            </span>
            <span className="text-xs sm:text-sm font-black text-white truncate block">
              {stats.projectedYearlySavings.toLocaleString()} <span className="text-[10px] text-zinc-400 font-mono font-medium">{stats.currency}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Health & Recovery Insight (Zero Icon - Clean Typography) */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#141519] border border-[#24262e] relative z-10 space-y-1">
        <p className="text-xs text-zinc-300 font-medium leading-relaxed">
          {stats.healthBenefitCue}
        </p>
        {habit.quitConfig?.motivationReason && (
          <p className="text-[11px] text-zinc-400 italic">
            "{habit.quitConfig.motivationReason}"
          </p>
        )}
      </div>

      {/* 5. Milestone Badges Collapsible (Default Closed) */}
      <div className="relative z-10 rounded-xl bg-[#141519] border border-[#24262e] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsMilestonesOpen(!isMilestonesOpen)}
          className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Milestone Badges ({stats.milestones.filter((m) => m.achieved).length}/{stats.milestones.length})
          </span>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="text-[10px] text-zinc-500 font-mono">
              {isMilestonesOpen ? 'Hide' : 'Show'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMilestonesOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isMilestonesOpen && (
          <div className="p-2.5 sm:p-3 pt-0 border-t border-[#24262e] grid grid-cols-2 sm:grid-cols-3 gap-1.5 animate-in fade-in duration-150">
            {stats.milestones.map((m) => (
              <button
                key={m.days}
                type="button"
                onClick={() => {
                  if (m.achieved) {
                    try {
                      confetti({
                        particleCount: 40,
                        spread: 50,
                        origin: { y: 0.65 },
                        colors: ['#2f80ed', '#00f0ff', '#ffffff']
                      });
                    } catch {}
                    showToast(`Milestone Achieved: ${m.label} Clean!`, 'success');
                  } else {
                    showToast(`Locked: Reach ${m.label} to unlock!`, 'info');
                  }
                }}
                className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer text-left active:scale-95 ${
                  m.achieved
                    ? 'bg-[#18191e] text-[#2f80ed] border-[#2f80ed]/40'
                    : 'bg-[#141519] text-zinc-600 border-[#24262e]'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] ${
                  m.achieved ? 'bg-[#2f80ed]/20 text-[#2f80ed]' : 'bg-[#18191e] text-zinc-600'
                }`}>
                  {m.achieved ? '✓' : '•'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`block text-[11px] truncate font-extrabold ${m.achieved ? 'text-white' : 'text-zinc-500'}`}>
                    {m.label}
                  </span>
                  <span className={`text-[8px] block font-medium ${m.achieved ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {m.achieved ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
