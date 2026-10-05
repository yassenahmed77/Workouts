import { z } from 'zod';
import { sanitizeString, sanitizeNotes, sanitizeUrl } from '@/lib/sanitizer';

export const MuscleGroupEnum = z.enum([
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes',
  'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
]);

export const EquipmentTypeEnum = z.enum([
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight',
  'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
]);

export const WorkoutLevelEnum = z.enum(['Beginner', 'Intermediate', 'Advanced']);

/**
 * Single exercise alternative model.
 */
export const ExerciseAlternativeSchema = z.object({
  name: z.string().min(1).transform(sanitizeString),
  videoUrl: z.string().optional().transform((v) => (v ? sanitizeUrl(v) : ''))
});

/**
 * Exercise entry in a routine (Prescribed workout split model).
 */
export const RoutineExerciseSchema = z.object({
  id: z.string().min(1, 'Exercise instance ID required'),
  exerciseId: z.string().min(1, 'Base exercise ID required'),
  exerciseName: z.string()
    .min(1, 'Exercise name required')
    .max(120, 'Exercise name too long')
    .transform(sanitizeString),
  targetMuscle: MuscleGroupEnum,
  equipment: EquipmentTypeEnum,
  sets: z.number().int().min(1, 'At least 1 set is required').max(30, 'Max 30 sets'),
  targetReps: z.string().min(1, 'Target reps required').transform(sanitizeString),
  targetRpe: z.union([z.string(), z.number()]).optional(),
  restSeconds: z.number().int().min(0).max(1800).default(90),
  notes: z.string().max(1000).optional().transform((val) => val ? sanitizeNotes(val) : undefined),
  alternativeExercise: z.string().optional().transform((val) => val ? sanitizeString(val) : undefined),
  alternatives: z.array(ExerciseAlternativeSchema).optional(),
  videoUrl: z.string().optional().transform((v) => (v ? sanitizeUrl(v) : '')),
  tips: z.array(z.string()).optional()
});

/**
 * Single training day inside a split.
 */
export const WorkoutDaySchema = z.object({
  id: z.string().min(1, 'Day ID required'),
  dayName: z.string()
    .min(1, 'Day title required')
    .max(80, 'Day title too long')
    .transform(sanitizeString),
  isRestDay: z.boolean(),
  targetMuscles: z.array(MuscleGroupEnum).default([]),
  estimatedMinutes: z.number().int().min(0).max(300).default(60),
  exercises: z.array(RoutineExerciseSchema).default([])
});

/**
 * Complete Workout Plan / Split contract.
 */
export const WorkoutPlanSchema = z.object({
  id: z.string().optional(),
  title: z.string()
    .min(2, 'Routine title must be at least 2 characters')
    .max(100, 'Routine title must be under 100 characters')
    .transform(sanitizeString),
  description: z.string()
    .max(1500, 'Description must be under 1500 characters')
    .optional()
    .transform((val) => val ? sanitizeNotes(val) : ''),
  level: WorkoutLevelEnum.default('Intermediate'),
  durationWeeks: z.number().int().min(1, 'Duration must be at least 1 week').max(52, 'Max 52 weeks').default(8),
  daysPerWeek: z.number().int().min(1).max(7).default(4),
  days: z.array(WorkoutDaySchema).min(1, 'Split must have at least 1 day').max(7, 'Split cannot exceed 7 days'),
  createdForUserId: z.string().optional(),
  coachId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type RoutineExerciseInput = z.infer<typeof RoutineExerciseSchema>;
export type WorkoutDayInput = z.infer<typeof WorkoutDaySchema>;
export type WorkoutPlanInput = z.infer<typeof WorkoutPlanSchema>;
