'use client';
import React, { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export const RelapseReflectionModal = ({ habit, onClose, relapseNote, setRelapseNote, onConfirmRelapse }) => {
    // Modal Resilience Standard: Escape key dismissal
    useEscapeKey(Boolean(habit), onClose);

    if (!habit)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150" onClick={(e) => {
            if (e.target === e.currentTarget)
                onClose();
        }}>
      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-2xl bg-[var(--main-color)]/10 border border-[var(--main-color)]/25 text-[var(--main-color)] flex items-center justify-center mx-auto">
          <RotateCcw className="w-6 h-6 stroke-[2.5]"/>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--main-color)] font-bold px-2.5 py-0.5 rounded-full bg-[var(--main-color)]/10 border border-[var(--main-color)]/25">
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
          <textarea rows={2} value={relapseNote} onChange={(e) => setRelapseNote(e.target.value)} placeholder="e.g. High work stress, peer pressure at outing..." className="w-full p-3 rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--main-color)] resize-none"/>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button type="button" onClick={onClose} className="py-3 px-4 rounded-2xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.04] border border-[var(--card-border)] text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer">
            Keep Current Streak
          </button>
          <button type="button" onClick={onConfirmRelapse} className="gym-btn-primary py-3 px-4 rounded-2xl text-xs font-black tracking-wide">
            Reset Clock & Restart
          </button>
        </div>
      </div>
    </div>);
};
