import { z } from 'zod';
import { sanitizeString, sanitizeNotes } from '@/lib/sanitizer';

export const FoodCategoryEnum = z.enum([
  'protein',
  'carbs',
  'fats',
  'dairy',
  'fruits',
  'vegetables',
  'supplements',
  'egyptian_staples',
  'snacks'
]);

export const FoodPreparationStateEnum = z.enum([
  'cooked',
  'raw',
  'packaged',
  'liquid'
]);

export const DayTypeEnum = z.enum(['training', 'rest', 'refeed']);

/**
 * Custom Food Item Schema (User/Coach Created).
 */
export const CustomFoodSchema = z.object({
  id: z.string().optional(),
  nameEn: z.string().min(2, 'English name must be at least 2 characters').max(120).transform(sanitizeString),
  nameAr: z.string().max(120).optional().transform((val) => val ? sanitizeString(val) : ''),
  brand: z.string().max(80).optional().transform((val) => val ? sanitizeString(val) : undefined),
  category: FoodCategoryEnum.default('protein'),
  preparation: FoodPreparationStateEnum.default('cooked'),
  servingUnit: z.string().min(1).default('100g').transform(sanitizeString),
  servingSizeGrams: z.number().positive('Serving size must be greater than 0').default(100),
  calories: z.number().min(0, 'Calories cannot be negative').max(10000),
  proteinG: z.number().min(0).max(1000),
  carbsG: z.number().min(0).max(1000),
  fatsG: z.number().min(0).max(1000),
  fiberG: z.number().min(0).max(500).optional(),
  barcode: z.string().max(64).optional().transform((val) => val ? sanitizeString(val) : undefined),
  isVerified: z.boolean().default(false),
  isCustom: z.boolean().default(true),
  defaultServingGrams: z.number().positive().optional()
});

/**
 * Alternative Food Item (Badeel).
 */
export const DietMealItemAlternativeSchema = z.object({
  id: z.string().min(1),
  foodId: z.string().optional(),
  name: z.string().min(1, 'Alternative name is required').transform(sanitizeString),
  grams: z.number().min(0).default(100),
  calories: z.number().min(0).default(0),
  proteinG: z.number().min(0).default(0),
  carbsG: z.number().min(0).default(0),
  fatsG: z.number().min(0).default(0),
  notes: z.string().max(500).optional().transform((val) => val ? sanitizeNotes(val) : undefined)
});

/**
 * Single Food Item inside a Meal.
 */
export const DietMealItemSchema = z.object({
  id: z.string().min(1),
  foodId: z.string().optional(),
  name: z.string().min(1, 'Item name is required').transform(sanitizeString),
  quantity: z.string().optional().transform((val) => val ? sanitizeString(val) : undefined),
  grams: z.number().min(0).default(100),
  calories: z.number().min(0).default(0),
  proteinG: z.number().min(0).default(0),
  carbsG: z.number().min(0).default(0),
  fatsG: z.number().min(0).default(0),
  notes: z.string().max(500).optional().transform((val) => val ? sanitizeNotes(val) : undefined),
  swaps: z.array(z.string()).optional(),
  badeel: z.array(DietMealItemAlternativeSchema).default([])
});

/**
 * Meal in a Diet Plan (e.g. Breakfast, Lunch, Post-Workout).
 */
export const DietMealSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Meal name required').max(100).transform(sanitizeString),
  time: z.string().max(50).optional().transform((val) => val ? sanitizeString(val) : undefined),
  items: z.array(DietMealItemSchema).default([])
});

/**
 * Day Schedule in a Diet Plan.
 */
export const DailyDietScheduleSchema = z.object({
  dayType: DayTypeEnum.default('training'),
  notes: z.string().max(1000).optional().transform((val) => val ? sanitizeNotes(val) : undefined),
  meals: z.array(DietMealSchema).default([]),
  targetCalories: z.number().min(0).max(15000).optional(),
  targetProteinG: z.number().min(0).max(2000).optional(),
  targetCarbsG: z.number().min(0).max(2000).optional(),
  targetFatsG: z.number().min(0).max(2000).optional()
});

/**
 * Complete Diet Plan Contract.
 */
export const DietPlanSchema = z.object({
  id: z.string().optional(),
  coachId: z.string().optional(),
  title: z.string()
    .min(2, 'Diet plan title must be at least 2 characters')
    .max(120, 'Diet plan title must be under 120 characters')
    .transform(sanitizeString),
  description: z.string()
    .max(1500, 'Description must be under 1500 characters')
    .optional()
    .transform((val) => val ? sanitizeNotes(val) : ''),
  targetCalories: z.number().int().min(500, 'Target calories must be at least 500').max(10000).default(2400),
  targetProteinG: z.number().min(0, 'Protein cannot be negative').max(1000).default(180),
  targetCarbsG: z.number().min(0, 'Carbs cannot be negative').max(1500).default(260),
  targetFatsG: z.number().min(0, 'Fats cannot be negative').max(500).default(65),
  waterTargetLiters: z.number().min(0.5).max(20).default(3.5),
  meals: z.array(DietMealSchema).min(1, 'Diet plan must have at least 1 meal'),
  notes: z.string().max(1500).optional().transform((val) => val ? sanitizeNotes(val) : undefined),
  assignedUserId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  dailySchedules: z.record(z.string(), DailyDietScheduleSchema).optional()
});

export type CustomFoodInput = z.infer<typeof CustomFoodSchema>;
export type DietMealItemInput = z.infer<typeof DietMealItemSchema>;
export type DietMealInput = z.infer<typeof DietMealSchema>;
export type DietPlanInput = z.infer<typeof DietPlanSchema>;
