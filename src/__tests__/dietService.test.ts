import { describe, it, expect } from 'vitest';
import { dietService } from '@/services/dietService';
import { DietPlan, DietMeal, FoodItem } from '@/types';

const mockChicken: FoodItem = {
  id: 'chicken-cooked',
  nameEn: 'Chicken Breast (Cooked)',
  nameAr: 'صدور دجاج',
  category: 'protein',
  preparation: 'cooked',
  servingUnit: '100g',
  servingSizeGrams: 100,
  calories: 165,
  proteinG: 31.0,
  carbsG: 0.0,
  fatsG: 3.6
};

const mockBeef: FoodItem = {
  id: 'beef-95',
  nameEn: 'Lean Ground Beef 95/5 (Cooked)',
  nameAr: 'لحم بقري مفروم 95/5',
  category: 'protein',
  preparation: 'cooked',
  servingUnit: '100g',
  servingSizeGrams: 100,
  calories: 173,
  proteinG: 26.0,
  carbsG: 0.0,
  fatsG: 9.0
};

const mockRice: FoodItem = {
  id: 'white-rice-cooked',
  nameEn: 'White Basmati Rice (Cooked)',
  nameAr: 'أرز بسمتي أبيض',
  category: 'carbs',
  preparation: 'cooked',
  servingUnit: '100g',
  servingSizeGrams: 100,
  calories: 130,
  proteinG: 2.7,
  carbsG: 28.2,
  fatsG: 0.3
};

const mockMeal1: DietMeal = {
  id: 'meal-1',
  name: 'Lunch',
  time: '01:30 PM',
  items: [
    {
      id: 'item-1',
      foodId: 'chicken-cooked',
      name: 'Chicken Breast',
      grams: 200,
      calories: 330,
      proteinG: 62.0,
      carbsG: 0.0,
      fatsG: 7.2
    },
    {
      id: 'item-2',
      foodId: 'white-rice-cooked',
      name: 'White Basmati Rice',
      grams: 200,
      calories: 260,
      proteinG: 5.4,
      carbsG: 56.4,
      fatsG: 0.6
    }
  ]
};

const mockMeal2: DietMeal = {
  id: 'meal-2',
  name: 'Dinner',
  time: '08:30 PM',
  items: [
    {
      id: 'item-3',
      foodId: 'chicken-cooked',
      name: 'Chicken Breast',
      grams: 150,
      calories: 248,
      proteinG: 46.5,
      carbsG: 0.0,
      fatsG: 5.4
    }
  ]
};

const mockDietPlan: DietPlan = {
  id: 'diet-plan-1',
  title: 'Lean Muscle Hypertrophy Protocol',
  description: 'Precision 2400 kcal nutrition plan',
  targetCalories: 2400,
  targetProteinG: 180,
  targetCarbsG: 260,
  targetFatsG: 65,
  waterTargetLiters: 3.5,
  assignedUserId: 'athlete-123',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  meals: [mockMeal1, mockMeal2]
};

describe('dietService — Precision Macro Calculations & Math Engine', () => {
  it('calculates meal macros accurately with zero floating point bugs', () => {
    const macros = dietService.calculateMealMacros(mockMeal1);
    // 330 + 260 = 590
    expect(macros.calories).toBe(590);
    // 62.0 + 5.4 = 67.4
    expect(macros.proteinG).toBe(67.4);
    // 0 + 56.4 = 56.4
    expect(macros.carbsG).toBe(56.4);
    // 7.2 + 0.6 = 7.8
    expect(macros.fatsG).toBe(7.8);
  });

  it('calculates daily totals across multiple meals with defensive null checks', () => {
    const dailyTotals = dietService.calculateDailyTotals([mockMeal1, mockMeal2]);
    // 590 + 248 = 838
    expect(dailyTotals.calories).toBe(838);
    // 67.4 + 46.5 = 113.9
    expect(dailyTotals.proteinG).toBe(113.9);
    expect(dailyTotals.carbsG).toBe(56.4);
    // 7.8 + 5.4 = 13.2
    expect(dailyTotals.fatsG).toBe(13.2);

    // Empty fallback
    expect(dietService.calculateDailyTotals(null)).toEqual({ calories: 0, proteinG: 0, carbsG: 0, fatsG: 0 });
  });

  it('computes caloric energy distribution and macro percentages accurately', () => {
    // 100g P (*4 = 400), 100g C (*4 = 400), 20g F (*9 = 180) -> Total = 980 kcal
    const ratios = dietService.calculateMacroCalories(100, 100, 20);
    expect(ratios.proteinCals).toBe(400);
    expect(ratios.carbsCals).toBe(400);
    expect(ratios.fatsCals).toBe(180);
    expect(ratios.totalMacroCals).toBe(980);
    // 400 / 980 ~ 41%
    expect(ratios.proteinPct).toBe(41);
    expect(ratios.carbsPct).toBe(41);
    // 180 / 980 ~ 18%
    expect(ratios.fatsPct).toBe(18);
  });
});

