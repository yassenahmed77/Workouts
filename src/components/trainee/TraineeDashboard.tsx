'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { WorkoutPlan, WorkoutDay } from '@/types';
import { LiveWorkoutSession } from './LiveWorkoutSession';
import { 
  Flame, 
  Calendar, 
  Dumbbell, 
  Clock, 
  CheckCircle2, 
  Play, 
  AlertCircle, 
  TrendingUp, 
  Award,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface TraineeDashboardProps {
  onNavigateToSplit: () => void;
  onNavigateToHistory: () => void;
}

export const TraineeDashboard: React.FC<TraineeDashboardProps> = ({
  onNavigateToSplit,
  onNavigateToHistory
}) => {
  const { currentUser, getPlanForUser, getUserLogs } = useGym();
  const [activeSessionDay, setActiveSessionDay] = useState<WorkoutDay | null>(null);

  const plan = getPlanForUser(currentUser.id);
  const userLogs = getUserLogs(currentUser.id);

  // If live workout mode is running
  if (activeSessionDay && plan) {
    return (
      <LiveWorkoutSession
        plan={plan}
        day={activeSessionDay}
        onExit={() => setActiveSessionDay(null)}
        onSessionCompleted={() => {
          setActiveSessionDay(null);
          onNavigateToHistory();
        }}
      />
    );
  }

  // Today's suggested workout: take first non-rest day or rotate
  const todayWorkoutDay = plan?.days.find((d) => !d.isRestDay) || plan?.days[0];

  // Calculate stats
  const totalVolumeLifted = userLogs.reduce((acc, log) => acc + log.totalVolumeKg, 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111116] border border-[#22222d]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#d4f933] font-semibold">
              Athlete Portal
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-mono">
              Cycle Week 1 of {plan?.durationWeeks || 8}
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-1">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {plan ? plan.title : 'Awaiting custom program assignment from Head Coach'}
          </p>
        </div>

        {/* Quick Athlete Stats */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-4 py-2 rounded-xl bg-[#09090c] border border-zinc-800 text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500">Weight</span>
            <span className="text-sm font-bold font-numeric text-white">{currentUser.weightKg} kg</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#09090c] border border-zinc-800 text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500">Sessions</span>
            <span className="text-sm font-bold font-numeric text-[#d4f933]">{userLogs.length}</span>
          </div>
        </div>
      </div>

      {plan ? (
        <>
          {/* Today's Workout Hero Card */}
          {todayWorkoutDay && !todayWorkoutDay.isRestDay ? (
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#161622] via-[#121218] to-[#0c0c10] border border-[#2c2c3e] shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4f933]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                    <Flame className="w-3.5 h-3.5" />
                    Today's Training Assignment
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {todayWorkoutDay.dayName}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 font-numeric">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {todayWorkoutDay.estimatedMinutes} Mins Session
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60">
                      <Dumbbell className="w-3.5 h-3.5 text-zinc-400" />
                      {todayWorkoutDay.exercises.length} Movements
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 font-mono text-purple-300">
                      {todayWorkoutDay.targetMuscles.join(' / ')}
                    </span>
                  </div>

                  {/* Exercises quick checklist preview */}
                  <div className="pt-2">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                      Movement Roster:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {todayWorkoutDay.exercises.map((ex, idx) => (
                        <div
                          key={ex.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-[#0a0a0e]/60 border border-zinc-800/60 text-xs"
                        >
                          <span className="w-4 h-4 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <span className="text-zinc-200 font-medium truncate block">
                              {ex.exerciseName}
                            </span>
                            {ex.alternativeExercise && (
                              <span className="text-[9px] text-purple-400 block truncate">
                                Alt: {ex.alternativeExercise}
                              </span>
                            )}
                          </div>
                          <span className="ml-auto text-[10px] font-numeric text-zinc-500 whitespace-nowrap">
                            {ex.sets}×{ex.targetReps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Big Start Workout CTA */}
                <div className="flex flex-col items-center lg:items-end justify-center">
                  <button
                    onClick={() => setActiveSessionDay(todayWorkoutDay)}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm tracking-wide transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-[1.02] flex items-center justify-center gap-3 group"
                  >
                    <Play className="w-5 h-5 fill-white stroke-none" />
                    <span>Start Workout Now</span>
                  </button>
                  <span className="text-[11px] text-zinc-500 mt-2 font-medium">
                    Live set logging & automatic rest countdown
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#121218] border border-[#242432] text-center">
              <Clock className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Scheduled Active Recovery Day
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                Rest and muscle protein synthesis in progress. Stay hydrated, hit protein targets, and prioritize sleep.
              </p>
            </div>
          )}

          {/* Weekly Split Calendar Strip */}
          <div className="p-6 rounded-2xl bg-[#111116] border border-[#22222d]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Assigned Weekly Split
                </h3>
                <p className="text-xs text-zinc-400">
                  {plan.title} • {plan.daysPerWeek} training days per week
                </p>
              </div>
              <button
                onClick={onNavigateToSplit}
                className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Full Protocol Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {plan.days.map((day) => (
                <div
                  key={day.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    day.id === todayWorkoutDay?.id
                      ? 'bg-[#181824] border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'bg-[#0d0d12] border-[#22222c]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white truncate">
                        {day.dayName}
                      </span>
                      {day.isRestDay ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                          REST
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300">
                          {day.exercises.length} EX
                        </span>
                      )}
                    </div>
                    {!day.isRestDay ? (
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {day.exercises.map((e) => e.exerciseName).join(', ')}
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-500 italic">
                        Recovery & mobility
                      </p>
                    )}
                  </div>

                  {!day.isRestDay && (
                    <button
                      onClick={() => setActiveSessionDay(day)}
                      className="mt-3 w-full py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Session</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* No Assigned Plan State */
        <div className="p-8 rounded-3xl bg-[#121218] border border-amber-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Workout Protocol Under Coach Review
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Your profile has been created. Head Coach Yassen Ahmed is structuring your customized workout split. You will be notified as soon as it is deployed!
            </p>
          </div>
        </div>
      )}

      {/* Trainee Target & Coach Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#111116] border border-[#22222d]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
            Target Focus & Biometrics
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-zinc-900">
              <span className="text-zinc-400">Primary Goal</span>
              <span className="font-semibold text-white">{currentUser.goal}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-zinc-900">
              <span className="text-zinc-400">Current Weight</span>
              <span className="font-numeric font-bold text-purple-400">{currentUser.weightKg} kg</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-zinc-400">Target Weight</span>
              <span className="font-numeric font-bold text-white">{currentUser.targetWeightKg} kg</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111116] border border-[#22222d]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
            Coach Directives
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {currentUser.notes || 'Stick strictly to prescribed rest periods and progressive overload on compound lifts.'}
          </p>
          <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>Coach: Yassen Ahmed</span>
            <span>Status: Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
