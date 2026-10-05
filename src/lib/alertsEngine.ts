import { User, WeeklyCheckIn, WorkoutPlan, DietPlan, WorkoutLog } from '@/types';
import { CoachAlertSchema } from '@/schemas/alert.schema';

export type AlertPriority = 'CRITICAL' | 'WARNING' | 'INFO';

export type AlertType = 
  | 'CHECK_IN_OVERDUE'
  | 'UNREVIEWED_CHECK_IN'
  | 'NO_WORKOUT_PLAN'
  | 'NO_DIET_PLAN'
  | 'LOW_WORKOUT_ADHERENCE';

export interface CoachAlert {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  reason: string;
  timestamp: string;
  actionLabel: string;
  targetSubTab: 'overview' | 'checkins' | 'workout' | 'nutrition' | 'logs';
  resolved?: boolean;
}

const STORAGE_KEY_DISMISSED_ALERTS = 'pro_gym_dismissed_alerts_v1';

export function getDismissedAlertIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED_ALERTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function dismissAlert(alertId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const dismissed = getDismissedAlertIds();
    if (!dismissed.includes(alertId)) {
      localStorage.setItem(STORAGE_KEY_DISMISSED_ALERTS, JSON.stringify([...dismissed, alertId]));
    }
  } catch {
    // ignore
  }
}

export function restoreAlert(alertId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const dismissed = getDismissedAlertIds();
    localStorage.setItem(STORAGE_KEY_DISMISSED_ALERTS, JSON.stringify(dismissed.filter((id) => id !== alertId)));
  } catch {
    // ignore
  }
}

export function clearDismissedAlerts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_DISMISSED_ALERTS);
  } catch {
    // ignore
  }
}

/**
 * Derives normalized system alerts strictly from live coach state with multi-tenant coach scoping and deduplication.
 */
