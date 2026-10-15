'use client';

import React from 'react';

/**
 * ClientWeightTrajectoryCard (Zero Decorative Icons - Viewport Isolated)
 *
 * Real-time weight journey featuring:
 * - 4-Point Milestones KPI strip
 * - Full flex-1 calibrated SVG Area Curve
 * - Clean typographic navigation (&larr; and &rarr;)
 * - Minimal subscription lifecycle strip
 *
 * Viewport Isolation:
 * - Desktop (isMobile=false): 100% original, locked gym-card cockpit.
 * - Mobile (isMobile=true): Cardless floating container with rounded-2xl glass widgets.
 */
export const ClientWeightTrajectoryCard = ({
  client,
  hasWeighIns,
  totalTrajectoryPages,
  activePage,
  visibleWeightPoints,
  allWeightEntries,
  hoveredTrajectoryIndex,
  setHoveredTrajectoryIndex,
  setTrajectoryPage,
  trajectorySvgData,
  overallWeightStats,
  targetWeight,
  isMobile = false
}) => {
  // 1. DESKTOP MODE: 100% Original, Pristine & Pixel-Perfect Locked Cockpit
  if (!isMobile) {
    return (
      <div className="gym-card select-none p-2.5 sm:p-3 h-full flex flex-col justify-between space-y-2">
        {/* 1. Header: Title + Pagination Controls + Active Hover Detail */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.07] flex-shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="gym-heading-card">
                Weight Progression Journey
              </h3>

              {/* Pagination Controls (Typographic) */}
              {hasWeighIns && totalTrajectoryPages > 1 && (
                <div className="flex items-center gap-1 bg-[var(--card-subtle-bg)] rounded px-1 py-0.5 border border-[var(--card-border)] text-[9px] font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setHoveredTrajectoryIndex(null);
                      setTrajectoryPage((p) => Math.min(totalTrajectoryPages - 1, p + 1));
                    }}
                    disabled={activePage >= totalTrajectoryPages - 1}
                    className="px-1 rounded hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Older weigh-ins"
                  >
                    &larr;
                  </button>
                  <span className="text-slate-400">
                    {activePage === 0 ? 'Latest' : `${activePage + 1}/${totalTrajectoryPages}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHoveredTrajectoryIndex(null);
                      setTrajectoryPage((p) => Math.max(0, p - 1));
                    }}
                    disabled={activePage === 0}
                    className="px-1 rounded hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Newer weigh-ins"
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </div>

            <span className="gym-subtext font-mono block mt-0.5 text-[10px] whitespace-nowrap">
              {hasWeighIns
                ? `${allWeightEntries.length} ${allWeightEntries.length === 1 ? 'log' : 'logs'} recorded`
                : '0 weigh-in logs'}
            </span>
          </div>

          {/* Hover / Current Telemetry Value */}
          <div className="text-right font-mono">
            {hasWeighIns && hoveredTrajectoryIndex !== null && trajectorySvgData.points[hoveredTrajectoryIndex] ? (
              <>
                <span className="text-sm font-bold text-white block">
                  {trajectorySvgData.points[hoveredTrajectoryIndex].weightKg} kg
                </span>
                <span className="text-[10px] text-[var(--main-color)] block font-semibold">
                  {trajectorySvgData.points[hoveredTrajectoryIndex].dateFormatted} &bull;{' '}
                  {trajectorySvgData.points[hoveredTrajectoryIndex].deltaText}
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-white block">
                  {client.weightKg} kg
                </span>
                <span
                  className={`text-[10px] block font-semibold truncate max-w-[200px] ${
                    overallWeightStats.statusTone === 'positive'
                      ? 'text-emerald-400'
                      : overallWeightStats.statusTone === 'warning'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                  title={overallWeightStats.statusMessage}
                >
                  {hasWeighIns
                    ? overallWeightStats.statusMessage
                    : overallWeightStats.isBulking
                    ? 'Bulk Phase'
                    : overallWeightStats.isCutting
                    ? 'Cut Phase'
                    : `Goal ${targetWeight} kg`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 2. Milestones Strip (4 Core KPI Capsules) */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[var(--bg-main)] border border-[var(--card-border)] text-center text-xs font-mono flex-shrink-0">
          <div className="px-1 py-1">
            <span className="text-slate-500 text-[8px] block uppercase">Start</span>
            <span className="text-slate-300 font-bold text-xs">{overallWeightStats.startingWeight} kg</span>
          </div>
          <div className="px-1 py-1 border-l border-white/[0.06]">
            <span className="text-slate-500 text-[8px] block uppercase">Current</span>
            <span className="text-white font-bold text-xs">{client.weightKg} kg</span>
          </div>
          <div className="px-1 py-1 border-l border-white/[0.06]">
            <span className="text-slate-500 text-[8px] block uppercase">
              {overallWeightStats.isBulking ? 'Bulk Delta' : overallWeightStats.isCutting ? 'Cut Delta' : 'Net Change'}
            </span>
            <span
              className={`font-bold text-xs ${
                overallWeightStats.statusTone === 'positive'
                  ? 'text-emerald-400'
                  : overallWeightStats.statusTone === 'warning'
                  ? 'text-amber-400'
                  : 'text-slate-300'
              }`}
            >
              {overallWeightStats.netDeltaKg > 0 ? `+${overallWeightStats.netDeltaKg}` : `${overallWeightStats.netDeltaKg}`} kg
            </span>
          </div>
          <div className="px-1 py-1 border-l border-white/[0.06]">
            <span className="text-slate-500 text-[8px] block uppercase">Goal</span>
            <span className="text-[var(--main-color)] font-bold text-xs">{targetWeight} kg</span>
          </div>
        </div>

        {/* 3. SVG Sparkline Area Chart */}
        <div className="relative w-full flex-1 min-h-[140px] bg-[var(--card-subtle-bg)] rounded-xl border border-[var(--card-border)] overflow-hidden px-2 py-2 flex flex-col justify-between shadow-inner">
          {hasWeighIns ? (
            <svg viewBox="0 0 440 95" preserveAspectRatio="none" className="w-full h-full select-none">
              <defs>
                <linearGradient id="weightGradDeskFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--main-color)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--main-color)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line
                x1="20"
                y1={trajectorySvgData.targetY}
                x2="420"
                y2={trajectorySvgData.targetY}
                stroke="#334155"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x="420"
                y={Math.max(11, trajectorySvgData.targetY - 3)}
                textAnchor="end"
                fill="#64748b"
                fontSize="8"
                fontFamily="monospace"
              >
                Goal {targetWeight}kg
              </text>

              {trajectorySvgData.areaPath && (
                <path d={trajectorySvgData.areaPath} fill="url(#weightGradDeskFull)" />
              )}

              {trajectorySvgData.svgPath && (
                <path
                  d={trajectorySvgData.svgPath}
                  fill="none"
                  stroke="var(--main-color)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {trajectorySvgData.points.map((pt, i) => {
                const isHovered = hoveredTrajectoryIndex === i;
                return (
                  <g
                    key={pt.id || i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTrajectoryIndex(i)}
                    onMouseLeave={() => setHoveredTrajectoryIndex(null)}
                  >
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={12}
                        x2={pt.x}
                        y2={73}
                        stroke="var(--main-color)"
                        strokeOpacity="0.5"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}
                    <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5.5 : 4}
                      fill="#ffffff"
                      stroke="var(--main-color)"
                      strokeWidth={isHovered ? 2.5 : 2}
                      className="transition-all duration-150"
                    />
                    <text
                      x={pt.x}
                      y="88"
                      textAnchor="middle"
                      fill={isHovered ? 'var(--main-color)' : '#64748b'}
                      fontSize="8"
                      fontFamily="monospace"
                      className="transition-colors duration-150"
                    >
                      {pt.dateFormatted}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Trajectory Graph Ready
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                Curve plots automatically as soon as weigh-ins are logged.
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. MOBILE MODE: Cardless Floating Container with Rounded-2xl Floating Modules
  return (
    <div className="select-none p-0 bg-transparent h-full flex-1 flex flex-col justify-between space-y-1.5">
      {/* 1. Header: Title + Pagination Controls + Active Hover Detail */}
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06] flex-shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="gym-heading-card text-xs sm:text-sm">
              Weight Progression Journey
            </h3>

            {hasWeighIns && totalTrajectoryPages > 1 && (
              <div className="flex items-center gap-1 bg-black/60 rounded px-1 py-0.5 border border-white/[0.08] text-[9px] font-mono shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setHoveredTrajectoryIndex(null);
                    setTrajectoryPage((p) => Math.min(totalTrajectoryPages - 1, p + 1));
                  }}
                  disabled={activePage >= totalTrajectoryPages - 1}
                  className="px-1 rounded hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Older weigh-ins"
                >
                  &larr;
                </button>
                <span className="text-slate-400">
                  {activePage === 0 ? 'Latest' : `${activePage + 1}/${totalTrajectoryPages}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHoveredTrajectoryIndex(null);
                    setTrajectoryPage((p) => Math.max(0, p - 1));
                  }}
                  disabled={activePage === 0}
                  className="px-1 rounded hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Newer weigh-ins"
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>

          <span className="gym-subtext font-mono block mt-0.5 text-[9px] whitespace-nowrap">
            {hasWeighIns
              ? `${allWeightEntries.length} ${allWeightEntries.length === 1 ? 'log' : 'logs'} recorded`
              : '0 weigh-in logs'}
          </span>
        </div>

        <div className="text-right font-mono">
          {hasWeighIns && hoveredTrajectoryIndex !== null && trajectorySvgData.points[hoveredTrajectoryIndex] ? (
            <>
              <span className="text-xs sm:text-sm font-bold text-white block">
                {trajectorySvgData.points[hoveredTrajectoryIndex].weightKg} kg
              </span>
              <span className="text-[9px] text-[var(--main-color)] block font-semibold">
                {trajectorySvgData.points[hoveredTrajectoryIndex].dateFormatted} &bull;{' '}
                {trajectorySvgData.points[hoveredTrajectoryIndex].deltaText}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs sm:text-sm font-bold text-white block">
                {client.weightKg} kg
              </span>
              <span
                className={`text-[9px] block font-semibold truncate max-w-[140px] ${
                  overallWeightStats.statusTone === 'positive'
                    ? 'text-emerald-400'
                    : overallWeightStats.statusTone === 'warning'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
                title={overallWeightStats.statusMessage}
              >
                {hasWeighIns
                  ? overallWeightStats.statusMessage
                  : overallWeightStats.isBulking
                  ? 'Bulk Phase'
                  : overallWeightStats.isCutting
                  ? 'Cut Phase'
                  : `Goal ${targetWeight} kg`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. Milestones Strip (4 Core KPI Capsules - Floated Glass) */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[var(--card-bg)]/85 backdrop-blur-md border border-white/[0.08] text-center text-xs font-mono flex-shrink-0 shadow-md">
        <div className="px-0.5 py-0.5 min-[360px]:py-1">
          <span className="text-slate-500 text-[7.5px] min-[360px]:text-[8px] block uppercase">Start</span>
          <span className="text-slate-300 font-bold text-[11px] min-[360px]:text-xs">{overallWeightStats.startingWeight} kg</span>
        </div>
        <div className="px-0.5 py-0.5 min-[360px]:py-1 border-l border-white/[0.06]">
          <span className="text-slate-500 text-[7.5px] min-[360px]:text-[8px] block uppercase">Current</span>
          <span className="text-white font-bold text-[11px] min-[360px]:text-xs">{client.weightKg} kg</span>
        </div>
        <div className="px-0.5 py-0.5 min-[360px]:py-1 border-l border-white/[0.06]">
          <span className="text-slate-500 text-[7.5px] min-[360px]:text-[8px] block uppercase">
            {overallWeightStats.isBulking ? 'Bulk Delta' : overallWeightStats.isCutting ? 'Cut Delta' : 'Net Change'}
          </span>
          <span
            className={`font-bold text-[11px] min-[360px]:text-xs ${
              overallWeightStats.statusTone === 'positive'
                ? 'text-emerald-400'
                : overallWeightStats.statusTone === 'warning'
                ? 'text-amber-400'
                : 'text-slate-300'
            }`}
          >
            {overallWeightStats.netDeltaKg > 0 ? `+${overallWeightStats.netDeltaKg}` : `${overallWeightStats.netDeltaKg}`} kg
          </span>
        </div>
        <div className="px-0.5 py-0.5 min-[360px]:py-1 border-l border-white/[0.06]">
          <span className="text-slate-500 text-[7.5px] min-[360px]:text-[8px] block uppercase">Goal</span>
          <span className="text-[var(--main-color)] font-bold text-[11px] min-[360px]:text-xs">{targetWeight} kg</span>
        </div>
      </div>

      {/* 3. SVG Sparkline Area Chart (Floated Glass Container) */}
      <div className="relative w-full flex-1 min-h-[95px] bg-[var(--card-bg)]/85 backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden px-2 py-1.5 flex flex-col justify-between shadow-lg">
        {hasWeighIns ? (
          <svg viewBox="0 0 440 95" preserveAspectRatio="none" className="w-full h-full select-none">
            <defs>
              <linearGradient id="weightGradMobFull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--main-color)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--main-color)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line
              x1="20"
              y1={trajectorySvgData.targetY}
              x2="420"
              y2={trajectorySvgData.targetY}
              stroke="#334155"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x="420"
              y={Math.max(11, trajectorySvgData.targetY - 3)}
              textAnchor="end"
              fill="#64748b"
              fontSize="8"
              fontFamily="monospace"
            >
              Goal {targetWeight}kg
            </text>

            {trajectorySvgData.areaPath && (
              <path d={trajectorySvgData.areaPath} fill="url(#weightGradMobFull)" />
            )}

            {trajectorySvgData.svgPath && (
              <path
                d={trajectorySvgData.svgPath}
                fill="none"
                stroke="var(--main-color)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {trajectorySvgData.points.map((pt, i) => {
              const isHovered = hoveredTrajectoryIndex === i;
              return (
                <g
                  key={pt.id || i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTrajectoryIndex(i)}
                  onMouseLeave={() => setHoveredTrajectoryIndex(null)}
                >
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={12}
                      x2={pt.x}
                      y2={73}
                      stroke="var(--main-color)"
                      strokeOpacity="0.5"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}
                  <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 4}
                    fill="#ffffff"
                    stroke="var(--main-color)"
                    strokeWidth={isHovered ? 2.5 : 2}
                    className="transition-all duration-150"
                  />
                  <text
                    x={pt.x}
                    y="88"
                    textAnchor="middle"
                    fill={isHovered ? 'var(--main-color)' : '#64748b'}
                    fontSize="8"
                    fontFamily="monospace"
                    className="transition-colors duration-150"
                  >
                    {pt.dateFormatted}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
            <span className="text-xs font-mono text-slate-400 font-semibold">
              Trajectory Graph Ready
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              Curve plots automatically as soon as weigh-ins are logged.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
