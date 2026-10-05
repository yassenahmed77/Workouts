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
      <div className="p-3 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.05] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Private Coaching Record
              </span>
              <span className="text-slate-600 text-xs">&bull;</span>
              <span className="text-[10px] font-mono text-slate-500">
                Visible only to coach
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-0.5">
              Athlete Strategy &amp; Medical Notes
            </h3>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
          >
            <span>{isSaving ? 'Saving...' : 'Save Notes'}</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record confidential athlete directives: past shoulder impingement, lower back limitations, dietary allergies, periodization goals, cues..."
            className="w-full flex-1 p-3 rounded-lg bg-[#05080e] border border-white/[0.04] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/20 resize-none font-sans leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
