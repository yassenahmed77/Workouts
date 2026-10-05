'use client';

import React from 'react';
import { 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Trash2, 
  Plus, 
  SlidersHorizontal 
} from 'lucide-react';
import { RoutineExercise, EquipmentType, MuscleGroup } from '@/types';

const MUSCLE_OPTIONS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes',
  'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];

const EQUIPMENT_OPTIONS: EquipmentType[] = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight',
  'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
];

interface MovementCardProps {
  item: RoutineExercise;
  index: number;
  totalCount: number;
  isDragging: boolean;
  isDragOver: boolean;
  isExpanded: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleExpand: () => void;
  onUpdateExercise: (partial: Partial<RoutineExercise>) => void;
  onRemoveExercise: () => void;
  onOpenVideo: (url: string) => void;
  onAddAlternative: () => void;
  onUpdateAlternative: (altIndex: number, field: 'name' | 'videoUrl', value: string) => void;
  onRemoveAlternative: (altIndex: number) => void;
}

export const MovementCard: React.FC<MovementCardProps> = ({
  item,
  index,
  totalCount,
  isDragging,
  isDragOver,
  isExpanded,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onToggleExpand,
  onUpdateExercise,
  onRemoveExercise,
  onOpenVideo,
  onAddAlternative,
  onUpdateAlternative,
  onRemoveAlternative
}) => {
  const alts = item.alternatives || (item.alternativeExercise ? [{ name: item.alternativeExercise, videoUrl: '' }] : []);
  const altsCount = alts.length;
  const hasNotes = Boolean(item.notes?.trim());

  return (
    <div
      data-movement-card="true"
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      className={`rounded-xl transition-all border ${
        isDragging
          ? 'opacity-40 scale-[0.99] border-white/30 bg-[#0d131f]'
          : isDragOver
          ? 'border-white/40 border-dashed bg-[#0d131f] scale-[1.01]'
          : 'bg-[#080c14] hover:bg-[#0a0f18] border-[#141b26] hover:border-[#1e293b] shadow-xs'
      }`}
    >
      {/* Compact Core Row */}
      <div className="p-2 sm:px-3 sm:py-2 flex flex-col xl:grid xl:grid-cols-12 gap-2 xl:items-center">
        {/* Col 1-5: Drag Handle, Number, Title & Badges */}
        <div className="col-span-5 flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Drag & Quick Up/Down buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <div 
              className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-white/[0.04] text-slate-500 hover:text-slate-300 transition-colors"
              title="Drag to reorder movement"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <button
                type="button"
                disabled={index === 0}
                onClick={onMoveUp}
                className="p-0.5 rounded text-slate-600 hover:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                title="Move Up"
              >
                <ChevronUp className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                disabled={index === totalCount - 1}
                onClick={onMoveDown}
                className="p-0.5 rounded text-slate-600 hover:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                title="Move Down"
              >
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Index Pill */}
          <span className="w-5 h-5 rounded bg-[#0d131f] border border-[#16202e] text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Title & Badges */}
          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate max-w-[130px] sm:max-w-[170px] xl:max-w-[200px]" title={item.exerciseName}>
              {item.exerciseName}
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-300 border border-white/10 flex-shrink-0 font-medium">
              {item.targetMuscle}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06] hidden xl:inline flex-shrink-0">
              {item.equipment}
            </span>
          </div>
        </div>

        {/* Mobile subrow / Desktop columns */}
        <div className="col-span-7 flex items-center justify-between xl:contents gap-2">
          {/* Col 6: Sets */}
          <div className="xl:col-span-1 flex items-center justify-center">
            <div className="flex items-center gap-1 bg-[#05080e] border border-[#16202e] px-1.5 py-0.5 rounded-lg w-full justify-center">
              <span className="xl:hidden text-[9px] font-mono text-slate-500 uppercase font-semibold">Sets</span>
              <input
                type="number"
                min="1"
                max="20"
                value={item.sets}
                onChange={(e) => onUpdateExercise({ sets: Number(e.target.value) })}
                className="w-8 text-center text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Col 7-8: Reps */}
          <div className="xl:col-span-2 flex items-center justify-center">
            <div className="flex items-center gap-1 bg-[#05080e] border border-[#16202e] px-1.5 py-0.5 rounded-lg w-full justify-center">
              <span className="xl:hidden text-[9px] font-mono text-slate-500 uppercase font-semibold">Reps</span>
              <input
                type="text"
                value={item.targetReps}
                onChange={(e) => onUpdateExercise({ targetReps: e.target.value })}
                placeholder="8-12"
                className="w-full max-w-[80px] text-center text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Col 9: RIR / RPE */}
          <div className="xl:col-span-1 flex items-center justify-center">
            <div className="flex items-center gap-1 bg-[#05080e] border border-[#16202e] px-1.5 py-0.5 rounded-lg w-full justify-center">
              <span className="xl:hidden text-[9px] font-mono text-slate-500 uppercase font-semibold">RIR</span>
              <input
                type="text"
                value={item.targetRpe !== undefined ? item.targetRpe : ''}
                onChange={(e) => onUpdateExercise({ targetRpe: e.target.value })}
                placeholder="1-2"
                className="w-full max-w-[55px] text-center text-xs font-numeric font-bold text-slate-200 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Col 10: Rest */}
          <div className="xl:col-span-1 flex items-center justify-center">
            <div className="flex items-center justify-center gap-0.5 bg-[#05080e] border border-[#16202e] px-1.5 py-0.5 rounded-lg w-full">
              <span className="xl:hidden text-[9px] font-mono text-slate-500 uppercase font-semibold">Rest</span>
              <input
                type="number"
                min="15"
                max="600"
                step="15"
                value={item.restSeconds}
                onChange={(e) => onUpdateExercise({ restSeconds: Number(e.target.value) })}
                className="w-8 text-center text-xs font-numeric font-bold text-slate-200 bg-transparent focus:outline-none"
              />
              <span className="text-[9px] font-mono text-slate-500">s</span>
            </div>
          </div>

          {/* Col 11-12: Actions (Video, Details & Swaps, Trash) */}
          <div className="xl:col-span-2 flex items-center justify-end gap-1 flex-shrink-0">
            {item.videoUrl && (
              <button
                type="button"
                onClick={() => onOpenVideo(item.videoUrl || '')}
                className="p-1.5 rounded-lg text-slate-300 bg-white/[0.04] hover:bg-white/[0.1] hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Watch Video Demonstration"
              >
                <Play className="w-3 h-3 fill-current" />
              </button>
            )}

            <button
              type="button"
              onClick={onToggleExpand}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 border transition-all cursor-pointer ${
                isExpanded
                  ? 'bg-white/[0.1] border-white/20 text-white font-bold'
                  : (altsCount > 0 || hasNotes)
                  ? 'bg-white/[0.04] border-white/[0.1] text-slate-300 hover:text-white'
                  : 'bg-[#05080e] border-[#16202e] text-slate-500 hover:text-slate-300'
              }`}
              title="Exercise Details, Notes, and Alternatives"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">Details</span>
              {altsCount > 0 && (
                <span className="px-1 py-0.2 rounded bg-white/[0.1] text-slate-200 text-[9px] font-bold">
                  +{altsCount}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onRemoveExercise}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Remove exercise"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Section: Coach Notes, Video Demonstration, Equipment & Muscle Selectors, Alternatives */}
      {isExpanded && (
        <div className="p-3 pt-2.5 border-t border-[#141b26] bg-[#060910] rounded-b-xl space-y-3 animate-in fade-in-0 duration-150">
          {/* Row 1: Directives & Video Demonstration URL & Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            <div className="md:col-span-5">
              <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                Coach Notes & Directives
              </label>
              <input
                type="text"
                value={item.notes || ''}
                onChange={(e) => onUpdateExercise({ notes: e.target.value })}
                placeholder="e.g. 3s eccentric tempo, pause at stretch"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Video Demonstration URL
                </label>
                {item.videoUrl && (
                  <button
                    type="button"
                    onClick={() => onOpenVideo(item.videoUrl || '')}
                    className="text-[9px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Play Demo</span>
                  </button>
                )}
              </div>
              <input
                type="url"
                value={item.videoUrl || ''}
                onChange={(e) => onUpdateExercise({ videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>

            <div className="md:col-span-3 grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                  Equipment
                </label>
                <select
                  value={item.equipment}
                  onChange={(e) => onUpdateExercise({ equipment: e.target.value as EquipmentType })}
                  className="w-full px-2 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-slate-200 focus:outline-none focus:border-slate-500 cursor-pointer"
                >
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                  Target Muscle
                </label>
                <select
                  value={item.targetMuscle}
                  onChange={(e) => onUpdateExercise({ targetMuscle: e.target.value as MuscleGroup })}
                  className="w-full px-2 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-slate-200 focus:outline-none focus:border-slate-500 cursor-pointer"
                >
                  {MUSCLE_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Alternatives / Badeel Section */}
          <div className="pt-2 border-t border-[#141b26] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Backup Alternatives (Badeel)
                </span>
                {altsCount > 0 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-300 border border-white/10 font-bold">
                    {altsCount}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onAddAlternative}
                className="text-[10px] font-semibold text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all active:scale-95"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Add Alternative</span>
              </button>
            </div>

            {altsCount === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono italic">
                No alternatives set yet. Click &quot;+ Add Alternative&quot; to prescribe backup machines or dumbbell swaps.
              </p>
            ) : (
              <div className="space-y-1.5">
                {alts.map((alt, altIdx) => (
                  <div
                    key={altIdx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center p-1.5 rounded-lg bg-[#05080e] border border-[#16202e]"
                  >
                    <div className="sm:col-span-6 flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-slate-500 w-4 text-center flex-shrink-0">
                        #{altIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={alt.name}
                        onChange={(e) => onUpdateAlternative(altIdx, 'name', e.target.value)}
                        placeholder="Alternative exercise name (e.g. Incline DB Bench)"
                        className="w-full px-2 py-1 rounded bg-[#090e17] border border-[#16202e] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-500 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-5 flex items-center gap-1">
                      <input
                        type="url"
                        value={alt.videoUrl || ''}
                        onChange={(e) => onUpdateAlternative(altIdx, 'videoUrl', e.target.value)}
                        placeholder="Alternative video URL (optional)"
                        className="w-full px-2 py-1 rounded bg-[#090e17] border border-[#16202e] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500 font-mono"
                      />
                      {alt.videoUrl && (
                        <button
                          type="button"
                          onClick={() => onOpenVideo(alt.videoUrl || '')}
                          className="p-1 rounded bg-[#090e17] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-[#16202e] cursor-pointer flex-shrink-0"
                          title="Preview Alt Video"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      )}
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onRemoveAlternative(altIdx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove alternative"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
