'use client';

import React from 'react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'emerald' | 'cyan' | 'slate' | 'amber' | 'rose';
  onClick?: () => void;
  titleTooltip?: string;
  className?: string;
  valueClassName?: string;
}

const BADGE_STYLES = {
  emerald: 'text-emerald-400 bg-[#0a1f18] border-emerald-500/20',
  cyan: 'text-[#00c5ff] bg-[#0a1b28] border-[#00c5ff]/20',
  slate: 'text-slate-300 bg-[#121722] border-[#1d2636]',
  amber: 'text-amber-400 bg-[#1f170a] border-amber-500/20',
  rose: 'text-rose-400 bg-[#1f0a0f] border-rose-500/20'
};

export function KpiCard({
  title,
  value,
  unit,
  subtitle,
  badgeText,
  badgeVariant = 'slate',
  onClick,
  titleTooltip,
  className = '',
  valueClassName = ''
}: KpiCardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      title={titleTooltip}
      className={`p-3 rounded-xl bg-[#080c14] border border-[#141b26] transition-all shadow-sm flex flex-col justify-between ${
        isInteractive
          ? 'hover:border-[#233146] cursor-pointer group active:scale-[0.99]'
          : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold text-slate-300 transition-colors ${
            isInteractive ? 'group-hover:text-cyan-300' : ''
          }`}
        >
          {title}
        </span>
        {badgeText && (
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${BADGE_STYLES[badgeVariant]}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      <div className="mt-1.5 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-2xl sm:text-3xl font-extrabold text-white font-numeric tracking-tight block leading-none ${valueClassName}`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-slate-300 text-sm font-semibold ml-1">
              {unit}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
