'use client';
import React from 'react';
const BADGE_STYLES = {
    emerald: 'gym-badge-emerald',
    blue: 'gym-badge-blue',
    slate: 'gym-badge-slate',
    amber: 'gym-badge-amber',
    rose: 'gym-badge-rose'
};
export function KpiCard({ title, value, unit, subtitle, badgeText, badgeVariant = 'slate', onClick, titleTooltip, className = '', valueClassName = '' }) {
    const isInteractive = Boolean(onClick);
    return (<div onClick={onClick} title={titleTooltip} className={`${isInteractive ? 'gym-card-interactive group' : 'gym-card'} flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between">
        <span className={`gym-heading-card transition-colors ${isInteractive ? 'group-hover:text-[var(--main-color)]' : ''}`}>
          {title}
        </span>
        {badgeText && (<span className={`${BADGE_STYLES[badgeVariant] || BADGE_STYLES.slate}`}>
            {badgeText}
          </span>)}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className={`gym-num-lg text-xl sm:text-2xl text-white block leading-none ${valueClassName}`}>
            {value}
          </span>
          {unit && (<span className="text-slate-400 text-xs sm:text-sm font-semibold ml-1">
              {unit}
            </span>)}
        </div>
        {subtitle && (<span className="gym-subtext truncate max-w-[180px]">
            {subtitle}
          </span>)}
      </div>
    </div>);
}
