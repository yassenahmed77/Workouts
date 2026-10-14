'use client';
import React from 'react';

/**
 * TraineeDietStep - شاشة الخطوة 3: توجيه المدرب لبناء جدول التغذية والماكروز
 */
export function TraineeDietStep({
    createdAthlete,
    onOpenDietStudio,
    onCompleteSetup,
    onClose
}) {
    if (!createdAthlete) return null;

    return (
        <div className="flex flex-col animate-in fade-in duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="gym-heading-card">Step 3: Build Custom Nutrition</h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--main-color)]/15 border border-[var(--main-color)]/35 text-[var(--main-color)] font-bold">
                            {createdAthlete.name}
                        </span>
                    </div>
                    <p className="gym-subtext mt-0.5">
                        Calculate target calories, macros, and scheduled meals
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-medium cursor-pointer"
                    title="Finish Setup"
                >
                    &times;
                </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--main-color)]/30 space-y-3">
                    <div>
                        <h3 className="gym-heading-card">Formulate Diet in Diet Studio</h3>
                        <p className="gym-subtext mt-1">
                            Launch Diet Studio to calculate daily calorie targets, macros (Protein, Carbs, Fats),
                            and scheduled meals for {createdAthlete.name}.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onOpenDietStudio}
                        className="gym-btn-primary w-full py-2.5 px-4 text-xs font-bold text-center"
                    >
                        Open Diet Studio
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
                <button
                    type="button"
                    onClick={onCompleteSetup}
                    className="gym-btn-ghost text-xs"
                >
                    Skip Diet Plan
                </button>

                <button
                    type="button"
                    onClick={onCompleteSetup}
                    className="gym-btn-primary text-xs inline-flex items-center"
                >
                    Finish Setup
                </button>
            </div>
        </div>
    );
}
