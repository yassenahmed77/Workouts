import { createClient } from '@supabase/supabase-js';
import { User, WorkoutPlan, Exercise, WorkoutLog } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helpers to transform database snake_case <-> camelCase

export function mapDbUserToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarText: row.avatar_text || row.name?.slice(0, 2).toUpperCase() || 'TR',
    status: row.status || 'active',
    joinedDate: row.joined_date || new Date().toISOString().split('T')[0],
    heightCm: Number(row.height_cm) || 170,
    weightKg: Number(row.weight_kg) || 70,
    targetWeightKg: Number(row.target_weight_kg) || Number(row.weight_kg) || 70,
    goal: row.goal || 'Hypertrophy / Muscle Gain',
    assignedPlanId: row.assigned_plan_id || undefined,
    notes: row.notes || ''
  };
}

export function mapUserToDb(user: User): any {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_text: user.avatarText,
    status: user.status,
    joined_date: user.joinedDate,
    height_cm: user.heightCm,
    weight_kg: user.weightKg,
    target_weight_kg: user.targetWeightKg,
    goal: user.goal,
    assigned_plan_id: user.assignedPlanId || null,
    notes: user.notes || null
  };
}

export function mapDbPlanToPlan(row: any): WorkoutPlan {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    level: row.level || 'Intermediate',
    durationWeeks: Number(row.duration_weeks) || 8,
    daysPerWeek: Number(row.days_per_week) || (Array.isArray(row.days) ? row.days.length : 4),
    days: Array.isArray(row.days) ? row.days : (typeof row.days === 'string' ? JSON.parse(row.days) : []),
    createdForUserId: row.created_for_user_id || undefined,
    createdAt: row.created_at || new Date().toISOString().split('T')[0],
    updatedAt: row.updated_at || new Date().toISOString().split('T')[0]
  };
}

export function mapPlanToDb(plan: WorkoutPlan): any {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    level: plan.level,
    duration_weeks: plan.durationWeeks,
    days_per_week: plan.daysPerWeek,
    days: plan.days,
    created_for_user_id: plan.createdForUserId || null,
    created_at: plan.createdAt,
    updated_at: plan.updatedAt
  };
}

export function mapDbExerciseToExercise(row: any): Exercise {
  return {
    id: row.id,
    name: row.name,
    targetMuscle: row.target_muscle,
    equipment: row.equipment,
    category: row.category,
    executionCue: row.execution_cue || '',
    tips: Array.isArray(row.tips) ? row.tips : [],
    alternativeExercise: row.alternative_exercise || undefined,
    videoUrl: row.video_url || undefined
  };
}

export function mapExerciseToDb(ex: Exercise): any {
  return {
    id: ex.id,
    name: ex.name,
    target_muscle: ex.targetMuscle,
    equipment: ex.equipment,
    category: ex.category,
    execution_cue: ex.executionCue,
    tips: ex.tips,
    alternative_exercise: ex.alternativeExercise || null,
    video_url: ex.videoUrl || null
  };
}

export function mapDbLogToLog(row: any): WorkoutLog {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    dayId: row.day_id,
    dayName: row.day_name,
    date: row.date,
    durationSeconds: Number(row.duration_seconds) || 0,
    totalVolumeKg: Number(row.total_volume_kg) || 0,
    completedExercises: Array.isArray(row.completed_exercises) 
      ? row.completed_exercises 
      : (typeof row.completed_exercises === 'string' ? JSON.parse(row.completed_exercises) : []),
    coachFeedback: row.coach_feedback || undefined
  };
}

export function mapLogToDb(log: WorkoutLog): any {
  return {
    id: log.id,
    user_id: log.userId,
    plan_id: log.planId,
    day_id: log.dayId,
    day_name: log.dayName,
    date: log.date,
    duration_seconds: log.durationSeconds,
    total_volume_kg: log.totalVolumeKg,
    completed_exercises: log.completedExercises,
    coach_feedback: log.coachFeedback || null
  };
}
