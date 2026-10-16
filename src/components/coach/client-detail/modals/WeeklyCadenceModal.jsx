'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, Clock } from 'lucide-react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { checkInService } from '@/services/checkInService';

const DAYS_OF_WEEK = [
  { id: 'friday', label: 'Friday', arabic: 'الجمعة', isPopular: true },
  { id: 'saturday', label: 'Saturday', arabic: 'السبت' },
  { id: 'sunday', label: 'Sunday', arabic: 'الأحد', isPopular: true },
  { id: 'monday', label: 'Monday', arabic: 'الاثنين' },
  { id: 'tuesday', label: 'Tuesday', arabic: 'الثلاثاء' },
  { id: 'wednesday', label: 'Wednesday', arabic: 'الأربعاء' },
  { id: 'thursday', label: 'Thursday', arabic: 'الخميس' }
];

export const WeeklyCadenceModal = ({ isOpen, onClose, client }) => {
  const { updateUserProfile } = useGym();
  const { showToast } = useToast();

  const [selectedDay, setSelectedDay] = useState(client?.checkInPreferredDay || 'friday');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client && isOpen) {
      setSelectedDay(client.checkInPreferredDay || 'friday');
    }
  }, [client, isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !client) return null;

  const nextDue = checkInService.calculateNextDueDate(selectedDay);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(client.id, {
        checkInPreferredDay: selectedDay
      });
      const capitalized = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);
      showToast(`Weekly check-in schedule set to ${capitalized} ✓`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to update check-in schedule', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--main-color)]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Cadence Protocol
              </span>
            </div>
            <h3 className="gym-heading-card text-white mt-0.5">
              Weekly Check-In Day
            </h3>
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

        {/* Body */}
        <div className="p-4 space-y-3">
          <p className="text-slate-300 text-xs leading-relaxed">
            Choose the day of the week <strong className="text-white">{client.name}</strong> is expected to submit their weekly progress audit.
          </p>

          {/* Days Grid */}
          <div className="grid grid-cols-1 gap-1.5">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay.toLowerCase() === day.id;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDay(day.id)}
                  className={`w-full px-3 py-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--main-color-muted)] text-white border-[var(--main-color)] shadow-sm font-semibold'
                      : 'bg-white/[0.02] text-slate-300 hover:text-white hover:bg-white/[0.05] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium capitalize">{day.label}</span>
                    <span className="text-[10px] text-slate-500 font-sans">({day.arabic})</span>
                    {day.isPopular && (
                      <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-white/[0.08] text-slate-400 border border-white/10">
                        Popular
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[var(--main-color)] border-[var(--main-color)] text-white'
                        : 'border-white/20 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Projected Next Due Date pill */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center gap-2 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[var(--main-color)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9.5px] uppercase tracking-wider text-slate-500 font-mono block">
                Next Scheduled Due Date
              </span>
              <strong className="text-white font-mono text-xs">{nextDue.nextDueDateStr}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="gym-btn-secondary gym-btn-sm text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="gym-btn-primary gym-btn-sm text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Schedule'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
