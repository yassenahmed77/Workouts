import { CoachSettings, CoachPackage } from '@/types';
import { CoachSettingsSchema, CoachPackageSchema } from '@/schemas/settings.schema';

export const coachSettingsService = {
  validateSettings(settings: unknown): { success: boolean; data?: CoachSettings; error?: string } {
    const result = CoachSettingsSchema.safeParse(settings);
    if (!result.success) {
      return { success: false, error: result.error.issues[0]?.message || 'Invalid settings' };
    }
    return { success: true, data: result.data as CoachSettings };
  },

  validatePackage(pkg: unknown): { success: boolean; data?: CoachPackage; error?: string } {
    const result = CoachPackageSchema.safeParse(pkg);
    if (!result.success) {
      return { success: false, error: result.error.issues[0]?.message || 'Invalid package' };
    }
    return { success: true, data: result.data as CoachPackage };
  },

  formatPrice(price: number, currency: string = 'EGP'): string {
    const safePrice = Math.max(0, price || 0);
    return `${safePrice.toLocaleString()} ${currency}`;
  },

  calculateMonthlyPrice(price: number, durationMonths: number): number {
    const duration = Math.max(1, durationMonths || 1);
    return Math.round((price / duration) * 10) / 10;
  },

  getDefaultPackages(): CoachPackage[] {
    return [
      {
        id: 'pkg-1',
        name: 'Full VIP Coaching',
        durationMonths: 3,
        price: 6000,
        description: 'Custom training split, hyper-personalized nutrition, weekly check-in audits & 24/7 WhatsApp support.',
        isPopular: true
      },
      {
        id: 'pkg-2',
        name: 'Workout Only',
        durationMonths: 3,
        price: 3500,
        description: 'Progressive overload training plan, video technique review, and monthly split updates.',
        isPopular: false
      },
      {
        id: 'pkg-3',
        name: 'Contest Prep',
        durationMonths: 6,
        price: 15000,
        description: 'Comprehensive show preparation, peak week protocol, stage posing approval, and daily check-ins.',
        isPopular: false
      }
    ];
  }
};
