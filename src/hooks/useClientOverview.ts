'use client';

import { useState, useMemo, useCallback } from 'react';
import { User, WorkoutLog, WeeklyCheckIn, WorkoutPlan } from '@/types';
import {
  getExerciseProgressAnalysis,
  computeExerciseDiagnostic,
  SmartDiagnosticReport
} from '@/lib/progressEngine';
import { getSavedWeightLogs } from '@/lib/weightEngine';

export interface TrajectoryPoint {
  id: string;
  date: string;
  weightKg: number;
  notes?: string;
  index: number;
  dateFormatted: string;
  deltaVsPriorKg: number;
  deltaText: string;
  x?: number;
  y?: number;
}

export interface TrajectorySvgData {
  points: (TrajectoryPoint & { x: number; y: number })[];
  svgPath: string;
  areaPath: string;
  targetY: number;
}

export interface SubscriptionTelemetry {
  hasSubscription: boolean;
  name: string;
  durationMonths: number;
  startDate: string;
  endDate: string;
  startDateFormatted: string;
  endDateFormatted: string;
  price: number;
  currency: string;
  daysLeft: number;
  totalDays: number;
  remainingPct: number;
  statusText: string;
  barColor: string;
}

export interface AnalyzedLift {
  exerciseName: string;
  startWorkingSet: string;
  latestWorkingSet: string;
  totalGainText: string;
  percentageGain: number;
  status: 'progressing' | 'steady' | 'plateau' | 'drop' | 'new';
  badgeText: string;
  badgeClass: string;
  summary: any;
}

/**
 * Headless Hook for Client 360 Overview (Clean Architecture - Layer 2).
 * 
 * Centralizes all mathematical engines, data aggregation, pagination logic,
 * and state transitions for the athlete overview dashboard.
 */
