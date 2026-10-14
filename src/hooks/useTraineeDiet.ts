'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { DietPlan, DietMeal, DietMealItem, DietMealItemAlternative } from '@/types';

const STORAGE_PREFIX_MEALS = 'gym_trainee_meals_v1';
const STORAGE_PREFIX_SWAPS = 'gym_trainee_swaps_v1';

export interface TraineeDietTotals {
  goalCalories: number;
  consumedCalories: number;
  remainingCalories: number;
  goalProteinG: number;
  consumedProteinG: number;
  remainingProteinG: number;
  goalCarbsG: number;
  consumedCarbsG: number;
  remainingCarbsG: number;
  goalFatsG: number;
  consumedFatsG: number;
  remainingFatsG: number;
}

// Robust local date helpers avoiding any UTC timezone offsets
function getLocalDateString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shiftDateString(dateStr: string, deltaDays: number): string {
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  const d = new Date(year, month, day + deltaDays);
  return getLocalDateString(d);
}

export function useTraineeDiet() {
  const { currentUser, getDietPlanForUser } = useGym();
  const { showToast } = useToast();

  const todayStr = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const dietPlan: DietPlan | undefined = useMemo(() => {
    if (!currentUser) return undefined;
    return getDietPlanForUser(currentUser.id);
  }, [currentUser, getDietPlanForUser]);

  // Fallback athlete meals if coach hasn't set custom meals yet
  const basePlanMeals: DietMeal[] = useMemo(() => {
    if (dietPlan?.meals && dietPlan.meals.length > 0) {
      return dietPlan.meals;
    }
    const cal = dietPlan?.targetCalories || 2200;
    const p = dietPlan?.targetProteinG || 160;
    const c = dietPlan?.targetCarbsG || 240;
    const f = dietPlan?.targetFatsG || 60;

    return [
      {
        id: 'meal-breakfast',
        name: 'Breakfast',
        time: '08:30 AM',
        items: [
          {
            id: 'item-b1',
            name: 'Whole Eggs & Rolled Oats Bowl',
            quantity: '3 Whole Eggs + 70g Oats',
            grams: 220,
            calories: Math.round(cal * 0.25),
            proteinG: Math.round(p * 0.25),
            carbsG: Math.round(c * 0.25),
            fatsG: Math.round(f * 0.25),
            badeel: [
              {
                id: 'alt-b1',
                name: '4 Egg Whites & 2 Whole Wheat Toast',
                grams: 180,
                calories: Math.round(cal * 0.25) - 15,
                proteinG: Math.round(p * 0.25) + 3,
                carbsG: Math.round(c * 0.25) - 4,
                fatsG: Math.round(f * 0.25) - 5
              },
              {
                id: 'alt-b2',
                name: 'Whey Protein Scoop & Cream of Rice',
                grams: 200,
                calories: Math.round(cal * 0.25) + 8,
                proteinG: Math.round(p * 0.25) + 5,
                carbsG: Math.round(c * 0.25) + 4,
                fatsG: Math.round(f * 0.25) - 6
              }
            ]
          }
        ]
      },
      {
        id: 'meal-lunch',
        name: 'Lunch',
        time: '01:30 PM',
        items: [
          {
            id: 'item-l1',
            name: 'Grilled Chicken Breast & Basmati Rice',
            quantity: '180g Chicken + 200g Rice',
            grams: 380,
            calories: Math.round(cal * 0.35),
            proteinG: Math.round(p * 0.35),
            carbsG: Math.round(c * 0.35),
            fatsG: Math.round(f * 0.3),
            badeel: [
              {
                id: 'alt-l1',
                name: 'White Fish (Tilapia) & Baked Potato',
                grams: 400,
                calories: Math.round(cal * 0.35) - 25,
                proteinG: Math.round(p * 0.35) - 2,
                carbsG: Math.round(c * 0.35) - 3,
                fatsG: Math.round(f * 0.3) - 4
              },
              {
                id: 'alt-l2',
                name: 'Lean Beef 95/5 & Sweet Potato',
                grams: 390,
                calories: Math.round(cal * 0.35) + 20,
                proteinG: Math.round(p * 0.35) + 2,
                carbsG: Math.round(c * 0.35) + 2,
                fatsG: Math.round(f * 0.3) + 3
              }
            ]
          }
        ]
      },
      {
        id: 'meal-pre-workout',
        name: 'Pre-Workout Snack',
        time: '05:00 PM',
        items: [
          {
            id: 'item-s1',
            name: 'Banana & Rice Cakes with Peanut Butter',
            quantity: '1 Banana + 3 Rice Cakes + 15g PB',
            grams: 180,
            calories: Math.round(cal * 0.15),
            proteinG: Math.round(p * 0.15),
            carbsG: Math.round(c * 0.2),
            fatsG: Math.round(f * 0.15),
            badeel: [
              {
                id: 'alt-s1',
                name: 'Green Apple & Raw Almonds',
                grams: 160,
                calories: Math.round(cal * 0.15) - 12,
                proteinG: Math.round(p * 0.15) - 2,
                carbsG: Math.round(c * 0.2) - 5,
                fatsG: Math.round(f * 0.15) + 2
              },
              {
                id: 'alt-s2',
                name: 'Whey Protein Shake & Rice Krispies',
                grams: 190,
                calories: Math.round(cal * 0.15) + 15,
                proteinG: Math.round(p * 0.15) + 12,
                carbsG: Math.round(c * 0.2) + 2,
                fatsG: Math.round(f * 0.15) - 4
              }
            ]
          }
        ]
      },
      {
        id: 'meal-dinner',
        name: 'Dinner & Recovery',
        time: '09:00 PM',
        items: [
          {
            id: 'item-d1',
            name: 'Cottage Cheese (Gebna Areesh) & Toast',
            quantity: '200g Cheese + 1 Toast + Greens',
            grams: 250,
            calories: Math.round(cal * 0.25),
            proteinG: Math.round(p * 0.25),
            carbsG: Math.round(c * 0.2),
            fatsG: Math.round(f * 0.3),
            badeel: [
              {
                id: 'alt-d1',
                name: 'Light Tuna in Brine & Boiled Potato',
                grams: 280,
                calories: Math.round(cal * 0.25) - 18,
                proteinG: Math.round(p * 0.25) + 4,
                carbsG: Math.round(c * 0.2) - 6,
                fatsG: Math.round(f * 0.3) - 5
              },
              {
                id: 'alt-d2',
                name: 'Grilled Chicken Salad with Avocado',
                grams: 270,
                calories: Math.round(cal * 0.25) + 22,
                proteinG: Math.round(p * 0.25) + 6,
                carbsG: Math.round(c * 0.2) - 8,
                fatsG: Math.round(f * 0.3) + 6
              }
            ]
          }
        ]
      }
    ];
  }, [dietPlan]);

  // Persistent Swaps State per date
  const [swappedItems, setSwappedItems] = useState<Record<string, DietMealItem>>({});

  // Persistent meal completion map by date
  const [completedMealIds, setCompletedMealIds] = useState<Record<string, boolean>>({});

  // Hydrate completed meals and swaps for selected date
  useEffect(() => {
    if (!currentUser || typeof window === 'undefined') return;
    const mealsKey = `${STORAGE_PREFIX_MEALS}_${currentUser.id}_${selectedDate}`;
    const swapsKey = `${STORAGE_PREFIX_SWAPS}_${currentUser.id}_${selectedDate}`;

    try {
      const rawMeals = localStorage.getItem(mealsKey);
      setCompletedMealIds(rawMeals ? JSON.parse(rawMeals) : {});
    } catch {
      setCompletedMealIds({});
    }

    try {
      const rawSwaps = localStorage.getItem(swapsKey);
      setSwappedItems(rawSwaps ? JSON.parse(rawSwaps) : {});
    } catch {
      setSwappedItems({});
    }
  }, [currentUser, selectedDate]);

  // Swap Item Action
  const swapMealItem = useCallback(
    (currentItem: DietMealItem, newAlternative: DietMealItemAlternative) => {
      // 1. Build the new active item replacing the current item
      const updatedItem: DietMealItem = {
        id: currentItem.id,
        foodId: newAlternative.foodId,
        name: newAlternative.name,
        quantity: newAlternative.grams ? `${newAlternative.grams}g` : newAlternative.name,
        grams: newAlternative.grams,
        calories: newAlternative.calories,
        proteinG: newAlternative.proteinG,
        carbsG: newAlternative.carbsG,
        fatsG: newAlternative.fatsG,
        notes: newAlternative.notes,
        // The previous current item moves into the alternatives pool!
        badeel: [
          {
            id: currentItem.id,
            name: currentItem.name,
            grams: currentItem.grams || 100,
            calories: currentItem.calories,
            proteinG: currentItem.proteinG,
            carbsG: currentItem.carbsG,
            fatsG: currentItem.fatsG,
            notes: currentItem.notes
          },
          ...(currentItem.badeel || []).filter((b) => b.name !== newAlternative.name)
        ]
      };

      const nextSwaps = {
        ...swappedItems,
        [currentItem.id]: updatedItem
      };

      setSwappedItems(nextSwaps);

      if (currentUser && typeof window !== 'undefined') {
        const swapsKey = `${STORAGE_PREFIX_SWAPS}_${currentUser.id}_${selectedDate}`;
        localStorage.setItem(swapsKey, JSON.stringify(nextSwaps));
      }

      showToast(`Swapped to ${newAlternative.name} (${newAlternative.calories} kcal) 🔄`, 'success');
    },
    [currentUser, selectedDate, swappedItems, showToast]
  );

  // Compute effective meals with applied swaps and normalized badeel
  const planMeals: DietMeal[] = useMemo(() => {
    return basePlanMeals.map((meal) => ({
      ...meal,
      items: meal.items.map((originalItem) => {
        // If user already swapped this item for this date, use the swapped version
        const effective = swappedItems[originalItem.id] || originalItem;

        // Ensure badeel array is always populated even if coach only passed string swaps
        let resolvedBadeel: DietMealItemAlternative[] = effective.badeel || [];
        if (resolvedBadeel.length === 0 && effective.swaps && effective.swaps.length > 0) {
          resolvedBadeel = effective.swaps.map((s, idx) => {
            // Calibrate realistic variance (+/- 10-20 kcal) for string alternatives
            const variance = idx % 2 === 0 ? -12 : 14;
            return {
              id: `alt-${effective.id}-${idx}`,
              name: s,
              grams: effective.grams || 150,
              calories: Math.max(50, effective.calories + variance),
              proteinG: Math.max(5, Math.round((effective.proteinG + (variance > 0 ? 3 : -2)) * 10) / 10),
              carbsG: Math.max(5, Math.round((effective.carbsG + (variance > 0 ? 2 : -3)) * 10) / 10),
              fatsG: Math.max(2, Math.round((effective.fatsG + (variance > 0 ? 1 : -1)) * 10) / 10)
            };
          });
        }

        return {
          ...effective,
          badeel: resolvedBadeel
        };
      })
    }));
  }, [basePlanMeals, swappedItems]);

  // Persist meal completion when updated
  const saveCompletedMeals = useCallback(
    (nextState: Record<string, boolean>) => {
      setCompletedMealIds(nextState);
      if (currentUser && typeof window !== 'undefined') {
        const storageKey = `${STORAGE_PREFIX_MEALS}_${currentUser.id}_${selectedDate}`;
        localStorage.setItem(storageKey, JSON.stringify(nextState));
      }
    },
    [currentUser, selectedDate]
  );

  const toggleMealCompleted = useCallback(
    (mealId: string) => {
      const next = !completedMealIds[mealId];
      const updated = { ...completedMealIds, [mealId]: next };
      saveCompletedMeals(updated);

      const meal = planMeals.find((m) => m.id === mealId);
      const cleanName = meal?.name || 'Meal';
      if (next) {
        showToast(`${cleanName} logged! Macros added to diary 🔥`, 'success');
      } else {
        showToast(`${cleanName} unmarked`, 'info');
      }
    },
    [completedMealIds, planMeals, saveCompletedMeals, showToast]
  );

  // Date Navigation (Timezone-safe)
  const goToPreviousDay = useCallback(() => {
    setSelectedDate((prev) => shiftDateString(prev, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => shiftDateString(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(todayStr);
  }, [todayStr]);

  const isToday = selectedDate === todayStr;

  // Calculate Totals (Goal - Consumed = Remaining)
  const totals: TraineeDietTotals = useMemo(() => {
    const goalCalories = dietPlan?.targetCalories || 2200;
    const goalProteinG = dietPlan?.targetProteinG || 160;
    const goalCarbsG = dietPlan?.targetCarbsG || 240;
    const goalFatsG = dietPlan?.targetFatsG || 60;

    let consumedCalories = 0;
    let consumedProteinG = 0;
    let consumedCarbsG = 0;
    let consumedFatsG = 0;

    planMeals.forEach((meal) => {
      if (completedMealIds[meal.id]) {
        meal.items.forEach((item) => {
          consumedCalories += item.calories || 0;
          consumedProteinG += item.proteinG || 0;
          consumedCarbsG += item.carbsG || 0;
          consumedFatsG += item.fatsG || 0;
        });
      }
    });

    consumedCalories = Math.round(consumedCalories);
    consumedProteinG = Math.round(consumedProteinG * 10) / 10;
    consumedCarbsG = Math.round(consumedCarbsG * 10) / 10;
    consumedFatsG = Math.round(consumedFatsG * 10) / 10;

    const remainingCalories = Math.max(0, goalCalories - consumedCalories);
    const remainingProteinG = Math.max(0, Math.round((goalProteinG - consumedProteinG) * 10) / 10);
    const remainingCarbsG = Math.max(0, Math.round((goalCarbsG - consumedCarbsG) * 10) / 10);
    const remainingFatsG = Math.max(0, Math.round((goalFatsG - consumedFatsG) * 10) / 10);

    return {
      goalCalories,
      consumedCalories,
      remainingCalories,
      goalProteinG,
      consumedProteinG,
      remainingProteinG,
      goalCarbsG,
      consumedCarbsG,
      remainingCarbsG,
      goalFatsG,
      consumedFatsG,
      remainingFatsG
    };
  }, [dietPlan, planMeals, completedMealIds]);

  const completedCount = useMemo(
    () => planMeals.filter((m) => completedMealIds[m.id]).length,
    [planMeals, completedMealIds]
  );

  return {
    currentUser,
    dietPlan,
    planMeals,
    selectedDate,
    isToday,
    completedMealIds,
    completedCount,
    totals,
    toggleMealCompleted,
    swapMealItem,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    setSelectedDate
  };
}