export function deriveCoachAlerts(
  users: User[],
  checkIns: WeeklyCheckIn[],
  plans: WorkoutPlan[],
  dietPlans: DietPlan[],
  logs: WorkoutLog[],
  coachId?: string,
  options?: { includeDismissed?: boolean }
): CoachAlert[] {
  const alertsMap = new Map<string, CoachAlert>();
  const dismissedIds = options?.includeDismissed ? [] : getDismissedAlertIds();
  const dismissedSet = new Set(dismissedIds);

  // Multi-tenant scoping: only include trainees assigned to this coach (or all trainees if no coachId specified)
  const trainees = users.filter((u) => {
    if (u.role !== 'trainee') return false;
    if (coachId && u.coachId && u.coachId !== coachId) return false;
    return true;
  });

  const now = new Date();

  trainees.forEach((trainee) => {
    const traineeCheckIns = (checkIns || [])
      .filter((c) => c.userId === trainee.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestCheckIn = traineeCheckIns[0];

    // 1. Unreviewed Check-in (CRITICAL)
    const unreviewed = traineeCheckIns.find((c) => !c.reviewed);
    if (unreviewed) {
      const alertId = `alert-unreviewed-${unreviewed.id}`;
      if (!dismissedSet.has(alertId)) {
        alertsMap.set(alertId, {
          id: alertId,
          clientId: trainee.id,
          clientName: trainee.name,
          clientAvatar: trainee.avatarText || '??',
          type: 'UNREVIEWED_CHECK_IN',
          priority: 'CRITICAL',
          title: 'Check-In Awaiting Review',
          reason: `Submitted on ${unreviewed.date} with progress photos and measurements.`,
          timestamp: unreviewed.date,
          actionLabel: 'Review Check-In',
          targetSubTab: 'checkins'
        });
      }
    }

    // 2. Overdue Check-in (CRITICAL or WARNING)
    if (latestCheckIn) {
      const checkInTime = new Date(latestCheckIn.date).getTime();
      const daysSince = isNaN(checkInTime)
        ? 0
        : Math.floor((now.getTime() - checkInTime) / (1000 * 60 * 60 * 24));
      
      if (daysSince > 7) {
        const alertId = `alert-overdue-${trainee.id}`;
        if (!dismissedSet.has(alertId)) {
          alertsMap.set(alertId, {
            id: alertId,
            clientId: trainee.id,
            clientName: trainee.name,
            clientAvatar: trainee.avatarText || '??',
            type: 'CHECK_IN_OVERDUE',
            priority: daysSince > 10 ? 'CRITICAL' : 'WARNING',
            title: 'Weekly Check-In is Late',
            reason: `Last update was ${daysSince} days ago (${latestCheckIn.date}). Expected every 7 days.`,
            timestamp: `${daysSince}d late`,
            actionLabel: 'Check Status',
            targetSubTab: 'checkins'
          });
        }
      }
    } else {
      const alertId = `alert-initial-checkin-${trainee.id}`;
      if (!dismissedSet.has(alertId)) {
        alertsMap.set(alertId, {
          id: alertId,
          clientId: trainee.id,
          clientName: trainee.name,
          clientAvatar: trainee.avatarText || '??',
          type: 'CHECK_IN_OVERDUE',
          priority: 'WARNING',
          title: 'Initial Check-In Missing',
          reason: 'Client has not submitted baseline physique photos or measurements.',
          timestamp: 'Pending baseline',
          actionLabel: 'Request Check-In',
          targetSubTab: 'checkins'
        });
      }
    }

    // 3. No Workout Split Assigned (WARNING)
    if (!trainee.assignedPlanId) {
      const alertId = `alert-no-plan-${trainee.id}`;
      if (!dismissedSet.has(alertId)) {
        alertsMap.set(alertId, {
          id: alertId,
          clientId: trainee.id,
          clientName: trainee.name,
          clientAvatar: trainee.avatarText || '??',
          type: 'NO_WORKOUT_PLAN',
          priority: 'WARNING',
          title: 'No Custom Routine Set',
          reason: 'Athlete is active but currently has no custom training routine built.',
          timestamp: 'Setup required',
          actionLabel: 'Build Routine',
          targetSubTab: 'workout'
        });
      }
    }

    // 4. No Diet Protocol Assigned (INFO)
    const hasDiet = trainee.assignedDietPlanId || (dietPlans || []).some((d) => d.assignedUserId === trainee.id);
    if (!hasDiet) {
      const alertId = `alert-no-diet-${trainee.id}`;
      if (!dismissedSet.has(alertId)) {
        alertsMap.set(alertId, {
          id: alertId,
          clientId: trainee.id,
          clientName: trainee.name,
          clientAvatar: trainee.avatarText || '??',
          type: 'NO_DIET_PLAN',
          priority: 'INFO',
          title: 'No Nutrition Plan Assigned',
          reason: 'Daily macros and meal breakdowns have not been configured.',
          timestamp: 'Setup optional',
          actionLabel: 'Assign Diet',
          targetSubTab: 'nutrition'
        });
      }
    }

    // 5. Training Adherence (INFO)
    const traineeLogs = (logs || []).filter((l) => l.userId === trainee.id);
    if (trainee.assignedPlanId && traineeLogs.length === 0) {
      const alertId = `alert-adherence-${trainee.id}`;
      if (!dismissedSet.has(alertId)) {
        alertsMap.set(alertId, {
          id: alertId,
          clientId: trainee.id,
          clientName: trainee.name,
          clientAvatar: trainee.avatarText || '??',
          type: 'LOW_WORKOUT_ADHERENCE',
          priority: 'INFO',
          title: 'No Workouts Logged Yet',
          reason: 'Plan is assigned, but athlete has not logged any completed sessions.',
          timestamp: 'First week',
          actionLabel: 'View Workout Tab',
          targetSubTab: 'workout'
        });
      }
    }
  });

  // Sort by priority hierarchy: CRITICAL (0) > WARNING (1) > INFO (2)
  const priorityRank: Record<AlertPriority, number> = {
    CRITICAL: 0,
    WARNING: 1,
    INFO: 2
  };

  const rawAlerts = Array.from(alertsMap.values()).sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
  );

  // Validate each alert safely through Zod contract
  return rawAlerts.map((alert) => {
    const parseResult = CoachAlertSchema.safeParse(alert);
    if (parseResult.success) {
      return parseResult.data as CoachAlert;
    }
    return alert;
  });
}
