import { describe, it, expect } from 'vitest';
import { coachSettingsService } from '@/services/coachSettingsService';

describe('coachSettingsService — Validation & Financial Calculations', () => {
  it('validates a complete and legitimate coach settings configuration', () => {
    const validSettings = {
      coachName: 'Captain Big Ramy',
      brandName: 'Ramy Pro Coaching',
      tagline: 'Olympia Standard Fitness',
      whatsappNumber: '01012345678',
      email: 'ramy@olympia.com',
      currency: 'EGP',
      renewalReminderDaysBefore: 5,
      checkInDays: ['Friday', 'Sunday'],
      packages: coachSettingsService.getDefaultPackages()
    };

    const result = coachSettingsService.validateSettings(validSettings);
    expect(result.success).toBe(true);
    expect(result.data?.coachName).toBe('Captain Big Ramy');
  });

  it('rejects settings with missing name or invalid email', () => {
    const invalidSettings = {
      coachName: '',
      brandName: 'Gym Pro',
      tagline: '',
      whatsappNumber: '',
      email: 'invalid-email-string',
      currency: 'EGP',
      renewalReminderDaysBefore: 3,
      checkInDays: [],
      packages: []
    };

    const result = coachSettingsService.validateSettings(invalidSettings);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('validates individual package structures and sanitizes inputs', () => {
    const pkg = {
      id: 'pkg-test',
      name: '<script>alert("hack")</script>Elite VIP',
      durationMonths: 6,
      price: 12000,
      description: 'Exclusive 1-on-1 coaching with <b>full</b> support.',
      isPopular: true
    };

    const result = coachSettingsService.validatePackage(pkg);
    expect(result.success).toBe(true);
    // XSS payload stripped
    expect(result.data?.name).toBe('Elite VIP');
    expect(result.data?.price).toBe(12000);
  });

  it('calculates monthly price breakdown accurately', () => {
    expect(coachSettingsService.calculateMonthlyPrice(6000, 3)).toBe(2000);
    expect(coachSettingsService.calculateMonthlyPrice(10000, 4)).toBe(2500);
    expect(coachSettingsService.calculateMonthlyPrice(5000, 0)).toBe(5000); // 0 defaults to 1 month
  });

  it('formats currency strings cleanly without NaN', () => {
    expect(coachSettingsService.formatPrice(6000, 'EGP')).toBe('6,000 EGP');
    expect(coachSettingsService.formatPrice(0, 'USD')).toBe('0 USD');
    expect(coachSettingsService.formatPrice(-500, 'SAR')).toBe('0 SAR');
  });
});
