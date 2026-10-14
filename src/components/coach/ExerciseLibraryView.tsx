'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { Exercise, MuscleGroup, EquipmentType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { ExerciseVideoModal } from './exercises/ExerciseVideoModal';
import { ExerciseFormModal, ExerciseFormData } from './exercises/ExerciseFormModal';
import { sanitizeString } from '@/lib/sanitizer';
import { Search, X, PanelLeft, Play, ArrowRightLeft, ChevronDown } from 'lucide-react';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];

const EQUIPMENT_TYPES: EquipmentType[] = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
];

interface ExerciseLibraryViewProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  isSidebarOpen,
  onToggleSidebar
}) => {
  const { exercises, addExercise, updateExercise, deleteExercise } = useGym();
  const { showToast } = useToast();

  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Compound' | 'Isolation'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Video modal state
  const [videoModalExercise, setVideoModalExercise] = useState<Exercise | null>(null);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<EquipmentType>('Barbell');
  const [category, setCategory] = useState<'Compound' | 'Isolation'>('Compound');
  const [videoUrl, setVideoUrl] = useState('');
  const [alternativeExercise, setAlternativeExercise] = useState('');
  const [executionCue, setExecutionCue] = useState('');
  const [tipInput, setTipInput] = useState('');

  // Edit modal state
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editName, setEditName] = useState('');
  const [editTargetMuscle, setEditTargetMuscle] = useState<MuscleGroup>('Chest');
  const [editEquipment, setEditEquipment] = useState<EquipmentType>('Barbell');
  const [editCategory, setEditCategory] = useState<'Compound' | 'Isolation'>('Compound');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editAlternativeExercise, setEditAlternativeExercise] = useState('');
  const [editExecutionCue, setEditExecutionCue] = useState('');
  const [editTipInput, setEditTipInput] = useState('');

  // Delete confirmation modal state
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesMuscle = selectedMuscle === 'All' || ex.targetMuscle === selectedMuscle;
      const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
      const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        ex.name.toLowerCase().includes(query) ||
        ex.executionCue.toLowerCase().includes(query) ||
        (ex.alternativeExercise && ex.alternativeExercise.toLowerCase().includes(query));

      return matchesMuscle && matchesEquipment && matchesCategory && matchesSearch;
    });
  }, [exercises, selectedMuscle, selectedEquipment, selectedCategory, searchQuery]);

  // Derived counts for overview
  const compoundCount = useMemo(() => exercises.filter((e) => e.category === 'Compound').length, [exercises]);
  const isolationCount = useMemo(() => exercises.filter((e) => e.category === 'Isolation').length, [exercises]);

  const handleCreateExerciseSubmit = async (data: ExerciseFormData) => {
    await addExercise({
      name: data.name,
      targetMuscle: data.targetMuscle,
      equipment: data.equipment,
      category: data.category,
      videoUrl: data.videoUrl,
      alternativeExercise: data.alternativeExercise,
      alternativeVideoUrl: data.alternativeVideoUrl,
      executionCue: data.executionCue,
      tips: data.tips
    });
    setIsAddModalOpen(false);
    showToast(`Added ${data.name} to library`, 'success');
  };

  const handleOpenEdit = (ex: Exercise) => {
    setEditingExercise(ex);
  };

  const handleSaveEditSubmit = async (data: ExerciseFormData) => {
    if (!editingExercise) return;
    const updated: Exercise = {
      ...editingExercise,
      name: data.name,
      targetMuscle: data.targetMuscle,
      equipment: data.equipment,
      category: data.category,
      videoUrl: data.videoUrl,
      alternativeExercise: data.alternativeExercise,
      alternativeVideoUrl: data.alternativeVideoUrl,
      executionCue: data.executionCue,
      tips: data.tips
    };

    await updateExercise(updated);
    setEditingExercise(null);
    showToast(`Updated "${data.name}"`, 'success');
  };

  const handleConfirmDelete = async () => {
    if (!deletingExercise) return;
    const nameToDelete = deletingExercise.name;
    await deleteExercise(deletingExercise.id);
    setDeletingExercise(null);
    showToast(`Deleted "${nameToDelete}"`, 'info');
  };

  // Active muscle groups with count for dropdown options
  const activeMuscleGroups = useMemo(() => {
    const counts: Record<string, number> = {};
    exercises.forEach((ex) => {
      counts[ex.targetMuscle] = (counts[ex.targetMuscle] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [exercises]);

  const hasActiveFilters = selectedMuscle !== 'All' || selectedEquipment !== 'All' || selectedCategory !== 'All' || Boolean(searchQuery);

  const handleResetFilters = () => {
    setSelectedMuscle('All');
    setSelectedEquipment('All');
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const renderCardGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {filteredExercises.map((ex) => (
        <div
          key={ex.id}
          className="gym-card hover:border-[var(--main-color)]/30 transition-all flex flex-col justify-between p-3.5 space-y-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xs"
        >
          <div className="space-y-2.5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight truncate">
                  {ex.name}
                </h3>
                <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                  ex.category === 'Compound'
                    ? 'text-[var(--main-color)] bg-[var(--main-color)]/15 border-[var(--main-color)]/30'
                    : 'text-slate-300 bg-white/[0.04] border-white/10'
                }`}>
                  {ex.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[var(--main-color)] bg-[var(--main-color)]/15 border border-[var(--main-color)]/30 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)]" />
                  {ex.targetMuscle}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md">
                  {ex.equipment}
                </span>
              </div>
            </div>

            {ex.alternativeExercise && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs">
                <ArrowRightLeft className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[10.5px] font-mono text-amber-400/90 font-semibold shrink-0">Badeel:</span>
                <span className="text-[11px] text-amber-200 truncate">{ex.alternativeExercise}</span>
              </div>
            )}

            {ex.executionCue && (
              <div className="border-l-2 border-[var(--main-color)]/40 pl-2.5 py-0.5">
                <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                  {ex.executionCue}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
            <div>
              {ex.videoUrl ? (
                <button
                  type="button"
                  onClick={() => setVideoModalExercise(ex)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--main-color)]/15 hover:bg-[var(--main-color)]/25 border border-[var(--main-color)]/30 text-xs font-semibold text-[var(--main-color)] hover:text-white transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Video Guide</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-600 font-mono">No Video</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleOpenEdit(ex)}
                className="px-2 py-1 rounded text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeletingExercise(ex)}
                className="px-2 py-1 rounded text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContentGridOrTable = () => (
    <>
      {filteredExercises.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
          <h3 className="text-sm font-bold text-white">No Movements Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            No exercises match your current filters. Try changing equipment or clearing search terms.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] text-xs font-semibold text-white border border-[var(--card-border)] hover:border-white/20 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        renderCardGrid()
      ) : (
        <>
          {/* Mobile is always Cards mode */}
          <div className="md:hidden">
            {renderCardGrid()}
          </div>
          {/* Desktop & Tablet Table mode */}
          <div className="hidden md:block rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] text-[10px] font-mono uppercase text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">Movement</th>
                    <th className="py-2.5 px-3 font-semibold">Target Muscle</th>
                    <th className="py-2.5 px-3 font-semibold">Equipment</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold">Alternative (Badeel)</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {filteredExercises.map((ex) => (
                    <tr
                      key={ex.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                        {ex.name}
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono whitespace-nowrap">
                        {ex.targetMuscle}
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-mono whitespace-nowrap">
                        {ex.equipment}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          ex.category === 'Compound'
                            ? 'border-[var(--main-color)]/30 text-[var(--main-color)] bg-[var(--main-color)]/15'
                            : 'border-white/10 text-slate-300 bg-white/[0.04]'
                        }`}>
                          {ex.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono text-[11px] truncate max-w-[180px]">
                        {ex.alternativeExercise || '—'}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {ex.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setVideoModalExercise(ex)}
                              className="px-2 py-0.5 rounded bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] text-[11px] font-medium text-slate-200 border border-[var(--card-border)] hover:border-white/20 cursor-pointer"
                            >
                              Video Guide
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ex)}
                            className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingExercise(ex)}
                            className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-2.5 w-full max-w-none select-none pb-20 md:pb-6">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 pb-2 border-b border-white/[0.07]">
        <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors flex items-center justify-center cursor-pointer shrink-0 min-[1025px]:hidden"
              title={isSidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
              aria-label="Toggle Navigation Sidebar"
            >
              <PanelLeft className="w-4 h-4 text-slate-300" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="gym-heading-page text-xs sm:text-base md:text-lg truncate">Exercise Library</h1>
              <span className="gym-delta-neutral text-[9.5px] sm:text-[10px] min-[1025px]:hidden shrink-0">
                <span className="sm:inline hidden">{exercises.length} Movements</span>
                <span className="sm:hidden">{exercises.length}</span>
              </span>
            </div>
            <p className="gym-subtext mt-0.5 truncate hidden md:block">
              Movement directory, execution directives, and in-gym alternatives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Telemetry capsules (Desktop only > 1024px; completely hidden on Tablet & Mobile) */}
          <div className="hidden min-[1025px]:flex items-center gap-1.5 font-mono text-[10.5px]">
            <div className="gym-card-subtle px-2 py-1 flex items-center gap-1">
              <span className="gym-label-mono text-slate-400">Total:</span>
              <span className="gym-num text-white">{exercises.length}</span>
            </div>
            <div className="gym-card-subtle px-2 py-1 flex items-center gap-1">
              <span className="gym-label-mono text-slate-400">Compound:</span>
              <span className="gym-num text-white">{compoundCount}</span>
            </div>
            <div className="gym-card-subtle px-2 py-1 flex items-center gap-1">
              <span className="gym-label-mono text-slate-400">Isolation:</span>
              <span className="gym-num text-slate-300">{isolationCount}</span>
            </div>
          </div>

          {/* View Toggle (Desktop & Tablet only: hidden on mobile) */}
          <div className="hidden md:flex items-center p-0.5 rounded-lg bg-[var(--card-subtle-bg)] border border-white/[0.08] text-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white/[0.1] text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white/[0.1] text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>

          {/* Search Icon Button (Mobile only < md) */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`md:hidden p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              isMobileSearchOpen || searchQuery
                ? 'bg-[var(--main-color)]/15 border-[var(--main-color)]/40 text-[var(--main-color)] shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border-white/[0.08]'
            }`}
            title="Search Movements"
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Add Movement Button: Single element with responsive text `+` on mobile, `+ Add Movement` on desktop */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="gym-btn-primary text-xs px-2.5 sm:px-3 py-1.5 h-[32px] sm:h-[34px] font-semibold shrink-0 cursor-pointer flex items-center justify-center gap-1"
          >
            <span className="sm:hidden font-bold text-sm">+</span>
            <span className="hidden sm:inline">+ Add Movement</span>
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Search Bar (< md) */}
      {isMobileSearchOpen && (
        <div className="md:hidden gym-card !p-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150 shadow-xs border-[var(--main-color)]/30">
          <Search className="w-3.5 h-3.5 text-[var(--main-color)] shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movement, cue, or alternative..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Unified Command Filter Bar (One Row, Zero Clutter) */}
      <div className="gym-card !p-1.5 sm:!p-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5 sm:gap-2 shadow-xs">
        {/* Desktop Search Input (hidden on mobile since mobile has the header search button) */}
        <div className="relative flex-1 hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movement, cue, or alternative..."
            className="w-full gym-input !pl-8 pr-7 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2-Tier Filter Layout: Zero Scroll on Mobile, 100% Visible */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto shrink-0">
          {/* Tier 1: Full-width 3-Column Segmented Switcher on mobile / flex on desktop */}
          <div className="grid grid-cols-3 md:flex md:items-center p-0.5 rounded-lg bg-[var(--card-subtle-bg)] border border-white/[0.08] text-xs w-full md:w-auto">
            {(['All', 'Compound', 'Isolation'] as const).map((cat) => {
              const count = cat === 'All' ? exercises.length : cat === 'Compound' ? compoundCount : isolationCount;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1.5 px-2 md:px-2.5 rounded-md text-[11px] font-mono transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                    selectedCategory === cat
                      ? 'bg-[var(--main-color)] text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Tier 2: Two 50%/50% Dropdown Selectors on mobile / auto on desktop */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            {/* Muscle Selector Dropdown */}
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="gym-input text-xs !py-1.5 !px-2.5 font-mono cursor-pointer bg-[var(--card-subtle-bg)] border-white/10 flex-1 md:w-auto md:flex-initial"
            >
              <option value="All">All Muscles ({exercises.length})</option>
              {activeMuscleGroups.map((m) => (
                <option key={m.name} value={m.name}>{m.name} ({m.count})</option>
              ))}
            </select>

            {/* Equipment Selector Dropdown */}
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="gym-input text-xs !py-1.5 !px-2.5 font-mono cursor-pointer bg-[var(--card-subtle-bg)] border-white/10 flex-1 md:w-auto md:flex-initial"
            >
              <option value="All">All Equipment</option>
              {EQUIPMENT_TYPES.map((eq) => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer shrink-0"
                title="Reset filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {renderContentGridOrTable()}

      {/* 4. In-App Video Demonstration Modal */}
      <ExerciseVideoModal
        exercise={videoModalExercise}
        isOpen={Boolean(videoModalExercise)}
        onClose={() => setVideoModalExercise(null)}
      />

      {/* 5. Add New Exercise Modal (Shared ExerciseFormModal Component) */}
      <ExerciseFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Exercise"
        subtitle="Create a new exercise with form cues and video guidance."
        submitLabel="Save Exercise"
        onSubmit={handleCreateExerciseSubmit}
      />

      {/* 6. Edit Existing Exercise Modal (Shared ExerciseFormModal Component) */}
      <ExerciseFormModal
        isOpen={Boolean(editingExercise)}
        onClose={() => setEditingExercise(null)}
        title="Edit Exercise"
        subtitle="Update movement cues, equipment, or alternative."
        submitLabel="Save Changes"
        initialData={editingExercise ? {
          name: editingExercise.name,
          targetMuscle: editingExercise.targetMuscle,
          equipment: editingExercise.equipment,
          category: editingExercise.category || 'Compound',
          videoUrl: editingExercise.videoUrl,
          alternativeExercise: editingExercise.alternativeExercise,
          alternativeVideoUrl: editingExercise.alternativeVideoUrl,
          executionCue: editingExercise.executionCue,
          tips: editingExercise.tips
        } : undefined}
        onSubmit={handleSaveEditSubmit}
      />

      {/* 7. Delete Confirmation Dialog (Closes on Backdrop Click) */}
      <Modal
        isOpen={Boolean(deletingExercise)}
        onClose={() => setDeletingExercise(null)}
        maxWidth="max-w-sm"
        title="Delete Movement?"
      >
        <div className="space-y-3 text-white p-1">
          <p className="text-xs text-slate-300 font-sans">
            Are you sure you want to remove &ldquo;{deletingExercise?.name}&rdquo; from the exercise library?
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDeletingExercise(null)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow cursor-pointer active:scale-95 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
