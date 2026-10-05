'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { Exercise, MuscleGroup, EquipmentType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { ExerciseVideoModal } from './exercises/ExerciseVideoModal';
import { sanitizeString } from '@/lib/sanitizer';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];

const EQUIPMENT_TYPES: EquipmentType[] = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
];

export const ExerciseLibraryView: React.FC = () => {
  const { exercises, addExercise, updateExercise, deleteExercise } = useGym();
  const { showToast } = useToast();

  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Compound' | 'Isolation'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeString(name.trim());
    if (!cleanName) return;

    await addExercise({
      name: cleanName,
      targetMuscle,
      equipment,
      category,
      videoUrl: videoUrl.trim() || undefined,
      alternativeExercise: alternativeExercise.trim() ? sanitizeString(alternativeExercise.trim()) : undefined,
      executionCue: executionCue.trim() ? sanitizeString(executionCue.trim()) : 'Execute with controlled tempo and strict form.',
      tips: tipInput ? tipInput.split(',').map((t) => sanitizeString(t.trim())).filter(Boolean) : ['Maintain neutral spine', 'Control eccentric descent']
    });

    setName('');
    setVideoUrl('');
    setAlternativeExercise('');
    setExecutionCue('');
    setTipInput('');
    setIsAddModalOpen(false);
    showToast(`Added ${cleanName} to library`, 'success');
  };

  const handleOpenEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    setEditName(ex.name);
    setEditTargetMuscle(ex.targetMuscle);
    setEditEquipment(ex.equipment);
    setEditCategory(ex.category || 'Compound');
    setEditVideoUrl(ex.videoUrl || '');
    setEditAlternativeExercise(ex.alternativeExercise || '');
    setEditExecutionCue(ex.executionCue || '');
    setEditTipInput(ex.tips && ex.tips.length > 0 ? ex.tips.join(', ') : '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEditName = sanitizeString(editName.trim());
    if (!editingExercise || !cleanEditName) return;

    const updated: Exercise = {
      ...editingExercise,
      name: cleanEditName,
      targetMuscle: editTargetMuscle,
      equipment: editEquipment,
      category: editCategory,
      videoUrl: editVideoUrl.trim() || undefined,
      alternativeExercise: editAlternativeExercise.trim() ? sanitizeString(editAlternativeExercise.trim()) : undefined,
      executionCue: editExecutionCue.trim() ? sanitizeString(editExecutionCue.trim()) : 'Execute with controlled tempo and strict form.',
      tips: editTipInput ? editTipInput.split(',').map((t) => sanitizeString(t.trim())).filter(Boolean) : ['Maintain neutral spine', 'Control eccentric descent']
    };

    await updateExercise(updated);
    setEditingExercise(null);
    showToast(`Updated "${cleanEditName}"`, 'success');
  };

  const handleConfirmDelete = async () => {
    if (!deletingExercise) return;
    const nameToDelete = deletingExercise.name;
    await deleteExercise(deletingExercise.id);
    setDeletingExercise(null);
    showToast(`Deleted "${nameToDelete}"`, 'info');
  };

  return (
    <div className="space-y-3 w-full max-w-none select-none">
      {/* 1. Ultra-Clean Executive Header (Text-Only, No Icons, Obsidian) */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-[#090e17] border border-[#141b26] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
              Exercise Library
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/10">
              {exercises.length} Movements
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-200 border border-white/10">
              {compoundCount} Compound
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/10">
              {isolationCount} Isolation
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Movement directory, execution directives, and in-gym alternatives.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Compact Table
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="py-1.5 px-3.5 rounded-lg bg-white hover:bg-slate-100 text-[#080c14] font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            + Add Movement
          </button>
        </div>
      </div>

      {/* 2. Unified Filter Toolbar (Search, Type, Equipment, Target Muscle) */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#090e17] border border-[#141b26] space-y-2 shadow-xs">
        {/* Row 1: Search Input & Category & Equipment Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movement, cue, or alternative..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 font-sans transition-colors"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Lift Type Switcher */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs font-semibold flex-shrink-0">
              {(['All', 'Compound', 'Isolation'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Equipment Quick Filter Pills */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#05080e] border border-[#16202e] overflow-x-auto custom-scrollbar text-xs">
              {['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Smith Machine'].map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => setSelectedEquipment(eq)}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-all flex-shrink-0 cursor-pointer ${
                    selectedEquipment === eq
                      ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Target Muscle Strip */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5 pt-1.5 border-t border-[#141b26] text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold mr-1 flex-shrink-0">
            Muscle:
          </span>
          {['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Arms', 'Core'].map((muscle) => {
            const count = muscle === 'All' ? exercises.length : exercises.filter((e) => e.targetMuscle === muscle).length;
            if (muscle !== 'All' && count === 0) return null;
            return (
              <button
                key={muscle}
                type="button"
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono transition-all flex-shrink-0 cursor-pointer ${
                  selectedMuscle === muscle
                    ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                    : 'bg-[#05080e] hover:bg-white/[0.04] text-slate-400 hover:text-white border border-[#16202e]'
                }`}
              >
                {muscle} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Content: Grid Mode vs Compact Table Mode */}
      {filteredExercises.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-xl bg-[#090e17] border border-[#141b26] space-y-2">
          <h3 className="text-sm font-bold text-white">No Movements Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            No exercises match your current filters. Try changing equipment or clearing search terms.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedMuscle('All');
              setSelectedEquipment('All');
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-3 py-1 rounded-lg bg-[#05080e] hover:bg-white/[0.06] text-xs font-semibold text-white border border-[#16202e] hover:border-white/20 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* CARDS GRID MODE (Neat, Monochrome, Zero Icon Clutter) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="p-3.5 rounded-xl bg-[#090e17] border border-[#141b26] hover:border-white/20 transition-all flex flex-col justify-between space-y-2.5 shadow-xs"
            >
              <div className="space-y-2">
                {/* Header: Title & Badges */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                      {ex.name}
                    </h3>
                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/10 flex-shrink-0">
                      {ex.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[9.5px] font-mono font-medium px-2 py-0.5 rounded bg-white/[0.04] text-slate-200 border border-white/10">
                      {ex.targetMuscle}
                    </span>
                    <span className="text-[9.5px] font-mono font-medium px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/10">
                      {ex.equipment}
                    </span>
                  </div>
                </div>

                {/* Alternative Movement (Badeel) */}
                {ex.alternativeExercise && (
                  <div className="p-1.5 px-2 rounded-lg bg-[#05080e] border border-[#16202e] text-xs flex items-center justify-between font-mono">
                    <span className="text-[9.5px] uppercase text-slate-500 font-semibold">
                      Badeel:
                    </span>
                    <span className="text-slate-300 font-medium truncate text-[11px]">
                      {ex.alternativeExercise}
                    </span>
                  </div>
                )}

                {/* Key Form Cue */}
                {ex.executionCue && (
                  <div className="p-2 rounded-lg bg-[#05080e] border border-[#16202e]">
                    <span className="text-[9px] font-mono uppercase text-slate-500 font-semibold block mb-0.5">
                      Key Form Cue
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                      {ex.executionCue}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Clean Text-Only (No Icons) */}
              <div className="pt-2 border-t border-[#16202e] flex items-center justify-between gap-2">
                <div>
                  {ex.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setVideoModalExercise(ex)}
                      className="px-2.5 py-1 rounded-md bg-[#05080e] hover:bg-white/[0.06] active:scale-95 border border-[#16202e] hover:border-white/20 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
                    >
                      Video Guide
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(ex)}
                    className="px-2 py-0.5 rounded text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingExercise(ex)}
                    className="px-2 py-0.5 rounded text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* COMPACT TABLE MODE (Dense, High Speed, Zero Scroll) */
        <div className="rounded-xl bg-[#090e17] border border-[#141b26] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#141b26] bg-[#070a0f] text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Movement</th>
                  <th className="py-2.5 px-3 font-semibold">Target Muscle</th>
                  <th className="py-2.5 px-3 font-semibold">Equipment</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Alternative (Badeel)</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141b26]">
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
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-slate-300 bg-white/[0.04]">
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
                            className="px-2 py-0.5 rounded bg-[#05080e] hover:bg-white/[0.06] text-[11px] font-medium text-slate-200 border border-[#16202e] hover:border-white/20"
                          >
                            Video Guide
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ex)}
                          className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingExercise(ex)}
                          className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-rose-400"
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
      )}

      {/* 4. In-App Video Demonstration Modal */}
      <ExerciseVideoModal
        exercise={videoModalExercise}
        isOpen={Boolean(videoModalExercise)}
        onClose={() => setVideoModalExercise(null)}
      />

      {/* 5. Add New Exercise Modal (Clean Typography, Closes on Backdrop Click) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="max-w-md"
        title={
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Add New Exercise
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Create a new exercise with form cues and video guidance.
            </p>
          </div>
        }
      >
        <form onSubmit={handleCreateExercise} className="space-y-3.5 text-xs p-1">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
              Exercise Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Incline Dumbbell Bench Press"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          {/* Modern Custom Dropdowns */}
          <div className="grid grid-cols-2 gap-2.5">
            <SelectDropdown
              label="Target Muscle"
              value={targetMuscle}
              onChange={(val) => setTargetMuscle(val as MuscleGroup)}
              options={MUSCLE_GROUPS}
            />

            <SelectDropdown
              label="Equipment"
              value={equipment}
              onChange={(val) => setEquipment(val as EquipmentType)}
              options={EQUIPMENT_TYPES}
            />
          </div>

          {/* Modern Segmented Lift Type */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
              Lift Type
            </label>
            <div className="flex items-center p-1 rounded-xl bg-black border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCategory('Compound')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  category === 'Compound'
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compound Lift
              </button>
              <button
                type="button"
                onClick={() => setCategory('Isolation')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  category === 'Isolation'
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Isolation Movement
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Alternative Exercise (Badeel)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Swap if machine is busy
              </span>
            </div>
            <input
              type="text"
              value={alternativeExercise}
              onChange={(e) => setAlternativeExercise(e.target.value)}
              placeholder="e.g. Chest Press Machine / Smith Press"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Video Guide URL
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                YouTube or direct video
              </span>
            </div>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/... or MP4 link"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Key Form Cue
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Main technique cue for athlete
              </span>
            </div>
            <input
              type="text"
              value={executionCue}
              onChange={(e) => setExecutionCue(e.target.value)}
              placeholder="e.g. Retract scapulae, touch lower sternum, control descent"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Form Checklist (Optional)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Comma separated
              </span>
            </div>
            <input
              type="text"
              value={tipInput}
              onChange={(e) => setTipInput(e.target.value)}
              placeholder="e.g. Keep wrists neutral, Drive heels into floor"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-white text-black font-bold hover:bg-slate-100 shadow cursor-pointer active:scale-95 transition-all"
            >
              Save Exercise
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Edit Existing Exercise Modal (Closes on Backdrop Click) */}
      <Modal
        isOpen={Boolean(editingExercise)}
        onClose={() => setEditingExercise(null)}
        maxWidth="max-w-md"
        title={
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Edit Exercise
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Update movement cues, equipment, or alternative.
            </p>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs p-1">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
              Exercise Name *
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          {/* Modern Custom Dropdowns */}
          <div className="grid grid-cols-2 gap-2.5">
            <SelectDropdown
              label="Target Muscle"
              value={editTargetMuscle}
              onChange={(val) => setEditTargetMuscle(val as MuscleGroup)}
              options={MUSCLE_GROUPS}
            />

            <SelectDropdown
              label="Equipment"
              value={editEquipment}
              onChange={(val) => setEditEquipment(val as EquipmentType)}
              options={EQUIPMENT_TYPES}
            />
          </div>

          {/* Modern Segmented Lift Type */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
              Lift Type
            </label>
            <div className="flex items-center p-1 rounded-xl bg-black border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEditCategory('Compound')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  editCategory === 'Compound'
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compound Lift
              </button>
              <button
                type="button"
                onClick={() => setEditCategory('Isolation')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  editCategory === 'Isolation'
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Isolation Movement
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Alternative Exercise (Badeel)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Swap if machine is busy
              </span>
            </div>
            <input
              type="text"
              value={editAlternativeExercise}
              onChange={(e) => setEditAlternativeExercise(e.target.value)}
              placeholder="e.g. Chest Press Machine / Smith Press"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Video Guide URL
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                YouTube or direct video
              </span>
            </div>
            <input
              type="url"
              value={editVideoUrl}
              onChange={(e) => setEditVideoUrl(e.target.value)}
              placeholder="https://youtube.com/... or MP4 link"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Key Form Cue
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Main technique cue for athlete
              </span>
            </div>
            <input
              type="text"
              value={editExecutionCue}
              onChange={(e) => setEditExecutionCue(e.target.value)}
              placeholder="e.g. Retract scapulae, touch lower sternum, control descent"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Form Checklist (Optional)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Comma separated
              </span>
            </div>
            <input
              type="text"
              value={editTipInput}
              onChange={(e) => setEditTipInput(e.target.value)}
              placeholder="e.g. Keep wrists neutral, Drive heels into floor"
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-white/30 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setEditingExercise(null)}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-white text-black font-bold hover:bg-slate-100 shadow cursor-pointer active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

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
