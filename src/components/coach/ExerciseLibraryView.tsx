'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { Exercise, MuscleGroup, EquipmentType } from '@/types';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Dumbbell, 
  Filter, 
  CheckCircle2, 
  X, 
  Play, 
  Video, 
  Trash2,
  Flame,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Repeat
} from 'lucide-react';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];

const EQUIPMENT_TYPES: EquipmentType[] = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
];

export const ExerciseLibraryView: React.FC = () => {
  const { exercises, addExercise, deleteExercise } = useGym();
  const { showToast } = useToast();
  
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

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesMuscle = selectedMuscle === 'All' || ex.targetMuscle === selectedMuscle;
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.executionCue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.alternativeExercise && ex.alternativeExercise.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesMuscle && matchesSearch;
    });
  }, [exercises, selectedMuscle, searchQuery]);

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
      tips: tipInput ? tipInput.split(',').map((t) => t.trim()).filter(Boolean) : ['Maintain neutral spine', 'Control eccentric descent']
    });

    setName('');
    setVideoUrl('');
    setAlternativeExercise('');
    setExecutionCue('');
    setTipInput('');
    setIsAddModalOpen(false);
    showToast(`Added ${name} to Exercise Library! ⚡`, 'success');
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-10">
      
      {/* 1. Hero Card: Cyber Sunset Exercise Directory Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#ff6b00] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20">
                <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                EXERCISE DIRECTORY & FORM CUES
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1.5">
              Exercise Library ({exercises.length})
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Movements database with video guides, execution cues & alternative exercises (Badeel).
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl btn-orange text-xs font-black flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all self-start sm:self-auto flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Movement</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercise by name, cue, or alternative..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#111218] border border-[#212330] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60 transition-colors shadow-sm"
          />
        </div>

        {/* Muscle Filter Horizontal Scrolling Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedMuscle('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedMuscle === 'All'
                ? 'bg-[#1e202c] text-white border border-[#2e303d] shadow-sm'
                : 'bg-[#111218] text-zinc-400 hover:text-white border border-[#212330]'
            }`}
          >
            All ({exercises.length})
          </button>
          {MUSCLE_GROUPS.map((muscle) => {
            const count = exercises.filter((e) => e.targetMuscle === muscle).length;
            if (count === 0) return null;
            return (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedMuscle === muscle
                    ? 'bg-[#1e202c] text-[#ff6b00] border border-[#ff6b00]/30 shadow-sm'
                    : 'bg-[#111218] text-zinc-400 hover:text-white border border-[#212330]'
                }`}
              >
                {muscle} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Exercises List: Responsive Cards with Zero Overlap */}
      <div className="space-y-3.5">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="p-5 rounded-3xl bg-[#111218] border border-[#212330] hover:border-[#35384d] transition-all shadow-md space-y-3.5 group"
          >
            {/* Header: Name, Target Badges & Delete */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#252736] flex items-center justify-center font-mono text-xs font-black flex-shrink-0 mt-0.5">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                    {ex.name}
                  </h3>
                  
                  {/* Badges strip */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#18151f] text-[#ff6b00] border border-[#ff6b00]/20">
                      {ex.targetMuscle}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#09090b] text-zinc-300 border border-[#1e202c]">
                      {ex.equipment}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#09090b] text-zinc-400 border border-[#1e202c]">
                      {ex.category}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  deleteExercise(ex.id);
                  showToast(`Deleted "${ex.name}" from library 🗑️`, 'info');
                }}
                className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-[#1e202c] transition-colors cursor-pointer flex-shrink-0"
                title="Delete exercise"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Alternative Movement (Badeel) */}
            {ex.alternativeExercise && (
              <div className="px-3 py-2 rounded-2xl bg-[#09090b] border border-[#1e202a] text-xs flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-[#ff6b00] flex-shrink-0" />
                <span className="text-zinc-400 text-[11px] font-mono uppercase font-bold">Badeel:</span>
                <span className="text-zinc-200 font-bold truncate">{ex.alternativeExercise}</span>
              </div>
            )}

            {/* Execution Form Cue */}
            {ex.executionCue && (
              <div className="p-3 rounded-2xl bg-[#0a0a0d] border border-[#1e202c]">
                <span className="text-[9px] font-mono uppercase text-[#ff6b00] font-bold block mb-1">
                  Coaching & Form Cue
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {ex.executionCue}
                </p>
              </div>
            )}

            {/* Tips Checklist */}
            {ex.tips && ex.tips.length > 0 && (
              <div className="pt-2 border-t border-[#1e202c] space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                  Key Execution Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {ex.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] flex-shrink-0" />
                      <span className="truncate">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Guide Link */}
            {ex.videoUrl && (
              <div className="pt-3 border-t border-[#1e202c] flex items-center justify-between">
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#171822] hover:bg-[#202230] border border-[#2e303d] text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 group/btn"
                >
                  <Play className="w-3.5 h-3.5 fill-[#ff6b00] text-[#ff6b00]" />
                  <span>Watch Video Guide</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover/btn:text-zinc-300" />
                </a>
              </div>
            )}
          </div>
        ))}

        {filteredExercises.length === 0 && (
          <div className="p-10 rounded-3xl bg-[#111218] border border-[#212330] text-center shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center mx-auto">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-extrabold text-white">No Movements Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try searching with another keyword or add a new custom movement to the directory.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl btn-orange text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md active:scale-95 mt-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Movement</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Add New Exercise Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-[#111218] border border-[#212330] rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-[#1c1d27] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1e202c]">
              <div className="w-10 h-10 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Add New Exercise To Library
                </h3>
                <p className="text-xs text-zinc-400">
                  Save exercise once to use across all custom workout splits.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Incline Dumbbell Bench Press"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                    Target Muscle
                  </label>
                  <select
                    value={targetMuscle}
                    onChange={(e) => setTargetMuscle(e.target.value as MuscleGroup)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white focus:outline-none focus:border-[#ff6b00]/60"
                  >
                    {MUSCLE_GROUPS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                    Equipment
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white focus:outline-none focus:border-[#ff6b00]/60"
                  >
                    {EQUIPMENT_TYPES.map((eq) => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Movement Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('Compound')}
                    className={`py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      category === 'Compound' 
                        ? 'bg-[#18151f] text-[#ff6b00] border-[#ff6b00]/50 shadow-md shadow-[#ff6b00]/10' 
                        : 'bg-[#09090b] text-zinc-400 border-[#1e202c]'
                    }`}
                  >
                    Compound Lift
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('Isolation')}
                    className={`py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      category === 'Isolation' 
                        ? 'bg-[#18151f] text-[#ff6b00] border-[#ff6b00]/50 shadow-md shadow-[#ff6b00]/10' 
                        : 'bg-[#09090b] text-zinc-400 border-[#1e202c]'
                    }`}
                  >
                    Isolation Movement
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Alternative Exercise (Badeel)
                </label>
                <input
                  type="text"
                  value={alternativeExercise}
                  onChange={(e) => setAlternativeExercise(e.target.value)}
                  placeholder="e.g. Incline Smith Machine Press / Chest Press Machine"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Video Guide Link (YouTube / URL)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Technique & Form Cue
                </label>
                <input
                  type="text"
                  value={executionCue}
                  onChange={(e) => setExecutionCue(e.target.value)}
                  placeholder="e.g. Retract scapulae, touch lower sternum, 3s eccentric descent..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-bold">
                  Execution Checklist (Comma Separated)
                </label>
                <input
                  type="text"
                  value={tipInput}
                  onChange={(e) => setTipInput(e.target.value)}
                  placeholder="e.g. Keep wrists neutral, Drive feet firmly into floor"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60"
                />
              </div>

              <div className="pt-3 border-t border-[#1e202c] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl hover:bg-[#1e202c] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-orange text-xs font-black cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  Save Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
