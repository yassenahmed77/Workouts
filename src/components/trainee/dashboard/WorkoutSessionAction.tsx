'use client';

import React from 'react';
import { WorkoutDay, WorkoutLog, WorkoutPlan } from '@/types';
import { useGym } from '@/context/GymContext';
import { isDayUnfinished } from '@/lib/activeWorkoutEngine';
import { CheckCircle2, RotateCcw, Trash2, Zap, Play } from 'lucide-react';

interface WorkoutSessionActionProps {
  isSelectedDateWorkoutCompleted: boolean;
  selectedDateWorkoutLog?: WorkoutLog | null;
  isSelectedDateToday: boolean;
  selectedDate: string;
  isDraftInProgress: boolean;
  activeDraft: any;
  activeDay?: WorkoutDay | null;
  plan?: WorkoutPlan | null;
  todayDateStr: string;
  onRestartClick: () => void;
  onDeleteClick: () => void;
  onResumeWorkout: () => void;
  onResetDraftAndStartFresh: () => void;
  onStartWorkout: () => void;
  onNavigateToSplit: () => void;
}

export const WorkoutSessionAction: React.FC<WorkoutSessionActionProps> = ({
  isSelectedDateWorkoutCompleted,
  selectedDateWorkoutLog,
  isSelectedDateToday,
  selectedDate,
  isDraftInProgress,
  activeDraft,
  activeDay,
  plan,
  todayDateStr,
  onRestartClick,
  onDeleteClick,
  onResumeWorkout,
  onResetDraftAndStartFresh,
  onStartWorkout,
  onNavigateToSplit
}) => {
  const { currentUser } = useGym();
  // Case 1: Workout is completed for the selected date
  if (isSelectedDateWorkoutCompleted && selectedDateWorkoutLog) {
    const mins = Math.round(selectedDateWorkoutLog.durationSeconds / 60);

    return (
      <div className="space-y-1.5 pt-1.5 border-t border-[#24262e]/60">
        <div className="px-3 py-2 rounded-xl bg-[#141d1a]/80 border border-emerald-500/25 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5] flex-shrink-0" />
            <span className="text-xs font-bold text-white">
              {isSelectedDateToday ? 'Workout Completed Today' : `Completed on ${selectedDate}`}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300">
              Done
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono tabular-nums block text-center mt-0.5">
            {mins}m • {selectedDateWorkoutLog.totalVolumeKg.toLocaleString()}kg Volume • {selectedDateWorkoutLog.completedExercises.length} Movements
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onRestartClick}
            className="py-2 px-2.5 rounded-lg bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] text-[11px] font-bold text-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restart Workout</span>
          </button>

          <button
            type="button"
            onClick={onDeleteClick}
            className="py-2 px-2.5 rounded-lg bg-[#141519] hover:bg-rose-950/25 border border-[#24262e] hover:border-rose-500/30 text-[11px] font-bold text-zinc-400 hover:text-rose-400 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete Log</span>
          </button>
        </div>
      </div>
    );
  }

  // Case 1.5: Workout was timed out / unfinished today due to inactivity
  const isUnfinished = currentUser && activeDay && isDayUnfinished(currentUser.id, activeDay.id);
  if (isUnfinished && !isSelectedDateWorkoutCompleted && !isDraftInProgress && isSelectedDateToday) {
    return (
      <div className="space-y-1.5 pt-1.5 border-t border-[#24262e]/60">
        <div className="px-3 py-2 rounded-xl bg-[#141519] border border-amber-500/25 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-xs font-bold text-white tracking-wide">Session Incomplete</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/25">
              TIMEOUT
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono block text-center mt-0.5">
            Not finished • Ended due to inactivity
          </span>
        </div>

        <button
          type="button"
          onClick={onStartWorkout}
          className="w-full py-2 px-3 rounded-lg bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] hover:border-[#2f80ed]/40 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#2f80ed]" />
          <span>RESTART SESSION</span>
        </button>
      </div>
    );
  }

  // Case 2: Draft is currently in progress for today
  if (isDraftInProgress && activeDraft && activeDay && isSelectedDateToday) {
    const completedSetsCount = activeDraft.exerciseLogs.reduce(
      (acc: number, ex: any) => acc + ex.sets.filter((s: any) => s.completed).length,
      0
    );
    const totalSetsCount = activeDraft.exerciseLogs.reduce(
      (acc: number, ex: any) => acc + ex.sets.length,
      0
    );
    const mins = Math.floor(activeDraft.elapsedSeconds / 60);
    const secs = activeDraft.elapsedSeconds % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    return (
      <div className="space-y-1.5 pt-1.5 border-t border-[#24262e]/60">
        <div className="px-3 py-2 rounded-xl bg-[#141519] border border-[#2f80ed]/25 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2f80ed] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2f80ed]"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-wide">Workout In Progress</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-[#2f80ed]/15 text-[#2f80ed] border border-[#2f80ed]/30">
              LIVE
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono tabular-nums block text-center mt-0.5">
            {completedSetsCount} / {totalSetsCount} Sets Logged • {timeStr}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-1.5">
          <button
            type="button"
            onClick={onResumeWorkout}
            className="py-2 px-3 rounded-lg btn-electric-blue text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RESUME WORKOUT</span>
          </button>

          <button
            type="button"
            onClick={onResetDraftAndStartFresh}
            className="w-8 h-8 rounded-lg bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
            title="Reset draft and start clean"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Scheduled Active Recovery / Rest Day
  if (activeDay?.isRestDay) {
    return (
      <div className="px-3 py-2 rounded-xl bg-[#141519] border border-[#24262e] text-center space-y-0.5">
        <span className="text-xs font-bold text-white block">Scheduled Active Recovery</span>
        <p className="text-[10px] text-zinc-400">Focus on hydration, protein intake, and 8 hours of sleep.</p>
      </div>
    );
  }

  // Case 4: Ready to Start or Preview Workout
  if (!activeDay) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (activeDay && plan) {
          onStartWorkout();
        } else {
          onNavigateToSplit();
        }
      }}
      className="w-full py-2.5 sm:py-3 px-4 rounded-xl btn-electric-blue text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all shadow-md shadow-[#2f80ed]/20"
    >
      <Play className="w-3.5 h-3.5 fill-current" />
      <span>
        {isSelectedDateToday
          ? 'START WORKOUT'
          : new Date(selectedDate + 'T00:00:00') < new Date(todayDateStr + 'T00:00:00')
            ? 'START OR LOG THIS WORKOUT'
            : 'PREVIEW OR START EARLY'
        }
      </span>
    </button>
  );
};
