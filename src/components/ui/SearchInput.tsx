'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showShortcut?: boolean;
  shortcutText?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  size?: 'sm' | 'md';
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  showShortcut = false,
  shortcutText = '⌘ K',
  onClear,
  autoFocus = false,
  size = 'sm'
}: SearchInputProps) {
  const sizeStyles = {
    sm: 'py-1.5 pl-9 pr-8 text-xs',
    md: 'py-2 pl-10 pr-9 text-xs'
  }[size];

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="w-3.5 h-3.5 text-[#526075] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full rounded-xl bg-[#090e17] border border-[#16202e] text-white placeholder-[#526075] focus:outline-none focus:border-[#334155] transition-colors ${sizeStyles} ${inputClassName}`}
      />

      {/* Clear Button or Keyboard Shortcut */}
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white p-0.5 rounded cursor-pointer transition-colors"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : showShortcut ? (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#111622] text-[#64748b] border border-[#1c2637] pointer-events-none">
          {shortcutText}
        </span>
      ) : null}
    </div>
  );
}
