'use client';

import React from 'react';
import { UserGoal } from '@/types';

interface ProfileBiometricsStripProps {
  currentWeightKg: number;
  statusText?: string;
  targetWeightKg: number;
  goal: UserGoal;
}

export const ProfileBiometricsStrip: React.FC<ProfileBiometricsStripProps> = React.memo(({
  currentWeightKg,
  statusText,
  targetWeightKg,
  goal
}) => {
  const deltaKg = Math.abs(Number(currentWeightKg) - Number(targetWeightKg)).toFixed(1);

  return (
    <div className="gym-card grid grid-cols-3 divide-x divide-white/[0.06] text-center p-2.5 sm:p-3 items-stretch">
      {/* 1. Current Weight */}
      <div className="px-1 sm:px-2 flex flex-col justify-between h-full min-w-0">
        <div>
          <span className="gym-label-mono block text-[9px] sm:text-[10px] truncate max-w-full">
            Current Weight
          </span>
          <span className="gym-num text-sm sm:text-base md:text-lg block mt-0.5 whitespace-nowrap">
            {currentWeightKg} <span className="gym-subtext text-[10px] sm:text-xs">kg</span>
          </span>
        </div>
        <div className="h-4 flex items-center justify-center mt-0.5">
          {statusText && statusText !== 'No Check-ins Yet' ? (
            <span className="gym-delta-blue text-[8.5px] sm:text-[9.5px] truncate max-w-full">
              {statusText}
            </span>
          ) : null}
        </div>
      </div>

      {/* 2. Target Weight */}
      <div className="px-1 sm:px-2 flex flex-col justify-between h-full min-w-0">
        <div>
          <span className="gym-label-mono block text-[9px] sm:text-[10px] truncate max-w-full">
            Target Weight
          </span>
          <span className="gym-num text-sm sm:text-base md:text-lg block mt-0.5 text-[var(--main-color)] whitespace-nowrap">
            {targetWeightKg} <span className="gym-subtext text-[10px] sm:text-xs">kg</span>
          </span>
        </div>
        <div className="h-4 flex items-center justify-center mt-0.5">
          <span className="gym-label-mono text-zinc-500 text-[8.5px] sm:text-[9.5px] truncate max-w-full">
            {deltaKg}kg to Goal
          </span>
        </div>
      </div>

      {/* 3. Primary Goal */}
      <div className="px-1 sm:px-2 flex flex-col justify-between h-full min-w-0">
        <div>
          <span className="gym-label-mono block text-[9px] sm:text-[10px] truncate max-w-full">
            Primary Goal
          </span>
          <span className="gym-num text-[11px] sm:text-xs md:text-sm block mt-0.5 truncate max-w-full text-zinc-200" title={goal}>
            {goal.split('/')[0].trim()}
          </span>
        </div>
        <div className="h-4 flex items-center justify-center mt-0.5">
          <span className="gym-label-mono text-zinc-500 text-[8.5px] sm:text-[9.5px] truncate max-w-full">
            Target Focus
          </span>
        </div>
      </div>
    </div>
  );
});

ProfileBiometricsStrip.displayName = 'ProfileBiometricsStrip';