describe('dietService — Precision Food Swap Engine (Badeel)', () => {
  it('calculates equivalent target grams to match protein', () => {
    // 200g Chicken Breast (31g P / 100g) = 62g protein
    // Swapping to Lean Ground Beef (26g P / 100g)
    // 62 / 0.26 = 238.46 -> 238g Beef
    const swapGrams = dietService.calculateFoodSwapGrams(mockChicken, mockBeef, 200, 'protein');
    expect(swapGrams).toBe(238);
  });

  it('defends against division by zero if target food has zero of the requested macro', () => {
    // Rice has 0.3g fat, Chicken has 3.6g fat
    // Swapping Chicken to a hypothetical food with 0g fat
    const zeroFatFood: FoodItem = {
      ...mockChicken,
      fatsG: 0
    };
    const swapGrams = dietService.calculateFoodSwapGrams(mockChicken, zeroFatFood, 100, 'fats');
    expect(swapGrams).toBe(0);
  });
});

describe('dietService — Plan Cloning & Architecture', () => {
  it('duplicates a diet plan with fresh IDs and clears athlete assignment', () => {
    const clone = dietService.duplicateDietPlan(mockDietPlan);
    expect(clone.id).not.toBe(mockDietPlan.id);
    expect(clone.title).toBe('Lean Muscle Hypertrophy Protocol (Copy)');
    expect(clone.assignedUserId).toBeUndefined();
    expect(clone.meals[0].id).not.toBe(mockDietPlan.meals[0].id);
    expect(clone.meals[0].items[0].id).not.toBe(mockDietPlan.meals[0].items[0].id);
  });
});

describe('dietService — Zod Contract Validation & XSS Defense', () => {
  it('validates a well-formed diet plan successfully', () => {
    const res = dietService.validateDietPlan({
      title: 'Bulking Protocol 3000',
      description: 'Mass gain phase with high carbohydrate distribution',
      targetCalories: 3000,
      targetProteinG: 200,
      targetCarbsG: 400,
      targetFatsG: 80,
      waterTargetLiters: 4,
      meals: [
        {
          id: 'm1',
          name: 'Meal 1 - Breakfast',
          items: [
            {
              id: 'it1',
              name: 'Oatmeal',
              grams: 100,
              calories: 389,
              proteinG: 16.9,
              carbsG: 66.3,
              fatsG: 6.9,
              badeel: []
            }
          ]
        }
      ]
    });
    expect(res.success).toBe(true);
  });

  it('rejects diet plans with invalid title length or 0 meals', () => {
    const res = dietService.validateDietPlan({
      title: 'A', // Too short (< 2)
      targetCalories: 2000,
      meals: [] // Must have at least 1 meal
    });
    expect(res.success).toBe(false);
  });

  it('neutralizes malicious XSS scripts in food names, notes, and plan titles', () => {
    const res = dietService.validateDietPlan({
      title: '<script>alert("hack")</script>Elite Diet Plan',
      description: 'Nutritional strategy.<script>stealCookie()</script>',
      targetCalories: 2200,
      targetProteinG: 170,
      targetCarbsG: 220,
      targetFatsG: 60,
      waterTargetLiters: 3,
      meals: [
        {
          id: 'm1',
          name: 'Breakfast <script>evil()</script>',
          items: [
            {
              id: 'it1',
              name: 'Egg Whites <script>bad()</script>',
              grams: 200,
              calories: 104,
              proteinG: 22,
              carbsG: 1.4,
              fatsG: 0.3,
              notes: 'Eat immediately.<script>dropTable()</script>',
              badeel: []
            }
          ]
        }
      ]
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.title).toBe('Elite Diet Plan');
      expect(res.data.description).toContain('Nutritional strategy.');
      expect(res.data.description).not.toContain('<script>');
      expect(res.data.meals[0].name).toBe('Breakfast');
      expect(res.data.meals[0].items[0].name).toBe('Egg Whites');
      expect(res.data.meals[0].items[0].notes).toBe('Eat immediately.');
    }
  });

  it('validates custom food items and sanitizes brand & name', () => {
    const res = dietService.validateCustomFood({
      nameEn: '<script>hack()</script>Greek Yogurt 0%',
      brand: 'Chobani<script></script>',
      category: 'dairy',
      preparation: 'packaged',
      servingUnit: '170g pot',
      servingSizeGrams: 100,
      calories: 59,
      proteinG: 10.3,
      carbsG: 3.6,
      fatsG: 0.4
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.nameEn).toBe('Greek Yogurt 0%');
      expect(res.data.brand).toBe('Chobani');
    }
  });
});
