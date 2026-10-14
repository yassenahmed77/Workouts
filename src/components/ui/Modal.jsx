'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
export function Modal({ isOpen, onClose, title, description, maxWidth = 'max-w-md', children, headerActions, className = '', showCloseButton = true }) {
    // Listen for Escape key
    useEffect(() => {
        if (!isOpen)
            return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"/>

      {/* Modal Dialog Card */}
      <div className={`relative w-full ${maxWidth} rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl z-10 flex flex-col max-h-[90dvh] overflow-hidden text-white ${className}`}>
        {/* Header */}
        {(title || showCloseButton) && (<div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[var(--card-border)] flex-shrink-0">
            <div>
              {typeof title === 'string' ? (<h3 className="gym-heading-section text-white tracking-tight">
                  {title}
                </h3>) : (title)}
              {description && (<p className="gym-subtext mt-0.5">
                  {description}
                </p>)}
            </div>

            <div className="flex items-center gap-2">
              {headerActions}
              {showCloseButton && (<button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer" title="Close">
                  <X className="w-4 h-4"/>
                </button>)}
            </div>
          </div>)}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>);
}
