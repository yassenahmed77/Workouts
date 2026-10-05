export type UserRole = 'coach' | 'trainee';

export type UserGoal = 
  | 'Hypertrophy / Muscle Gain' 
  | 'Strength & Power' 
  | 'Fat Loss & Conditioning' 
  | 'Athletic Performance'
  | 'Rehabilitation & Mobility';

export interface UserAttentionNote {
  type: 'danger' | 'warning' | 'info' | 'none';
  label: string;
  timeframe: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  coachId?: string;
  avatarText: string;
  avatarUrl?: string;
  gender?: 'Male' | 'Female';
  age?: number;
  status: 'active' | 'pending' | 'inactive' | 'on_hold';
  joinedDate: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: UserGoal;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  assignedPlanId?: string;
  assignedDietPlanId?: string;
  lastCheckInDate?: string;
  notes?: string;
  isCompetitor?: boolean;
  privateCoachNotes?: string;
  competitionProfile?: CompetitorProfile;
  currentSplitProgress?: string;
  nutritionAdherence?: number;
  attentionNote?: UserAttentionNote;
  subscription?: ClientSubscription;
}

export type SubscriptionPlanType = 
  | 'Full VIP Coaching'
  | 'Workout Only'
  | 'Nutrition Only'
  | 'Contest Prep'
  | 'Custom Coaching';

export interface ClientSubscription {
  planType: SubscriptionPlanType;
  durationMonths: number;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  price?: number;
  currency?: string; // 'EGP' | 'USD' | 'SAR' | 'AED'
  status: 'active' | 'expiring_soon' | 'expired';
  notes?: string;
}

export interface CoachPackage {
  id: string;
  name: SubscriptionPlanType | string;
  durationMonths: number;
  price: number;
  description: string;
  isPopular?: boolean;
}

export interface CoachSettings {
  coachName: string;
  brandName: string;
  tagline: string;
  avatarUrl?: string;
  whatsappNumber: string;
  email: string;
  currency: string;
  renewalReminderDaysBefore: number;
  checkInDays: string[];
  packages: CoachPackage[];
}

export type CompetitorDivision = 
  | 'Classic Physique' 
  | "Men's Physique" 
  | 'Open Bodybuilding' 
  | 'Bikini Pro' 
  | 'Figure';

export interface CompetitorProfile {
  targetShow: string;
  showDate: string;
  division: CompetitorDivision;
  targetWeightClassKg: number;
  currentWeightKg: number;
  prepPhase: 'Off-Season' | 'Prep Phase (16w)' | 'Cutting Phase (8w)' | 'Peak Week' | 'Show Day';
  stageReadinessScore: number;
  posingApproval: 'Approved' | 'Needs Work' | 'Pending Review';
  daysOut: number;
  waterIntakeLiters: number;
  carbLoadGrams: number;
  sodiumProtocol?: string;
  stageNotes?: string;
  privateCoachNotes?: string;
  mandatoryPhotos?: {
    frontUrl?: string;
    backUrl?: string;
    sideUrl?: string;
    legsUrl?: string;
  };
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

export interface ExerciseAlternative {
  name: string;
  videoUrl?: string;
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
  alternativeExercise?: string; // Legacy string e.g. "Dumbbell Press / Smith Machine"
  alternatives?: ExerciseAlternative[]; // Multiple alternatives with video links
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
  coachId?: string;
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

export type CheckInPhotoAngle = 'front' | 'side' | 'back';

export interface CheckInPhoto {
  id: string;
  url: string;
  angle: CheckInPhotoAngle;
  date: string;
}

export interface BodyMeasurements {
  waistCm?: number;
  chestCm?: number;
  armsCm?: number;
  hipsCm?: number;
  thighsCm?: number;
}

export interface WeeklyCheckIn {
  id: string;
  userId: string;
  coachId?: string;
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  measurements: BodyMeasurements;
  photos: CheckInPhoto[];
  energyRating?: number;
  sleepQuality?: number;
  hungerRating?: number;
  traineeNotes?: string;
  coachFeedback?: string;
  reviewed: boolean;
  reviewedAt?: string;
}

export type FoodPreparationState = 'cooked' | 'raw' | 'packaged' | 'liquid';
export type FoodCategory = 
  | 'protein' 
  | 'carbs' 
  | 'fats' 
  | 'dairy' 
  | 'fruits' 
  | 'vegetables' 
  | 'supplements' 
  | 'egyptian_staples' 
  | 'snacks';

export interface FoodItem {
  id: string;
  nameEn: string;
  nameAr: string;
  brand?: string;
  category: FoodCategory;
  preparation: FoodPreparationState;
  servingUnit: string; // e.g. "100g", "1 scoop (30g)", "1 large egg (~50g)"
  servingSizeGrams: number; // base grams (typically 100)
  calories: number; // per servingSizeGrams
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG?: number;
  barcode?: string;
  isVerified?: boolean;
  isCustom?: boolean;
  defaultServingGrams?: number; // Standard serving weight e.g. 40g for Hohos, 30g scoop, 170g pot
}

export interface DietMealItemAlternative {
  id: string;
  foodId?: string;
  name: string;
  grams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  notes?: string;
}

export interface DietMealItem {
  id: string;
  foodId?: string;
  name: string;
  quantity?: string; // backwards compatibility e.g. "200g"
  grams?: number; // numeric grams
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  notes?: string;
  swaps?: string[]; // backwards compatibility
  badeel?: DietMealItemAlternative[];
}

export interface DietMeal {
  id: string;
  name: string;
  time?: string;
  items: DietMealItem[];
}

export interface DietPlan {
  id: string;
  coachId?: string;
  title: string;
  description?: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
  waterTargetLiters: number;
  meals: DietMeal[];
  notes?: string;
  assignedUserId?: string;
  createdAt: string;
  updatedAt: string;
  dailySchedules?: Record<string, {
    dayType?: 'training' | 'rest' | 'refeed';
    notes?: string;
    meals: DietMeal[];
    targetCalories?: number;
    targetProteinG?: number;
    targetCarbsG?: number;
    targetFatsG?: number;
  }>;
}

export interface FormCheckVideo {
  id: string;
  userId: string;
  exerciseName: string;
  targetMuscle?: MuscleGroup;
  videoUrl: string;
  thumbnailUrl?: string;
  recordedAt: string; // e.g., "2026-09-21 14:30" or ISO string
  setDetails?: string; // e.g., "Set 3 • 140 kg × 5 reps"
  notes?: string; // e.g., "Depth felt borderline on rep 4"
  coachFeedback?: string;
  status: 'pending' | 'reviewed';
  reviewedAt?: string;
}
