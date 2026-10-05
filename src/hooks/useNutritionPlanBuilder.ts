'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { DietPlan, DietMeal, DietMealItem, DietMealItemAlternative, FoodItem } from '@/types';
import { VERIFIED_FOOD_DATABASE, calculateMacrosForGrams } from '@/lib/foodDatabase';
import { dietService } from '@/services/dietService';

export interface UseNutritionPlanBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: DietPlan | null;
  targetUserId?: string;
}

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

export function getRelativeDateLabel(dateKey: string, todayKey: string): { main: string; sub: string; isToday: boolean } {
  try {
    const d = parseDateKey(dateKey);
    const today = parseDateKey(todayKey);
    const diffDays = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const formattedDayMonth = `${d.getDate()} ${monthNames[d.getMonth()]}`;
    const dayOfWeek = dayNames[d.getDay()];

    if (diffDays === 0) {
      return { main: 'Today', sub: formattedDayMonth, isToday: true };
    } else if (diffDays === 1) {
      return { main: 'Tomorrow', sub: formattedDayMonth, isToday: false };
    } else if (diffDays === -1) {
      return { main: 'Yesterday', sub: formattedDayMonth, isToday: false };
    } else {
      return { main: dayOfWeek, sub: formattedDayMonth, isToday: false };
    }
  } catch {
    return { main: dateKey, sub: '', isToday: false };
  }
}

export function createDefaultMeal(name: string, time: string): DietMeal {
  return {
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    time,
    items: []
  };
}

