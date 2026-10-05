import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TraineeDashboard } from '@/components/trainee/TraineeDashboard';
import { User, WorkoutPlan, WorkoutLog } from '@/types';

// Mock contexts
const mockShowToast = vi.fn();
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast })
}));

const mockCurrentUser: User = {
  id: 'trainee-001',
  name: 'Rawan Ahmed',
  email: 'rawan@athlete.com',
  role: 'trainee',
  avatarText: 'RA',
  status: 'active',
  joinedDate: '2026-09-01',
  weightKg: 64.5,
  targetWeightKg: 62.0,
  heightCm: 168,
  goal: 'Hypertrophy / Muscle Gain'
};

const mockPlan: WorkoutPlan = {
  id: 'plan-001',
  title: 'Upper / Lower Split',
  description: 'Hypertrophy protocol',
  coachId: 'coach-001',
  level: 'Intermediate',
  durationWeeks: 8,
  daysPerWeek: 4,
  createdAt: '2026-09-01',
  updatedAt: '2026-09-01',
  days: [
    {
      id: 'day-001',
      dayName: 'Upper Body Power',
      isRestDay: false,
      estimatedMinutes: 50,
      targetMuscles: ['Chest', 'Back', 'Shoulders'],
      exercises: [
        {
          id: 'rx-001',
          exerciseId: 'ex-001',
          exerciseName: 'Incline Dumbbell Press',
          targetMuscle: 'Chest',
          equipment: 'Dumbbell',
          sets: 3,
          targetReps: '8-10',
          restSeconds: 90
        },
        {
          id: 'rx-002',
          exerciseId: 'ex-002',
          exerciseName: 'Lat Pulldown',
          targetMuscle: 'Back',
          equipment: 'Cable',
          sets: 3,
          targetReps: '10-12',
          restSeconds: 75
        }
      ]
    },
    {
      id: 'day-002',
      dayName: 'Lower Body Strength',
      isRestDay: false,
      estimatedMinutes: 55,
      targetMuscles: ['Quads', 'Hamstrings'],
      exercises: []
    }
  ]
};

const mockDietPlan = {
  id: 'diet-001',
  title: 'Lean Bulk Protocol',
  targetCalories: 2350,
  targetProteinG: 155,
  targetCarbsG: 240,
  targetFatsG: 65,
  waterTargetLiters: 3.5,
  meals: []
};

let mockLogs: WorkoutLog[] = [];
let mockDraft: any = null;

vi.mock('@/lib/activeWorkoutEngine', () => ({
  hasActiveWorkoutDraft: vi.fn(() => Boolean(mockDraft)),
  getActiveWorkoutDraft: vi.fn(() => mockDraft),
  clearActiveWorkoutDraft: vi.fn(() => {
    mockDraft = null;
  }),
  isDayUnfinished: vi.fn(() => false),
  clearUnfinishedStatus: vi.fn(),
  markWorkoutAsUnfinished: vi.fn()
}));

vi.mock('@/context/GymContext', () => ({
  useGym: () => ({
    currentUser: mockCurrentUser,
    getPlanForUser: vi.fn(() => mockPlan),
    getUserLogs: vi.fn(() => mockLogs),
    deleteWorkoutLog: vi.fn(),
    getDietPlanForUser: vi.fn(() => mockDietPlan)
  })
}));

