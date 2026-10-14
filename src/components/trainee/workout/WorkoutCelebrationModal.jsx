/**
 * @file WorkoutCelebrationModal.jsx
 * @description نافذة الاحتفال بإنهاء التمرين (Workout Celebration & Summary Modal)
 * تعرض ملخص التمرين: مدة التمرين، الحجم الإجمالي بالكيلو، عدد المجموعات، وقائمة الأرقام القياسية (PRs).
 */

import React from 'react';
import { Award, Zap, Clock, RotateCcw, ArrowRight } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export function WorkoutCelebrationModal({
  isOpen,
  onClose,
  summary,
  dayName,
  onRestartWorkout
}) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen || !summary) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm gym-card-elevated rounded-3xl shadow-2xl border border-[var(--main-color)]/30 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* رأس الاحتفال */}
        <div className="p-6 text-center bg-gradient-to-b from-[var(--main-color)]/20 to-transparent border-b border-[var(--card-border)]">
          <div className="w-16 h-16 rounded-2xl bg-[var(--main-color)]/20 border border-[var(--main-color)]/40 text-[var(--main-color)] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[var(--main-color)]/30">
            <Award className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Workout Crushed!</h2>
          <p className="text-xs text-slate-300 mt-1 font-medium">{dayName} session complete.</p>
        </div>

        {/* شبكة الإحصائيات المنجزة */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
              <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <div className="text-xs font-mono font-bold text-white">{summary.duration}</div>
              <div className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Time</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
              <Zap className="w-4 h-4 text-[var(--main-color)] mx-auto mb-1" />
              <div className="text-xs font-mono font-bold text-white">{summary.totalVolume.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Volume kg</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
              <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-xs font-mono font-bold text-white">{summary.completedSetsCount}</div>
              <div className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Sets</div>
            </div>
          </div>

          {/* قائمة الأرقام القياسية المحققة */}
          {summary.prsAchieved && summary.prsAchieved.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Award className="w-3.5 h-3.5" />
                <span>New Personal Records!</span>
              </div>
              <div className="space-y-1">
                {summary.prsAchieved.map((pr, i) => (
                  <div key={i} className="text-[11px] text-slate-200 font-medium pl-5">
                    • {pr}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center gap-2 p-4 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)]">
          <button
            type="button"
            onClick={onRestartWorkout}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Restart session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="gym-btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[var(--main-color)]/25"
          >
            <span>Finish Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
