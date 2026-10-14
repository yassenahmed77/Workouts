'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { sanitizeString, sanitizeUrl } from '@/lib/sanitizer';
import { useEscapeKey } from '@/hooks/useEscapeKey';
const MUSCLE_OPTIONS = [
    'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes',
    'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];
const EQUIPMENT_OPTIONS = [
    'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight',
    'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
];
export const ExerciseFormModal = ({ isOpen, onClose, title = 'Add New Exercise', subtitle = 'Create a new exercise with form cues and video guidance.', submitLabel = 'Save Exercise', initialData, onSubmit }) => {
    const [name, setName] = useState('');
    const [targetMuscle, setTargetMuscle] = useState('Chest');
    const [equipment, setEquipment] = useState('Barbell');
    const [category, setCategory] = useState('Compound');
    const [videoUrl, setVideoUrl] = useState('');
    const [alternativeExercise, setAlternativeExercise] = useState('');
    const [alternativeVideoUrl, setAlternativeVideoUrl] = useState('');
    const [executionCue, setExecutionCue] = useState('');
    const [tipsInput, setTipsInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    // Sync initialData or reset
    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setTargetMuscle(initialData?.targetMuscle || 'Chest');
            setEquipment(initialData?.equipment || 'Barbell');
            setCategory(initialData?.category || 'Compound');
            setVideoUrl(initialData?.videoUrl || '');
            setAlternativeExercise(initialData?.alternativeExercise || '');
            setAlternativeVideoUrl(initialData?.alternativeVideoUrl || '');
            setExecutionCue(initialData?.executionCue || '');
            setTipsInput(initialData?.tips?.join(', ') || '');
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen, initialData]);

    // Escape key listener
    useEscapeKey(isOpen, onClose);

    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanName = sanitizeString(name.trim());
        if (!cleanName) {
            setError('Exercise name is required');
            return;
        }
        setIsSubmitting(true);
        try {
            const parsedTips = tipsInput
                ? tipsInput.split(',').map((t) => sanitizeString(t.trim())).filter(Boolean)
                : ['Maintain strict form', 'Control tempo'];
            await onSubmit({
                name: cleanName,
                targetMuscle,
                equipment,
                category,
                videoUrl: videoUrl.trim() ? sanitizeUrl(videoUrl.trim()) : undefined,
                alternativeExercise: alternativeExercise.trim() ? sanitizeString(alternativeExercise.trim()) : undefined,
                alternativeVideoUrl: alternativeVideoUrl.trim() ? sanitizeUrl(alternativeVideoUrl.trim()) : undefined,
                executionCue: executionCue.trim() ? sanitizeString(executionCue.trim()) : 'Execute with strict form.',
                tips: parsedTips
            });
            onClose();
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer overflow-hidden" onClick={(e) => {
            if (e.target === e.currentTarget)
                onClose();
        }} role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl lg:max-w-3xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 cursor-default max-h-[94dvh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-3 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="gym-heading-card text-sm font-bold text-white tracking-tight">
              {title}
            </h3>
            {subtitle && (<p className="gym-subtext text-[11px] text-slate-400 mt-0.5">
                {subtitle}
              </p>)}
          </div>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm cursor-pointer" title="Close">
            <X className="w-3.5 h-3.5"/>
          </button>
        </div>

        {/* Form Body - 2 Column Balanced Grid (Zero Desktop Scrollbar) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-3.5 sm:p-4.5 overflow-y-auto md:overflow-visible custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">
              
              {/* Column 1: Primary Exercise Specs */}
              <div className="space-y-2.5">
                {/* Exercise Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Exercise Name <span className="text-rose-400">*</span>
                    </label>
                    {error && (<span className="text-[9px] text-rose-400 font-mono font-medium">{error}</span>)}
                  </div>
                  <input type="text" required value={name} onChange={(e) => {
            setName(e.target.value);
            if (error)
                setError('');
        }} placeholder="e.g. Incline Dumbbell Bench Press" className={`w-full px-2.5 py-1.5 h-8 rounded-xl bg-[var(--input-bg)] border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${error ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'}`}/>
                </div>

                {/* Target Muscle & Equipment Dropdowns */}
                <div className="grid grid-cols-2 gap-2">
                  <SelectDropdown label="Target Muscle" size="sm" value={targetMuscle} onChange={(val) => setTargetMuscle(val)} options={MUSCLE_OPTIONS}/>

                  <SelectDropdown label="Equipment" size="sm" value={equipment} onChange={(val) => setEquipment(val)} options={EQUIPMENT_OPTIONS}/>
                </div>

                {/* Lift Type Segmented Switch */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Lift Type
                  </label>
                  <div className="flex items-center p-0.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] h-8">
                    <button type="button" onClick={() => setCategory('Compound')} className={`flex-1 h-6 rounded-lg text-xs font-semibold transition-all cursor-pointer ${category === 'Compound'
            ? 'bg-[var(--main-color)] text-white shadow-sm'
            : 'text-slate-400 hover:text-white'}`}>
                      Compound Lift
                    </button>
                    <button type="button" onClick={() => setCategory('Isolation')} className={`flex-1 h-6 rounded-lg text-xs font-semibold transition-all cursor-pointer ${category === 'Isolation'
            ? 'bg-[var(--main-color)] text-white shadow-sm'
            : 'text-slate-400 hover:text-white'}`}>
                      Isolation Movement
                    </button>
                  </div>
                </div>

                {/* Main Video Guide URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Video Guide URL (Primary)
                    </label>
                    <span className="text-[9.5px] text-slate-500 font-mono">
                      YouTube / Direct Link
                    </span>
                  </div>
                  <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/... or MP4 link" className="w-full px-2.5 py-1.5 h-8 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors"/>
                </div>
              </div>

              {/* Column 2: Alternative (Badeel) & Technique Cues */}
              <div className="space-y-2.5">
                {/* Alternative Exercise (Badeel) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Alternative Exercise (Badeel)
                    </label>
                    <span className="text-[9.5px] text-slate-500 font-mono">
                      Swap alternative
                    </span>
                  </div>
                  <input type="text" value={alternativeExercise} onChange={(e) => setAlternativeExercise(e.target.value)} placeholder="e.g. Chest Press Machine / Smith Press" className="w-full px-2.5 py-1.5 h-8 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors"/>
                </div>

                {/* Alternative Exercise Video URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--main-color)] font-semibold">
                      Alternative Video URL (Badeel)
                    </label>
                    <span className="text-[9.5px] text-slate-500 font-mono">
                      Alternative Video
                    </span>
                  </div>
                  <input type="url" value={alternativeVideoUrl} onChange={(e) => setAlternativeVideoUrl(e.target.value)} placeholder="https://youtube.com/... or MP4 link" className="w-full px-2.5 py-1.5 h-8 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors"/>
                </div>

                {/* Key Form Cue */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Key Form Cue
                    </label>
                    <span className="text-[9.5px] text-slate-500 font-mono">
                      Main cue
                    </span>
                  </div>
                  <input type="text" value={executionCue} onChange={(e) => setExecutionCue(e.target.value)} placeholder="e.g. Retract scapulae, touch lower sternum" className="w-full px-2.5 py-1.5 h-8 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors"/>
                </div>

                {/* Form Checklist (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Form Checklist (Optional)
                    </label>
                    <span className="text-[9.5px] text-slate-500 font-mono">
                      Comma separated
                    </span>
                  </div>
                  <input type="text" value={tipsInput} onChange={(e) => setTipsInput(e.target.value)} placeholder="e.g. Keep wrists neutral, Drive heels" className="w-full px-2.5 py-1.5 h-8 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors"/>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-2.5 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-end gap-2 flex-shrink-0">
            <button type="button" onClick={onClose} className="gym-btn-ghost text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="gym-btn-primary text-xs">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>);
};
