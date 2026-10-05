import { describe, it, expect } from 'vitest';
import { clientService } from '@/services/clientService';
import { workoutService } from '@/services/workoutService';
import { dietService } from '@/services/dietService';
import { mapDbUserToUser, mapUserToDb, mapDbPlanToPlan, mapPlanToDb } from '@/lib/supabase';
import { ClientCreateSchema } from '@/schemas/client.schema';
import { WorkoutPlanSchema } from '@/schemas/workout.schema';
import { User, WorkoutPlan, DietPlan } from '@/types';

describe('Module 6: Multi-Tenant Security & IDOR Isolation Engine', () => {
  const mockUsers: User[] = [
    {
      id: 'athlete-1',
      name: 'Athlete Coach 1',
      email: 'a1@test.com',
      role: 'trainee',
      coachId: 'coach-1',
      avatarText: 'AC',
      status: 'active',
      joinedDate: '2026-01-01',
      heightCm: 175,
      weightKg: 75,
      targetWeightKg: 72,
      goal: 'Fat Loss & Conditioning',
      isCompetitor: true
    },
    {
      id: 'athlete-2',
      name: 'Athlete Coach 2',
      email: 'a2@test.com',
      role: 'trainee',
      coachId: 'coach-2', // Different tenant
      avatarText: 'AC',
      status: 'active',
      joinedDate: '2026-01-01',
      heightCm: 180,
      weightKg: 85,
      targetWeightKg: 82,
      goal: 'Hypertrophy / Muscle Gain',
      isCompetitor: true
    },
    {
      id: 'athlete-global',
      name: 'Athlete Global Template',
      email: 'ag@test.com',
      role: 'trainee',
      // No coachId - system baseline
      avatarText: 'AG',
      status: 'active',
      joinedDate: '2026-01-01',
      heightCm: 170,
      weightKg: 68,
      targetWeightKg: 65,
      goal: 'Athletic Performance',
      isCompetitor: false
    }
  ];

  it('strictly isolates athletes by coachId, preventing cross-tenant leakage (IDOR)', () => {
    // Coach 1 view
    const coach1Athletes = clientService.getTrainees(mockUsers, 'coach-1');
    expect(coach1Athletes.some((a) => a.id === 'athlete-1')).toBe(true);
    expect(coach1Athletes.some((a) => a.id === 'athlete-global')).toBe(true);
    expect(coach1Athletes.some((a) => a.id === 'athlete-2')).toBe(false);

    // Coach 2 view
    const coach2Athletes = clientService.getTrainees(mockUsers, 'coach-2');
    expect(coach2Athletes.some((a) => a.id === 'athlete-2')).toBe(true);
    expect(coach2Athletes.some((a) => a.id === 'athlete-global')).toBe(true);
    expect(coach2Athletes.some((a) => a.id === 'athlete-1')).toBe(false);
  });

  it('strictly isolates competitors by coachId', () => {
    const coach1Competitors = clientService.getCompetitors(mockUsers, 'coach-1');
    expect(coach1Competitors.some((a) => a.id === 'athlete-1')).toBe(true);
    expect(coach1Competitors.some((a) => a.id === 'athlete-2')).toBe(false);

    const coach2Competitors = clientService.getCompetitors(mockUsers, 'coach-2');
    expect(coach2Competitors.some((a) => a.id === 'athlete-2')).toBe(true);
    expect(coach2Competitors.some((a) => a.id === 'athlete-1')).toBe(false);
  });

  it('prevents leakage of workout splits belonging to other coaches', () => {
    const mockPlans: WorkoutPlan[] = [
      {
        id: 'plan-coach-1',
        title: 'Coach 1 Custom Split',
        description: 'Private routine',
        level: 'Intermediate',
        durationWeeks: 8,
        daysPerWeek: 4,
        coachId: 'coach-1',
        days: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      },
      {
        id: 'plan-coach-2',
        title: 'Coach 2 Secret Program',
        description: 'Confidential routine',
        level: 'Advanced',
        durationWeeks: 12,
        daysPerWeek: 5,
        coachId: 'coach-2',
        days: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      },
      {
        id: 'plan-master',
        title: 'Master Template Split',
        description: 'Available to all coaches',
        level: 'Beginner',
        durationWeeks: 6,
        daysPerWeek: 3,
        days: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];

    const coach1Plans = workoutService.getPlansByCoach(mockPlans, 'coach-1');
    expect(coach1Plans.some((p) => p.id === 'plan-coach-1')).toBe(true);
    expect(coach1Plans.some((p) => p.id === 'plan-master')).toBe(true);
    expect(coach1Plans.some((p) => p.id === 'plan-coach-2')).toBe(false);
  });

  it('prevents cross-tenant diet plan leakage', () => {
    const mockDiets: DietPlan[] = [
      {
        id: 'diet-1',
        title: 'Coach 1 Keto Protocol',
        description: 'Private diet',
        coachId: 'coach-1',
        targetCalories: 2200,
        targetProteinG: 180,
        targetCarbsG: 150,
        targetFatsG: 60,
        waterTargetLiters: 3.5,
        meals: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      },
      {
        id: 'diet-2',
        title: 'Coach 2 Carbs Protocol',
        description: 'Private diet',
        coachId: 'coach-2',
        targetCalories: 2600,
        targetProteinG: 200,
        targetCarbsG: 300,
        targetFatsG: 50,
        waterTargetLiters: 4.0,
        meals: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];

    const coach1Diets = dietService.getDietPlans(mockDiets, 'coach-1');
    expect(coach1Diets.some((d) => d.id === 'diet-1')).toBe(true);
    expect(coach1Diets.some((d) => d.id === 'diet-2')).toBe(false);
  });

  it('correctly serializes and deserializes coach_id via Supabase db mappers', () => {
    // User mapping
    const userToDb = mapUserToDb(mockUsers[0]);
    expect(userToDb.coach_id).toBe('coach-1');

    const mappedBackUser = mapDbUserToUser(userToDb);
    expect(mappedBackUser.coachId).toBe('coach-1');

    // Plan mapping
    const samplePlan: WorkoutPlan = {
      id: 'plan-123',
      title: 'Hypertrophy Block',
      description: 'Volume focus',
      level: 'Intermediate',
      durationWeeks: 8,
      daysPerWeek: 4,
      coachId: 'coach-99',
      days: [],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    };

    const planToDb = mapPlanToDb(samplePlan);
    expect(planToDb.coach_id).toBe('coach-99');

    const mappedBackPlan = mapDbPlanToPlan(planToDb);
    expect(mappedBackPlan.coachId).toBe('coach-99');
  });

  it('validates client create payload with coachId and sanitizes XSS injection payloads', () => {
    const rawPayload = {
      coachId: 'coach-1',
      name: 'Malicious <script>alert(1)</script> Athlete',
      email: 'ATHLETE@TEST.COM ',
      heightCm: 180,
      weightKg: 80,
      targetWeightKg: 75,
      goal: 'Hypertrophy / Muscle Gain',
      notes: 'Hello <iframe src="evil.com"></iframe> notes!'
    };

    const result = ClientCreateSchema.safeParse(rawPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coachId).toBe('coach-1');
      expect(result.data.name).not.toContain('<script>');
      expect(result.data.email).toBe('athlete@test.com');
      expect(result.data.notes).not.toContain('<iframe');
    }
  });

  it('validates workout plan contract with coachId and sanitizes malicious script payloads', () => {
    const rawPlan = {
      title: 'Split <script>alert("hack")</script>',
      description: 'Program description <img src="x" onerror="alert(1)">',
      level: 'Intermediate',
      durationWeeks: 8,
      daysPerWeek: 3,
      coachId: 'coach-1',
      days: [
        {
          id: 'day-1',
          dayName: 'Day 1 Push',
          isRestDay: false,
          targetMuscles: ['Chest'],
          estimatedMinutes: 60,
          exercises: []
        }
      ]
    };

    const result = WorkoutPlanSchema.safeParse(rawPlan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coachId).toBe('coach-1');
      expect(result.data.title).not.toContain('<script>');
      expect(result.data.description).not.toContain('onerror');
    }
  });
});
