import { WorkoutLog, LoggedExercise, LoggedSet, MuscleGroup, WorkoutPlan } from '@/types';

export interface ExerciseSessionRecord {
  logId: string;
  date: string;
  dayName: string;
  sets: {
    setNumber: number;
    weightKg: number;
    reps: number;
    isTopSet?: boolean;
    estimated1RM: number;
  }[];
  maxWeightKg: number;
  totalVolumeKg: number;
  bestEstimated1RM: number;
  weightOverloadDeltaKg: number; // vs previous session
  repsOverloadDelta: number; // vs previous session
  isAllTimePR: boolean;
  overloadBadge?: string;
}

export interface ExerciseProgressSummary {
  exerciseName: string;
  targetMuscle: MuscleGroup | string;
  equipment?: string;
  totalSessionsCount: number;
  firstSessionDate: string;
  latestSessionDate: string;
  firstWeightKg: number;
  allTimePRWeightKg: number;
  allTimePRDate: string;
  allTime1RMKg: number;
  netWeightGainKg: number;
  percentageGain: number;
  lifetimeVolumeKg: number;
  history: ExerciseSessionRecord[];
}

/**
 * Calculate estimated 1-Rep Max using the validated Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/**
 * Helper to get ISO week key (e.g. "2026-W23") for date-based grouping
 */
export function getISOWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'unknown';
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * 100% Dynamic Workout Commitment Streak Calculation
 * Group user logs by ISO calendar week and count consecutive weeks where weekly target was achieved.
 */
export function calculateDynamicWorkoutStreak(
  logs: WorkoutLog[],
  targetDaysPerWeek: number = 4
): {
  streakWeeks: number;
  currentWeekCount: number;
  targetDaysPerWeek: number;
  isTargetMetThisWeek: boolean;
  completionPercentage: number;
} {
  const target = Math.max(1, targetDaysPerWeek);
  if (!logs || logs.length === 0) {
    return {
      streakWeeks: 0,
      currentWeekCount: 0,
      targetDaysPerWeek: target,
      isTargetMetThisWeek: false,
      completionPercentage: 0
    };
  }

  // 1. Group logs count by week
  const weekMap: Record<string, number> = {};
  logs.forEach((l) => {
    const wKey = getISOWeekKey(l.date);
    weekMap[wKey] = (weekMap[wKey] || 0) + 1;
  });

  const now = new Date();
  const currentWeekKey = getISOWeekKey(now.toISOString().split('T')[0]);
  const currentWeekCount = weekMap[currentWeekKey] || 0;
  const isTargetMetThisWeek = currentWeekCount >= target;

  // 2. Sort all recorded weeks chronologically
  const recordedWeeks = Object.keys(weekMap).sort();
  
  // 3. Count consecutive weeks meeting target going backwards
  let consecutiveWeeks = 0;
  for (let i = recordedWeeks.length - 1; i >= 0; i--) {
    const w = recordedWeeks[i];
    if (weekMap[w] >= target) {
      consecutiveWeeks++;
    } else if (w !== currentWeekKey) {
      // If a previous past week was missed, streak broke
      break;
    }
  }

  const completionPercentage = Math.min(100, Math.round((currentWeekCount / target) * 100));

  return {
    streakWeeks: consecutiveWeeks,
    currentWeekCount,
    targetDaysPerWeek: target,
    isTargetMetThisWeek,
    completionPercentage
  };
}

/**
 * 100% Dynamic Strength Progression & Overload Health Analysis
 */
