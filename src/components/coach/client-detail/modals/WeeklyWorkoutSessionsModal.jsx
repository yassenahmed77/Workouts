'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ObsidianCalendarModal } from '@/components/ui/ObsidianCalendarModal';

/**
 * WeeklyWorkoutSessionsModal (Presentation Layer - Atomic Timeline Modal)
 *
 * Visual timeline modal rendering the athlete's assigned training days (1, 2, 3, 4, 5, 6, 7)
 * with numbered nodes, horizontal conduits connecting into cards, and strict status badges:
 * - Completed: [✓] (Emerald square/circle + emerald text)
 * - Waiting (Current Cycle): [⏱] (Neutral slate/white circle + neutral text, NOT orange!)
 * - Missed (Past Cycle): [✕] (Rose/red circle + red text)
 *
 * Adaptive density for splits > 4 days:
 * - Ultra-sleek single-line metrics to ensure 5, 6, or 7 sessions fit seamlessly without excessive height.
 * - Powered by the custom ObsidianCalendarModal (matching Workouts Pro design system).
 * - Rule 2 Compliant (Zero decorative icons - Pure Swiss Typography).
 */
export const WeeklyWorkoutSessionsModal = ({
  isOpen,
  onClose,
  client,
  assignedPlan,
  clientLogs = [],
  weekAttendance,
  weekOffset = 0,
  setWeekOffset,
  onSelectDate,
  whatsappUrl
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Escape key listener for modal resilience
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Map assigned split days to live completed logs in this weekly cycle
  const sessionNodes = useMemo(() => {
    if (!assignedPlan?.days || assignedPlan.days.length === 0) {
      return [];
    }

    // Filter out rest days to focus purely on active training sessions
    const trainingDays = assignedPlan.days.filter((d) => !d.isRestDay);

    // Get current cycle date strings from weekAttendance
    const cycleDates = new Set((weekAttendance?.days || []).map((d) => d.dateStr));

    // Filter logs that fall within this weekly cycle
    const cycleLogs = clientLogs.filter((log) => cycleDates.has(log.date));

    return trainingDays.map((day, idx) => {
      const sessionNumber = idx + 1;

      // Match log by dayId, dayName, or sequential order fallback
      const matchingLog =
        cycleLogs.find((l) => l.dayId === day.id || l.dayName === day.dayName) ||
        cycleLogs[idx] ||
        null;

      const isCompleted = Boolean(matchingLog);

      // Status determination:
      // If completed -> 'completed'
      // If not completed & week has passed (weekOffset < 0) -> 'missed'
      // If not completed & current/future week -> 'waiting'
      const status = isCompleted ? 'completed' : weekOffset < 0 ? 'missed' : 'waiting';

      const totalSets = matchingLog
        ? matchingLog.completedExercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0
        : 0;

      const durationMinutes = matchingLog?.durationSeconds
        ? Math.round(matchingLog.durationSeconds / 60)
        : null;

      const totalVolumeKg = matchingLog?.totalVolumeKg || 0;

      return {
        sessionNumber,
        dayId: day.id,
        dayName: day.dayName || `Session ${sessionNumber}`,
        targetMuscles: day.targetMuscles || [],
        status,
        isCompleted,
        logDate: matchingLog?.date || null,
        durationMinutes,
        totalSets,
        totalVolumeKg
      };
    });
  }, [assignedPlan, clientLogs, weekAttendance, weekOffset]);

  if (!isOpen) return null;

  const completedSessionsCount = sessionNodes.filter((s) => s.status === 'completed').length;
  const missedSessionsCount = sessionNodes.filter((s) => s.status === 'missed').length;
  const waitingSessionsCount = sessionNodes.filter((s) => s.status === 'waiting').length;
  const totalTargetSessions = sessionNodes.length || weekAttendance?.targetSessions || 4;
  const isHighDensity = sessionNodes.length > 4;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="w-full max-w-xl rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Modal Header: Mobile-Isolated Layout (<sm) + Locked Desktop Layout (sm+) */}
          <div className="p-3 sm:p-3.5 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between flex-shrink-0 gap-2">
            {/* MOBILE ONLY (<sm): 3-Row Stacked Clean Header */}
            <div className="flex flex-col gap-2 w-full sm:hidden">
              {/* Row 1: Centered Title + Right Close '✕' Button (No Dot) */}
              <div className="relative flex items-center justify-center w-full min-h-[28px]">
                <span className="gym-label-mono font-bold tracking-wider text-[11px] text-center text-slate-300">
                  WEEKLY TRAINING TIMELINE
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-0 w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center font-mono text-xs font-bold transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* Row 2: Athlete & Sessions Completion (Centered, Full Width, Zero Breaks) */}
              <div className="w-full text-center">
                <h3 className="gym-heading-section text-white text-xs font-bold truncate whitespace-nowrap block w-full text-center">
                  {client.name} &bull; {completedSessionsCount}/{totalTargetSessions} Completed
                  {missedSessionsCount > 0 && (
                    <span className="text-rose-400 font-mono text-[11px] ml-1.5 font-normal">
                      ({missedSessionsCount} Missed)
                    </span>
                  )}
                  {isHighDensity && (
                    <span className="text-slate-500 font-mono text-[10px] ml-1.5 font-normal">
                      ({sessionNodes.length}-Day Split)
                    </span>
                  )}
                </h3>
              </div>

              {/* Row 3: Stretched Week Navigator Bar Across Entire Width */}
              <div className="w-full flex items-center gap-1.5 font-mono">
                <div className="flex-1 flex items-center justify-between bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setWeekOffset && setWeekOffset((prev) => prev - 1)}
                    className="text-slate-400 hover:text-white px-2 py-0.5 font-bold text-xs cursor-pointer active:scale-95 transition-transform"
                    title="Previous cycle"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(true)}
                    className="text-[11px] text-slate-200 px-2 font-semibold flex items-center gap-1 cursor-pointer hover:text-[var(--main-color)] transition-colors"
                    title="Open Obsidian Calendar"
                  >
                    <span>{weekOffset === 0 ? 'This Week' : weekAttendance?.dateRangeLabel}</span>
                    <span className="text-[9px] text-[var(--main-color)] font-mono font-bold">&bull; CAL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekOffset && setWeekOffset((prev) => prev + 1)}
                    className="text-slate-400 hover:text-white px-2 py-0.5 font-bold text-xs cursor-pointer active:scale-95 transition-transform"
                    title="Next cycle"
                  >
                    &rarr;
                  </button>
                </div>
                {weekOffset !== 0 && (
                  <button
                    type="button"
                    onClick={() => setWeekOffset && setWeekOffset(0)}
                    className="text-[10px] px-2.5 py-1.5 rounded-lg bg-[var(--main-color)]/20 text-[var(--main-color)] border border-[var(--main-color)]/30 font-bold hover:bg-[var(--main-color)]/30 transition-colors cursor-pointer flex-shrink-0"
                    title="Reset to current week"
                  >
                    Now
                  </button>
                )}
              </div>
            </div>

            {/* DESKTOP & TABLET ONLY (sm+): Completely Locked & Untouched Layout */}
            <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-2 w-full">
              <div className="min-w-0">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="gym-label-mono font-bold tracking-wider">
                    WEEKLY TRAINING TIMELINE
                  </span>
                  <span className="text-slate-600 text-xs">&bull;</span>

                  {/* Week Navigator & Obsidian Calendar Trigger */}
                  <div className="flex items-center gap-1 font-mono">
                    <div className="flex items-center bg-black/40 border border-white/[0.1] rounded-md px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => setWeekOffset && setWeekOffset((prev) => prev - 1)}
                        className="text-slate-400 hover:text-white px-1.5 font-bold text-xs cursor-pointer"
                        title="Previous cycle"
                      >
                        &larr;
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(true)}
                        className="text-[10px] text-slate-200 px-1 font-semibold flex items-center gap-1 cursor-pointer hover:text-[var(--main-color)] transition-colors"
                        title="Open Obsidian Calendar"
                      >
                        <span>{weekOffset === 0 ? 'This Week' : weekAttendance?.dateRangeLabel}</span>
                        <span className="text-[8px] text-[var(--main-color)] font-mono">&bull; CAL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeekOffset && setWeekOffset((prev) => prev + 1)}
                        className="text-slate-400 hover:text-white px-1.5 font-bold text-xs cursor-pointer"
                        title="Next cycle"
                      >
                        &rarr;
                      </button>
                    </div>
                    {weekOffset !== 0 && (
                      <button
                        type="button"
                        onClick={() => setWeekOffset && setWeekOffset(0)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--main-color)]/20 text-[var(--main-color)] border border-[var(--main-color)]/30 font-bold hover:bg-[var(--main-color)]/30 transition-colors cursor-pointer"
                        title="Reset to current week"
                      >
                        Now
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="gym-heading-section text-white mt-1 truncate">
                  {client.name} &bull; {completedSessionsCount}/{totalTargetSessions} Completed
                  {missedSessionsCount > 0 && (
                    <span className="text-rose-400 font-mono text-xs ml-2 font-normal">
                      ({missedSessionsCount} Missed)
                    </span>
                  )}
                  {isHighDensity && (
                    <span className="text-slate-500 font-mono text-[10px] ml-2">
                      ({sessionNodes.length}-Day Split)
                    </span>
                  )}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="gym-btn-secondary gym-btn-sm font-mono text-xs"
                title="Close modal (Esc)"
              >
                Close
              </button>
            </div>
          </div>

          {/* 2. Timeline Pipeline Container (Adaptive density for > 4 sessions) */}
          <div className="p-3 sm:p-4 overflow-y-auto flex-1 custom-scrollbar">
            {sessionNodes.length === 0 ? (
              <div className="gym-card-subtle text-center py-8 space-y-2">
                <span className="gym-heading-card block">
                  No Workout Split Assigned
                </span>
                <p className="gym-subtext max-w-xs mx-auto text-xs">
                  Assign a training split to this athlete to start tracking their weekly session nodes.
                </p>
              </div>
            ) : (
              <div className={isHighDensity ? 'space-y-2' : 'space-y-2.5 sm:space-y-3'}>
                {sessionNodes.map((node) => {
                  return (
                    <div key={node.sessionNumber} className="flex items-center group">
                      {/* Numbered Node Circle (Vertically Centered) */}
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 shadow-md transition-all ${
                          node.status === 'completed'
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 ring-4 ring-emerald-500/10'
                            : node.status === 'missed'
                            ? 'bg-rose-500/15 border-rose-500/50 text-rose-400 ring-4 ring-rose-500/10'
                            : 'bg-[var(--card-subtle-bg)] border-white/15 text-slate-400'
                        }`}
                      >
                        {node.sessionNumber}
                      </div>

                      {/* Horizontal Conduit Pipe: From Circle Directly into Card */}
                      <div
                        className={`w-3 sm:w-4 h-[2px] flex-shrink-0 transition-colors ${
                          node.status === 'completed'
                            ? 'bg-emerald-500/50'
                            : node.status === 'missed'
                            ? 'bg-rose-500/50'
                            : 'bg-white/15'
                        }`}
                        aria-hidden="true"
                      />

                      {/* Branch Card (Right side, Compact density for 5+ sessions) */}
                      <div
                        className={`flex-1 rounded-xl p-2.5 sm:p-3 border transition-all ${
                          node.status === 'completed'
                            ? 'bg-[var(--card-subtle-bg)] border-emerald-500/25 shadow-xs'
                            : node.status === 'missed'
                            ? 'bg-rose-950/15 border-rose-500/25'
                            : 'bg-[var(--bg-main)] border-[var(--card-border)]'
                        }`}
                      >
                        {/* Top Row: Session Title + Status Box (Strictly Icon Only) */}
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="gym-heading-card text-white truncate text-xs sm:text-sm">
                            {node.dayName}
                          </h4>

                          {/* Status Box: Strictly Icon Only (No Text) */}
                          {node.status === 'completed' ? (
                            <div
                              className="w-6 h-6 rounded-md border border-emerald-500/50 bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shadow-xs select-none flex-shrink-0"
                              title="Completed"
                            >
                              ✓
                            </div>
                          ) : node.status === 'missed' ? (
                            <div
                              className="w-6 h-6 rounded-md border border-rose-500/50 bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold shadow-xs select-none flex-shrink-0"
                              title="Missed"
                            >
                              ✕
                            </div>
                          ) : (
                            <div
                              className="w-6 h-6 rounded-md border border-white/15 bg-white/[0.06] text-slate-300 flex items-center justify-center text-xs select-none flex-shrink-0"
                              title="Awaiting trainee log"
                            >
                              ⏱
                            </div>
                          )}
                        </div>

                        {/* Middle Details (Single compact line to preserve height) */}
                        <div className="mt-1.5 pt-1.5 border-t border-white/[0.06] text-[10px] sm:text-[11px] font-mono">
                          {node.status === 'completed' ? (
                            <div className="flex items-center justify-between gap-1.5 text-[9px] sm:text-[11px] whitespace-nowrap">
                              <span className="text-white font-semibold">
                                {node.logDate}
                              </span>
                              <span className="text-slate-300">
                                {node.totalSets}s &bull; {node.totalVolumeKg.toLocaleString()}kg
                              </span>
                              {node.durationMinutes !== null && (
                                <span className="text-emerald-400 font-semibold">
                                  {node.durationMinutes}m
                                </span>
                              )}
                            </div>
                          ) : node.status === 'missed' ? (
                            <div className="flex items-center justify-between text-[9px] min-[360px]:text-[9.5px] min-[410px]:text-[10px] sm:text-[11px] text-rose-400/90 whitespace-nowrap overflow-hidden text-ellipsis w-full gap-1">
                              <span className="session-telemetry-full">Training cycle ended</span>
                              <span className="session-telemetry-compact">Cycle ended</span>
                              <span className="text-rose-400 font-semibold flex-shrink-0">
                                <span className="session-telemetry-full">No gym log submitted</span>
                                <span className="session-telemetry-compact">No gym log</span>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[9px] min-[360px]:text-[9.5px] min-[410px]:text-[10px] sm:text-[11px] text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis w-full gap-1">
                              <span className="session-telemetry-full">Scheduled in current training cycle</span>
                              <span className="session-telemetry-compact">Current cycle</span>
                              <span className="text-slate-300 font-semibold flex-shrink-0">
                                <span className="session-telemetry-full">Awaiting training log</span>
                                <span className="session-telemetry-compact">Awaiting log</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Footer Bar: Contextual Guidance & Direct Action */}
          <div className="px-3 sm:px-4 py-2.5 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between flex-shrink-0 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">
              {weekOffset < 0
                ? `Cycle ended: ${completedSessionsCount}/${totalTargetSessions} completed (${missedSessionsCount} missed).`
                : waitingSessionsCount === 0
                ? 'Target achieved for this cycle!'
                : `${waitingSessionsCount} ${waitingSessionsCount === 1 ? 'session' : 'sessions'} remaining before Friday`}
            </span>

            <div className="flex items-center gap-2">
              {waitingSessionsCount > 0 && whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gym-btn-secondary text-[11px] py-1 px-2.5"
                  title="Send WhatsApp reminder"
                >
                  WhatsApp Nudge
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="gym-btn-primary text-[11px] py-1 px-3"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Obsidian Calendar Picker Modal */}
      <ObsidianCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={weekAttendance?.startDateStr}
        activeWeekStartStr={weekAttendance?.startDateStr}
        activeWeekEndStr={weekAttendance?.endDateStr}
        onSelectDate={(dateStr) => {
          onSelectDate && onSelectDate(dateStr);
        }}
      />
    </>
  );
};
