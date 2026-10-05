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
    <div className="p-4 sm:p-5 rounded-3xl bg-[#18191e] border border-[#24262e] shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white">Hydration Tracker</span>
        <span className="text-xs font-mono font-bold text-white tabular-nums">
          {currentWaterLiters.toFixed(1)} <span className="text-[10px] text-[#8e8e93]">/ {targetWaterLiters}L</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-[#15161a] overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#2f80ed] rounded-full transition-all duration-300"
          style={{ width: `${waterPercent}%` }}
        />
      </div>

      {/* Stepper Buttons */}
      <div className="flex items-center justify-between pt-0.5">
        <button
          type="button"
          onClick={() => onWaterStep(-0.25)}
          className="px-2.5 py-1 rounded-lg bg-[#15161a] hover:bg-[#1c1d22] border border-[#24262e] text-xs font-mono text-[#8e8e93] hover:text-white flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
          aria-label="Decrease water by 250ml"
        >
          <Minus className="w-3 h-3" />
          <span>250ml</span>
        </button>

        <span className="text-[10px] font-mono text-[#2f80ed] font-semibold">
          {waterPercent}% Goal
        </span>

        <button
          type="button"
          onClick={() => onWaterStep(0.25)}
          className="px-2.5 py-1 rounded-lg bg-[#1c1d22] hover:bg-[#22242b] border border-[#2f80ed]/40 text-xs font-mono text-white flex items-center gap-1 cursor-pointer transition-colors active:scale-95 shadow-sm"
          aria-label="Increase water by 250ml"
        >
          <Plus className="w-3 h-3 text-[#2f80ed]" />
          <span>250ml</span>
        </button>
      </div>
    </div>
  );
});
