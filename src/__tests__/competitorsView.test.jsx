import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AddCompetitorModal } from '@/components/coach/competitors/AddCompetitorModal';
import { ToastProvider } from '@/context/ToastContext';

describe('AddCompetitorModal Component', () => {
  it('renders successfully within ToastProvider without throwing useToast reference errors', () => {
    const availableTrainees = [
      { id: 'athlete-1', name: 'Ziad Sherif', weightKg: 85, email: 'ziad@test.com' }
    ];

    render(
      <ToastProvider>
        <AddCompetitorModal
          isOpen={true}
          onClose={vi.fn()}
          availableTrainees={availableTrainees}
          onAddCompetitor={vi.fn()}
        />
      </ToastProvider>
    );

    expect(screen.getByText('Designate Stage Competitor')).toBeDefined();
    expect(screen.getByText('1. Select Athlete')).toBeDefined();
    expect(screen.getByText('Register Competitor')).toBeDefined();
  });

  it('does not render content when isOpen is false', () => {
    const { container } = render(
      <ToastProvider>
        <AddCompetitorModal
          isOpen={false}
          onClose={vi.fn()}
          availableTrainees={[]}
          onAddCompetitor={vi.fn()}
        />
      </ToastProvider>
    );

    expect(screen.queryByText('Designate Stage Competitor')).toBeNull();
  });
});
