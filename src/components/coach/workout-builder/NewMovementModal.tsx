'use client';

import React, { FormEvent } from 'react';
import { EquipmentType, MuscleGroup } from '@/types';
import { ExerciseFormModal, ExerciseFormData } from '../exercises/ExerciseFormModal';

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Modern unified submit
  onSubmitMovement?: (data: ExerciseFormData) => void | Promise<void>;
  
  // Backward compatibility props
  name?: string;
  onNameChange?: (val: string) => void;
  equipment?: EquipmentType;
  onEquipmentChange?: (val: EquipmentType) => void;
  muscle?: MuscleGroup;
  onMuscleChange?: (val: MuscleGroup) => void;
  cue?: string;
  onCueChange?: (val: string) => void;
  alternative?: string;
  onAlternativeChange?: (val: string) => void;
  videoUrl?: string;
  onVideoUrlChange?: (val: string) => void;
  alternativeVideoUrl?: string;
  onAlternativeVideoUrlChange?: (val: string) => void;
  onSubmit?: (e: FormEvent) => void;
}

export const NewMovementModal: React.FC<NewMovementModalProps> = ({
  isOpen,
  onClose,
  onSubmitMovement,
  name = '',
  equipment = 'Barbell',
  muscle = 'Chest',
  cue = '',
  alternative = '',
  videoUrl = '',
  alternativeVideoUrl = '',
  onSubmit
}) => {
  const handleSubmit = async (data: ExerciseFormData) => {
    if (onSubmitMovement) {
      await onSubmitMovement(data);
    } else if (onSubmit) {
      // Legacy wrapper
      onSubmit({ preventDefault: () => {} } as FormEvent);
    }
  };

  return (
    <ExerciseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Movement"
      subtitle="Create a new exercise with video guidance and alternative movement."
      submitLabel="Save & Add Movement"
      initialData={{
        name,
        equipment,
        targetMuscle: muscle,
        category: 'Compound',
        executionCue: cue,
        alternativeExercise: alternative,
        videoUrl,
        alternativeVideoUrl
      }}
      onSubmit={handleSubmit}
    />
  );
};
