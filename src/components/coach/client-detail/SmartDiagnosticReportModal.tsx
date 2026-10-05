import React from 'react';
import { X } from 'lucide-react';
import { SmartDiagnosticReport } from '@/lib/progressEngine';

interface SmartDiagnosticReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SmartDiagnosticReport | null;
  onOpenHistory?: (exerciseName: string) => void;
}

export const SmartDiagnosticReportModal: React.FC<SmartDiagnosticReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onOpenHistory
}) => {
  // Escape key listener
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const isDrop = report.status === 'drop';
  const isProgression = report.status === 'progressing';
  const isPlateau = report.status === 'plateau';

  // Maximum sets to compare across both sessions
  const maxSetCount = Math.max(report.latestSets.length, report.previousSets.length, 1);
  const setRows = Array.from({ length: maxSetCount }, (_, i) => {
    const setNum = i + 1;
    const latestSet = report.latestSets.find((s) => s.setNumber === setNum) || report.latestSets[i];
    const prevSet = report.previousSets.find((s) => s.setNumber === setNum) || report.previousSets[i];
    return {
      setNumber: setNum,
      latest: latestSet,
      prev: prevSet
    };
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#090d14] border border-white/[0.1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0d1420] via-[#090d14] to-[#0d1420] border-b border-white/[0.08] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Movement Telemetry Report
              </span>
              <span className="text-slate-600 text-xs">&bull;</span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {report.traineeName}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {report.exerciseName}
              </h3>
              <span className="text-[9px] font-mono text-slate-300 px-1.5 py-0.2 rounded bg-white/[0.05] border border-white/[0.07]">
                {report.targetMuscle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${report.badgeClass}`}>
              {report.badgeText}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Report"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Report Body */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1 bg-[#06090e]">
          
          {/* Status Alert Banner (Clean text layout, NO decorative icons) */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
            isDrop
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
              : isPlateau
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
              : isProgression
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-white/[0.03] border-white/[0.08] text-slate-300'
          }`}>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">
                {report.statusTitle}
              </span>
              <span className="text-[10px] font-mono opacity-80 block truncate mt-0.5">
                {report.timeSpanLabel}
              </span>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">
                {isDrop ? 'Output Drop' : isPlateau ? 'Load Plateau' : isProgression ? 'Overload Hit' : 'Consolidating'}
              </span>
              <span className="text-[9.5px] font-mono opacity-75 block mt-0.5">
                {report.weeksUnchanged > 0 ? `${report.weeksUnchanged} wks duration` : 'Immediate'}
              </span>
            </div>
          </div>

          {/* 3 Head-to-Head Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Box 1: Prior Top Set */}
            <div className="p-2 rounded-xl bg-[#090d14] border border-white/[0.06] text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Prior Top Set
              </span>
              <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                {report.previousTopSet ? `${report.previousTopSet.weightKg} kg × ${report.previousTopSet.reps}` : 'Baseline'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                {report.previousSessionDate}
              </span>
            </div>

            {/* Box 2: Latest Top Set */}
            <div className="p-2 rounded-xl bg-[#090d14] border border-white/[0.06] text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Latest Top Set
              </span>
              <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                {report.latestTopSet.weightKg} kg × {report.latestTopSet.reps}
              </span>
              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                {report.latestSessionDate}
              </span>
            </div>

            {/* Box 3: Working Set Delta */}
            <div className="p-2 rounded-xl bg-[#090d14] border border-white/[0.06] text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Load / Rep Delta
              </span>
              <span className={`text-xs font-bold font-mono mt-0.5 block ${
                report.weightDeltaKg < 0 || report.repsDelta < 0
                  ? 'text-rose-400'
                  : report.weightDeltaKg > 0 || report.repsDelta > 0
                  ? 'text-emerald-400'
                  : 'text-slate-300'
              }`}>
                {report.weightDeltaKg !== 0
                  ? `${report.weightDeltaKg > 0 ? `+${report.weightDeltaKg}` : report.weightDeltaKg} kg`
                  : report.repsDelta !== 0
                  ? `${report.repsDelta > 0 ? `+${report.repsDelta}` : report.repsDelta} Reps`
                  : '0 Delta'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                Top Set Matchup
              </span>
            </div>
          </div>

          {/* Simple Factual Coach Summary (NO ICONS, EASY LANGUAGE) */}
          <div className="p-3 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.05]">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                COACH PERFORMANCE SUMMARY
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                Factual Log Analysis
              </span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {report.factualNarrative}
            </p>
          </div>

          {/* Set-by-Set Matchup Table */}
          <div className="p-3 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.05]">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                HEAD-TO-HEAD SET BREAKDOWN
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {report.previousSessionDate} vs {report.latestSessionDate}
              </span>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-12 text-[9px] font-mono uppercase tracking-wider text-slate-400 px-2 py-0.5">
                <span className="col-span-2">Set</span>
                <span className="col-span-4 text-center">Previous Session</span>
                <span className="col-span-4 text-center">Latest Session</span>
                <span className="col-span-2 text-right">Variance</span>
              </div>

              {setRows.map((row) => {
                const prevW = row.prev ? row.prev.weightKg : null;
                const prevR = row.prev ? row.prev.reps : null;
                const curW = row.latest ? row.latest.weightKg : null;
                const curR = row.latest ? row.latest.reps : null;

                const isTopSetRow = row.latest?.isTopSet || row.prev?.isTopSet;

                let diffText = '—';
                let diffClass = 'text-slate-400';

                if (prevW !== null && prevR !== null && curW !== null && curR !== null) {
                  if (curW !== prevW) {
                    const wDiff = curW - prevW;
                    diffText = `${wDiff > 0 ? `+${wDiff}` : wDiff} kg`;
                    diffClass = wDiff > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
                  } else if (curR !== prevR) {
                    const rDiff = curR - prevR;
                    diffText = `${rDiff > 0 ? `+${rDiff}` : rDiff} reps`;
                    diffClass = rDiff > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
                  } else {
                    diffText = 'Even';
                    diffClass = 'text-slate-400';
                  }
                }

                return (
                  <div
                    key={row.setNumber}
                    className={`grid grid-cols-12 items-center px-2 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                      isTopSetRow
                        ? 'bg-white/[0.04] border-white/15'
                        : 'bg-[#05080e] border-white/[0.03]'
                    }`}
                  >
                    <div className="col-span-2 flex items-center gap-1.5">
                      <span className="font-bold text-slate-300">Set {row.setNumber}</span>
                      {isTopSetRow && (
                        <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          TOP
                        </span>
                      )}
                    </div>

                    <div className="col-span-4 text-center font-medium text-slate-300">
                      {prevW !== null && prevR !== null ? `${prevW} kg × ${prevR}` : '—'}
                    </div>

                    <div className="col-span-4 text-center font-bold text-white">
                      {curW !== null && curR !== null ? `${curW} kg × ${curR}` : '—'}
                    </div>

                    <div className={`col-span-2 text-right ${diffClass}`}>
                      {diffText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lifetime Context Bar */}
          <div className="p-2.5 rounded-xl bg-[#05080e] border border-white/[0.05] grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wider block">
                Baseline Day 1
              </span>
              <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                {report.baselineTopSet.weightKg} kg × {report.baselineTopSet.reps}
              </span>
              <span className="text-[9px] text-slate-400 font-mono block">
                {report.baselineTopSet.date}
              </span>
            </div>

            <div>
              <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wider block">
                All-Time Peak PR
              </span>
              <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                {report.allTimePRTopSet.weightKg} kg
              </span>
              <span className="text-[9px] text-slate-400 font-mono block">
                {report.allTimePRTopSet.date}
              </span>
            </div>

            <div>
              <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-wider block">
                Net Lifetime Overload
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                +{report.netWeightGainKg} kg (+{report.percentageGain}%)
              </span>
              <span className="text-[9px] text-emerald-400/80 font-mono block">
                {report.totalSessionsCount} sessions tracked
              </span>
            </div>
          </div>
        </div>

        {/* 3. Footer Action Bar */}
        <div className="p-3 bg-[#090d14] border-t border-white/[0.08] flex items-center justify-between gap-2 flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            Total Sessions: <strong className="text-slate-200">{report.totalSessionsCount} Recorded</strong>
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Close
            </button>

            {onOpenHistory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory(report.exerciseName);
                }}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                View Full Movement History
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
