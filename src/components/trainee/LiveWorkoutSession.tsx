'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { WorkoutPlan, WorkoutDay, LoggedExercise, LoggedSet, RoutineExercise, Exercise, MuscleGroup } from '@/types';
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
  TrendingUp,
  RotateCcw,
  Trash2,
  Repeat,
  Search,
  Video
} from 'lucide-react';
import { 
  getActiveWorkoutDraft, 
  saveActiveWorkoutDraft, 
  clearActiveWorkoutDraft,
  markWorkoutAsUnfinished,
  clearUnfinishedStatus,
  isDraftTimedOut
} from '@/lib/activeWorkoutEngine';
import { sanitizeUrl } from '@/lib/sanitizer';
import { workoutService } from '@/services/workoutService';
const COMMON_FALLBACK_ALTS: Record<string, string> = {
  'Barbell Bench Press': 'Dumbbell Bench Press',
  'Incline Bench Press': 'Incline Dumbbell Press',
  'Lat Pulldown': 'Pull-ups',
  'T-bar Row': 'Seated Cable Row',
  'Shoulder Press': 'Dumbbell Shoulder Press',
  'Barbell Squat': 'Leg Press',
  'Romanian Deadlift': 'Dumbbell RDL',
  'Seated Biceps Curl': 'Incline Dumbbell Curl',
  'Triceps Overhead': 'Cable Tricep Pushdown',
  'Rear Delt Fly Machine': 'Face Pulls',
  'Lateral Raises': 'Cable Lateral Raise',
  'Wrist Flexion': 'Wrist Extension'
};

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
  const { currentUser, saveWorkoutLog, deleteWorkoutLog, getUserLogs, exercises } = useGym();
  const { showToast } = useToast();

  // Active exercises in this live workout session (allows editing, swapping with Badeel, or adding extra movements)
  const [sessionExercises, setSessionExercises] = useState<RoutineExercise[]>(() => {
    return day?.exercises && Array.isArray(day.exercises) ? [...day.exercises] : [];
  });

  // Add extra movement drawer modal state
  const [isAddMovementModalOpen, setIsAddMovementModalOpen] = useState(false);
  const [addMovementSearch, setAddMovementSearch] = useState('');
  const [addMovementMuscleFilter, setAddMovementMuscleFilter] = useState<string>('All');

  // Check if an active in-progress workout draft already exists
  const existingDraft = useMemo(() => {
    if (!currentUser?.id || !day?.id) return null;
    return getActiveWorkoutDraft(currentUser.id, day.id);
  }, [currentUser?.id, day?.id]);

  // Elapsed workout timer (hydrated from draft if exists)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (existingDraft && typeof existingDraft.elapsedSeconds === 'number') {
      return existingDraft.elapsedSeconds;
    }
    return 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [lastSavedLogId, setLastSavedLogId] = useState<string | null>(null);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active rest timer state
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [totalRestDuration, setTotalRestDuration] = useState<number>(150);
  const [activeRestExerciseName, setActiveRestExerciseName] = useState<string>('');

  // Previous logs memory for progressive overload reference
  const pastLogs = useMemo(() => (currentUser ? getUserLogs(currentUser.id) : []), [currentUser, getUserLogs]);
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

  // Helper to generate fresh, uncompleted exercise logs
  const createFreshExerciseLogs = React.useCallback((): LoggedExercise[] => {
    const list = sessionExercises && Array.isArray(sessionExercises) ? sessionExercises : (day?.exercises || []);
    return list.map((ex, idx) => {
      const exName = ex?.exerciseName || `Exercise ${idx + 1}`;
      const prevData = previousExerciseData[exName];
      const targetRepsNum = parseInt(String(ex?.targetReps || '4-10'), 10) || 8;
      const setsCount = Math.max(1, ex?.sets !== undefined ? ex.sets : 1);
      return {
        exerciseId: ex?.exerciseId || ex?.id || `ex-${idx}`,
        exerciseName: exName,
        targetMuscle: ex?.targetMuscle || 'Full Body',
        sets: Array.from({ length: setsCount }, (_, i) => ({
          setNumber: i + 1,
          weightKg: prevData && prevData[i] ? prevData[i].weightKg : 0,
          reps: prevData && prevData[i] ? prevData[i].reps : 0,
          completed: false // default false for all sets
        }))
      };
    });
  }, [sessionExercises, day?.exercises, previousExerciseData]);

  // Exercise log entries (hydrated from draft if exists)
  const [exerciseLogs, setExerciseLogs] = useState<LoggedExercise[]>(() => {
    if (existingDraft && Array.isArray(existingDraft.exerciseLogs) && existingDraft.exerciseLogs.length > 0) {
      return existingDraft.exerciseLogs;
    }
    return createFreshExerciseLogs();
  });

  // Handlers for swapping with Badeel, removing, or adding movements during live session
  const handleSwapBadeel = (exIdx: number) => {
    const currentEx = sessionExercises[exIdx];
    const altName =
      currentEx?.alternativeExercise ||
      currentEx?.alternatives?.[0]?.name ||
      COMMON_FALLBACK_ALTS[currentEx?.exerciseName || ''];
    if (!currentEx || !altName) return;

    const oldName = currentEx.exerciseName;
    const newName = altName;

    const updated = [...sessionExercises];
    updated[exIdx] = {
      ...currentEx,
      exerciseName: newName,
      alternativeExercise: oldName
    };
    setSessionExercises(updated);

    setExerciseLogs((prev) => {
      const next = [...prev];
      if (next[exIdx]) {
        next[exIdx] = {
          ...next[exIdx],
          exerciseName: newName
        };
      }
      return next;
    });

    showToast(`Swapped to "${newName}" (Badeel)!`, 'info');
  };

  const handleRemoveExerciseFromSession = (exIdx: number) => {
    const exToRemove = sessionExercises[exIdx];
    setSessionExercises((prev) => prev.filter((_, idx) => idx !== exIdx));
    setExerciseLogs((prev) => prev.filter((_, idx) => idx !== exIdx));
    setRestSecondsLeft(null);
    setActiveRestExerciseName('');
    showToast(`Removed "${exToRemove?.exerciseName || 'Exercise'}" from this session`, 'info');
  };

  const handleAddExerciseToSession = (ex: Exercise) => {
    const newRoutineEx: RoutineExercise = {
      id: `routine-extra-${Date.now()}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscle,
      equipment: ex.equipment,
      sets: 1,
      targetReps: '4-10',
      targetRpe: '1-2 RIR',
      restSeconds: 150,
      alternativeExercise: ex.alternativeExercise,
      videoUrl: ex.videoUrl,
      notes: ex.executionCue
    };

    const prevData = previousExerciseData[ex.name];
    const newLogEntry: LoggedExercise = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscle,
      sets: Array.from({ length: 1 }, (_, i) => ({
        setNumber: i + 1,
        weightKg: prevData && prevData[i] ? prevData[i].weightKg : 0,
        reps: prevData && prevData[i] ? prevData[i].reps : 0,
        completed: false
      }))
    };

    setSessionExercises((prev) => [...prev, newRoutineEx]);
    setExerciseLogs((prev) => [...prev, newLogEntry]);
    setIsAddMovementModalOpen(false);
    setAddMovementSearch('');
    showToast(`Added "${ex.name}" to this session!`, 'success');
  };

  // Completed workout celebration modal
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<{
    duration: string;
    totalVolume: number;
    completedSetsCount: number;
    prsAchieved?: string[];
  } | null>(null);

  // Track last active interaction timestamp for inactivity timeout logic
  const lastActivityAtRef = React.useRef<string>(existingDraft?.lastActivityAt || new Date().toISOString());

  // Clear any existing unfinished status upon active session mount
  useEffect(() => {
    if (currentUser && day) {
      clearUnfinishedStatus(currentUser.id, day.id);
    }
  }, [currentUser, day]);

  // Automatically scroll all the way to the top upon entering the workout session
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (typeof document !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  // Notify user if an in-progress session was resumed
  useEffect(() => {
    if (existingDraft && (existingDraft.elapsedSeconds > 15 || existingDraft.exerciseLogs.some(e => e.sets.some(s => s.completed)))) {
      showToast('Resumed your in-progress workout session!', 'info');
    }
  }, []);

  // Real-time automatic persistence of active workout draft to localStorage
  useEffect(() => {
    if (!currentUser || !day || !plan || isCompletedModalOpen) return;
    saveActiveWorkoutDraft({
      userId: currentUser.id,
      planId: plan.id,
      dayId: day.id,
      dayName: day.dayName,
      startedAt: existingDraft?.startedAt || new Date().toISOString(),
      elapsedSeconds,
      lastUpdated: new Date().toISOString(),
      lastActivityAt: lastActivityAtRef.current,
      estimatedMinutes: day.estimatedMinutes || 60,
      exerciseLogs
    });
  }, [exerciseLogs, elapsedSeconds, currentUser, day, plan, existingDraft?.startedAt, isCompletedModalOpen]);

  // Elapsed workout timer interval with inactivity timeout check
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Coach estimated minutes + 15 min buffer
          const estimatedMin = day?.estimatedMinutes || 60;
          const maxAllowedSeconds = (estimatedMin + 15) * 60;
          if (next > maxAllowedSeconds) {
            const lastActiveTime = new Date(lastActivityAtRef.current).getTime();
            const inactivityMillis = Date.now() - lastActiveTime;
            // 15 min inactivity beyond estimated session time
            if (inactivityMillis > 15 * 60 * 1000) {
              if (currentUser && day) {
                const todayStr = new Date().toISOString().split('T')[0];
                markWorkoutAsUnfinished({
                  userId: currentUser.id,
                  dayId: day.id,
                  dayName: day.dayName,
                  date: todayStr,
                  reason: 'timeout_inactivity',
                  timedOutAt: new Date().toISOString()
                });
                clearActiveWorkoutDraft(currentUser.id, day.id);
              }
              showToast('Session ended due to inactivity timeout.', 'info');
              onExit();
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, day, currentUser, onExit, showToast]);

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
    lastActivityAtRef.current = new Date().toISOString();
    setExerciseLogs((prev) =>
      prev.map((ex, exI) => {
        if (exI !== exerciseIndex) return ex;
        const newSets = ex.sets.map((s, sI) => {
          if (sI !== setIndex) return s;
          return {
            ...s,
            [field]: Math.max(0, val)
          };
        });
        return {
          ...ex,
          sets: newSets
        };
      })
    );
  };

  // Toggle set complete: validates weight & reps, checks/unchecks and auto-advances
  const handleToggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    lastActivityAtRef.current = new Date().toISOString();
    const routineEx = sessionExercises?.[exerciseIndex];
    const currentSet = exerciseLogs[exerciseIndex]?.sets?.[setIndex];
    if (!currentSet) return;

    const currentStatus = currentSet.completed;
    const newStatus = !currentStatus;

    // Validation check: If marking complete, user must enter weight and reps
    if (newStatus) {
      const isBodyweight = 
        routineEx?.equipment?.toLowerCase().includes('bodyweight') ||
        routineEx?.equipment?.toLowerCase().includes('body weight') ||
        routineEx?.equipment?.toLowerCase().includes('none') ||
        routineEx?.targetMuscle?.toLowerCase().includes('abs') ||
        routineEx?.exerciseName?.toLowerCase().includes('pull up') ||
        routineEx?.exerciseName?.toLowerCase().includes('chin up') ||
        routineEx?.exerciseName?.toLowerCase().includes('push up') ||
        routineEx?.exerciseName?.toLowerCase().includes('dip') ||
        routineEx?.exerciseName?.toLowerCase().includes('plank');

      if (!isBodyweight && (currentSet.weightKg === undefined || currentSet.weightKg <= 0)) {
        showToast('Please enter the weight (KG) before checking the set!', 'error');
        const weightInput = document.getElementById(`set-weight-${exerciseIndex}-${setIndex}`);
        if (weightInput) {
          weightInput.focus();
          (weightInput as HTMLInputElement).select?.();
        }
        return;
      }

      if (!currentSet.reps || currentSet.reps <= 0) {
        showToast('Please enter your reps count before checking the set!', 'error');
        const repsInput = document.getElementById(`set-reps-${exerciseIndex}-${setIndex}`);
        if (repsInput) {
          repsInput.focus();
          (repsInput as HTMLInputElement).select?.();
        }
        return;
      }
    }

    // Pure immutable state update
    setExerciseLogs((prev) =>
      prev.map((ex, exI) => {
        if (exI !== exerciseIndex) return ex;
        const newSets = ex.sets.map((s, sI) => {
          if (sI !== setIndex) return s;
          return {
            ...s,
            completed: newStatus
          };
        });
        return {
          ...ex,
          sets: newSets
        };
      })
    );

    // If marked complete, launch rest timer and focus next set input automatically!
    if (newStatus && routineEx) {
      const restDuration = routineEx.restSeconds || 150;
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
      // If unchecking a set, cancel and clear the active rest timer HUD immediately
      setRestSecondsLeft(null);
      setActiveRestExerciseName('');
      showToast(`Set ${setIndex + 1} unchecked`, 'info');
    }
  };

  const handleAddSet = (exerciseIndex: number) => {
    setExerciseLogs((prev) =>
      prev.map((ex, idx) => {
        if (idx !== exerciseIndex) return ex;
        const currentSets = ex.sets || [];
        const lastSet = currentSets[currentSets.length - 1];
        const newSet: LoggedSet = {
          setNumber: currentSets.length + 1,
          weightKg: lastSet ? lastSet.weightKg : 0,
          reps: lastSet ? lastSet.reps : 4,
          completed: false
        };
        return {
          ...ex,
          sets: [...currentSets, newSet]
        };
      })
    );
    showToast('Added set', 'info');
  };

  const handleRemoveSet = (exerciseIndex: number) => {
    setExerciseLogs((prev) =>
      prev.map((ex, idx) => {
        if (idx !== exerciseIndex) return ex;
        if ((ex.sets?.length || 0) <= 1) return ex;
        return {
          ...ex,
          sets: ex.sets.slice(0, -1)
        };
      })
    );
    setRestSecondsLeft(null);
    setActiveRestExerciseName('');
  };

  const handleFinishWorkout = () => {
    if (!currentUser) return;
    setIsTimerRunning(false);

    let completedSetsCount = 0;
    const prsAchieved: string[] = [];

    // Finalize all exercises: mark sets with weight as completed
    const finalizedExercises = exerciseLogs.map((ex) => {
      const sets = ex.sets.map((s) => {
        const isSetDone = s.completed || s.weightKg > 0;
        if (isSetDone) {
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

    const totalVolume = workoutService.calculateLoggedVolumeLoadKg(finalizedExercises);

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
        colors: ['#2f80ed', '#ffffff', '#3897f0']
      });
    } catch {
      // ignore
    }

    const newLogId = `log-${Date.now()}`;
    setLastSavedLogId(newLogId);

    // Save ALL completed exercises across the whole workout session into database/logs
    saveWorkoutLog({
      id: newLogId,
      userId: currentUser.id,
      planId: plan.id,
      dayId: day.id,
      dayName: day.dayName,
      date: new Date().toISOString().split('T')[0],
      durationSeconds: elapsedSeconds,
      totalVolumeKg: totalVolume,
      completedExercises: finalizedExercises.filter(ex => ex.sets.some(s => s.completed || s.weightKg > 0))
    });

    // Clear active in-progress draft from storage
    clearActiveWorkoutDraft(currentUser.id, day.id);

    showToast('All exercises saved to your progress history!', 'success');
  };

  // Restart workout from scratch: deletes the just-saved log from database/history and resets all inputs
  const handleRestartWorkout = async () => {
    if (!currentUser) return;
    if (lastSavedLogId) {
      await deleteWorkoutLog(lastSavedLogId);
      setLastSavedLogId(null);
    }
    clearActiveWorkoutDraft(currentUser.id, day.id);
    setElapsedSeconds(0);
    setExerciseLogs(createFreshExerciseLogs());
    setRestSecondsLeft(null);
    setCompletedSummary(null);
    setIsCompletedModalOpen(false);
    setIsTimerRunning(true);
    showToast('Workout restarted from scratch! History log cleared.', 'success');
  };

  // Reset in-progress session back to 00:00 and clean sets
  const handleResetSession = () => {
    if (!currentUser) return;
    clearActiveWorkoutDraft(currentUser.id, day.id);
    setElapsedSeconds(0);
    setExerciseLogs(createFreshExerciseLogs());
    setRestSecondsLeft(null);
    setIsResetConfirmOpen(false);
    setIsTimerRunning(true);
    showToast('Workout session reset to start fresh', 'info');
  };

  // Overall workout completion progress calculation
  const totalSetsCount = exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalCompletedSets = exerciseLogs.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const completedExercisesCount = exerciseLogs.filter(ex => ex.sets.every(s => s.completed)).length;
  const progressPercent = totalSetsCount > 0 ? Math.round((totalCompletedSets / totalSetsCount) * 100) : 0;

  // Exercise category icon mapper
  const getExerciseIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('lat') || n.includes('row') || n.includes('pull')) {
      return <Layers className="w-5 h-5 text-[#2f80ed]" />;
    }
    if (n.includes('bench') || n.includes('press') || n.includes('chest')) {
      return <Dumbbell className="w-5 h-5 text-[#2f80ed]" />;
    }
    return <Activity className="w-5 h-5 text-amber-400" />;
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-36 px-2 sm:px-0">
      
      {/* 1. Top HUD Control Bar (Dynamic Island & Notch Safe) */}
      <div className="sticky top-0 z-30 pt-[max(6px,env(safe-area-inset-top))] pb-2 bg-[#0a0a0c]/95 backdrop-blur-md w-full">
        <div className="flex items-center justify-between gap-2 w-full">
          
          {/* Left Controls: Exit, Sound, Plate Calc */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Close/Exit Button */}
            <button
              onClick={onExit}
              className="w-9 h-9 rounded-2xl bg-[#18191e] border border-[#24262e] text-zinc-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 active:scale-95 cursor-pointer"
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
                  ? 'bg-[#2f80ed]/15 text-[#2f80ed] border-[#2f80ed]/40' 
                  : 'bg-[#18191e] text-zinc-500 border-[#24262e]'
              }`}
              title={soundEnabled ? 'Timer Sound On' : 'Timer Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 stroke-[2.2]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset / Restart Session Button */}
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-9 h-9 rounded-2xl bg-[#18191e] border border-[#24262e] text-zinc-400 hover:text-amber-400 hover:border-amber-400/30 flex items-center justify-center transition-colors flex-shrink-0 active:scale-95 cursor-pointer"
              title="Reset Workout Session"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Right: Stopwatch Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#18191e] border border-[#24262e] flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-zinc-400 hover:text-[#2f80ed] transition-colors active:scale-95 cursor-pointer"
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
            <span className="text-sm font-extrabold text-[#2f80ed] tracking-tight">
              {day.dayName}
            </span>
          </div>

          {/* Exercises Counter */}
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold mr-1.5">
              EXERCISES
            </span>
            <span className="font-mono text-xs font-extrabold text-white">
              <span className="text-[#2f80ed]">{completedExercisesCount}</span> / {sessionExercises.length}
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1.5 bg-[#141519] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#2f80ed] rounded-full transition-all duration-300 shadow-[0_0_8px_#2f80ed]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Main Routine Exercise Cards Stack (All Exercises with Full Set Logging Logic) */}
      <div className="space-y-4">
        {sessionExercises.map((routineEx, exIdx) => {
          const logEntry = exerciseLogs[exIdx];
          const prevSets = previousExerciseData[routineEx.exerciseName];
          const safeVideoUrl = sanitizeUrl(routineEx.videoUrl);
          const hasGuide = Boolean(safeVideoUrl);
          const altName =
            routineEx.alternativeExercise ||
            routineEx.alternatives?.[0]?.name ||
            COMMON_FALLBACK_ALTS[routineEx.exerciseName];
          const hasAlt = Boolean(altName);
          const hasBar = hasGuide || hasAlt;

          return (
            <div
              key={routineEx.id || `routine-${exIdx}`}
              className="relative p-4 sm:p-5 rounded-3xl bg-[#18191e] border border-[#24262e] shadow-xl space-y-3 overflow-hidden"
            >
              {/* Subtle Left Accent Glow Line */}
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#2f80ed] rounded-l-3xl shadow-[0_0_12px_#2f80ed]" />

              {/* Exercise Header: Number Badge on far left, Trash on far right, 2 text lines centered */}
              <div className="relative flex items-center justify-center min-h-[42px] px-10">
                {/* Number Badge alone on far left, vertically centered between the two lines */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#141519] border border-[#24262e] text-[#2f80ed] font-mono text-xs font-black flex items-center justify-center flex-shrink-0 shadow-inner">
                  {exIdx + 1}
                </div>

                {/* 2 Lines: Exercise Name + Sets/Reps/RIR completely centered */}
                <div className="flex flex-col items-center justify-center text-center min-w-0 max-w-full">
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug truncate max-w-full">
                    {routineEx.exerciseName}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[11px] font-mono text-zinc-400">
                    <span className="text-[#2f80ed] font-semibold">
                      {routineEx.sets} Sets × {routineEx.targetReps} Reps
                    </span>
                    {routineEx.targetRpe && (() => {
                      const rpeStr = String(routineEx.targetRpe).trim();
                      const formattedRir = rpeStr.toLowerCase().includes('rir')
                        ? rpeStr
                        : `${rpeStr.replace(/rpe/gi, '').trim()} RIR`;
                      return (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">{formattedRir}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Delete button positioned in top-right of header */}
                <button
                  type="button"
                  onClick={() => handleRemoveExerciseFromSession(exIdx)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-[#141519] transition-colors cursor-pointer flex-shrink-0"
                  title="Remove exercise from workout"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Utility Action Bar: Alternative (Primary/Left, Full Name) & Video Guide (Right, Compact) */}
              {hasBar && (
                <div className="flex items-center gap-2 pt-0.5">
                  {/* Alternative Exercise Button: Prominent on the left, full exercise name without "Alt:" prefix */}
                  {hasAlt && (
                    <button
                      type="button"
                      onClick={() => handleSwapBadeel(exIdx)}
                      className="flex-1 h-8 px-3 rounded-xl bg-[#141519] hover:bg-[#1c1d22] hover:border-[#2f80ed]/40 text-zinc-200 hover:text-white border border-[#24262e] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center whitespace-nowrap min-w-0 active:scale-[0.99]"
                      title={`Swap to ${altName}`}
                    >
                      <Repeat className="w-3.5 h-3.5 text-[#2f80ed] flex-shrink-0" />
                      <span className="truncate">{altName}</span>
                    </button>
                  )}

                  {/* Video Guide Button: Compact on the right */}
                  {hasGuide && (
                    <a
                      href={safeVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`h-8 px-2.5 rounded-xl bg-[#141519] hover:bg-[#1c1d22] text-[#2f80ed] border border-[#24262e] text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap active:scale-[0.99] ${
                        hasAlt ? 'flex-shrink-0' : 'flex-1'
                      }`}
                      title="Watch Exercise Video Guide"
                    >
                      <Video className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{hasAlt ? 'Video' : 'Video Guide'}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Technique Cue Callout if present */}
              {routineEx.notes && (
                <div className="px-3 py-2 rounded-2xl bg-[#141519] border border-[#24262e] text-xs text-zinc-300 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#2f80ed] flex-shrink-0 mt-0.5" />
                  <p className="leading-snug text-zinc-300">{routineEx.notes}</p>
                </div>
              )}

              {/* 4. Interactive Sets Logging Table (Sleek, Proportional, Clean) */}
              <div className="space-y-2">
                {/* Header Labels */}
                <div className="grid grid-cols-[24px_1fr_1fr_36px] items-center gap-2 px-1 text-[9px] font-mono uppercase font-bold text-zinc-500 text-center">
                  <span>#</span>
                  <span>KG</span>
                  <span>REPS</span>
                  <Check className="w-3 h-3 mx-auto" />
                </div>

                {/* Set Rows */}
                {logEntry?.sets.map((set, sIdx) => {
                  const prCheck = checkLiveSetPR(routineEx.exerciseName, set.weightKg, set.reps, pastLogs);

                  return (
                    <div
                      key={sIdx}
                      className="grid grid-cols-[24px_1fr_1fr_36px] items-center gap-2 text-center relative"
                    >
                      {/* # Set Number */}
                      <span className="font-mono text-[11px] font-bold text-zinc-400">
                        {set.setNumber}
                      </span>

                      {/* KG Input Pill with Auto-Clear Zero and Live PR Flame Indicator */}
                      <div className="relative rounded-xl bg-[#141519] border border-[#24262e] focus-within:border-[#2f80ed] focus-within:ring-1 focus-within:ring-[#2f80ed]/30 py-1.5 px-2 flex flex-col items-center justify-center transition-all shadow-xs">
                        {prCheck.isNewPR && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.2 rounded-full bg-[#2f80ed] text-white font-mono text-[8px] font-black tracking-tighter whitespace-nowrap shadow-sm shadow-[#2f80ed]/40 flex items-center gap-0.5 animate-bounce">
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
                          className="w-full bg-transparent font-numeric font-bold text-sm text-white text-center focus:outline-none placeholder-zinc-600 leading-tight"
                        />
                        <span className="text-[8px] font-mono font-semibold text-zinc-500 uppercase tracking-wider pointer-events-none">
                          KG
                        </span>
                      </div>

                      {/* REPS Input Pill with Auto-Clear Zero on Typing */}
                      <div className="relative rounded-xl bg-[#141519] border border-[#24262e] focus-within:border-[#2f80ed] focus-within:ring-1 focus-within:ring-[#2f80ed]/30 py-1.5 px-2 flex flex-col items-center justify-center transition-all shadow-xs">
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
                          className="w-full bg-transparent font-numeric font-bold text-sm text-white text-center focus:outline-none placeholder-zinc-600 leading-tight"
                        />
                        <span className="text-[8px] font-mono font-semibold text-zinc-500 uppercase tracking-wider pointer-events-none">
                          REPS
                        </span>
                      </div>

                      {/* Done / Checkmark Action Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSetComplete(exIdx, sIdx)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                          set.completed
                            ? 'bg-[#2f80ed] text-white shadow-md shadow-[#2f80ed]/30 scale-102'
                            : 'bg-[#141519] text-zinc-600 border border-[#24262e] hover:text-zinc-300'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Set Action Controls (+ Add Set / - Remove Set) */}
              <div className="flex items-center justify-between border-t border-[#24262e] pt-2.5 px-1">
                <button
                  type="button"
                  onClick={() => handleAddSet(exIdx)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#2f80ed] hover:underline cursor-pointer"
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

      {/* 4 & 5. Bottom Actions: Compact Add Movement + Heroic Finish Workout CTA */}
      <div className="space-y-2.5 pt-2 pb-5">
        {/* Compact secondary button for adding extra movement */}
        <button
          type="button"
          onClick={() => setIsAddMovementModalOpen(true)}
          className="w-full py-2 px-3.5 rounded-xl bg-[#141519] border border-dashed border-[#24262e] hover:border-[#2f80ed]/50 hover:bg-[#18191e] text-[11px] font-bold text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.99]"
        >
          <Plus className="w-3.5 h-3.5 text-[#2f80ed] stroke-[2.5]" />
          <span>Add Extra Movement To Session</span>
        </button>

        {/* Big, prominent, heroic primary CTA */}
        <button
          onClick={handleFinishWorkout}
          className="w-full py-3.5 sm:py-4 px-6 rounded-2xl btn-cyan text-sm sm:text-base font-black tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#2f80ed]/25 cursor-pointer active:scale-[0.99] transition-transform"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>FINISH WORKOUT</span>
        </button>
      </div>

      {/* Add Extra Movement Modal */}
      {isAddMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-[#18191e] border border-[#24262e] rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#24262e]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#141519] border border-[#24262e] text-[#2f80ed] flex items-center justify-center">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    Add Movement To Session
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Select an exercise from your library to append to this workout
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMovementModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#141519]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="py-3 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={addMovementSearch}
                  onChange={(e) => setAddMovementSearch(e.target.value)}
                  placeholder="Search exercise name or muscle..."
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#141519] border border-[#24262e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#2f80ed]/60 font-semibold"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setAddMovementMuscleFilter('All')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                    addMovementMuscleFilter === 'All'
                      ? 'bg-[#141519] text-[#2f80ed] border border-[#2f80ed]/40'
                      : 'bg-[#141519] text-zinc-400 hover:text-white border border-[#24262e]'
                  }`}
                >
                  All ({exercises.length})
                </button>
                {['Chest', 'Back', 'Shoulders', 'Arms', 'Quads', 'Hamstrings', 'Glutes', 'Core', 'Full Body'].map((m) => {
                  const count = exercises.filter((e) => e.targetMuscle === m).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAddMovementMuscleFilter(m)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                        addMovementMuscleFilter === m
                          ? 'bg-[#141519] text-[#2f80ed] border border-[#2f80ed]/40'
                          : 'bg-[#141519] text-zinc-400 hover:text-white border border-[#24262e]'
                      }`}
                    >
                      {m} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[45vh]">
              {exercises
                .filter((ex) => {
                  const matchMuscle = addMovementMuscleFilter === 'All' || ex.targetMuscle === addMovementMuscleFilter;
                  const matchSearch = ex.name.toLowerCase().includes(addMovementSearch.toLowerCase()) ||
                    (ex.alternativeExercise && ex.alternativeExercise.toLowerCase().includes(addMovementSearch.toLowerCase()));
                  return matchMuscle && matchSearch;
                })
                .map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleAddExerciseToSession(ex)}
                    className="p-3 rounded-2xl bg-[#141519] border border-[#24262e] hover:border-[#2f80ed]/40 hover:bg-[#1c1d22] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-[#2f80ed] transition-colors">
                          {ex.name}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#18191e] text-zinc-300">
                          {ex.targetMuscle}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#18191e] text-zinc-400">
                          {ex.equipment}
                        </span>
                      </div>
                      {ex.alternativeExercise && (
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Badeel: {ex.alternativeExercise}
                        </p>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-[#18191e] border border-[#24262e] group-hover:bg-[#2f80ed] group-hover:text-white flex items-center justify-center text-zinc-400 transition-colors flex-shrink-0">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Active Rest Timer HUD (Docked above bottom nav) */}
      {restSecondsLeft !== null && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm p-3.5 rounded-3xl bg-[#18191e]/95 border border-[#2f80ed]/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#2f80ed] text-white flex items-center justify-center font-numeric font-black text-sm shadow-md shadow-[#2f80ed]/25 flex-shrink-0">
                {restSecondsLeft}s
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#2f80ed] font-bold block">
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
                className="px-2 py-1 rounded-lg bg-[#141519] hover:bg-[#1c1d22] text-zinc-200 text-xs font-mono font-bold transition-colors border border-[#24262e]"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => setRestSecondsLeft((prev) => (prev && prev > 15 ? prev - 15 : 0))}
                className="px-2 py-1 rounded-lg bg-[#141519] hover:bg-[#1c1d22] text-zinc-200 text-xs font-mono font-bold transition-colors border border-[#24262e]"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => setRestSecondsLeft(null)}
                className="px-2.5 py-1 rounded-lg bg-[#141519] hover:bg-[#1c1d22] text-white text-xs font-bold transition-colors border border-[#24262e]"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Celebration Modal */}
      {isCompletedModalOpen && completedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#18191e] border border-[#24262e] rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-[#2f80ed] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#2f80ed]/30">
              <Award className="w-7 h-7 stroke-[2.5]" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-wider text-[#2f80ed] font-bold px-2.5 py-0.5 rounded-full bg-[#2f80ed]/10 border border-[#2f80ed]/20">
              Session Completed
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-2">
              Solid Workout!
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Your workout session has been logged and recorded successfully.
            </p>

            {/* PRs Achieved in this session callout */}
            {completedSummary.prsAchieved && completedSummary.prsAchieved.length > 0 && (
              <div className="mt-3 text-left p-3 rounded-2xl bg-[#141519] border border-[#2f80ed]/30 shadow-md">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2f80ed] mb-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Progressive Overload Achieved!</span>
                </div>
                <div className="space-y-1">
                  {completedSummary.prsAchieved.map((pr, idx) => (
                    <p key={idx} className="text-[11px] font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2f80ed]" />
                      <span>{pr}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 my-4 p-3.5 rounded-2xl bg-[#141519] border border-[#24262e]">
              <div>
                <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Duration</span>
                <span className="text-sm font-extrabold font-numeric text-white">{completedSummary.duration}</span>
              </div>
              <div className="border-x border-[#24262e]">
                <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Volume</span>
                <span className="text-sm font-extrabold font-numeric text-[#2f80ed]">{completedSummary.totalVolume.toLocaleString()} kg</span>
              </div>
              <div>
                <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Sets Done</span>
                <span className="text-sm font-extrabold font-numeric text-white">{completedSummary.completedSetsCount}</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={onSessionCompleted}
                className="w-full py-3.5 rounded-2xl btn-cyan text-xs font-black tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2f80ed]/25"
              >
                <span>Back to Home</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleRestartWorkout}
                className="w-full py-3 rounded-2xl bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#2f80ed]" />
                <span>Restart Workout & Clear History</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Session Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-[#18191e] border border-[#24262e] rounded-3xl p-5 shadow-2xl text-center relative animate-in zoom-in-95 duration-150 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Reset Workout Session?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                This will reset the timer to 00:00 and clear all checked sets so you can start over fresh.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-[#141519] border border-[#24262e] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetSession}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black cursor-pointer shadow-md shadow-amber-500/20"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
