import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientCheckInsTab } from '@/components/coach/client-detail/ClientCheckInsTab';
import { RequestCheckInModal } from '@/components/coach/client-detail/modals/RequestCheckInModal';
import { ToastProvider } from '@/context/ToastContext';
import * as GymContextModule from '@/context/GymContext';

vi.mock('@/context/GymContext', () => ({
  useGym: vi.fn()
}));

describe('ClientCheckInsTab & RequestCheckInModal Component Suite', () => {
  const mockSaveCheckInFeedback = vi.fn().mockResolvedValue({});
  const mockUpdateUserProfile = vi.fn().mockResolvedValue({});
  const mockGetCheckInsForUser = vi.fn();

  const mockClient = {
    id: 'trainee-1',
    name: 'Karim Adel',
    phone: '01012345678',
    checkInPreferredDay: 'friday',
    startWeight: 85.0,
    weightKg: 82.4,
    pendingCheckInRequest: null
  };

  const sampleCheckIns = [
    {
      id: 'chk-1',
      userId: 'trainee-1',
      date: '2026-10-16',
      weightKg: 82.4,
      energyRating: 5,
      sleepQuality: 4,
      hungerRating: 3,
      reviewed: false,
      reviewedAt: null,
      coachFeedback: '',
      traineeNotes: 'Felt very energized this week.',
      photos: [
        { id: 'p1', angle: 'front', url: 'https://example.com/front.jpg' },
        { id: 'p2', angle: 'side', url: 'https://example.com/side.jpg' },
        { id: 'p3', angle: 'back', url: 'https://example.com/back.jpg' }
      ],
      measurements: {
        waistCm: 81,
        chestCm: 104,
        armsCm: 38,
        hipsCm: 96
      },
      inBody: {
        bodyFatPct: 14.8,
        muscleMassKg: 38.2,
        waterPct: 59.4,
        visceralFat: 6
      }
    },
    {
      id: 'chk-2',
      userId: 'trainee-1',
      date: '2026-10-09',
      weightKg: 83.2,
      energyRating: 4,
      sleepQuality: 4,
      hungerRating: 4,
      reviewed: true,
      reviewedAt: '2026-10-09',
      coachFeedback: 'Solid start, continue deficit.',
      traineeNotes: 'Initial check-in',
      photos: [
        { id: 'p4', angle: 'front', url: 'https://example.com/front2.jpg' }
      ],
      measurements: {
        waistCm: 82.5,
        chestCm: 104,
        armsCm: 37.8,
        hipsCm: 96.5
      },
      inBody: {
        bodyFatPct: 15.4,
        muscleMassKg: 37.9,
        waterPct: 58.8,
        visceralFat: 7
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    GymContextModule.useGym.mockReturnValue({
      getCheckInsForUser: mockGetCheckInsForUser,
      saveCheckInFeedback: mockSaveCheckInFeedback,
      updateUserProfile: mockUpdateUserProfile
    });
  });

  it('renders high-end empty state when client has no check-ins', () => {
    mockGetCheckInsForUser.mockReturnValue([]);

    render(
      <ToastProvider>
        <ClientCheckInsTab client={mockClient} />
      </ToastProvider>
    );

    expect(screen.getByText('No Check-Ins Submitted Yet')).toBeDefined();
    expect(screen.getByText('Request First Check-In Now')).toBeDefined();
    expect(screen.getByText('Weekly Cadence')).toBeDefined();
  });

  it('renders active check-in cockpit with weight deltas, bio feedback, and photos', () => {
    mockGetCheckInsForUser.mockReturnValue(sampleCheckIns);

    render(
      <ToastProvider>
        <ClientCheckInsTab client={mockClient} />
      </ToastProvider>
    );

    // Filter bar & Request action
    expect(screen.getByText(/Needs Review \(1\)/i)).toBeDefined();
    expect(screen.getByText('Request Check-In')).toBeDefined();

    // Active Check-in Details
    expect(screen.getAllByText('82.4 kg').length).toBeGreaterThan(0);
    expect(screen.getByText('"Felt very energized this week."')).toBeDefined();
    expect(screen.getByText('5/5')).toBeDefined(); // Energy rating
    expect(screen.getByText('Save & Mark Reviewed ✓')).toBeDefined();
  });

  it('filters check-ins by Needs Review and Reviewed', () => {
    mockGetCheckInsForUser.mockReturnValue(sampleCheckIns);

    render(
      <ToastProvider>
        <ClientCheckInsTab client={mockClient} />
      </ToastProvider>
    );

    // Filter by Needs Review
    const needsReviewButton = screen.getByText(/Needs Review \(1\)/i);
    fireEvent.click(needsReviewButton);

    // Filter by Reviewed
    const reviewedButton = screen.getByText(/Reviewed \(1\)/i);
    fireEvent.click(reviewedButton);

    // Active check-in switches to the reviewed one
    expect(screen.getByText('Solid start, continue deficit.')).toBeDefined();
  });

  it('handles feedback input and saves review via saveCheckInFeedback', async () => {
    mockGetCheckInsForUser.mockReturnValue(sampleCheckIns);

    render(
      <ToastProvider>
        <ClientCheckInsTab client={mockClient} />
      </ToastProvider>
    );

    const textarea = screen.getByPlaceholderText(/Write technical review, nutrition changes/i);
    fireEvent.change(textarea, { target: { value: 'Great waist drop, keep hydration high!' } });

    const saveButton = screen.getByText('Save & Mark Reviewed ✓');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveCheckInFeedback).toHaveBeenCalledWith('chk-1', 'Great waist drop, keep hydration high!');
    });
  });

  it('opens RequestCheckInModal and dispatches an on-demand check-in request', async () => {
    mockGetCheckInsForUser.mockReturnValue(sampleCheckIns);

    render(
      <ToastProvider>
        <ClientCheckInsTab client={mockClient} />
      </ToastProvider>
    );

    // Click [+ Request Check-In] button in header
    const requestButtons = screen.getAllByRole('button', { name: /Request Check-In/i });
    fireEvent.click(requestButtons[0]);

    // Modal is now open
    expect(screen.getByText('Request Athlete Check-In')).toBeDefined();
    expect(screen.getByText('Required Scope')).toBeDefined();

    // Fill notes directive
    const notesInput = screen.getByPlaceholderText(/Weigh in morning fasted/i);
    fireEvent.change(notesInput, { target: { value: 'Strict morning weigh-in' } });

    // Submit request
    const sendButton = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith(
        'trainee-1',
        expect.objectContaining({
          pendingCheckInRequest: expect.objectContaining({
            status: 'pending',
            notes: 'Strict morning weigh-in'
          })
        })
      );
    });
  });

  it('displays disabled "Reviewed ✓" button when check-in is already reviewed and unedited, and transforms to "Update Feedback ✓" when edited', async () => {
    mockGetCheckInsForUser.mockReturnValue(sampleCheckIns);

    render(
      <ToastProvider>
        <ClientCheckInsTab client={mockClient} />
      </ToastProvider>
    );

    // Switch to reviewed check-in (chk-2)
    const reviewedFilterButton = screen.getByText(/Reviewed \(1\)/i);
    fireEvent.click(reviewedFilterButton);

    // Button should show "Reviewed ✓" and be disabled (preventing redundant requests)
    const reviewedButton = screen.getByRole('button', { name: /Reviewed ✓/i });
    expect(reviewedButton.disabled).toBe(true);

    // Edit feedback
    const textarea = screen.getByPlaceholderText(/Write technical review, nutrition changes/i);
    fireEvent.change(textarea, { target: { value: 'Updated: increase steps to 12k.' } });

    // Button should now be enabled and say "Update Feedback ✓"
    const updateButton = screen.getByRole('button', { name: /Update Feedback ✓/i });
    expect(updateButton.disabled).toBe(false);

    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockSaveCheckInFeedback).toHaveBeenCalledWith('chk-2', 'Updated: increase steps to 12k.');
    });
  });

  it('auto-saves feedback when coach dispatches via WhatsApp without manually clicking save', async () => {
    mockGetCheckInsForUser.mockReturnValue(sampleCheckIns);
    window.open = vi.fn();

    render(
      <ToastProvider>
        <ClientCheckInsTab client={mockClient} />
      </ToastProvider>
    );

    // Type notes on unreviewed check-in (chk-1)
    const textarea = screen.getByPlaceholderText(/Write technical review, nutrition changes/i);
    fireEvent.change(textarea, { target: { value: 'Auto-save this note via WhatsApp!' } });

    // Click WhatsApp
    const waButton = screen.getByRole('button', { name: /WhatsApp/i });
    fireEvent.click(waButton);

    await waitFor(() => {
      expect(mockSaveCheckInFeedback).toHaveBeenCalledWith('chk-1', 'Auto-save this note via WhatsApp!');
      expect(window.open).toHaveBeenCalled();
    });
  });

  it('renders InBody scan telemetry (Body Fat, Muscle Mass, Water, Visceral) instead of tape measurements', () => {
    mockGetCheckInsForUser.mockReturnValue(sampleCheckIns);

    render(
      <ToastProvider>
        <ClientCheckInsTab client={mockClient} />
      </ToastProvider>
    );

    // InBody title and cards should be rendered
    expect(screen.getByText('InBody Scan Telemetry')).toBeDefined();
    expect(screen.getByText('Body Fat')).toBeDefined();
    expect(screen.getByText('14.8')).toBeDefined();
    expect(screen.getByText('Muscle Mass')).toBeDefined();
    expect(screen.getByText('38.2')).toBeDefined();
    expect(screen.getByText('Water %')).toBeDefined();
    expect(screen.getByText('59.4')).toBeDefined();
    expect(screen.getByText('Visceral')).toBeDefined();
    expect(screen.getByText('6')).toBeDefined();

    // Verify deltas vs previous check-in (14.8 vs 15.4 => -0.6%, 38.2 vs 37.9 => +0.3 kg)
    expect(screen.getByText('-0.6%')).toBeDefined();
    expect(screen.getByText('+0.3 kg')).toBeDefined();

    // Tape should NOT be present
    expect(screen.queryByText('Tape Circumference (cm)')).toBeNull();
  });

  it('opens WeeklyCadenceModal when clicking on the cadence pill and updates preferred check-in day', async () => {
    mockGetCheckInsForUser.mockReturnValue(sampleCheckIns);

    render(
      <ToastProvider>
        <ClientCheckInsTab client={mockClient} />
      </ToastProvider>
    );

    // Find cadence buttons (desktop or mobile)
    const cadenceButtons = screen.getAllByTitle(/Weekly.*check-in day/i);
    expect(cadenceButtons.length).toBeGreaterThan(0);

    // Click the cadence trigger
    fireEvent.click(cadenceButtons[0]);

    // WeeklyCadenceModal should appear
    expect(screen.getByText('Weekly Check-In Day')).toBeDefined();
    expect(screen.getByText('Cadence Protocol')).toBeDefined();

    // Select Sunday
    const sundayBtn = screen.getByRole('button', { name: /Sunday/i });
    fireEvent.click(sundayBtn);

    // Save schedule
    const saveBtn = screen.getByRole('button', { name: /Save Schedule/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith('trainee-1', {
        checkInPreferredDay: 'sunday'
      });
    });
  });
});
