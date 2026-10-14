/**
 * @file alertsEngine.js
 * @description محرك التنبيهات الذكية للكوتش (Coach Smart Alerts Engine)
 * يفحص حالة المتدربين والتقارير الأسبوعية والخطط ويكتشف تلقائياً:
 * 1. تقارير المتابعة التي لم تُراجع (Unreviewed Check-ins)
 * 2. المتدربين المتأخرين عن إرسال التقرير الأسبوعي (Overdue Check-ins)
 * 3. المتدربين الذين ليس لديهم خطة تمرين أو نظام غذائي (Missing Routine/Diet)
 * 4. المتدربين الذين لم يسجلوا أي تمرين (Low Adherence)
 */

import { CoachAlertSchema } from '@/schemas/alert.schema';

const STORAGE_KEY_DISMISSED_ALERTS = 'pro_gym_dismissed_alerts_v1';

/**
 * جلب معرفات التنبيهات التي تم إخفاؤها أو تجاهلها من الكوتش
 * @returns {string[]} قائمة بمعرفات التنبيهات المتجاهلة
 */
export function getDismissedAlertIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED_ALERTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // تجاهل الأخطاء بهدوء
  }
  return [];
}

/**
 * إخفاء تنبيه محدد
 * @param {string} alertId - معرّف التنبيه
 */
export function dismissAlert(alertId) {
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

/**
 * استعادة تنبيه تم إخفاؤه مسبقاً
 * @param {string} alertId - معرّف التنبيه
 */
export function restoreAlert(alertId) {
  if (typeof window === 'undefined') return;
  try {
    const dismissed = getDismissedAlertIds();
    localStorage.setItem(STORAGE_KEY_DISMISSED_ALERTS, JSON.stringify(dismissed.filter((id) => id !== alertId)));
  } catch {
    // ignore
  }
}

/**
 * مسح جميع التنبيهات المتجاهلة وإعادتها للظهور
 */
export function clearDismissedAlerts() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_DISMISSED_ALERTS);
  } catch {
    // ignore
  }
}

/**
 * استخراج وتوليد التنبيهات الحية للكوتش بناءً على بيانات المتدربين الفعلية
 * @param {Array<Object>} users - قائمة المستخدمين
 * @param {Array<Object>} checkIns - تقارير المتابعة
 * @param {Array<Object>} plans - خطط التمارين
 * @param {Array<Object>} dietPlans - الأنظمة الغذائية
 * @param {Array<Object>} logs - سجلات التمارين
 * @param {string} [coachId] - معرّف الكوتش لعزل البيانات (Multi-tenancy)
 * @param {Object} [options] - خيارات التنبيهات
 * @param {boolean} [options.includeDismissed=false] - تضمين التنبيهات المتجاهلة
 * @returns {Array<Object>} قائمة التنبيهات مرتبة حسب الأولوية
 */
export function deriveCoachAlerts(
  users,
  checkIns,
  plans,
  dietPlans,
  logs,
  coachId,
  options
) {
  const alertsMap = new Map();
  const dismissedIds = options?.includeDismissed ? [] : getDismissedAlertIds();
  const dismissedSet = new Set(dismissedIds);

  // تصفية المتدربين التابعين لهذا الكوتش فقط
  const trainees = (users || []).filter((u) => {
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

    // 1. تقرير أسبوعي بانتظار المراجعة (CRITICAL - عالي الأهمية)
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

    // 2. متدرب متأخر عن موعد التقرير الأسبوعي (CRITICAL / WARNING)
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

    // 3. متدرب بدون خطة تمرين مسندة (WARNING)
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

    // 4. متدرب بدون نظام غذائي (INFO)
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

    // 5. متدرب لديه خطة لكن لم يسجل أي تمرين (INFO)
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

  // ترتيب التنبيهات حسب الأولوية: CRITICAL أولاً ثم WARNING ثم INFO
  const priorityRank = {
    CRITICAL: 0,
    WARNING: 1,
    INFO: 2
  };

  const rawAlerts = Array.from(alertsMap.values()).sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
  );

  // التحقق من صحة التنبيه عبر الـ Zod Schema لضمان عدم وجود أخطاء في البيانات
  return rawAlerts.map((alert) => {
    const parseResult = CoachAlertSchema.safeParse(alert);
    if (parseResult.success) {
      return parseResult.data;
    }
    return alert;
  });
}
