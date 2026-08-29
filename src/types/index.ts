export type UserRole = 'coach' | 'trainee';

export type UserGoal = 
  | 'Hypertrophy / Muscle Gain' 
  | 'Strength & Power' 
  | 'Fat Loss & Conditioning' 
  | 'Athletic Performance'
  | 'Rehabilitation & Mobility';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarText: string;
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: UserGoal;
  assignedPlanId?: string;
  notes?: string;
}

export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Shoulders' 
  | 'Quads' 
  | 'Hamstrings' 
  | 'Glutes' 
  | 'Arms' 
  | 'Biceps' 
  | 'Triceps' 
  | 'Calves' 
  | 'Core' 
  | 'Forearms' 
  | 'Traps' 
  | 'Full Body';

export type EquipmentType = 
  | 'Barbell' 
  | 'Dumbbell' 
  | 'Cable' 
  | 'Machine' 
  | 'Bodyweight' 
  | 'Smith Machine' 
  | 'EZ Bar' 
  | 'Kettlebell' 
  | 'Resistance Band' 
  | 'Other';

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  equipment: EquipmentType;
  category: 'Compound' | 'Isolation';
  executionCue: string;
  tips: string[];
  alternativeExercise?: string; // e.g. "Dumbbell Press / Smith Machine"
  videoUrl?: string; // YouTube or video explanation link
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  equipment: EquipmentType;
  sets: number;
  targetReps: string; // e.g., "8-10", "12-15", "5"
  targetRpe?: string | number; // e.g., "1-2", "8-9", "RIR 1-2", 8
  restSeconds: number; // e.g., 90
  notes?: string;
  alternativeExercise?: string; // El badeel bta3 el tamrena
  videoUrl?: string; // Link el video elly byshra7
  tips?: string[]; // Tips & form cues
}

export interface WorkoutDay {
  id: string;
  dayName: string; // e.g., "Day 1 - Chest & Triceps"
  isRestDay: boolean;
  targetMuscles: MuscleGroup[];
  estimatedMinutes: number;
  exercises: RoutineExercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  daysPerWeek: number;
  days: WorkoutDay[];
  createdForUserId?: string; // If specific to a trainee
  createdAt: string;
  updatedAt: string;
}

export interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  userId: string;
  planId: string;
  dayId: string;
  dayName: string;
  date: string;
  durationSeconds: number;
  totalVolumeKg: number;
  completedExercises: LoggedExercise[];
  coachFeedback?: string;
}
