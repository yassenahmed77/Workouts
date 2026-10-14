/**
 * @file LiveExerciseCard.jsx
 * @description كارت التمرين المباشر مع تسجيل المجموعات والأوزان والتكرارات (Live Exercise Card)
 * يدعم: إدخال الوزن والتكرار، التحقق من الأرقام القياسية PR، تبديل التمرين البديل (Badeel)، وإضافة/حذف مجموعات.
 */

import React from 'react';
import { 
  Check, 
  Trash2, 
  Repeat, 
  Video, 
  Info, 
  Plus, 
  Minus, 
  Award 
} from 'lucide-react';
import { sanitizeUrl } from '@/lib/sanitizer';
import { checkLiveSetPR } from '@/lib/progressEngine';

export function LiveExerciseCard({
  exerciseIndex,
  routineEx,
  logEntry,
  previousSets,
  pastLogs,
  onWeightChange,
  onRepsChange,
  onToggleSet,
  onAddSet,
  onRemoveSet,
  onSwapBadeel,
  onRemoveExercise
}) {
  const safeVideoUrl = sanitizeUrl(routineEx.videoUrl);
  const hasGuide = Boolean(safeVideoUrl);
  const altName = routineEx.alternativeExercise;
  const hasAlt = Boolean(altName);
  const hasBar = hasGuide || hasAlt;

  return (
    <div className="relative p-4 sm:p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl space-y-3 overflow-hidden">
      {/* شريط الإضاءة الأزرق الجانبي */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[var(--main-color)] rounded-l-3xl shadow-[0_0_12px_var(--main-color)]" />

      {/* رأس التمرين */}
      <div className="relative flex items-center justify-center min-h-[42px] px-10">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-[var(--main-color)] font-mono text-xs font-black flex items-center justify-center flex-shrink-0 shadow-inner">
          {exerciseIndex + 1}
        </div>

        <div className="flex flex-col items-center justify-center text-center min-w-0 max-w-full">
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug truncate max-w-full">
            {routineEx.exerciseName}
          </h3>
          <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[11px] font-mono text-zinc-400">
            <span className="text-[var(--main-color)] font-semibold">
              {routineEx.sets} Sets × {routineEx.targetReps} Reps
            </span>
            {routineEx.targetRpe && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">{routineEx.targetRpe}</span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemoveExercise(exerciseIndex)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-[var(--card-subtle-bg)] transition-colors cursor-pointer flex-shrink-0"
          title="Remove exercise from workout"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* شريط الأدوات: تمرين بديل (Badeel) وفيديو الشرح */}
      {hasBar && (
        <div className="flex items-center gap-2 pt-0.5">
          {hasAlt && (
            <button
              type="button"
              onClick={() => onSwapBadeel(exerciseIndex)}
              className="flex-1 h-8 px-3 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-[var(--card-bg-hover)] hover:border-[var(--main-color)]/40 text-zinc-200 hover:text-white border border-[var(--card-border)] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center whitespace-nowrap min-w-0 active:scale-[0.99]"
              title={`Swap to ${altName}`}
            >
              <Repeat className="w-3.5 h-3.5 text-[var(--main-color)] flex-shrink-0" />
              <span className="truncate">{altName}</span>
            </button>
          )}

          {hasGuide && (
            <a
              href={safeVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`h-8 px-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-[var(--card-bg-hover)] text-[var(--main-color)] border border-[var(--card-border)] text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap active:scale-[0.99] ${
                hasAlt ? 'flex-shrink-0' : 'flex-1'
              }`}
              title="Watch Exercise Video Guide"
            >
              <Video className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{hasAlt ? 'Video' : 'Video Guide'}</span>
            </a>
          )}
        </div>
      )}

      {/* ملاحظات التكنيك */}
      {routineEx.notes && (
        <div className="px-3 py-2 rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-xs text-zinc-300 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[var(--main-color)] flex-shrink-0 mt-0.5" />
          <p className="leading-snug text-zinc-300">{routineEx.notes}</p>
        </div>
      )}

      {/* جدول تسجيل المجموعات */}
      <div className="space-y-2">
        <div className="grid grid-cols-[24px_1fr_1fr_36px] items-center gap-2 px-1 text-[9px] font-mono uppercase font-bold text-zinc-500 text-center">
          <span>#</span>
          <span>KG</span>
          <span>REPS</span>
          <Check className="w-3 h-3 mx-auto" />
        </div>

        {logEntry?.sets.map((set, sIdx) => {
          const prCheck = checkLiveSetPR(routineEx.exerciseName, set.weightKg, set.reps, pastLogs);
          const prevSet = previousSets && previousSets[sIdx];

          return (
            <div
              key={sIdx}
              className={`grid grid-cols-[24px_1fr_1fr_36px] items-center gap-2 p-1.5 rounded-2xl border transition-all ${
                set.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)]'
              }`}
            >
              <span className="font-mono text-xs font-bold text-zinc-400 text-center">
                {sIdx + 1}
              </span>

              {/* حقل الوزن */}
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={set.weightKg || ''}
                  onChange={(e) => onWeightChange(exerciseIndex, sIdx, e.target.value)}
                  placeholder={prevSet ? String(prevSet.weightKg) : '0'}
                  className="w-full text-center font-numeric font-bold text-sm bg-black/30 border border-white/10 rounded-xl py-1 text-white focus:outline-none focus:border-[var(--main-color)]"
                />
                {prCheck.isNewPR && (
                  <span className="absolute -top-2 right-1 flex items-center gap-0.5 text-[8.5px] font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 rounded px-1">
                    <Award className="w-2.5 h-2.5" /> PR
                  </span>
                )}
              </div>

              {/* حقل التكرارات */}
              <input
                type="number"
                inputMode="numeric"
                value={set.reps || ''}
                onChange={(e) => onRepsChange(exerciseIndex, sIdx, e.target.value)}
                placeholder={prevSet ? String(prevSet.reps) : '0'}
                className="w-full text-center font-numeric font-bold text-sm bg-black/30 border border-white/10 rounded-xl py-1 text-white focus:outline-none focus:border-[var(--main-color)]"
              />

              {/* زر إتمام المجموعة */}
              <button
                type="button"
                onClick={() => onToggleSet(exerciseIndex, sIdx)}
                className={`w-9 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  set.completed
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30'
                    : 'bg-white/10 text-zinc-400 hover:text-white hover:bg-white/20'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          );
        })}
      </div>

      {/* أزرار إضافة / حذف مجموعة */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={() => onAddSet(exerciseIndex)}
          className="text-[var(--main-color)] hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-white/[0.04] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Set</span>
        </button>

        {logEntry?.sets?.length > 1 && (
          <button
            type="button"
            onClick={() => onRemoveSet(exerciseIndex)}
            className="text-zinc-500 hover:text-rose-400 text-xs font-medium flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Remove Set</span>
          </button>
        )}
      </div>
    </div>
  );
}
