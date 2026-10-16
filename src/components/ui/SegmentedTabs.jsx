'use client';
import React from 'react';
/**
 * High-performance, accessible segmented control with concentric nested radius.
 * Guaranteed zero border collision and zero layout shift.
 */
export function SegmentedTabs({ items, value, onChange, className = '', buttonClassName = '', size = 'sm', variant = 'slate', noScroll = false }) {
    // Height & padding scale
    const sizeStyles = {
        xs: 'py-0.5 px-1.5 sm:px-2 text-[9.5px]',
        sm: 'py-1 px-3 text-xs',
        md: 'py-1.5 px-3.5 text-xs'
    }[size];
    // Active state variants
    const getActiveStyles = () => {
        switch (variant) {
            case 'blue':
                return 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-md shadow-[var(--main-color)]/25 font-bold';
            case 'glass':
                return 'bg-white/[0.12] text-white border-white/20 shadow-sm font-bold';
            case 'solid-white':
                return 'bg-white text-[var(--bg-main)] border-white shadow-sm font-bold';
            case 'slate':
            default:
                return 'bg-[var(--card-subtle-bg)] text-white border-[var(--card-border)] shadow-sm font-semibold';
        }
    };
    const getInactiveStyles = () => {
        switch (variant) {
            case 'blue':
                return 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] bg-transparent border-transparent';
            case 'glass':
                return 'text-slate-400 hover:text-slate-200 bg-transparent border-transparent';
            case 'solid-white':
                return 'bg-[var(--card-bg)] text-slate-400 hover:text-white border-[var(--card-border)]';
            case 'slate':
            default:
                return 'text-slate-400 hover:text-white bg-transparent border-transparent';
        }
    };
    return (<div role="tablist" {...(!noScroll && {
        onWheel: (e) => {
            if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
            }
        }
    })} className={`flex items-center ${noScroll
            ? 'w-full justify-between gap-0.5 overflow-hidden'
            : size === 'xs'
                ? 'gap-0.5 overflow-x-auto custom-scrollbar scroll-smooth pb-0.5'
                : 'gap-1 overflow-x-auto custom-scrollbar scroll-smooth pb-0.5'} ${size === 'xs' ? 'p-0.5' : 'p-1'} rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] select-none ${className}`}>
      {items.map((tab) => {
            const isSelected = value === tab.key;
            return (<button key={tab.key} role="tab" aria-selected={isSelected} onClick={() => onChange(tab.key)} className={`${noScroll ? 'flex-1 min-w-0' : 'flex-1 min-w-max'} flex items-center justify-center gap-0.5 rounded-lg whitespace-nowrap transition-all cursor-pointer border ${sizeStyles} ${isSelected ? getActiveStyles() : getInactiveStyles()} ${buttonClassName}`}>
            <span className={noScroll ? 'truncate' : ''}>{tab.label}</span>

            {/* Optional count or status badge */}
            {tab.count !== undefined && (<span className={`text-[9px] font-mono px-0.5 rounded-full flex-shrink-0 ${isSelected
                        ? (variant === 'blue' ? 'text-[var(--main-color)] font-bold' : 'text-white/80')
                        : (variant === 'blue' ? 'text-slate-500' : 'text-[var(--muted-color)]')}`}>
                ({tab.count})
              </span>)}

            {tab.badge !== undefined && Boolean(tab.badge) && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-mono font-bold flex-shrink-0 ${
                isSelected
                  ? 'bg-white text-[var(--main-color)] shadow-xs'
                  : 'bg-[var(--main-color)]/15 text-[var(--main-color)] border border-[var(--main-color)]/30'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>);
        })}
    </div>);
}
