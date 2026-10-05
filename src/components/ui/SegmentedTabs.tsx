'use client';

import React from 'react';

export interface SegmentedTabItem<T extends string = string> {
  key: T;
  label: string;
  count?: number;
  badge?: number | string;
}

export interface SegmentedTabsProps<T extends string = string> {
  items: readonly SegmentedTabItem<T>[] | SegmentedTabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
  buttonClassName?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'slate' | 'glass' | 'solid-white' | 'cyan';
  noScroll?: boolean;
}

/**
 * High-performance, accessible segmented control with concentric nested radius.
 * Guaranteed zero border collision and zero layout shift.
 */
export function SegmentedTabs<T extends string = string>({
  items,
  value,
  onChange,
  className = '',
  buttonClassName = '',
  size = 'sm',
  variant = 'slate',
  noScroll = false
}: SegmentedTabsProps<T>) {
  // Height & padding scale
  const sizeStyles = {
    xs: noScroll ? 'py-1 px-1.5 text-[10px]' : 'py-1 px-2.5 text-[10px]',
    sm: 'py-1 px-3 text-xs',
    md: 'py-1.5 px-3.5 text-xs'
  }[size];

  // Active state variants
  const getActiveStyles = () => {
    switch (variant) {
      case 'cyan':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35 shadow-sm shadow-cyan-950/40 font-bold';
      case 'glass':
        return 'bg-white/[0.12] text-white border-white/20 shadow-sm font-bold';
      case 'solid-white':
        return 'bg-white text-[#080c14] border-white shadow-sm font-bold';
      case 'slate':
      default:
        return 'bg-[#151f2e] text-white border-[#233146] shadow-sm font-semibold';
    }
  };

  const getInactiveStyles = () => {
    switch (variant) {
      case 'cyan':
        return 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] bg-transparent border-transparent';
      case 'glass':
        return 'text-slate-400 hover:text-slate-200 bg-transparent border-transparent';
      case 'solid-white':
        return 'bg-[#0f1724] text-[#64748b] hover:text-white border-[#16202e]';
      case 'slate':
      default:
        return 'text-[#64748b] hover:text-white bg-transparent border-transparent';
    }
  };

  return (
    <div
      role="tablist"
      {...(!noScroll && {
        onWheel: (e: React.WheelEvent<HTMLDivElement>) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }
      })}
      className={`flex items-center ${
        noScroll 
          ? 'w-full justify-between gap-0.5 overflow-hidden' 
          : 'gap-1 overflow-x-auto custom-scrollbar scroll-smooth pb-1.5'
      } p-1 rounded-xl bg-[#05080e] border border-[#16202e] select-none ${className}`}
    >
      {items.map((tab) => {
        const isSelected = value === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(tab.key)}
            className={`${
              noScroll ? 'flex-1 min-w-0' : ''
            } flex items-center justify-center gap-1 rounded-lg whitespace-nowrap transition-all cursor-pointer border ${sizeStyles} ${
              isSelected ? getActiveStyles() : getInactiveStyles()
            } ${buttonClassName}`}
          >
            <span>{tab.label}</span>

            {/* Optional count or status badge */}
            {tab.count !== undefined && (
              <span
                className={`text-[9.5px] font-mono px-1 rounded-full ${
                  isSelected 
                    ? (variant === 'cyan' ? 'text-cyan-400 font-bold' : 'text-white/80') 
                    : (variant === 'cyan' ? 'text-slate-500' : 'text-[#64748b]')
                }`}
              >
                ({tab.count})
              </span>
            )}

            {tab.badge !== undefined && Boolean(tab.badge) && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
