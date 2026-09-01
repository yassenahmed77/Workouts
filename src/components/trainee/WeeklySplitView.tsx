'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { WorkoutDay } from '@/types';
import { LiveWorkoutSession } from './LiveWorkoutSession';
import { ShieldAlert, Play, ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';

export const WeeklySplitView: React.FC = () => {
  const { currentUser, getPlanForUser, getUserLogs } = useGym();
  const [activeLiveDay, setActiveLiveDay] = useState<WorkoutDay | null>(null);

  if (!currentUser) return null;

  const plan = getPlanForUser(currentUser.id);
  const userLogs = getUserLogs(currentUser.id);

  // If currently tracking a live workout session
  if (activeLiveDay && plan) {
    return (
      <LiveWorkoutSession
        plan={plan}
        day={activeLiveDay}
        onExit={() => setActiveLiveDay(null)}
        onSessionCompleted={() => setActiveLiveDay(null)}
      />
    );
  }

  if (!plan) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#12131a] border border-[#232530] max-w-2xl mx-auto">
        <ShieldAlert className="w-10 h-10 mx-auto text-amber-400 mb-3" />
        <h3 className="text-base font-bold text-white">No Program Assigned</h3>
        <p className="text-xs text-zinc-400 mt-1">
          A customized workout split has not been assigned yet. Coach Yassen Ahmed will assign your training split shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto pb-28">
      {/* Top Program Banner */}
      <div className="p-5 rounded-3xl bg-[#111218] border border-[#212330] flex flex-col justify-between gap-3 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6b00] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20">
            Training Routine
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1.5">
            {plan.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {plan.description || 'Targeted hypertrophy & progressive overload protocol.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-numeric text-zinc-300 pt-2 border-t border-[#1e202c]">
          <div className="flex-1 px-3 py-2 rounded-2xl bg-[#09090b] border border-[#212330] text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Days / Wk</span>
            <span className="text-sm font-extrabold text-white">{plan.daysPerWeek}</span>
          </div>
          <div className="flex-1 px-3 py-2 rounded-2xl bg-[#09090b] border border-[#212330] text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Duration</span>
            <span className="text-sm font-extrabold text-[#ff6b00]">{plan.durationWeeks} Wks</span>
          </div>
        </div>
      </div>

      {/* Days Stack with Direct Start Workout CTAs */}
      <div className="space-y-5">
        {plan.days.map((day, idx) => (
          <div
            key={day.id}
            className={`rounded-3xl border transition-all overflow-hidden shadow-xl ${
              day.isRestDay ? 'bg-[#0a0a0d] border-[#1e202a]' : 'bg-[#111218] border-[#212330]'
            }`}
          >
            {/* Day Header with generous spacing before Start button */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-6 border-b border-[#1e202a]">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-10 h-10 rounded-2xl bg-[#1c1d27] border border-[#2e303d] text-[#ff6b00] font-mono text-sm font-black flex items-center justify-center flex-shrink-0 shadow-inner self-center">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex flex-col justify-center">
                  <h3 className="text-base font-extrabold text-white tracking-tight leading-tight truncate">
                    {day.dayName}
                  </h3>
                  {!day.isRestDay && (
                    <div className="flex items-center gap-3 font-numeric mt-1.5">
                      {/* 60 centered over Mins */}
                      <div className="flex flex-col items-center text-center">
                        <span className="font-black text-zinc-200 text-xs leading-none">
                          {day.estimatedMinutes}
                        </span>
                        <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold leading-none mt-0.5">
                          Mins
                        </span>
                      </div>

                      <span className="text-zinc-600 font-bold text-xs self-center">•</span>

                      {/* 10 centered directly over Movements */}
                      <div className="flex flex-col items-center text-center">
                        <span className="font-black text-[#ff6b00] text-xs leading-none font-mono">
                          {day.exercises.length}
                        </span>
                        <span className="text-[9px] font-mono uppercase text-[#ff6b00]/90 font-bold leading-none mt-0.5">
                          Movements
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {day.isRestDay ? (
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#1c1d27] text-zinc-400 border border-[#2e303d] flex-shrink-0">
                  REST DAY
                </span>
              ) : (() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isDoneToday = userLogs.some(
                  (l) => l.date === todayStr && (l.dayId === day.id || l.dayName === day.dayName)
                );

                return (
                  <div className="flex items-center gap-2 flex-shrink-0 ml-auto self-center">
                    {isDoneToday && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Done</span>
                      </span>
                    )}
                    <button
                      onClick={() => setActiveLiveDay(day)}
                      className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all ${
                        isDoneToday
                          ? 'bg-[#1c1d27] hover:bg-[#282a38] text-[#ff6b00] border border-[#ff6b00]/30'
                          : 'btn-orange'
                      }`}
                    >
                      {isDoneToday ? (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          <span>Restart</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>

            {!day.isRestDay && day.exercises.length > 0 && (() => {
              // Group exercises by target muscle group and aggregate total sets
              const muscleSummary = day.exercises.reduce((acc, ex) => {
                const muscle = ex.targetMuscle || 'General';
                if (!acc[muscle]) {
                  acc[muscle] = {
                    muscleName: muscle,
                    totalSets: 0,
                    exerciseCount: 0
                  };
                }
                acc[muscle].totalSets += (ex.sets || 3);
                acc[muscle].exerciseCount += 1;
                return acc;
              }, {} as Record<string, { muscleName: string; totalSets: number; exerciseCount: number }>);

              const muscleGroupsList = Object.values(muscleSummary);

              return (
                <div className="p-4 sm:p-5 space-y-2.5">
                  {muscleGroupsList.map((mg, mgIdx) => (
                    <div
                      key={mg.muscleName}
                      onClick={() => setActiveLiveDay(day)}
                      className="p-3.5 sm:p-4 px-4 sm:px-5 rounded-2xl bg-[#09090b] border border-[#1e202c] hover:border-[#ff6b00]/40 hover:bg-[#14151e] transition-all cursor-pointer flex items-center justify-between gap-4 text-xs group shadow-sm"
                    >
                      {/* Left: Fixed-width Badge + Consistent Muscle Name alignment */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-[#171822] border border-[#252736] text-[#ff6b00] font-mono text-xs font-black flex items-center justify-center flex-shrink-0 shadow-inner">
                          {mgIdx + 1}
                        </span>
                        <span className="font-extrabold text-white text-sm sm:text-base leading-none truncate group-hover:text-[#ff6b00] transition-colors">
                          {mg.muscleName}
                        </span>
                      </div>

                      {/* Right: Centered Sets Badge & Chevron */}
                      <div className="flex items-center gap-2.5 text-zinc-300 font-numeric text-xs flex-shrink-0">
                        <span className="px-3 py-1.5 rounded-xl bg-[#161722] border border-[#252736] font-mono font-bold text-[#ff6b00] text-xs leading-none flex items-center justify-center">
                          {mg.totalSets} Sets
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#ff6b00] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};
