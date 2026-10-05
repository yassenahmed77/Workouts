import { DietPlan, DietMeal, DietMealItem, FoodItem } from '@/types';
import {
  DietPlanSchema,
  CustomFoodSchema,
  DietPlanInput,
  CustomFoodInput
} from '@/schemas/diet.schema';

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

export interface MacroRatios {
  proteinCals: number;
  carbsCals: number;
  fatsCals: number;
  totalMacroCals: number;
  proteinPct: number;
  carbsPct: number;
  fatsPct: number;
}

/**
 * Diet & Nutrition Domain Service (Clean Architecture - Layer 3).
 * 
 * Provides pure business calculations, macro aggregations, precision food swaps (Badeel),
 * plan duplication, multi-tenant scoping, and Zod runtime schema validation.
 */
export const dietService = {
  /**
   * Multi-Tenant Scoping: Filter diet plans by coach boundary
   */
  getDietPlans(dietPlans: DietPlan[], coachId?: string): DietPlan[] {
    if (!Array.isArray(dietPlans)) return [];
    if (!coachId) return dietPlans;
    return dietPlans.filter((d) => (d as any).coachId === coachId || !(d as any).coachId);
  },

  getDietPlanById(dietPlans: DietPlan[], planId: string): DietPlan | undefined {
    if (!Array.isArray(dietPlans) || !planId) return undefined;
    return dietPlans.find((d) => d.id === planId);
  },

  getDietPlanForUser(dietPlans: DietPlan[], userId: string): DietPlan | undefined {
    if (!Array.isArray(dietPlans) || !userId) return undefined;
    return dietPlans.find((d) => d.assignedUserId === userId);
  },

  /**
   * Calculates sum of macros for a single meal with zero floating point errors.
   */
  calculateMealMacros(meal?: DietMeal | null): MacroTotals {
    if (!meal || !Array.isArray(meal.items)) {
      return { calories: 0, proteinG: 0, carbsG: 0, fatsG: 0 };
    }

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;

    meal.items.forEach((item) => {
      calories += typeof item.calories === 'number' && !isNaN(item.calories) ? item.calories : 0;
      protein += typeof item.proteinG === 'number' && !isNaN(item.proteinG) ? item.proteinG : 0;
      carbs += typeof item.carbsG === 'number' && !isNaN(item.carbsG) ? item.carbsG : 0;
      fats += typeof item.fatsG === 'number' && !isNaN(item.fatsG) ? item.fatsG : 0;
    });

    return {
      calories: Math.round(calories),
      proteinG: Math.round(protein * 10) / 10,
      carbsG: Math.round(carbs * 10) / 10,
      fatsG: Math.round(fats * 10) / 10
    };
  },

  /**
   * Calculates sum of macros across all prescribed meals in a day.
   */
  calculateDailyTotals(meals?: DietMeal[] | null): MacroTotals {
    if (!Array.isArray(meals)) {
      return { calories: 0, proteinG: 0, carbsG: 0, fatsG: 0 };
    }

    let totalCals = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    meals.forEach((m) => {
      const mealMacros = this.calculateMealMacros(m);
      totalCals += mealMacros.calories;
      totalProtein += mealMacros.proteinG;
      totalCarbs += mealMacros.carbsG;
      totalFats += mealMacros.fatsG;
    });

    return {
      calories: Math.round(totalCals),
      proteinG: Math.round(totalProtein * 10) / 10,
      carbsG: Math.round(totalCarbs * 10) / 10,
      fatsG: Math.round(totalFats * 10) / 10
    };
  },

  /**
   * Calculates energy calories (4 kcal/g for protein & carbs, 9 kcal/g for fats)
   * and macro percentages for visual distribution charts.
   */
  calculateMacroCalories(proteinG: number, carbsG: number, fatsG: number): MacroRatios {
    const safeProtein = Math.max(0, Number(proteinG) || 0);
    const safeCarbs = Math.max(0, Number(carbsG) || 0);
    const safeFats = Math.max(0, Number(fatsG) || 0);

    const proteinCals = Math.round(safeProtein * 4);
    const carbsCals = Math.round(safeCarbs * 4);
    const fatsCals = Math.round(safeFats * 9);
    const totalMacroCals = proteinCals + carbsCals + fatsCals || 1;

    return {
      proteinCals,
      carbsCals,
      fatsCals,
      totalMacroCals,
      proteinPct: Math.round((proteinCals / totalMacroCals) * 100),
      carbsPct: Math.round((carbsCals / totalMacroCals) * 100),
      fatsPct: Math.round((fatsCals / totalMacroCals) * 100)
    };
  },

  /**
   * Precision Food Swap Calculator (Badeel):
   * Determines the exact grams of target food needed to equal the source food's macro.
   * e.g., Swap 150g Chicken Breast (31g P / 100g) with Ground Beef 95/5 (21g P / 100g).
   */
  calculateFoodSwapGrams(
    sourceFood: FoodItem,
    targetFood: FoodItem,
    sourceGrams: number,
    matchMacro: 'protein' | 'carbs' | 'fats' | 'calories' = 'protein'
  ): number {
    const grams = Math.max(0, Number(sourceGrams) || 0);
    if (grams <= 0) return 0;

    const sourceServing = sourceFood.servingSizeGrams || 100;
    const targetServing = targetFood.servingSizeGrams || 100;

    let sourceMacroVal = 0;
    let targetMacroVal = 0;

    switch (matchMacro) {
      case 'protein':
        sourceMacroVal = sourceFood.proteinG;
        targetMacroVal = targetFood.proteinG;
        break;
      case 'carbs':
        sourceMacroVal = sourceFood.carbsG;
        targetMacroVal = targetFood.carbsG;
        break;
      case 'fats':
        sourceMacroVal = sourceFood.fatsG;
        targetMacroVal = targetFood.fatsG;
        break;
      case 'calories':
      default:
        sourceMacroVal = sourceFood.calories;
        targetMacroVal = targetFood.calories;
        break;
    }

    if (targetMacroVal <= 0) return 0;

    const sourceYield = (grams / sourceServing) * sourceMacroVal;
    const targetPerGram = targetMacroVal / targetServing;

    return Math.round(sourceYield / targetPerGram);
  },

  /**
   * Safely duplicates a diet plan with fresh unique IDs for all meals, items,
   * badeel, and daily schedules, resetting assigned athlete.
   */
  duplicateDietPlan(plan: DietPlan): DietPlan {
    const timestamp = Date.now();

    const cloneMealItem = (item: DietMealItem, mIdx: number, iIdx: number): DietMealItem => ({
      ...item,
      id: `item-${timestamp}-${mIdx + 1}-${iIdx + 1}`,
      badeel: (item.badeel || []).map((b, bIdx) => ({
        ...b,
        id: `alt-${timestamp}-${mIdx + 1}-${iIdx + 1}-${bIdx + 1}`
      }))
    });

    const cloneMeal = (meal: DietMeal, mIdx: number): DietMeal => ({
      ...meal,
      id: `meal-${timestamp}-${mIdx + 1}`,
      items: (meal.items || []).map((item, iIdx) => cloneMealItem(item, mIdx, iIdx))
    });

    const clonedDailySchedules: Record<string, any> = {};
    if (plan.dailySchedules) {
      Object.entries(plan.dailySchedules).forEach(([dateKey, sched]) => {
        clonedDailySchedules[dateKey] = {
          ...sched,
          meals: (sched.meals || []).map((m, mIdx) => cloneMeal(m, mIdx))
        };
      });
    }

    return {
      ...plan,
      id: `diet-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${plan.title} (Copy)`,
      assignedUserId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      meals: (plan.meals || []).map((m, mIdx) => cloneMeal(m, mIdx)),
      dailySchedules: clonedDailySchedules
    };
  },

  /**
   * Runtime Zod contract validation for Diet Plan creation/editing.
   */
  validateDietPlan(payload: unknown): { success: true; data: DietPlanInput } | { success: false; errors: string[] } {
    const result = DietPlanSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: true, data: result.data };
  },

  /**
   * Runtime Zod contract validation for Custom Food items.
   */
  validateCustomFood(payload: unknown): { success: true; data: CustomFoodInput } | { success: false; errors: string[] } {
    const result = CustomFoodSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: true, data: result.data };
  }
};
