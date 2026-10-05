'use client';

import React from 'react';
import { ExerciseProgressSummary } from '@/lib/progressEngine';

interface ExerciseProgressionGraphProps {
  exercise: ExerciseProgressSummary;
  hoveredPointIndex: number | null;
  setHoveredPointIndex: (idx: number | null) => void;
}

/**
 * ExerciseProgressionGraph — SVG progression sparkline (Clean Presentation Component).
 * Renders chronological session sets, PR indicators, and weight overload curves.
 */
export const ExerciseProgressionGraph: React.FC<ExerciseProgressionGraphProps> = ({
  exercise,
  hoveredPointIndex,
  setHoveredPointIndex
}) => {
  const chronologicalHistory = [...exercise.history].reverse();
  if (chronologicalHistory.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-[10px] text-slate-400 font-mono">
        No session history recorded for this movement.
      </div>
    );
  }

  const weights = chronologicalHistory.map((h) => h.maxWeightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const paddingVal = maxW - minW === 0 ? 5 : (maxW - minW) * 0.25;
  const yMin = Math.max(0, Math.floor(minW - paddingVal));
  const yMax = Math.ceil(maxW + paddingVal);
  const yRange = yMax - yMin || 1;

  const width = 640;
  const height = 100;
  const padLeft = 38;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 20;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const points = chronologicalHistory.map((session, i) => {
    const x = chronologicalHistory.length === 1 
      ? padLeft + plotW / 2 
      : padLeft + (i / (chronologicalHistory.length - 1)) * plotW;
    const normalizedY = (session.maxWeightKg - yMin) / yRange;
    const y = padTop + plotH - normalizedY * plotH;
    return { x, y, session, index: i };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const baselineY = padTop + plotH;
  const areaD = `${pathD} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;

  const activePoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : points[points.length - 1];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Weight Progression Curve
          </span>
          <span className="text-slate-600 text-xs">&bull;</span>
          <span className="text-[10px] font-mono text-slate-500">
            {chronologicalHistory.length} Sessions Plotted
          </span>
        </div>

        {activePoint && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-slate-400">{activePoint.session.date}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-white font-semibold">{activePoint.session.maxWeightKg} kg</span>
            {activePoint.session.isAllTimePR && (
              <span className="px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[8.5px] font-bold">
                PR
              </span>
            )}
            {activePoint.session.weightOverloadDeltaKg > 0 && (
              <span className="text-emerald-400 font-semibold">+{activePoint.session.weightOverloadDeltaKg} kg</span>
            )}
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="w-full rounded-lg bg-[#05080e] border border-white/[0.05] p-1.5 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 sm:h-26 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradientLogs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const gridY = padTop + plotH * (1 - ratio);
            const gridWeight = Math.round(yMin + ratio * yRange);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={gridY}
                  x2={width - padRight}
                  y2={gridY}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 6}
                  y={gridY + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  {gridWeight}kg
                </text>
              </g>
            );
          })}

          {/* Gradient Area */}
          <path d={areaD} fill="url(#areaGradientLogs)" />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points on Line */}
          {points.map((p) => {
            const isHovered = hoveredPointIndex === p.index;
            const isPR = p.session.isAllTimePR;

            return (
              <g
                key={p.index}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(p.index)}
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={padTop}
                    x2={p.x}
                    y2={baselineY}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 4.5 : 3}
                  fill={isPR ? '#34d399' : '#ffffff'}
                  stroke="#090d14"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                <text
                  x={p.x}
                  y={p.y - 6}
                  textAnchor="middle"
                  fill={isPR ? '#34d399' : '#ffffff'}
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {p.session.maxWeightKg}k
                </text>

                <text
                  x={p.x}
                  y={height - 5}
                  textAnchor="middle"
                  fill={isHovered ? '#ffffff' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  {p.session.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