export function useNutritionPlanBuilder({
  isOpen,
  onClose,
  initialPlan,
  targetUserId
}: UseNutritionPlanBuilderProps) {
  const { users, createDietPlan, updateDietPlan, assignDietPlanToUser } = useGym();
  const { showToast, confirmDialog } = useToast();

  const trainees = useMemo(() => users.filter((u) => u.role === 'trainee'), [users]);

  // Calendar Day Navigation & Schedule State
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [dayType, setDayType] = useState<'training' | 'rest' | 'refeed'>('training');
  const [dailySchedules, setDailySchedules] = useState<Record<string, {
    dayType?: 'training' | 'rest' | 'refeed';
    notes?: string;
    meals: DietMeal[];
    targetCalories?: number;
    targetProteinG?: number;
    targetCarbsG?: number;
    targetFatsG?: number;
  }>>({});

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>(targetUserId || '');
  const [targetCalories, setTargetCalories] = useState<number>(2400);
  const [targetProteinG, setTargetProteinG] = useState<number>(180);
  const [targetCarbsG, setTargetCarbsG] = useState<number>(260);
  const [targetFatsG, setTargetFatsG] = useState<number>(65);
  const [waterTargetLiters, setWaterTargetLiters] = useState<number>(3.5);

  // Active Meals for the selected day
  const [meals, setMeals] = useState<DietMeal[]>([
    createDefaultMeal('Meal 1 - Breakfast', '08:30 AM'),
    createDefaultMeal('Meal 2 - Lunch', '01:30 PM'),
    createDefaultMeal('Meal 3 - Pre-Workout', '04:30 PM'),
    createDefaultMeal('Meal 4 - Dinner', '08:30 PM')
  ]);

  // Search Modals State
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const [activeTargetMealId, setActiveTargetMealId] = useState<string | null>(null);

  const [isAltFoodSearchOpen, setIsAltFoodSearchOpen] = useState(false);
  const [altTargetMealId, setAltTargetMealId] = useState<string | null>(null);
  const [altTargetItemId, setAltTargetItemId] = useState<string | null>(null);

  // Mobile View Switch
  const [mobileView, setMobileView] = useState<'meals' | 'targets'>('meals');

  // Progressive disclosure for Food Item Cards
  const [expandedItemIds, setExpandedItemIds] = useState<Record<string, boolean>>({});

  const toggleItemExpand = (id: string) => {
    setExpandedItemIds((prev) => ({
      [id]: !prev[id]
    }));
  };

  // Click outside to collapse expanded food item cards
  useEffect(() => {
    const hasExpanded = Object.values(expandedItemIds).some(Boolean);
    if (!hasExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-food-card="true"]')) {
        return;
      }
      setExpandedItemIds({});
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedItemIds]);

  // Global Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAltFoodSearchOpen) {
          setIsAltFoodSearchOpen(false);
          return;
        }
        if (isFoodSearchOpen) {
          setIsFoodSearchOpen(false);
          return;
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAltFoodSearchOpen, isFoodSearchOpen, onClose]);

  // Hydrate when opened
  useEffect(() => {
    if (!isOpen) return;

    const initialTodayKey = formatDateKey(new Date());
    setSelectedDate(initialTodayKey);

    if (initialPlan) {
      setTitle(initialPlan.title);
      setDescription(initialPlan.description || '');
      setSelectedUserId(initialPlan.assignedUserId || targetUserId || '');
      setTargetCalories(initialPlan.targetCalories || 2400);
      setTargetProteinG(initialPlan.targetProteinG || 180);
      setTargetCarbsG(initialPlan.targetCarbsG || 260);
      setTargetFatsG(initialPlan.targetFatsG || 65);
      setWaterTargetLiters(initialPlan.waterTargetLiters || 3.5);

      const loadedSchedules = initialPlan.dailySchedules || {};
      setDailySchedules(loadedSchedules);

      if (loadedSchedules[initialTodayKey]?.meals?.length) {
        setMeals(loadedSchedules[initialTodayKey].meals);
        setDayType(loadedSchedules[initialTodayKey].dayType || 'training');
      } else if (initialPlan.meals && initialPlan.meals.length > 0) {
        setMeals(initialPlan.meals);
        setDayType('training');
      } else {
        setMeals([createDefaultMeal('Meal 1 - Breakfast', '08:30 AM')]);
        setDayType('training');
      }
    } else {
      const targetAthlete = users.find((u) => u.id === targetUserId);
      setTitle(targetAthlete ? `${targetAthlete.name.split(' ')[0]}'s Diet Plan` : 'Custom Diet Plan');
      setDescription('Precision macro distribution and structured meal breakdown.');
      setSelectedUserId(targetUserId || '');
      setTargetCalories(2400);
      setTargetProteinG(180);
      setTargetCarbsG(260);
      setTargetFatsG(65);
      setWaterTargetLiters(3.5);
      setDayType('training');
      setDailySchedules({});
      setMeals([
        createDefaultMeal('Meal 1 - Breakfast', '08:30 AM'),
        createDefaultMeal('Meal 2 - Lunch', '01:30 PM'),
        createDefaultMeal('Meal 3 - Pre-Workout', '04:30 PM'),
        createDefaultMeal('Meal 4 - Dinner', '08:30 PM')
      ]);
    }
    setMobileView('meals');
    setExpandedItemIds({});
  }, [isOpen, initialPlan, targetUserId, users]);

  // Visible date window (5 days centered on selectedDate)
  const visibleDateKeys = useMemo(() => {
    try {
      const base = parseDateKey(selectedDate);
      return [-1, 0, 1, 2, 3].map((offset) => {
        const d = addDays(base, offset);
        return formatDateKey(d);
      });
    } catch {
      return [selectedDate];
    }
  }, [selectedDate]);

  const currentDateLabel = useMemo(() => getRelativeDateLabel(selectedDate, todayKey), [selectedDate, todayKey]);

  // Day Navigation Handlers
  const handleSelectDate = (newDateKey: string) => {
    if (newDateKey === selectedDate) return;

    // Snapshot current active state into dailySchedules
    setDailySchedules((prev) => ({
      ...prev,
      [selectedDate]: {
        dayType,
        notes: description,
        meals,
        targetCalories,
        targetProteinG,
        targetCarbsG,
        targetFatsG
      }
    }));

    setSelectedDate(newDateKey);

    if (dailySchedules[newDateKey]) {
      const s = dailySchedules[newDateKey];
      setMeals(s.meals || []);
      setDayType(s.dayType || 'training');
      if (s.notes !== undefined) setDescription(s.notes);
      if (s.targetCalories) setTargetCalories(s.targetCalories);
      if (s.targetProteinG) setTargetProteinG(s.targetProteinG);
      if (s.targetCarbsG) setTargetCarbsG(s.targetCarbsG);
      if (s.targetFatsG) setTargetFatsG(s.targetFatsG);
    } else {
      // Clone current meals with fresh IDs so the coach has a working baseline
      const cloned = meals.map((m) => ({
        ...m,
        id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        items: m.items.map((i) => ({
          ...i,
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          badeel: (i.badeel || []).map((b) => ({
            ...b,
            id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
          }))
        }))
      }));
      setMeals(cloned);
    }
  };

  const handlePrevDay = () => {
    const prev = addDays(parseDateKey(selectedDate), -1);
    handleSelectDate(formatDateKey(prev));
  };

  const handleNextDay = () => {
    const next = addDays(parseDateKey(selectedDate), 1);
    handleSelectDate(formatDateKey(next));
  };

  // Smart Power Day Actions
  const handleCopyToTomorrow = () => {
    const tomorrow = addDays(parseDateKey(selectedDate), 1);
    const tomorrowKey = formatDateKey(tomorrow);

    const cloned = meals.map((m) => ({
      ...m,
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      items: m.items.map((i) => ({
        ...i,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        badeel: (i.badeel || []).map((b) => ({
          ...b,
          id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
        }))
      }))
    }));

    setDailySchedules((prev) => ({
      ...prev,
      [tomorrowKey]: {
        dayType,
        notes: description,
        meals: cloned,
        targetCalories,
        targetProteinG,
        targetCarbsG,
        targetFatsG
      }
    }));

    const label = getRelativeDateLabel(tomorrowKey, todayKey);
    showToast(`Copied plan to ${label.main} (${label.sub})`, 'success');
  };

  const handleApplyToNext7Days = () => {
    const updated = { ...dailySchedules };
    const base = parseDateKey(selectedDate);

    for (let i = 1; i <= 7; i++) {
      const d = addDays(base, i);
      const k = formatDateKey(d);
      const cloned = meals.map((m) => ({
        ...m,
        id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        items: m.items.map((it) => ({
          ...it,
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          badeel: (it.badeel || []).map((b) => ({
            ...b,
            id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
          }))
        }))
      }));

      updated[k] = {
        dayType,
        notes: description,
        meals: cloned,
        targetCalories,
        targetProteinG,
        targetCarbsG,
        targetFatsG
      };
    }

    setDailySchedules(updated);
    showToast('Plan applied to next 7 days!', 'success');
  };

  const handleResetDay = () => {
    confirmDialog({
      title: 'Reset Day Meals',
      message: `Are you sure you want to reset all prescribed meals for ${currentDateLabel.main}?`,
      confirmText: 'Reset Meals',
      variant: 'danger',
      onConfirm: () => {
        setMeals([
          createDefaultMeal('Meal 1 - Breakfast', '08:30 AM'),
          createDefaultMeal('Meal 2 - Lunch', '01:30 PM'),
          createDefaultMeal('Meal 3 - Pre-Workout', '04:30 PM'),
          createDefaultMeal('Meal 4 - Dinner', '08:30 PM')
        ]);
        showToast('Reset meals to default structure', 'info');
      }
    });
  };

  // Live Daily Totals from meals
  const dailyTotals = useMemo(() => dietService.calculateDailyTotals(meals), [meals]);
  const caloriesDelta = dailyTotals.calories - targetCalories;

  // Macro Calories & Ratios
  const macroRatios = useMemo(() => {
    return dietService.calculateMacroCalories(dailyTotals.proteinG, dailyTotals.carbsG, dailyTotals.fatsG);
  }, [dailyTotals]);

  const calProgressPct = Math.min(100, Math.round((dailyTotals.calories / (targetCalories || 1)) * 100));
  const proteinProgressPct = Math.min(100, Math.round((dailyTotals.proteinG / (targetProteinG || 1)) * 100));
  const carbsProgressPct = Math.min(100, Math.round((dailyTotals.carbsG / (targetCarbsG || 1)) * 100));
  const fatsProgressPct = Math.min(100, Math.round((dailyTotals.fatsG / (targetFatsG || 1)) * 100));

  const handleAddMeal = () => {
    const mealNumber = meals.length + 1;
    const newMeal = createDefaultMeal(`Meal ${mealNumber}`, '12:00 PM');
    setMeals([...meals, newMeal]);
    showToast(`Added Meal ${mealNumber}`, 'info');
  };

  const handleDuplicateMeal = (mealId: string) => {
    const sourceMeal = meals.find((m) => m.id === mealId);
    if (!sourceMeal) return;

    const duplicatedMeal: DietMeal = {
      ...sourceMeal,
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${sourceMeal.name} (Copy)`,
      items: sourceMeal.items.map((item) => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        badeel: (item.badeel || []).map((b) => ({
          ...b,
          id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
        }))
      }))
    };

    const mealIndex = meals.findIndex((m) => m.id === mealId);
    const nextMeals = [...meals];
    nextMeals.splice(mealIndex + 1, 0, duplicatedMeal);
    setMeals(nextMeals);
    showToast(`Duplicated ${sourceMeal.name}`, 'success');
  };

  const handleRemoveMeal = (mealId: string) => {
    const meal = meals.find((m) => m.id === mealId);
    if (meal && meal.items.length > 0) {
      confirmDialog({
        title: 'Delete Meal',
        message: `Are you sure you want to delete "${meal.name}" and its ${meal.items.length} prescribed food items?`,
        confirmText: 'Delete Meal',
        variant: 'danger',
        onConfirm: () => {
          setMeals(meals.filter((m) => m.id !== mealId));
          showToast(`Deleted ${meal.name}`, 'info');
        }
      });
      return;
    }
    setMeals(meals.filter((m) => m.id !== mealId));
  };

  const handleUpdateMeal = (mealId: string, field: 'name' | 'time', value: string) => {
    setMeals(meals.map((m) => (m.id === mealId ? { ...m, [field]: value } : m)));
  };

  const handleOpenFoodSearch = (mealId: string) => {
    setActiveTargetMealId(mealId);
    setIsFoodSearchOpen(true);
  };

  const handleSelectFoodItem = (
    food: FoodItem,
    grams: number,
    macros: { calories: number; proteinG: number; carbsG: number; fatsG: number }
  ) => {
    const newItem: DietMealItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      foodId: food.id,
      name: food.nameEn,
      quantity: `${grams}g`,
      grams,
      calories: macros.calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatsG: macros.fatsG,
      badeel: []
    };

    setMeals(
      meals.map((m) => (m.id === activeTargetMealId ? { ...m, items: [...m.items, newItem] } : m))
    );
  };

  const handleUpdateItemGrams = (mealId: string, itemId: string, newGrams: number) => {
    setMeals(
      meals.map((m) => {
        if (m.id !== mealId) return m;

        const updatedItems = m.items.map((item) => {
          if (item.id !== itemId) return item;

          const food = VERIFIED_FOOD_DATABASE.find((f) => f.id === item.foodId);
          if (food) {
            const calculated = calculateMacrosForGrams(food, newGrams);
            return {
              ...item,
              grams: newGrams,
              quantity: `${newGrams}g`,
              calories: calculated.calories,
              proteinG: calculated.proteinG,
              carbsG: calculated.carbsG,
              fatsG: calculated.fatsG
            };
          }

          const ratio = (item.grams && item.grams > 0) ? (newGrams / item.grams) : 1;
          return {
            ...item,
            grams: newGrams,
            quantity: `${newGrams}g`,
            calories: Math.round(item.calories * ratio),
            proteinG: Math.round(item.proteinG * ratio * 10) / 10,
            carbsG: Math.round(item.carbsG * ratio * 10) / 10,
            fatsG: Math.round(item.fatsG * ratio * 10) / 10
          };
        });

        return { ...m, items: updatedItems };
      })
    );
  };

  const handleUpdateItemNotes = (mealId: string, itemId: string, notes: string) => {
    setMeals(
      meals.map((m) => {
        if (m.id !== mealId) return m;
        return {
          ...m,
          items: m.items.map((item) => (item.id === itemId ? { ...item, notes } : item))
        };
      })
    );
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMeals(
      meals.map((m) => {
        if (m.id !== mealId) return m;
        return { ...m, items: m.items.filter((i) => i.id !== itemId) };
      })
    );
  };

  const handleOpenAltSearch = (mealId: string, itemId: string) => {
    setAltTargetMealId(mealId);
    setAltTargetItemId(itemId);
    setIsAltFoodSearchOpen(true);
  };

  const handleSelectAltFood = (
    food: FoodItem,
    grams: number,
    macros: { calories: number; proteinG: number; carbsG: number; fatsG: number }
  ) => {
    const newAlt: DietMealItemAlternative = {
      id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      foodId: food.id,
      name: `${grams}g ${food.nameEn}`,
      grams,
      calories: macros.calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatsG: macros.fatsG
    };

    setMeals(
      meals.map((m) => {
        if (m.id !== altTargetMealId) return m;
        const updatedItems = m.items.map((item) => {
          if (item.id !== altTargetItemId) return item;
          return {
            ...item,
            badeel: [...(item.badeel || []), newAlt]
          };
        });
        return { ...m, items: updatedItems };
      })
    );
  };

  const handleRemoveAlt = (mealId: string, itemId: string, altId: string) => {
    setMeals(
      meals.map((m) => {
        if (m.id !== mealId) return m;
        const updatedItems = m.items.map((item) => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            badeel: (item.badeel || []).filter((a) => a.id !== altId)
          };
        });
        return { ...m, items: updatedItems };
      })
    );
  };

  const handleSave = async () => {
    const updatedSchedules = {
      ...dailySchedules,
      [selectedDate]: {
        dayType,
        notes: description,
        meals,
        targetCalories,
        targetProteinG,
        targetCarbsG,
        targetFatsG
      }
    };

    // Runtime Zod Contract Validation
    const validation = dietService.validateDietPlan({
      title,
      description,
      assignedUserId: selectedUserId || undefined,
      targetCalories,
      targetProteinG,
      targetCarbsG,
      targetFatsG,
      waterTargetLiters,
      meals,
      dailySchedules: updatedSchedules
    });

    if (!validation.success) {
      showToast(validation.errors[0] || 'Please complete the diet plan setup', 'error');
      return;
    }

    const validPlan = validation.data;

    try {
      if (initialPlan) {
        await updateDietPlan({
          ...initialPlan,
          title: validPlan.title,
          description: validPlan.description,
          assignedUserId: validPlan.assignedUserId,
          targetCalories: validPlan.targetCalories,
          targetProteinG: validPlan.targetProteinG,
          targetCarbsG: validPlan.targetCarbsG,
          targetFatsG: validPlan.targetFatsG,
          waterTargetLiters: validPlan.waterTargetLiters,
          meals: validPlan.meals,
          dailySchedules: validPlan.dailySchedules
        });
        if (selectedUserId) {
          await assignDietPlanToUser(selectedUserId, initialPlan.id);
        }
        showToast(`Updated "${title}" diet plan`, 'success');
      } else {
        const created = await createDietPlan({
          title: validPlan.title,
          description: validPlan.description,
          assignedUserId: validPlan.assignedUserId,
          targetCalories: validPlan.targetCalories,
          targetProteinG: validPlan.targetProteinG,
          targetCarbsG: validPlan.targetCarbsG,
          targetFatsG: validPlan.targetFatsG,
          waterTargetLiters: validPlan.waterTargetLiters,
          meals: validPlan.meals,
          dailySchedules: validPlan.dailySchedules
        });
        if (selectedUserId && created?.id) {
          await assignDietPlanToUser(selectedUserId, created.id);
        }
        showToast(`Published "${title}" diet plan`, 'success');
      }

      onClose();
    } catch {
      showToast('Failed to save diet plan', 'error');
    }
  };

  const targetAthlete = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId]
  );

  return {
    // Form State
    title,
    setTitle,
    description,
    setDescription,
    selectedUserId,
    setSelectedUserId,
    targetCalories,
    setTargetCalories,
    targetProteinG,
    setTargetProteinG,
    targetCarbsG,
    setTargetCarbsG,
    targetFatsG,
    setTargetFatsG,
    waterTargetLiters,
    setWaterTargetLiters,
    trainees,
    targetAthlete,

    // Calendar & Day Navigation
    todayKey,
    selectedDate,
    visibleDateKeys,
    currentDateLabel,
    dayType,
    setDayType,
    handleSelectDate,
    handlePrevDay,
    handleNextDay,
    handleCopyToTomorrow,
    handleApplyToNext7Days,
    handleResetDay,

    // Meals State & Handlers
    meals,
    handleAddMeal,
    handleDuplicateMeal,
    handleRemoveMeal,
    handleUpdateMeal,

    // Food Item Handlers
    handleSelectFoodItem,
    handleUpdateItemGrams,
    handleUpdateItemNotes,
    handleRemoveItem,

    // Alternative (Badeel) Handlers
    handleSelectAltFood,
    handleRemoveAlt,

    // Search Modals State
    isFoodSearchOpen,
    setIsFoodSearchOpen,
    activeTargetMealId,
    handleOpenFoodSearch,
    isAltFoodSearchOpen,
    setIsAltFoodSearchOpen,
    altTargetMealId,
    handleOpenAltSearch,

    // Progressive Disclosure & Mobile View
    expandedItemIds,
    toggleItemExpand,
    mobileView,
    setMobileView,

    // Macro Totals & Metrics
    dailyTotals,
    caloriesDelta,
    macroRatios,
    calProgressPct,
    proteinProgressPct,
    carbsProgressPct,
    fatsProgressPct,

    // Save
    handleSave
  };
}
