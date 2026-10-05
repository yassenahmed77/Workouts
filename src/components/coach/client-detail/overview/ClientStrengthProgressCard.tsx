'use client';

import React from 'react';
import { User } from '@/types';
import { AnalyzedLift } from '@/hooks/useClientOverview';
import { generateSmartExerciseReport, SmartDiagnosticReport } from '@/lib/progressEngine';

interface ClientStrengthProgressCardProps {
  client: User;
  analyzedCoreLifts: AnalyzedLift[];
  overloadDiagnosticSummary: { summaryText: string; strengthIndex: string; statusClass: string };
  onNavigateSubTab: (tab: 'workout' | 'nutrition' | 'checkins' | 'timeline' | 'logs' | 'formchecks' | 'notes', exerciseName?: string) => void;
  onSelectDiagnosticReport: (report: SmartDiagnosticReport) => void;
}

export const ClientStrengthProgressCard: React.FC<ClientStrengthProgressCardProps> = ({
  client,
  analyzedCoreLifts,
  overloadDiagnosticSummary,
  onNavigateSubTab,
  onSelectDiagnosticReport
}) => {
  return (
    <div className="p-3 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
            CORE LIFTS OVERLOAD
          </span>
          <span className={`text-[10px] font-mono font-semibold ${overloadDiagnosticSummary.statusClass}`}>
            {overloadDiagnosticSummary.summaryText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-cyan-400 font-bold">
            {overloadDiagnosticSummary.strengthIndex}
          </span>
          <button
            type="button"
            onClick={() => onNavigateSubTab('logs')}
            className="px-2.5 py-0.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 border border-white/[0.1] text-[10px] font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            Exercise History
          </button>
        </div>
      </div>

      {analyzedCoreLifts.length === 0 ? (
        <div className="p-4 rounded-lg bg-[#05080e] border border-white/[0.04] text-center space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 block">
            Awaiting Workout Logs
          </span>
          <p className="text-[11px] text-slate-500 font-mono max-w-sm mx-auto">
            Overload telemetry &amp; plateau diagnostics activate automatically once the athlete logs their first session.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onNavigateSubTab('workout')}
              className="px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[11px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              View Assigned Workout Split
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {analyzedCoreLifts.map((lift, idx) => (
            <div
              key={idx}
              onClick={() => onNavigateSubTab('logs', lift.exerciseName)}
              className="p-2.5 rounded-lg bg-[#05080e] border border-white/[0.05] hover:border-white/20 transition-all cursor-pointer flex items-center justify-between group"
              title="Click to view exercise history & progression graph"
            >
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block group-hover:text-cyan-300 transition-colors">
                  {lift.exerciseName}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  Start: {lift.startWorkingSet} • Latest: {lift.latestWorkingSet}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate-200">
                  {lift.totalGainText}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (lift.summary) {
                      const rep = generateSmartExerciseReport(lift.summary, client.name);
                      onSelectDiagnosticReport(rep);
                    }
                  }}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border hover:scale-105 active:scale-95 transition-transform cursor-pointer ${lift.badgeClass}`}
                  title="Click to open smart diagnostic report"
                >
                  {lift.badgeText}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
