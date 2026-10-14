'use client';
import React from 'react';
import { Play, Trash2, Plus, SlidersHorizontal } from 'lucide-react';
const MUSCLE_OPTIONS = [
    'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes',
    'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];
const EQUIPMENT_OPTIONS = [
    'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight',
    'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
];
export const MovementCard = ({ item, index, totalCount, isDragging, isDragOver, isExpanded, onDragStart, onDragEnter, onDragEnd, onMoveUp, onMoveDown, onToggleExpand, onUpdateExercise, onRemoveExercise, onOpenVideo, onAddAlternative, onUpdateAlternative, onRemoveAlternative }) => {
    const alts = item.alternatives || (item.alternativeExercise ? [{ name: item.alternativeExercise, videoUrl: '' }] : []);
    const altsCount = alts.length;
    const hasNotes = Boolean(item.notes?.trim());
    return (<div data-movement-card="true" draggable onDragStart={onDragStart} onDragEnter={onDragEnter} onDragOver={(e) => e.preventDefault()} onDragEnd={onDragEnd} className={`rounded-xl transition-all border ${isDragging
            ? 'opacity-40 scale-[0.99] border-white/30 bg-[var(--card-subtle-bg)]'
            : isDragOver
                ? 'border-white/40 border-dashed bg-[var(--card-subtle-bg)] scale-[1.01]'
                : 'bg-[var(--card-bg)] hover:bg-[var(--card-subtle-bg)] border-[var(--card-border)] hover:border-white/20 shadow-xs'}`}>
      {/* 1. Header Row: #01 & Exercise Name on Left; Video, Details Icon & Delete on Far Right */}
      <div className="px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-2 border-b border-white/[0.06]">
        {/* Left: Index Pill + Title + Target Muscle Badge */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 font-mono text-[9px] sm:text-[10px] flex items-center justify-center font-bold flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h4 className="text-[11px] sm:text-xs md:text-sm font-semibold text-white tracking-tight truncate max-w-[100px] xs:max-w-[140px] sm:max-w-xs xl:max-w-md" title={item.exerciseName}>
            {item.exerciseName}
          </h4>
          <span className="text-[8.5px] sm:text-[9.5px] font-mono px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/10 flex-shrink-0 font-medium">
            {item.targetMuscle}
          </span>
          {item.equipment && (<span className="text-[8.5px] sm:text-[9.5px] font-mono px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06] hidden sm:inline flex-shrink-0">
              {item.equipment}
            </span>)}
        </div>

        {/* Right: Actions (Video Demo, Details Icon, Delete) */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {item.videoUrl && (<button type="button" onClick={() => onOpenVideo(item.videoUrl || '')} className="p-1 sm:p-1.5 rounded-lg text-slate-300 bg-white/[0.04] hover:bg-white/[0.1] hover:text-white border border-white/10 transition-colors cursor-pointer" title="Watch Video Demonstration">
              <Play className="w-3 h-3 fill-current"/>
            </button>)}

          <button type="button" onClick={onToggleExpand} className={`p-1 sm:p-1.5 rounded-lg text-[9px] sm:text-[10px] font-mono flex items-center gap-1 border transition-all cursor-pointer ${isExpanded
            ? 'bg-white/[0.1] border-white/20 text-white font-bold'
            : (altsCount > 0 || hasNotes)
                ? 'bg-white/[0.04] border-white/[0.1] text-slate-300 hover:text-white'
                : 'bg-[var(--input-bg)] border-[var(--input-border)] text-slate-500 hover:text-slate-300'}`} title="Exercise Details, Notes, and Alternatives">
            <SlidersHorizontal className="w-3.5 h-3.5"/>
            {altsCount > 0 && (<span className="px-1 py-0.2 rounded bg-white/[0.1] text-slate-200 text-[8.5px] sm:text-[9px] font-bold">
                +{altsCount}
              </span>)}
          </button>

          <button type="button" onClick={onRemoveExercise} className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Remove exercise">
            <Trash2 className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>

      {/* 2. Numerical Inputs Row: Sets, Reps, RIR, Rest (Responsive Sizing: Tablet -> Mobile -> 320px) */}
      <div className="p-1.5 sm:px-3 sm:py-2 grid grid-cols-4 gap-1 sm:gap-2.5 items-center">
        {/* Sets */}
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 bg-[var(--input-bg)] border border-[var(--input-border)] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg">
          <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase font-semibold flex-shrink-0">Sets</span>
          <input type="number" min="1" max="20" value={item.sets} onChange={(e) => onUpdateExercise({ sets: Number(e.target.value) })} className="w-5 xs:w-6 sm:w-8 text-center text-[10px] xs:text-[11px] sm:text-xs font-numeric font-bold text-white bg-transparent focus:outline-none p-0"/>
        </div>

        {/* Reps */}
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 bg-[var(--input-bg)] border border-[var(--input-border)] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg">
          <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase font-semibold flex-shrink-0">Reps</span>
          <input type="text" value={item.targetReps} onChange={(e) => onUpdateExercise({ targetReps: e.target.value })} placeholder="8-12" className="w-full max-w-[42px] xs:max-w-[55px] sm:max-w-[70px] text-center text-[10px] xs:text-[11px] sm:text-xs font-numeric font-bold text-white bg-transparent focus:outline-none p-0"/>
        </div>

        {/* RIR */}
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 bg-[var(--input-bg)] border border-[var(--input-border)] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg">
          <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase font-semibold flex-shrink-0">RIR</span>
          <input type="text" value={item.targetRpe !== undefined ? item.targetRpe : ''} onChange={(e) => onUpdateExercise({ targetRpe: e.target.value })} placeholder="1-2" className="w-full max-w-[32px] xs:max-w-[38px] sm:max-w-[45px] text-center text-[10px] xs:text-[11px] sm:text-xs font-numeric font-bold text-slate-200 bg-transparent focus:outline-none p-0"/>
        </div>

        {/* Rest */}
        <div className="flex items-center justify-center gap-0.5 bg-[var(--input-bg)] border border-[var(--input-border)] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg">
          <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase font-semibold flex-shrink-0">Rest</span>
          <input type="number" min="15" max="600" step="15" value={item.restSeconds} onChange={(e) => onUpdateExercise({ restSeconds: Number(e.target.value) })} className="w-6 xs:w-7 sm:w-8 text-center text-[10px] xs:text-[11px] sm:text-xs font-numeric font-bold text-slate-200 bg-transparent focus:outline-none p-0"/>
          <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] font-mono text-slate-500 flex-shrink-0">s</span>
        </div>
      </div>

      {/* 3. Collapsible Section: Coach Notes, Video Demonstration, Equipment & Muscle Selectors, Alternatives */}
      {isExpanded && (<div className="p-2.5 sm:p-3 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)] rounded-b-xl space-y-2.5 animate-in fade-in-0 duration-150">
          {/* Row 1: Coach Notes & Video URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] sm:text-[8.5px] font-mono uppercase tracking-wider text-slate-400 mb-0.5 font-semibold">
                Coach Notes & Directives
              </label>
              <input type="text" value={item.notes || ''} onChange={(e) => onUpdateExercise({ notes: e.target.value })} placeholder="e.g. 3s eccentric tempo, pause at stretch" className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[var(--main-color)]"/>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[8px] sm:text-[8.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Video Demonstration URL
                </label>
                {item.videoUrl && (<button type="button" onClick={() => onOpenVideo(item.videoUrl || '')} className="text-[8px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer font-medium">
                    <Play className="w-2.5 h-2.5 fill-current"/>
                    <span>Play Demo</span>
                  </button>)}
              </div>
              <input type="url" value={item.videoUrl || ''} onChange={(e) => onUpdateExercise({ videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[var(--main-color)] font-mono"/>
            </div>
          </div>

          {/* Row 2: Equipment & Target Muscle Selectors (50% / 50% split) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] sm:text-[8.5px] font-mono uppercase tracking-wider text-slate-400 mb-0.5 font-semibold">
                Equipment
              </label>
              <select value={item.equipment} onChange={(e) => onUpdateExercise({ equipment: e.target.value })} className="w-full px-2 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-slate-200 focus:outline-none focus:border-[var(--main-color)] cursor-pointer">
                {EQUIPMENT_OPTIONS.map((eq) => (<option key={eq} value={eq}>{eq}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-[8px] sm:text-[8.5px] font-mono uppercase tracking-wider text-slate-400 mb-0.5 font-semibold">
                Target Muscle
              </label>
              <select value={item.targetMuscle} onChange={(e) => onUpdateExercise({ targetMuscle: e.target.value })} className="w-full px-2 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-slate-200 focus:outline-none focus:border-[var(--main-color)] cursor-pointer">
                {MUSCLE_OPTIONS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
          </div>

          {/* Row 2: Alternatives / Badeel Section */}
          <div className="pt-2 border-t border-[var(--card-border)] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Backup Alternatives (Badeel)
                </span>
                {altsCount > 0 && (<span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-300 border border-white/10 font-bold">
                    {altsCount}
                  </span>)}
              </div>

              <button type="button" onClick={onAddAlternative} className="text-[10px] font-semibold text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all active:scale-95">
                <Plus className="w-3 h-3 stroke-[2.5]"/>
                <span>Add Alternative</span>
              </button>
            </div>

            {altsCount === 0 ? (<p className="text-[10px] text-slate-500 font-mono italic">
                No alternatives set yet. Click &quot;+ Add Alternative&quot; to prescribe backup machines or dumbbell swaps.
              </p>) : (<div className="space-y-1.5">
                {alts.map((alt, altIdx) => (<div key={altIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center p-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <div className="sm:col-span-6 flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-slate-500 w-4 text-center flex-shrink-0">
                        #{altIdx + 1}
                      </span>
                      <input type="text" value={alt.name} onChange={(e) => onUpdateAlternative(altIdx, 'name', e.target.value)} placeholder="Alternative exercise name (e.g. Incline DB Bench)" className="w-full px-2 py-1 rounded bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[var(--main-color)] font-medium"/>
                    </div>

                    <div className="sm:col-span-5 flex items-center gap-1">
                      <input type="url" value={alt.videoUrl || ''} onChange={(e) => onUpdateAlternative(altIdx, 'videoUrl', e.target.value)} placeholder="Alternative video URL (optional)" className="w-full px-2 py-1 rounded bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[var(--main-color)] font-mono"/>
                      {alt.videoUrl && (<button type="button" onClick={() => onOpenVideo(alt.videoUrl || '')} className="p-1 rounded bg-[var(--input-bg)] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-[var(--input-border)] cursor-pointer flex-shrink-0" title="Preview Alt Video">
                          <Play className="w-3 h-3 fill-current"/>
                        </button>)}
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button type="button" onClick={() => onRemoveAlternative(altIdx)} className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Remove alternative">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>))}
              </div>)}
          </div>
        </div>)}
    </div>);
};
