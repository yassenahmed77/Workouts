'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Camera, Send, Trash2, Check } from 'lucide-react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { checkInService } from '@/services/checkInService';
import { formatWhatsAppPhone, buildWhatsAppCheckInReminderUrl } from '@/lib/whatsapp';
import { sanitizeNotes } from '@/lib/sanitizer';
import { ObsidianCalendarModal } from '@/components/ui/ObsidianCalendarModal';

/**
 * RequestCheckInModal (Presentation Layer - Production Coach Directive Modal)
 *
 * Designed with zero scrollbar, premium typography, custom ObsidianCalendarModal date picker,
 * and clean scope selection without decorative icon clutter.
 */
export const RequestCheckInModal = ({
  isOpen,
  onClose,
  client
}) => {
  const { updateUserProfile } = useGym();
  const { showToast } = useToast();

  const [preferredDay, setPreferredDay] = useState(client?.checkInPreferredDay || 'friday');
  const [scheduleMode, setScheduleMode] = useState('immediate'); // 'immediate' | 'scheduled'
  const [scheduledDate, setScheduledDate] = useState(() => {
    const next = checkInService.calculateNextDueDate(client?.checkInPreferredDay || 'friday');
    return next.nextDueDateStr;
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [scopeWeight, setScopeWeight] = useState(true);
  const [scopePhotos, setScopePhotos] = useState(true);
  const [scopeInBody, setScopeInBody] = useState(true);
  const [coachNotes, setCoachNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize state when client or modal opens
  useEffect(() => {
    if (client && isOpen) {
      const clientPrefDay = client.checkInPreferredDay || 'friday';
      setPreferredDay(clientPrefDay);
      const next = checkInService.calculateNextDueDate(clientPrefDay);
      setScheduledDate(next.nextDueDateStr);
      setCoachNotes('');
      setScopeWeight(true);
      setScopePhotos(true);
      setScopeInBody(true);
      setScheduleMode('immediate');
    }
  }, [client, isOpen]);

  // Escape key listener (only dismiss when child calendar isn't open)
  useEffect(() => {
    if (!isOpen || isCalendarOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCalendarOpen, onClose]);

  if (!isOpen || !client) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const existingPendingList = Array.isArray(client?.pendingCheckInRequests)
    ? client.pendingCheckInRequests.filter((r) => r && (r.status === 'pending' || !r.status))
    : client?.pendingCheckInRequest && client.pendingCheckInRequest.status === 'pending'
    ? [client.pendingCheckInRequest]
    : [];
  const hasExistingPending = existingPendingList.length > 0;

  const handleCancelPending = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        pendingCheckInRequest: null
      };
      if (Array.isArray(client?.pendingCheckInRequests)) {
        payload.pendingCheckInRequests = [];
      }
      await updateUserProfile(client.id, payload);
      showToast('Pending check-in requests cleared', 'info');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!scopeWeight && !scopePhotos && !scopeInBody) {
      showToast('Please select at least one audit scope item', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanNotes = sanitizeNotes(coachNotes);
      const dueDate = scheduleMode === 'immediate' ? 'immediate' : scheduledDate;

      const requestPayload = {
        id: `req-${Date.now()}`,
        status: 'pending',
        requestedAt: todayStr,
        dueDate,
        scope: {
          weight: scopeWeight,
          photos: scopePhotos,
          inBody: scopeInBody
        },
        notes: cleanNotes
      };

      // Append to multi-request queue
      const updatedQueue = [...existingPendingList, requestPayload];

      const profilePayload = {
        pendingCheckInRequest: updatedQueue[0],
        checkInPreferredDay: preferredDay
      };
      if (updatedQueue.length > 1 || Array.isArray(client?.pendingCheckInRequests)) {
        profilePayload.pendingCheckInRequests = updatedQueue;
      }

      await updateUserProfile(client.id, profilePayload);

      showToast(
        updatedQueue.length > 1
          ? `Check-in request #${updatedQueue.length} queued for ${client.name}`
          : `Check-in request sent to ${client.name}`,
        'success'
      );

      // WhatsApp deep-link prompt
      const cleanPhone = formatWhatsAppPhone(client.phone);
      if (cleanPhone) {
        const waUrl = buildWhatsAppCheckInReminderUrl({
          phone: cleanPhone,
          clientName: client.name,
          lastCheckInDate: client.lastCheckInDate || client.lastCheckIn,
          coachName: 'Coach',
          scope: requestPayload.scope,
          coachNotes: cleanNotes
        });
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }

      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to submit check-in request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDayChange = (day) => {
    setPreferredDay(day);
    const next = checkInService.calculateNextDueDate(day);
    setScheduledDate(next.nextDueDateStr);
  };

  const quickDirectives = [
    'Morning fasted weigh-in',
    '3 angles (front, side, back)',
    'Fresh InBody composition scan'
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Protocol Directive
                </span>
                <span className="text-slate-600 text-xs">&bull;</span>
                <span className="text-[10px] font-mono text-[var(--main-color)] font-medium">
                  {client.name}
                </span>
              </div>
              <h3 className="gym-heading-card text-white mt-0.5">
                Request Athlete Check-In
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

          {/* Active Pending Request Notice Banner (Compact) */}
          {hasExistingPending && (
            <div className="mx-4 mt-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-mono text-slate-300">
                  {existingPendingList.length > 1
                    ? `${existingPendingList.length} Active Requests in Queue`
                    : `1 Active Request (Due: ${client.pendingCheckInRequest?.dueDate === 'immediate' ? 'Immediate' : client.pendingCheckInRequest?.dueDate || 'immediate'})`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelPending}
                disabled={isSubmitting}
                className="text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Cancel all pending requests in queue"
              >
                <Trash2 className="w-3 h-3" />
                <span>Cancel All</span>
              </button>
            </div>
          )}

          {/* Modal Body - Tight Spacing, ZERO Scrollbar */}
          <div className="px-4 py-3 space-y-2.5">
            {/* Section 1: Required Scope (3 Clean Cards: Weight, Photos, InBody) */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Required Scope
              </span>
              <div className="grid grid-cols-3 gap-2">
                {/* Weight */}
                <button
                  type="button"
                  onClick={() => setScopeWeight(!scopeWeight)}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    scopeWeight
                      ? 'bg-white/[0.08] text-white border-white/20 shadow-sm'
                      : 'bg-white/[0.02] text-slate-500 border-white/[0.06] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold block tracking-tight truncate">Weight</span>
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8.5px] flex-shrink-0 ${
                        scopeWeight
                          ? 'bg-[var(--main-color)] border-[var(--main-color)] text-black font-bold'
                          : 'border-slate-700'
                      }`}
                    >
                      {scopeWeight && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-mono mt-0.5 truncate">Scale (kg)</span>
                </button>

                {/* Photos */}
                <button
                  type="button"
                  onClick={() => setScopePhotos(!scopePhotos)}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    scopePhotos
                      ? 'bg-white/[0.08] text-white border-white/20 shadow-sm'
                      : 'bg-white/[0.02] text-slate-500 border-white/[0.06] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold block tracking-tight truncate">Photos</span>
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8.5px] flex-shrink-0 ${
                        scopePhotos
                          ? 'bg-[var(--main-color)] border-[var(--main-color)] text-black font-bold'
                          : 'border-slate-700'
                      }`}
                    >
                      {scopePhotos && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-mono mt-0.5 truncate">Physique</span>
                </button>

                {/* InBody Scan */}
                <button
                  type="button"
                  onClick={() => setScopeInBody(!scopeInBody)}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    scopeInBody
                      ? 'bg-white/[0.08] text-white border-white/20 shadow-sm'
                      : 'bg-white/[0.02] text-slate-500 border-white/[0.06] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold block tracking-tight truncate">InBody</span>
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8.5px] flex-shrink-0 ${
                        scopeInBody
                          ? 'bg-[var(--main-color)] border-[var(--main-color)] text-black font-bold'
                          : 'border-slate-700'
                      }`}
                    >
                      {scopeInBody && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-mono mt-0.5 truncate">Fat & Muscle</span>
                </button>
              </div>
            </div>

            {/* Section 2: Due Timing & Specific Date with Obsidian Calendar Modal */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Submission Due Timing
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleMode('immediate')}
                  className={`py-1.5 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                    scheduleMode === 'immediate'
                      ? 'bg-white/[0.08] text-white border-white/20 font-medium'
                      : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-semibold block">Immediate</span>
                  <span className="text-[9.5px] text-slate-400 font-mono">Prompt athlete today</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScheduleMode('scheduled');
                    setIsCalendarOpen(true);
                  }}
                  className={`py-1.5 px-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    scheduleMode === 'scheduled'
                      ? 'bg-white/[0.08] text-white border-white/20 font-medium'
                      : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold block flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--main-color)]" />
                      <span>Specific Date</span>
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-mono">
                      {scheduleMode === 'scheduled' ? scheduledDate : 'Open calendar'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Formatted Date Pill trigger for Custom Obsidian Calendar */}
              {scheduleMode === 'scheduled' && (
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                  className="w-full mt-1 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between text-xs font-mono text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[var(--main-color)]" />
                    <span>Target Date: <strong className="text-white">{scheduledDate}</strong></span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    Tap to change &rarr;
                  </span>
                </button>
              )}
            </div>

            {/* Section 3: Preferred Recurring Weekly Day */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Recurring Day
                </span>
                <span className="text-[10px] font-mono text-slate-500">Every week</span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {[
                  { key: 'sunday', label: 'Sun' },
                  { key: 'monday', label: 'Mon' },
                  { key: 'tuesday', label: 'Tue' },
                  { key: 'wednesday', label: 'Wed' },
                  { key: 'thursday', label: 'Thu' },
                  { key: 'friday', label: 'Fri' },
                  { key: 'saturday', label: 'Sat' }
                ].map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => handleDayChange(d.key)}
                    className={`py-1 rounded-lg text-center font-mono text-[10px] transition-all cursor-pointer border ${
                      preferredDay.toLowerCase() === d.key
                        ? 'bg-white/[0.12] text-white border-white/25 font-bold shadow-sm'
                        : 'bg-white/[0.02] text-slate-400 border-white/[0.04] hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: Directives / Instructions */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Directives for {client.name}
              </span>

              <textarea
                rows={2}
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="e.g. Weigh in morning fasted after bathroom. Take 3 relaxed photos under clear light..."
                className="gym-input w-full h-auto min-h-[48px] p-2 text-xs font-sans leading-relaxed resize-none"
              />

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {quickDirectives.map((text, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const separator = coachNotes.trim().length > 0 ? ' • ' : '';
                      setCoachNotes(coachNotes.trim() + separator + text);
                    }}
                    className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 text-[9.5px] font-mono border border-white/[0.06] transition-colors cursor-pointer"
                  >
                    + {text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">
              Dispatches prompt + WhatsApp
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="gym-btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="gym-btn-primary text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Custom Obsidian Calendar Modal (Zero Native HTML) */}
      <ObsidianCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={scheduledDate}
        onSelectDate={(dateStr) => {
          setScheduledDate(dateStr);
          setIsCalendarOpen(false);
        }}
      />
    </>
  );
};
