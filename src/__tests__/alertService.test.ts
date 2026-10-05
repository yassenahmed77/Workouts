import { describe, it, expect, beforeEach } from 'vitest';
import { alertService } from '@/services/alertService';
import { User, WeeklyCheckIn, WorkoutPlan, DietPlan, WorkoutLog } from '@/types';

describe('alertService — Multi-Tenant Scoping, Deduplication & Hierarchy', () => {
  const mockCoachUser: User = {
    id: 'coach-1',
    name: 'Captain Big Ramy',
    email: 'ramy@gym.com',
    role: 'coach',
    avatarText: 'BR',
    status: 'active',
    joinedDate: '2026-01-01',
    heightCm: 180,
    weightKg: 100,
    targetWeightKg: 100,
    goal: 'Hypertrophy / Muscle Gain'
  };

  const traineeA: User = {
    id: 'trainee-a',
    coachId: 'coach-1',
    name: 'Ahmed Bodybuilder',
    email: 'ahmed@test.com',
    role: 'trainee',
    avatarText: 'AB',
    status: 'active',
    joinedDate: '2026-01-01',
    heightCm: 178,
    weightKg: 85,
    targetWeightKg: 80,
    goal: 'Fat Loss & Conditioning'
  };

  const traineeB_OtherCoach: User = {
    id: 'trainee-b',
    coachId: 'coach-2', // Belonging to another coach
    name: 'Foreign Athlete',
    email: 'foreign@test.com',
    role: 'trainee',
    avatarText: 'FA',
    status: 'active',
    joinedDate: '2026-01-01',
    heightCm: 175,
    weightKg: 75,
    targetWeightKg: 75,
    goal: 'Strength & Power'
  };

  beforeEach(() => {
    alertService.clearAllDismissed();
  });

  it('enforces multi-tenant isolation by filtering out trainees belonging to other coaches', () => {
    const alerts = alertService.getCoachAlerts(
      [mockCoachUser, traineeA, traineeB_OtherCoach],
      [],
      [],
      [],
      [],
      'coach-1' // Scoped to coach-1
    );

    // Should only contain alerts for trainee-a
    expect(alerts.every((a) => a.clientId === 'trainee-a')).toBe(true);
    expect(alerts.some((a) => a.clientId === 'trainee-b')).toBe(false);
  });

  it('guarantees unique IDs and deduplication across generated alerts', () => {
    const alerts = alertService.getCoachAlerts(
      [mockCoachUser, traineeA],
      [],
      [],
      [],
      [],
      'coach-1'
    );

    const ids = alerts.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('prioritizes alerts strictly in CRITICAL > WARNING > INFO hierarchy', () => {
    const unreviewedCheckIn: WeeklyCheckIn = {
      id: 'checkin-1',
      userId: 'trainee-a',
      date: '2026-09-28',
      weightKg: 84.5,
      photos: [],
      measurements: {
        waistCm: 82,
        chestCm: 105,
        armsCm: 40,
        hipsCm: 95
      },
      reviewed: false
    };

    const alerts = alertService.getCoachAlerts(
      [mockCoachUser, traineeA],
      [unreviewedCheckIn],
      [],
      [],
      [],
      'coach-1'
    );

    const priorityRank: Record<string, number> = {
      CRITICAL: 0,
      WARNING: 1,
      INFO: 2
    };

    for (let i = 0; i < alerts.length - 1; i++) {
      const currentRank = priorityRank[alerts[i].priority];
      const nextRank = priorityRank[alerts[i + 1].priority];
      expect(currentRank).toBeLessThanOrEqual(nextRank);
    }
  });

  it('calculates alert category counts accurately', () => {
    const alerts = alertService.getCoachAlerts(
      [mockCoachUser, traineeA],
      [],
      [],
      [],
      [],
      'coach-1'
    );

    const counts = alertService.getAlertCounts(alerts);
    expect(counts.total).toBe(alerts.length);
    expect(counts.total).toBe(counts.critical + counts.warning + counts.info);
  });

  it('handles alert dismissal and restoration lifecycle correctly', () => {
    const alerts = alertService.getCoachAlerts(
      [mockCoachUser, traineeA],
      [],
      [],
      [],
      [],
      'coach-1'
    );

    expect(alerts.length).toBeGreaterThan(0);
    const targetAlert = alerts[0];

    // Dismiss target alert
    alertService.dismiss(targetAlert.id);

    const updatedAlerts = alertService.getCoachAlerts(
      [mockCoachUser, traineeA],
      [],
      [],
      [],
      [],
      'coach-1'
    );

    expect(updatedAlerts.some((a) => a.id === targetAlert.id)).toBe(false);
    expect(updatedAlerts.length).toBe(alerts.length - 1);

    // Restore
    alertService.restore(targetAlert.id);
    const restoredAlerts = alertService.getCoachAlerts(
      [mockCoachUser, traineeA],
      [],
      [],
      [],
      [],
      'coach-1'
    );
    expect(restoredAlerts.some((a) => a.id === targetAlert.id)).toBe(true);
  });
});
