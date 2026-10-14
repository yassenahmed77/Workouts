import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  badge?: string;
  sublabel?: string;
}

interface SelectDropdownProps<T extends string | number = string> {
  label?: string;
  required?: boolean;
  error?: string;
  value: T;
  onChange: (value: T) => void;
  options: (SelectOption<T> | T)[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function SelectDropdown<T extends string | number = string>({
  label,
  required = false,
  error,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  size = 'md',
}: SelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption<T>[] = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt && 'label' in opt) {
      return opt as SelectOption<T>;
    }
    return {
      value: opt as T,
      label: String(opt),
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on click outside and escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  const isSm = size === 'sm';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate">
            {label} {required && <span className="text-rose-400">*</span>}
          </label>
          {error && (
            <span className="text-[9px] text-rose-400 font-mono font-medium ml-1 truncate">{error}</span>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full ${isSm ? 'px-2 py-1 text-[11px] h-7' : 'px-2.5 py-1.5 text-xs h-8'} rounded-xl bg-[var(--input-bg)] border ${
          error ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
        } text-white flex items-center justify-between transition-all cursor-pointer select-none focus:outline-none hover:border-white/[0.18] active:scale-[0.99] ${
          isOpen ? 'border-[var(--main-color)] ring-1 ring-[var(--main-color)]/25' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${buttonClassName}`}
      >
        <span className="truncate font-sans font-medium text-left">
          {selectedOption ? selectedOption.label : <span className="text-slate-500">{placeholder}</span>}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 ml-1.5 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--main-color)]' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1 z-[150] max-h-56 overflow-y-auto custom-scrollbar p-1 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl shadow-black/90 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150 ${menuClassName}`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer font-sans text-left mb-0.5 last:mb-0 ${
                  isSelected
                    ? 'bg-[var(--main-color)]/15 text-[var(--main-color)] font-bold border border-[var(--main-color)]/30'
                    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex flex-col truncate pr-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-400 border border-white/[0.06]">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {opt.sublabel && (
                    <span className="text-[10px] text-slate-400 font-normal truncate mt-0.5">{opt.sublabel}</span>
                  )}
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)] flex-shrink-0 shadow-[0_0_6px_var(--main-color-glow)]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
