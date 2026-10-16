'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Camera,
  Activity,
  Send,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  X,
  Split,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { checkInService } from '@/services/checkInService';
import { PhotoComparisonModal } from './PhotoComparisonModal';
import { RequestCheckInModal } from './modals/RequestCheckInModal';
import { WeeklyCadenceModal } from './modals/WeeklyCadenceModal';
import { RequestDetailsInspector } from './RequestDetailsInspector';
import { sanitizeNotes } from '@/lib/sanitizer';
import { formatWhatsAppPhone, buildWhatsAppCheckInFeedbackUrl } from '@/lib/whatsapp';

/**
 * ClientCheckInsTab (Presentation Layer - Coach Check-In Cockpit)
 *
 * Full responsive check-in management experience across Desktop, Laptop, and Mobile:
 * - Coach Action Bar with [+ Request Check-In] modal trigger & preferred schedule
 * - Multi-status filter pills (All, Needs Review, Reviewed)
 * - Desktop 2-column split (Left timeline rail with weight deltas, Right detail stage)
 * - Mobile / Laptop fluid horizontal date strip + card stack
 * - Active Check-In Stage:
 *   - Weight audit vs previous & vs starting baseline
 *   - Bio-metrics indicators (Energy, Sleep, Hunger)
 *   - Physique photos grid with single-tap Lightbox expansion
 *   - Tape measurements grid with cm deltas
 *   - Trainee submission notes
 *   - Coach interactive feedback with draft persistence + WhatsApp quick dispatch
 * - High-end empty state with 1-click request prompt
 */
