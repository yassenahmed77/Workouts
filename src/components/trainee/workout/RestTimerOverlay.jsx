/**
 * @file RestTimerOverlay.jsx
 * @description شريط ونافذة عداد الراحة بين المجموعات (Rest Timer Countdown Bar)
 * يعرض الوقت المتبقي، زر إضافة 30 ثانية، وزر تخطي الراحة لبدء المجموعة التالية.
 */

import React from 'react';
import { Clock, Plus, ArrowRight, Volume2, VolumeX } from 'lucide-react';

export function RestTimerOverlay({
  restSecondsLeft,
  totalRestDuration,
  exerciseName,
  onAdd30s,
  onSkip,
  soundEnabled,
  onToggleSound
}) {
  if (restSecondsLeft === null) return null;

  const minutes = Math.floor(restSecondsLeft / 60);
  const seconds = restSecondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const progressPct = totalRestDuration > 0
    ? Math.max(0, Math.min(100, Math.round((restSecondsLeft / totalRestDuration) * 100)))
    : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-md border-t border-[var(--main-color)]/30 shadow-2xl p-3 sm:p-4 animate-in slide-in-from-bottom duration-200">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* معلومات التمرين الجاري والوقت */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[var(--main-color)]/10 border border-[var(--main-color)]/30 flex items-center justify-center text-[var(--main-color)] shrink-0 font-mono font-bold text-sm">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Rest Timer</span>
              {exerciseName && (
                <span className="text-xs text-white font-medium truncate max-w-[150px] sm:max-w-xs">
                  &bull; {exerciseName}
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight leading-none mt-0.5">
              {timeFormatted}
            </div>
          </div>
        </div>

        {/* أزرار التحكم: إضافة 30ث، تبديل الصوت، وتخطي */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Disable Beep Sound' : 'Enable Beep Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[var(--main-color)]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onAdd30s}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-xs font-mono font-semibold text-slate-200 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>30s</span>
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="gym-btn-primary py-1.5 px-3 sm:py-2 sm:px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ready</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* شريط التقدم التنازلي المباشر */}
      <div className="w-full h-1 bg-white/[0.08] mt-2.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--main-color)] transition-all duration-300 rounded-full shadow-[0_0_8px_var(--main-color-glow)]"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
