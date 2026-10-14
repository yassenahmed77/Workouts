/**
 * @file smartNotifications.js
 * @description محرك الإشعارات الذكية والتنبيهات المباشرة (Smart Contextual Notifications)
 * يولد تنبيهات فورية للمتدرب حسب تقدمه:
 * 1. تحذير الخوف من كسر سلسلة العادات (Streak at risk).
 * 2. تذكير بموعد تمرين اليوم.
 * 3. تذكيرات شرب الماء والمكملات الغذائية.
 * 4. احتفال بتحقيق أهداف الأسبوع أو أوزان قياسية جديدة.
 * 5. تذكير النوم والاستشفاء العضلي ليلاً.
 */

import { getHabitRecords, calculateOverallHabitsSummary } from './habitsEngine';
import { getISOWeekKey } from './progressEngine';

const STORAGE_KEY_NOTIFS = 'pro_gym_smart_notifications_v2';

/**
 * جلب الإشعارات المحفوظة للمستخدم
 * @param {string} userId - معرّف المتدرب
 * @returns {Array<Object>}
 */
export function getStoredNotifications(userId) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_NOTIFS}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to fetch notifications:', e);
  }
  return [];
}

/**
 * حفظ قائمة الإشعارات
 * @param {string} userId - معرّف المتدرب
 * @param {Array<Object>} notifs - قائمة الإشعارات
 */
