import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { User, WorkoutPlan } from '@/types';

const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Karim Hassan',
    email: 'karim@gym.com',
    role: 'trainee',
    avatarText: 'KH',
    status: 'active',
    joinedDate: '2026-09-01',
    weightKg: 90,
    targetWeightKg: 80,
    heightCm: 185,
    goal: 'Hypertrophy / Muscle Gain',
    assignedPlanId: 'p1',
    assignedDietPlanId: 'd1'
  },
  {
    id: 'u2',
    name: 'Amr Diab',
    email: 'amr@gym.com',
    role: 'trainee',
    avatarText: 'AD',
    status: 'active',
    joinedDate: '2026-09-15',
    weightKg: 75,
    targetWeightKg: 70,
    heightCm: 174,
    goal: 'Fat Loss & Conditioning'
  },
  {
    id: 'u3',
    name: 'Captain Tamer',
    email: 'coach@gym.com',
    role: 'coach',
    avatarText: 'CT',
    status: 'active',
    joinedDate: '2026-01-01',
    weightKg: 85,
    targetWeightKg: 85,
    heightCm: 180,
    goal: 'Strength & Power'
  }
];

const mockPlans: WorkoutPlan[] = [
  {
    id: 'p1',
    title: 'Upper Lower Split',
    description: '4 day strength plan',
    level: 'Intermediate',
    daysPerWeek: 4,
    durationWeeks: 8,
    createdAt: '2026-09-01',
    updatedAt: '2026-09-01',
    days: []
  }
];

vi.mock('@/context/GymContext', () => ({
  useGym: () => ({
    users: mockUsers,
    plans: mockPlans,
    dietPlans: [],
    logs: [],
    getUserLogs: vi.fn(() => []),
    getCheckInsForUser: vi.fn(() => []),
    deleteUser: vi.fn(),
    updateUserProfile: vi.fn(),
    getDietPlanForUser: vi.fn()
  })
}));

vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

import { useClientsList } from '@/hooks/useClientsList';

describe('useClientsList Headless Hook — Filtering & Edge Cases', () => {
  it('filters out non-trainee users (coaches excluded)', () => {
    const { result } = renderHook(() => useClientsList());
    expect(result.current.trainees).toHaveLength(2);
    expect(result.current.trainees.some((t) => t.role === 'coach')).toBe(false);
  });

  it('filters roster by search query across names and goals', () => {
    const { result } = renderHook(() => useClientsList());

    act(() => {
      result.current.setSearchQuery('amr');
    });
    expect(result.current.filteredTrainees).toHaveLength(1);
    expect(result.current.filteredTrainees[0].name).toBe('Amr Diab');

    act(() => {
      result.current.setSearchQuery('hypertrophy');
    });
    expect(result.current.filteredTrainees).toHaveLength(1);
    expect(result.current.filteredTrainees[0].name).toBe('Karim Hassan');
  });

  it('accurately computes athlete status (All Set vs Needs Setup)', () => {
    const { result } = renderHook(() => useClientsList());

    const karim = mockUsers[0];
    const amr = mockUsers[1];

    expect(result.current.getAthleteStatus(karim).key).toBe('active');
    expect(result.current.getAthleteStatus(amr).key).toBe('needs_setup');
  });

  it('handles empty results without breaking pagination math', () => {
    const { result } = renderHook(() => useClientsList());

    act(() => {
      result.current.setSearchQuery('non-existent-athlete-xyz');
    });

    expect(result.current.filteredTrainees).toHaveLength(0);
    expect(result.current.paginatedTrainees).toHaveLength(0);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.currentPage).toBe(1);
  });
});
