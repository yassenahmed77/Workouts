import { describe, it, expect } from 'vitest';
import { workoutService } from '@/services/workoutService';
import { WorkoutPlan, WorkoutDay, LoggedExercise } from '@/types';

const mockDay: WorkoutDay = {
  id: 'd1',
  dayName: 'Day 1 - Push Focus',
  isRestDay: false,
  targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
  estimatedMinutes: 60,
  exercises: [
    {
      id: 'e1',
      exerciseId: 'base-1',
      exerciseName: 'Barbell Incline Press',
      targetMuscle: 'Chest',
      equipment: 'Barbell',
      sets: 3,
      targetReps: '8-10',
      restSeconds: 90
    },
    {
      id: 'e2',
      exerciseId: 'base-2',
      exerciseName: 'Dumbbell Lateral Raise',
      targetMuscle: 'Shoulders',
      equipment: 'Dumbbell',
      sets: 2,
      targetReps: '12-15',
      restSeconds: 60
    }
  ]
};

const mockRestDay: WorkoutDay = {
  id: 'd2',
  dayName: 'Day 2 - Rest & Mobility',
  isRestDay: true,
  targetMuscles: [],
  estimatedMinutes: 0,
  exercises: []
};

const mockPlan: WorkoutPlan = {
  id: 'p1',
  title: 'Hypertrophy Mastery Split',
  description: '4-day muscle building split',
  level: 'Intermediate',
  durationWeeks: 8,
  daysPerWeek: 4,
  days: [mockDay, mockRestDay],
  createdAt: '2026-09-01',
  updatedAt: '2026-09-01'
};

const mockLoggedExercises: LoggedExercise[] = [
  {
    exerciseId: 'base-1',
    exerciseName: 'Barbell Incline Press',
    targetMuscle: 'Chest',
    sets: [
      { setNumber: 1, reps: 10, weightKg: 80, completed: true },
      { setNumber: 2, reps: 8, weightKg: 85, completed: true },
      { setNumber: 3, reps: 6, weightKg: 90, completed: true }
    ]
  },
  {
    exerciseId: 'base-2',
    exerciseName: 'Dumbbell Lateral Raise',
    targetMuscle: 'Shoulders',
    sets: [
      { setNumber: 1, reps: 15, weightKg: 12, completed: true },
      { setNumber: 2, reps: 12, weightKg: 14, completed: true }
    ]
  }
];

describe('workoutService — Volume Calculations & Business Logic', () => {
  it('calculates total prescribed sets accurately for active days and ignores rest days', () => {
    // 3 sets on exercise 1 + 2 sets on exercise 2 = 5 sets
    expect(workoutService.calculateDayPrescribedSets(mockDay)).toBe(5);
    // Rest day = 0 sets
    expect(workoutService.calculateDayPrescribedSets(mockRestDay)).toBe(0);
    expect(workoutService.calculateDayPrescribedSets(null)).toBe(0);
  });

  it('calculates weekly prescribed sets across entire plan', () => {
    expect(workoutService.calculateWeeklyPrescribedSets(mockPlan)).toBe(5);
    expect(workoutService.calculateWeeklyPrescribedSets(null)).toBe(0);
  });

  it('calculates logged volume load tonnage (reps * weight) without NaN or precision errors', () => {
    // Ex 1: (10*80) + (8*85) + (6*90) = 800 + 680 + 540 = 2020 kg
    // Ex 2: (15*12) + (12*14) = 180 + 168 = 348 kg
    // Total = 2368 kg
    expect(workoutService.calculateLoggedVolumeLoadKg(mockLoggedExercises)).toBe(2368);
    expect(workoutService.calculateLoggedVolumeLoadKg([])).toBe(0);
    expect(workoutService.calculateLoggedVolumeLoadKg(null)).toBe(0);
  });

  it('aggregates muscle group set distribution accurately', () => {
    const distribution = workoutService.calculateMuscleDistribution(mockPlan);
    expect(distribution['Chest']).toBe(3);
    expect(distribution['Shoulders']).toBe(2);
    expect(distribution['Back']).toBeUndefined();
  });

  it('clones a workout plan with unique IDs and clean naming', () => {
    const clone = workoutService.duplicatePlan(mockPlan);
    expect(clone.id).not.toBe(mockPlan.id);
    expect(clone.title).toBe('Hypertrophy Mastery Split (Copy)');
    expect(clone.days[0].id).not.toBe(mockPlan.days[0].id);
    expect(clone.days[0].exercises[0].id).not.toBe(mockPlan.days[0].exercises[0].id);
  });
});

describe('workoutService — Zod Contract Validation & XSS Defense', () => {
  it('validates a well-formed workout plan successfully', () => {
    const res = workoutService.validatePlan({
      title: 'Advanced Upper Lower',
      level: 'Advanced',
      durationWeeks: 12,
      daysPerWeek: 4,
      days: [
        {
          id: 'day-1',
          dayName: 'Upper Power',
          isRestDay: false,
          targetMuscles: ['Chest', 'Back'],
          estimatedMinutes: 75,
          exercises: [
            {
              id: 'ex-1',
              exerciseId: 'base-1',
              exerciseName: 'Bench Press',
              targetMuscle: 'Chest',
              equipment: 'Barbell',
              sets: 4,
              targetReps: '5-6',
              restSeconds: 120
            }
          ]
        }
      ]
    });
    expect(res.success).toBe(true);
  });

  it('rejects workout plan with negative duration or 0 sets', () => {
    const res = workoutService.validatePlan({
      title: 'Broken Plan',
      level: 'Intermediate',
      durationWeeks: -2, // Invalid!
      days: [
        {
          id: 'day-1',
          dayName: 'Day 1',
          isRestDay: false,
          targetMuscles: ['Chest'],
          estimatedMinutes: 60,
          exercises: [
            {
              id: 'ex-1',
              exerciseId: 'base-1',
              exerciseName: 'Bench Press',
              targetMuscle: 'Chest',
              equipment: 'Barbell',
              sets: 0, // Invalid!
              targetReps: '10'
            }
          ]
        }
      ]
    });
    expect(res.success).toBe(false);
  });

  it('neutralizes malicious XSS script tags in routine titles and notes', () => {
    const res = workoutService.validatePlan({
      title: '<script>alert("hack")</script>Push Pull Legs',
      description: 'Focus on progressive overload.<script>steal()</script>',
      level: 'Intermediate',
      durationWeeks: 8,
      days: [
        {
          id: 'day-1',
          dayName: 'Push <script>bad()</script>',
          isRestDay: false,
          targetMuscles: ['Chest'],
          estimatedMinutes: 60,
          exercises: [
            {
              id: 'ex-1',
              exerciseId: 'base-1',
              exerciseName: 'Incline Press',
              targetMuscle: 'Chest',
              equipment: 'Barbell',
              sets: 3,
              targetReps: '8-10',
              notes: '<script>evil()</script>Control the eccentric phase.'
            }
          ]
        }
      ]
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.title).toBe('Push Pull Legs');
      expect(res.data.description).toContain('Focus on progressive overload.');
      expect(res.data.description).not.toContain('<script>');
      expect(res.data.days[0].dayName).toBe('Push');
      expect(res.data.days[0].exercises[0].notes).toContain('Control the eccentric phase.');
      expect(res.data.days[0].exercises[0].notes).not.toContain('<script>');
    }
  });
});
