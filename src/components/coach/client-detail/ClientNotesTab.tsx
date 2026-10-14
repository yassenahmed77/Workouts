'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';

interface ClientNotesTabProps {
  client: User;
}

export const ClientNotesTab: React.FC<ClientNotesTabProps> = ({ client }) => {
  const { updateUserNotes } = useGym();
  const { showToast } = useToast();

  const [notes, setNotes] = useState(client.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateUserNotes(client.id, notes);
    setIsSaving(false);
    showToast('Coaching notes saved', 'success');
  };

  return (
    <div className="flex flex-col h-full space-y-2 select-none">
      <div className="gym-card space-y-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--gym-border-subtle)] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="gym-label-mono text-[var(--gym-text-muted)]">
                Private Coaching Record
              </span>
              <span className="text-[var(--gym-border-base)] text-xs">&bull;</span>
              <span className="gym-label-mono text-[var(--gym-text-secondary)]">
                Visible only to coach
              </span>
            </div>
            <h3 className="gym-heading-card mt-0.5">
              Athlete Strategy &amp; Medical Notes
            </h3>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="gym-btn-primary text-xs"
          >
            <span>{isSaving ? 'Saving...' : 'Save Notes'}</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record confidential athlete directives: past shoulder impingement, lower back limitations, dietary allergies, periodization goals, cues..."
            className="w-full flex-1 p-3 rounded-lg bg-[var(--gym-surface-base)] border border-[var(--gym-border-base)] text-xs text-white placeholder-[var(--gym-text-muted)] focus:outline-none focus:border-[var(--gym-accent-primary)] resize-none font-sans leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
