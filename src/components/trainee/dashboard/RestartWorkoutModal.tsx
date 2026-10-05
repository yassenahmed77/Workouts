'use client';

import React from 'react';
import { WorkoutDay, WorkoutLog } from '@/types';
import { RotateCcw, Trash2, Play } from 'lucide-react';

interface RestartWorkoutModalProps {
  isOpen: boolean;
  activeDay?: WorkoutDay | null;
  todayWorkoutLog?: WorkoutLog | null;
  onClose: () => void;
  onDeleteAndRestart: () => Promise<void>;
  onStartExtraSession: () => void;
}

export const RestartWorkoutModal: React.FC<RestartWorkoutModalProps> = ({
  isOpen,
  activeDay,
  onClose,
  onDeleteAndRestart,
  onStartExtraSession
}) => {
  if (!isOpen || !activeDay) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Restart Workout Confirmation"
    >
      <div className="w-full max-w-sm bg-[#18191e] border border-[#24262e] rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#2f80ed]/15 border border-[#2f80ed]/30 text-[#2f80ed] flex items-center justify-center mx-auto shadow-inner">
          <RotateCcw className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-white">Restart Today&apos;s Workout?</h3>
          <p className="text-xs text-[#94a3b8] mt-1">
            You already have a logged session for today. How would you like to proceed?
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onDeleteAndRestart}
            className="w-full py-3 px-4 rounded-xl btn-electric-blue text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2f80ed]/25"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Old Log & Start Fresh</span>
          </button>

          <button
            type="button"
            onClick={onStartExtraSession}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1c1d22] hover:bg-[#22242b] border border-[#24262e] text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#2f80ed]" />
            <span>Start Extra Session (Keep Old Log)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-bold text-[#8e8e93] hover:text-white cursor-pointer pt-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
