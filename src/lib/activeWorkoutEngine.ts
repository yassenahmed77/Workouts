import { LoggedExercise } from '@/types';

export interface ActiveWorkoutDraft {
  userId: string;
  planId: string;
  dayId: string;
  dayName: string;
  startedAt: string;
  elapsedSeconds: number;
  lastUpdated: string;
  exerciseLogs: LoggedExercise[];
}

/**
 * Retrieve saved in-progress active workout draft for a user & workout day.
 */
export function getActiveWorkoutDraft(userId: string, dayId: string): ActiveWorkoutDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`pro_gym_active_draft_${userId}_${dayId}`);
    if (!raw) return null;
    const parsed: ActiveWorkoutDraft = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.exerciseLogs)) return null;
    return parsed;
  } catch (e) {
    console.warn('Error reading active workout draft:', e);
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
