import { LoggedExercise } from '@/types';

export interface ActiveWorkoutDraft {
  userId: string;
  planId: string;
  dayId: string;
  dayName: string;
  startedAt: string;
  elapsedSeconds: number;
  lastUpdated: string;
  lastActivityAt?: string;
  estimatedMinutes?: number;
  exerciseLogs: LoggedExercise[];
}

export interface UnfinishedWorkoutRecord {
  userId: string;
  dayId: string;
  dayName: string;
  date: string;
  reason: 'timeout_inactivity';
  timedOutAt: string;
}

/**
 * Evaluates whether an active workout draft should be auto-closed due to inactivity timeout.
 * Rule: Coach estimated minutes + 15 min buffer.
 * If user hasn't logged anything or has no activity for the buffer period after the total estimated time,
 * it times out. But if the user is actively logging sets recently, it remains active!
 */
export function isDraftTimedOut(draft: ActiveWorkoutDraft, estimatedMinutesParam?: number): boolean {
  if (!draft) return false;
  const estimatedMin = estimatedMinutesParam || draft.estimatedMinutes || 60;
  const timeoutThresholdSeconds = (estimatedMin + 15) * 60;

  // If elapsed time has not exceeded the coach time + 15m, it is not timed out yet
  if (draft.elapsedSeconds < timeoutThresholdSeconds) {
    return false;
  }

  // If elapsed time HAS exceeded coach time + 15m:
  // Check user activity: Did they log or interact recently?
  const lastActiveTimestamp = draft.lastActivityAt || draft.lastUpdated || draft.startedAt;
  const lastActiveTime = new Date(lastActiveTimestamp).getTime();
  const now = Date.now();
  const inactivityMillis = now - lastActiveTime;
  const maxInactivityMillis = 15 * 60 * 1000; // 15 minutes of silence after exceeding estimated time

  // If the user has been inactive for > 15 minutes past the timeout threshold, mark as timed out
  return inactivityMillis > maxInactivityMillis;
}

/**
 * Record an incomplete/abandoned workout due to timeout.
 */
export function markWorkoutAsUnfinished(record: UnfinishedWorkoutRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `pro_gym_unfinished_${record.userId}`;
    const raw = localStorage.getItem(key);
    const existing: UnfinishedWorkoutRecord[] = raw ? JSON.parse(raw) : [];
    const updated = existing.filter((r) => !(r.dayId === record.dayId && r.date === record.date));
    updated.push(record);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving unfinished workout record:', e);
  }
}

/**
 * Check if a workout day was marked unfinished today for a user.
 */
export function isDayUnfinished(userId: string, dayId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = `pro_gym_unfinished_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const existing: UnfinishedWorkoutRecord[] = JSON.parse(raw);
    const todayStr = new Date().toISOString().split('T')[0];
    return existing.some((r) => r.dayId === dayId && r.date === todayStr);
  } catch (e) {
    return false;
  }
}

/**
 * Clear unfinished status when restarting or finishing a session.
 */
export function clearUnfinishedStatus(userId: string, dayId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `pro_gym_unfinished_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const existing: UnfinishedWorkoutRecord[] = JSON.parse(raw);
    const updated = existing.filter((r) => r.dayId !== dayId);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error clearing unfinished status:', e);
  }
}

/**
 * Retrieve saved in-progress active workout draft for a user & workout day.
 * Automatically checks and handles inactivity timeouts.
 */
export function getActiveWorkoutDraft(userId: string, dayId: string): ActiveWorkoutDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`pro_gym_active_draft_${userId}_${dayId}`);
    if (!raw) return null;
    const parsed: ActiveWorkoutDraft = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.exerciseLogs)) return null;

    // Check if timed out
    if (isDraftTimedOut(parsed)) {
      const todayStr = new Date().toISOString().split('T')[0];
      markWorkoutAsUnfinished({
        userId,
        dayId,
        dayName: parsed.dayName,
        date: todayStr,
        reason: 'timeout_inactivity',
        timedOutAt: new Date().toISOString()
      });
      clearActiveWorkoutDraft(userId, dayId);
      return null;
    }

    return parsed;
  } catch (e) {
    console.warn('Error reading active workout draft:', e);
    return null;
  }
}

/**
 * Get active draft for user across any day.
 */
export function getUserActiveDraft(userId: string): ActiveWorkoutDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const latestDayId = localStorage.getItem(`pro_gym_latest_active_day_${userId}`);
    if (!latestDayId) return null;
    return getActiveWorkoutDraft(userId, latestDayId);
  } catch (e) {
    return null;
  }
}

/**
 * Save current live workout session progress to localStorage immediately.
 */
export function saveActiveWorkoutDraft(draft: ActiveWorkoutDraft): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `pro_gym_active_draft_${draft.userId}_${draft.dayId}`,
      JSON.stringify({
        ...draft,
        lastUpdated: new Date().toISOString()
      })
    );
    localStorage.setItem(`pro_gym_latest_active_day_${draft.userId}`, draft.dayId);
  } catch (e) {
    console.warn('Error saving active workout draft:', e);
  }
}

/**
 * Clear the in-progress draft once session is finalized or discarded.
 */
export function clearActiveWorkoutDraft(userId: string, dayId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`pro_gym_active_draft_${userId}_${dayId}`);
    const latest = localStorage.getItem(`pro_gym_latest_active_day_${userId}`);
    if (latest === dayId) {
      localStorage.removeItem(`pro_gym_latest_active_day_${userId}`);
    }
  } catch (e) {
    console.warn('Error clearing active workout draft:', e);
  }
}

/**
 * Check if there is an existing active session with recorded progress.
 */
export function hasActiveWorkoutDraft(userId: string, dayId: string): boolean {
  const draft = getActiveWorkoutDraft(userId, dayId);
  if (!draft) return false;
  const hasCompletedSets = draft.exerciseLogs.some((ex) =>
    ex.sets.some((s) => s.completed || (s.weightKg > 0 && s.reps > 0))
  );
  return hasCompletedSets || draft.elapsedSeconds > 10;
}
