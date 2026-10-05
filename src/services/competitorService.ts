import { User, CompetitorProfile, CompetitorDivision } from '@/types';
import { CompetitorProfileSchema } from '@/schemas/competitor.schema';

export interface CompetitorReadinessInfo {
  daysOut: number;
  weightDeltaKg: number;
  isUnderLimit: boolean;
  statusText: string;
  readinessTier: 'Stage Ready' | 'On Track' | 'Needs Acceleration' | 'High Risk';
  tierColor: string;
}

export const competitorService = {
  validateProfile(profile: unknown): { success: boolean; data?: CompetitorProfile; error?: string } {
    const result = CompetitorProfileSchema.safeParse(profile);
    if (!result.success) {
      return { success: false, error: result.error.issues[0]?.message || 'Invalid competitor profile' };
    }
    return { success: true, data: result.data as CompetitorProfile };
  },

  calculateDaysOut(showDateStr?: string, fallbackDaysOut: number = 30): number {
    if (!showDateStr) return Math.max(0, fallbackDaysOut);
    const showTime = new Date(showDateStr).getTime();
    if (isNaN(showTime)) return Math.max(0, fallbackDaysOut);
    const now = Date.now();
    const diffDays = Math.ceil((showTime - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  calculateWeightReadiness(currentWeightKg: number, targetWeightClassKg: number): {
    deltaKg: number;
    isUnderLimit: boolean;
    statusText: string;
  } {
    const current = Math.max(0, currentWeightKg || 0);
    const target = Math.max(0, targetWeightClassKg || 0);
    const deltaKg = Math.round((current - target) * 10) / 10;
    const isUnderLimit = deltaKg <= 0;

    let statusText = 'On Target';
    if (deltaKg > 0) {
      statusText = `${deltaKg} kg to cut`;
    } else if (deltaKg < 0) {
      statusText = `${Math.abs(deltaKg)} kg under limit`;
    }

    return { deltaKg, isUnderLimit, statusText };
  },

  determineReadinessTier(score: number): {
    tier: 'Stage Ready' | 'On Track' | 'Needs Acceleration' | 'High Risk';
    color: string;
  } {
    const safeScore = Math.min(100, Math.max(0, score || 0));
    if (safeScore >= 85) {
      return { tier: 'Stage Ready', color: '#10b981' };
    }
    if (safeScore >= 70) {
      return { tier: 'On Track', color: '#2f80ed' };
    }
    if (safeScore >= 50) {
      return { tier: 'Needs Acceleration', color: '#f59e0b' };
    }
    return { tier: 'High Risk', color: '#f43f5e' };
  },

  filterAndSort(
    competitors: User[],
    options: {
      searchQuery?: string;
      division?: string;
      targetShow?: string;
      sortBy?: 'days_out' | 'weight' | 'readiness' | 'workout';
      coachId?: string;
    }
  ): User[] {
    const { searchQuery = '', division = 'All', targetShow = 'all', sortBy = 'days_out', coachId } = options;

    return competitors
      .filter((u) => {
        // Multi-tenant check
        if (coachId && u.coachId && u.coachId !== coachId) return false;

        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchName = u.name.toLowerCase().includes(q);
          const matchShow = u.competitionProfile?.targetShow.toLowerCase().includes(q);
          const matchDivision = u.competitionProfile?.division.toLowerCase().includes(q);
          if (!matchName && !matchShow && !matchDivision) return false;
        }

        if (division !== 'All') {
          if (division === 'Peak Week') {
            if (u.competitionProfile?.prepPhase !== 'Peak Week') return false;
          } else {
            if (u.competitionProfile?.division !== division) return false;
          }
        }

        if (targetShow !== 'all') {
          if (u.competitionProfile?.targetShow !== targetShow) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const profA = a.competitionProfile;
        const profB = b.competitionProfile;

        if (sortBy === 'days_out') {
          const daysA = profA?.daysOut ?? 999;
          const daysB = profB?.daysOut ?? 999;
          return daysA - daysB;
        }

        if (sortBy === 'weight') {
          return (b.weightKg || 0) - (a.weightKg || 0);
        }

        if (sortBy === 'readiness') {
          const scoreA = profA?.stageReadinessScore ?? 0;
          const scoreB = profB?.stageReadinessScore ?? 0;
          return scoreB - scoreA;
        }

        return 0;
      });
  }
};
