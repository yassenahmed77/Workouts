import { User, WorkoutPlan, WeeklyCheckIn, DietPlan, WorkoutLog } from '@/types';
import { 
  deriveCoachAlerts, 
  CoachAlert, 
  getDismissedAlertIds, 
  dismissAlert, 
  restoreAlert, 
  clearDismissedAlerts 
} from '@/lib/alertsEngine';

/**
 * Alert & Notification Domain Service Layer (Layer 3).
 * Provides multi-tenant alert derivation, priority counts, and dismissal lifecycle.
 */
export const alertService = {
  getCoachAlerts(
    users: User[],
    checkIns: WeeklyCheckIn[],
    plans: WorkoutPlan[],
    dietPlans: DietPlan[],
    logs: WorkoutLog[],
    coachId?: string,
    options?: { includeDismissed?: boolean }
  ): CoachAlert[] {
    return deriveCoachAlerts(users, checkIns, plans, dietPlans, logs, coachId, options);
  },

  getAlertCounts(alerts: CoachAlert[]) {
    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.priority === 'CRITICAL').length,
      warning: alerts.filter((a) => a.priority === 'WARNING').length,
      info: alerts.filter((a) => a.priority === 'INFO').length,
      checkins: alerts.filter(
        (a) => a.type === 'CHECK_IN_OVERDUE' || a.type === 'UNREVIEWED_CHECK_IN' || a.targetSubTab === 'checkins'
      ).length,
      diet: alerts.filter((a) => a.type === 'NO_DIET_PLAN' || a.targetSubTab === 'nutrition').length,
      training: alerts.filter(
        (a) => a.type === 'NO_WORKOUT_PLAN' || a.type === 'LOW_WORKOUT_ADHERENCE' || a.targetSubTab === 'workout'
      ).length
    };
  },

  dismiss(alertId: string): void {
    dismissAlert(alertId);
  },

  restore(alertId: string): void {
    restoreAlert(alertId);
  },

  clearAllDismissed(): void {
    clearDismissedAlerts();
  },

  getDismissedIds(): string[] {
    return getDismissedAlertIds();
  }
};
