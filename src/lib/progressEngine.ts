import { WorkoutLog, MuscleGroup, WorkoutPlan } from '@/types';
export { calculateDailyAdherenceScore, type DailyAdherenceBreakdown } from './habitsEngine';

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
  isRepsPR?: boolean;
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
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
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
 * Dynamic Daily Workout Streak Calculation (consecutive days of logged workouts)
 */
export function calculateDailyWorkoutStreak(logs: { date: string }[]): number {
  if (!logs || logs.length === 0) return 0;
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasLog = sorted.some((l) => l.date === dateStr);
    if (hasLog) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return Math.max(streak, 1);
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
      statusLabel: 'No Logs Yet'
    };
  }

  const totalTracked = summaries.length;
  const overloadingCount = summaries.filter((e) => e.netWeightGainKg > 0).length;
  
  const totalGainSum = summaries.reduce((acc, e) => acc + e.percentageGain, 0);
  const avgPercentageGain = Math.round((totalGainSum / totalTracked) * 10) / 10;

  let statusLabel = 'Baseline';
  const ratio = overloadingCount / totalTracked;

  if (ratio >= 0.75 && avgPercentageGain > 15) {
    statusLabel = 'Optimal Growth';
  } else if (ratio >= 0.5) {
    statusLabel = 'Consistent Gains';
  } else if (overloadingCount > 0) {
    statusLabel = 'Progressing';
  } else {
    statusLabel = 'Solid Routine';
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
      let isRepsPR = false;
      let badge: string | undefined = undefined;

      const historicalMaxWeight = prevSessions.reduce((max, sess) => Math.max(max, sess.maxWeightKg), 0);

      if (prevSession) {
        weightDelta = maxWeight - prevSession.maxWeightKg;

        const currentTopSet = analyzedSets.find((s) => s.isTopSet) || analyzedSets[0];
        const prevTopSet = prevSession.sets.find((s) => s.isTopSet) || prevSession.sets[0];

        if (maxWeight > historicalMaxWeight) {
          isAllTimePR = true;
          badge = `+${weightDelta}kg PR`;
        } else if (weightDelta > 0) {
          badge = `+${weightDelta}kg PR`;
        } else if (weightDelta === 0) {
          // Smart Overload: Same weight, but did reps increase?
          const currentRepsAtWeight = currentTopSet?.reps || 0;
          const prevRepsAtWeight = prevTopSet?.reps || 0;
          repsDelta = currentRepsAtWeight - prevRepsAtWeight;

          if (repsDelta > 0) {
            isRepsPR = true;
            badge = `+${repsDelta} Reps PR`;
          } else if (repsDelta < 0) {
            badge = `${repsDelta} Reps`;
          } else {
            badge = 'Holding';
          }
        } else {
          badge = `${weightDelta} kg`;
        }
      } else {
        // First ever session (Day 1 baseline)
        badge = 'Baseline';
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
        isRepsPR,
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
  if (weightKg <= 0 || !pastLogs || !Array.isArray(pastLogs) || !exerciseName) return { isNewPR: false };

  let historicalMaxWeight = 0;
  let historicalMaxRepsAtWeight = 0;
  const targetName = exerciseName.trim().toLowerCase();

  for (const log of pastLogs) {
    if (!log || !log.completedExercises || !Array.isArray(log.completedExercises)) continue;
    for (const ex of log.completedExercises) {
      if (!ex || !ex.exerciseName) continue;
      if (ex.exerciseName.trim().toLowerCase() === targetName) {
        if (!ex.sets || !Array.isArray(ex.sets)) continue;
        for (const set of ex.sets) {
          if (set && set.completed) {
            const w = Number(set.weightKg) || 0;
            const r = Number(set.reps) || 0;
            if (w > historicalMaxWeight) {
              historicalMaxWeight = w;
            }
            if (w === weightKg && r > historicalMaxRepsAtWeight) {
              historicalMaxRepsAtWeight = r;
            }
          }
        }
      }
    }
  }

  if (historicalMaxWeight > 0 && weightKg > historicalMaxWeight) {
    const diff = Math.round((weightKg - historicalMaxWeight) * 10) / 10;
    return {
      isNewPR: true,
      label: `+${diff}kg PR`,
      diffKg: diff
    };
  }

  if (historicalMaxRepsAtWeight > 0 && reps > historicalMaxRepsAtWeight) {
    const repDiff = reps - historicalMaxRepsAtWeight;
    return {
      isNewPR: true,
      label: `+${repDiff} Reps PR`
    };
  }

  return { isNewPR: false };
}

export interface BrokenRecordEvent {
  id: string;
  date: string;
  exerciseName: string;
  targetMuscle: string;
  dayName: string;
  recordType: 'weight_pr' | 'reps_pr';
  weightKg: number;
  reps: number;
  previousWeightKg?: number;
  previousReps?: number;
  deltaText: string;
  est1RM: number;
}

export function getAllBrokenRecords(summaries: ExerciseProgressSummary[]): BrokenRecordEvent[] {
  const records: BrokenRecordEvent[] = [];

  summaries.forEach((summary) => {
    // History is stored reversed (latest first), so reverse back to chronological order (oldest to newest)
    const chronologicalHistory = [...summary.history].reverse();
    let highestWeightSoFar = 0;
    const highestRepsAtWeight: Record<number, number> = {};

    chronologicalHistory.forEach((session, idx) => {
      const topSet = session.sets.find((s) => s.isTopSet) || session.sets[0];
      const weight = session.maxWeightKg;
      const reps = topSet ? topSet.reps : 0;

      if (idx === 0) {
        // Baseline session
        highestWeightSoFar = weight;
        highestRepsAtWeight[weight] = reps;
        return;
      }

      // 1. Check for Weight PR (broke all-time peak weight)
      if (weight > highestWeightSoFar) {
        const gain = Math.round((weight - highestWeightSoFar) * 10) / 10;
        records.push({
          id: `rec-${session.logId}-${summary.exerciseName}-wt-${session.date}`,
          date: session.date,
          exerciseName: summary.exerciseName,
          targetMuscle: summary.targetMuscle as string,
          dayName: session.dayName,
          recordType: 'weight_pr',
          weightKg: weight,
          reps,
          previousWeightKg: highestWeightSoFar,
          deltaText: `+${gain} kg PR`,
          est1RM: session.bestEstimated1RM
        });
        highestWeightSoFar = weight;
        highestRepsAtWeight[weight] = Math.max(highestRepsAtWeight[weight] || 0, reps);
      }
      // 2. Check for Reps PR (same weight, but increased reps!)
      else if (highestRepsAtWeight[weight] !== undefined && reps > highestRepsAtWeight[weight]) {
        const extraReps = reps - highestRepsAtWeight[weight];
        records.push({
          id: `rec-${session.logId}-${summary.exerciseName}-reps-${session.date}`,
          date: session.date,
          exerciseName: summary.exerciseName,
          targetMuscle: summary.targetMuscle as string,
          dayName: session.dayName,
          recordType: 'reps_pr',
          weightKg: weight,
          reps,
          previousReps: highestRepsAtWeight[weight],
          deltaText: `+${extraReps} Reps at ${weight}kg`,
          est1RM: session.bestEstimated1RM
        });
        highestRepsAtWeight[weight] = reps;
      }
    });
  });

  // Sort newest first
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export interface ExerciseDiagnostic {
  status: 'progressing' | 'steady' | 'plateau' | 'drop';
  badgeText: string;
  badgeClass: string;
  weeksUnchanged: number;
  weightDelta: number;
  repsDelta: number;
  latestWorkingSet: string;
  startWorkingSet: string;
  curWeight: number;
  curReps: number;
  startWeight: number;
  startReps: number;
}

/**
 * Diagnostic analysis for progressive overload & plateau detection:
 * - Progression: weight increase OR reps increase (+X kg PR / +X Reps PR)
 * - Steady: 1-3 weeks unchanged is normal consolidation (Holding)
 * - Plateau: > 3 weeks unchanged with zero weight/reps progress
 * - Drop Alert: regression in weight or reps (fatigue / missed targets)
 */
export function computeExerciseDiagnostic(summary: ExerciseProgressSummary): ExerciseDiagnostic {
  const history = summary.history; // latest is at history[0]
  if (!history || history.length === 0) {
    return {
      status: 'steady',
      badgeText: 'No Logs',
      badgeClass: 'bg-white/[0.04] text-slate-400 border border-white/[0.08]',
      weeksUnchanged: 0,
      weightDelta: 0,
      repsDelta: 0,
      latestWorkingSet: '—',
      startWorkingSet: '—',
      curWeight: 0,
      curReps: 0,
      startWeight: 0,
      startReps: 0
    };
  }

  const latest = history[0];
  const first = history[history.length - 1];
  const prev = history.length > 1 ? history[1] : null;

  const curTop = latest.sets.find((s) => s.isTopSet) || latest.sets[0];
  const prevTop = prev ? (prev.sets.find((s) => s.isTopSet) || prev.sets[0]) : null;
  const startTop = first.sets.find((s) => s.isTopSet) || first.sets[0];

  const curWeight = latest.maxWeightKg || summary.allTimePRWeightKg;
  const curReps = curTop?.reps || 8;
  const prevWeight = prevTop ? prevTop.weightKg : curWeight;
  const prevReps = prevTop ? prevTop.reps : curReps;
  const startWeight = startTop ? startTop.weightKg : summary.firstWeightKg;
  const startReps = startTop?.reps || 8;

  const weightDelta = prev ? curWeight - prevWeight : 0;
  const repsDelta = prev ? curReps - prevReps : 0;

  // Calculate weeks unchanged
  let weeksUnchanged = 0;
  if (history.length > 1 && latest?.date && first?.date) {
    let lastProgressDate = new Date(first.date);
    for (let i = 0; i < history.length - 1; i++) {
      const s = history[i];
      const sPrev = history[i + 1];
      if (sPrev) {
        const sTop = s.sets.find((st) => st.isTopSet) || s.sets[0];
        const spTop = sPrev.sets.find((st) => st.isTopSet) || sPrev.sets[0];
        if (sTop && spTop && (sTop.weightKg > spTop.weightKg || (sTop.weightKg === spTop.weightKg && sTop.reps > spTop.reps))) {
          lastProgressDate = new Date(s.date);
          break;
        }
      }
    }
    const nowMs = new Date(latest.date).getTime();
    const diffDays = Math.max(0, (nowMs - lastProgressDate.getTime()) / (1000 * 60 * 60 * 24));
    weeksUnchanged = Math.round(diffDays / 7);
  }

  let status: 'progressing' | 'steady' | 'plateau' | 'drop' = 'steady';
  let badgeText = 'Steady';
  let badgeClass = 'bg-white/[0.04] text-slate-300 border border-white/[0.08]';

  // 1. Fatigue / Drop Warning: Weight dropped OR reps dropped
  // User rule: "bdl alert hya keda keda lonha a7mar f bayen eno enzar ya3ny f ektb elenzar 3latol"
  if (prev && (weightDelta < 0 || (weightDelta === 0 && repsDelta < 0))) {
    status = 'drop';
    badgeText = weightDelta < 0 ? `${weightDelta} kg` : `${repsDelta} Reps`;
    badgeClass = 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold';
  }
  // 2. Progression: Weight increased OR reps increased
  else if (prev && (weightDelta > 0 || (weightDelta === 0 && repsDelta > 0))) {
    status = 'progressing';
    badgeText = weightDelta > 0 ? `+${weightDelta} kg PR` : `+${repsDelta} Reps PR`;
    badgeClass = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-bold';
  }
  // 3. Plateau Alert: User rule -> ONLY after > 3 weeks unchanged
  else if (weeksUnchanged > 3) {
    status = 'plateau';
    badgeText = `Plateau (${weeksUnchanged} wks)`;
    badgeClass = 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold';
  }
  // 4. Normal consolidation / steady (1-3 weeks is completely normal adaptation)
  else {
    status = 'steady';
    badgeText = weeksUnchanged > 1 ? `Holding (${weeksUnchanged} wks)` : 'On Track';
    badgeClass = 'bg-white/[0.04] text-slate-300 border border-white/[0.08]';
  }

  return {
    status,
    badgeText,
    badgeClass,
    weeksUnchanged,
    weightDelta,
    repsDelta,
    latestWorkingSet: `${curWeight} kg × ${curReps}`,
    startWorkingSet: `${startWeight} kg × ${startReps}`,
    curWeight,
    curReps,
    startWeight,
    startReps
  };
}

export interface SmartDiagnosticReport {
  traineeName: string;
  exerciseName: string;
  targetMuscle: string;
  status: 'drop' | 'plateau' | 'progressing' | 'steady';
  statusTitle: string;
  badgeText: string;
  badgeClass: string;
  latestSessionDate: string;
  previousSessionDate: string;
  timeSpanLabel: string;
  weeksUnchanged: number;
  latestTopSet: { weightKg: number; reps: number; est1RM: number };
  previousTopSet: { weightKg: number; reps: number; est1RM: number } | null;
  weightDeltaKg: number;
  repsDelta: number;
  latestSessionVolumeKg: number;
  previousSessionVolumeKg: number;
  volumeDeltaKg: number;
  volumeDeltaPct: number;
  latestSets: { setNumber: number; weightKg: number; reps: number; isTopSet?: boolean }[];
  previousSets: { setNumber: number; weightKg: number; reps: number; isTopSet?: boolean }[];
  baselineTopSet: { weightKg: number; reps: number; date: string };
  allTimePRTopSet: { weightKg: number; date: string };
  totalSessionsCount: number;
  lifetimeVolumeKg: number;
  netWeightGainKg: number;
  percentageGain: number;
  factualNarrative: string;
}

export function generateSmartExerciseReport(
  exercise: ExerciseProgressSummary,
  traineeName: string
): SmartDiagnosticReport {
  const diag = computeExerciseDiagnostic(exercise);
  const history = exercise.history || [];

  const latest = history[0];
  const prev = history.length > 1 ? history[1] : null;
  const first = history.length > 0 ? history[history.length - 1] : null;

  const latestTop = latest ? (latest.sets.find((s) => s.isTopSet) || latest.sets[0]) : { weightKg: exercise.allTimePRWeightKg, reps: 8, est1RM: 0 };
  const prevTop = prev ? (prev.sets.find((s) => s.isTopSet) || prev.sets[0]) : null;
  const firstTop = first ? (first.sets.find((s) => s.isTopSet) || first.sets[0]) : { weightKg: exercise.firstWeightKg, reps: 8, est1RM: 0 };

  const weightDeltaKg = prevTop ? latestTop.weightKg - prevTop.weightKg : 0;
  const repsDelta = prevTop ? latestTop.reps - prevTop.reps : 0;

  const latestVol = latest?.totalVolumeKg || (latestTop.weightKg * latestTop.reps);
  const prevVol = prev?.totalVolumeKg || latestVol;
  const volDeltaKg = latestVol - prevVol;
  const volDeltaPct = prevVol > 0 ? Math.round((volDeltaKg / prevVol) * 100) : 0;

  // Format date interval
  const latestDateStr = latest?.date || 'Current Session';
  const prevDateStr = prev?.date || 'Prior Session';
  let timeSpanLabel = 'Latest Performance Log';
  if (latest?.date && prev?.date) {
    const d1 = new Date(prev.date);
    const d2 = new Date(latest.date);
    const daysDiff = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    timeSpanLabel = `${prev.date} → ${latest.date} (${daysDiff} days interval)`;
  }

  let statusTitle = 'Load Consolidating';
  if (diag.status === 'drop') {
    statusTitle = 'Regression Deficit';
  } else if (diag.status === 'plateau') {
    statusTitle = `Stagnation / Plateau (${diag.weeksUnchanged} wks)`;
  } else if (diag.status === 'progressing') {
    statusTitle = 'Progressive Overload';
  }

  // Simple, direct coach language (zero jargon, zero injury speculation, zero volume clutter)
  let factualNarrative = '';
  if (diag.status === 'drop') {
    if (repsDelta < 0 && weightDeltaKg === 0) {
      factualNarrative = `${traineeName} did ${latestTop.reps} reps at ${latestTop.weightKg} kg on the top set (was ${prevTop?.reps} reps at ${prevTop?.weightKg} kg on ${prevDateStr}). That is a drop of ${Math.abs(repsDelta)} rep on the working load.`;
    } else {
      factualNarrative = `${traineeName} lifted ${latestTop.weightKg} kg × ${latestTop.reps} reps on the top set (was ${prevTop?.weightKg} kg × ${prevTop?.reps} reps on ${prevDateStr}). That is a drop of ${Math.abs(weightDeltaKg)} kg on the working load.`;
    }
  } else if (diag.status === 'plateau') {
    factualNarrative = `${traineeName} has stayed at ${latestTop.weightKg} kg × ${latestTop.reps} reps for ${diag.weeksUnchanged} weeks without increasing weight or reps.`;
  } else if (diag.status === 'progressing') {
    const gainText = weightDeltaKg > 0 ? `+${weightDeltaKg} kg heavier` : `+${repsDelta} extra reps`;
    factualNarrative = `${traineeName} improved to ${latestTop.weightKg} kg × ${latestTop.reps} reps (${gainText} compared to ${prevDateStr}).`;
  } else {
    factualNarrative = `${traineeName} matched their previous numbers with ${latestTop.weightKg} kg × ${latestTop.reps} reps, keeping the same weight and reps as last session (${prevDateStr}).`;
  }

  return {
    traineeName,
    exerciseName: exercise.exerciseName,
    targetMuscle: String(exercise.targetMuscle || 'General'),
    status: diag.status,
    statusTitle,
    badgeText: diag.badgeText,
    badgeClass: diag.badgeClass,
    latestSessionDate: latestDateStr,
    previousSessionDate: prevDateStr,
    timeSpanLabel,
    weeksUnchanged: diag.weeksUnchanged,
    latestTopSet: {
      weightKg: latestTop.weightKg,
      reps: latestTop.reps,
      est1RM: calculateEstimated1RM(latestTop.weightKg, latestTop.reps)
    },
    previousTopSet: prevTop ? {
      weightKg: prevTop.weightKg,
      reps: prevTop.reps,
      est1RM: calculateEstimated1RM(prevTop.weightKg, prevTop.reps)
    } : null,
    weightDeltaKg,
    repsDelta,
    latestSessionVolumeKg: latestVol,
    previousSessionVolumeKg: prevVol,
    volumeDeltaKg: volDeltaKg,
    volumeDeltaPct: volDeltaPct,
    latestSets: latest?.sets || [{ setNumber: 1, weightKg: latestTop.weightKg, reps: latestTop.reps, isTopSet: true }],
    previousSets: prev?.sets || [],
    baselineTopSet: {
      weightKg: firstTop.weightKg,
      reps: firstTop.reps,
      date: first?.date || exercise.firstSessionDate || 'Day 1'
    },
    allTimePRTopSet: {
      weightKg: exercise.allTimePRWeightKg,
      date: exercise.allTimePRDate || 'Recorded'
    },
    totalSessionsCount: exercise.totalSessionsCount,
    lifetimeVolumeKg: exercise.lifetimeVolumeKg,
    netWeightGainKg: exercise.netWeightGainKg,
    percentageGain: exercise.percentageGain,
    factualNarrative
  };
}