export function calculateDynamicStrengthPace(summaries: ExerciseProgressSummary[]): {
  avgPercentageGain: number;
  totalTracked: number;
  overloadingCount: number;
  statusLabel: string;
} {
  if (!summaries || summaries.length === 0) {
    return {
      avgPercentageGain: 0,
      totalTracked: 0,
      overloadingCount: 0,
      statusLabel: 'No Logs Yet 📍'
    };
  }

  const totalTracked = summaries.length;
  const overloadingCount = summaries.filter((e) => e.netWeightGainKg > 0).length;
  
  const totalGainSum = summaries.reduce((acc, e) => acc + e.percentageGain, 0);
  const avgPercentageGain = Math.round((totalGainSum / totalTracked) * 10) / 10;

  let statusLabel = 'Baseline 📍';
  const ratio = overloadingCount / totalTracked;

  if (ratio >= 0.75 && avgPercentageGain > 15) {
    statusLabel = 'Optimal Growth 📈';
  } else if (ratio >= 0.5) {
    statusLabel = 'Consistent Gains ⚡';
  } else if (overloadingCount > 0) {
    statusLabel = 'Progressing 🔥';
  } else {
    statusLabel = 'Solid Routine ✓';
  }

  return {
    avgPercentageGain,
    totalTracked,
    overloadingCount,
    statusLabel
  };
}

/**
 * Extract and analyze complete exercise progression from Day 1 to Today for a specific user.
 * 100% Dynamic across ALL exercises, plans, and logged movements.
 */
export function getExerciseProgressAnalysis(
  logs: WorkoutLog[],
  plan?: WorkoutPlan | null,
  exerciseNameFilter?: string
): ExerciseProgressSummary[] {
  // Sort logs chronologically from oldest (Day 1) to newest (Today)
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const exerciseMap: Record<string, {
    targetMuscle: string;
    equipment?: string;
    sessions: ExerciseSessionRecord[];
  }> = {};

  // 1. Seed plan exercises if plan provided
  if (plan) {
    plan.days.forEach((day) => {
      day.exercises.forEach((ex) => {
        const normName = ex.exerciseName.trim();
        if (!exerciseMap[normName]) {
          exerciseMap[normName] = {
            targetMuscle: ex.targetMuscle || 'Chest',
            equipment: ex.equipment || 'Barbell',
            sessions: []
          };
        }
      });
    });
  }

  // 2. Process all historical logs dynamically
  sortedLogs.forEach((log) => {
    log.completedExercises.forEach((ex) => {
      const completedSets = ex.sets.filter((s) => s.completed && s.weightKg > 0);
      if (completedSets.length === 0) return;

      const normName = ex.exerciseName.trim();
      if (!exerciseMap[normName]) {
        exerciseMap[normName] = {
          targetMuscle: ex.targetMuscle || 'Chest',
          sessions: []
        };
      }

      let maxWeight = 0;
      let totalVol = 0;
      let best1RM = 0;

      const analyzedSets = completedSets.map((s) => {
        const est1RM = calculateEstimated1RM(s.weightKg, s.reps);
        if (s.weightKg > maxWeight) maxWeight = s.weightKg;
        if (est1RM > best1RM) best1RM = est1RM;
        totalVol += s.weightKg * s.reps;

        return {
          setNumber: s.setNumber,
          weightKg: s.weightKg,
          reps: s.reps,
          estimated1RM: est1RM,
          isTopSet: false
        };
      });

      // Mark top set
      analyzedSets.forEach((s) => {
        if (s.weightKg === maxWeight) s.isTopSet = true;
      });

      // Determine overload relative to previous session
      const prevSessions = exerciseMap[normName].sessions;
      const prevSession = prevSessions.length > 0 ? prevSessions[prevSessions.length - 1] : null;
      
      let weightDelta = 0;
      let repsDelta = 0;
      let isAllTimePR = false;
      let badge: string | undefined = undefined;

      const historicalMaxWeight = prevSessions.reduce((max, sess) => Math.max(max, sess.maxWeightKg), 0);

      if (prevSession) {
        weightDelta = maxWeight - prevSession.maxWeightKg;
        repsDelta = analyzedSets[0]?.reps - (prevSession.sets[0]?.reps || 0);

        if (maxWeight > historicalMaxWeight) {
          isAllTimePR = true;
          badge = `+${weightDelta}kg PR 🔥`;
        } else if (weightDelta > 0) {
          badge = `+${weightDelta}kg ⚡`;
        } else if (weightDelta === 0 && repsDelta > 0) {
          badge = `+${repsDelta} Reps 📈`;
        } else {
          badge = 'Solid ✓';
        }
      } else {
        // First ever session (Day 1 baseline)
        badge = 'Baseline 📍';
        isAllTimePR = true;
      }

      exerciseMap[normName].sessions.push({
        logId: log.id,
        date: log.date,
        dayName: log.dayName,
        sets: analyzedSets,
        maxWeightKg: maxWeight,
        totalVolumeKg: totalVol,
        bestEstimated1RM: best1RM,
        weightOverloadDeltaKg: weightDelta,
        repsOverloadDelta: repsDelta,
        isAllTimePR,
        overloadBadge: badge
      });
    });
  });

  // 3. Build summary array for all exercises
  const summaries: ExerciseProgressSummary[] = Object.keys(exerciseMap).map((name) => {
    const data = exerciseMap[name];
    const sessions = data.sessions;
    const firstSession = sessions[0];
    const latestSession = sessions[sessions.length - 1];

    let allTimePRWeight = 0;
    let allTimePRDate = '';
    let allTime1RM = 0;
    let lifetimeVol = 0;

    sessions.forEach((s) => {
      lifetimeVol += s.totalVolumeKg;
      if (s.maxWeightKg > allTimePRWeight) {
        allTimePRWeight = s.maxWeightKg;
        allTimePRDate = s.date;
      }
      if (s.bestEstimated1RM > allTime1RM) {
        allTime1RM = s.bestEstimated1RM;
      }
    });

    const firstWeight = firstSession ? firstSession.maxWeightKg : 0;
    const netGain = allTimePRWeight - firstWeight;
    const pctGain = firstWeight > 0 ? Math.round((netGain / firstWeight) * 100) : 0;

    return {
      exerciseName: name,
      targetMuscle: data.targetMuscle,
      equipment: data.equipment,
      totalSessionsCount: sessions.length,
      firstSessionDate: firstSession?.date || '',
      latestSessionDate: latestSession?.date || '',
      firstWeightKg: firstWeight,
      allTimePRWeightKg: allTimePRWeight,
      allTimePRDate,
      allTime1RMKg: allTime1RM,
      netWeightGainKg: netGain,
      percentageGain: pctGain,
      lifetimeVolumeKg: lifetimeVol,
      // Reverse history so latest session appears first in table
      history: [...sessions].reverse()
    };
  });

  // Filter if specific exercise requested
  if (exerciseNameFilter) {
    return summaries.filter((s) => s.exerciseName.toLowerCase().includes(exerciseNameFilter.toLowerCase()));
  }

  // Sort by most performed & progressive
  return summaries.sort((a, b) => b.totalSessionsCount - a.totalSessionsCount);
}

