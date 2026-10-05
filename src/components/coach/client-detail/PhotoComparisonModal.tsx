'use client';

import React, { useState, useEffect } from 'react';
import { User, WeeklyCheckIn } from '@/types';
import { X, Split } from 'lucide-react';

interface PhotoComparisonModalProps {
  client: User;
  checkIns: WeeklyCheckIn[];
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoComparisonModal: React.FC<PhotoComparisonModalProps> = ({
  client,
  checkIns,
  isOpen,
  onClose
}) => {
  const [selectedAngle, setSelectedAngle] = useState<'front' | 'side' | 'back'>('front');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [viewMode, setViewMode] = useState<'slider' | 'side_by_side'>('slider');

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sortedCheckIns = [...checkIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const baselineCheckIn = sortedCheckIns[0];
  const latestCheckIn = sortedCheckIns[sortedCheckIns.length - 1];

  const baselinePhoto = baselineCheckIn?.photos.find((p) => p.angle === selectedAngle);
  const latestPhoto = latestCheckIn?.photos.find((p) => p.angle === selectedAngle);

  // Delta calculations
  const weightDelta =
    baselineCheckIn && latestCheckIn
      ? Math.round((latestCheckIn.weightKg - baselineCheckIn.weightKg) * 10) / 10
      : 0;

  const waistDelta =
    baselineCheckIn?.measurements?.waistCm && latestCheckIn?.measurements?.waistCm
      ? Math.round((latestCheckIn.measurements.waistCm - baselineCheckIn.measurements.waistCm) * 10) / 10
      : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl rounded-xl bg-[#090d14] border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Clean Typography, Calm Monochrome) */}
        <div className="p-3.5 sm:p-4 border-b border-white/[0.06] flex items-center justify-between gap-3 bg-[#070a10]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Photo Comparison
              </span>
              <span className="text-slate-600 text-xs">&bull;</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                {client.name}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight mt-0.5">
              Visual Transformation
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <button
                onClick={() => setViewMode('slider')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'slider'
                    ? 'bg-white/[0.1] text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Slider
              </button>
              <button
                onClick={() => setViewMode('side_by_side')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'side_by_side'
                    ? 'bg-white/[0.1] text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Angle Filter Selector Bar */}
        <div className="px-3 sm:px-4 py-2 border-b border-white/[0.05] bg-[#05080e] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {(['front', 'side', 'back'] as const).map((angle) => (
              <button
                key={angle}
                onClick={() => setSelectedAngle(angle)}
                className={`px-3 py-1 rounded-lg text-xs font-medium uppercase font-mono transition-all cursor-pointer ${
                  selectedAngle === angle
                    ? 'bg-white/[0.1] text-white border border-white/20 font-semibold'
                    : 'text-slate-400 hover:text-white bg-white/[0.02] border border-white/[0.04]'
                }`}
              >
                {angle}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">
              Weight: <strong className="text-white font-medium">{weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg</strong>
            </span>
            {waistDelta !== null && (
              <span className="text-slate-400">
                Waist: <strong className="text-white font-medium">{waistDelta > 0 ? `+${waistDelta}` : waistDelta} cm</strong>
              </span>
            )}
          </div>
        </div>

        {/* Comparison Workspace */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col items-center justify-center custom-scrollbar">
          {viewMode === 'slider' ? (
            <div className="w-full max-w-sm relative aspect-[3/4] max-h-[460px] rounded-xl bg-black border border-white/[0.07] overflow-hidden select-none shadow-2xl">
              {/* Baseline Image */}
              {baselinePhoto ? (
                <img
                  src={baselinePhoto.url}
                  alt="Baseline"
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                  No Baseline Photo
                </div>
              )}
              <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-slate-300 border border-white/10 z-10">
                Baseline ({baselineCheckIn?.date || 'Start'})
              </span>

              {/* Latest Image (Clipped on top) */}
              {latestPhoto && (
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                >
                  <img
                    src={latestPhoto.url}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold z-10">
                    Current ({latestCheckIn?.date || 'Latest'})
                  </span>
                </div>
              )}

              {/* Interactive Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                  <Split className="w-3 h-3" />
                </div>
              </div>

              {/* Range input overlay for smooth dragging */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
              />
            </div>
          ) : (
            /* Side-by-Side Mode */
            <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
              <div className="space-y-1 text-center">
                <span className="text-[10px] font-mono text-slate-400">
                  Baseline &bull; {baselineCheckIn?.date} &bull; {baselineCheckIn?.weightKg} kg
                </span>
                <div className="aspect-[3/4] max-h-[420px] rounded-xl bg-black border border-white/[0.07] overflow-hidden relative">
                  {baselinePhoto ? (
                    <img
                      src={baselinePhoto.url}
                      alt="Baseline"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      No Photo
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-center">
                <span className="text-[10px] font-mono text-slate-400">
                  Current &bull; {latestCheckIn?.date} &bull; {latestCheckIn?.weightKg} kg
                </span>
                <div className="aspect-[3/4] max-h-[420px] rounded-xl bg-black border border-white/20 overflow-hidden relative">
                  {latestPhoto ? (
                    <img
                      src={latestPhoto.url}
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      No Photo
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-3.5 border-t border-white/[0.06] bg-[#070a10] flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            Direct visual comparison of client physique progress
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
