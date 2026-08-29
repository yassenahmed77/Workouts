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
  Play, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles
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

  if (!currentUser) return null;

  const plan = getPlanForUser(currentUser.id);
  const userLogs = getUserLogs(currentUser.id);

  // If live workout mode is active
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Athlete Header & Biometrics Summary */}
      <div className="p-6 rounded-2xl bg-[#111116] border border-[#22222d] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50">
              Athlete Portal
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-mono">
              {plan ? `${plan.durationWeeks} Weeks Protocol` : 'Pending Program'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {plan ? (
              <span className="text-zinc-300 font-semibold">{plan.title}</span>
            ) : (
              'Program is being structured by Yassen Ahmed'
            )}
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-[#09090d] border border-zinc-800 text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500">Weight</span>
            <span className="text-sm font-bold font-numeric text-white">{currentUser.weightKg} kg</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-[#09090d] border border-zinc-800 text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500">Target</span>
            <span className="text-sm font-bold font-numeric text-purple-400">{currentUser.targetWeightKg} kg</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-[#09090d] border border-zinc-800 text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500">Logged</span>
            <span className="text-sm font-bold font-numeric text-emerald-400">{userLogs.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Manual Workout Split Grid (No auto-recommendations) */}
      {plan ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Your Training Split</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Select your workout day to begin session tracking
              </p>
            </div>
            <button
              onClick={onNavigateToSplit}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              <span>Full Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.days.map((day, idx) => (
              <div
                key={day.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  day.isRestDay
                    ? 'bg-[#0c0c11] border-[#1d1d28] opacity-80'
                    : 'bg-[#121219] border-[#252535] hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-purple-950/80 border border-purple-800/60 text-purple-300 font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {day.dayName}
                      </h3>
                    </div>

                    {day.isRestDay ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        REST DAY
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                        {day.exercises.length} MOVEMENTS
                      </span>
                    )}
                  </div>

                  {!day.isRestDay ? (
                    <>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-numeric mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          {day.estimatedMinutes} Mins
                        </span>
                        <span>•</span>
                        <span className="text-purple-300 font-mono">
                          {day.targetMuscles.join(' / ')}
                        </span>
                      </div>

                      {/* Exercises Checklist */}
                      <div className="space-y-1.5 mb-4">
                        {day.exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-[#0a0a0f] border border-zinc-800/80 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-zinc-500 font-mono text-[10px]">
                                {exIdx + 1}.
                              </span>
                              <span className="text-zinc-200 font-medium truncate">
                                {ex.exerciseName}
                              </span>
                              {ex.alternativeExercise && (
                                <span className="text-[10px] text-purple-400/80 hidden sm:inline truncate">
                                  ({ex.alternativeExercise})
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-numeric font-semibold text-zinc-400 whitespace-nowrap ml-2">
                              {ex.sets} × {ex.targetReps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center text-xs text-zinc-500 italic">
                      Scheduled recovery and rest. Hydrate and prioritize nutrition.
                    </div>
                  )}
                </div>

                {!day.isRestDay && (
                  <button
                    onClick={() => setActiveSessionDay(day)}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Workout Session</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-[#121218] border border-amber-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            Program Under Preparation
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Your customized workout protocol is currently being set up by Yassen Ahmed. You will see your routines here once assigned.
          </p>
        </div>
      )}

      {/* 3. Directives & Training Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#111116] border border-[#22222d]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block mb-2">
            Target Focus & Biometrics
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-zinc-900">
              <span className="text-zinc-400">Primary Objective</span>
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
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block mb-2">
            Instructions & Training Notes
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {currentUser.notes || 'Stick strictly to prescribed rest periods and progressive overload on compound lifts.'}
          </p>
          <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>By: Yassen Ahmed</span>
            <span className="text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