/**
 * Check in real-time during live workout session if user hit a new PR for this exercise
 */
export function checkLiveSetPR(
  exerciseName: string,
  weightKg: number,
  reps: number,
  pastLogs: WorkoutLog[]
): { isNewPR: boolean; label?: string; diffKg?: number } {
  if (weightKg <= 0) return { isNewPR: false };

  let historicalMaxWeight = 0;
  let historicalMaxRepsAtWeight = 0;

  for (const log of pastLogs) {
    for (const ex of log.completedExercises) {
      if (ex.exerciseName.trim().toLowerCase() === exerciseName.trim().toLowerCase()) {
        for (const set of ex.sets) {
          if (set.completed) {
            if (set.weightKg > historicalMaxWeight) {
              historicalMaxWeight = set.weightKg;
            }
            if (set.weightKg === weightKg && set.reps > historicalMaxRepsAtWeight) {
              historicalMaxRepsAtWeight = set.reps;
            }
          }
        }
      }
    }
  }

  if (historicalMaxWeight > 0 && weightKg > historicalMaxWeight) {
    const diff = weightKg - historicalMaxWeight;
    return {
      isNewPR: true,
      label: `+${diff}kg PR 🔥`,
      diffKg: diff
    };
  }

  if (historicalMaxRepsAtWeight > 0 && reps > historicalMaxRepsAtWeight) {
    const repDiff = reps - historicalMaxRepsAtWeight;
    return {
      isNewPR: true,
      label: `+${repDiff} Reps PR ⚡`
    };
  }

  return { isNewPR: false };
}