export function useClientOverview(
  client: User,
  clientLogs: WorkoutLog[],
  clientCheckIns: WeeklyCheckIn[],
  assignedPlan: WorkoutPlan | null | undefined
) {
  // ── Photo Inspection State ────────────────────────────────────────────────
  const [activePhotoAngle, setActivePhotoAngle] = useState<'front' | 'side' | 'back'>('front');

  // ── Modals State ─────────────────────────────────────────────────────────
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBrokenRecordsOpen, setIsBrokenRecordsOpen] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | undefined>(undefined);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [selectedDiagnosticReport, setSelectedDiagnosticReport] = useState<SmartDiagnosticReport | null>(null);

  // ── Weight Trajectory Engine ─────────────────────────────────────────────
  const [trajectoryPage, setTrajectoryPage] = useState<number>(0);
  const [hoveredTrajectoryIndex, setHoveredTrajectoryIndex] = useState<number | null>(null);

  // Gather and deduplicate chronological weight records from logs and check-ins
  const allWeightEntries = useMemo<TrajectoryPoint[]>(() => {
    if (!client?.id) return [];

    const savedLogs = getSavedWeightLogs(client.id);
    const checkIns = Array.isArray(clientCheckIns) ? clientCheckIns : [];

    const dateMap = new Map<string, { id: string; date: string; weightKg: number; notes?: string }>();

    // 1. Process explicit weight logs
    savedLogs.forEach((l) => {
      if (typeof l.weightKg === 'number' && l.weightKg > 0) {
        dateMap.set(l.date, {
          id: l.id,
          date: l.date,
          weightKg: l.weightKg,
          notes: l.notes
        });
      }
    });

    // 2. Process weekly check-ins (overrides or complements logs)
    checkIns.forEach((c) => {
      if (typeof c.weightKg === 'number' && c.weightKg > 0) {
        dateMap.set(c.date, {
          id: c.id,
          date: c.date,
          weightKg: c.weightKg,
          notes: c.traineeNotes || 'Weekly Check-in'
        });
      }
    });

    // 3. Sort chronologically ascending (oldest to newest)
    const sorted = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 4. Calculate deltas and readable date labels
    return sorted.map((entry, idx) => {
      const prevWeight = idx > 0 ? sorted[idx - 1].weightKg : entry.weightKg;
      const delta = Math.round((entry.weightKg - prevWeight) * 10) / 10;

      let dateFormatted = entry.date;
      try {
        const parts = entry.date.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } catch {
        dateFormatted = entry.date;
      }

      let deltaText = 'Baseline';
      if (idx > 0) {
        if (delta < 0) deltaText = `${delta} kg`;
        else if (delta > 0) deltaText = `+${delta} kg`;
        else deltaText = '0.0 kg';
      }

      return {
        ...entry,
        index: idx,
        dateFormatted,
        deltaVsPriorKg: delta,
        deltaText
      };
    });
  }, [client?.id, clientCheckIns]);

  const hasWeighIns = allWeightEntries.length > 0;

  // Pagination parameters: 4 points per page with continuous 3-point step window
  const POINTS_PER_PAGE = 4;
  const STEP = POINTS_PER_PAGE - 1;

  const totalTrajectoryPages = useMemo(() => {
    if (allWeightEntries.length <= POINTS_PER_PAGE) return 1;
    return Math.max(1, Math.ceil((allWeightEntries.length - POINTS_PER_PAGE) / STEP) + 1);
  }, [allWeightEntries.length]);

  const activePage = Math.min(Math.max(0, trajectoryPage), Math.max(0, totalTrajectoryPages - 1));

  // Current window of visible points on the trajectory chart
  const visibleWeightPoints = useMemo(() => {
    if (allWeightEntries.length === 0) return [];
    if (allWeightEntries.length <= POINTS_PER_PAGE) return allWeightEntries;

    const endIdx = Math.max(POINTS_PER_PAGE, allWeightEntries.length - activePage * STEP);
    const startIdx = Math.max(0, endIdx - POINTS_PER_PAGE);
    return allWeightEntries.slice(startIdx, endIdx);
  }, [allWeightEntries, activePage]);

  // Overall trajectory metrics (lifetime starting vs latest)
  const overallWeightStats = useMemo(() => {
    const fallbackWeight = client?.weightKg || 70;
    if (allWeightEntries.length === 0) {
      return { startingWeight: fallbackWeight, latestWeight: fallbackWeight, totalDropped: 0 };
    }
    const startingWeight = allWeightEntries[0].weightKg;
    const latestWeight = allWeightEntries[allWeightEntries.length - 1].weightKg;
    const totalDropped = Math.round((startingWeight - latestWeight) * 10) / 10;
    return { startingWeight, latestWeight, totalDropped };
  }, [allWeightEntries, client?.weightKg]);

  // SVG Coordinates for visible points
  const trajectorySvgData = useMemo<TrajectorySvgData>(() => {
    const width = 440;
    const height = 95;
    const padX = 35;
    const padTop = 16;
    const padBottom = 22;

    const targetW = client?.targetWeightKg || 60;

    if (visibleWeightPoints.length === 0) {
      return {
        points: [],
        svgPath: '',
        areaPath: '',
        targetY: 85
      };
    }

    const weights = visibleWeightPoints.map((p) => p.weightKg);
    const minW = Math.min(...weights, targetW) - 1.5;
    const maxW = Math.max(...weights, targetW) + 1.5;
    const range = maxW - minW || 1;

    const coords = visibleWeightPoints.map((p, i) => {
      const x = padX + (i / Math.max(1, visibleWeightPoints.length - 1)) * (width - padX * 2);
      const y = (height - padBottom) - ((p.weightKg - minW) / range) * (height - padTop - padBottom);
      return {
        ...p,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10
      };
    });

    const targetY = (height - padBottom) - ((targetW - minW) / range) * (height - padTop - padBottom);

    const svgPath = coords.reduce(
      (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`,
      ''
    );

    const areaPath = coords.length > 0
      ? `${svgPath} L ${coords[coords.length - 1].x},${height - padBottom} L ${coords[0].x},${height - padBottom} Z`
      : '';

    return {
      points: coords,
      svgPath,
      areaPath,
      targetY: Math.round(targetY * 10) / 10
    };
  }, [visibleWeightPoints, client?.targetWeightKg]);

  // ── Exercise Progression & Compound Overload Engine ───────────────────────
  const exerciseSummaries = useMemo(() => {
    return getExerciseProgressAnalysis(clientLogs || [], assignedPlan || null);
  }, [clientLogs, assignedPlan]);

  const analyzedCoreLifts = useMemo<AnalyzedLift[]>(() => {
    const COMPOUND_KEYWORDS = ['bench', 'squat', 'deadlift', 'rdl', 'row', 'press', 'pulldown', 'hip thrust'];

    // Prioritize compound exercises over isolation movements
    const candidates = [...exerciseSummaries].sort((a, b) => {
      const aIsCompound = COMPOUND_KEYWORDS.some((k) => a.exerciseName.toLowerCase().includes(k)) ? 1 : 0;
      const bIsCompound = COMPOUND_KEYWORDS.some((k) => b.exerciseName.toLowerCase().includes(k)) ? 1 : 0;
      if (aIsCompound !== bIsCompound) return bIsCompound - aIsCompound;
      return b.totalSessionsCount - a.totalSessionsCount;
    });

    if (candidates.length === 0) {
      return [];
    }

    return candidates.slice(0, 3).map((ex) => {
      const diag = computeExerciseDiagnostic(ex);
      const netGain = ex.netWeightGainKg;
      const pct = ex.percentageGain || (diag.startWeight > 0 ? Math.round((netGain / diag.startWeight) * 100) : 0);

      return {
        exerciseName: ex.exerciseName,
        startWorkingSet: diag.startWorkingSet,
        latestWorkingSet: diag.latestWorkingSet,
        totalGainText: `+${netGain} kg (+${pct}%)`,
        percentageGain: pct,
        status: diag.status,
        badgeText: diag.badgeText,
        badgeClass: diag.badgeClass,
        summary: ex
      };
    });
  }, [exerciseSummaries]);

  const overloadDiagnosticSummary = useMemo(() => {
    const lifts = analyzedCoreLifts;
    if (lifts.length === 0) {
      return {
        summaryText: 'Awaiting Session Logs',
        strengthIndex: '0 Sessions',
        statusClass: 'text-slate-400'
      };
    }

    const dropCount = lifts.filter((l) => l.status === 'drop').length;
    const plateauCount = lifts.filter((l) => l.status === 'plateau').length;
    const progressingCount = lifts.filter((l) => l.status === 'progressing').length;

    const avgPct = Math.round(lifts.reduce((sum, l) => sum + Math.max(0, l.percentageGain), 0) / lifts.length);

    let summaryText = `${progressingCount}/${lifts.length} Lifts Progressing`;
    let statusClass = 'text-emerald-400';

    if (dropCount > 0) {
      summaryText = `${dropCount} Regression Detected`;
      statusClass = 'text-rose-400';
    } else if (plateauCount > 0) {
      summaryText = `${plateauCount} Plateau (>3 wks)`;
      statusClass = 'text-amber-400';
    } else if (progressingCount === lifts.length) {
      summaryText = 'All Lifts Progressing';
      statusClass = 'text-emerald-400';
    }

    return {
      summaryText,
      strengthIndex: `+${avgPct}% Strength Index`,
      statusClass
    };
  }, [analyzedCoreLifts]);

  // ── Weekly Attendance Engine (Egyptian Gym Culture Standard: Starts Saturday) ──
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const targetSessions = useMemo(() => {
    return assignedPlan?.daysPerWeek || (assignedPlan?.days?.length ? assignedPlan.days.filter((d) => !d.isRestDay).length : 4);
  }, [assignedPlan]);

  const weekAttendance = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Week starts Saturday (Egyptian gym culture standard)
    const dayOfWeek = todayMidnight.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayOffset = (dayOfWeek + 1) % 7; // Sat = 0, Sun = 1, ..., Fri = 6

    const startDate = new Date(todayMidnight);
    startDate.setDate(todayMidnight.getDate() - dayOffset + (weekOffset * 7));

    const dayNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    const days = dayNames.map((dName, index) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + index);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const dayNum = d.getDate();

      const isToday = d.getTime() === todayMidnight.getTime();
      const log = (clientLogs || []).find((l) => l.date === dateStr);
      const hasWorkout = Boolean(log);

      return {
        dayName: dName,
        dayNum,
        dateStr,
        isToday,
        hasWorkout,
        workoutTitle: log?.dayName || (hasWorkout ? 'Done' : undefined)
      };
    });

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const dateRangeLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    const completedCount = days.filter((d) => d.hasWorkout).length;
    const percentage = targetSessions > 0 ? Math.min(100, Math.round((completedCount / targetSessions) * 100)) : 0;

    return {
      days,
      dateRangeLabel,
      completedCount,
      targetSessions,
      percentage
    };
  }, [clientLogs, targetSessions, weekOffset]);

  // ── Subscription Lifecycle Telemetry ──────────────────────────────────────
  const subscriptionInfo = useMemo<SubscriptionTelemetry>(() => {
    const sub = client?.subscription;
    if (!sub) {
      return {
        hasSubscription: false,
        name: 'No Active Package',
        durationMonths: 0,
        startDate: '',
        endDate: '',
        startDateFormatted: 'Not Set',
        endDateFormatted: 'Not Set',
        price: 0,
        currency: 'EGP',
        daysLeft: 0,
        totalDays: 0,
        remainingPct: 0,
        statusText: 'No Membership',
        barColor: 'bg-slate-600'
      };
    }

    const startDateStr = sub.startDate;
    const endDateStr = sub.endDate;

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const now = new Date();

    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const remainingPct = Math.min(100, Math.max(0, Math.round((daysLeft / totalDays) * 100)));

    let barColor = 'bg-cyan-500/80';
    let statusText = `${daysLeft}d left`;

    if (daysLeft === 0 || sub.status === 'expired') {
      barColor = 'bg-rose-500/80';
      statusText = 'Expired';
    } else if (daysLeft <= 7 || sub.status === 'expiring_soon') {
      barColor = 'bg-amber-400/90';
      statusText = `${daysLeft}d left`;
    }

    const formatDateShort = (dateStr: string) => {
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } catch {
        // fallback
      }
      return dateStr;
    };

    return {
      hasSubscription: true,
      name: sub.planType || 'Custom Coaching',
      durationMonths: sub.durationMonths || 1,
      startDate: startDateStr,
      endDate: endDateStr,
      startDateFormatted: formatDateShort(startDateStr),
      endDateFormatted: formatDateShort(endDateStr),
      price: sub.price || 0,
      currency: sub.currency || 'EGP',
      daysLeft,
      totalDays,
      remainingPct,
      statusText,
      barColor
    };
  }, [client?.subscription]);

  const openHistoryFor = useCallback((exName?: string) => {
    setSelectedExerciseName(exName);
    setIsHistoryOpen(true);
  }, []);

  return {
    // Weight Trajectory
    allWeightEntries,
    hasWeighIns,
    totalTrajectoryPages,
    activePage,
    visibleWeightPoints,
    overallWeightStats,
    trajectorySvgData,
    trajectoryPage,
    setTrajectoryPage,
    hoveredTrajectoryIndex,
    setHoveredTrajectoryIndex,
    // Strength & Overload
    analyzedCoreLifts,
    overloadDiagnosticSummary,
    exerciseSummaries,
    // Attendance
    weekAttendance,
    weekOffset,
    setWeekOffset,
    targetSessions,
    // Subscription
    subscriptionInfo,
    // Photos & Modals
    activePhotoAngle,
    setActivePhotoAngle,
    isHistoryOpen,
    setIsHistoryOpen,
    isBrokenRecordsOpen,
    setIsBrokenRecordsOpen,
    selectedExerciseName,
    setSelectedExerciseName,
    isPhotoModalOpen,
    setIsPhotoModalOpen,
    isMembershipModalOpen,
    setIsMembershipModalOpen,
    selectedDiagnosticReport,
    setSelectedDiagnosticReport,
    openHistoryFor
  };
}
