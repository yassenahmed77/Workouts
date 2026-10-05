'use client';

import React, { useState, useMemo } from 'react';
import { User } from '@/types';
import { useGym } from '@/context/GymContext';
import { 
  getExerciseProgressAnalysis, 
  ExerciseProgressSummary, 
  computeExerciseDiagnostic,
  generateSmartExerciseReport,
  SmartDiagnosticReport
} from '@/lib/progressEngine';
import { SmartDiagnosticReportModal } from './SmartDiagnosticReportModal';
import { ExerciseProgressionGraph } from './logs/ExerciseProgressionGraph';

interface ClientLogsTabProps {
  client: User;
  initialExerciseName?: string;
}

export const ClientLogsTab: React.FC<ClientLogsTabProps> = ({ client, initialExerciseName }) => {
  const { getUserLogs, getPlanForUser } = useGym();
  const clientLogs = useMemo(() => getUserLogs(client.id), [getUserLogs, client.id]);
  const clientPlan = useMemo(() => getPlanForUser(client.id), [getPlanForUser, client.id]);

  // Comprehensive exercise progress analysis across all logs
  const allExerciseSummaries = useMemo(() => {
    return getExerciseProgressAnalysis(clientLogs, clientPlan);
  }, [clientLogs, clientPlan]);

  // View Mode: By Exercise (Graphs & Detailed Sets) vs By Workout Sessions
  const [viewMode, setViewMode] = useState<'by_exercise' | 'by_session'>('by_exercise');

  // Exercise Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<'All' | string>('All');

  // Selected Exercise for Graph & Set Analysis
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>(
    initialExerciseName || allExerciseSummaries[0]?.exerciseName || ''
  );
  const [diagnosticModalReport, setDiagnosticModalReport] = useState<SmartDiagnosticReport | null>(null);

  React.useEffect(() => {
    if (initialExerciseName) {
      setSelectedExerciseName(initialExerciseName);
    }
  }, [initialExerciseName]);

  // Filtered exercises list
  const filteredExercises = useMemo(() => {
    return allExerciseSummaries.filter((ex) => {
      const matchesSearch = ex.exerciseName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'All' || ex.targetMuscle.toLowerCase() === selectedMuscle.toLowerCase();
      return matchesSearch && matchesMuscle;
    });
  }, [allExerciseSummaries, searchQuery, selectedMuscle]);

  // Active exercise summary
  const activeExercise = useMemo(() => {
    return (
      allExerciseSummaries.find(
        (ex) => ex.exerciseName.toLowerCase() === selectedExerciseName.toLowerCase()
      ) || allExerciseSummaries[0]
    );
  }, [allExerciseSummaries, selectedExerciseName]);

  // Diagnostic for active exercise
  const activeDiagnostic = useMemo(() => {
    if (!activeExercise) return null;
    return computeExerciseDiagnostic(activeExercise);
  }, [activeExercise]);

  // Hovered graph point state for interactive inspection
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  if (clientLogs.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-[#090d14] border border-white/[0.07] space-y-1.5 select-none">
        <h3 className="text-xs font-bold text-white">No Workout Sessions Logged Yet</h3>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          When {client.name} executes and logs active training sessions at the gym, their recorded movements, weights, reps, and overload progression graphs will appear here.
        </p>
      </div>
    );
  }

  // Summary Metrics across all sessions
  const totalSets = clientLogs.reduce(
    (sum, l) => sum + l.completedExercises.reduce((exSum, ex) => exSum + ex.sets.length, 0),
    0
  );

  const totalMovements = allExerciseSummaries.length;

  return (
    <div className="flex flex-col h-full space-y-1.5 select-none">
      
      {/* 1. Header Navigation & View Toggle (Slim Single-Line Bar for Viewport Fit) */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#090d14] border border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-xs font-bold text-white tracking-tight truncate">
            Progressive Overload Telemetry
          </h3>
          <span className="text-slate-600 text-xs hidden sm:inline">&bull;</span>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            {totalMovements} Movements &bull; {totalSets} Sets
          </span>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('by_exercise')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'by_exercise'
                ? 'bg-white/[0.1] text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Exercise &amp; Graphs
          </button>
          <button
            type="button"
            onClick={() => setViewMode('by_session')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'by_session'
                ? 'bg-white/[0.1] text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Workout Sessions
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      {viewMode === 'by_exercise' ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2">
          
          {/* LEFT COLUMN: ALL EXERCISES DIRECTORY (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col max-h-60 lg:max-h-none lg:h-full space-y-1 min-h-0 flex-shrink-0 lg:flex-shrink">
            {/* Search & Muscle Filters */}
            <div className="space-y-1 flex-shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movements..."
                className="w-full px-2.5 py-1 rounded-lg bg-[#05080e] border border-white/[0.06] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-white/20"
              />

              {/* Quick Muscle Pills */}
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
                {['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Arms'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMuscle(m)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
                      selectedMuscle === m
                        ? 'bg-white/[0.1] text-white border border-white/20 font-semibold'
                        : 'text-slate-400 hover:text-white bg-transparent border border-transparent'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises List (Internal Scroll) */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1 pr-1">
              {filteredExercises.length === 0 ? (
                <div className="p-3 text-center rounded-lg bg-[#05080e] border border-white/[0.04] text-xs text-slate-400">
                  No movements matching filter.
                </div>
              ) : (
                filteredExercises.map((ex) => {
                  const isSelected = ex.exerciseName === activeExercise?.exerciseName;
                  const diag = computeExerciseDiagnostic(ex);

                  return (
                    <div
                      key={ex.exerciseName}
                      onClick={() => setSelectedExerciseName(ex.exerciseName)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/[0.08] border-white/20 shadow-xs'
                          : 'bg-[#090d14] border-white/[0.05] hover:bg-white/[0.03] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-xs truncate block ${
                          isSelected ? 'text-white font-semibold' : 'text-slate-200 font-medium'
                        }`}>
                          {ex.exerciseName}
                        </span>
                        
                        {/* Status Badge: Direct warning or progress indicator */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExerciseName(ex.exerciseName);
                            const rep = generateSmartExerciseReport(ex, client.name);
                            setDiagnosticModalReport(rep);
                          }}
                          className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all ${diag.badgeClass}`}
                          title="Click to view smart diagnostic report"
                        >
                          {diag.badgeText}
                        </button>
                      </div>

                      {/* Clean Telemetry Subtitle */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{ex.targetMuscle} &bull; {ex.totalSessionsCount} ses.</span>
                        <span>
                          Start: <strong className="text-slate-300 font-medium">{ex.firstWeightKg}kg</strong> &bull; Peak: <strong className="text-white font-semibold">{ex.allTimePRWeightKg}kg</strong>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE EXERCISE GRAPH & SET-BY-SET TIMELINE (Col span 8) */}
          <div className="lg:col-span-8 flex flex-col h-full space-y-1.5 min-h-0 overflow-y-auto custom-scrollbar pr-1">
            {activeExercise && activeDiagnostic ? (
              <>
                {/* Active Exercise Hero Telemetry */}
                <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-1.5 flex-shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                        {activeExercise.exerciseName}
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-300 px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                        {activeExercise.targetMuscle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono hidden md:inline truncate">
                        {activeExercise.firstSessionDate || 'Day 1'} – {activeExercise.latestSessionDate || 'Recent'}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeExercise) {
                            const rep = generateSmartExerciseReport(activeExercise, client.name);
                            setDiagnosticModalReport(rep);
                          }
                        }}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-[9.5px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        title="Open Smart Diagnostic Report"
                      >
                        <span>Diagnostic Report</span>
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Peak PR:</span>
                      <span className="text-xs sm:text-sm font-bold text-white font-mono">
                        {activeExercise.allTimePRWeightKg} kg
                      </span>
                    </div>
                  </div>

                  {/* 4 Compact Telemetry Boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-white/[0.05]">
                    {/* 1. Starting Top Set */}
                    <div className="p-1.5 rounded-lg bg-[#05080e] border border-white/[0.04] text-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        Starting Top Set
                      </span>
                      <span className="text-xs font-bold text-white mt-0.5 block font-mono">
                        {activeDiagnostic.startWorkingSet}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                        {activeExercise.firstSessionDate || 'Day 1'}
                      </span>
                    </div>

                    {/* 2. Current Top Set */}
                    <div className="p-1.5 rounded-lg bg-[#05080e] border border-white/[0.04] text-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        Current Top Set
                      </span>
                      <span className="text-xs font-bold text-white mt-0.5 block font-mono">
                        {activeDiagnostic.latestWorkingSet}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                        {activeExercise.latestSessionDate || 'Latest'}
                      </span>
                    </div>

                    {/* 3. Net Progression */}
                    <div className="p-1.5 rounded-lg bg-[#05080e] border border-white/[0.04] text-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        Net Progression
                      </span>
                      <span className="text-xs font-bold text-emerald-400 mt-0.5 block font-mono">
                        +{activeExercise.netWeightGainKg} kg
                      </span>
                      <span className="text-[9px] text-emerald-400/90 font-mono block mt-0.5">
                        +{activeExercise.percentageGain}% gain
                      </span>
                    </div>

                    {/* 4. Lift Status (Clickable to open Smart Diagnostic Report) */}
                    <div
                      onClick={() => {
                        if (activeExercise) {
                          const rep = generateSmartExerciseReport(activeExercise, client.name);
                          setDiagnosticModalReport(rep);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-[#05080e] border border-white/[0.04] hover:border-white/20 text-center cursor-pointer transition-all group"
                      title="Click to view full movement diagnostic report"
                    >
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block group-hover:text-cyan-300 transition-colors">
                        Lift Status
                      </span>
                      <div className="mt-0.5 flex items-center justify-center">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded group-hover:scale-105 transition-transform ${activeDiagnostic.badgeClass}`}>
                          {activeDiagnostic.badgeText}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5 group-hover:text-slate-300 transition-colors">
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
                </div>

                {/* SVG Progression Curve */}
                <ExerciseProgressionGraph
                  exercise={activeExercise}
                  hoveredPointIndex={hoveredPointIndex}
                  setHoveredPointIndex={setHoveredPointIndex}
                />

                {/* Detailed Set-by-Set Historical Breakdown */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Recorded Sessions &amp; Complete Sets History ({activeExercise.history.length} Sessions)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Chronological log
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {activeExercise.history.map((session, sIdx) => {
                      const isPR = session.isAllTimePR;
                      const isRepsPR = session.isRepsPR;
                      const hasWeightGain = session.weightOverloadDeltaKg > 0;
                      const hasRepsGain = session.repsOverloadDelta > 0;
                      const isDrop = session.weightOverloadDeltaKg < 0 || (session.weightOverloadDeltaKg === 0 && session.repsOverloadDelta < 0);

                      let badgeText = session.overloadBadge || 'Holding';
                      let badgeClass = 'bg-white/[0.04] text-slate-300 border border-white/[0.08]';

                      if (isPR || hasWeightGain) {
                        badgeClass = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-bold';
                      } else if (isRepsPR || hasRepsGain) {
                        badgeClass = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-bold';
                      } else if (isDrop) {
                        badgeClass = 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold';
                      }

                      return (
                        <div
                          key={session.logId || sIdx}
                          className={`p-2 rounded-xl border transition-colors ${
                            isPR || hasWeightGain || hasRepsGain
                              ? 'bg-white/[0.04] border-white/20'
                              : 'bg-[#090d14] border-white/[0.06]'
                          }`}
                        >
                          {/* Session Header */}
                          <div className="flex items-center justify-between pb-1 border-b border-white/[0.04] text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-white font-semibold text-xs">
                                {session.date}
                              </span>
                              <span className="text-slate-600">&bull;</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {session.dayName}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold ${badgeClass}`}>
                                {badgeText}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 font-numeric text-xs font-mono">
                              <span className="text-slate-300 text-[11px]">
                                Top Set: <strong className="text-white font-semibold">{session.maxWeightKg} kg</strong>
                              </span>
                            </div>
                          </div>

                          {/* Sets Pills List */}
                          <div className="pt-1.5">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-medium block mb-1">
                              Sets Executed:
                            </span>
                            <div className="flex flex-wrap items-center gap-1">
                              {session.sets.map((set) => (
                                <div
                                  key={set.setNumber}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 ${
                                    set.isTopSet
                                      ? 'bg-white/[0.1] text-white border border-white/25 font-semibold shadow-2xs'
                                      : 'bg-[#05080e] text-slate-300 border border-white/[0.04]'
                                  }`}
                                >
                                  <span className="text-[10px] text-slate-400">S{set.setNumber}:</span>
                                  <span>{set.weightKg}kg &times; {set.reps}</span>
                                  {set.isTopSet && (
                                    <span className="text-[8px] uppercase tracking-wider text-slate-300 ml-0.5">Top</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center rounded-xl bg-[#090d14] border border-white/[0.07] text-xs text-slate-400">
                Select an exercise from the left to view progression graphs and set details.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* BY WORKOUT SESSIONS VIEW */
        <div className="flex-1 min-h-0 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between px-1 flex-shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Chronological Workout Sessions ({clientLogs.length} Logged)
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {clientLogs.map((log) => {
              const mins = Math.round(log.durationSeconds / 60);

              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-1.5"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.05]">
                    <div>
                      <h5 className="text-xs font-semibold text-white">
                        {log.dayName}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                        <span>{log.date}</span>
                        <span>&bull;</span>
                        <span>{mins} mins duration</span>
                      </div>
                    </div>

                    <span className="px-1.5 py-0.2 rounded bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-300">
                      {log.completedExercises.length} Movements
                    </span>
                  </div>

                  <div className="space-y-1">
                    {log.completedExercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-[#05080e] border border-white/[0.04] flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-medium text-slate-200 block truncate text-[11px]">
                            {ex.exerciseName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {ex.sets.length} sets logged
                          </span>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap justify-end font-numeric text-[11px] font-mono">
                          {ex.sets.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] text-slate-300 text-[10px]"
                            >
                              {s.weightKg}kg &times; {s.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {log.coachFeedback && (
                    <div className="p-2 rounded-lg bg-[#05080e] border border-white/[0.04] text-xs text-slate-300">
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-semibold block">Coach Note:</span>
                      <p className="mt-0.5 italic text-slate-300 text-[11px]">&ldquo;{log.coachFeedback}&rdquo;</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Smart Diagnostic Report Executive Modal */}
      <SmartDiagnosticReportModal
        isOpen={Boolean(diagnosticModalReport)}
        onClose={() => setDiagnosticModalReport(null)}
        report={diagnosticModalReport}
        onOpenHistory={(exerciseName) => {
          setSelectedExerciseName(exerciseName);
          setDiagnosticModalReport(null);
        }}
      />
    </div>
  );
};
