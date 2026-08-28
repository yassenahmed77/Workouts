'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { Exercise, MuscleGroup, EquipmentType } from '@/types';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Dumbbell, 
  Filter, 
  CheckCircle2, 
  Sparkles,
  X
} from 'lucide-react';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Arms', 'Core'
];

export const ExerciseLibraryView: React.FC = () => {
  const { exercises, addExercise } = useGym();
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New exercise form states
  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<EquipmentType>('Barbell');
  const [category, setCategory] = useState<'Compound' | 'Isolation'>('Compound');
  const [executionCue, setExecutionCue] = useState('');
  const [tipInput, setTipInput] = useState('');

  const filteredExercises = exercises.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'All' || ex.targetMuscle === selectedMuscle;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.executionCue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addExercise({
      name: name.trim(),
      targetMuscle,
      equipment,
      category,
      executionCue: executionCue.trim() || 'Execute with controlled tempo and strict form.',
      tips: tipInput ? tipInput.split(',').map((t) => t.trim()).filter(Boolean) : ['Maintain neutral spine', 'Control eccentric']
    });

    setName('');
    setExecutionCue('');
    setTipInput('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121218] border border-[#22222d]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Movement & Exercise Database
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Curated library of standard movements, form cues, and equipment specifications
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Custom Exercise</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movements or biomechanical cues..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#111116] border border-[#23232f] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Muscle group chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedMuscle('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMuscle === 'All'
                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-[#111116] text-zinc-400 hover:text-white border border-[#23232f]'
            }`}
          >
            All Movements ({exercises.length})
          </button>
          {MUSCLE_GROUPS.map((muscle) => {
            const count = exercises.filter((ex) => ex.targetMuscle === muscle).length;
            return (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedMuscle === muscle
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-[#111116] text-zinc-400 hover:text-white border border-[#23232f]'
                }`}
              >
                {muscle} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="p-5 rounded-xl bg-[#111116] border border-[#22222e] hover:border-[#323242] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {ex.name}
                </h3>
                <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                  ex.category === 'Compound' 
                    ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50' 
                    : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {ex.category}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3 text-[11px] font-mono text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {ex.targetMuscle}
                </span>
                <span>•</span>
                <span>{ex.equipment}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0d0d12] border border-zinc-900 mb-3">
                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                  Primary Execution Cue
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {ex.executionCue}
                </p>
              </div>

              {ex.tips && ex.tips.length > 0 && (
                <div className="space-y-1">
                  <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                    Coach Form Checklist
                  </span>
                  <ul className="space-y-1">
                    {ex.tips.map((tip, idx) => (
                      <li key={idx} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-purple-400" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Exercise Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-[#121218] border border-[#272734] rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Add New Exercise
                </h3>
                <p className="text-xs text-zinc-400">
                  Expand your database with custom movements
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Incline Smith Machine Press"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Target Muscle
                  </label>
                  <select
                    value={targetMuscle}
                    onChange={(e) => setTargetMuscle(e.target.value as MuscleGroup)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {MUSCLE_GROUPS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Equipment
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Barbell">Barbell</option>
                    <option value="Dumbbell">Dumbbell</option>
                    <option value="Cable">Cable</option>
                    <option value="Machine">Machine</option>
                    <option value="Bodyweight">Bodyweight</option>
                    <option value="Smith Machine">Smith Machine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Movement Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('Compound')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                      category === 'Compound' 
                        ? 'bg-purple-600 text-white border-purple-500' 
                        : 'bg-[#0d0d12] text-zinc-400 border-[#262632]'
                    }`}
                  >
                    Compound
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('Isolation')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                      category === 'Isolation' 
                        ? 'bg-purple-600 text-white border-purple-500' 
                        : 'bg-[#0d0d12] text-zinc-400 border-[#262632]'
                    }`}
                  >
                    Isolation
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Execution Cue
                </label>
                <input
                  type="text"
                  value={executionCue}
                  onChange={(e) => setExecutionCue(e.target.value)}
                  placeholder="e.g. Retract scapulae, touch lower sternum..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Checklist Tips (Comma Separated)
                </label>
                <input
                  type="text"
                  value={tipInput}
                  onChange={(e) => setTipInput(e.target.value)}
                  placeholder="e.g. Keep wrists neutral, Drive through heels"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
