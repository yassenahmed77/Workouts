'use client';
import React from 'react';

/**
 * TraineeWorkoutStep - شاشة الخطوة 2: توجيه المدرب لبناء جدول التمارين المخصص
 */
export function TraineeWorkoutStep({
    createdAthlete,
    onOpenSplitsStudio,
    onSkipWorkout,
    onClose
}) {
    if (!createdAthlete) return null;

    return (
        <div className="flex flex-col animate-in fade-in duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="gym-heading-card">Step 2: Build Custom Workout Plan</h2>
                        <span className="gym-delta-blue">{createdAthlete.name}</span>
                    </div>
                    <p className="gym-subtext mt-0.5">
                        Design a personalized training split and exercises for this athlete
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-medium cursor-pointer"
                    title="Finish Later"
                >
                    &times;
                </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                <div className="p-4 rounded-xl gym-card space-y-3">
                    <div>
                        <h3 className="gym-heading-card">Build Routine in Splits Studio</h3>
                        <p className="gym-subtext mt-1">
                            Launch Splits Studio to craft a tailored workout routine, muscle split, exercise selection,
                            sets, reps, and rest periods specifically for {createdAthlete.name}.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onOpenSplitsStudio}
                        className="gym-btn-primary w-full py-2.5 px-4 text-xs font-bold text-center"
                    >
                        Open Splits Studio
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
                <button
                    type="button"
                    onClick={onSkipWorkout}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    Skip Workout Plan &amp; Continue to Diet
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    Finish Later
                </button>
            </div>
        </div>
    );
}
