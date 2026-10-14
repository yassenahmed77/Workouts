'use client';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export const ClientHabitsAttendanceCard = ({ weekAttendance, weekOffset, setWeekOffset }) => {
    return (<div className="gym-card space-y-2">
      {/* Header: Title + Week Navigation Arrows + Sessions & Adherence */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="gym-label-mono">
            WEEKLY ATTENDANCE
          </span>

          {/* Week Navigation Arrows */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/[0.06] rounded px-1 py-0.5">
            <button type="button" onClick={() => setWeekOffset((prev) => prev - 1)} className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer" title="Previous week">
              <ChevronLeft className="w-3 h-3"/>
            </button>
            <span className="text-slate-300 px-1 font-mono text-[9px]">
              {weekOffset === 0 ? 'This Week' : weekAttendance.dateRangeLabel}
            </span>
            <button type="button" onClick={() => setWeekOffset((prev) => prev + 1)} className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer" title="Next week">
              <ChevronRight className="w-3 h-3"/>
            </button>
            {weekOffset !== 0 && (<button type="button" onClick={() => setWeekOffset(0)} className="text-[8px] text-[var(--main-color)] hover:text-blue-400 ml-0.5 font-bold cursor-pointer" title="Reset to current week">
                Now
              </button>)}
          </div>
        </div>

        {/* Progress & Adherence */}
        <div className="flex items-center gap-2">
          <span className="gym-subtext font-mono">
            {weekAttendance.completedCount} / {weekAttendance.targetSessions} Sessions
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${weekAttendance.percentage >= 75
            ? 'gym-delta-pos'
            : weekAttendance.percentage >= 50
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'gym-delta-neutral'}`}>
            {weekAttendance.percentage}% Adherence
          </span>
        </div>
      </div>

      {/* 7-Days Heat-Strip */}
      <div className="grid grid-cols-7 gap-1">
        {weekAttendance.days.map((day) => {
            const isCompleted = day.hasWorkout;
            return (<div key={day.dateStr} className={`p-1.5 rounded-lg border text-center flex flex-col justify-between min-h-[54px] transition-all ${isCompleted
                    ? 'bg-emerald-500/[0.08] border-emerald-500/30'
                    : day.isToday
                        ? 'bg-white/[0.04] border-[var(--main-color)]/40 shadow-xs'
                        : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)]'}`}>
              {/* Top Row: Day Name & Calendar Date */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-0.5">
                <span className={day.isToday ? 'text-white font-bold' : ''}>
                  {day.dayName}
                </span>
                <span className={day.isToday ? 'text-[var(--main-color)] font-bold' : 'text-slate-500'}>
                  {day.dayNum}
                </span>
              </div>

              {/* Middle: Status */}
              <div className="mt-1">
                {isCompleted ? (<span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 block truncate">
                    Done
                  </span>) : day.isToday ? (<span className="text-[9px] font-mono text-[var(--main-color)] font-medium block">
                    Today
                  </span>) : (<span className="text-[9px] font-mono text-slate-600 block">
                    —
                  </span>)}
              </div>

              {/* Subtext: Workout Name snippet if completed */}
              <div className="mt-0.5 min-h-[12px]">
                {day.workoutTitle ? (<span className="text-[8px] font-mono text-slate-400 truncate block px-0.5" title={day.workoutTitle}>
                    {day.workoutTitle.replace(' - Strength Focus', '')}
                  </span>) : null}
              </div>
            </div>);
        })}
      </div>
    </div>);
};