export const ClientCheckInsTab = ({ client }) => {
  const { getCheckInsForUser, saveCheckInFeedback, updateUserProfile } = useGym();
  const { showToast } = useToast();

  // 1. Data & Telemetry
  const checkIns = useMemo(() => {
    return getCheckInsForUser(client?.id || '');
  }, [getCheckInsForUser, client?.id]);

  const telemetry = useMemo(() => {
    return checkInService.calculateCheckInTelemetry(client, checkIns);
  }, [client, checkIns]);

  // 2. Modals & Modes State
  const [isCadenceModalOpen, setIsCadenceModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  // 3. Filters: 'all' | 'needs_review' | 'reviewed'
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredCheckIns = useMemo(() => {
    if (filterStatus === 'needs_review') {
      return checkIns.filter((c) => !c.reviewed);
    }
    if (filterStatus === 'reviewed') {
      return checkIns.filter((c) => Boolean(c.reviewed));
    }
    return checkIns;
  }, [checkIns, filterStatus]);

  // 4. Active Selected Check-In
  const [selectedCheckInId, setSelectedCheckInId] = useState(
    checkIns.length > 0 ? checkIns[0].id : ''
  );

  // Keep selectedCheckInId valid when filter changes
  useEffect(() => {
    if (filteredCheckIns.length > 0) {
      const exists = filteredCheckIns.some((c) => c.id === selectedCheckInId);
      if (!exists) {
        setSelectedCheckInId(filteredCheckIns[0].id);
      }
    }
  }, [filteredCheckIns, selectedCheckInId]);

  // 5. In-Page Compare Mode state
  const [compareIdA, setCompareIdA] = useState(
    checkIns.length > 1 ? checkIns[checkIns.length - 1].id : checkIns[0]?.id || ''
  );
  const [compareIdB, setCompareIdB] = useState(checkIns[0]?.id || '');
  const [selectedAngle, setSelectedAngle] = useState('front');

  // 6. Draft Feedback Memory (per checkInId to avoid data loss on tab switches)
  const [feedbackDraft, setFeedbackDraft] = useState({});
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);

  // Normalize pending on-demand requests (supporting single object or multi-request array scenarios)
  const rawRequests = Array.isArray(client?.pendingCheckInRequests)
    ? client.pendingCheckInRequests
    : client?.pendingCheckInRequest
    ? [client.pendingCheckInRequest]
    : [];

  const pendingRequests = rawRequests.filter(
    (r) => r && (r.status === 'pending' || !r.status)
  );
  const hasPendingRequest = pendingRequests.length > 0;

  // Escape key handler for Lightbox
  useEffect(() => {
    if (!activeLightboxPhoto) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveLightboxPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxPhoto]);

  // Active check-in resolution
  const activeCheckIn = useMemo(() => {
    return checkIns.find((c) => c.id === selectedCheckInId) || checkIns[0] || null;
  }, [checkIns, selectedCheckInId]);

  // Find index of activeCheckIn to calculate deltas against previous submission
  const activeIndex = useMemo(() => {
    return checkIns.findIndex((c) => c.id === activeCheckIn?.id);
  }, [checkIns, activeCheckIn]);

  const previousCheckIn = activeIndex >= 0 && activeIndex < checkIns.length - 1
    ? checkIns[activeIndex + 1]
    : null;

  const baselineCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;

  // Weight Deltas
  const currentWeight = activeCheckIn?.weightKg ?? 0;
  const previousWeight = previousCheckIn?.weightKg ?? null;
  const weightDeltaVsPrev = previousWeight !== null
    ? Number((currentWeight - previousWeight).toFixed(1))
    : 0;

  const startingWeight = client?.startWeight ?? client?.initialWeight ?? baselineCheckIn?.weightKg ?? currentWeight;
  const totalWeightDelta = Number((currentWeight - startingWeight).toFixed(1));

  // InBody Composition Metrics & Deltas (Pure InBody, Zero Tape)
  const activeBf = activeCheckIn?.inBody?.bodyFatPct ?? activeCheckIn?.measurements?.bodyFatPercentage ?? client?.bodyFatPercentage ?? null;
  const prevBf = previousCheckIn?.inBody?.bodyFatPct ?? previousCheckIn?.measurements?.bodyFatPercentage ?? null;
  const bfDiff = activeBf !== null && prevBf !== null ? Number((activeBf - prevBf).toFixed(1)) : null;

  const activeMm = activeCheckIn?.inBody?.muscleMassKg ?? null;
  const prevMm = previousCheckIn?.inBody?.muscleMassKg ?? null;
  const mmDiff = activeMm !== null && prevMm !== null ? Number((activeMm - prevMm).toFixed(1)) : null;

  const activeWater = activeCheckIn?.inBody?.waterPct ?? null;
  const prevWater = previousCheckIn?.inBody?.waterPct ?? null;
  const waterDiff = activeWater !== null && prevWater !== null ? Number((activeWater - prevWater).toFixed(1)) : null;

  const activeVisceral = activeCheckIn?.inBody?.visceralFat ?? null;
  const prevVisceral = previousCheckIn?.inBody?.visceralFat ?? null;
  const visceralDiff = activeVisceral !== null && prevVisceral !== null ? Number((activeVisceral - prevVisceral).toFixed(1)) : null;

  const hasInBodyData = activeBf !== null || activeMm !== null || activeWater !== null || activeVisceral !== null;

  // Counts for filter chips
  const unreviewedCount = useMemo(() => checkIns.filter((c) => !c.reviewed).length, [checkIns]);
  const reviewedCount = useMemo(() => checkIns.filter((c) => c.reviewed).length, [checkIns]);

  // Side-by-side items
  const compareCheckInA = checkIns.find((c) => c.id === compareIdA);
  const compareCheckInB = checkIns.find((c) => c.id === compareIdB);

  // Feedback draft dirty state detection
  const currentDraftText = feedbackDraft[activeCheckIn?.id] !== undefined
    ? feedbackDraft[activeCheckIn.id]
    : (activeCheckIn?.coachFeedback || '');

  const isFeedbackDirty = currentDraftText.trim() !== (activeCheckIn?.coachFeedback || '').trim();

  // Handle Save Feedback & Mark Reviewed
  const handleSaveFeedback = async (checkInId) => {
    if (!checkInId) return;
    const rawText = feedbackDraft[checkInId] ?? activeCheckIn?.coachFeedback ?? '';
    const cleanText = sanitizeNotes(rawText);

    setIsSavingFeedback(true);
    try {
      const wasAlreadyReviewed = Boolean(activeCheckIn?.reviewed);
      await saveCheckInFeedback(checkInId, cleanText);

      // If client has a pending on-demand request, fulfill it
      if (client?.pendingCheckInRequest?.status === 'pending') {
        await updateUserProfile(client.id, {
          pendingCheckInRequest: null
        });
      }

      showToast(
        wasAlreadyReviewed
          ? 'Coach feedback updated successfully ✓'
          : 'Coach feedback saved & marked as reviewed ✓',
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to save feedback', 'error');
    } finally {
      setIsSavingFeedback(false);
    }
  };

  // Handle Send via WhatsApp (with auto-save if unreviewed or edited)
  const handleSendWhatsApp = async () => {
    if (!activeCheckIn) return;
    const currentFeedback = feedbackDraft[activeCheckIn.id] ?? activeCheckIn.coachFeedback ?? '';
    const cleanFeedback = sanitizeNotes(currentFeedback);

    // If there is an unreviewed submission or unsaved edits, auto-persist to check-in history!
    const needsAutoSave = !activeCheckIn.reviewed || isFeedbackDirty;
    if (needsAutoSave) {
      try {
        await saveCheckInFeedback(activeCheckIn.id, cleanFeedback);
        if (client?.pendingCheckInRequest?.status === 'pending') {
          await updateUserProfile(client.id, {
            pendingCheckInRequest: null
          });
        }
        showToast(
          activeCheckIn.reviewed
            ? 'Feedback updated & opened in WhatsApp ✓'
            : 'Check-in reviewed & opened in WhatsApp ✓',
          'success'
        );
      } catch (err) {
        console.error('Failed to auto-save feedback before WhatsApp dispatch:', err);
      }
    }

    const waUrl = buildWhatsAppCheckInFeedbackUrl({
      phone: client?.phone,
      clientName: client?.name,
      checkInDate: activeCheckIn.date,
      weightKg: activeCheckIn.weightKg,
      weightDelta: weightDeltaVsPrev,
      coachFeedback: cleanFeedback,
      coachName: 'Coach'
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // -------------------------------------------------------------
  // EMPTY STATE (0 Check-Ins Submitted Yet)
  // -------------------------------------------------------------
  if (checkIns.length === 0) {
    return (
      <div className="flex flex-col h-full space-y-3 select-none">
        {/* Top Action Bar even when empty */}
        <div className="flex items-center justify-between gap-2 p-3 gym-card">
          <div className="flex items-center gap-2">
            <span className="gym-label-mono">Check-In Protocol</span>
            <span className="text-slate-600 text-xs">&bull;</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${telemetry.pillClass}`}>
              {telemetry.statusLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="gym-btn-primary gym-btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Check-In</span>
          </button>
        </div>

        {/* On-Demand Request Details Inspector (Timeline Sent → Seen → Due & Scope) */}
        {client?.pendingCheckInRequest?.status === 'pending' && (
          <RequestDetailsInspector
            client={client}
            onEditRequest={() => setIsRequestModalOpen(true)}
          />
        )}

        {/* Empty State Card */}
        <div className="gym-card flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[var(--main-color)]">
            <Calendar className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="gym-heading-card text-white text-base">
              No Check-Ins Submitted Yet
            </h3>
            <p className="gym-subtext text-xs leading-relaxed">
              When {client?.name} logs weekly body weight, physique photos, and bio-metrics, they will appear here chronologically for your coaching review.
            </p>
          </div>

          {/* SaaS Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-lg w-full pt-2 text-left font-mono text-[11px]">
            <div className="gym-card-subtle p-3 space-y-1">
              <span className="text-[var(--main-color)] font-bold block">Weekly Cadence</span>
              <p className="text-slate-400 text-[10px]">
                Scheduled check-ins keep athletes accountable every {client?.checkInPreferredDay || 'Friday'}.
              </p>
            </div>
            <div className="gym-card-subtle p-3 space-y-1">
              <span className="text-white font-bold block">Progress Auditing</span>
              <p className="text-slate-400 text-[10px]">
                Comprehensive scale weight logs, 3-angle physique photos, and InBody composition.
              </p>
            </div>
            <div className="gym-card-subtle p-3 space-y-1">
              <span className="text-[var(--main-color)] font-bold block">Coach Directives</span>
              <p className="text-slate-400 text-[10px]">
                Deliver technical feedback, nutrition adjustments, and WhatsApp encouragement.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="gym-btn-primary mt-3 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Request First Check-In Now</span>
          </button>
        </div>

        <RequestCheckInModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          client={client}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL COCKPIT VIEW
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col h-full space-y-2 select-none overflow-hidden">
      {/* Sleek Floating On-Demand Request HUD Pill (Desktop >= 1024px) */}
      {hasPendingRequest && (
        <div 
          onClick={() => setIsInspectorModalOpen(true)}
          className="hidden lg:flex items-center justify-between px-3 py-1.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] hover:border-white/20 shadow-md text-xs select-none flex-shrink-0 cursor-pointer transition-all duration-150"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--main-color)] animate-pulse" />
            <span className="font-mono font-bold text-white text-[11px] uppercase tracking-wide">
              {pendingRequests.length === 1 ? '1 Active On-Demand Request' : `${pendingRequests.length} Active Requests`}
            </span>
            <span className="text-slate-600 font-mono hidden xs:inline">•</span>
            <span className="text-slate-300 font-mono text-[10.5px] hidden xs:inline">
              {pendingRequests[0].dueDate === 'immediate'
                ? 'Immediate'
                : `Due ${pendingRequests[0].dueDate}`}
            </span>
            {pendingRequests.length > 1 && (
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--main-color-muted)] text-[var(--main-color)] border border-[var(--main-color-border)]">
                Multi-Queue
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsInspectorModalOpen(true);
            }}
            className="gym-btn-secondary gym-btn-sm text-[10.5px] font-mono flex items-center gap-1.5 text-[var(--main-color)] border-[var(--main-color)]/30 hover:bg-[var(--main-color-muted)] cursor-pointer"
          >
            <span>Inspect Timeline & Scope</span>
            <span className="text-xs">&rarr;</span>
          </button>
        </div>
      )}

      {/* Mobile-Only Horizontal Dates Timeline Strip (Centered Horizontally on Tablet, Scrollable from Left on Mobile, No Scrollbar) */}
      <div className="flex lg:hidden items-center overflow-x-auto no-scrollbar pt-3 pb-2 flex-shrink-0 w-full select-none">
        <div className="flex items-center gap-1.5 min-w-full justify-start sm:justify-center px-1 flex-nowrap">
          {/* Weekly Cadence Schedule Pill (Mobile) */}
          <button
            type="button"
            onClick={() => setIsCadenceModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border flex-shrink-0 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]"
            title={`Weekly check-in day: ${client?.checkInPreferredDay || 'Friday'} (Tap to edit)`}
          >
            <Calendar className="w-3 h-3 text-[var(--main-color)]" />
            <span className="capitalize font-mono text-[11px] font-semibold">{client?.checkInPreferredDay ? client.checkInPreferredDay.slice(0, 3) : 'Fri'}</span>
          </button>

          {checkIns.map((item) => {
            const isSelected = item.id === (activeCheckIn?.id || '');
            return (
              <button
                key={item.id}
                onClick={() => setSelectedCheckInId(item.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border flex-shrink-0 ${
                  isSelected
                    ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-[0_0_15px_rgba(59,130,246,0.35)] font-semibold'
                    : 'bg-[var(--card-subtle-bg)] text-slate-400 hover:text-white hover:bg-[var(--main-color-muted)] hover:border-[var(--main-color-border)] border-[var(--card-border)]'
                }`}
              >
                <span className="font-mono text-xs">{item.date}</span>
                {!item.reviewed ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[var(--main-color)]'}`}
                    title="Needs Review"
                  />
                ) : (
                  <Check className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Responsive Grid: Desktop 2-Column Split / Mobile Fluid */}
      <div className="flex-1 min-h-0 flex gap-3 overflow-hidden">
        {/* Left Column: Desktop Timeline Rail (Hidden < 1024px) */}
        <div className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col h-full overflow-hidden">
          {/* 1. Left Rail Top Bar: Filters + Weekly Cadence Indicator */}
          <div className="flex items-center justify-between pb-2 flex-shrink-0 gap-1">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-white/[0.12] text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({checkIns.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('needs_review')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'needs_review'
                    ? 'bg-[var(--main-color)] text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {unreviewedCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
                <span>Needs Review ({unreviewedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('reviewed')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  filterStatus === 'reviewed'
                    ? 'bg-white/[0.12] text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reviewed ({reviewedCount})
              </button>
            </div>

            {/* Weekly Cadence Schedule Trigger (Opens WeeklyCadenceModal) */}
            <button
              type="button"
              onClick={() => setIsCadenceModalOpen(true)}
              className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300 hover:text-white px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer shadow-sm group"
              title={`Weekly recurring check-in day: ${client?.checkInPreferredDay || 'Friday'} (Click to change)`}
            >
              <Calendar className="w-3 h-3 text-[var(--main-color)] group-hover:scale-105 transition-transform" />
              <span className="capitalize font-semibold">{client?.checkInPreferredDay ? client.checkInPreferredDay.slice(0, 3) : 'Fri'}</span>
            </button>
          </div>

          {/* 2. Left Rail Middle: Scrollable Cards Rail */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 space-y-2">
            {filteredCheckIns.length === 0 ? (
              <div className="gym-card p-4 text-center text-xs font-mono text-slate-500">
                No check-ins match filter
              </div>
            ) : (
              filteredCheckIns.map((item, idx) => {
                const isSelected = item.id === (activeCheckIn?.id || '');
                const itemPrev = idx < filteredCheckIns.length - 1 ? filteredCheckIns[idx + 1] : null;
                const itemDelta = itemPrev ? Number((item.weightKg - itemPrev.weightKg).toFixed(1)) : 0;
                const photosCount = item.photos?.length || 0;
                const hasInBody = Boolean(item.inBody && (item.inBody.bodyFatPct || item.inBody.muscleMassKg));

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCheckInId(item.id)}
                    className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                      isSelected
                        ? 'bg-white/[0.08] text-white border-white/30 ring-1 ring-white/10 shadow-lg'
                        : 'bg-[var(--card-bg)] text-slate-300 border-[var(--card-border)] hover:border-white/15 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Row 1: Date + Latest tag & Review/Done status badge */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white font-mono text-[11.5px]">{item.date}</span>
                        {idx === 0 && (
                          <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-white/[0.08] text-slate-300 border border-white/10">
                            Latest
                          </span>
                        )}
                      </div>

                      {!item.reviewed ? (
                        <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--main-color-muted)] text-[var(--main-color)] border border-[var(--main-color-border)] flex items-center gap-1 font-semibold">
                          <span>Review</span>
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.06] text-slate-300 border border-white/10 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-slate-400" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>

                    {/* Row 2: Weight + Delta on left, Photos & InBody on right */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-white text-xs">{item.weightKg} kg</span>
                        {itemDelta !== 0 && (
                          <span className="text-[10px] font-medium font-mono text-slate-300">
                            {itemDelta > 0 ? `+${itemDelta}` : itemDelta} kg
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3 text-slate-500" />
                          <span>{photosCount}</span>
                        </span>
                        {hasInBody && (
                          <span className="flex items-center gap-1 text-[var(--main-color)] font-medium">
                            <Activity className="w-3 h-3" />
                            <span>InBody</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 3. Left Rail Bottom: Floated / Pinned Request Check-In Button */}
          <div className="pt-2 flex-shrink-0 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="gym-btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request Check-In</span>
              {client?.pendingCheckInRequest?.status === 'pending' && (
                <span className="w-2 h-2 rounded-full bg-white ml-0.5 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Active Check-In Cockpit Stage (Takes full height across Mobile, Tablet, Desktop) */}
        {activeCheckIn && (
          <div className="flex-1 min-w-0 h-full flex flex-col overflow-y-auto lg:overflow-hidden no-scrollbar pr-0.5">
            <div className="gym-card h-full flex-1 min-h-0 flex flex-col p-[clamp(0.625rem,2.5vw,1.25rem)] overflow-hidden border border-[var(--card-border)] bg-[var(--card-bg)] shadow-md rounded-2xl relative mx-auto w-full max-w-2xl lg:max-w-none">

              {/* 1. Header: Single Unified Telemetry Strip & Luxury Bio-Metrics Capsule */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1.5 xl:gap-2 pb-2.5 border-b border-white/[0.07] flex-shrink-0 w-full min-w-0">
                {/* A. Status Section: Mobile Typographic View (< lg, Single Line Guaranteed, Zero Scroll) */}
                <div className="flex lg:hidden items-center justify-between gap-1 text-slate-400 w-full flex-nowrap overflow-hidden">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[clamp(0.55rem,2.4vw,0.65rem)] uppercase tracking-wider font-semibold text-slate-500 font-mono">
                      Sub<span className="hidden sm:inline">mitted</span>
                    </span>
                    <strong className="text-white font-mono font-bold text-[clamp(0.65rem,2.8vw,0.75rem)] leading-none">
                      {activeCheckIn.date}
                    </strong>
                  </div>
                  <span className="text-white/20 flex-shrink-0 text-[10px]">•</span>
                  {!activeCheckIn.reviewed ? (
                    <div className="flex items-center gap-1 text-[var(--main-color)] font-semibold text-[clamp(0.65rem,2.6vw,0.72rem)] font-mono flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)] animate-pulse" />
                      <span>Needs Review</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-400 font-medium text-[clamp(0.65rem,2.6vw,0.72rem)] font-mono flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="text-[clamp(0.55rem,2.4vw,0.65rem)] uppercase tracking-wider font-semibold text-slate-500">
                        Rev<span className="hidden sm:inline">iewed</span>
                      </span>
                      <strong className="text-emerald-300 font-mono text-[clamp(0.65rem,2.8vw,0.75rem)] font-bold leading-none">
                        {activeCheckIn.reviewedAt || 'Done'}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Complete Telemetry Line for Laptop & Desktop (Hidden < 1024px, Compact on lg, Verbose on xl+) */}
                <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-mono select-none overflow-x-auto no-scrollbar flex-nowrap py-0.5 min-w-0 flex-shrink">
                  {/* Submitted Date */}
                  <div className="h-[24px] sm:h-[25px] px-1.5 xl:px-2 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center gap-1 shadow-xs text-slate-300 flex-shrink-0">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                      <span className="hidden xl:inline">SUBMITTED</span>
                      <span className="xl:hidden">SUB</span>
                    </span>
                    <strong className="text-white font-mono font-bold text-[10px] xl:text-[10.5px]">{activeCheckIn.date}</strong>
                  </div>

                  {/* Review Status & Reviewed Date */}
                  {!activeCheckIn.reviewed ? (
                    <div className="h-[24px] sm:h-[25px] px-1.5 xl:px-2 rounded-lg bg-[var(--main-color-muted)] text-[var(--main-color)] border border-[var(--main-color-border)] flex items-center gap-1 text-[10px] xl:text-[10.5px] font-semibold shadow-xs flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)] animate-pulse" />
                      <span>Needs Review</span>
                    </div>
                  ) : (
                    <div className="h-[24px] sm:h-[25px] px-1.5 xl:px-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 text-[10px] xl:text-[10.5px] font-medium shadow-xs flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                        <span className="hidden xl:inline">REVIEWED</span>
                        <span className="xl:hidden">REV</span>
                      </span>
                      <strong className="text-emerald-300 font-mono text-[10px] xl:text-[10.5px] font-bold">{activeCheckIn.reviewedAt || 'Done'}</strong>
                    </div>
                  )}

                  {/* Subtle Separator */}
                  <span className="text-white/20 inline self-center flex-shrink-0 text-[10px]">|</span>

                  {/* Primary Weight Badge */}
                  <div className="h-[24px] sm:h-[25px] px-1.5 xl:px-2 rounded-lg bg-white/[0.05] border border-white/[0.09] flex items-center gap-1 xl:gap-1.5 shadow-xs flex-shrink-0">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold font-mono leading-none">
                      <span className="hidden xl:inline">WEIGHT</span>
                      <span className="xl:hidden">WT</span>
                    </span>
                    <strong className="text-white font-bold text-[10.5px] xl:text-[11px] font-numeric tracking-tight leading-none">
                      {activeCheckIn.weightKg} kg
                    </strong>
                  </div>

                  {/* vs Last Check-In (Green for increase, Red for decrease — Zero Orange!) */}
                  {previousCheckIn && (
                    <div
                      className={`h-[24px] sm:h-[25px] px-1.5 xl:px-2 rounded-lg flex items-center gap-1 text-[10px] xl:text-[10.5px] font-medium border shadow-xs transition-colors flex-shrink-0 ${
                        weightDeltaVsPrev > 0
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                          : weightDeltaVsPrev < 0
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/25'
                          : 'bg-white/[0.04] text-slate-300 border-white/[0.08]'
                      }`}
                      title={`Change vs previous check-in on ${previousCheckIn.date}`}
                    >
                      {weightDeltaVsPrev > 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      ) : weightDeltaVsPrev < 0 ? (
                        <TrendingDown className="w-3 h-3 text-rose-400 flex-shrink-0" />
                      ) : (
                        <Minus className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="font-bold font-numeric font-mono">
                        {weightDeltaVsPrev > 0 ? `+${weightDeltaVsPrev}` : weightDeltaVsPrev} kg
                      </span>
                      <span className="text-[8.5px] opacity-75 font-normal font-mono hidden xl:inline">vs last</span>
                    </div>
                  )}

                  {/* Total Progress vs Baseline */}
                  {startingWeight && (
                    <div className="h-[24px] sm:h-[25px] px-1.5 xl:px-2 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center gap-1 text-[10px] xl:text-[10.5px] font-mono text-slate-300 shadow-xs flex-shrink-0">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold hidden xl:inline">TOTAL</span>
                      <strong className={`font-bold font-numeric ${totalWeightDelta > 0 ? 'text-emerald-300' : totalWeightDelta < 0 ? 'text-rose-300' : 'text-white'}`}>
                        {totalWeightDelta > 0 ? `+${totalWeightDelta}` : totalWeightDelta} kg
                      </strong>
                      <span className="hidden 2xl:inline text-slate-600 text-[8.5px]">•</span>
                      <span className="hidden 2xl:inline text-slate-400 text-[9px]">
                        Start <strong className="text-slate-200 font-numeric">{startingWeight} kg</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* B. Integrated Luxury Bio-Metrics Capsule (Centered on mobile, Fixed Right on Laptop/Desktop) */}
                <div className="flex items-center justify-center flex-shrink-0 w-full lg:w-auto">
                  <div className="flex items-center divide-x divide-white/10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-2 xl:px-3 py-1 font-mono shadow-inner justify-around w-full sm:w-auto mx-auto lg:mx-0">
                    <div className="px-1.5 xl:px-2.5 text-center first:pl-0 flex-1 sm:flex-initial">
                      <span className="text-[8px] xl:text-[9.5px] text-slate-400 uppercase tracking-wider block font-bold leading-tight">Energy</span>
                      <span className="text-white font-bold text-[11px] xl:text-[13px] font-numeric">{activeCheckIn.energyRating || 4}/5</span>
                    </div>
                    <div className="px-1.5 xl:px-2.5 text-center flex-1 sm:flex-initial">
                      <span className="text-[8px] xl:text-[9.5px] text-slate-400 uppercase tracking-wider block font-bold leading-tight">Sleep</span>
                      <span className="text-white font-bold text-[11px] xl:text-[13px] font-numeric">{activeCheckIn.sleepQuality || 4}/5</span>
                    </div>
                    <div className="px-1.5 xl:px-2.5 text-center last:pr-0 flex-1 sm:flex-initial">
                      <span className="text-[8px] xl:text-[9.5px] text-slate-400 uppercase tracking-wider block font-bold leading-tight">Hunger</span>
                      <span className="text-white font-bold text-[11px] xl:text-[13px] font-numeric">{activeCheckIn.hungerRating || 3}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Trainee Submitted Notes (Sleek Accent Callout with breathing room) */}
              {activeCheckIn.traineeNotes && (
                <div className="flex-shrink-0 my-1.5 sm:my-2 border-l-2 border-[var(--main-color)] bg-white/[0.02] hover:bg-white/[0.03] transition-colors pl-3 pr-3 py-1.5 rounded-r-xl flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-xs">
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-[var(--main-color)] font-bold whitespace-nowrap flex-shrink-0">
                    Athlete Notes:
                  </span>
                  <p className="text-slate-200 italic font-sans text-xs leading-relaxed whitespace-pre-wrap break-words">
                    "{activeCheckIn.traineeNotes}"
                  </p>
                </div>
              )}

              {/* 3. Physique Photos Gallery (Generous height & width, expanding to fill height) */}
              <div className="flex-1 min-h-0 flex flex-col justify-center space-y-1.5 py-1">
                <div className="flex items-center justify-between gap-1 flex-shrink-0 w-full flex-nowrap">
                  <span className="gym-label-mono text-[clamp(0.6rem,2.5vw,0.6875rem)] whitespace-nowrap flex-shrink-0">
                    <span className="hidden sm:inline">Physique </span>Photos{' '}
                    <span className="text-slate-500 font-normal">
                      <span className="hidden sm:inline">({activeCheckIn.photos?.length || 0})</span>
                      <span className="sm:hidden">
                        ({activeCheckIn.photos?.filter((p) => p.angle?.toLowerCase() !== 'side').length || activeCheckIn.photos?.length || 0})
                      </span>
                    </span>
                  </span>

                  {/* Compact Photo Tools: Compare Photos modal & Side-by-Side inline toggle (Never overflows card) */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {checkIns.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsPhotoModalOpen(true)}
                          className="px-1.5 sm:px-2 py-0.5 rounded-md text-[clamp(0.58rem,2.4vw,0.65rem)] font-mono text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center gap-1 cursor-pointer transition-all whitespace-nowrap"
                          title="Open photo slider comparison"
                        >
                          <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 flex-shrink-0" />
                          <span>Compare</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsCompareMode(!isCompareMode)}
                          className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[clamp(0.58rem,2.4vw,0.65rem)] font-mono flex items-center gap-1 cursor-pointer transition-all whitespace-nowrap ${
                            isCompareMode
                              ? 'bg-white/[0.15] text-white border border-white/30 font-semibold'
                              : 'text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10'
                          }`}
                          title="Toggle in-page side-by-side comparison"
                        >
                          <Split className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 flex-shrink-0" />
                          <span>{isCompareMode ? 'Exit' : 'Split'}</span>
                          <span className="hidden sm:inline">{isCompareMode ? '' : '-by-Side'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Inline Side-by-Side View when isCompareMode is active */}
                {isCompareMode && compareCheckInA && compareCheckInB ? (
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1 animate-in fade-in duration-150 flex-1 min-h-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-white/[0.06] flex-shrink-0">
                      <span className="text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <TrendingUp className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>Weight:</span>{' '}
                        <strong className="text-white">
                          {Number((compareCheckInB.weightKg - compareCheckInA.weightKg).toFixed(1))} kg
                        </strong>
                        {(() => {
                          const bfA = compareCheckInA?.inBody?.bodyFatPct ?? compareCheckInA?.measurements?.bodyFatPercentage;
                          const bfB = compareCheckInB?.inBody?.bodyFatPct ?? compareCheckInB?.measurements?.bodyFatPercentage;
                          if (bfA && bfB) {
                            const diff = Number((bfB - bfA).toFixed(1));
                            return (
                              <>
                                <span className="text-slate-600">•</span>
                                <span>BF:</span>{' '}
                                <strong className={diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-rose-400' : 'text-white'}>
                                  {diff > 0 ? `+${diff}` : diff}%
                                </strong>
                              </>
                            );
                          }
                          return null;
                        })()}
                      </span>

                      <div className="flex items-center gap-1">
                        {['front', 'side', 'back'].map((angle) => (
                          <button
                            key={angle}
                            type="button"
                            onClick={() => setSelectedAngle(angle)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                              selectedAngle === angle
                                ? 'bg-white/[0.15] text-white border border-white/25 font-semibold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {angle}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 w-full max-w-2xl mx-auto items-center flex-1 min-h-0">
                      {/* Compare Check-In A */}
                      <div className="space-y-1 flex-1 h-full min-h-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5 flex-shrink-0">
                          <span>{compareCheckInA.date}</span>
                          <span className="text-white">{compareCheckInA.weightKg} kg</span>
                        </div>
                        <div
                          className="relative flex-1 min-h-[160px] max-h-[380px] h-full rounded-xl overflow-hidden bg-black border border-white/[0.08] cursor-pointer group shadow-md"
                          onClick={() => {
                            const photo = compareCheckInA.photos.find((p) => p.angle === selectedAngle) || compareCheckInA.photos[0];
                            if (photo) setActiveLightboxPhoto({ url: photo.url, title: `${selectedAngle.toUpperCase()} View`, date: compareCheckInA.date });
                          }}
                        >
                          {(() => {
                            const photo = compareCheckInA.photos.find((p) => p.angle === selectedAngle) || compareCheckInA.photos[0];
                            return photo ? (
                              <>
                                <img src={photo.url} alt="A" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[8px] uppercase font-bold border border-white/10 tracking-wider">
                                  {photo.angle}
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-mono">No Photo</div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Compare Check-In B */}
                      <div className="space-y-1 flex-1 h-full min-h-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5 flex-shrink-0">
                          <span>{compareCheckInB.date}</span>
                          <span className="text-white">{compareCheckInB.weightKg} kg</span>
                        </div>
                        <div
                          className="relative flex-1 min-h-[160px] max-h-[380px] h-full rounded-xl overflow-hidden bg-black border border-white/20 cursor-pointer group shadow-md"
                          onClick={() => {
                            const photo = compareCheckInB.photos.find((p) => p.angle === selectedAngle) || compareCheckInB.photos[0];
                            if (photo) setActiveLightboxPhoto({ url: photo.url, title: `${selectedAngle.toUpperCase()} View`, date: compareCheckInB.date });
                          }}
                        >
                          {(() => {
                            const photo = compareCheckInB.photos.find((p) => p.angle === selectedAngle) || compareCheckInB.photos[0];
                            return photo ? (
                              <>
                                <img src={photo.url} alt="B" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[8px] uppercase font-bold border border-white/10 tracking-wider">
                                  {photo.angle}
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-mono">No Photo</div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (!activeCheckIn.photos || activeCheckIn.photos.length === 0) ? (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-xs font-mono text-slate-500 flex items-center justify-center flex-1 min-h-[140px]">
                    No progress photos uploaded for this check-in
                  </div>
                ) : (
                  <div className="flex justify-center w-full items-center flex-1 min-h-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full h-full max-w-3xl lg:max-w-4xl mx-auto items-center">
                      {activeCheckIn.photos.map((photo) => {
                        const isSide = photo.angle?.toLowerCase() === 'side';
                        return (
                          <div
                            key={photo.id || photo.angle}
                            className={`relative h-full min-h-[160px] max-h-[380px] w-full rounded-xl overflow-hidden bg-black border border-white/[0.08] hover:border-white/25 group cursor-pointer shadow-md mx-auto transition-all items-center justify-center ${
                              isSide ? 'hidden sm:flex' : 'flex'
                            }`}
                            onClick={() =>
                              setActiveLightboxPhoto({
                                url: photo.url,
                                title: `${photo.angle?.toUpperCase()} Angle`,
                                date: activeCheckIn.date
                              })
                            }
                          >
                            <img
                              src={photo.url}
                              alt={`Check-in ${photo.angle}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[8.5px] uppercase font-bold border border-white/10 tracking-wider">
                              <span>{photo.angle}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. InBody Composition Telemetry (Replaces tape completely) */}
              <div className="flex-shrink-0 space-y-1 pt-1 border-t border-white/[0.07]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[var(--main-color)]" />
                    <span className="gym-label-mono text-[clamp(0.6rem,2.5vw,0.6875rem)] font-bold text-white tracking-wide">
                      InBody Scan Telemetry
                    </span>
                  </div>
                  {previousCheckIn && (
                    <span className="text-[clamp(0.55rem,2.2vw,0.625rem)] font-mono text-slate-500">
                      vs {previousCheckIn.date}
                    </span>
                  )}
                </div>

                {hasInBodyData ? (
                  <div className="grid grid-cols-4 divide-x divide-white/[0.07] bg-white/[0.02] border border-white/[0.08] rounded-xl p-1 text-center font-mono shadow-inner">
                    {/* Body Fat */}
                    <div className="px-0.5 sm:px-1 py-0.5 overflow-hidden">
                      <span className="text-[clamp(0.5rem,2.2vw,0.55rem)] text-slate-400 uppercase tracking-wider block font-semibold truncate leading-tight">Body Fat</span>
                      <span className="font-bold text-white block font-numeric whitespace-nowrap leading-tight text-[clamp(0.625rem,2.8vw,0.75rem)]">
                        {activeBf !== null ? (
                          <span className="whitespace-nowrap inline-flex items-baseline">
                            <span>{activeBf}</span>
                            <span className="text-[clamp(0.5rem,2vw,0.6rem)] font-normal opacity-75 ml-0.5">%</span>
                          </span>
                        ) : '—'}
                      </span>
                      {bfDiff !== null && (
                        <span className={`block font-numeric font-medium whitespace-nowrap leading-tight text-[clamp(0.52rem,2.2vw,0.625rem)] ${
                          bfDiff < 0 ? 'text-emerald-300' : bfDiff > 0 ? 'text-rose-300' : 'text-slate-400'
                        }`}>
                          {bfDiff > 0 ? `+${bfDiff}` : bfDiff}%
                        </span>
                      )}
                    </div>

                    {/* Muscle Mass */}
                    <div className="px-0.5 sm:px-1 py-0.5 overflow-hidden">
                      <span className="text-[clamp(0.5rem,2.2vw,0.55rem)] text-slate-400 uppercase tracking-wider block font-semibold truncate leading-tight">Muscle Mass</span>
                      <span className="font-bold text-white block font-numeric whitespace-nowrap leading-tight text-[clamp(0.625rem,2.8vw,0.75rem)]">
                        {activeMm !== null ? (
                          <span className="whitespace-nowrap inline-flex items-baseline">
                            <span>{activeMm}</span>
                            <span className="text-[clamp(0.5rem,2vw,0.6rem)] font-normal opacity-75 ml-0.5">kg</span>
                          </span>
                        ) : '—'}
                      </span>
                      {mmDiff !== null && (
                        <span className={`block font-numeric font-medium whitespace-nowrap leading-tight text-[clamp(0.52rem,2.2vw,0.625rem)] ${
                          mmDiff > 0 ? 'text-emerald-300' : mmDiff < 0 ? 'text-rose-300' : 'text-slate-400'
                        }`}>
                          {mmDiff > 0 ? `+${mmDiff}` : mmDiff} kg
                        </span>
                      )}
                    </div>

                    {/* Body Water */}
                    <div className="px-0.5 sm:px-1 py-0.5 overflow-hidden">
                      <span className="text-[clamp(0.5rem,2.2vw,0.55rem)] text-slate-400 uppercase tracking-wider block font-semibold truncate leading-tight">Water %</span>
                      <span className="font-bold text-white block font-numeric whitespace-nowrap leading-tight text-[clamp(0.625rem,2.8vw,0.75rem)]">
                        {activeWater !== null ? (
                          <span className="whitespace-nowrap inline-flex items-baseline">
                            <span>{activeWater}</span>
                            <span className="text-[clamp(0.5rem,2vw,0.6rem)] font-normal opacity-75 ml-0.5">%</span>
                          </span>
                        ) : '—'}
                      </span>
                      {waterDiff !== null && (
                        <span className={`block font-numeric font-medium whitespace-nowrap leading-tight text-[clamp(0.52rem,2.2vw,0.625rem)] ${
                          waterDiff > 0 ? 'text-emerald-300' : waterDiff < 0 ? 'text-rose-300' : 'text-slate-400'
                        }`}>
                          {waterDiff > 0 ? `+${waterDiff}` : waterDiff}%
                        </span>
                      )}
                    </div>

                    {/* Visceral Fat */}
                    <div className="px-0.5 sm:px-1 py-0.5 overflow-hidden">
                      <span className="text-[clamp(0.5rem,2.2vw,0.55rem)] text-slate-400 uppercase tracking-wider block font-semibold truncate leading-tight">Visceral</span>
                      <span className="font-bold text-white block font-numeric whitespace-nowrap leading-tight text-[clamp(0.625rem,2.8vw,0.75rem)]">
                        {activeVisceral !== null ? (
                          <span className="whitespace-nowrap inline-flex items-baseline">
                            <span className="text-[clamp(0.5rem,2vw,0.6rem)] font-normal opacity-75 mr-0.5">Lvl</span>
                            <span>{activeVisceral}</span>
                          </span>
                        ) : '—'}
                      </span>
                      {visceralDiff !== null && (
                        <span className={`block font-numeric font-medium whitespace-nowrap leading-tight text-[clamp(0.52rem,2.2vw,0.625rem)] ${
                          visceralDiff < 0 ? 'text-emerald-300' : visceralDiff > 0 ? 'text-rose-300' : 'text-slate-400'
                        }`}>
                          {visceralDiff > 0 ? `+${visceralDiff}` : visceralDiff}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-xs font-mono text-slate-500">
                    No InBody scan metrics recorded for this check-in
                  </div>
                )}
              </div>

              {/* 5. Coach Directives & WhatsApp Actions (Compact, directly above note) */}
              <div className="flex-shrink-0 pt-2 border-t border-white/[0.07] space-y-1.5">
                <div className="flex items-center justify-between gap-1 sm:gap-2 flex-shrink-0">
                  <span className="gym-label-mono text-[clamp(0.6rem,2.5vw,0.6875rem)] whitespace-nowrap">
                    Coach Directives
                  </span>

                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    {/* WhatsApp Quick Dispatch: Icon only on mobile as requested, icon+text on larger */}
                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      aria-label="WhatsApp"
                      className="gym-btn-secondary gym-btn-sm p-1.5 sm:px-2.5 sm:py-1 flex items-center justify-center gap-1 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10 cursor-pointer text-xs whitespace-nowrap"
                      title="Send review summary via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    {/* Dynamic Review Action Button (Zero redundant requests) */}
                    {!activeCheckIn.reviewed ? (
                      <button
                        type="button"
                        onClick={() => handleSaveFeedback(activeCheckIn.id)}
                        disabled={isSavingFeedback}
                        className="gym-btn-primary gym-btn-sm flex items-center gap-1 text-[clamp(0.58rem,2.4vw,0.6875rem)] cursor-pointer whitespace-nowrap px-2 py-1"
                        title="Save feedback and complete check-in review"
                      >
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span className="hidden sm:inline">{isSavingFeedback ? 'Saving...' : 'Save & Mark Reviewed ✓'}</span>
                        <span className="sm:hidden">{isSavingFeedback ? 'Saving...' : 'Review ✓'}</span>
                      </button>
                    ) : isFeedbackDirty ? (
                      <button
                        type="button"
                        onClick={() => handleSaveFeedback(activeCheckIn.id)}
                        disabled={isSavingFeedback}
                        className="gym-btn-primary gym-btn-sm flex items-center gap-1 text-[clamp(0.58rem,2.4vw,0.6875rem)] cursor-pointer whitespace-nowrap px-2 py-1"
                        title="Update saved feedback directives"
                      >
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span className="hidden sm:inline">{isSavingFeedback ? 'Updating...' : 'Update Feedback ✓'}</span>
                        <span className="sm:hidden">{isSavingFeedback ? 'Updating...' : 'Update ✓'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="gym-btn-secondary gym-btn-sm flex items-center gap-1 text-[clamp(0.58rem,2.4vw,0.6875rem)] opacity-60 cursor-default border-emerald-500/20 text-emerald-300 whitespace-nowrap px-2 py-1"
                        title="Check-in already reviewed and saved"
                      >
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Reviewed ✓</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={feedbackDraft[activeCheckIn.id] ?? activeCheckIn.coachFeedback ?? ''}
                  onChange={(e) =>
                    setFeedbackDraft({
                      ...feedbackDraft,
                      [activeCheckIn.id]: e.target.value
                    })
                  }
                  placeholder={`Write technical review, nutrition changes, or praise for ${client?.name}...`}
                  className="gym-input w-full h-24 sm:h-28 p-2.5 text-xs leading-relaxed resize-none font-sans"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Floated Full-Width Request Check-In Bottom Dock */}
      <div className="lg:hidden flex-shrink-0 pt-1.5 pb-0.5 w-full">
        <button
          type="button"
          onClick={() => setIsRequestModalOpen(true)}
          aria-label="Request Check-In"
          className="gym-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 shadow-lg rounded-xl font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Request</span>
          {client?.pendingCheckInRequest?.status === 'pending' && (
            <span className="w-2 h-2 rounded-full bg-white ml-0.5 animate-pulse" />
          )}
        </button>
      </div>

      {/* 6. Lightbox Modal for Photo Expansion */}
      {activeLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveLightboxPhoto(null);
          }}
        >
          <div
            className="relative max-w-xl max-h-[88vh] rounded-2xl overflow-hidden bg-black border border-white/20 p-2 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 px-2 text-xs text-slate-300 font-mono border-b border-white/10 mb-2">
              <span className="font-semibold text-white">{activeLightboxPhoto.title}</span>
              <div className="flex items-center gap-2">
                <span>{activeLightboxPhoto.date}</span>
                <button
                  type="button"
                  onClick={() => setActiveLightboxPhoto(null)}
                  className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <img
              src={activeLightboxPhoto.url}
              alt={activeLightboxPhoto.title}
              className="max-w-full max-h-[76vh] object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* 7. Dedicated Comparison Modal */}
      <PhotoComparisonModal
        client={client}
        checkIns={checkIns}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />

      {/* 8. Request Check-In Modal */}
      <RequestCheckInModal
        client={client}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />

      {/* 8b. Weekly Cadence Schedule Modal */}
      <WeeklyCadenceModal
        client={client}
        isOpen={isCadenceModalOpen}
        onClose={() => setIsCadenceModalOpen(false)}
      />

      {/* 9. On-Demand Request Inspector Modal (Multi-Request Scenario Support) */}
      <RequestDetailsInspector
        client={client}
        isModal={true}
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
        onEditRequest={() => {
          setIsInspectorModalOpen(false);
          setIsRequestModalOpen(true);
        }}
      />
    </div>
  );
};
