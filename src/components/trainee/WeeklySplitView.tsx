'use client';

import React from 'react';
import { useGym } from '@/context/GymContext';
import { Calendar, Clock, Dumbbell, Flame, CheckCircle2, ShieldAlert } from 'lucide-react';

export const WeeklySplitView: React.FC = () => {
  const { currentUser, getPlanForUser } = useGym();
  const plan = getPlanForUser(currentUser.id);

  if (!plan) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#111116] border border-zinc-800">
        <ShieldAlert className="w-10 h-10 mx-auto text-amber-400 mb-3" />
        <h3 className="text-base font-bold text-white">No Program Assigned</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Your coach has not assigned a workout split yet. Contact your coach or switch to Coach View to assign one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#111116] border border-[#22222d]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                {plan.level}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {plan.durationWeeks} Weeks Cycle
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">
              {plan.title}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              {plan.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-[#09090c] border border-zinc-800 text-center">
              <span className="block text-[9px] font-mono uppercase text-zinc-500">Days / Wk</span>
              <span className="text-sm font-bold font-numeric text-white">{plan.daysPerWeek}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Days Breakdown */}
      <div className="space-y-4">
        {plan.days.map((day, dIdx) => (
          <div
            key={day.id}
            className="p-5 rounded-2xl bg-[#111116] border border-[#22222d]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-zinc-800 text-purple-400 font-mono text-xs font-bold flex items-center justify-center">
                  D{dIdx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {day.dayName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                    {day.isRestDay ? (
                      <span className="text-zinc-500 font-medium">Recovery & Regeneration</span>
                    ) : (
                      <>
                        <span className="font-mono text-zinc-300">{day.targetMuscles.join(', ')}</span>
                        <span>•</span>
                        <span className="font-numeric">{day.estimatedMinutes} mins</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {day.isRestDay ? (
                <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-zinc-800 text-zinc-500 self-start sm:self-auto">
                  Active Recovery
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-purple-950/60 text-purple-300 font-semibold border border-purple-800/50 self-start sm:self-auto">
                  {day.exercises.length} Movements Prescribed
                </span>
              )}
            </div>

            {/* Exercises table */}
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
                        <span>RPE {ex.targetRpe || 8}</span>
                        <span>•</span>
                        <span className="text-purple-400">{ex.restSeconds}s Rest</span>
                      </div>
                    </div>

                    {ex.notes && (
                      <div className="mt-1 pl-7 text-[11px] text-zinc-400 italic">
                        <span className="text-purple-400 font-semibold not-italic">Coach Cue: </span>
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
