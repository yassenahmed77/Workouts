'use client';

import React from 'react';
import { WeeklyCheckIn } from '@/types';

interface ClientPhysiquePhotosCardProps {
  activePhotoAngle: 'front' | 'side' | 'back';
  setActivePhotoAngle: (angle: 'front' | 'side' | 'back') => void;
  firstCheckIn?: WeeklyCheckIn;
  latestCheckIn?: WeeklyCheckIn;
  onOpenFullscreenCompare: () => void;
}

export const ClientPhysiquePhotosCard: React.FC<ClientPhysiquePhotosCardProps> = ({
  activePhotoAngle,
  setActivePhotoAngle,
  firstCheckIn,
  latestCheckIn,
  onOpenFullscreenCompare
}) => {
  return (
    <div className="gym-card space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.07]">
        <span className="gym-label-mono">
          VISUAL TRANSFORMATION
        </span>

        {/* Angle Selector */}
        <div className="flex items-center gap-1 p-0.5 rounded bg-black/50 border border-white/[0.06] text-[10px] font-mono">
          {(['front', 'side', 'back'] as const).map((angle) => (
            <button
              key={angle}
              type="button"
              onClick={() => setActivePhotoAngle(angle)}
              className={`px-1.5 py-0.5 rounded uppercase transition-all cursor-pointer ${
                activePhotoAngle === angle
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {angle}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Display Card: FULL WIDTH & Centered underneath */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {/* Baseline Photo */}
        <div className="w-full flex flex-col items-center">
          <div className="relative w-full h-[270px] rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] overflow-hidden flex flex-col items-center justify-center">
            {firstCheckIn?.photos?.find((p) => p.angle === activePhotoAngle)?.url ? (
              <img
                src={firstCheckIn.photos.find((p) => p.angle === activePhotoAngle)?.url}
                alt="Start"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="gym-subtext font-mono">No Photo</span>
            )}
            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 border border-white/[0.1] text-[9px] font-mono text-slate-300">
              Start
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 block text-center mt-1.5 w-full">
            {firstCheckIn?.date ? firstCheckIn.date : 'Start Date'}
          </span>
        </div>

        {/* Latest Photo */}
        <div className="w-full flex flex-col items-center">
          <div className="relative w-full h-[270px] rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] overflow-hidden flex flex-col items-center justify-center">
            {latestCheckIn?.photos?.find((p) => p.angle === activePhotoAngle)?.url ? (
              <img
                src={latestCheckIn.photos.find((p) => p.angle === activePhotoAngle)?.url}
                alt="Now"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="gym-subtext font-mono">No Photo</span>
            )}
            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 border border-white/[0.1] text-[9px] font-mono text-slate-300">
              Now
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--main-color)] font-semibold block text-center mt-1.5 w-full">
            {latestCheckIn?.date ? latestCheckIn.date : 'Latest'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenFullscreenCompare}
        className="gym-btn-secondary w-full text-xs"
      >
        Compare Fullscreen
      </button>
    </div>
  );
};
