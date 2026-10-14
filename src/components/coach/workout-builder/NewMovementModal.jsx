'use client';
import React from 'react';
import { ExerciseFormModal } from '../exercises/ExerciseFormModal';
export const NewMovementModal = ({ isOpen, onClose, onSubmitMovement, name = '', equipment = 'Barbell', muscle = 'Chest', cue = '', alternative = '', videoUrl = '', alternativeVideoUrl = '', onSubmit }) => {
    const handleSubmit = async (data) => {
        if (onSubmitMovement) {
            await onSubmitMovement(data);
        }
        else if (onSubmit) {
            // Legacy wrapper
            onSubmit({ preventDefault: () => { } });
        }
    };
    return (<ExerciseFormModal isOpen={isOpen} onClose={onClose} title="Add New Movement" subtitle="Create a new exercise with video guidance and alternative movement." submitLabel="Save & Add Movement" initialData={{
            name,
            equipment,
            targetMuscle: muscle,
            category: 'Compound',
            executionCue: cue,
            alternativeExercise: alternative,
            videoUrl,
            alternativeVideoUrl
        }} onSubmit={handleSubmit}/>);
};
