'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { WorkoutPlan, WorkoutDay, LoggedExercise } from '@/types';
import { playTimerBeep } from '@/lib/audio';
import { checkLiveSetPR } from '@/lib/progressEngine';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  Clock, 
  Plus, 
  Minus, 
  Check, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Calculator, 
  X, 
  Dumbbell, 
  Volume2, 
  VolumeX,
  ChevronRight,
  Info,
  Layers,
  Target,
  Shield,
  Zap,
  Activity,
  Flame,
  TrendingUp
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
  const { currentUser, saveWorkoutLog, getUserLogs } = useGym();
  const { showToast } = useToast();

  // Elapsed workout timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  if (!currentUser) return null;

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active rest timer state
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [totalRestDuration, setTotalRestDuration] = useState<number>(90);
  const [activeRestExerciseName, setActiveRestExerciseName] = useState<string>('');

  // Plate Calculator Modal State
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [plateCalcTargetWeight, setPlateCalcTargetWeight] = useState<number>(60);
  const [plateCalcBarWeight, setPlateCalcBarWeight] = useState<number>(20);

  // Previous logs memory for progressive overload reference
  const pastLogs = getUserLogs(currentUser.id);
  const previousExerciseData = useMemo(() => {
    const memory: Record<string, { weightKg: number; reps: number }[]> = {};
    if (!pastLogs || !Array.isArray(pastLogs)) return memory;
    for (const log of pastLogs) {
      if (!log || !log.completedExercises || !Array.isArray(log.completedExercises)) continue;
      for (const ex of log.completedExercises) {
        if (!ex || !ex.exerciseName) continue;
        if (!memory[ex.exerciseName] || memory[ex.exerciseName].length === 0) {
          if (!ex.sets || !Array.isArray(ex.sets)) continue;
          const completedSets = ex.sets.filter((s) => s && s.completed);
          if (completedSets.length > 0) {
            memory[ex.exerciseName] = completedSets.map((s) => ({
              weightKg: Number(s.weightKg) || 0,
              reps: Number(s.reps) || 0
            }));
          }
        }
      }
    }
    return memory;
  }, [pastLogs]);

  // Exercise log entries
  const [exerciseLogs, setExerciseLogs] = useState<LoggedExercise[]>(() => {
    const exercises = day?.exercises && Array.isArray(day.exercises) ? day.exercises : [];
    return exercises.map((ex, idx) => {
      const exName = ex?.exerciseName || `Exercise ${idx + 1}`;
      const prevData = previousExerciseData[exName];
      const targetRepsNum = parseInt(String(ex?.targetReps || '8'), 10) || 8;
      const setsCount = Math.max(1, ex?.sets || 3);
      return {
        exerciseId: ex?.exerciseId || ex?.id || `ex-${idx}`,
        exerciseName: exName,
        targetMuscle: ex?.targetMuscle || 'Full Body',
        sets: Array.from({ length: setsCount }, (_, i) => ({
          setNumber: i + 1,
          weightKg: prevData && prevData[i] ? prevData[i].weightKg : 0,
          reps: prevData && prevData[i] ? prevData[i].reps : targetRepsNum,
          completed: false // default false for all sets
        }))
      };
    });
  });

  // Completed workout celebration modal
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<{
    duration: string;
    totalVolume: number;
    completedSetsCount: number;
    prsAchieved?: string[];
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

  // Active rest timer interval
  useEffect(() => {
    if (restSecondsLeft === null) return;
    const interval = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (soundEnabled) playTimerBeep(880, 250, 2);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restSecondsLeft, soundEnabled]);

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

  // Toggle set complete: checks/unchecks and auto-advances to next set
  const handleToggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const routineEx = day?.exercises?.[exerciseIndex];
    
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

      // If marked complete, launch rest timer and focus next set input automatically!
      if (newStatus && routineEx) {
        const restDuration = routineEx.restSeconds || 90;
        setTotalRestDuration(restDuration);
        setRestSecondsLeft(restDuration);
        setActiveRestExerciseName(routineEx.exerciseName);
        if (soundEnabled) playTimerBeep(660, 100, 1);
        showToast(`Set ${setIndex + 1} logged! Moving to next set...`, 'success');

        // Automatically move cursor and focus next set input smoothly
        setTimeout(() => {
          let nextEl = document.getElementById(`set-weight-${exerciseIndex}-${setIndex + 1}`);
          if (!nextEl) {
            // Move to first set of next exercise
            nextEl = document.getElementById(`set-weight-${exerciseIndex + 1}-0`);
          }
          if (nextEl) {
            nextEl.focus();
            (nextEl as HTMLInputElement).select?.();
            nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 120);
      } else {
        showToast(`Set ${setIndex + 1} unchecked`, 'info');
      }

      return next;
    });
  };

  const handleAddSet = (exerciseIndex: number) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const sets = next[exerciseIndex].sets;
      const lastSet = sets[sets.length - 1];
      sets.push({
        setNumber: sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 0,
        reps: lastSet ? lastSet.reps : 4,
        completed: false
      });
      return next;
    });
    showToast('Added set', 'info');
  };

  const handleRemoveSet = (exerciseIndex: number) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      if (next[exerciseIndex].sets.length > 1) {
        next[exerciseIndex].sets.pop();
      }
      return next;
    });
  };

  const handleFinishWorkout = () => {
    setIsTimerRunning(false);

    let totalVolume = 0;
    let completedSetsCount = 0;
    const prsAchieved: string[] = [];

    // Finalize all exercises: mark sets with weight as completed and calculate volume
    const finalizedExercises = exerciseLogs.map((ex) => {
      const sets = ex.sets.map((s) => {
        const isSetDone = s.completed || s.weightKg > 0;
        if (isSetDone) {
          totalVolume += (s.weightKg || 0) * (s.reps || 1);
          completedSetsCount++;

          if (s.weightKg > 0) {
            const prCheck = checkLiveSetPR(ex.exerciseName, s.weightKg, s.reps, pastLogs);
            if (prCheck.isNewPR && !prsAchieved.some(p => p.includes(ex.exerciseName))) {
              prsAchieved.push(`${ex.exerciseName}: ${s.weightKg}kg (${prCheck.label || 'PR'})`);
            }
          }
        }
        return {
          ...s,
          completed: isSetDone
        };
      });

      return {
        ...ex,
        sets
      };
    });

    const summary = {
      duration: formatTime(elapsedSeconds),
      totalVolume,
      completedSetsCount,
      prsAchieved
    };

    setCompletedSummary(summary);
    setIsCompletedModalOpen(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b00', '#ffffff', '#ffaa00']
      });
    } catch {
      // ignore
    }

    // Save ALL completed exercises across the whole workout session into database/logs
    saveWorkoutLog({
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      planId: plan.id,
      dayId: day.id,
      dayName: day.dayName,
      date: new Date().toISOString().split('T')[0],
      durationSeconds: elapsedSeconds,
      totalVolumeKg: totalVolume,
      completedExercises: finalizedExercises.filter(ex => ex.sets.some(s => s.completed || s.weightKg > 0))
    });

    showToast('All exercises saved to your progress history! 🔥', 'success');
  };

  // Plate calculation helper (per side)
  const plateBreakdown = useMemo(() => {
    const weightPerSide = Math.max(0, (plateCalcTargetWeight - plateCalcBarWeight) / 2);
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const platesUsed: { weight: number; count: number }[] = [];
    let remainder = weightPerSide;

    for (const plate of availablePlates) {
      if (remainder >= plate) {
        const count = Math.floor(remainder / plate);
        platesUsed.push({ weight: plate, count });
        remainder = Math.round((remainder - count * plate) * 100) / 100;
      }
    }

    return {
      weightPerSide,
      platesUsed,
      remainder
    };
  }, [plateCalcTargetWeight, plateCalcBarWeight]);

  // Overall workout completion progress calculation
  const totalSetsCount = exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalCompletedSets = exerciseLogs.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const completedExercisesCount = exerciseLogs.filter(ex => ex.sets.every(s => s.completed)).length;
  const progressPercent = totalSetsCount > 0 ? Math.round((totalCompletedSets / totalSetsCount) * 100) : 0;

  // Exercise category icon mapper
  const getExerciseIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('lat') || n.includes('row') || n.includes('pull')) {
      return <Layers className="w-5 h-5 text-cyan-400" />;
    }
    if (n.includes('bench') || n.includes('press') || n.includes('chest')) {
      return <Dumbbell className="w-5 h-5 text-[#ff6b00]" />;
    }
    return <Activity className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-36 px-2 sm:px-0">
      
      {/* 1. Top HUD Control Bar (Dynamic Island & Notch Safe) */}
      <div className="sticky top-0 z-30 pt-[max(6px,env(safe-area-inset-top))] pb-2 bg-[#09090b]/95 backdrop-blur-md w-full">
        <div className="flex items-center justify-between gap-2 w-full">
          
          {/* Left Controls: Exit, Sound, Plate Calc */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Close/Exit Button */}
            <button
              onClick={onExit}
              className="w-9 h-9 rounded-2xl bg-[#14151e] border border-[#212330] text-zinc-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 active:scale-95 cursor-pointer"
              title="Exit Workout"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-colors flex-shrink-0 active:scale-95 cursor-pointer ${
                soundEnabled 
                  ? 'bg-[#1c1a24] text-[#ff6b00] border-[#ff6b00]/30' 
                  : 'bg-[#14151e] text-zinc-500 border-[#212330]'
              }`}
              title={soundEnabled ? 'Timer Sound On' : 'Timer Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 stroke-[2.2]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Barbell Plate Calculator Button */}
            <button
              type="button"
              onClick={() => setIsPlateCalcOpen(true)}
              className="w-9 h-9 rounded-2xl bg-[#14151e] border border-[#212330] text-zinc-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 active:scale-95 cursor-pointer"
              title="Barbell Calculator"
            >
              <Calculator className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Right: Stopwatch Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#14151e] border border-[#212330] flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-zinc-400 hover:text-[#ff6b00] transition-colors active:scale-95 cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <span className="font-numeric text-sm font-extrabold text-white tracking-wider">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

        </div>
      </div>

      {/* 2. Subheader & Progress Bar */}
      <div className="pt-1 pb-1">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
              CURRENT WORKOUT
            </span>
            <span className="text-sm font-extrabold text-[#ff6b00] tracking-tight">
              {day.dayName}
            </span>
          </div>

          {/* Exercises Counter */}
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold mr-1.5">
              EXERCISES
            </span>
            <span className="font-mono text-xs font-extrabold text-white">
              <span className="text-[#ff6b00]">{completedExercisesCount}</span> / {day.exercises?.length || 0}
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1 bg-[#181a24] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#ff6b00] rounded-full transition-all duration-300 shadow-[0_0_8px_#ff6b00]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Main Routine Exercise Cards Stack (All Exercises with Full Set Logging Logic) */}
      <div className="space-y-4">
        {(day.exercises || []).map((routineEx, exIdx) => {
          const logEntry = exerciseLogs[exIdx];
          const prevSets = previousExerciseData[routineEx.exerciseName];

          return (
            <div
              key={routineEx.id}
              className="relative p-4 sm:p-5 rounded-3xl bg-[#111218] border border-[#212330] shadow-xl space-y-4 overflow-hidden"
            >
              {/* Subtle Left Accent Glow Line */}
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#ff6b00] rounded-l-3xl shadow-[0_0_12px_#ff6b00]" />

              {/* Exercise Header (Full Title on Line 1, Guide & Duration on Line 2) */}
              <div className="space-y-2.5">
                {/* Line 1: Exercise Number & Full Title */}
                <div className="flex items-start gap-3">
                  {/* Number Badge */}
                  <div className="w-8 h-8 rounded-2xl bg-[#1c1d27] border border-[#2e303d] text-[#ff6b00] font-mono text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                    {exIdx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                      {routineEx.exerciseName}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium mt-0.5">
                      {routineEx.targetMuscle} • {routineEx.equipment}
                    </p>
                  </div>
                </div>

                {/* Line 2: Action Badges (Guide & Rest Duration) */}
                <div className="flex items-center gap-2 pl-11">
                  {routineEx.videoUrl && (
                    <a
                      href={routineEx.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#1a1b26] hover:bg-[#252738] border border-[#2a2d3d] transition-colors shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current text-[#ff6b00]" />
                      <span>Guide</span>
                    </a>
                  )}

                  {/* Rest Timer Badge */}
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300 px-3 py-1.5 rounded-xl bg-[#14151e] border border-[#212330]">
                    <Clock className="w-3.5 h-3.5 text-[#ff6b00]" />
                    <span>{routineEx.restSeconds || 150}s Rest</span>
                  </div>
                </div>
              </div>

              {/* Technique Cue Callout if present */}
              {routineEx.notes && (
                <div className="px-3 py-2 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-zinc-300 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#ff6b00] flex-shrink-0 mt-0.5" />
                  <p className="leading-snug text-zinc-300">{routineEx.notes}</p>
                </div>
              )}

              {/* 4. Interactive Sets Logging Table (No PREV, Maximum Space for Inputs) */}
              <div className="space-y-2.5">
                {/* Header Labels */}
                <div className="grid grid-cols-[28px_1fr_1fr_48px] items-center gap-2.5 px-1 text-[10px] font-mono uppercase font-bold text-zinc-500 text-center">
                  <span>#</span>
                  <span>KG</span>
                  <span>REPS</span>
                  <span>✓</span>
                </div>

                {/* Set Rows */}
                {logEntry?.sets.map((set, sIdx) => {
                  const prCheck = checkLiveSetPR(routineEx.exerciseName, set.weightKg, set.reps, pastLogs);

                  return (
                    <div
                      key={sIdx}
                      className="grid grid-cols-[28px_1fr_1fr_48px] items-center gap-2.5 text-center relative"
                    >
                      {/* # Set Number */}
                      <span className="font-mono text-xs font-extrabold text-zinc-400">
                        {set.setNumber}
                      </span>

                      {/* KG Input Pill with Auto-Clear Zero and Live PR Flame Indicator */}
                      <div className="relative rounded-2xl bg-[#14151e] border border-[#212330] focus-within:border-[#ff6b00] focus-within:ring-1 focus-within:ring-[#ff6b00]/30 p-2 flex flex-col items-center justify-center transition-all shadow-inner">
                        {prCheck.isNewPR && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.2 rounded-full bg-[#ff6b00] text-black font-mono text-[8px] font-black tracking-tighter whitespace-nowrap shadow-sm shadow-[#ff6b00]/40 flex items-center gap-0.5 animate-bounce">
                            <Flame className="w-2 h-2 fill-current" />
                            <span>PR</span>
                          </span>
                        )}
                        <input
                          id={`set-weight-${exIdx}-${sIdx}`}
                          type="number"
                          step="0.5"
                          inputMode="decimal"
                          placeholder="0"
                          value={set.weightKg === 0 ? '' : set.weightKg}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            handleUpdateSet(exIdx, sIdx, 'weightKg', val);
                          }}
                          className="w-full bg-transparent font-numeric font-black text-base text-white text-center focus:outline-none placeholder-zinc-600"
                        />
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase -mt-0.5 block tracking-wider pointer-events-none">
                          KG
                        </span>
                      </div>

                      {/* REPS Input Pill with Auto-Clear Zero on Typing */}
                      <div className="relative rounded-2xl bg-[#14151e] border border-[#212330] focus-within:border-[#ff6b00] focus-within:ring-1 focus-within:ring-[#ff6b00]/30 p-2 flex flex-col items-center justify-center transition-all shadow-inner">
                        <input
                          id={`set-reps-${exIdx}-${sIdx}`}
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          value={set.reps === 0 ? '' : set.reps}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                            handleUpdateSet(exIdx, sIdx, 'reps', val);
                          }}
                          className="w-full bg-transparent font-numeric font-black text-base text-white text-center focus:outline-none placeholder-zinc-600"
                        />
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase -mt-0.5 block tracking-wider pointer-events-none">
                          REPS
                        </span>
                      </div>

                      {/* Done / Checkmark Action Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSetComplete(exIdx, sIdx)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                          set.completed
                            ? 'bg-[#ff6b00] text-black shadow-lg shadow-[#ff6b00]/30 scale-102'
                            : 'bg-[#14151e] text-zinc-600 border border-[#212330] hover:text-zinc-300'
                        }`}
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Set Action Controls (+ Add Set / - Remove Set) */}
              <div className="flex items-center justify-between border-t border-[#1e202c] pt-2.5 px-1">
                <button
                  type="button"
                  onClick={() => handleAddSet(exIdx)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#ff6b00] hover:underline cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Set</span>
                </button>

                {logEntry && logEntry.sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSet(exIdx)}
                    className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Remove Set</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* 5. Big Finish Workout CTA at the very bottom */}
      <div className="pt-2 pb-6">
        <button
          onClick={handleFinishWorkout}
          className="w-full py-4 px-6 rounded-3xl btn-orange text-sm sm:text-base font-black tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#ff6b00]/25 cursor-pointer active:scale-98 transition-transform"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>FINISH WORKOUT</span>
        </button>
      </div>

      {/* Floating Active Rest Timer HUD (Docked above bottom nav) */}
      {restSecondsLeft !== null && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm p-3.5 rounded-3xl bg-[#14151e]/95 border border-[#ff6b00]/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#ff6b00] text-black flex items-center justify-center font-numeric font-black text-sm shadow-md shadow-[#ff6b00]/25 flex-shrink-0">
                {restSecondsLeft}s
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#ff6b00] font-bold block">
                  Rest Interval
                </span>
                <p className="text-xs font-bold text-white truncate">
                  {activeRestExerciseName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setRestSecondsLeft((prev) => (prev ? prev + 15 : 15))}
                className="px-2 py-1 rounded-lg bg-[#1c1d27] hover:bg-[#252735] text-zinc-200 text-xs font-mono font-bold transition-colors"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => setRestSecondsLeft((prev) => (prev && prev > 15 ? prev - 15 : 0))}
                className="px-2 py-1 rounded-lg bg-[#1c1d27] hover:bg-[#252735] text-zinc-200 text-xs font-mono font-bold transition-colors"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => setRestSecondsLeft(null)}
                className="px-2.5 py-1 rounded-lg bg-[#282a3a] hover:bg-[#35384d] text-white text-xs font-bold transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barbell Plate Calculator Modal */}
      {isPlateCalcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-sm bg-[#14151e] border border-[#2e303d] rounded-3xl p-5 shadow-2xl relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#232530]">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#ff6b00]" />
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Barbell Plate Calculator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPlateCalcOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1c1d27]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3.5 space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Total Target Weight (kg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="2.5"
                    value={plateCalcTargetWeight}
                    onChange={(e) => setPlateCalcTargetWeight(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#09090b] border border-[#232530] font-numeric text-white font-black text-base focus:outline-none focus:border-[#ff6b00]"
                  />
                  <div className="flex items-center gap-1">
                    {[60, 80, 100, 120].map((wt) => (
                      <button
                        key={wt}
                        type="button"
                        onClick={() => setPlateCalcTargetWeight(wt)}
                        className="px-2 py-1 rounded-lg bg-[#1c1d27] text-zinc-300 text-xs font-mono font-bold hover:text-white"
                      >
                        {wt}k
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Barbell Base Weight (kg)
                </label>
                <select
                  value={plateCalcBarWeight}
                  onChange={(e) => setPlateCalcBarWeight(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#09090b] border border-[#232530] text-xs text-white focus:outline-none focus:border-[#ff6b00]"
                >
                  <option value={20}>Olympic Barbell (20 kg)</option>
                  <option value={15}>Technique Barbell (15 kg)</option>
                  <option value={10}>EZ Bar (10 kg)</option>
                  <option value={0}>Smith Machine / 0 kg</option>
                </select>
              </div>

              {/* Output Per Side */}
              <div className="p-3.5 rounded-2xl bg-[#09090b] border border-[#232530] text-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-0.5">
                  Plates Needed Per Side
                </span>
                <span className="text-2xl font-black font-numeric text-[#ff6b00]">
                  {plateBreakdown.weightPerSide} kg <span className="text-xs text-zinc-400 font-normal">/ side</span>
                </span>

                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
                  {plateBreakdown.platesUsed.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-[#1c1d27] border border-[#2e303d] text-zinc-200 font-mono text-xs font-bold"
                    >
                      {p.count} × {p.weight} kg
                    </span>
                  ))}
                  {plateBreakdown.platesUsed.length === 0 && (
                    <span className="text-xs text-zinc-500 italic">No plates needed (Empty bar)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Celebration Modal */}
      {isCompletedModalOpen && completedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#14151e] border border-[#2e303d] rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-[#ff6b00] text-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#ff6b00]/30">
              <Award className="w-7 h-7 stroke-[2.5]" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6b00] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20">
              Session Completed
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-2">
              Solid Workout! 🔥
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Your workout session has been logged and recorded successfully.
            </p>

            {/* PRs Achieved in this session callout */}
            {completedSummary.prsAchieved && completedSummary.prsAchieved.length > 0 && (
              <div className="mt-3 text-left p-3 rounded-2xl bg-[#1c1a24] border border-[#ff6b00]/30 shadow-md">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff6b00] mb-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Progressive Overload Achieved!</span>
                </div>
                <div className="space-y-1">
                  {completedSummary.prsAchieved.map((pr, idx) => (
                    <p key={idx} className="text-[11px] font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00]" />
                      <span>{pr}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 my-4 p-3.5 rounded-2xl bg-[#09090b] border border-[#232530]">
              <div>
                <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Duration</span>
                <span className="text-sm font-extrabold font-numeric text-white">{completedSummary.duration}</span>
              </div>
              <div className="border-x border-[#232530]">
                <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Volume</span>
                <span className="text-sm font-extrabold font-numeric text-[#ff6b00]">{completedSummary.totalVolume.toLocaleString()} kg</span>
              </div>
              <div>
                <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Sets Done</span>
                <span className="text-sm font-extrabold font-numeric text-white">{completedSummary.completedSetsCount}</span>
              </div>
            </div>

            <button
              onClick={onSessionCompleted}
              className="w-full py-3.5 rounded-2xl btn-orange text-xs font-black tracking-wide flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
