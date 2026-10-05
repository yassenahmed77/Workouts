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
    <div className="p-3 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.05]">
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
          VISUAL TRANSFORMATION
        </h4>

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
          <div className="relative w-full h-[270px] rounded-lg bg-[#05080e] border border-white/[0.06] overflow-hidden flex flex-col items-center justify-center">
            {firstCheckIn?.photos?.find((p) => p.angle === activePhotoAngle)?.url ? (
              <img
                src={firstCheckIn.photos.find((p) => p.angle === activePhotoAngle)?.url}
                alt="Start"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-slate-400 font-mono">No Photo</span>
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
          <div className="relative w-full h-[270px] rounded-lg bg-[#05080e] border border-white/[0.06] overflow-hidden flex flex-col items-center justify-center">
            {latestCheckIn?.photos?.find((p) => p.angle === activePhotoAngle)?.url ? (
              <img
                src={latestCheckIn.photos.find((p) => p.angle === activePhotoAngle)?.url}
                alt="Now"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-slate-400 font-mono">No Photo</span>
            )}
            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 border border-white/[0.1] text-[9px] font-mono text-slate-300">
              Now
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 block text-center mt-1.5 w-full">
            {latestCheckIn?.date ? latestCheckIn.date : 'Latest'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenFullscreenCompare}
        className="w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.99] border border-white/[0.08] text-xs font-semibold text-slate-200 text-center cursor-pointer transition-all mt-1"
      >
        Compare Fullscreen
      </button>
    </div>
  );
};
