'use client';
import React from 'react';
import { RotateCcw, Trash2, Play } from 'lucide-react';
export const RestartWorkoutModal = ({ isOpen, activeDay, onClose, onDeleteAndRestart, onStartExtraSession }) => {
    if (!isOpen || !activeDay)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150" role="dialog" aria-modal="true" aria-label="Restart Workout Confirmation">
      <div className="w-full max-w-sm gym-card p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--gym-accent-primary)]/15 border border-[var(--gym-accent-primary)]/30 text-[var(--gym-accent-primary)] flex items-center justify-center mx-auto shadow-inner">
          <RotateCcw className="w-6 h-6 stroke-[2.5]"/>
        </div>

        <div>
          <h3 className="gym-heading-card">Restart Today&apos;s Workout?</h3>
          <p className="gym-subtext mt-1">
            You already have a logged session for today. How would you like to proceed?
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <button type="button" onClick={onDeleteAndRestart} className="gym-btn-primary w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2">
            <Trash2 className="w-3.5 h-3.5"/>
            <span>Delete Old Log & Start Fresh</span>
          </button>

          <button type="button" onClick={onStartExtraSession} className="gym-btn-secondary w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2">
            <Play className="w-3.5 h-3.5 fill-current text-[var(--gym-accent-primary)]"/>
            <span>Start Extra Session (Keep Old Log)</span>
          </button>

          <button type="button" onClick={onClose} className="gym-btn-ghost w-full py-2 text-xs font-bold pt-1">
            Cancel
          </button>
        </div>
      </div>
    </div>);
};
