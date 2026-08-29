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
  X,
  Play,
  ExternalLink,
  Video,
  Trash2
} from 'lucide-react';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];

const EQUIPMENT_TYPES: EquipmentType[] = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
];

export const ExerciseLibraryView: React.FC = () => {
  const { exercises, addExercise, deleteExercise } = useGym();
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New exercise form states
  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<EquipmentType>('Barbell');
  const [category, setCategory] = useState<'Compound' | 'Isolation'>('Compound');
  const [videoUrl, setVideoUrl] = useState('');
  const [alternativeExercise, setAlternativeExercise] = useState('');
  const [executionCue, setExecutionCue] = useState('');
  const [tipInput, setTipInput] = useState('');

  const filteredExercises = exercises.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'All' || ex.targetMuscle === selectedMuscle;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.executionCue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.alternativeExercise && ex.alternativeExercise.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMuscle && matchesSearch;
  });

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addExercise({
      name: name.trim(),
      targetMuscle,
      equipment,
      category,
      videoUrl: videoUrl.trim() || undefined,
      alternativeExercise: alternativeExercise.trim() || undefined,
      executionCue: executionCue.trim() || 'Execute with controlled tempo and strict form.',
      tips: tipInput ? tipInput.split(',').map((t) => t.trim()).filter(Boolean) : ['Maintain neutral spine', 'Control eccentric']
    });

    setName('');
    setVideoUrl('');
    setAlternativeExercise('');
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
            Exercise Database & Video Guides
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Saved exercises with video links and alternatives. Saved exercises will be instantly available when building splits.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Exercise</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise by name, cue, or alternative..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#111116] border border-[#23232f] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Muscle group filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedMuscle('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedMuscle === 'All'
                ? 'bg-purple-600 text-white'
                : 'bg-[#121218] text-zinc-400 hover:text-white border border-[#22222d]'
            }`}
          >
            All Muscles ({exercises.length})
          </button>
          {MUSCLE_GROUPS.map((muscle) => {
            const count = exercises.filter((e) => e.targetMuscle === muscle).length;
            return (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedMuscle === muscle
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#121218] text-zinc-400 hover:text-white border border-[#22222d]'
                }`}
              >
                {muscle} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="p-5 rounded-2xl bg-[#111117] border border-[#22222e] hover:border-purple-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                    {ex.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                      {ex.targetMuscle}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {ex.equipment}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                    ex.category === 'Compound' 
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {ex.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteExercise(ex.id)}
                    className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800/60 transition-colors"
                    title="Delete exercise from database"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Alternative Exercise */}
              {ex.alternativeExercise && (
                <div className="my-2 px-2.5 py-1.5 rounded-lg bg-purple-950/20 border border-purple-900/40 text-[11px] text-purple-300 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-purple-400">Alt:</span>
                  <span>{ex.alternativeExercise}</span>
                </div>
              )}

              {/* Execution Cue */}
              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mt-2">
                {ex.executionCue}
              </p>

              {/* Tips */}
              {ex.tips && ex.tips.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Checklist Cues
                  </span>
                  {ex.tips.slice(0, 2).map((tip, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                      <span className="w-1 h-1 rounded-full bg-purple-400" />
                      <span className="truncate">{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Guide Link */}
            {ex.videoUrl && (
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>Watch Video Guide ↗</span>
                </a>
              </div>
            )}
          </div>
        ))}

        {filteredExercises.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-[#0e0e14]">
            <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No Movements Found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Try a different search query or add a new custom exercise
            </p>
          </div>
        )}
      </div>

      {/* Add New Exercise Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-[#121218] border border-[#272734] rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Add New Exercise To Database
                </h3>
                <p className="text-xs text-zinc-400">
                  Save exercise once with its video link to use across all workout plans
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
                  placeholder="e.g. Incline Dumbbell Bench Press"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {EQUIPMENT_TYPES.map((eq) => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Video Guide Link (YouTube / URL)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or search link"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500 placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Alternative Exercise (Badayel el-tamrena)
                </label>
                <input
                  type="text"
                  value={alternativeExercise}
                  onChange={(e) => setAlternativeExercise(e.target.value)}
                  placeholder="e.g. Incline Smith Machine Press / Chest Press Machine"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500 placeholder-zinc-600"
                />
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
                  Technique & Form Cue
                </label>
                <input
                  type="text"
                  value={executionCue}
                  onChange={(e) => setExecutionCue(e.target.value)}
                  placeholder="e.g. Retract scapulae, touch lower sternum, 3s eccentric descent..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
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
                  placeholder="e.g. Keep wrists neutral, Drive feet firmly into floor"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
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
                  Save Exercise to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
