import { describe, it, expect } from 'vitest';
import { clientService } from '@/services/clientService';
describe('clientService — Domain Logic & Zod Contracts', () => {
    it('derives safe avatar initials from diverse name formats', () => {
        expect(clientService.getInitials('John Doe')).toBe('JD');
        expect(clientService.getInitials('Tamer')).toBe('TA');
        expect(clientService.getInitials('Mohamed Ali Hassan')).toBe('MH');
        expect(clientService.getInitials('')).toBe('AT');
        expect(clientService.getInitials(undefined)).toBe('AT');
    });
    it('accurately evaluates athlete lifecycle status', () => {
        const baseClient = {
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
        const withPlan = { ...baseClient, assignedPlanId: 'p1' };
        expect(clientService.getClientStatus(withPlan).status).toBe('needs_diet');
        // All set (has both plan and diet)
        const withBoth = { ...baseClient, assignedPlanId: 'p1', assignedDietPlanId: 'd1' };
        expect(clientService.getClientStatus(withBoth).status).toBe('active');
        // On hold overrides assignments
        const onHold = { ...withBoth, status: 'on_hold' };
        expect(clientService.getClientStatus(onHold).status).toBe('on_hold');
    });
    it('calculates dynamic subscription expiration lifecycle based on real dates', () => {
        const today = new Date();
        // Expired: date in the past
        const pastDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const expiredSub = {
            planType: 'Full VIP Coaching',
            durationMonths: 1,
            startDate: '2026-01-01',
            endDate: pastDate,
            status: 'expired'
        };
        expect(clientService.calculateSubscriptionStatus(expiredSub)).toBe('expired');
        // Expiring soon: within 5 days
        const soonDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const soonSub = {
            planType: 'Full VIP Coaching',
            durationMonths: 1,
            startDate: '2026-01-01',
            endDate: soonDate,
            status: 'active'
        };
        expect(clientService.calculateSubscriptionStatus(soonSub)).toBe('expiring_soon');
        // Active: 30 days in future
        const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const activeSub = {
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
    it('validates target weight vs athlete goal consistency', () => {
        // Fat Loss: Target cannot be higher than current
        const invalidFatLoss = clientService.validateGoalWeight('Fat Loss & Conditioning', 80, 85);
        expect(invalidFatLoss.isValid).toBe(false);
        expect(invalidFatLoss.error).toContain('Target weight must be ≤ current weight');
        const validFatLoss = clientService.validateGoalWeight('Fat Loss & Conditioning', 80, 75);
        expect(validFatLoss.isValid).toBe(true);
        expect(validFatLoss.trend).toBe('loss');
        expect(validFatLoss.deltaKg).toBe(-5);
        // Hypertrophy: Target cannot be lower than current
        const invalidGain = clientService.validateGoalWeight('Hypertrophy / Muscle Gain', 75, 70);
        expect(invalidGain.isValid).toBe(false);
        expect(invalidGain.error).toContain('Target weight must be ≥ current weight');
        const validGain = clientService.validateGoalWeight('Hypertrophy / Muscle Gain', 75, 80);
        expect(validGain.isValid).toBe(true);
        expect(validGain.trend).toBe('gain');
        expect(validGain.deltaKg).toBe(5);
    });
    it('detects existing athlete duplicate by email or phone normalization', () => {
        const mockUsers = [
            {
                id: 'u1',
                name: 'Ahmed Hassan',
                email: 'ahmed@fit.com',
                phone: '+20 101 234 5678',
                role: 'trainee',
                avatarText: 'AH',
                status: 'active',
                joinedDate: '2026-10-01',
                weightKg: 80,
                targetWeightKg: 85,
                heightCm: 175,
                goal: 'Hypertrophy / Muscle Gain'
            }
        ];
        // Match by email
        expect(clientService.findExistingAthlete(mockUsers, 'AHMED@FIT.COM')).not.toBeNull();
        expect(clientService.findExistingAthlete(mockUsers, 'AHMED@FIT.COM')?.id).toBe('u1');
        // Match by phone with different formatting
        expect(clientService.findExistingAthlete(mockUsers, undefined, '01012345678')).not.toBeNull();
        expect(clientService.findExistingAthlete(mockUsers, undefined, '+201012345678')?.id).toBe('u1');
        // No match
        expect(clientService.findExistingAthlete(mockUsers, 'other@fit.com', '01199999999')).toBeNull();
    });
});
