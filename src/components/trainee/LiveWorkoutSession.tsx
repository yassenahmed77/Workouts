'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGym } from '@/context/GymContext';
import { WorkoutPlan, WorkoutDay, RoutineExercise, LoggedExercise, LoggedSet } from '@/types';
import { playTimerBeep } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  Check, 
  Clock, 
  RotateCcw, 
  Plus, 
  Minus, 
  Flame, 
  Dumbbell, 
  X, 
  CheckCircle2, 
  Award, 
  ArrowRight,
  TrendingUp,
  Volume2
} from 'lucide-react';

interface LiveWorkoutSessionProps {
  plan: WorkoutPlan;
  day: WorkoutDay;
  onExit: () => void;
  onSessionCompleted: () => void;
}

export const LiveWorkoutSession: React.FC<LiveWorkoutSessionProps> = ({
  plan,
  day,
  onExit,
  onSessionCompleted
}) => {
  const { currentUser, saveWorkoutLog } = useGym();

  // Elapsed workout timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Active rest timer state
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [totalRestDuration, setTotalRestDuration] = useState<number>(90);
  const [activeRestExerciseName, setActiveRestExerciseName] = useState<string>('');

  // Exercise log entries
  const [exerciseLogs, setExerciseLogs] = useState<LoggedExercise[]>(() => {
    return day.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      targetMuscle: ex.targetMuscle,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        weightKg: 0,
        reps: parseInt(ex.targetReps) || 10,
        completed: false
      }))
    }));
  });

  // Completed workout celebration modal
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<{
    duration: string;
    totalVolume: number;
    completedSetsCount: number;
  } | null>(null);

  // Elapsed workout timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest countdown timer interval
  useEffect(() => {
    if (restSecondsLeft === null) return;
    if (restSecondsLeft <= 0) {
      playTimerBeep(880, 250, 2);
      setRestSecondsLeft(null);
      return;
    }

    const interval = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          playTimerBeep(880, 250, 2);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restSecondsLeft]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps',
    val: number
  ) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const targetSets = [...next[exerciseIndex].sets];
      targetSets[setIndex] = {
        ...targetSets[setIndex],
        [field]: Math.max(0, val)
      };
      next[exerciseIndex].sets = targetSets;
      return next;
    });
  };

  const handleToggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const routineEx = day.exercises[exerciseIndex];
    setExerciseLogs((prev) => {
      const next = [...prev];
      const targetSets = [...next[exerciseIndex].sets];
      const currentStatus = targetSets[setIndex].completed;
      const newStatus = !currentStatus;

      targetSets[setIndex] = {
        ...targetSets[setIndex],
        completed: newStatus
      };
      next[exerciseIndex].sets = targetSets;

      // If marked complete, launch rest timer!
      if (newStatus && routineEx) {
        const restDuration = routineEx.restSeconds || 90;
        setTotalRestDuration(restDuration);
        setRestSecondsLeft(restDuration);
        setActiveRestExerciseName(routineEx.exerciseName);
        playTimerBeep(660, 100, 1);
      }

      return next;
    });
  };

  const handleFinishWorkout = () => {
    setIsTimerRunning(false);

    // Calculate total volume
    let totalVolume = 0;
    let completedSetsCount = 0;

    exerciseLogs.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalVolume += s.weightKg * s.reps;
          completedSetsCount++;
        }
      });
    });

    const summary = {
      duration: formatTime(elapsedSeconds),
      totalVolume,
      completedSetsCount
    };

    setCompletedSummary(summary);
    setIsCompletedModalOpen(true);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4f933', '#38bdf8', '#ffffff']
      });
    } catch {
      // ignore if blocked
    }

    // Save workout log to state & localStorage
    saveWorkoutLog({
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      planId: plan.id,
      dayId: day.id,
      dayName: day.dayName,
      date: new Date().toISOString().split('T')[0],
      durationSeconds: elapsedSeconds,
      totalVolumeKg: totalVolume,
      completedExercises: exerciseLogs
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Session Top Bar HUD */}
      <div className="sticky top-16 z-30 -mx-4 sm:mx-0 p-4 sm:rounded-2xl bg-[#111116]/95 border-b sm:border border-[#262634] backdrop-blur-md flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Live Session Active
          </span>
          <h2 className="text-base font-bold text-white tracking-tight">
            {day.dayName}
          </h2>
        </div>

        {/* Stopwatch & Finish CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0e] border border-[#242430]">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className="font-numeric text-base font-bold text-white tracking-wider">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <button
            onClick={handleFinishWorkout}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Finish Workout</span>
          </button>
        </div>
      </div>

      {/* Exercises Routine List */}
      <div className="space-y-4">
        {day.exercises.map((routineEx, exIdx) => {
          const logEntry = exerciseLogs[exIdx];

          return (
            <div
              key={routineEx.id}
              className="p-5 rounded-2xl bg-[#121218] border border-[#22222d] shadow-lg"
            >
              {/* Exercise Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-purple-400 font-mono text-xs font-bold flex items-center justify-center mt-0.5">
                    {exIdx + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {routineEx.exerciseName}
                      </h3>
                      {routineEx.alternativeExercise && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/50 font-medium">
                          Badeel: {routineEx.alternativeExercise}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-zinc-400">
                      <span className="font-mono text-zinc-300">{routineEx.targetMuscle}</span>
                      <span>•</span>
                      <span>{routineEx.equipment}</span>
                      <span>•</span>
                      <span className="text-purple-300 font-numeric font-medium">
                        Target: {routineEx.sets} sets × {routineEx.targetReps} reps @ RPE {routineEx.targetRpe || 8}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right badges: Video explanation link & Rest time */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {routineEx.videoUrl && (
                    <a
                      href={routineEx.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/50 transition-colors"
                      title="Watch video explanation"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch Guide ↗</span>
                    </a>
                  )}

                  {routineEx.restSeconds && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{routineEx.restSeconds}s Rest</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coach note & Technique tips callout */}
              {routineEx.notes && (
                <div className="my-3 px-3 py-2 rounded-lg bg-[#0d0d12] border border-purple-950/60 text-xs text-zinc-300 flex items-start gap-2">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Coach Cue:</span>
                  <span className="text-zinc-300">{routineEx.notes}</span>
                </div>
              )}

              {/* Sets Table */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800/60 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      <th className="pb-2 pl-2 w-12">Set</th>
                      <th className="pb-2 w-28">Weight (kg)</th>
                      <th className="pb-2 w-24">Reps</th>
                      <th className="pb-2 pr-2 text-right">Complete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {logEntry?.sets.map((set, sIdx) => {
                      return (
                        <tr
                          key={sIdx}
                          className={`transition-colors ${
                            set.completed ? 'bg-purple-950/20 text-zinc-200' : 'hover:bg-zinc-900/40'
                          }`}
                        >
                          <td className="py-2.5 pl-2 font-mono font-bold text-zinc-400">
                            {set.setNumber}
                          </td>
                          <td className="py-2.5 pr-2">
                            <input
                              type="number"
                              step="0.5"
                              value={set.weightKg === 0 ? '' : set.weightKg}
                              onChange={(e) =>
                                handleUpdateSet(exIdx, sIdx, 'weightKg', parseFloat(e.target.value) || 0)
                              }
                              placeholder="0"
                              className="w-20 px-2.5 py-1.5 rounded-lg bg-[#0d0d12] border border-[#272734] font-numeric text-white text-xs focus:outline-none focus:border-purple-500"
                            />
                          </td>
                          <td className="py-2.5 pr-2">
                            <input
                              type="number"
                              value={set.reps === 0 ? '' : set.reps}
                              onChange={(e) =>
                                handleUpdateSet(exIdx, sIdx, 'reps', parseInt(e.target.value) || 0)
                              }
                              placeholder="10"
                              className="w-16 px-2.5 py-1.5 rounded-lg bg-[#0d0d12] border border-[#272734] font-numeric text-white text-xs focus:outline-none focus:border-purple-500"
                            />
                          </td>
                          <td className="py-2.5 pr-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleSetComplete(exIdx, sIdx)}
                              className={`w-8 h-8 rounded-lg border inline-flex items-center justify-center transition-all ${
                                set.completed
                                  ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                                  : 'bg-[#14141c] border-[#292938] text-zinc-500 hover:border-zinc-500 hover:text-white'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Active Rest Timer HUD (Docked at bottom) */}
      {restSecondsLeft !== null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-4 rounded-2xl bg-[#0e0e14]/95 border border-purple-900/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Circular Mini Progress */}
              <div className="w-12 h-12 rounded-full border-2 border-purple-500 flex items-center justify-center bg-purple-500/15 text-white font-numeric font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                {restSecondsLeft}s
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Rest Countdown
                </span>
                <p className="text-xs font-bold text-white truncate max-w-[150px]">
                  {activeRestExerciseName}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRestSecondsLeft((prev) => (prev ? prev + 30 : 30))}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-semibold transition-colors"
                title="Add 30s"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => setRestSecondsLeft(null)}
                className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Complete Modal */}
      {isCompletedModalOpen && completedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#121218] border border-[#2e2e40] rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white mx-auto mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <Award className="w-8 h-8 stroke-[2.2]" />
            </div>

            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold">
              Session Completed
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
              Solid Work Today!
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Your workout session has been logged and synced with Coach Yassen Ahmed.
            </p>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-2.5 my-6 p-4 rounded-2xl bg-[#0a0a0e] border border-[#22222e]">
              <div>
                <span className="block text-[9px] font-mono uppercase text-zinc-500">Duration</span>
                <span className="text-base font-bold font-numeric text-white mt-1 block">
                  {completedSummary.duration}
                </span>
              </div>
              <div className="border-x border-zinc-800">
                <span className="block text-[9px] font-mono uppercase text-zinc-500">Total Volume</span>
                <span className="text-base font-bold font-numeric text-purple-400 mt-1 block">
                  {completedSummary.totalVolume.toLocaleString()} kg
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-mono uppercase text-zinc-500">Sets Finished</span>
                <span className="text-base font-bold font-numeric text-cyan-400 mt-1 block">
                  {completedSummary.completedSetsCount}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCompletedModalOpen(false);
                onSessionCompleted();
              }}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] flex items-center justify-center gap-2"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
