import { WorkoutLog, WorkoutPlan, User } from '@/types';
import { UserHabit, getHabitRecords, calculateOverallHabitsSummary } from './habitsEngine';
import { getISOWeekKey } from './progressEngine';

export interface SmartNotification {
  id: string;
  type: 'streak_warning' | 'workout_due' | 'habit_reminder' | 'pr_celebration' | 'weekly_goal' | 'recovery';
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionTab?: 'today' | 'split' | 'habits' | 'history';
  iconKey: string;
}

const STORAGE_KEY_NOTIFS = 'pro_gym_smart_notifications_v2';

/**
 * Get stored notifications for a user
 */
export function getStoredNotifications(userId: string): SmartNotification[] {
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
 * Save notifications for a user
 */
export function saveStoredNotifications(userId: string, notifs: SmartNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_NOTIFS}_${userId}`, JSON.stringify(notifs));
  } catch (e) {
    console.warn('Failed to save notifications:', e);
  }
}

/**
 * Request Browser Web Push Notification Permission
 */
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    return false;
  }
}

/**
 * Trigger Native Web Push / System Notification (Lock screen banner & vibration)
 */
export async function triggerWebNotification(title: string, body: string, url = '/', icon = '/icon.svg') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      // 1. Try Service Worker showNotification (Supports system lockscreen, vibration, sound on mobile)
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            icon,
            badge: icon,
            vibrate: [200, 100, 200],
            data: { url }
          } as NotificationOptions);
          return;
        }
      }

      // 2. Fallback to standard window Notification constructor
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
 * Generate and refresh smart contextual notifications based on live user data
 */
export function generateSmartNotifications(
  user: User,
  userLogs: WorkoutLog[],
  userPlan: WorkoutPlan | null,
  userHabits: UserHabit[]
): SmartNotification[] {
  const existing = getStoredNotifications(user.id);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const hour = now.getHours();

  const generated: SmartNotification[] = [];

  // 1. STREAK AT RISK WARNING
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

  // 2. WORKOUT DUE TODAY REMINDER
  const hasLoggedToday = userLogs.some((l) => l.date === todayStr);
  const activeDay = userPlan?.days.find((d) => !d.isRestDay) || userPlan?.days[0];

  if (userPlan && activeDay && !activeDay.isRestDay && !hasLoggedToday) {
    generated.push({
      id: `workout-due-${todayStr}`,
      type: 'workout_due',
      title: 'Time to Train!',
      message: `Scheduled: ${activeDay.dayName} (${activeDay.exercises.length} movements, ~${activeDay.estimatedMinutes}m). Ready to hit the iron?`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      actionTab: 'split',
      iconKey: 'dumbbell'
    });
  }

  // 3. HABIT SPECIFIC REMINDERS
  userHabits.forEach((habit) => {
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

  // 4. WEEKLY DISCIPLINE MILESTONE
  const currentWeekKey = getISOWeekKey(todayStr);
  const thisWeekLogs = userLogs.filter((l) => getISOWeekKey(l.date) === currentWeekKey);
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

  // 5. HIGH-VOLUME RECENT SESSION CELEBRATION
  if (userLogs.length > 0) {
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

  // 6. LATE-NIGHT RECOVERY & SLEEP REMINDER
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

  // Merge generated with existing preserving read status
  const existingMap = new Map(existing.map((n) => [n.id, n]));
  const merged: SmartNotification[] = generated.map((gen) => {
    if (existingMap.has(gen.id)) {
      return {
        ...gen,
        read: existingMap.get(gen.id)!.read
      };
    }
    return gen;
  });

  saveStoredNotifications(user.id, merged);
  return merged;
}

/**
 * Mark a single notification as read
 */
export function markNotificationAsRead(userId: string, notifId: string): SmartNotification[] {
  const current = getStoredNotifications(userId);
  const updated = current.map((n) => (n.id === notifId ? { ...n, read: true } : n));
  saveStoredNotifications(userId, updated);
  return updated;
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(userId: string): SmartNotification[] {
  const current = getStoredNotifications(userId);
  const updated = current.map((n) => ({ ...n, read: true }));
  saveStoredNotifications(userId, updated);
  return updated;
}
