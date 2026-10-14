/**
 * @file ClientFilterSheet.jsx
 * @description نافذة فرز وفلترة المتدربين للموبايل والتابلت (Bottom Sheet Modal)
 * تتيح للكوتش اختيار معيار الترتيب والفلترة حسب الخطة التدريبية، وتغلق تلقائياً بزر Escape.
 */

import React from 'react';
import { SlidersHorizontal, ArrowUpDown, RotateCcw, X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export function ClientFilterSheet({
  isOpen,
  onClose,
  sortBy,
  setSortBy,
  planFilter,
  setPlanFilter,
  plans,
  onReset
}) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md gym-card-elevated rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[var(--card-border)] overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* مؤشر السحب لشاشات اللمس */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* رأس النافذة */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--card-border)] shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[var(--main-color)]" />
            <h2 className="text-sm font-semibold text-white">Sort & Filter</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* محتوى الفلاتر */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {/* قسم الترتيب (Sort) */}
          <div>
            <label className="gym-label-mono text-slate-400 text-xs mb-2 flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-[var(--main-color)]" />
              Sort By
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { id: 'name', label: 'Athlete Name' },
                { id: 'weight', label: 'Body Weight' },
                { id: 'adherence', label: 'Workout Progress' }
              ].map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium text-left flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--main-color)] bg-[var(--main-color)]/10 text-[var(--main-color)]'
                        : 'border-[var(--card-border)] bg-[var(--card-subtle-bg)] text-slate-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[var(--main-color)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* قسم فلترة الخطة التدريبية (Plan Filter) */}
          <div>
            <label className="gym-label-mono text-slate-400 text-xs mb-2 flex items-center gap-1.5">
              Workout Plan Filter
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
              <button
                type="button"
                onClick={() => setPlanFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  planFilter === 'all'
                    ? 'border-[var(--main-color)] bg-[var(--main-color)]/10 text-[var(--main-color)]'
                    : 'border-[var(--card-border)] bg-[var(--card-subtle-bg)] text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                All Plans
              </button>
              <button
                type="button"
                onClick={() => setPlanFilter('none')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  planFilter === 'none'
                    ? 'border-[var(--main-color)] bg-[var(--main-color)]/10 text-[var(--main-color)]'
                    : 'border-[var(--card-border)] bg-[var(--card-subtle-bg)] text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                No Plan
              </button>
              {(plans || []).map((p) => {
                const isSelected = planFilter === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanFilter(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer truncate max-w-[200px] ${
                      isSelected
                        ? 'border-[var(--main-color)] bg-[var(--main-color)]/10 text-[var(--main-color)]'
                        : 'border-[var(--card-border)] bg-[var(--card-subtle-bg)] text-slate-300 hover:text-white hover:border-white/20'
                    }`}
                    title={p.title}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات في الأسفل */}
        <div className="flex items-center gap-2 p-4 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)] shrink-0">
          <button
            type="button"
            onClick={onReset}
            disabled={sortBy === 'name' && planFilter === 'all'}
            className="gym-btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="gym-btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
