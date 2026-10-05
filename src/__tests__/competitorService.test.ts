import { describe, it, expect } from 'vitest';
import { competitorService } from '@/services/competitorService';
import { User } from '@/types';

describe('competitorService — Bodybuilding Prep & Readiness Logic', () => {
  it('calculates days out countdown correctly from show date', () => {
    // 10 days in the future
    const futureDate = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
    const days = competitorService.calculateDaysOut(futureDate);
    expect(days).toBe(10);

    // Past date returns minimum 0
    const pastDate = '2020-01-01';
    expect(competitorService.calculateDaysOut(pastDate)).toBe(0);

    // Fallback on missing or invalid date
    expect(competitorService.calculateDaysOut(undefined, 45)).toBe(45);
    expect(competitorService.calculateDaysOut('invalid', 30)).toBe(30);
  });

  it('calculates weight class delta and status with precision', () => {
    // Over target weight
    const overWeight = competitorService.calculateWeightReadiness(88.4, 84.0);
    expect(overWeight.deltaKg).toBe(4.4);
    expect(overWeight.isUnderLimit).toBe(false);
    expect(overWeight.statusText).toBe('4.4 kg to cut');

    // Under target weight
    const underWeight = competitorService.calculateWeightReadiness(82.5, 84.0);
    expect(underWeight.deltaKg).toBe(-1.5);
    expect(underWeight.isUnderLimit).toBe(true);
    expect(underWeight.statusText).toBe('1.5 kg under limit');

    // Exactly at target
    const exact = competitorService.calculateWeightReadiness(84.0, 84.0);
    expect(exact.deltaKg).toBe(0);
    expect(exact.isUnderLimit).toBe(true);
    expect(exact.statusText).toBe('On Target');
  });

  it('determines readiness tier and visual color based on score', () => {
    expect(competitorService.determineReadinessTier(92).tier).toBe('Stage Ready');
    expect(competitorService.determineReadinessTier(78).tier).toBe('On Track');
    expect(competitorService.determineReadinessTier(60).tier).toBe('Needs Acceleration');
    expect(competitorService.determineReadinessTier(35).tier).toBe('High Risk');
  });

  it('filters and sorts competitors with multi-tenant coach scoping', () => {
    const athletes: User[] = [
      {
        id: 'comp-1',
        coachId: 'coach-main',
        name: 'Ahmed Classic',
        email: 'ahmed@classic.com',
        role: 'trainee',
        avatarText: 'AC',
        status: 'active',
        joinedDate: '2026-01-01',
        heightCm: 180,
        weightKg: 86,
        targetWeightKg: 84,
        goal: 'Hypertrophy / Muscle Gain',
        isCompetitor: true,
        competitionProfile: {
          targetShow: 'NPC Egypt Showdown',
          showDate: '2026-11-01',
          division: 'Classic Physique',
          targetWeightClassKg: 84,
          currentWeightKg: 86,
          prepPhase: 'Peak Week',
          stageReadinessScore: 92,
          posingApproval: 'Approved',
          daysOut: 5,
          waterIntakeLiters: 6,
          carbLoadGrams: 400
        }
      },
      {
        id: 'comp-2',
        coachId: 'coach-main',
        name: 'Mohamed Bodybuilding',
        email: 'mohamed@bb.com',
        role: 'trainee',
        avatarText: 'MB',
        status: 'active',
        joinedDate: '2026-01-01',
        heightCm: 175,
        weightKg: 95,
        targetWeightKg: 90,
        goal: 'Hypertrophy / Muscle Gain',
        isCompetitor: true,
        competitionProfile: {
          targetShow: 'Dubai Muscle Show',
          showDate: '2026-12-01',
          division: 'Open Bodybuilding',
          targetWeightClassKg: 90,
          currentWeightKg: 95,
          prepPhase: 'Cutting Phase (8w)',
          stageReadinessScore: 78,
          posingApproval: 'Needs Work',
          daysOut: 45,
          waterIntakeLiters: 5,
          carbLoadGrams: 300
        }
      },
      {
        id: 'comp-foreign',
        coachId: 'coach-other',
        name: 'Foreign Athlete',
        email: 'foreign@test.com',
        role: 'trainee',
        avatarText: 'FA',
        status: 'active',
        joinedDate: '2026-01-01',
        heightCm: 170,
        weightKg: 70,
        targetWeightKg: 70,
        goal: 'Strength & Power',
        isCompetitor: true
      }
    ];

    // Multi-tenant check
    const coachList = competitorService.filterAndSort(athletes, { coachId: 'coach-main' });
    expect(coachList.length).toBe(2);
    expect(coachList.some((c) => c.id === 'comp-foreign')).toBe(false);

    // Division filter
    const classicOnly = competitorService.filterAndSort(athletes, { division: 'Classic Physique' });
    expect(classicOnly.length).toBe(1);
    expect(classicOnly[0].name).toBe('Ahmed Classic');

    // Peak Week filter
    const peakWeek = competitorService.filterAndSort(athletes, { division: 'Peak Week' });
    expect(peakWeek.length).toBe(1);
    expect(peakWeek[0].name).toBe('Ahmed Classic');

    // Sort by days out
    const sorted = competitorService.filterAndSort(athletes, { sortBy: 'days_out' });
    expect(sorted[0].competitionProfile?.daysOut).toBe(5);
  });
});
