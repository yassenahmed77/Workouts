import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppRouting } from '@/hooks/useAppRouting';
import { User } from '@/types';

describe('useAppRouting — Two-Way URL Routing & Deep-Linking Engine', () => {
  const mockCoach: User = {
    id: 'coach-1',
    name: 'Yassen Ahmed',
    email: 'yassen@test.com',
    role: 'coach',
    avatarText: 'YA',
    status: 'active',
    joinedDate: '2026-01-01',
    heightCm: 180,
    weightKg: 80,
    targetWeightKg: 80,
    goal: 'Athletic Performance'
  };

  const mockTrainee: User = {
    id: 'trainee-1',
    name: 'Rawan Ahmed',
    email: 'rawan@test.com',
    role: 'trainee',
    avatarText: 'RA',
    status: 'active',
    joinedDate: '2026-01-01',
    heightCm: 165,
    weightKg: 65,
    targetWeightKg: 60,
    goal: 'Fat Loss & Conditioning'
  };

  const mockUsers = [mockCoach, mockTrainee];

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('initializes coach on default "dashboard" tab with clean URL', () => {
    const { result } = renderHook(() =>
      useAppRouting({ currentUser: mockCoach, users: mockUsers, isLoaded: true })
    );

    expect(result.current.activeTab).toBe('dashboard');
    expect(result.current.selectedClientFor360).toBeNull();
  });

  it('initializes trainee on default "today" tab with clean URL', () => {
    const { result } = renderHook(() =>
      useAppRouting({ currentUser: mockTrainee, users: mockUsers, isLoaded: true })
    );

    expect(result.current.activeTab).toBe('today');
  });

  it('navigates to tab and synchronizes window history with URL query parameter', () => {
    const { result } = renderHook(() =>
      useAppRouting({ currentUser: mockTrainee, users: mockUsers, isLoaded: true })
    );

    act(() => {
      result.current.navigateToTab('split');
    });

    expect(result.current.activeTab).toBe('split');
    expect(window.location.search).toBe('?tab=split');
  });

  it('supports deep-linking to Client 360 with clientId and subTab', () => {
    const { result } = renderHook(() =>
      useAppRouting({ currentUser: mockCoach, users: mockUsers, isLoaded: true })
    );

    act(() => {
      result.current.navigateToClient360(mockTrainee, 'checkins');
    });

    expect(result.current.activeTab).toBe('clients');
    expect(result.current.selectedClientFor360?.id).toBe('trainee-1');
    expect(result.current.clientDetailInitialSubTab).toBe('checkins');
    expect(window.location.search).toBe('?tab=clients&clientId=trainee-1&subTab=checkins');

    // Close Client 360 and return to clients list
    act(() => {
      result.current.closeClient360();
    });

    expect(result.current.selectedClientFor360).toBeNull();
    expect(window.location.search).toBe('?tab=clients');
  });

  it('hydrates initial state from URL query parameter on direct page load', () => {
    window.history.replaceState({}, '', '/?tab=splits-studio');

    const { result } = renderHook(() =>
      useAppRouting({ currentUser: mockCoach, users: mockUsers, isLoaded: true })
    );

    expect(result.current.activeTab).toBe('splits-studio');
  });

  it('guards against role boundary violations (e.g. trainee attempting coach tab)', () => {
    window.history.replaceState({}, '', '/?tab=splits-studio');

    const { result } = renderHook(() =>
      useAppRouting({ currentUser: mockTrainee, users: mockUsers, isLoaded: true })
    );

    // Trainee is redirected to 'today' default
    expect(result.current.activeTab).toBe('today');
  });
});
