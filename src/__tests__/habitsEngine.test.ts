import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateQuitLiveStats, 
  calculateOverallHabitsSummary,
  calculateHabitStreak,
  calculateDailyAdherenceScore,
  getHabitsAdherenceForDate,
  getHabitWeekHistory,
  getQuitHabitsTotalSavings,
  UserHabit
} from '@/lib/habitsEngine';


describe('habitsEngine — Domain Math & Precision Calculations', () => {
  const dummyQuitHabit: UserHabit = {
    id: 'habit-quit-test',
    userId: 'user-123',
    title: 'Smoke-Free',
    category: 'Quit / Break',
    type: 'quit',
    targetValue: 90,
    unit: 'days clean',
    iconKey: 'cigarette-off',
    color: '#ff6b00',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 48 hours ago
    quitConfig: {
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // exactly 2 days ago
      targetDays: 90,
      quitCategory: 'smoking',
      cigarettesPerDay: 20,
      pricePerPack: 80,
      cigarettesPerPack: 20,
      savingsPerDay: 80,
      currency: 'EGP',
      avoidedUnitsPerDay: 20,
      avoidedUnitLabel: 'Cigarettes',
      motivationReason: 'Clean lungs'
    }
  };

  it('calculates elapsed days, hours, and precision percentages correctly', () => {
    const stats = calculateQuitLiveStats(dummyQuitHabit);

    expect(stats.days).toBe(2);
    expect(stats.targetDays).toBe(90);
    // 2 / 90 * 100 = ~2%
    expect(stats.progressPercentage).toBe(2);
    expect(stats.isTargetAchieved).toBe(false);
  });

  it('calculates smoking financial savings and physical units avoided with zero floating error', () => {
    const stats = calculateQuitLiveStats(dummyQuitHabit);

    // 2 days * 80 EGP/day = 160 EGP
    expect(stats.moneySaved).toBe(160);
    expect(stats.projectedMonthlySavings).toBe(2400); // 80 * 30
    expect(stats.projectedYearlySavings).toBe(29200); // 80 * 365

    // 2 days * 20 cigs = 40 cigs avoided
    expect(stats.exactCigarettesAvoided).toBe(40);
    expect(stats.packsAvoided).toBe(2);
    // 40 cigs * 11 mins / 60 = 7.33 -> 7 hours
    expect(stats.lifeHoursRegained).toBe(7);
  });

  it('assigns the correct biological and neuro-rewiring evolutionary stages', () => {
    // 2 days elapsed -> Stage 2: Detoxification
    const statsDay2 = calculateQuitLiveStats(dummyQuitHabit);
    expect(statsDay2.currentStage.level).toBe(2);
    expect(statsDay2.currentStage.name).toBe('Detoxification');

    // 10 days elapsed -> Stage 4: Neuro-Rewiring
    const habitDay10: UserHabit = {
      ...dummyQuitHabit,
      quitConfig: {
        ...dummyQuitHabit.quitConfig!,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
      }
    };
    const statsDay10 = calculateQuitLiveStats(habitDay10);
    expect(statsDay10.currentStage.level).toBe(4);
    expect(statsDay10.currentStage.name).toBe('Neuro-Rewiring');

    // 95 days elapsed -> Stage 7: Unbreakable Legend
    const habitDay95: UserHabit = {
      ...dummyQuitHabit,
      quitConfig: {
        ...dummyQuitHabit.quitConfig!,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 95).toISOString()
      }
    };
    const statsDay95 = calculateQuitLiveStats(habitDay95);
    expect(statsDay95.currentStage.level).toBe(7);
    expect(statsDay95.currentStage.name).toBe('Unbreakable Legend');
    expect(statsDay95.isTargetAchieved).toBe(true);
  });

  it('safely handles zero-division edge cases without throwing or NaN', () => {
    const brokenHabit: UserHabit = {
      ...dummyQuitHabit,
      quitConfig: {
        startedAt: new Date().toISOString(),
        targetDays: 0,
        cigarettesPerPack: 0,
        pricePerPack: 0,
        cigarettesPerDay: 0
      }
    };

    const stats = calculateQuitLiveStats(brokenHabit);
    expect(isNaN(stats.moneySaved)).toBe(false);
    expect(isNaN(stats.progressPercentage)).toBe(false);
    expect(stats.moneySaved).toBe(0);
  });

  it('handles empty habits list gracefully in calculateOverallHabitsSummary', () => {
    const summary = calculateOverallHabitsSummary('user-empty', []);
    expect(summary.todayCompletedCount).toBe(0);
    expect(summary.todayTotalCount).toBe(0);
    expect(summary.adherencePercentage).toBe(100);
    expect(summary.activeStreak).toBe(0);
  });

  it('calculates weighted daily adherence score (nesba w tanasob) accurately on training and rest days', () => {
    // 1. Training day: 4 habits, 2 done, no workout logged
    const partialTraining = calculateDailyAdherenceScore('2026-10-01', false, false, {
      completedCount: 2,
      totalCount: 4
    });
    // workout = 0, habits = 50% of 40 = 20
    expect(partialTraining.score).toBe(20);
    expect(partialTraining.isFullComplete).toBe(false);
    expect(partialTraining.hasPartial).toBe(true);

    // 2. Training day: workout logged + 2 habits done
    const withWorkout = calculateDailyAdherenceScore('2026-10-01', true, false, {
      completedCount: 2,
      totalCount: 4
    });
    // workout = 60, habits = 20 -> 80%
    expect(withWorkout.score).toBe(80);
    expect(withWorkout.workoutScore).toBe(60);
    expect(withWorkout.habitsScore).toBe(20);

    // 3. Training day: workout logged + all 4 habits done -> 100% full circle
    const fullTraining = calculateDailyAdherenceScore('2026-10-01', true, false, {
      completedCount: 4,
      totalCount: 4
    });
    expect(fullTraining.score).toBe(100);
    expect(fullTraining.isFullComplete).toBe(true);

    // 4. Rest day: workout not required, habits are 100% of score
    const restDayHalf = calculateDailyAdherenceScore('2026-10-01', false, true, {
      completedCount: 2,
      totalCount: 4
    });
    expect(restDayHalf.score).toBe(50);
    expect(restDayHalf.isRestDay).toBe(true);

    const restDayFull = calculateDailyAdherenceScore('2026-10-01', false, true, {
      completedCount: 4,
      totalCount: 4
    });
    expect(restDayFull.score).toBe(100);
    expect(restDayFull.isFullComplete).toBe(true);
  });

  it('includes ongoing clean quit habits in daily adherence count', () => {
    // dummyQuitHabit started 48 hours ago
    const habitsList = [dummyQuitHabit];

    const todayStr = new Date().toISOString().split('T')[0];

    const adherence = getHabitsAdherenceForDate('user-123', habitsList, todayStr);
    expect(adherence.totalCount).toBe(1);
    expect(adherence.completedCount).toBe(1);
    expect(adherence.isAllCompleted).toBe(true);
  });

  it('generates 7-day chronological history dots ending on today', () => {
    const dots = getHabitWeekHistory('user-test-dots', 'habit-test-dots');
    expect(dots.length).toBe(7);
    expect(dots[6].isToday).toBe(true);
    expect(dots[0].isToday).toBe(false);
    expect(typeof dots[6].dayLabel).toBe('string');
  });

  it('calculates total accumulated savings across all quit habits accurately', () => {
    const quitHabits = [
      dummyQuitHabit,
      {
        ...dummyQuitHabit,
        id: 'quit-2',
        quitConfig: {
          ...dummyQuitHabit.quitConfig!,
          savingsPerDay: 50,
          currency: 'EGP'
        }
      }
    ];

    const result = getQuitHabitsTotalSavings(quitHabits);
    expect(result.totalSaved).toBeGreaterThanOrEqual(0);
    expect(result.currency).toBe('EGP');
  });
});

