'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * ClientNotesModal (Presentation Layer - Atomic Modal)
 *
 * Dedicated coach notepad modal with auto-focus, red-line legal pad styling,
 * escape-key listener, and backdrop dismissal.
 */
export const ClientNotesModal = ({
  isOpen,
  onClose,
  clientName,
  notesInput,
  onNotesChange,
  onSave,
  isSaving
}) => {
  // Dismiss on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between">
          <div>
            <h3 className="gym-heading-section text-white tracking-wide">
              Coach Notes & Directives
            </h3>
            <p className="text-[11px] font-mono text-[var(--main-color)] font-medium">
              {clientName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notepad Body */}
        <div className="p-4 sm:p-5 bg-[var(--bg-main)] relative">
          <div className="relative rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] overflow-hidden focus-within:border-[var(--main-color)]/40 transition-colors">
            {/* Traditional red margin line */}
            <div className="absolute left-3.5 top-0 bottom-0 w-[1px] bg-red-500/20 pointer-events-none" />
            <textarea
              value={notesInput}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={`Write private directives, injury notes, or reminders for ${clientName}...`}
              rows={8}
              className="w-full py-3.5 pl-6 pr-3 bg-transparent text-xs sm:text-[13px] text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans leading-relaxed custom-scrollbar"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Visible to coach only &bull; Encrypted
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="gym-btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="gym-btn-primary text-xs"
            >
              <span>{isSaving ? 'Saving...' : 'Save Notes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
