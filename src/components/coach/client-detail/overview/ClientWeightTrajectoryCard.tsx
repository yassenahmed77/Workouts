'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '@/types';
import { TrajectoryPoint, TrajectorySvgData, SubscriptionTelemetry } from '@/hooks/useClientOverview';

interface ClientWeightTrajectoryCardProps {
  client: User;
  hasWeighIns: boolean;
  totalTrajectoryPages: number;
  activePage: number;
  visibleWeightPoints: TrajectoryPoint[];
  allWeightEntries: TrajectoryPoint[];
  hoveredTrajectoryIndex: number | null;
  setHoveredTrajectoryIndex: (idx: number | null) => void;
  setTrajectoryPage: React.Dispatch<React.SetStateAction<number>>;
  trajectorySvgData: TrajectorySvgData;
  overallWeightStats: { startingWeight: number; latestWeight: number; totalDropped: number };
  subscriptionInfo: SubscriptionTelemetry;
  targetWeight: number;
  weightToGoal: number;
  onOpenMembership: () => void;
}

export const ClientWeightTrajectoryCard: React.FC<ClientWeightTrajectoryCardProps> = ({
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
  subscriptionInfo,
  targetWeight,
  weightToGoal,
  onOpenMembership
}) => {
  return (
    <div className="p-3 rounded-xl bg-[#18191e] border border-[#24262e] space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-[#24262e]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Weight Trajectory Curve
            </h3>

            {/* Pager if more than 4 points */}
            {hasWeighIns && totalTrajectoryPages > 1 && (
              <div className="flex items-center gap-1 bg-[#141519] rounded-md px-1.5 py-0.5 border border-[#24262e]">
                <button
                  type="button"
                  onClick={() => {
                    setHoveredTrajectoryIndex(null);
                    setTrajectoryPage((p) => Math.min(totalTrajectoryPages - 1, p + 1));
                  }}
                  disabled={activePage >= totalTrajectoryPages - 1}
                  className="p-0.5 rounded hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Older weigh-ins"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[9px] font-mono text-slate-400">
                  {activePage === 0 ? 'Latest' : `Page ${activePage + 1}/${totalTrajectoryPages}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHoveredTrajectoryIndex(null);
                    setTrajectoryPage((p) => Math.max(0, p - 1));
                  }}
                  disabled={activePage === 0}
                  className="p-0.5 rounded hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Newer weigh-ins"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
            {hasWeighIns
              ? `${allWeightEntries.length} ${allWeightEntries.length === 1 ? 'weigh-in' : 'weigh-ins'} recorded${totalTrajectoryPages > 1 ? ` • Showing ${visibleWeightPoints.length} points` : ''}`
              : '0 weigh-ins recorded • Awaiting first check-in'}
          </span>
        </div>

        <div className="text-right font-mono">
          {hasWeighIns ? (
            hoveredTrajectoryIndex !== null && trajectorySvgData.points[hoveredTrajectoryIndex] ? (
              <>
                <span className="text-base font-bold text-white block">
                  {trajectorySvgData.points[hoveredTrajectoryIndex].weightKg} kg
                </span>
                <span className="text-[11px] text-[#2f80ed] block font-semibold">
                  {trajectorySvgData.points[hoveredTrajectoryIndex].dateFormatted} • {trajectorySvgData.points[hoveredTrajectoryIndex].deltaText}
                </span>
              </>
            ) : (
              <>
                <span className="text-base font-bold text-white block">
                  {client.weightKg} kg
                </span>
                <span className={`text-[11px] block font-semibold ${overallWeightStats.totalDropped > 0 ? 'text-[#2f80ed]' : overallWeightStats.totalDropped < 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {overallWeightStats.totalDropped !== 0 ? `${overallWeightStats.totalDropped > 0 ? '-' : '+'}${Math.abs(overallWeightStats.totalDropped)} kg total` : '0.0 kg'}
                </span>
              </>
            )
          ) : (
            <>
              <span className="text-base font-bold text-white block">
                {client.weightKg} kg
              </span>
              <span className="text-[11px] text-slate-500 block font-semibold">
                Current Weight
              </span>
            </>
          )}
        </div>
      </div>

      {/* SVG Sparkline Area Chart */}
      <div className="relative w-full h-28 bg-[#141519] rounded-lg border border-[#24262e] overflow-hidden px-2 py-1 flex flex-col justify-between">
        {hasWeighIns ? (
          <svg viewBox="0 0 440 95" className="w-full h-full overflow-visible select-none">
            <defs>
              <linearGradient id="weightGradExact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f80ed" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2f80ed" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target line */}
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

            {/* Area fill */}
            {trajectorySvgData.areaPath && (
              <path d={trajectorySvgData.areaPath} fill="url(#weightGradExact)" />
            )}

            {/* Curve stroke */}
            {trajectorySvgData.svgPath && (
              <path
                d={trajectorySvgData.svgPath}
                fill="none"
                stroke="#2f80ed"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points & Date Labels */}
            {trajectorySvgData.points.map((pt, i) => {
              const isHovered = hoveredTrajectoryIndex === i;
              return (
                <g
                  key={pt.id || i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTrajectoryIndex(i)}
                  onMouseLeave={() => setHoveredTrajectoryIndex(null)}
                >
                  {/* Vertical hover guide */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={12}
                      x2={pt.x}
                      y2={73}
                      stroke="rgba(47, 128, 237, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Large transparent hover target */}
                  <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                  {/* Point dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 4}
                    fill="#ffffff"
                    stroke="#2f80ed"
                    strokeWidth={isHovered ? 2.5 : 2}
                    className="transition-all duration-150"
                  />

                  {/* Date label under point */}
                  <text
                    x={pt.x}
                    y="88"
                    textAnchor="middle"
                    fill={isHovered ? '#2f80ed' : '#64748b'}
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
          /* Faint Ghost Shadow Skeleton (When no weights logged yet) */
          <svg viewBox="0 0 440 95" className="w-full h-full overflow-visible select-none">
            <defs>
              <linearGradient id="ghostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f80ed" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#2f80ed" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Message Placed Clearly ABOVE the Line */}
            <text
              x="220"
              y="16"
              textAnchor="middle"
              fill="#64748b"
              fontSize="9"
              fontFamily="monospace"
            >
              Trajectory activates as trainee logs weigh-ins
            </text>

            {/* Target Baseline Line */}
            <line
              x1="20"
              y1="88"
              x2="420"
              y2="88"
              stroke="#334155"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* Ghost Shadow Area Fill */}
            <path
              d="M 35,32 L 155,46 L 275,58 L 405,68 L 405,88 L 35,88 Z"
              fill="url(#ghostGrad)"
            />

            {/* Ghost Shadow Dashed Curve */}
            <path
              d="M 35,32 L 155,46 L 275,58 L 405,68"
              fill="none"
              stroke="rgba(47, 128, 237, 0.22)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Ghost Outline Dots */}
            {[
              { x: 35, y: 32 },
              { x: 155, y: 46 },
              { x: 275, y: 58 },
              { x: 405, y: 68 }
            ].map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="rgba(255, 255, 255, 0.08)"
                stroke="rgba(47, 128, 237, 0.3)"
                strokeWidth="1"
              />
            ))}

            {/* Goal Text Written Clearly UNDER the Last Point */}
            <text
              x="405"
              y="80"
              textAnchor="middle"
              fill="#64748b"
              fontSize="8"
              fontFamily="monospace"
            >
              Goal {targetWeight}kg
            </text>
          </svg>
        )}
      </div>

      {/* 2 High-Impact Coaching Metric Cards (Target Goal + Membership Card) */}
      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#24262e]">
        {/* Card 1 (col-span-1): Target Goal */}
        <div className="p-2.5 rounded-lg bg-[#141519] border border-[#24262e] text-center flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
              TARGET GOAL
            </span>
            <span className="text-[9px] font-mono text-[#2f80ed] font-semibold">
              {targetWeight} kg
            </span>
          </div>
          <div className="my-auto py-0.5">
            <span className="text-xs sm:text-sm font-bold text-white font-mono block">
              {weightToGoal > 0 ? `${weightToGoal} kg to go` : 'Goal Reached'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 block truncate">
            Current: {client.weightKg} kg
          </span>
        </div>

        {/* Card 2 (col-span-2): Clean Minimal Membership Card with Simple Remaining Bar */}
        <div
          onClick={onOpenMembership}
          className="col-span-2 p-2.5 rounded-lg bg-[#141519] border border-[#24262e] hover:border-zinc-700 cursor-pointer transition-colors flex flex-col justify-between group"
          title="Click to manage subscription"
        >
          {/* Top: Plan Name & Remaining Days */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                MEMBERSHIP
              </span>
              <span className="text-slate-600 text-[10px]">&bull;</span>
              <span className="text-xs font-semibold text-white font-mono truncate">
                {subscriptionInfo.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 font-mono">
              <span className="text-xs font-bold text-white">
                {subscriptionInfo.statusText}
              </span>
              {subscriptionInfo.hasSubscription && (
                <span className="text-[10px] text-slate-400">
                  ({subscriptionInfo.remainingPct}%)
                </span>
              )}
            </div>
          </div>

          {/* Middle: Clean Minimal Remaining Bar */}
          <div className="my-auto py-1">
            <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${subscriptionInfo.barColor} transition-all duration-300`}
                style={{ width: `${subscriptionInfo.remainingPct}%` }}
              />
            </div>
          </div>

          {/* Bottom: Dates & Price */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>
              {subscriptionInfo.hasSubscription
                ? `${subscriptionInfo.startDateFormatted} → ${subscriptionInfo.endDateFormatted}`
                : 'Click to assign plan'}
            </span>
            <span className="hover:text-[#2f80ed] transition-colors">
              {subscriptionInfo.hasSubscription
                ? `${subscriptionInfo.price.toLocaleString()} ${subscriptionInfo.currency} (${subscriptionInfo.durationMonths}m)`
                : '+ Add Membership'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
