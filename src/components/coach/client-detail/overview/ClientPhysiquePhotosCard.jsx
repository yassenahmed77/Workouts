'use client';

import React from 'react';

/**
 * ClientPhysiquePhotosCard (Zero Decorative Icons - Full Frame Fill)
 *
 * Side-by-side visual transformation card:
 * - Expands to naturally fill available height (no awkward empty gap)
 * - Zero decorative icons (Swiss typography)
 * - Clean Start vs Latest overlays with exact dates & scale weights
 */
export const ClientPhysiquePhotosCard = ({
  activePhotoAngle,
  setActivePhotoAngle,
  firstCheckIn,
  latestCheckIn,
  onOpenFullscreenCompare,
  isMobile = false
}) => {
  const startPhoto = firstCheckIn?.photos?.find((p) => p.angle === activePhotoAngle);
  const nowPhoto = latestCheckIn?.photos?.find((p) => p.angle === activePhotoAngle);

  const startWeight = firstCheckIn?.weightKg ?? null;
  const nowWeight = latestCheckIn?.weightKg ?? null;

  const weightDelta =
    startWeight !== null && nowWeight !== null
      ? Math.round((nowWeight - startWeight) * 10) / 10
      : null;

  // 1. DESKTOP MODE: 100% Original, Pristine & Pixel-Perfect Locked Cockpit
  if (!isMobile) {
    return (
      <div className="gym-card select-none p-2.5 sm:p-3 h-full flex flex-col justify-between space-y-2">
        {/* 1. Header: Angle Toggle */}
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.07] flex-shrink-0">
          <span className="gym-label-mono font-bold tracking-wider">
            PHYSIQUE TRANSFORMATION
          </span>
          <div className="flex items-center gap-1 font-mono text-xs">
            {['front', 'side', 'back'].map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => setActivePhotoAngle(angle)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold transition-all cursor-pointer ${
                  activePhotoAngle === angle
                    ? 'bg-[var(--main-color)] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {angle}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Net Delta Strip */}
        <div className="flex items-center justify-between px-2 py-1 rounded bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-[10px] font-mono flex-shrink-0">
          <span className="text-slate-400">Net Delta:</span>
          <span
            className={`font-bold ${
              weightDelta !== null && weightDelta < 0
                ? 'text-emerald-400'
                : weightDelta !== null && weightDelta > 0
                ? 'text-amber-400'
                : 'text-slate-300'
            }`}
          >
            {weightDelta !== null
              ? `${weightDelta < 0 ? '' : '+'}${weightDelta} kg (${Math.abs(weightDelta)} kg change)`
              : 'Awaiting Check-in Comparison'}
          </span>
        </div>

        {/* 3. Photo Display: Side-by-Side Full Height */}
        <div className="grid grid-cols-2 gap-2 w-full flex-1 min-h-[140px]">
          {/* Baseline Photo */}
          <div className="w-full flex flex-col items-center h-full min-h-0">
            <div className="relative w-full flex-1 min-h-[120px] rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] overflow-hidden flex flex-col items-center justify-center">
              {startPhoto?.url ? (
                <img
                  src={startPhoto.url}
                  alt="Start"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                  <span className="text-xs font-mono text-slate-400 font-semibold">No Start Photo</span>
                  <span className="text-[9px] font-mono text-slate-600 mt-0.5">Awaiting baseline</span>
                </div>
              )}
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 border border-white/[0.1] text-[9px] font-mono text-slate-300 font-bold">
                START
              </span>
              {startPhoto?.url && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2 py-1 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 truncate max-w-[80px]">
                    {firstCheckIn?.date || 'Day 1'}
                  </span>
                  {startWeight !== null && (
                    <span className="text-white font-bold">{startWeight} kg</span>
                  )}
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-500 block text-center mt-1 w-full truncate flex-shrink-0">
              {firstCheckIn?.date ? firstCheckIn.date : 'Baseline Check-In'}
            </span>
          </div>

          {/* Latest Photo */}
          <div className="w-full flex flex-col items-center h-full min-h-0">
            <div className="relative w-full flex-1 min-h-[120px] rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] overflow-hidden flex flex-col items-center justify-center">
              {nowPhoto?.url ? (
                <img
                  src={nowPhoto.url}
                  alt="Now"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                  <span className="text-xs font-mono text-slate-400 font-semibold">No Recent Photo</span>
                  <span className="text-[9px] font-mono text-slate-600 mt-0.5">Due next check-in</span>
                </div>
              )}
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[var(--main-color)]/90 border border-white/20 text-[9px] font-mono font-bold text-white tracking-wider">
                LATEST
              </span>
              {nowPhoto?.url && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2 py-1 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-300 truncate max-w-[80px]">
                    {latestCheckIn?.date || 'Latest'}
                  </span>
                  {nowWeight !== null && (
                    <span className="text-emerald-400 font-bold">{nowWeight} kg</span>
                  )}
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-[var(--main-color)] font-semibold block text-center mt-1 w-full truncate flex-shrink-0">
              {latestCheckIn?.date ? latestCheckIn.date : 'Latest Progression'}
            </span>
          </div>
        </div>

        {/* 4. Fullscreen Compare CTA */}
        <button
          type="button"
          onClick={onOpenFullscreenCompare}
          className="gym-btn-secondary w-full text-xs flex-shrink-0 cursor-pointer"
        >
          Compare Fullscreen
        </button>
      </div>
    );
  }

  // 2. MOBILE MODE: Cardless Floating Container with Rounded-2xl Floating Modules
  return (
    <div className="select-none p-0 bg-transparent h-full flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
      {/* 1. Header: Title + Angle Selector Bar */}
      <div className="flex items-center justify-between pb-1 sm:pb-1.5 border-b border-white/[0.06] flex-shrink-0">
        <span className="gym-label-mono font-bold tracking-wider">
          PHYSIQUE TRANSFORMATION
        </span>

        {/* Angle Toggles Capsule */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-black/60 border border-white/[0.08] text-[9px] font-mono shadow-sm">
          {['front', 'side', 'back'].map((angle) => {
            const isActive = activePhotoAngle === angle;
            return (
              <button
                key={angle}
                type="button"
                onClick={() => setActivePhotoAngle(angle)}
                className={`px-2 py-0.5 rounded-lg uppercase font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--main-color)] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {angle}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Net Transformation Delta Strip (Floated Glass Capsule) */}
      <div className="flex items-center justify-between px-2.5 py-1 rounded-2xl bg-[var(--card-bg)]/85 lg:bg-[var(--card-subtle-bg)] backdrop-blur-md border border-white/[0.08] lg:border-[var(--card-border)] text-[10px] font-mono flex-shrink-0 shadow-md">
        <span className="text-slate-400">Net Delta:</span>
        <span
          className={`font-bold ${
            weightDelta !== null && weightDelta < 0
              ? 'text-emerald-400'
              : weightDelta !== null && weightDelta > 0
              ? 'text-amber-400'
              : 'text-slate-300'
          }`}
        >
          {weightDelta !== null
            ? `${weightDelta < 0 ? '' : '+'}${weightDelta} kg (${Math.abs(weightDelta)} kg change)`
            : 'Awaiting Check-in Comparison'}
        </span>
      </div>

      {/* 3. Side-by-Side Photo Frames (Floated Glass Modules) */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full flex-1 min-h-[110px] sm:min-h-[200px]">
        {/* START PHOTO FRAME */}
        <div className="flex flex-col space-y-1 h-full min-h-0">
          <div className="relative w-full flex-1 min-h-[100px] sm:min-h-[190px] rounded-2xl bg-[var(--card-bg)]/85 lg:bg-[var(--bg-main)] backdrop-blur-md border border-white/[0.08] overflow-hidden flex flex-col items-center justify-center shadow-lg">
            {startPhoto?.url ? (
              <img
                src={startPhoto.url}
                alt="Start baseline"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 p-3 text-center">
                <span className="text-xs font-mono text-slate-400 font-semibold">No Start Photo</span>
                <span className="text-[9px] font-mono text-slate-600 mt-0.5">Awaiting baseline</span>
              </div>
            )}

            {/* Top Tag: START */}
            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold text-slate-300 tracking-wider shadow-sm">
              START
            </span>

            {/* Bottom Overlay: Date & Weight */}
            {startPhoto?.url && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2 py-1.5 pt-5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 truncate max-w-[80px]">
                  {firstCheckIn?.date || 'Day 1'}
                </span>
                {startWeight !== null && (
                  <span className="text-white font-bold">{startWeight} kg</span>
                )}
              </div>
            )}
          </div>

          <span className="text-[10px] font-mono text-slate-400 block text-center truncate flex-shrink-0">
            Baseline Check-In
          </span>
        </div>

        {/* LATEST PHOTO FRAME */}
        <div className="flex flex-col space-y-1 h-full min-h-0">
          <div className="relative w-full flex-1 min-h-[100px] sm:min-h-[190px] rounded-2xl bg-[var(--card-bg)]/85 lg:bg-[var(--bg-main)] backdrop-blur-md border border-[var(--main-color)]/40 overflow-hidden flex flex-col items-center justify-center shadow-lg">
            {nowPhoto?.url ? (
              <img
                src={nowPhoto.url}
                alt="Latest check-in"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 p-3 text-center">
                <span className="text-xs font-mono text-slate-400 font-semibold">No Recent Photo</span>
                <span className="text-[9px] font-mono text-slate-600 mt-0.5">Due next check-in</span>
              </div>
            )}

            {/* Top Tag: LATEST */}
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-[var(--main-color)]/90 backdrop-blur-md border border-white/20 text-[9px] font-mono font-bold text-white tracking-wider shadow-sm">
              LATEST
            </span>

            {/* Bottom Overlay: Date & Weight */}
            {nowPhoto?.url && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2 py-1.5 pt-5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-300 truncate max-w-[80px]">
                  {latestCheckIn?.date || 'Latest'}
                </span>
                {nowWeight !== null && (
                  <span className="text-emerald-400 font-bold">{nowWeight} kg</span>
                )}
              </div>
            )}
          </div>

          <span className="text-[10px] font-mono text-[var(--main-color)] font-semibold block text-center truncate flex-shrink-0">
            Latest Progression
          </span>
        </div>
      </div>

      {/* 4. Fullscreen 50/50 Slider CTA Button (Zero Icons - Floated Pill) */}
      <button
        type="button"
        onClick={onOpenFullscreenCompare}
        className="gym-btn-secondary w-full text-xs py-1.5 rounded-xl cursor-pointer hover:border-[var(--main-color)]/40 transition-colors flex-shrink-0 bg-white/[0.04] border-white/10 shadow-md"
      >
        Compare Fullscreen (50/50 Slider)
      </button>
    </div>
  );
};
