import { describe, it, expect } from 'vitest';
import { clientService } from '@/services/clientService';
import { User, ClientSubscription } from '@/types';

describe('clientService — Domain Logic & Zod Contracts', () => {
  it('derives safe avatar initials from diverse name formats', () => {
    expect(clientService.getInitials('John Doe')).toBe('JD');
    expect(clientService.getInitials('Tamer')).toBe('TA');
    expect(clientService.getInitials('Mohamed Ali Hassan')).toBe('MH');
    expect(clientService.getInitials('')).toBe('AT');
    expect(clientService.getInitials(undefined)).toBe('AT');
  });

  it('accurately evaluates athlete lifecycle status', () => {
    const baseClient: User = {
      id: 'c1',
      name: 'Test Athlete',
      email: 'test@gym.com',
      role: 'trainee',
      avatarText: 'TA',
      status: 'active',
      joinedDate: '2026-10-01',
      weightKg: 80,
      targetWeightKg: 75,
      heightCm: 175,
      goal: 'Fat Loss & Conditioning'
    };

    // Needs setup (no plan, no diet)
    expect(clientService.getClientStatus(baseClient).status).toBe('needs_plan');

    // Needs diet (has plan only)
    const withPlan: User = { ...baseClient, assignedPlanId: 'p1' };
    expect(clientService.getClientStatus(withPlan).status).toBe('needs_diet');

    // All set (has both plan and diet)
    const withBoth: User = { ...baseClient, assignedPlanId: 'p1', assignedDietPlanId: 'd1' };
    expect(clientService.getClientStatus(withBoth).status).toBe('active');

    // On hold overrides assignments
    const onHold: User = { ...withBoth, status: 'on_hold' };
    expect(clientService.getClientStatus(onHold).status).toBe('on_hold');
  });

  it('calculates dynamic subscription expiration lifecycle based on real dates', () => {
    const today = new Date();
    
    // Expired: date in the past
    const pastDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const expiredSub: ClientSubscription = {
      planType: 'Full VIP Coaching',
      durationMonths: 1,
      startDate: '2026-01-01',
      endDate: pastDate,
      status: 'expired'
    };
    expect(clientService.calculateSubscriptionStatus(expiredSub)).toBe('expired');

    // Expiring soon: within 5 days
    const soonDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const soonSub: ClientSubscription = {
      planType: 'Full VIP Coaching',
      durationMonths: 1,
      startDate: '2026-01-01',
      endDate: soonDate,
      status: 'active'
    };
    expect(clientService.calculateSubscriptionStatus(soonSub)).toBe('expiring_soon');

    // Active: 30 days in future
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const activeSub: ClientSubscription = {
      planType: 'Full VIP Coaching',
      durationMonths: 1,
      startDate: '2026-01-01',
      endDate: futureDate,
      status: 'active'
    };
    expect(clientService.calculateSubscriptionStatus(activeSub)).toBe('active');
  });

  it('validates client creation payload strictly using Zod', () => {
    // Valid payload
    const valid = clientService.validateCreate({
      name: 'Mostafa Kamal',
      email: 'mostafa@fit.com',
      weightKg: 85,
      targetWeightKg: 78,
      heightCm: 182,
      goal: 'Hypertrophy / Muscle Gain',
      phone: '+201012345678'
    });
    expect(valid.success).toBe(true);

    // Invalid payload: negative weight, invalid email
    const invalid = clientService.validateCreate({
      name: '',
      email: 'not-an-email',
      weightKg: -10,
      targetWeightKg: 0,
      heightCm: 50,
      goal: 'Invalid Goal'
    });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.errors.length).toBeGreaterThan(0);
    }
  });

  it('validates and sanitizes coach notes update with XSS defense', () => {
    const notePayload = {
      clientId: 'c100',
      privateCoachNotes: '<script>alert("hacked")</script>Client needs to increase protein intake.'
    };
    const res = clientService.validateNoteUpdate(notePayload);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.privateCoachNotes).not.toContain('<script>');
      expect(res.data.privateCoachNotes).toContain('Client needs to increase protein intake.');
    }
  });
});
