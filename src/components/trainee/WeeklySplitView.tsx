'use client';

import React from 'react';
import { useGym } from '@/context/GymContext';
import { Calendar, Clock, Dumbbell, Flame, CheckCircle2, ShieldAlert } from 'lucide-react';

export const WeeklySplitView: React.FC = () => {
  const { currentUser, getPlanForUser } = useGym();

  if (!currentUser) return null;

  const plan = getPlanForUser(currentUser.id);

  if (!plan) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#111116] border border-zinc-800">
        <ShieldAlert className="w-10 h-10 mx-auto text-amber-400 mb-3" />
        <h3 className="text-base font-bold text-white">No Program Assigned</h3>
        <p className="text-xs text-zinc-400 mt-1">
          A customized workout split has not been assigned yet. Yassen Ahmed will assign your training split shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#111116] border border-[#22222d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
            Program Architecture
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            {plan.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            {plan.description || 'Targeted hypertrophy & progressive overload protocol.'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-numeric text-zinc-300">
          <div className="px-3.5 py-2 rounded-xl bg-[#09090c] border border-zinc-800 text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500">Days / Wk</span>
            <span className="text-sm font-bold text-white">{plan.daysPerWeek}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#09090c] border border-zinc-800 text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500">Weeks</span>
            <span className="text-sm font-bold text-purple-400">{plan.durationWeeks}</span>
          </div>
        </div>
      </div>

      {/* Days Stack */}
      <div className="space-y-4">
        {plan.days.map((day, idx) => (
          <div
            key={day.id}
            className={`rounded-2xl border transition-all overflow-hidden ${
              day.isRestDay ? 'bg-[#0b0b0f] border-zinc-900' : 'bg-[#111117] border-[#22222f]'
            }`}
          >
            {/* Day Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800/60">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-300 font-mono text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {day.dayName}
                  </h3>
                  {!day.isRestDay && (
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-numeric mt-0.5">
                      <span>{day.estimatedMinutes} Mins</span>
                      <span>•</span>
                      <span className="text-purple-400 font-mono">{day.targetMuscles.join(' / ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {day.isRestDay ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  REST DAY
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                  {day.exercises.length} MOVEMENTS
                </span>
              )}
            </div>

            {!day.isRestDay && day.exercises.length > 0 && (
              <div className="mt-4 space-y-2">
                {day.exercises.map((ex, exIdx) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-xl bg-[#0e0e14] border border-zinc-900 flex flex-col gap-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] flex items-center justify-center font-bold mt-0.5">
                          {exIdx + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white">
                              {ex.exerciseName}
                            </span>
                            {ex.alternativeExercise && (
                              <span className="text-[10px] px-2 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-900 font-medium">
                                Badeel: {ex.alternativeExercise}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                            {ex.targetMuscle} • {ex.equipment}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-zinc-400 font-numeric text-[11px] self-start sm:self-auto">
                        {ex.videoUrl && (
                          <a
                            href={ex.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded text-[10px] font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900 border border-blue-800/50 transition-colors inline-flex items-center gap-1"
                          >
                            <span>Video Guide ↗</span>
                          </a>
                        )}
                        <span>{ex.sets} Sets</span>
                        <span>•</span>
                        <span>{ex.targetReps} Reps</span>
                        <span>•</span>
                        <span>RPE {ex.targetRpe || '1-2'}</span>
                        <span>•</span>
                        <span className="text-purple-400">{ex.restSeconds}s Rest</span>
                      </div>
                    </div>

                    {ex.notes && (
                      <div className="mt-1 pl-7 text-[11px] text-zinc-400 italic">
                        <span className="text-purple-400 font-semibold not-italic">Form Cue: </span>
                        {ex.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
