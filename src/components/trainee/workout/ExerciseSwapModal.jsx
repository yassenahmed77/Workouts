/**
 * @file ExerciseSwapModal.jsx
 * @description نافذة تبديل التمرين بتمرين بديل (Badeel Swap Modal)
 * تتيح للمتدرب تبديل تمرين الجهاز المشغول أو الصعب بتمرين بديل مع المحافظة على العضلة المستهدفة.
 */

import React from 'react';
import { X, Repeat, ArrowRight, ShieldCheck } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export function ExerciseSwapModal({
  isOpen,
  onClose,
  currentExercise,
  alternativeName,
  onConfirmSwap
}) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen || !currentExercise || !alternativeName) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm gym-card-elevated rounded-2xl shadow-2xl border border-[var(--card-border)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-[var(--main-color)]" />
            <h3 className="text-sm font-semibold text-white">Swap Exercise (Badeel)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <p className="text-slate-300">
            Is the machine occupied or need a variation? Swap directly to the coach-prescribed alternative:
          </p>

          <div className="p-3 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span>Current</span>
              <span className="text-rose-400 line-through">{currentExercise.exerciseName}</span>
            </div>
            <div className="flex items-center justify-between text-white font-semibold text-xs">
              <span className="text-[var(--main-color)] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Alternative
              </span>
              <span className="text-[var(--main-color)]">{alternativeName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)]">
          <button
            type="button"
            onClick={onClose}
            className="gym-btn-secondary flex-1 py-2 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmSwap();
              onClose();
            }}
            className="gym-btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <span>Swap Movement</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
