'use client';
import React from 'react';
import { Search, X } from 'lucide-react';
export function SearchInput({ value, onChange, placeholder = 'Search...', className = '', inputClassName = '', showShortcut = false, shortcutText = '⌘ K', onClear, autoFocus = false, size = 'sm' }) {
    const sizeStyles = {
        sm: 'py-1.5 pl-9 pr-8 text-xs',
        md: 'py-2 pl-10 pr-9 text-xs'
    }[size];
    const handleClear = () => {
        onChange('');
        if (onClear)
            onClear();
    };
    return (<div className={`relative ${className}`}>
      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} className={`w-full rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors ${sizeStyles} ${inputClassName}`}/>

      {/* Clear Button or Keyboard Shortcut */}
      {value ? (<button type="button" onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors" title="Clear search">
          <X className="w-3.5 h-3.5"/>
        </button>) : showShortcut ? (<span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--card-subtle-bg)] text-slate-400 border border-[var(--card-border)] pointer-events-none">
          {shortcutText}
        </span>) : null}
    </div>);
}