export function saveStoredNotifications(userId, notifs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_NOTIFS}_${userId}`, JSON.stringify(notifs));
  } catch (e) {
    console.warn('Failed to save notifications:', e);
  }
}

/**
 * طلب إذن إشعارات المتصفح (Web Push Notification Permission)
 * @returns {Promise<boolean>}
 */
export async function requestPushPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    return false;
  }
}

/**
 * إطلاق إشعار نظام حقيقي على شاشة الهاتف أو الكمبيوتر (Push Notification with Vibration)
 * @param {string} title - عنوان الإشعار
 * @param {string} body - نص الإشعار
 * @param {string} [url='/'] - الرابط المستهدف عند النقر
 * @param {string} [icon='/icon.svg'] - مسار الأيقونة
 */
export async function triggerWebNotification(title, body, url = '/', icon = '/icon.svg') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      // 1. استخدام الـ Service Worker إن وجد (يدعم الاهتزاز وشاشة القفل في الهواتف)
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            icon,
            badge: icon,
            vibrate: [200, 100, 200],
            data: { url }
          });
          return;
        }
      }

      // 2. استخدام المنشئ العادي Notification
      new Notification(title, {
        body,
        icon,
        badge: icon
      });
    } catch (e) {
      console.warn('Native notification trigger error:', e);
    }
  }
}

/**
 * توليد وتحديث الإشعارات الذكية بناءً على بيانات المتدرب الحية
 * @param {Object} user - كائن المتدرب
 * @param {Array<Object>} userLogs - سجلات التمارين
 * @param {Object|null} userPlan - خطة التمرين الحالية
 * @param {Array<Object>} userHabits - عادات المتدرب
 * @returns {Array<Object>} قائمة الإشعارات الذكية المحدثة
 */
export function generateSmartNotifications(user, userLogs, userPlan, userHabits) {
  const existing = getStoredNotifications(user.id);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const hour = now.getHours();

  const generated = [];

  // 1. تحذير كسر الـ Streak (بعد الساعة 4 عصراً إذا لم تكتمل عادات اليوم)
  const habitsSummary = calculateOverallHabitsSummary(user.id, userHabits);
  if (habitsSummary.activeStreak > 0 && habitsSummary.todayCompletedCount < habitsSummary.todayTotalCount && hour >= 16) {
    const uncompletedCount = habitsSummary.todayTotalCount - habitsSummary.todayCompletedCount;
    generated.push({
      id: `streak-warning-${todayStr}`,
      type: 'streak_warning',
      title: 'Streak at Risk!',
      message: `You have a ${habitsSummary.activeStreak}-day streak going! Complete ${uncompletedCount} remaining habits before midnight to keep it alive.`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      actionTab: 'habits',
      iconKey: 'flame'
    });
  }

  // 2. تذكير بموعد تمرين اليوم إذا لم يسجل تمرينه بعد
  const hasLoggedToday = (userLogs || []).some((l) => l.date === todayStr);
  const activeDay = userPlan?.days?.find((d) => !d.isRestDay) || userPlan?.days?.[0];

  if (userPlan && activeDay && !activeDay.isRestDay && !hasLoggedToday) {
    generated.push({
      id: `workout-due-${todayStr}`,
      type: 'workout_due',
      title: 'Time to Train!',
      message: `Scheduled: ${activeDay.dayName} (${activeDay.exercises?.length || 0} movements, ~${activeDay.estimatedMinutes || 45}m). Ready to hit the iron?`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      actionTab: 'split',
      iconKey: 'dumbbell'
    });
  }

  // 3. تذكيرات العادات المحددة (ماء، مكملات)
  (userHabits || []).forEach((habit) => {
    const records = getHabitRecords(user.id);
    const rec = records[`${habit.id}_${todayStr}`];
    const isDone = rec && rec.completed;

    if (!isDone) {
      if (habit.category === 'Nutrition' && habit.unit === 'L' && hour >= 13 && hour <= 19) {
        generated.push({
          id: `habit-water-${todayStr}`,
          type: 'habit_reminder',
          title: 'Hydration Checkpoint',
          message: `You're at ${rec?.value || 0}L of your ${habit.targetValue}L daily target. Drink a glass now to maintain muscle fullness!`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'medium',
          actionTab: 'habits',
          iconKey: 'droplets'
        });
      } else if (habit.category === 'Supplement' && hour >= 10 && hour <= 20) {
        generated.push({
          id: `habit-supp-${todayStr}`,
          type: 'habit_reminder',
          title: `${habit.title} Reminder`,
          message: `Keep your supplement regimen consistent. Tap to log your ${habit.title} for today!`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'medium',
          actionTab: 'habits',
          iconKey: habit.iconKey || 'pill'
        });
      }
    }
  });

  // 4. تحقيق هدف الأسبوع بنسبة 100%
  const currentWeekKey = getISOWeekKey(todayStr);
  const thisWeekLogs = (userLogs || []).filter((l) => getISOWeekKey(l.date) === currentWeekKey);
  const weeklyTarget = userPlan?.daysPerWeek || 4;

  if (thisWeekLogs.length >= weeklyTarget && weeklyTarget > 0) {
    generated.push({
      id: `weekly-goal-${currentWeekKey}`,
      type: 'weekly_goal',
      title: '100% Weekly Discipline!',
      message: `Incredible work! You crushed all ${thisWeekLogs.length} of ${weeklyTarget} scheduled workouts this week.`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      actionTab: 'history',
      iconKey: 'award'
    });
  }

  // 5. احتفال بحجم تدريبي ضخم في آخر تمرين (Volume Celebration >= 5000kg)
  if (userLogs && userLogs.length > 0) {
    const latestLog = [...userLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (latestLog && latestLog.totalVolumeKg && latestLog.totalVolumeKg >= 5000) {
      generated.push({
        id: `pr-celebration-${latestLog.id}`,
        type: 'pr_celebration',
        title: 'High-Volume Lift!',
        message: `Massive tonnage! You moved ${latestLog.totalVolumeKg.toLocaleString()} kg total volume during your ${latestLog.dayName} session.`,
        timestamp: latestLog.date,
        read: false,
        priority: 'medium',
        actionTab: 'history',
        iconKey: 'zap'
      });
    }
  }

  // 6. تذكير النوم والاستشفاء ليلاً (بعد الساعة 9 مساءً)
  if (hour >= 21 || hour < 4) {
    generated.push({
      id: `recovery-sleep-${todayStr}`,
      type: 'recovery',
      title: 'Peak Recovery Window',
      message: 'Muscle growth occurs during deep sleep. Optimize your 8-hour sleep schedule for maximum protein synthesis.',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'low',
      actionTab: 'habits',
      iconKey: 'moon'
    });
  }

  // دمج الإشعارات مع الحفاظ على حالة القراءة السابقة
  const existingMap = new Map(existing.map((n) => [n.id, n]));
  const merged = generated.map((gen) => {
    if (existingMap.has(gen.id)) {
      return {
        ...gen,
        read: existingMap.get(gen.id).read
      };
    }
    return gen;
  });

  saveStoredNotifications(user.id, merged);
  return merged;
}

/**
 * تحديد إشعار محدد كمقروء
 * @param {string} userId - معرّف المتدرب
 * @param {string} notifId - معرّف الإشعار
 * @returns {Array<Object>}
 */
export function markNotificationAsRead(userId, notifId) {
  const current = getStoredNotifications(userId);
  const updated = current.map((n) => (n.id === notifId ? { ...n, read: true } : n));
  saveStoredNotifications(userId, updated);
  return updated;
}

/**
 * تحديد جميع الإشعارات كمقروءة
 * @param {string} userId - معرّف المتدرب
 * @returns {Array<Object>}
 */
export function markAllNotificationsAsRead(userId) {
  const current = getStoredNotifications(userId);
  const updated = current.map((n) => ({ ...n, read: true }));
  saveStoredNotifications(userId, updated);
  return updated;
}
