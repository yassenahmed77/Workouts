'use client';

import React, { useEffect } from 'react';
import { UserHabit } from '@/lib/habitsEngine';
import { RotateCcw } from 'lucide-react';

interface RelapseReflectionModalProps {
  habit: UserHabit | null;
  onClose: () => void;
  relapseNote: string;
  setRelapseNote: (note: string) => void;
  onConfirmRelapse: () => void;
}

export const RelapseReflectionModal: React.FC<RelapseReflectionModalProps> = ({
  habit,
  onClose,
  relapseNote,
  setRelapseNote,
  onConfirmRelapse
}) => {
  // Modal Resilience Standard (Rule 6.3): Escape key dismissal
  useEffect(() => {
    if (!habit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [habit, onClose]);

  if (!habit) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-md bg-[#18191e] border border-[#24262e] rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 space-y-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <RotateCcw className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            Relapse Reflection
          </span>
          <h2 className="text-lg font-extrabold text-white tracking-tight mt-2">
            Restart Clean Streak
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Slips are data points, not defeats. Acknowledge what happened and restart your clock right now.
          </p>
        </div>

        <div className="text-left space-y-1.5">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            What triggered this slip? (Optional reflection)
          </label>
          <textarea
            rows={2}
            value={relapseNote}
            onChange={(e) => setRelapseNote(e.target.value)}
            placeholder="e.g. High work stress, peer pressure at outing..."
            className="w-full p-3 rounded-2xl bg-[#141519] border border-[#24262e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Keep Current Streak
          </button>
          <button
            type="button"
            onClick={onConfirmRelapse}
            className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black tracking-wide cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            Reset Clock & Restart
          </button>
        </div>
      </div>
    </div>
  );
};
