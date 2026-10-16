'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Edit2,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X
} from 'lucide-react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { formatWhatsAppPhone, buildWhatsAppCheckInReminderUrl } from '@/lib/whatsapp';

/**
 * RequestDetailsInspector (Coach Telemetry Engine)
 *
 * Full-fidelity audit inspection of pending trainee check-in requests:
 * - Real-time Lifecycle Timeline: Sent ➔ Seen by Athlete ➔ Due Date
 *   with continuous connected line (solid when completed, dashed when pending)
 * - Centered Required Scope without decorative icons (Pure Brand Typography)
 * - Multi-Request Scenarios Support (toggle through multiple requests in the same inspector)
 * - Modal / Floated Dialog Mode (Zero layout disruption, preserves 100% viewport height)
 * - Coach Directives & Instruction Quote
 * - Unified Obsidian & Sapphire Brand Palette (Zero color clutter)
 */
export const RequestDetailsInspector = ({
  client,
  onEditRequest,
  isModal = false,
  isOpen = true,
  onClose
}) => {
  const { updateUserProfile } = useGym();
  const { showToast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedRequestIdx, setSelectedRequestIdx] = useState(0);

  // Keyboard escape listener for modal mode
  useEffect(() => {
    if (!isModal || !isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, isOpen, onClose]);

  // Extract requests (single object or array for multi-request scenarios)
  const rawRequests = Array.isArray(client?.pendingCheckInRequests)
    ? client.pendingCheckInRequests
    : client?.pendingCheckInRequest
    ? [client.pendingCheckInRequest]
    : [];

  const pendingRequests = rawRequests.filter(
    (r) => r && (r.status === 'pending' || !r.status)
  );

  if (pendingRequests.length === 0) {
    return null;
  }

  if (isModal && !isOpen) {
    return null;
  }

  const activeIdx = Math.min(selectedRequestIdx, pendingRequests.length - 1);
  const request = pendingRequests[activeIdx] || pendingRequests[0];

  // 1. Timeline Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const requestedAt = request.requestedAt || todayStr;
  const seenAt = request.seenAt || null;
  const dueDate = request.dueDate || 'immediate';

  // Calculate Due Status
  const isImmediate = dueDate === 'immediate';
  let isOverdue = false;
  let isDueToday = false;
  let daysDiff = 0;

  if (!isImmediate && dueDate) {
    const today = new Date(todayStr);
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) {
      isOverdue = true;
    } else if (daysDiff === 0) {
      isDueToday = true;
    }
  }

  // 2. Action: Cancel Request
  const handleCancelRequest = async () => {
    setIsCancelling(true);
    try {
      if (pendingRequests.length > 1) {
        const updated = pendingRequests.filter((_, idx) => idx !== activeIdx);
        await updateUserProfile(client.id, {
          pendingCheckInRequests: updated,
          pendingCheckInRequest: updated[0] || null
        });
        setSelectedRequestIdx(0);
        showToast('Check-in request cancelled', 'info');
      } else {
        const updatePayload = {
          pendingCheckInRequest: null
        };
        if (Array.isArray(client?.pendingCheckInRequests)) {
          updatePayload.pendingCheckInRequests = [];
        }
        await updateUserProfile(client.id, updatePayload);
        showToast('Check-in request cancelled', 'info');
        if (onClose) onClose();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel request', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // 3. Action: Send Reminder via WhatsApp
  const handleSendReminderWhatsApp = () => {
    const cleanPhone = formatWhatsAppPhone(client?.phone);
    if (!cleanPhone) {
      showToast('Athlete has no valid WhatsApp phone number', 'warning');
      return;
    }

    const waUrl = buildWhatsAppCheckInReminderUrl({
      phone: cleanPhone,
      clientName: client?.name,
      lastCheckInDate: client?.lastCheckInDate || client?.lastCheckIn,
      coachName: 'Coach',
      scope: request?.scope,
      coachNotes: request?.notes
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const scope = request.scope || { weight: true, photos: true, inBody: true };

  // The core inspector card content
  const content = (
    <div className="rounded-xl border border-white/10 bg-[var(--card-bg)] shadow-2xl select-none flex-shrink-0 animate-in fade-in duration-200 overflow-hidden w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.02] border-b border-white/[0.07] text-xs flex-nowrap gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-nowrap">
          <span className="w-2 h-2 rounded-full bg-[var(--main-color)] flex-shrink-0" />
          <span className="font-mono font-bold text-white text-[11px] tracking-wide uppercase whitespace-nowrap">
            Request Inspector
          </span>
          <span className="text-slate-600 font-mono flex-shrink-0">•</span>
          <span className="text-[10px] font-mono text-slate-300 whitespace-nowrap px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
            {isImmediate
              ? 'Immediate'
              : isOverdue
              ? `Overdue (${Math.abs(daysDiff)}d)`
              : isDueToday
              ? 'Due Today'
              : `Due ${dueDate}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSendReminderWhatsApp}
            className="gym-btn-secondary gym-btn-sm flex items-center gap-1 text-[11px] font-mono text-slate-300 hover:text-white"
            title="Send reminder via WhatsApp"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Remind</span>
          </button>

          {onEditRequest && (
            <button
              type="button"
              onClick={onEditRequest}
              className="gym-btn-secondary gym-btn-sm flex items-center gap-1 text-[11px] font-mono text-slate-300 hover:text-white"
              title="Edit audit directives or date"
            >
              <Edit2 className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Modify</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCancelRequest}
            disabled={isCancelling}
            className="gym-btn-secondary gym-btn-sm flex items-center gap-1 text-[11px] font-mono text-rose-400 border-rose-500/25 hover:bg-rose-500/10"
            title="Cancel / revoke pending request"
          >
            <XCircle className="w-3 h-3" />
            <span className="hidden sm:inline">{isCancelling ? 'Cancelling...' : 'Cancel'}</span>
          </button>

          {isModal && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white cursor-pointer ml-1"
              title="Close Inspector"
              aria-label="Close Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded text-slate-400 hover:text-white cursor-pointer ml-1"
              title={isCollapsed ? 'Expand Details' : 'Collapse Details'}
              aria-label="Toggle request inspector details"
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Multi-Request Scenario Selector Bar (Tabs) */}
      {pendingRequests.length > 1 && (
        <div className="flex items-center gap-1 px-3.5 py-1.5 bg-white/[0.015] border-b border-white/[0.05] overflow-x-auto custom-scrollbar">
          <span className="text-[9px] font-mono text-slate-500 uppercase mr-1 flex-shrink-0 font-semibold">
            Active Requests ({pendingRequests.length}):
          </span>
          {pendingRequests.map((req, idx) => {
            const isTabActive = idx === activeIdx;
            return (
              <button
                key={req.id || idx}
                type="button"
                onClick={() => setSelectedRequestIdx(idx)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap flex-shrink-0 border flex items-center gap-1 ${
                  isTabActive
                    ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] font-bold shadow-xs'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/[0.06]'
                }`}
              >
                <span>Request #{idx + 1}</span>
                <span className="text-[9px] opacity-80">({req.dueDate === 'immediate' ? 'Immediate' : req.dueDate})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Expandable Body */}
      {!isCollapsed && (
        <div className="p-3.5 space-y-3 text-xs">
          {/* 1. Real-Time Connected Timeline: Sent ➔ Seen ➔ Due */}
          <div className="gym-card-subtle p-3 rounded-xl border border-white/[0.05]">
            <span className="text-[9px] font-mono uppercase text-slate-400 font-semibold tracking-wider block text-center mb-3">
              Request Delivery Timeline
            </span>

            <div className="relative flex items-center justify-between max-w-md mx-auto px-6">
              {/* Connector Line 1: Sent -> Delivered */}
              <div
                className={`absolute top-3.5 left-[18%] right-[50%] h-[2px] -translate-y-1/2 z-0 ${
                  seenAt
                    ? 'bg-[var(--main-color)]'
                    : 'border-t-2 border-dashed border-white/20'
                }`}
              />

              {/* Connector Line 2: Delivered -> Due */}
              <div
                className="absolute top-3.5 left-[50%] right-[18%] h-[2px] -translate-y-1/2 z-0 border-t-2 border-dashed border-white/20"
              />

              {/* Node 1: Sent */}
              <div className="flex flex-col items-center text-center relative z-10 min-w-[70px]">
                <div className="w-7 h-7 rounded-full bg-[var(--main-color)] text-white flex items-center justify-center font-bold mb-1 shadow-md ring-4 ring-[#0f1015]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-white">Sent</span>
                <span className="text-[9px] font-mono text-slate-400">{requestedAt}</span>
              </div>

              {/* Node 2: Delivered / Seen */}
              <div className="flex flex-col items-center text-center relative z-10 min-w-[70px]">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-all ring-4 ring-[#0f1015] ${
                    seenAt
                      ? 'bg-[var(--main-color)] text-white shadow-md'
                      : 'bg-[#181b23] border border-white/20 text-slate-400 shadow-sm'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-mono font-bold ${seenAt ? 'text-white' : 'text-slate-400'}`}>
                  {seenAt ? 'Seen' : 'Delivered'}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {seenAt ? seenAt : 'Awaiting read'}
                </span>
              </div>

              {/* Node 3: Due Window */}
              <div className="flex flex-col items-center text-center relative z-10 min-w-[70px]">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ring-4 ring-[#0f1015] ${
                    isOverdue
                      ? 'bg-[#221217] border border-rose-500/50 text-rose-400 shadow-sm'
                      : 'bg-[#181b23] border border-white/20 text-slate-200 shadow-sm'
                  }`}
                >
                  {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isOverdue ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {isImmediate ? 'Immediate' : isOverdue ? 'Overdue' : 'Due'}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {isImmediate ? 'Fasted today' : dueDate}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Audit Scope (Centered, Pure Typography, No Icons) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <span className="text-[9.5px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Required Scope:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {scope.weight !== false && (
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-mono bg-white/[0.05] text-slate-200 border border-white/10 font-medium">
                  Scale Weight
                </span>
              )}
              {scope.photos !== false && (
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-mono bg-white/[0.05] text-slate-200 border border-white/10 font-medium">
                  Physique Photos
                </span>
              )}
              {scope.inBody !== false && (
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-mono bg-[var(--main-color-muted)] text-[var(--main-color)] border border-[var(--main-color-border)] font-semibold">
                  InBody Scan
                </span>
              )}
            </div>
          </div>

          {/* 3. Coach Directives Quote */}
          {request.notes && (
            <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center gap-2 text-center max-w-xl mx-auto w-full">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold whitespace-nowrap">
                Coach Directive:
              </span>
              <p className="text-xs text-slate-300 italic font-sans truncate">
                "{request.notes}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // If used in Modal Mode (for non-disruptive floating dialog)
  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        <div
          className="relative w-full max-w-xl animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  // Standalone inline mode
  return content;
};
