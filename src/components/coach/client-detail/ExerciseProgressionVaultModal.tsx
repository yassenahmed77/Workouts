'use client';

import React, { useState, useMemo } from 'react';
import { User } from '@/types';
import { useGym } from '@/context/GymContext';
import { X } from 'lucide-react';
import {
  getExerciseProgressAnalysis,
  ExerciseProgressSummary,
  computeExerciseDiagnostic
} from '@/lib/progressEngine';

interface ExerciseProgressionVaultModalProps {
  client: User;
  isOpen: boolean;
  onClose: () => void;
  initialExerciseName?: string;
}

export const ExerciseProgressionVaultModal: React.FC<ExerciseProgressionVaultModalProps> = ({
  client,
  isOpen,
  onClose,
  initialExerciseName
}) => {
  const { getUserLogs, getPlanForUser } = useGym();

  const clientLogs = useMemo(() => getUserLogs(client.id), [getUserLogs, client.id]);
  const clientPlan = useMemo(() => getPlanForUser(client.id), [getPlanForUser, client.id]);

  const allSummaries = useMemo(() => {
    return getExerciseProgressAnalysis(clientLogs, clientPlan);
  }, [clientLogs, clientPlan]);

  const [selectedExerciseName, setSelectedExerciseName] = useState<string>(
    initialExerciseName || (allSummaries[0]?.exerciseName || '')
  );

  // Sync if initialExerciseName changes
  React.useEffect(() => {
    if (initialExerciseName) {
      setSelectedExerciseName(initialExerciseName);
    } else if (allSummaries.length > 0 && !selectedExerciseName) {
      setSelectedExerciseName(allSummaries[0].exerciseName);
    }
  }, [initialExerciseName, allSummaries, selectedExerciseName]);

  const activeSummary = useMemo(() => {
    return (
      allSummaries.find(
        (s) => s.exerciseName.toLowerCase() === selectedExerciseName.toLowerCase()
      ) || allSummaries[0]
    );
  }, [allSummaries, selectedExerciseName]);

  const activeDiagnostic = useMemo(() => {
    if (!activeSummary) return null;
    return computeExerciseDiagnostic(activeSummary);
  }, [activeSummary]);

  // Escape key listener
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-3xl rounded-xl bg-[#090d14] border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Clean Typography, Calm Monochrome) */}
        <div className="p-3.5 sm:p-4 border-b border-white/[0.06] flex items-center justify-between gap-3 bg-[#070a10]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Exercise Progression Vault
              </span>
              <span className="text-slate-600 text-xs">&bull;</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                {client.name}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight mt-0.5">
              Overload &amp; Plateau Telemetry
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Exercise Selector Pill Strip */}
        <div className="px-3 sm:px-4 py-2 border-b border-white/[0.05] bg-[#05080e] overflow-x-auto custom-scrollbar flex items-center gap-1.5 flex-nowrap">
          {allSummaries.map((summary) => {
            const isSelected = summary.exerciseName === activeSummary?.exerciseName;
            const hasGains = summary.netWeightGainKg > 0;
            return (
              <button
                key={summary.exerciseName}
                onClick={() => setSelectedExerciseName(summary.exerciseName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white/[0.1] text-white border border-white/[0.15] font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white bg-white/[0.02] border border-white/[0.04]'
                }`}
              >
                <span>{summary.exerciseName}</span>
                {hasGains && (
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    +{summary.netWeightGainKg}kg
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {activeSummary && activeDiagnostic ? (
            <>
              {/* Telemetry Metrics for this Exercise */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-lg bg-[#05080e] border border-white/[0.05] text-center">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                    Starting Top Set
                  </span>
                  <div className="mt-0.5 flex items-baseline justify-center gap-1">
                    <span className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                      {activeDiagnostic.startWorkingSet}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {activeSummary.firstSessionDate || 'Day 1'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#05080e] border border-white/[0.05] text-center">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                    Current Top Set
                  </span>
                  <div className="mt-0.5 flex items-baseline justify-center gap-1">
                    <span className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                      {activeDiagnostic.latestWorkingSet}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {activeSummary.latestSessionDate || 'Latest'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#05080e] border border-white/[0.05] text-center">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                    Net Progression
                  </span>
                  <div className="mt-0.5 flex items-baseline justify-center gap-1">
                    <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono tracking-tight">
                      +{activeSummary.netWeightGainKg}
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">kg</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/90 font-mono block mt-0.5 font-medium">
                    +{activeSummary.percentageGain}% gain
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#05080e] border border-white/[0.05] text-center">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                    Lift Status
                  </span>
                  <div className="mt-1 flex items-center justify-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${activeDiagnostic.badgeClass}`}>
                      {activeDiagnostic.badgeText}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {activeDiagnostic.status === 'drop'
                      ? 'Fatigue / Regression'
                      : activeDiagnostic.status === 'plateau'
                      ? 'Stalled > 3 wks'
                      : activeDiagnostic.status === 'progressing'
                      ? 'Overload Hit'
                      : 'Holding Pace'}
                  </span>
                </div>
              </div>

              {/* Historical Timeline of Recorded Sets & Overload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold px-1">
                  <span>History &bull; {activeSummary.history.length} Sessions Logged</span>
                  <span>{activeSummary.targetMuscle} &bull; {activeSummary.equipment || 'Standard'}</span>
                </div>

                {activeSummary.history.length === 0 ? (
                  <div className="p-5 text-center rounded-lg bg-[#05080e] border border-white/[0.04] text-slate-400 text-xs font-mono">
                    No active sessions logged for this movement yet.
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/[0.06] bg-[#05080e] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-black/40 text-[10px] sm:text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                          <th className="py-2.5 px-3">Date / Day</th>
                          <th className="py-2.5 px-3">Sets &amp; Reps</th>
                          <th className="py-2.5 px-3 text-center">Top Set</th>
                          <th className="py-2.5 px-3 text-center">Est. 1RM</th>
                          <th className="py-2.5 px-3 text-right">Overload Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {activeSummary.history.map((session, sIdx) => {
                          const isPR = session.isAllTimePR;
                          const isRepsPR = session.isRepsPR;
                          const hasWeightGain = session.weightOverloadDeltaKg > 0;
                          const hasRepsGain = session.repsOverloadDelta > 0;
                          const isDrop = session.weightOverloadDeltaKg < 0 || (session.weightOverloadDeltaKg === 0 && session.repsOverloadDelta < 0);

                          let badgeText = session.overloadBadge || 'Holding';
                          let badgeClass = 'bg-white/[0.04] text-slate-400 border border-white/[0.08]';

                          if (isPR || hasWeightGain) {
                            badgeClass = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-bold';
                          } else if (isRepsPR || hasRepsGain) {
                            badgeClass = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-bold';
                          } else if (isDrop) {
                            badgeClass = 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold';
                          }

                          return (
                            <tr
                              key={session.logId || sIdx}
                              className="hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-white font-medium text-xs">
                                    {session.date}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {session.dayName}
                                </span>
                              </td>

                              <td className="py-2 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {session.sets.map((set, setIdx) => (
                                    <span
                                      key={setIdx}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                        set.isTopSet
                                          ? 'bg-white/[0.1] text-white border border-white/[0.15] font-semibold'
                                          : 'bg-white/[0.03] text-slate-400 border border-white/[0.04]'
                                      }`}
                                    >
                                      {set.weightKg}kg&times;{set.reps}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="py-2 px-3 text-center font-numeric font-medium text-white">
                                {session.maxWeightKg} kg
                              </td>

                              <td className="py-2 px-3 text-center font-numeric text-slate-300 font-medium">
                                {session.bestEstimated1RM} kg
                              </td>

                              <td className="py-2 px-3 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono inline-block ${badgeClass}`}>
                                  {badgeText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs font-mono">
              No exercise data available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-3.5 border-t border-white/[0.06] bg-[#070a10] flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            Verifiable Progressive Overload Telemetry
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