describe('TraineeDashboard Component — Mobile-First Obsidian & Horizon Theme', () => {
  beforeEach(() => {
    mockLogs = [];
    mockDraft = null;
    vi.clearAllMocks();
  });

  it('starts page directly with interactive 7-day calendar strip and week navigation', () => {
    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    expect(screen.getByText(/This Week/i)).toBeDefined();
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeDefined();
    });
  });

  it('allows selecting past or future dates in the week strip', () => {
    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    const monButton = screen.getByText('MON').closest('button');
    expect(monButton).not.toBeNull();
    if (monButton) {
      fireEvent.click(monButton);
    }
  });

  it('renders 7-day calendar strip with today highlighted', () => {
    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeDefined();
    });
  });

  it('renders ambient sunrise horizon arc gauge and Swiss tabular stats', () => {
    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    expect(screen.getByText('Daily Progress')).toBeDefined();
    expect(screen.getByText('Sessions')).toBeDefined();
    expect(screen.getByText('Exercises')).toBeDefined();
    expect(screen.getByText('Habits')).toBeDefined();
    expect(screen.getByText('Rest Day')).toBeDefined();

    // Toggle switch to Rest Day
    const restDaySwitch = screen.getByRole('switch', { name: /toggle rest day/i });
    fireEvent.click(restDaySwitch);
    expect(screen.getAllByText((_, el) => el?.textContent?.trim() === '0 / 0').length).toBeGreaterThanOrEqual(2);

    // Toggle switch back to Active Training Day
    fireEvent.click(restDaySwitch);
    expect(screen.getByText((_, el) => el?.textContent?.trim() === '0 / 1')).toBeDefined();
  });




  it('renders Hero Workout card with scheduled exercises and START WORKOUT button', () => {
    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    expect(screen.getAllByText('Upper Body Power')[0]).toBeDefined();
    expect(screen.getByText('Incline Dumbbell Press')).toBeDefined();
    expect(screen.getByText('Lat Pulldown')).toBeDefined();
    expect(screen.getByText('START WORKOUT')).toBeDefined();

  });

  it('renders Daily Nutrition glance and Hydration stepper widget', () => {
    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    expect(screen.getByText('Daily Nutrition')).toBeDefined();
    expect(screen.getByText(/2,350/i)).toBeDefined();
    expect(screen.getByText('155g')).toBeDefined();
    expect(screen.getByText('240g')).toBeDefined();
    expect(screen.getByText('65g')).toBeDefined();
    expect(screen.getByText('Hydration Tracker')).toBeDefined();
  });

  it('hides Hydration Tracker when neither coach nor trainee has set a water target', () => {
    const prevWater = mockDietPlan.waterTargetLiters;
    mockDietPlan.waterTargetLiters = 0;
    localStorage.setItem(
      `pro_gym_user_habits_v9_${mockCurrentUser.id}`,
      JSON.stringify([
        {
          id: 'custom-h-1',
          userId: mockCurrentUser.id,
          title: 'Creatine Monohydrate',
          category: 'Supplement',
          type: 'boolean',
          targetValue: 1,
          unit: 'done',
          iconKey: 'zap',
          color: '#ff6b00',
          createdAt: new Date().toISOString()
        }
      ])
    );

    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    expect(screen.queryByText('Hydration Tracker')).toBeNull();
    mockDietPlan.waterTargetLiters = prevWater;
    localStorage.removeItem(`pro_gym_user_habits_v9_${mockCurrentUser.id}`);
  });

  it('renders in-progress draft banner with RESUME WORKOUT when draft exists', () => {
    mockDraft = {
      userId: 'trainee-001',
      dayId: 'day-001',
      elapsedSeconds: 125,
      exerciseLogs: [
        {
          exerciseId: 'ex-001',
          exerciseName: 'Incline Dumbbell Press',
          sets: [{ setNumber: 1, reps: 10, weightKg: 30, completed: true }]
        }
      ]
    };

    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    expect(screen.getByText('Workout In Progress')).toBeDefined();
    expect(screen.getByText('RESUME WORKOUT')).toBeDefined();
  });

  it('renders completed today banner when a session was logged today', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    mockLogs = [
      {
        id: 'log-today',
        userId: 'trainee-001',
        planId: 'plan-001',
        dayId: 'day-001',
        dayName: 'Upper Body Power',
        date: todayStr,
        durationSeconds: 3120,
        totalVolumeKg: 14200,
        completedExercises: [
          {
            exerciseId: 'ex-001',
            exerciseName: 'Incline Dumbbell Press',
            targetMuscle: 'Chest',
            sets: [{ setNumber: 1, reps: 10, weightKg: 30, completed: true }]
          }
        ]
      }
    ];

    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    expect(screen.getByText('Workout Completed Today')).toBeDefined();
    expect(screen.getByText('Restart Workout')).toBeDefined();
    expect(screen.getByText('Delete Log')).toBeDefined();
  });

  it('renders Hero Workout card with session title first and metadata underneath', () => {
    // 1 log completed this week for Upper Body Power (day-001)
    const todayStr = new Date().toISOString().split('T')[0];
    mockLogs = [
      {
        id: 'log-1',
        userId: 'trainee-001',
        planId: 'plan-001',
        dayId: 'day-001',
        dayName: 'Upper Body Power',
        date: todayStr,
        durationSeconds: 3000,
        totalVolumeKg: 12000,
        completedExercises: []
      }
    ];

    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    // Title is rendered as h2 (first element)
    expect(screen.getByRole('heading', { level: 2, name: /upper body power/i })).toBeDefined();
    expect(screen.getByText('Today')).toBeDefined();
    expect(screen.getAllByText('Done')[0]).toBeDefined();
  });

  it('toggles Rest Day with iOS-style switcher and updates protocol statistics', () => {
    mockLogs = [];
    render(
      <TraineeDashboard
        onNavigateToSplit={vi.fn()}
        onNavigateToHistory={vi.fn()}
        onNavigateToHabits={vi.fn()}
      />
    );

    const restDaySwitch = screen.getByRole('switch', { name: /toggle rest day/i });
    expect(restDaySwitch).toBeDefined();
    expect(restDaySwitch.getAttribute('aria-checked')).toBe('false');

    // Default active day shows Sessions 0 / 1
    expect(screen.getByText('Sessions')).toBeDefined();

    // Toggle ON -> Rest Day
    fireEvent.click(restDaySwitch);
    expect(restDaySwitch.getAttribute('aria-checked')).toBe('true');
    expect(mockShowToast).toHaveBeenCalledWith('Rest & Recovery Day 🌙', 'info');

    // When rest day is active, sessions and exercises show 0 / 0
    expect(screen.getAllByText('0 / 0').length).toBeGreaterThanOrEqual(1);

    // Toggle OFF -> Active Training Day
    fireEvent.click(restDaySwitch);
    expect(restDaySwitch.getAttribute('aria-checked')).toBe('false');
    expect(mockShowToast).toHaveBeenCalledWith('Active Training Day ⚡', 'info');
  });

});

