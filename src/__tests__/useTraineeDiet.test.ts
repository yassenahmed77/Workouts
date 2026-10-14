import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTraineeDiet } from '@/hooks/useTraineeDiet';
import { DietPlan } from '@/types';

// Mock ToastContext
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

const mockDietPlan: DietPlan = {
  id: 'diet-test-1',
  title: 'Test Hypertrophy Plan',
  targetCalories: 2500,
  targetProteinG: 200,
  targetCarbsG: 250,
  targetFatsG: 70,
  waterTargetLiters: 4,
  createdAt: '2026-10-01',
  updatedAt: '2026-10-01',
  meals: [
    {
      id: 'm1',
      name: 'Breakfast',
      time: '08:00 AM',
      items: [
        {
          id: 'item-1',
          name: 'Eggs',
          calories: 300,
          proteinG: 25,
          carbsG: 2,
          fatsG: 20
        }
      ]
    },
    {
      id: 'm2',
      name: 'Lunch',
      time: '01:00 PM',
      items: [
        {
          id: 'item-2',
          name: 'Chicken Rice',
          calories: 700,
          proteinG: 60,
          carbsG: 80,
          fatsG: 10
        }
      ]
    }
  ]
};

const mockGymContext = {
  currentUser: {
    id: 'user-trainee-1',
    name: 'Rawan',
    email: 'rawan@gym.com',
    role: 'trainee' as const,
    gender: 'female' as const,
    goal: 'Hypertrophy' as const,
    weightKg: 65,
    heightCm: 168,
    createdAt: '2026-09-01'
  },
  getDietPlanForUser: vi.fn(() => mockDietPlan)
};

vi.mock('@/context/GymContext', () => ({
  useGym: () => mockGymContext
}));

describe('useTraineeDiet hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('computes initial totals with zero consumed meals', () => {
    const { result } = renderHook(() => useTraineeDiet());

    expect(result.current.dietPlan?.id).toBe('diet-test-1');
    expect(result.current.planMeals.length).toBe(2);
    expect(result.current.totals.goalCalories).toBe(2500);
    expect(result.current.totals.consumedCalories).toBe(0);
    expect(result.current.totals.remainingCalories).toBe(2500);
    expect(result.current.totals.goalProteinG).toBe(200);
    expect(result.current.totals.remainingProteinG).toBe(200);
  });

  it('toggles meal completion and correctly updates consumed and remaining calories/macros', () => {
    const { result } = renderHook(() => useTraineeDiet());

    act(() => {
      result.current.toggleMealCompleted('m1');
    });

    expect(result.current.completedMealIds['m1']).toBe(true);
    expect(result.current.completedCount).toBe(1);
    expect(result.current.totals.consumedCalories).toBe(300);
    expect(result.current.totals.remainingCalories).toBe(2200);
    expect(result.current.totals.consumedProteinG).toBe(25);
    expect(result.current.totals.remainingProteinG).toBe(175);

    // Toggle off
    act(() => {
      result.current.toggleMealCompleted('m1');
    });

    expect(result.current.completedMealIds['m1']).toBe(false);
    expect(result.current.totals.consumedCalories).toBe(0);
    expect(result.current.totals.remainingCalories).toBe(2500);
  });

  it('navigates dates backward and forward correctly', () => {
    const { result } = renderHook(() => useTraineeDiet());

    expect(result.current.isToday).toBe(true);

    act(() => {
      result.current.goToPreviousDay();
    });

    expect(result.current.isToday).toBe(false);

    act(() => {
      result.current.goToToday();
    });

    expect(result.current.isToday).toBe(true);
  });

  it('swaps an item with an alternative, updates meal calories and allows swapping back', () => {
    const { result } = renderHook(() => useTraineeDiet());

    const breakfastItem = result.current.planMeals[0].items[0];
    const initialCalories = breakfastItem.calories;

    const alt = {
      id: 'alt-test-1',
      name: 'Egg Whites & Toast',
      grams: 180,
      calories: initialCalories - 20,
      proteinG: 30,
      carbsG: 20,
      fatsG: 5
    };

    act(() => {
      result.current.swapMealItem(breakfastItem, alt);
    });

    // Swapped item is now active with updated calories
    const updatedItem = result.current.planMeals[0].items[0];
    expect(updatedItem.name).toBe('Egg Whites & Toast');
    expect(updatedItem.calories).toBe(initialCalories - 20);

    // Old item is in alternatives
    expect(updatedItem.badeel?.some((b) => b.name === breakfastItem.name)).toBe(true);
  });
});
