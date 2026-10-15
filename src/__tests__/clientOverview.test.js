import { describe, it, expect, vi } from 'vitest';
// Mock getSavedWeightLogs to isolate testing of logic
vi.mock('@/lib/weightEngine', () => ({
    getSavedWeightLogs: vi.fn(() => [])
}));
import { useClientOverview } from '@/hooks/useClientOverview';
import { renderHook, act } from '@testing-library/react';
// Minimal trainee mock for fresh registration (0 data)
const freshClient = {
    id: 'client-new-001',
    name: 'Ahmed Fresh',
    email: 'ahmed@fresh.com',
    role: 'trainee',
    avatarText: 'AF',
    status: 'active',
    joinedDate: '2026-10-01',
    weightKg: 85.5,
    targetWeightKg: 78.0,
    heightCm: 180,
    goal: 'Fat Loss & Conditioning'
};
describe('useClientOverview Headless Hook — Zero-Data & Defensive Resilience', () => {
    it('handles brand new client with 0 logs gracefully with zero NaN or crashes', () => {
        const { result } = renderHook(() => useClientOverview(freshClient, [], [], null));
        // 1. Weight Trajectory zero-state check
        expect(result.current.hasWeighIns).toBe(false);
        expect(result.current.allWeightEntries).toHaveLength(0);
        expect(result.current.overallWeightStats.startingWeight).toBe(85.5);
        expect(result.current.overallWeightStats.latestWeight).toBe(85.5);
        expect(result.current.overallWeightStats.totalDropped).toBe(0);
        expect(Number.isNaN(result.current.overallWeightStats.totalDropped)).toBe(false);
        // 2. Trajectory SVG zero-state check
        expect(result.current.trajectorySvgData.points).toHaveLength(0);
        expect(result.current.trajectorySvgData.svgPath).toBe('');
        // 3. Strength Overload zero-state check
        expect(result.current.analyzedCoreLifts).toHaveLength(0);
        expect(result.current.overloadDiagnosticSummary.summaryText).toBe('Awaiting Session Logs');
        expect(result.current.overloadDiagnosticSummary.strengthIndex).toBe('0 Sessions');
        // 4. Attendance zero-state check
        expect(result.current.weekAttendance.completedCount).toBe(0);
        expect(result.current.weekAttendance.percentage).toBe(0);
        // 5. Subscription zero-state check
        expect(result.current.subscriptionInfo.hasSubscription).toBe(false);
        expect(result.current.subscriptionInfo.statusText).toBe('No Membership');
    });
    it('correctly calculates subscription days and remaining percentage when active', () => {
        const clientWithSub = {
            ...freshClient,
            subscription: {
                planType: 'Full VIP Coaching',
                durationMonths: 3,
                startDate: '2026-09-01',
                endDate: '2026-12-01',
                price: 3500,
                currency: 'EGP',
                status: 'active'
            }
        };
        const { result } = renderHook(() => useClientOverview(clientWithSub, [], [], null));
        expect(result.current.subscriptionInfo.hasSubscription).toBe(true);
        expect(result.current.subscriptionInfo.name).toBe('Full VIP Coaching');
        expect(result.current.subscriptionInfo.totalDays).toBeGreaterThan(80);
        expect(Number.isNaN(result.current.subscriptionInfo.remainingPct)).toBe(false);
    });

    it('correctly manages Egyptian gym week cycle (Sat-Fri) and calendar date shifting', () => {
        const { result } = renderHook(() => useClientOverview(freshClient, [], [], { daysPerWeek: 4 }));
        
        // 1. Initial active cycle is current week
        expect(result.current.weekOffset).toBe(0);
        expect(result.current.weekAttendance.isCurrentWeek).toBe(true);
        expect(result.current.weekAttendance.isPastWeek).toBe(false);
        expect(result.current.weekAttendance.days).toHaveLength(7);
        expect(result.current.weekAttendance.days[0].dayName).toBe('Sat');
        expect(result.current.weekAttendance.days[6].dayName).toBe('Fri');

        // 2. Select a past date (e.g. 14 days ago) via calendar
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const y = twoWeeksAgo.getFullYear();
        const m = String(twoWeeksAgo.getMonth() + 1).padStart(2, '0');
        const d = String(twoWeeksAgo.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        act(() => {
            result.current.selectDateFromCalendar(dateStr);
        });
        // After selecting two weeks ago, weekOffset should be negative and isPastWeek true
        expect(result.current.weekOffset).toBeLessThan(0);
        expect(result.current.weekAttendance.isPastWeek).toBe(true);
    });
});
