'use client';

import React from 'react';

export interface ProgressRingProps {
  title: string;
  pct: number;
  color?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  titleTooltip?: string;
  className?: string;
}

export function ProgressRing({
  title,
  pct,
  color = '#00c5ff',
  subtext,
  size = 'md',
  onClick,
  titleTooltip,
  className = ''
}: ProgressRingProps) {
  const isInteractive = Boolean(onClick);

  const ringDimensions = {
    sm: 'w-9 h-9 sm:w-10 sm:h-10',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16'
  }[size];

  return (
    <div
      onClick={onClick}
      title={titleTooltip || `Click to view ${title} details`}
      className={`flex flex-col items-center select-none ${
        isInteractive
          ? 'cursor-pointer group hover:opacity-90 active:scale-95 transition-transform'
          : ''
      } ${className}`}
    >
      <span
        className={`text-xs font-bold text-slate-300 transition-colors truncate max-w-full ${
          isInteractive ? 'group-hover:text-white' : ''
        }`}
      >
        {title}
      </span>

      <div className={`relative ${ringDimensions} my-1 transition-transform ${isInteractive ? 'group-hover:scale-105' : ''}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#131923"
            strokeWidth="3.4"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeDasharray={`${Math.min(100, Math.max(0, pct))}, 100`}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-xs font-bold font-numeric text-white transition-colors ${
              isInteractive ? 'group-hover:text-[#00c5ff]' : ''
            }`}
          >
            {pct}%
          </span>
        </div>
      </div>

      {subtext && (
        <span className="text-[10px] text-slate-300 font-mono font-bold tracking-tight truncate max-w-full">
          {subtext}
        </span>
      )}
    </div>
  );
}
