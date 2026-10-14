/**
 * @file AddMovementModal.jsx
 * @description نافذة إضافة حركة إضافية إلى جلسة التمرين الحالية (Add Movement Modal)
 * تتيح للمتدرب البحث في مكتبة التمارين وإضافة تمرين جديد للجلسة الجارية.
 */

import React, { useState } from 'react';
import { X, Search, Plus, Dumbbell } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export function AddMovementModal({
  isOpen,
  onClose,
  exercises,
  onSelectExercise
}) {
  useEscapeKey(isOpen, onClose);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');

  if (!isOpen) return null;

  const muscles = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];

  const filtered = (exercises || []).filter((ex) => {
    if (selectedMuscle !== 'All' && ex.targetMuscle !== selectedMuscle) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      ex.name.toLowerCase().includes(q) ||
      (ex.targetMuscle && ex.targetMuscle.toLowerCase().includes(q))
    );
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md gym-card-elevated rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[var(--card-border)] overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[var(--main-color)]" />
            <h3 className="text-sm font-semibold text-white">Add Movement</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* حقل البحث وفلاتر العضلات */}
        <div className="p-4 space-y-3 border-b border-[var(--card-border)]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise library..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-[var(--main-color)]"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {muscles.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMuscle(m)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  selectedMuscle === m
                    ? 'bg-[var(--main-color)] text-black font-bold'
                    : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* قائمة التمارين */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0 space-y-2 custom-scrollbar">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">No exercises found.</p>
          ) : (
            filtered.map((ex) => (
              <div
                key={ex.id}
                onClick={() => onSelectExercise(ex)}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-white/20 transition-all cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-semibold text-white">{ex.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ex.targetMuscle} • {ex.equipment || 'Gym'}</p>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-[var(--main-color)]/10 text-[var(--main-color)] border border-[var(--main-color)]/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
