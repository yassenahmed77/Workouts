'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface HydrationCardProps {
  hasWaterTarget: boolean;
  currentWaterLiters: number;
  targetWaterLiters: number;
  waterPercent: number;
  onWaterStep: (stepDelta: number) => void;
}

export const HydrationCard: React.FC<HydrationCardProps> = React.memo(({
  hasWaterTarget,
  currentWaterLiters,
  targetWaterLiters,
  waterPercent,
  onWaterStep
}) => {
  if (!hasWaterTarget) return null;

  return (
    <div className="gym-card space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="gym-heading-card">Hydration Tracker</span>
        <span className="text-xs font-mono font-bold text-white tabular-nums">
          {currentWaterLiters.toFixed(1)} <span className="text-[10px] text-[var(--gym-text-muted)]">/ {targetWaterLiters}L</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-[var(--gym-surface-base)] overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-[var(--main-color)] rounded-full transition-all duration-300"
          style={{ width: `${waterPercent}%` }}
        />
      </div>

      {/* Stepper Buttons */}
      <div className="flex items-center justify-between pt-0.5">
        <button
          type="button"
          onClick={() => onWaterStep(-0.25)}
          className="gym-btn-secondary text-xs px-2.5 py-1"
          aria-label="Decrease water by 250ml"
        >
          <Minus className="w-3 h-3" />
          <span>250ml</span>
        </button>

        <span className="text-[10px] font-mono text-[var(--gym-accent-primary)] font-semibold">
          {waterPercent}% Goal
        </span>

        <button
          type="button"
          onClick={() => onWaterStep(0.25)}
          className="gym-btn-primary text-xs px-2.5 py-1"
          aria-label="Increase water by 250ml"
        >
          <Plus className="w-3 h-3" />
          <span>250ml</span>
        </button>
      </div>
    </div>
  );
});
