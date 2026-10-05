import { describe, it, expect, beforeEach } from 'vitest';
import {
  getActiveWorkoutDraft,
  saveActiveWorkoutDraft,
  clearActiveWorkoutDraft,
  hasActiveWorkoutDraft,
  ActiveWorkoutDraft
} from '@/lib/activeWorkoutEngine';

describe('activeWorkoutEngine — Local Draft Auto-Recovery & Crash Protection', () => {
  const mockUserId = 'user-test-123';
  const mockDayId = 'day-test-456';

  const sampleDraft: ActiveWorkoutDraft = {
    userId: mockUserId,
    planId: 'plan-1',
    dayId: mockDayId,
    dayName: 'Day 1: Heavy Chest',
    startedAt: '2026-10-01T10:00:00.000Z',
    elapsedSeconds: 125,
    lastUpdated: '2026-10-01T10:02:05.000Z',
    exerciseLogs: [
      {
        exerciseId: 'ex-bench',
        exerciseName: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 100, reps: 8, completed: true },
          { setNumber: 2, weightKg: 100, reps: 6, completed: false }
        ]
      }
    ]
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and restores an active workout draft accurately', () => {
    expect(getActiveWorkoutDraft(mockUserId, mockDayId)).toBeNull();

    saveActiveWorkoutDraft(sampleDraft);

    const loaded = getActiveWorkoutDraft(mockUserId, mockDayId);
    expect(loaded).not.toBeNull();
    expect(loaded?.userId).toBe(mockUserId);
    expect(loaded?.dayId).toBe(mockDayId);
    expect(loaded?.elapsedSeconds).toBe(125);
    expect(loaded?.exerciseLogs.length).toBe(1);
    expect(loaded?.exerciseLogs[0].sets[0].completed).toBe(true);
  });

  it('correctly detects if a meaningful active draft exists with recorded progress', () => {
    expect(hasActiveWorkoutDraft(mockUserId, mockDayId)).toBe(false);

    // Save with completed set
    saveActiveWorkoutDraft(sampleDraft);
    expect(hasActiveWorkoutDraft(mockUserId, mockDayId)).toBe(true);

    // Test draft with 0 completed sets but elapsedSeconds > 10
    const emptyWithTimer: ActiveWorkoutDraft = {
      ...sampleDraft,
      elapsedSeconds: 45,
      exerciseLogs: [
        {
          exerciseId: 'ex-1',
          exerciseName: 'Push Ups',
          targetMuscle: 'Chest',
          sets: [{ setNumber: 1, weightKg: 0, reps: 0, completed: false }]
        }
      ]
    };
    saveActiveWorkoutDraft(emptyWithTimer);
    expect(hasActiveWorkoutDraft(mockUserId, mockDayId)).toBe(true);
  });

  it('clears active draft cleanly upon workout completion or reset', () => {
    saveActiveWorkoutDraft(sampleDraft);
    expect(getActiveWorkoutDraft(mockUserId, mockDayId)).not.toBeNull();

    clearActiveWorkoutDraft(mockUserId, mockDayId);
    expect(getActiveWorkoutDraft(mockUserId, mockDayId)).toBeNull();
    expect(hasActiveWorkoutDraft(mockUserId, mockDayId)).toBe(false);
  });

  it('handles corrupted localStorage data without throwing or crashing', () => {
    localStorage.setItem(`pro_gym_active_draft_${mockUserId}_${mockDayId}`, 'INVALID_NOT_JSON{{{');

    expect(() => {
      const result = getActiveWorkoutDraft(mockUserId, mockDayId);
      expect(result).toBeNull();
    }).not.toThrow();
  });
});
