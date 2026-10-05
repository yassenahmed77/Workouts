'use client';

import React, { FormEvent } from 'react';
import { X } from 'lucide-react';
import { EquipmentType, MuscleGroup } from '@/types';
import { SelectDropdown } from '@/components/ui/SelectDropdown';

const MUSCLE_OPTIONS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes',
  'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];

const EQUIPMENT_OPTIONS: EquipmentType[] = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight',
  'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
];

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  onNameChange: (val: string) => void;
  equipment: EquipmentType;
  onEquipmentChange: (val: EquipmentType) => void;
  muscle: MuscleGroup;
  onMuscleChange: (val: MuscleGroup) => void;
  cue: string;
  onCueChange: (val: string) => void;
  alternative: string;
  onAlternativeChange: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export const NewMovementModal: React.FC<NewMovementModalProps> = ({
  isOpen,
  onClose,
  name,
  onNameChange,
  equipment,
  onEquipmentChange,
  muscle,
  onMuscleChange,
  cue,
  onCueChange,
  alternative,
  onAlternativeChange,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#090d14] border border-[#16202e] rounded-2xl p-5 shadow-2xl relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#141a24]">
          <h3 className="text-sm font-bold text-white">Add New Movement</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">Exercise Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Incline DB Bench Press"
              className="w-full px-3 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white focus:outline-none focus:border-slate-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SelectDropdown
              label="Equipment"
              value={equipment}
              onChange={(val) => onEquipmentChange(val as EquipmentType)}
              options={EQUIPMENT_OPTIONS}
            />

            <SelectDropdown
              label="Target Muscle"
              value={muscle}
              onChange={(val) => onMuscleChange(val as MuscleGroup)}
              options={MUSCLE_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">Key Form Cue</label>
            <input
              type="text"
              value={cue}
              onChange={(e) => onCueChange(e.target.value)}
              placeholder="e.g. Retract scapulae, pause at bottom"
              className="w-full px-3 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1">Alternative Exercise (Badeel)</label>
            <input
              type="text"
              value={alternative}
              onChange={(e) => onAlternativeChange(e.target.value)}
              placeholder="e.g. Smith Machine Incline Press"
              className="w-full px-3 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-[#080c14] bg-white hover:bg-slate-100 rounded-lg shadow-sm cursor-pointer"
            >
              Save & Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
