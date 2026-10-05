import { describe, it, expect } from 'vitest';
import { 
  calculateEstimated1RM, 
  getISOWeekKey, 
  calculateDynamicWorkoutStreak 
} from '@/lib/progressEngine';
import { WorkoutLog } from '@/types';

describe('progressEngine — Epley 1RM, Calendar Grouping & Streaks', () => {
  it('calculates 1RM accurately according to the Epley formula: weight * (1 + reps/30)', () => {
    // 100kg for 10 reps: 100 * (1 + 10/30) = 133.3 kg
    expect(calculateEstimated1RM(100, 10)).toBe(133.3);

    // 1 rep should return exact weight without alteration
    expect(calculateEstimated1RM(150, 1)).toBe(150);

    // 0 reps or non-positive weight should return 0
    expect(calculateEstimated1RM(0, 5)).toBe(0);
    expect(calculateEstimated1RM(-50, 5)).toBe(0);
    expect(calculateEstimated1RM(100, 0)).toBe(0);
  });

  it('generates consistent and valid ISO week keys for dates', () => {
    const weekKey = getISOWeekKey('2026-09-28');
    expect(weekKey).toMatch(/^2026-W\d{2}$/);

    // Invalid date returns 'unknown'
    expect(getISOWeekKey('invalid-date')).toBe('unknown');
  });

  it('computes dynamic workout streaks based on weekly targets without crashing', () => {
    // Empty logs return 0 streak
    const emptyResult = calculateDynamicWorkoutStreak([]);
    expect(emptyResult.streakWeeks).toBe(0);
    expect(emptyResult.isTargetMetThisWeek).toBe(false);

    // Logs meeting target
    const dummyLogs: WorkoutLog[] = [
      {
        id: 'log-1',
        userId: 'u1',
        planId: 'p1',
        dayId: 'd1',
        date: '2026-09-01',
        dayName: 'Chest',
        durationSeconds: 3600,
        totalVolumeKg: 5000,
        completedExercises: []
      },
      {
        id: 'log-2',
        userId: 'u1',
        planId: 'p1',
        dayId: 'd2',
        date: '2026-09-02',
        dayName: 'Back',
        durationSeconds: 3600,
        totalVolumeKg: 5000,
        completedExercises: []
      }
    ];

    const result = calculateDynamicWorkoutStreak(dummyLogs, 2);
    expect(result.targetDaysPerWeek).toBe(2);
  });
});
