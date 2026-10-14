/**
 * @file LiveWorkoutSession.jsx
 * @description شاشة جلسة التمرين المباشر للمتدرب (Live Workout Session)
 * بعد تفكيك الملف العملاق (55KB) وفصل التايمرات والبطاقات والمودالات وفق Clean Architecture.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  Plus, 
  X, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2 
} from 'lucide-react';
import { 
  getActiveWorkoutDraft, 
  saveActiveWorkoutDraft, 
  clearActiveWorkoutDraft 
} from '@/lib/activeWorkoutEngine';
import { workoutService } from '@/services/workoutService';
import { checkLiveSetPR } from '@/lib/progressEngine';
import { useRestTimer } from '@/hooks/useRestTimer';

import { LiveExerciseCard } from './workout/LiveExerciseCard';
import { RestTimerOverlay } from './workout/RestTimerOverlay';
import { ExerciseSwapModal } from './workout/ExerciseSwapModal';
import { WorkoutCelebrationModal } from './workout/WorkoutCelebrationModal';
import { AddMovementModal } from './workout/AddMovementModal';

const COMMON_FALLBACK_ALTS = {
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

export const LiveWorkoutSession = ({
  plan,
  day,
  onExit,
  onSessionCompleted
}) => {
  const { currentUser, saveWorkoutLog, deleteWorkoutLog, getUserLogs, exercises } = useGym();
  const { showToast } = useToast();

  // قائمة تمارين الجلسة الحالية
  const [sessionExercises, setSessionExercises] = useState(() => {
    return day?.exercises && Array.isArray(day.exercises) ? [...day.exercises] : [];
  });

  // فحص وجود مسودة تمرين سابقة غير مكتملة
  const existingDraft = useMemo(() => {
    if (!currentUser?.id || !day?.id) return null;
    return getActiveWorkoutDraft(currentUser.id, day.id);
  }, [currentUser?.id, day?.id]);

  // عداد الوقت المنقضي في التمرين
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (existingDraft && typeof existingDraft.elapsedSeconds === 'number') {
      return existingDraft.elapsedSeconds;
    }
    return 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastSavedLogId, setLastSavedLogId] = useState(null);

  // استخدام هوك عداد الراحة المستخرج
  const {
    restSecondsLeft,
    totalRestDuration,
    activeRestExerciseName,
    startRestTimer,
    addRestSeconds,
    skipRestTimer
  } = useRestTimer(soundEnabled);

  // السجلات السابقة كمرجع للأوزان والأرقام القياسية
  const pastLogs = useMemo(() => (currentUser ? getUserLogs(currentUser.id) : []), [currentUser, getUserLogs]);
  const previousExerciseData = useMemo(() => {
    const memory = {};
    if (!pastLogs || !Array.isArray(pastLogs)) return memory;
    for (const log of pastLogs) {
      if (!log || !log.completedExercises) continue;
      for (const ex of log.completedExercises) {
        if (!ex || !ex.exerciseName) continue;
        if (!memory[ex.exerciseName]) {
          const completedSets = (ex.sets || []).filter((s) => s && s.completed);
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

  // توليد سجلات مجموعات فارغة للتمرين
  const createFreshExerciseLogs = useCallback(() => {
    const list = sessionExercises && Array.isArray(sessionExercises) ? sessionExercises : (day?.exercises || []);
    return list.map((ex, idx) => {
      const exName = ex?.exerciseName || `Exercise ${idx + 1}`;
      const prevData = previousExerciseData[exName];
      const setsCount = Math.max(1, ex?.sets !== undefined ? ex.sets : 1);
      return {
        exerciseId: ex?.exerciseId || ex?.id || `ex-${idx}`,
        exerciseName: exName,
        targetMuscle: ex?.targetMuscle || 'Full Body',
        sets: Array.from({ length: setsCount }, (_, i) => ({
          setNumber: i + 1,
          weightKg: prevData && prevData[i] ? prevData[i].weightKg : 0,
          reps: prevData && prevData[i] ? prevData[i].reps : 0,
          completed: false
        }))
      };
    });
  }, [sessionExercises, day?.exercises, previousExerciseData]);

  // سجلات مجموعات التمرين المباشرة
  const [exerciseLogs, setExerciseLogs] = useState(() => {
    if (existingDraft && Array.isArray(existingDraft.exerciseLogs) && existingDraft.exerciseLogs.length > 0) {
      return existingDraft.exerciseLogs;
    }
    return createFreshExerciseLogs();
  });

  // مودالات التبديل، الإضافة، والاحتفال
  const [isAddMovementModalOpen, setIsAddMovementModalOpen] = useState(false);
  const [swapTargetIdx, setSwapTargetIdx] = useState(null);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState(null);

  // تحديث عداد وقت التمرين المنقضي
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // حفظ تلقائي للمسودة فور أي تعديل لحماية بيانات المتدرب من الضياع
  useEffect(() => {
    if (!currentUser || !day) return;
    saveActiveWorkoutDraft({
      userId: currentUser.id,
      planId: plan.id,
      dayId: day.id,
      dayName: day.dayName,
      startedAt: existingDraft?.startedAt || new Date().toISOString(),
      elapsedSeconds,
      lastUpdated: new Date().toISOString(),
      exerciseLogs
    });
  }, [currentUser, day, plan, elapsedSeconds, exerciseLogs, existingDraft]);

  const handleToggleSet = (exIdx, setIdx) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const targetEx = { ...next[exIdx] };
      const targetSets = [...targetEx.sets];
      const cur = targetSets[setIdx];
      const willBeCompleted = !cur.completed;

      targetSets[setIdx] = {
        ...cur,
        completed: willBeCompleted
      };
      targetEx.sets = targetSets;
      next[exIdx] = targetEx;

      // عند إتمام المجموعة، نبدأ عداد الراحة تلقائياً
      if (willBeCompleted) {
        const routineEx = sessionExercises[exIdx];
        const restDuration = routineEx?.restSeconds || 120;
        startRestTimer(restDuration, routineEx?.exerciseName || '');
      }

      return next;
    });
  };

  const handleWeightChange = (exIdx, setIdx, value) => {
    const val = Number(value) || 0;
    setExerciseLogs((prev) => {
      const next = [...prev];
      const targetEx = { ...next[exIdx] };
      const targetSets = [...targetEx.sets];
      targetSets[setIdx] = { ...targetSets[setIdx], weightKg: val };
      targetEx.sets = targetSets;
      next[exIdx] = targetEx;
      return next;
    });
  };

  const handleRepsChange = (exIdx, setIdx, value) => {
    const val = Number(value) || 0;
    setExerciseLogs((prev) => {
      const next = [...prev];
      const targetEx = { ...next[exIdx] };
      const targetSets = [...targetEx.sets];
      targetSets[setIdx] = { ...targetSets[setIdx], reps: val };
      targetEx.sets = targetSets;
      next[exIdx] = targetEx;
      return next;
    });
  };

  const handleAddSet = (exIdx) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const targetEx = { ...next[exIdx] };
      const prevSet = targetEx.sets[targetEx.sets.length - 1];
      targetEx.sets = [
        ...targetEx.sets,
        {
          setNumber: targetEx.sets.length + 1,
          weightKg: prevSet ? prevSet.weightKg : 0,
          reps: prevSet ? prevSet.reps : 0,
          completed: false
        }
      ];
      next[exIdx] = targetEx;
      return next;
    });
  };

  const handleRemoveSet = (exIdx) => {
    setExerciseLogs((prev) => {
      const next = [...prev];
      const targetEx = { ...next[exIdx] };
      if (targetEx.sets.length <= 1) return prev;
      targetEx.sets = targetEx.sets.slice(0, -1);
      next[exIdx] = targetEx;
      return next;
    });
  };

  const handleSwapBadeel = (exIdx) => {
    const currentEx = sessionExercises[exIdx];
    const altName = currentEx?.alternativeExercise || COMMON_FALLBACK_ALTS[currentEx?.exerciseName || ''];
    if (!altName) return;

    const oldName = currentEx.exerciseName;
    const updated = [...sessionExercises];
    updated[exIdx] = {
      ...currentEx,
      exerciseName: altName,
      alternativeExercise: oldName
    };
    setSessionExercises(updated);

    setExerciseLogs((prev) => {
      const next = [...prev];
      if (next[exIdx]) {
        next[exIdx] = { ...next[exIdx], exerciseName: altName };
      }
      return next;
    });

    showToast(`Swapped to "${altName}"!`, 'info');
  };

  const handleRemoveExercise = (exIdx) => {
    const exToRemove = sessionExercises[exIdx];
    setSessionExercises((prev) => prev.filter((_, idx) => idx !== exIdx));
    setExerciseLogs((prev) => prev.filter((_, idx) => idx !== exIdx));
    showToast(`Removed "${exToRemove?.exerciseName || 'Exercise'}"`, 'info');
  };

  const handleAddExercise = (ex) => {
    const newRoutineEx = {
      id: `routine-extra-${Date.now()}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscle,
      equipment: ex.equipment,
      sets: 3,
      targetReps: '8-12',
      restSeconds: 120,
      alternativeExercise: ex.alternativeExercise,
      videoUrl: ex.videoUrl,
      notes: ex.executionCue
    };

    const prevData = previousExerciseData[ex.name];
    const newLogEntry = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscle,
      sets: Array.from({ length: 3 }, (_, i) => ({
        setNumber: i + 1,
        weightKg: prevData && prevData[i] ? prevData[i].weightKg : 0,
        reps: prevData && prevData[i] ? prevData[i].reps : 0,
        completed: false
      }))
    };

    setSessionExercises((prev) => [...prev, newRoutineEx]);
    setExerciseLogs((prev) => [...prev, newLogEntry]);
    setIsAddMovementModalOpen(false);
    showToast(`Added "${ex.name}" to workout!`, 'success');
  };

  // إنهاء التمرين وحفظه في سجل المتدرب وقاعدة البيانات
  const handleFinishWorkout = () => {
    if (!currentUser) return;
    setIsTimerRunning(false);

    let completedSetsCount = 0;
    const prsAchieved = [];

    const finalizedExercises = exerciseLogs.map((ex) => {
      const sets = ex.sets.map((s) => {
        const isSetDone = s.completed || s.weightKg > 0;
        if (isSetDone) {
          completedSetsCount++;
          if (s.weightKg > 0) {
            const prCheck = checkLiveSetPR(ex.exerciseName, s.weightKg, s.reps, pastLogs);
            if (prCheck.isNewPR && !prsAchieved.some((p) => p.includes(ex.exerciseName))) {
              prsAchieved.push(`${ex.exerciseName}: ${s.weightKg}kg (${prCheck.label || 'PR'})`);
            }
          }
        }
        return { ...s, completed: isSetDone };
      });
      return { ...ex, sets };
    });

    const totalVolume = workoutService.calculateLoggedVolumeLoadKg(finalizedExercises);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    setCompletedSummary({
      duration: durationFormatted,
      totalVolume,
      completedSetsCount,
      prsAchieved
    });
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

    saveWorkoutLog({
      id: newLogId,
      userId: currentUser.id,
      planId: plan.id,
      dayId: day.id,
      dayName: day.dayName,
      date: new Date().toISOString().split('T')[0],
      durationSeconds: elapsedSeconds,
      totalVolumeKg: totalVolume,
      completedExercises: finalizedExercises.filter((ex) => ex.sets.some((s) => s.completed || s.weightKg > 0))
    });

    clearActiveWorkoutDraft(currentUser.id, day.id);
    showToast('Workout successfully saved to your history!', 'success');
  };

  const handleRestartWorkout = async () => {
    if (!currentUser) return;
    if (lastSavedLogId) {
      await deleteWorkoutLog(lastSavedLogId);
      setLastSavedLogId(null);
    }
    clearActiveWorkoutDraft(currentUser.id, day.id);
    setElapsedSeconds(0);
    setExerciseLogs(createFreshExerciseLogs());
    skipRestTimer();
    setCompletedSummary(null);
    setIsCompletedModalOpen(false);
    setIsTimerRunning(true);
    showToast('Workout restarted from scratch!', 'info');
  };

  const totalSetsCount = exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalCompletedSets = exerciseLogs.reduce((acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0);
  const progressPercent = totalSetsCount > 0 ? Math.round((totalCompletedSets / totalSetsCount) * 100) : 0;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  if (!currentUser) return null;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-36 px-2 sm:px-0 select-none">
      {/* 1. الشريط العلوي: الخروج، الصوت، العداد */}
      <div className="sticky top-0 z-30 pt-[max(6px,env(safe-area-inset-top))] pb-2 bg-[var(--bg-page)]/95 backdrop-blur-md w-full">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onExit}
              className="w-9 h-9 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Exit Workout"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-[var(--main-color)]/15 text-[var(--main-color)] border-[var(--main-color)]/40' 
                  : 'bg-[var(--card-bg)] text-zinc-500 border-[var(--card-border)]'
              }`}
              title={soundEnabled ? 'Timer Sound On' : 'Timer Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shrink-0 font-mono">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-zinc-400 hover:text-[var(--main-color)] cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <span className="font-numeric text-sm font-extrabold text-white">
              {timeFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* 2. شريط التقدم الدائري أو الخطي */}
      <div className="pt-1 pb-1">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-sm font-extrabold text-[var(--main-color)] tracking-tight">
            {day.dayName}
          </span>
          <span className="font-mono text-xs font-extrabold text-white">
            <span className="text-[var(--main-color)]">{totalCompletedSets}</span> / {totalSetsCount} Sets
          </span>
        </div>
        <div className="w-full h-1.5 bg-[var(--card-subtle-bg)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--main-color)] rounded-full transition-all duration-300 shadow-[0_0_8px_var(--main-color)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. كروت التمارين */}
      <div className="space-y-4">
        {sessionExercises.map((routineEx, exIdx) => (
          <LiveExerciseCard
            key={routineEx.id || `routine-${exIdx}`}
            exerciseIndex={exIdx}
            routineEx={routineEx}
            logEntry={exerciseLogs[exIdx]}
            previousSets={previousExerciseData[routineEx.exerciseName]}
            pastLogs={pastLogs}
            onWeightChange={handleWeightChange}
            onRepsChange={handleRepsChange}
            onToggleSet={handleToggleSet}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onSwapBadeel={handleSwapBadeel}
            onRemoveExercise={handleRemoveExercise}
          />
        ))}
      </div>

      {/* زر إضافة حركة جديدة وزر إنهاء التمرين */}
      <div className="pt-3 space-y-2">
        <button
          type="button"
          onClick={() => setIsAddMovementModalOpen(true)}
          className="w-full py-2.5 rounded-2xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Extra Movement</span>
        </button>

        <button
          type="button"
          onClick={handleFinishWorkout}
          className="gym-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[var(--main-color)]/25 active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>Finish Workout</span>
        </button>
      </div>

      {/* شريط عداد الراحة المنبثق */}
      <RestTimerOverlay
        restSecondsLeft={restSecondsLeft}
        totalRestDuration={totalRestDuration}
        exerciseName={activeRestExerciseName}
        onAdd30s={() => addRestSeconds(30)}
        onSkip={skipRestTimer}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* نافذة تبديل التمرين البديل */}
      <ExerciseSwapModal
        isOpen={swapTargetIdx !== null}
        onClose={() => setSwapTargetIdx(null)}
        currentExercise={swapTargetIdx !== null ? sessionExercises[swapTargetIdx] : null}
        alternativeName={swapTargetIdx !== null ? sessionExercises[swapTargetIdx]?.alternativeExercise : null}
        onConfirmSwap={() => handleSwapBadeel(swapTargetIdx)}
      />

      {/* نافذة إضافة حركة إضافية */}
      <AddMovementModal
        isOpen={isAddMovementModalOpen}
        onClose={() => setIsAddMovementModalOpen(false)}
        exercises={exercises}
        onSelectExercise={handleAddExercise}
      />

      {/* نافذة الاحتفال بإنهاء التمرين */}
      <WorkoutCelebrationModal
        isOpen={isCompletedModalOpen}
        onClose={() => {
          setIsCompletedModalOpen(false);
          if (onSessionCompleted) onSessionCompleted();
          onExit();
        }}
        summary={completedSummary}
        dayName={day.dayName}
        onRestartWorkout={handleRestartWorkout}
      />
    </div>
  );
};
