import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RequestDetailsInspector } from '@/components/coach/client-detail/RequestDetailsInspector';
import { TraineeCheckInBanner } from '@/components/trainee/dashboard/TraineeCheckInBanner';
import { ToastProvider } from '@/context/ToastContext';

const mockUpdateUserProfile = vi.fn().mockResolvedValue({});

vi.mock('@/context/GymContext', () => ({
  useGym: () => ({
    currentUser: {
      id: 'trainee-1',
      name: 'Sara Mohamed',
      pendingCheckInRequest: {
        status: 'pending',
        requestedAt: '2026-10-15',
        dueDate: '2026-10-18',
        scope: { weight: true, photos: true, inBody: true },
        notes: 'Fasted morning weigh-in and InBody scan.'
      }
    },
    updateUserProfile: mockUpdateUserProfile
  })
}));

describe('RequestDetailsInspector & TraineeCheckInBanner Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockClientWithPendingRequest = {
    id: 'trainee-1',
    name: 'Sara Mohamed',
    phone: '01012345678',
    lastCheckInDate: '2026-10-04',
    pendingCheckInRequest: {
      status: 'pending',
      requestedAt: '2026-10-15',
      seenAt: null,
      dueDate: '2026-10-18',
      scope: { weight: true, photos: true, inBody: true },
      notes: 'Fasted morning weigh-in and InBody scan.'
    }
  };

  it('renders RequestDetailsInspector with full Sent -> Seen -> Due timeline and scope pills', () => {
    render(
      <ToastProvider>
        <RequestDetailsInspector client={mockClientWithPendingRequest} onEditRequest={vi.fn()} />
      </ToastProvider>
    );

    // Header inspection
    expect(screen.getByText('Request Inspector')).toBeDefined();

    // Timeline nodes
    expect(screen.getByText('Sent')).toBeDefined();
    expect(screen.getByText('2026-10-15')).toBeDefined();
    expect(screen.getByText('Delivered')).toBeDefined();
    expect(screen.getByText('Awaiting read')).toBeDefined();
    expect(screen.getByText('Due')).toBeDefined();
    expect(screen.getByText('2026-10-18')).toBeDefined();

    // Scope pills
    expect(screen.getByText('Scale Weight')).toBeDefined();
    expect(screen.getByText('Physique Photos')).toBeDefined();
    expect(screen.getByText('InBody Scan')).toBeDefined();

    // Directives quote
    expect(screen.getByText('"Fasted morning weigh-in and InBody scan."')).toBeDefined();
  });

  it('handles Cancel Request action and clears pendingCheckInRequest', async () => {
    render(
      <ToastProvider>
        <RequestDetailsInspector client={mockClientWithPendingRequest} onEditRequest={vi.fn()} />
      </ToastProvider>
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith('trainee-1', {
        pendingCheckInRequest: null
      });
    });
  });

  it('dispatches WhatsApp reminder on demand', () => {
    window.open = vi.fn();

    render(
      <ToastProvider>
        <RequestDetailsInspector client={mockClientWithPendingRequest} onEditRequest={vi.fn()} />
      </ToastProvider>
    );

    const remindButton = screen.getByRole('button', { name: /Remind/i });
    fireEvent.click(remindButton);

    expect(window.open).toHaveBeenCalled();
  });

  it('supports multi-request scenarios with selector tabs and independent audits', () => {
    const multiRequestClient = {
      id: 'trainee-1',
      name: 'Karim Adel',
      pendingCheckInRequests: [
        {
          id: 'req-1',
          status: 'pending',
          requestedAt: '2026-10-15',
          dueDate: 'immediate',
          notes: 'First urgent check-in directive',
          scope: { weight: true, photos: true, measurements: true }
        },
        {
          id: 'req-2',
          status: 'pending',
          requestedAt: '2026-10-16',
          dueDate: '2026-10-22',
          notes: 'Second scheduled check-in directive',
          scope: { weight: true, photos: false, measurements: true }
        }
      ]
    };

    render(
      <ToastProvider>
        <RequestDetailsInspector client={multiRequestClient} onEditRequest={vi.fn()} />
      </ToastProvider>
    );

    // Multi-request tabs render
    expect(screen.getByText(/Active Requests \(2\)/i)).toBeDefined();
    expect(screen.getByText('Request #1')).toBeDefined();
    expect(screen.getByText('Request #2')).toBeDefined();

    // First request note is shown
    expect(screen.getByText('"First urgent check-in directive"')).toBeDefined();

    // Click tab 2
    fireEvent.click(screen.getByText('Request #2'));

    // Second request note is now visible
    expect(screen.getByText('"Second scheduled check-in directive"')).toBeDefined();
  });

  it('supports modal mode with backdrop dismissal and escape key closing', () => {
    const handleClose = vi.fn();

    render(
      <ToastProvider>
        <RequestDetailsInspector
          client={mockClientWithPendingRequest}
          isModal={true}
          isOpen={true}
          onClose={handleClose}
        />
      </ToastProvider>
    );

    // Close button exists in modal mode
    const closeBtn = screen.getByRole('button', { name: /Close Inspector/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Escape key press
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});

