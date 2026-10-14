'use client';

import React from 'react';

export type BadgeStatusType =
  | 'active'
  | 'pending'
  | 'needs_plan'
  | 'needs_diet'
  | 'needs_setup'
  | 'on_hold'
  | 'inactive'
  | 'due_today'
  | 'overdue'
  | 'completed';

export interface StatusBadgeProps {
  status: BadgeStatusType | string;
  label?: string;
  showDot?: boolean;
  size?: 'xs' | 'sm';
  className?: string;
}

const STATUS_CONFIGS: Record<string, { label: string; badge: string; dot: string }> = {
  active: {
    label: 'All Set',
    badge: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400'
  },
  pending: {
    label: 'Pending',
    badge: 'bg-amber-950/50 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400'
  },
  needs_plan: {
    label: 'Needs Plan',
    badge: 'bg-orange-950/50 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-400'
  },
  needs_diet: {
    label: 'Needs Diet',
    badge: 'bg-fuchsia-950/50 text-fuchsia-400 border-fuchsia-500/30',
    dot: 'bg-fuchsia-400'
  },
  needs_setup: {
    label: 'Needs Setup',
    badge: 'bg-sky-950/50 text-sky-400 border-sky-500/30',
    dot: 'bg-sky-400'
  },
  on_hold: {
    label: 'On Hold',
    badge: 'bg-slate-900/60 text-slate-400 border-slate-700/50',
    dot: 'bg-slate-400'
  },
  inactive: {
    label: 'Inactive',
    badge: 'bg-rose-950/50 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400'
  },
  due_today: {
    label: 'Due Today',
    badge: 'bg-rose-950/50 text-rose-400 border-rose-500/40',
    dot: 'bg-rose-400'
  }
};

export function StatusBadge({
  status,
  label,
  showDot = true,
  size = 'xs',
  className = ''
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] || {
    label: status.replace(/_/g, ' '),
    badge: 'bg-slate-900/60 text-slate-300 border-slate-700/50',
    dot: 'bg-slate-400'
  };

  const displayLabel = label || config.label;
  const sizeStyles = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded-full border whitespace-nowrap ${sizeStyles} ${config.badge} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      <span>{displayLabel}</span>
    </span>
  );
}
