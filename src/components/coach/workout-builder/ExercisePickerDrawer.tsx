'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Exercise, MuscleGroup } from '@/types';

const MUSCLE_OPTIONS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes',
  'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];

interface ExercisePickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalExercisesCount: number;
  pickerSearch: string;
  onSearchChange: (search: string) => void;
  pickerMuscleFilter: string;
  onMuscleFilterChange: (muscle: string) => void;
  filteredExercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  onOpenNewMovementModal: () => void;
}

export const ExercisePickerDrawer: React.FC<ExercisePickerDrawerProps> = ({
  isOpen,
  onClose,
  totalExercisesCount,
  pickerSearch,
  onSearchChange,
  pickerMuscleFilter,
  onMuscleFilterChange,
  filteredExercises,
  onSelectExercise,
  onOpenNewMovementModal
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Click-outside backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-45 animate-in fade-in duration-150"
      />
      <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[460px] bg-[var(--card-bg)] border-l border-[var(--card-border)] p-4 sm:p-5 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div className="flex flex-col h-full min-h-0">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)] flex-shrink-0">
            <h3 className="text-xs sm:text-sm font-bold text-white">
              Exercise Library ({totalExercisesCount})
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Actions */}
          <div className="py-3 space-y-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movement, cue, or alternative..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[var(--main-color)]"
              />
              <button
                type="button"
                onClick={onOpenNewMovementModal}
                className="gym-btn-primary text-xs whitespace-nowrap"
              >
                New Movement
              </button>
            </div>

            {/* Muscle Quick Filter Track */}
            <div className="w-full flex items-center">
              <div
                onWheel={(e) => {
                  if (e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
                className="flex items-center gap-1 p-1 pb-1 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] overflow-x-auto no-scrollbar scroll-smooth max-w-[398px]"
              >
                <button
                  type="button"
                  onClick={() => onMuscleFilterChange('All')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    pickerMuscleFilter === 'All'
                      ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  All
                </button>
                {MUSCLE_OPTIONS.map((muscle) => (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() => onMuscleFilterChange(muscle)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      pickerMuscleFilter === muscle
                        ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Exercises List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 min-h-0">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => onSelectExercise(ex)}
                className="p-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.04] border border-[var(--card-border)] hover:border-white/20 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-slate-200 transition-colors truncate">
                      {ex.name}
                    </h4>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[var(--card-bg)] text-slate-300 border border-[var(--card-border)] flex-shrink-0">
                      {ex.targetMuscle}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block truncate mt-0.5">
                    {ex.equipment} &bull; {ex.category || 'Compound'}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-[var(--card-bg)] group-hover:bg-white group-hover:text-[var(--card-bg)] border border-[var(--card-border)] text-[10px] font-bold text-slate-300 transition-all flex-shrink-0">
                  Add
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
