import { describe, it, expect } from 'vitest';
import { checkInService } from '@/services/checkInService';

describe('checkInService — Protocol & Telemetry Engine (Clean Architecture)', () => {
  const mockClient = {
    id: 'u-athlete-1',
    name: 'Rawan Ahmed',
    weightKg: 67.8,
    startWeight: 69.5,
    checkInPreferredDay: 'friday'
  };

  const mockCheckIns = [
    {
      id: 'chk-latest',
      userId: 'u-athlete-1',
      date: '2026-10-10',
      weightKg: 67.8,
      reviewed: false, // Trainee submitted on their own, needs review!
      photos: [
        { id: 'p1', angle: 'front' },
        { id: 'p2', angle: 'side' }
      ],
      measurements: { waistCm: 74, hipsCm: 95 }
    },
    {
      id: 'chk-prev',
      userId: 'u-athlete-1',
      date: '2026-10-03',
      weightKg: 68.5,
      reviewed: true,
      photos: [{ id: 'p0', angle: 'front' }],
      measurements: { waistCm: 75, hipsCm: 96 }
    }
  ];

  it('detects trainee self-initiated / unreviewed submission and sets needs_review status', () => {
    const telemetry = checkInService.calculateCheckInTelemetry(mockClient, mockCheckIns, {
      referenceDate: '2026-10-12'
    });

    expect(telemetry.hasNewSubmission).toBe(true);
    expect(telemetry.unreviewedCount).toBe(1);
    expect(telemetry.status).toBe('needs_review');
    expect(telemetry.statusLabel).toBe('NEW SUBMISSION');
    expect(telemetry.pillClass).toContain('var(--main-color)');
    expect(telemetry.weightDelta).toBe(-0.7); // 67.8 - 68.5
    expect(telemetry.photosCount).toBe(2);
    expect(telemetry.hasMeasurements).toBe(true);
  });

  it('handles client with 0 check-ins safely without crashing or NaN (Saghra 1)', () => {
    const telemetry = checkInService.calculateCheckInTelemetry(mockClient, [], {
      referenceDate: '2026-10-12'
    });

    expect(telemetry.hasHistory).toBe(false);
    expect(telemetry.hasNewSubmission).toBe(false);
    expect(telemetry.currentWeight).toBe(67.8);
    expect(telemetry.weightDelta).toBe(0);
    expect(telemetry.photosCount).toBe(0);
    expect(telemetry.hasMeasurements).toBe(false);
    expect(telemetry.status).not.toBe('needs_review');
  });

  it('detects overdue status when > 7 days have passed since last audit and no unreviewed logs', () => {
    const reviewedCheckIns = mockCheckIns.map((c) => ({ ...c, reviewed: true }));
    const telemetry = checkInService.calculateCheckInTelemetry(mockClient, reviewedCheckIns, {
      referenceDate: '2026-10-25' // 15 days later!
    });

    expect(telemetry.status).toBe('overdue');
    expect(telemetry.statusLabel).toContain('OVERDUE');
    expect(telemetry.pillClass).toContain('text-rose-400');
  });

  it('detects pending on-demand coach request with highest priority when no unreviewed submissions', () => {
    const reviewedCheckIns = mockCheckIns.map((c) => ({ ...c, reviewed: true }));
    const clientWithRequest = {
      ...mockClient,
      pendingCheckInRequest: {
        id: 'req-99',
        status: 'pending',
        dueDate: 'immediate',
        notes: 'Need scale weight before refeed'
      }
    };

    const telemetry = checkInService.calculateCheckInTelemetry(clientWithRequest, reviewedCheckIns, {
      referenceDate: '2026-10-12'
    });

    expect(telemetry.status).toBe('pending_request');
    expect(telemetry.statusLabel).toBe('REQUEST PENDING');
    expect(telemetry.headline).toBe('Immediate Audit');
    expect(telemetry.subline).toBe('Need scale weight before refeed');
    expect(telemetry.pillClass).toContain('var(--main-color)');
  });

  it('calculates accurate next Friday schedule and days until due', () => {
    // 2026-10-12 is Monday. Next Friday is 2026-10-16 (+4 days)
    const nextDue = checkInService.calculateNextDueDate('friday', new Date('2026-10-12'));
    expect(nextDue.dayName).toBe('Friday');
    expect(nextDue.daysUntilDue).toBe(4);
    expect(nextDue.nextDueDateStr).toBe('2026-10-16');
  });
});
