'use client';

import React from 'react';
import { WorkoutDay, WorkoutLog, WorkoutPlan } from '@/types';
import { Clock, Check, ChevronRight } from 'lucide-react';
import { WorkoutSessionAction } from './WorkoutSessionAction';

interface TodayWorkoutCardProps {
  activeDay?: WorkoutDay | null;
  plan?: WorkoutPlan | null;
  selectedDate: string;
  todayDateStr: string;
  isSelectedDateToday: boolean;
  isEffectiveRestDay: boolean;
  isSelectedDateWorkoutCompleted: boolean;
  selectedDateWorkoutLog?: WorkoutLog | null;
  isDraftInProgress: boolean;
  activeDraft: any;
  onSelectSessionDay: (day: WorkoutDay) => void;
  onNavigateToSplit: () => void;
  onRestartWorkout: () => void;
  onDeleteLog: () => void;
  onResumeWorkout: () => void;
  onResetDraftAndStartFresh: () => void;
  onStartWorkout: () => void;
}

export const TodayWorkoutCard: React.FC<TodayWorkoutCardProps> = React.memo(({
  activeDay,
  plan,
  selectedDate,
  todayDateStr,
  isSelectedDateToday,
  isEffectiveRestDay,
  isSelectedDateWorkoutCompleted,
  selectedDateWorkoutLog,
  isDraftInProgress,
  activeDraft,
  onSelectSessionDay,
  onNavigateToSplit,
  onRestartWorkout,
  onDeleteLog,
  onResumeWorkout,
  onResetDraftAndStartFresh,
  onStartWorkout
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#18191e] border border-[#24262e] shadow-lg space-y-3.5">
      {/* Workout Card Header: Centered Session Title + Metadata with Divider Line underneath */}
      <div className="relative pb-3 border-b border-[#24262e] flex flex-col items-center justify-center text-center">
        {/* Right Status Badge (if completed) */}
        {isSelectedDateWorkoutCompleted && (
          <div className="absolute right-0 top-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold whitespace-nowrap">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Done</span>
            </span>
          </div>
        )}

        {/* 1. Session Name (Upper A, etc.) Centered */}
        <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate leading-tight w-full text-center">
          {isSelectedDateWorkoutCompleted && selectedDateWorkoutLog
            ? selectedDateWorkoutLog.dayName
            : isEffectiveRestDay
              ? 'Rest & Recovery Day'
              : activeDay ? activeDay.dayName : plan?.title || 'Daily Workout'
          }
        </h2>

        {/* 2. Metadata underneath: Date in small font + Duration + Movements - Centered */}
        <div className="flex items-center justify-center gap-2 mt-1.5 text-[11px] font-mono text-zinc-400 whitespace-nowrap overflow-x-auto no-scrollbar w-full">
          <span className={isSelectedDateToday ? 'text-[#2f80ed] font-semibold' : 'text-zinc-400'}>
            {isSelectedDateToday ? 'Today' : selectedDate}
          </span>

          {activeDay && !activeDay.isRestDay && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-zinc-300">
                <Clock className="w-3 h-3 text-[#2f80ed]" />
                <span>{activeDay.estimatedMinutes || 55}m</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300">{activeDay.exercises.length} Movements</span>
            </>
          )}
        </div>
      </div>

      {/* Exercises Preview (Compact 3-item list without taking excessive vertical space) */}
      {activeDay && !activeDay.isRestDay && activeDay.exercises.length > 0 && (
        <div className="space-y-1.5">
          {activeDay.exercises.slice(0, 3).map((ex, idx) => (
            <div
              key={ex.id}
              onClick={() => onSelectSessionDay(activeDay)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#15161a] border border-[#24262e]/70 hover:border-[#2f80ed]/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                <span className="w-5 h-5 rounded-md bg-[#1c1d22] text-[#2f80ed] font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 border border-[#24262e]">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                  {ex.exerciseName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] font-mono text-[#8e8e93] tabular-nums">
                  {ex.sets} × {ex.targetReps}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#2f80ed] transition-colors" />
              </div>
            </div>
          ))}

          {activeDay.exercises.length > 3 && (
            <button
              onClick={onNavigateToSplit}
              className="w-full text-center py-1 text-[11px] font-medium text-[#2f80ed] hover:underline cursor-pointer block"
            >
              + {activeDay.exercises.length - 3} more movements in split view
            </button>
          )}
        </div>
      )}

      {/* State-Aware Action Button / Completed State / Resume Draft */}
      <WorkoutSessionAction
        isSelectedDateWorkoutCompleted={isSelectedDateWorkoutCompleted}
        selectedDateWorkoutLog={selectedDateWorkoutLog}
        isSelectedDateToday={isSelectedDateToday}
        selectedDate={selectedDate}
        isDraftInProgress={isDraftInProgress}
        activeDraft={activeDraft}
        activeDay={activeDay}
        plan={plan}
        todayDateStr={todayDateStr}
        onRestartClick={onRestartWorkout}
        onDeleteClick={onDeleteLog}
        onResumeWorkout={onResumeWorkout}
        onResetDraftAndStartFresh={onResetDraftAndStartFresh}
        onStartWorkout={onStartWorkout}
        onNavigateToSplit={onNavigateToSplit}
      />
    </div>
  );
});
