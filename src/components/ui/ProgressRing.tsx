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
  color = 'var(--main-color)',
  subtext,
  size = 'md',
  onClick,
  titleTooltip,
  className = ''
}: ProgressRingProps) {
  const isInteractive = Boolean(onClick);

  const ringDimensions = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-12 h-12 sm:w-14 sm:h-14'
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
        className={`text-[11px] font-semibold text-slate-300 transition-colors truncate max-w-full ${
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
            stroke="var(--card-border)"
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
            className={`gym-num text-[11px] font-bold text-white transition-colors ${
              isInteractive ? 'group-hover:text-[var(--main-color)]' : ''
            }`}
          >
            {pct}%
          </span>
        </div>
      </div>

      {subtext && (
        <span className="gym-label-mono text-slate-400 block truncate max-w-full">
          {subtext}
        </span>
      )}
    </div>
  );
}
