'use client';

import React from 'react';
import { useGym } from '@/context/GymContext';
import { History, Calendar, Clock, Dumbbell, TrendingUp, CheckCircle2, MessageSquare } from 'lucide-react';

export const WorkoutHistoryView: React.FC = () => {
  const { currentUser, getUserLogs } = useGym();
  const logs = getUserLogs(currentUser.id);

  const totalVolume = logs.reduce((acc, l) => acc + l.totalVolumeKg, 0);
  const totalSeconds = logs.reduce((acc, l) => acc + l.durationSeconds, 0);

  const formatHoursMins = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-[#111116] border border-[#22222d]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Workouts</span>
            <History className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-bold font-numeric text-white mt-2">{logs.length}</p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Completed sessions</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111116] border border-[#22222d]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Volume Lifted</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-numeric text-purple-400 mt-2">
            {totalVolume.toLocaleString()} <span className="text-xs text-zinc-400">kg</span>
          </p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Cumulative workload</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111116] border border-[#22222d]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Time Under Tension</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-numeric text-cyan-300 mt-2">
            {formatHoursMins(totalSeconds)}
          </p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Recorded training time</span>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          Training Session History ({logs.length})
        </h3>

        {logs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#111116] border border-zinc-800">
            <History className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
            <h4 className="text-sm font-bold text-zinc-400">No workout sessions logged yet</h4>
            <p className="text-xs text-zinc-600 mt-1">
              Start a workout from Today's Session to log your weights, reps, and volume.
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const mins = Math.round(log.durationSeconds / 60);

            return (
              <div
                key={log.id}
                className="p-5 rounded-2xl bg-[#111116] border border-[#22222d] hover:border-purple-500/40 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">
                        {log.date}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs font-mono text-zinc-400 font-numeric">
                        {mins} minutes
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">
                      {log.dayName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-[#0d0d12] border border-zinc-800 text-right">
                      <span className="block text-[9px] font-mono uppercase text-zinc-500">Session Volume</span>
                      <span className="text-xs font-bold font-numeric text-purple-400">
                        {log.totalVolumeKg.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coach Feedback callout if present */}
                {log.coachFeedback && (
                  <div className="my-3 p-3 rounded-lg bg-purple-950/20 border border-purple-900/50 text-xs text-zinc-300 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-purple-400 block mb-0.5">
                        Coach Feedback
                      </span>
                      <p className="text-zinc-300">{log.coachFeedback}</p>
                    </div>
                  </div>
                )}

                {/* Completed Exercises Breakdown */}
                <div className="mt-3 space-y-2">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Completed Movements ({log.completedExercises.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {log.completedExercises.map((ex, idx) => {
                      const completedSets = ex.sets.filter((s) => s.completed);
                      const bestWeight = Math.max(...completedSets.map((s) => s.weightKg), 0);

                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#0d0d12] border border-zinc-900 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-zinc-200 block truncate max-w-[160px]">
                              {ex.exerciseName}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {completedSets.length} sets logged
                            </span>
                          </div>

                          {bestWeight > 0 && (
                            <span className="text-[11px] font-numeric font-bold text-purple-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                              {bestWeight} kg Top
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
