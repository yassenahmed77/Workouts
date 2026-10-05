import { WorkoutPlan, WorkoutDay, RoutineExercise, Exercise, WorkoutLog, LoggedExercise } from '@/types';
import {
  WorkoutPlanSchema,
  WorkoutDaySchema,
  RoutineExerciseSchema,
  WorkoutPlanInput
} from '@/schemas/workout.schema';

/**
 * Workout & Plan Service Layer (Clean Architecture - Layer 3).
 * 
 * Provides pure business calculations, volume derivations, routine cloning,
 * multi-tenant scoping, and Zod runtime contract validation.
 */
export const workoutService = {
  /**
   * Multi-Tenant Scoping: Filter plans by coach boundary
   */
  getPlansByCoach(plans: WorkoutPlan[], coachId: string): WorkoutPlan[] {
    if (!Array.isArray(plans) || !coachId) return [];
    return plans.filter((p) => (p as any).coachId === coachId || !(p as any).coachId);
  },

  getPlansForUser(plans: WorkoutPlan[], userId: string): WorkoutPlan[] {
    if (!Array.isArray(plans) || !userId) return [];
    return plans.filter((p) => p.createdForUserId === userId);
  },

  getPlanById(plans: WorkoutPlan[], planId: string): WorkoutPlan | undefined {
    if (!Array.isArray(plans) || !planId) return undefined;
    return plans.find((p) => p.id === planId);
  },

  getExercisesByCategory(exercises: Exercise[], category?: string): Exercise[] {
    if (!Array.isArray(exercises)) return [];
    if (!category || category === 'All') return exercises;
    return exercises.filter((e) => e.targetMuscle === category || e.category === category);
  },

  getUserLogs(logs: WorkoutLog[], userId: string): WorkoutLog[] {
    if (!Array.isArray(logs) || !userId) return [];
    return logs.filter((l) => l.userId === userId);
  },

  /**
   * Sets Over Movements Metric:
   * Accurately calculates total prescribed sets across all exercises in a day.
   */
  calculateDayPrescribedSets(day?: WorkoutDay | null): number {
    if (!day || day.isRestDay || !Array.isArray(day.exercises)) return 0;
    return day.exercises.reduce((acc, ex) => {
      const setCount = typeof ex.sets === 'number' ? ex.sets : 0;
      return acc + setCount;
    }, 0);
  },

  /**
   * Calculates total prescribed sets across an entire weekly split.
   */
  calculateWeeklyPrescribedSets(plan?: WorkoutPlan | null): number {
    if (!plan || !Array.isArray(plan.days)) return 0;
    return plan.days.reduce((acc, d) => acc + this.calculateDayPrescribedSets(d), 0);
  },

  /**
   * Calculates total volume load (Tonnage: reps * weight) for completed session logs.
   * Defensive against NaN, null sets, or zero values.
   */
  calculateLoggedVolumeLoadKg(exercises?: LoggedExercise[] | null): number {
    if (!Array.isArray(exercises)) return 0;
    let totalVolume = 0;

    exercises.forEach((ex) => {
      if (Array.isArray(ex.sets)) {
        ex.sets.forEach((set) => {
          const reps = typeof set.reps === 'number' && set.reps > 0 ? set.reps : 0;
          const weight = typeof set.weightKg === 'number' && set.weightKg > 0 ? set.weightKg : 0;
          totalVolume += reps * weight;
        });
      }
    });

    return Math.round(totalVolume * 10) / 10;
  },

  /**
   * Analyzes weekly muscle volume distribution (prescribed sets per muscle group).
   */
  calculateMuscleDistribution(plan?: WorkoutPlan | null): Record<string, number> {
    const distribution: Record<string, number> = {};
    if (!plan || !Array.isArray(plan.days)) return distribution;

    plan.days.forEach((day) => {
      if (day.isRestDay || !Array.isArray(day.exercises)) return;
      day.exercises.forEach((ex) => {
        const muscle = ex.targetMuscle || 'Other';
        const setCount = typeof ex.sets === 'number' ? ex.sets : 0;
        distribution[muscle] = (distribution[muscle] || 0) + setCount;
      });
    });

    return distribution;
  },

  /**
   * Safely clones a workout split with unique IDs, resetting assigned athlete
   * and suffixing title with "(Copy)".
   */
  duplicatePlan(plan: WorkoutPlan): WorkoutPlan {
    const timestamp = Date.now();
    return {
      ...plan,
      id: `plan-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${plan.title} (Copy)`,
      createdForUserId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      days: (plan.days || []).map((day, dIdx) => ({
        ...day,
        id: `day-${timestamp}-${dIdx + 1}`,
        exercises: (day.exercises || []).map((ex, exIdx) => ({
          ...ex,
          id: `ex-${timestamp}-${dIdx + 1}-${exIdx + 1}`
        }))
      }))
    };
  },

  /**
   * Runtime Zod contract validation for Workout Plan creation/editing.
   */
  validatePlan(payload: unknown): { success: true; data: WorkoutPlanInput } | { success: false; errors: string[] } {
    const result = WorkoutPlanSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: true, data: result.data };
  }
};
