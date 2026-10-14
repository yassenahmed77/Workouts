'use client';
import React from 'react';
import { Clock, Check, ChevronRight } from 'lucide-react';
import { WorkoutSessionAction } from './WorkoutSessionAction';
export const TodayWorkoutCard = React.memo(({ activeDay, plan, selectedDate, todayDateStr, isSelectedDateToday, isEffectiveRestDay, isSelectedDateWorkoutCompleted, selectedDateWorkoutLog, isDraftInProgress, activeDraft, onSelectSessionDay, onNavigateToSplit, onRestartWorkout, onDeleteLog, onResumeWorkout, onResetDraftAndStartFresh, onStartWorkout }) => {
    return (<div className="gym-card-elevated space-y-3 p-3.5 sm:p-4 rounded-2xl border-[var(--gym-border-base)]">
      {/* Workout Card Header: Centered Session Title + Metadata with Divider Line underneath */}
      <div className="relative pb-2.5 border-b border-[var(--gym-border-subtle)] flex flex-col items-center justify-center text-center">
        {/* Right Status Badge (if completed) */}
        {isSelectedDateWorkoutCompleted && (<div className="absolute right-0 top-0">
            <span className="gym-delta-pos">
              <Check className="w-3 h-3 stroke-[3]"/>
              <span>Done</span>
            </span>
          </div>)}

        {/* 1. Session Name (Upper A, etc.) Centered */}
        <h2 className="gym-heading-card truncate leading-tight w-full text-center">
          {isSelectedDateWorkoutCompleted && selectedDateWorkoutLog
            ? selectedDateWorkoutLog.dayName
            : isEffectiveRestDay
                ? 'Rest & Recovery Day'
                : activeDay ? activeDay.dayName : plan?.title || 'Daily Workout'}
        </h2>

        {/* 2. Metadata underneath: Date in small font + Duration + Movements - Centered */}
        <div className="flex items-center justify-center gap-2 mt-1 text-[11px] font-mono text-[var(--gym-text-muted)] whitespace-nowrap overflow-x-auto no-scrollbar w-full">
          <span className={isSelectedDateToday ? 'text-[var(--gym-accent-primary)] font-semibold' : 'text-[var(--gym-text-muted)]'}>
            {isSelectedDateToday ? 'Today' : selectedDate}
          </span>

          {activeDay && !activeDay.isRestDay && (<>
              <span className="text-[var(--gym-border-base)]">•</span>
              <span className="flex items-center gap-1 text-[var(--gym-text-secondary)]">
                <Clock className="w-3 h-3 text-[var(--gym-accent-primary)]"/>
                <span>{activeDay.estimatedMinutes || 55}m</span>
              </span>
              <span className="text-[var(--gym-border-base)]">•</span>
              <span className="text-[var(--gym-text-secondary)]">{activeDay.exercises.length} Movements</span>
            </>)}
        </div>
      </div>

      {/* Exercises Preview (Compact 3-item list without taking excessive vertical space) */}
      {activeDay && !activeDay.isRestDay && activeDay.exercises.length > 0 && (<div className="space-y-1.5">
          {activeDay.exercises.slice(0, 3).map((ex, idx) => (<div key={ex.id} onClick={() => onSelectSessionDay(activeDay)} className="flex items-center justify-between p-2 rounded-lg bg-[var(--gym-surface-base)] border border-[var(--gym-border-subtle)] hover:border-[var(--gym-accent-primary)]/40 transition-colors cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <span className="w-5 h-5 rounded bg-[var(--gym-surface-hover)] text-[var(--gym-accent-primary)] font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 border border-[var(--gym-border-base)]">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-[var(--gym-text-secondary)] group-hover:text-white truncate">
                  {ex.exerciseName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] font-mono text-[var(--gym-text-muted)] tabular-nums">
                  {ex.sets} × {ex.targetReps}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--gym-text-muted)] group-hover:text-[var(--gym-accent-primary)] transition-colors"/>
              </div>
            </div>))}

          {activeDay.exercises.length > 3 && (<button onClick={onNavigateToSplit} className="w-full text-center py-1 text-[11px] font-medium text-[var(--main-color)] hover:underline cursor-pointer block">
              + {activeDay.exercises.length - 3} more movements in split view
            </button>)}
        </div>)}

      {/* State-Aware Action Button / Completed State / Resume Draft */}
      <WorkoutSessionAction isSelectedDateWorkoutCompleted={isSelectedDateWorkoutCompleted} selectedDateWorkoutLog={selectedDateWorkoutLog} isSelectedDateToday={isSelectedDateToday} selectedDate={selectedDate} isDraftInProgress={isDraftInProgress} activeDraft={activeDraft} activeDay={activeDay} plan={plan} todayDateStr={todayDateStr} onRestartClick={onRestartWorkout} onDeleteClick={onDeleteLog} onResumeWorkout={onResumeWorkout} onResetDraftAndStartFresh={onResetDraftAndStartFresh} onStartWorkout={onStartWorkout} onNavigateToSplit={onNavigateToSplit}/>
    </div>);
});
