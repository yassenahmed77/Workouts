'use client';

import React from 'react';
import { Droplets, Info } from 'lucide-react';

interface DietSupplementsDirectivesCardProps {
  waterTargetLiters?: number;
  notes?: string;
}

export const DietSupplementsDirectivesCard: React.FC<DietSupplementsDirectivesCardProps> = React.memo(({
  waterTargetLiters = 3.5,
  notes
}) => {
  if (!waterTargetLiters && !notes) return null;

  return (
    <div className="gym-card space-y-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--card-bg)] border-[var(--card-border)]">
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--card-border)]">
        <Info className="w-4 h-4 text-[var(--main-color)]" />
        <h3 className="gym-heading-card">Coach Nutrition Directives</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {waterTargetLiters > 0 && (
          <div className="gym-card-subtle p-3 rounded-xl border border-[var(--card-border)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--main-color)]/10 border border-[var(--main-color)]/25 flex items-center justify-center text-[var(--main-color)] flex-shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="gym-label-mono block text-[var(--main-color)]">HYDRATION TARGET</span>
              <span className="text-sm font-bold font-mono text-white block mt-0.5">
                {waterTargetLiters.toFixed(1)} Liters / Day
              </span>
            </div>
          </div>
        )}

        {notes && (
          <div className="gym-card-subtle p-3 rounded-xl border border-[var(--card-border)] space-y-1">
            <span className="gym-label-mono block text-[var(--main-color)]">SUPPLEMENTS & NOTES</span>
            <p className="gym-subtext text-xs text-zinc-300 leading-relaxed">
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

DietSupplementsDirectivesCard.displayName = 'DietSupplementsDirectivesCard';
