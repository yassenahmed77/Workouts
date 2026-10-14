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
    <div className="gym-card space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="gym-label-mono">
            CORE LIFTS OVERLOAD
          </span>
          <span className={`text-[10px] font-mono font-semibold ${overloadDiagnosticSummary.statusClass}`}>
            {overloadDiagnosticSummary.summaryText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="gym-label-mono text-[var(--main-color)]">
            {overloadDiagnosticSummary.strengthIndex}
          </span>
          <button
            type="button"
            onClick={() => onNavigateSubTab('logs')}
            className="gym-btn-secondary gym-btn-sm"
          >
            Exercise History
          </button>
        </div>
      </div>

      {analyzedCoreLifts.length === 0 ? (
        <div className="gym-card-subtle text-center space-y-1.5 py-4">
          <span className="gym-heading-card block">
            Awaiting Workout Logs
          </span>
          <p className="gym-subtext max-w-sm mx-auto">
            Overload telemetry &amp; plateau diagnostics activate automatically once the athlete logs their first session.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onNavigateSubTab('workout')}
              className="gym-btn-secondary gym-btn-sm"
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
              className="gym-card-subtle hover:border-white/20 transition-all cursor-pointer flex items-center justify-between group"
              title="Click to view exercise history & progression graph"
            >
              <div>
                <span className="gym-heading-card block group-hover:text-[var(--main-color)] transition-colors">
                  {lift.exerciseName}
                </span>
                <span className="gym-subtext font-mono block mt-0.5">
                  Start: {lift.startWorkingSet} • Latest: {lift.latestWorkingSet}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="gym-num text-xs">
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
