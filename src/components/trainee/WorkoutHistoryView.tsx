'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { WorkoutDay, WorkoutLog } from '@/types';
import { LiveWorkoutSession } from './LiveWorkoutSession';
import { 
  getExerciseProgressAnalysis, 
  ExerciseProgressSummary,
  ExerciseSessionRecord
} from '@/lib/progressEngine';


type ViewMode = 'strength' | 'sessions';

const CATEGORY_TABS = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Quads',
  'Hamstrings',
  'Core'
];

/**
 * ProgressionBlocks — High-impact vertical overload blocks with dynamic height scaling.
 * When weight increases (e.g. 30kg -> 60kg or 60kg -> 65kg), the block is noticeably taller.
 */
const ProgressionBlocks: React.FC<{
  sessions: ExerciseSessionRecord[];
  barHeightPx?: number;
  blockWidthClass?: string;
}> = ({ sessions, barHeightPx = 26, blockWidthClass = 'max-w-[44px] sm:max-w-[50px]' }) => {
  if (sessions.length === 0) return null;

  const weights = sessions.map((s) => s.maxWeightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const delta = maxW - minW;

  return (
    <div className="w-full flex flex-col select-none">
      {/* 1. Top Weight Labels (Dedicated row: 100% visible, never clipped) */}
      <div className="w-full flex items-center justify-between gap-1.5 px-0.5 pb-0.5">
        {sessions.map((sess, idx) => {
          const isPR = sess.isAllTimePR;
          const isTopWeight = delta > 0 && sess.maxWeightKg === maxW;
          const isHighlight = isPR || isTopWeight;

          return (
            <div key={sess.logId || idx} className="flex-1 text-center truncate">
              <span
                className={`text-[9.5px] font-mono font-bold leading-none block ${
                  isHighlight ? 'text-[var(--main-color)]' : 'text-zinc-400'
                }`}
              >
                {sess.maxWeightKg}k
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Bars Track (Sleek compact height) */}
      <div 
        className="w-full flex items-end justify-between gap-1.5 px-0.5"
        style={{ height: `${barHeightPx}px` }}
      >
        {sessions.map((sess, idx) => {
          let heightPct = 60;
          if (delta > 0) {
            const baseline = Math.max(0, minW - delta * 0.75);
            const range = maxW - baseline || 1;
            const rawPct = ((sess.maxWeightKg - baseline) / range) * 100;
            heightPct = Math.min(100, Math.max(36, Math.round(rawPct)));
          }

          const isPR = sess.isAllTimePR;
          const isTopWeight = delta > 0 && sess.maxWeightKg === maxW;
          const isHighlight = isPR || isTopWeight;

          return (
            <div 
              key={sess.logId || idx}
              className="flex-1 flex items-end justify-center h-full min-w-0"
            >
              <div
                className={`w-full ${blockWidthClass} rounded-t transition-all duration-300 ${
                  isHighlight
                    ? 'bg-[var(--main-color)] shadow-[0_0_8px_rgba(47,128,237,0.35)]'
                    : 'bg-[var(--card-subtle-bg)] hover:bg-white/[0.04] border-t border-x border-[var(--card-border)]'
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* 3. Hairline Divider */}
      <div className="w-full h-px bg-white/[0.08] my-0.5" />

      {/* 4. Dates Row */}
      <div className="w-full flex items-center justify-between gap-1.5 px-0.5 pt-0.5">
        {sessions.map((sess, idx) => {
          const parts = sess.date.split('-');
          const dateFormatted = parts.length === 3 ? `${parts[1]}/${parts[2]}` : sess.date;

          return (
            <div key={sess.logId || idx} className="flex-1 text-center truncate">
              <span className="text-[9px] font-mono text-zinc-500 font-medium leading-none block">
                {dateFormatted}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const WorkoutHistoryView: React.FC = () => {
  const { currentUser, getUserLogs, getPlanForUser, deleteWorkoutLog } = useGym();
  const { showToast } = useToast();
  
  // Navigation tabs: Strength & Overload, Weight Curve, PR Records, Session Logs
  const [viewMode, setViewMode] = useState<ViewMode>('strength');
  
  // Category filter & search for exercises
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Expanded exercise cards tracking
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});

  // Full History Progression Modal for an exercise
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<ExerciseProgressSummary | null>(null);

  // Active session deletion & restart state
  const [logToDelete, setLogToDelete] = useState<WorkoutLog | null>(null);
  const [activeSessionDay, setActiveSessionDay] = useState<WorkoutDay | null>(null);

  const logs = useMemo(() => (currentUser ? getUserLogs(currentUser.id) : []), [currentUser, getUserLogs]);
  const userPlan = useMemo(() => (currentUser ? getPlanForUser(currentUser.id) : undefined), [currentUser, getPlanForUser]);

  // Exercise Progression Analysis across all logs
  const exerciseSummaries = useMemo(() => {
    return getExerciseProgressAnalysis(logs, userPlan);
  }, [logs, userPlan]);

  // Filter exercises by Category and Search Query
  const filteredExercises = useMemo(() => {
    return exerciseSummaries.filter((ex) => {
      const matchesCategory = 
        selectedCategory === 'All' || 
        ex.targetMuscle.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = 
        ex.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [exerciseSummaries, selectedCategory, searchQuery]);

  // PR Hero summary statistics (Milestone & Overload Achievements)
  const prHeroStats = useMemo<{
    totalPRCount: number;
    progressingCount: number;
    totalTracked: number;
    totalGainKg: number;
    topLift: ExerciseProgressSummary | null;
  }>(() => {
    let totalPRCount = 0;
    let totalGainKg = 0;
    let progressingCount = 0;
    let topLift: ExerciseProgressSummary | null = null;

    exerciseSummaries.forEach((ex) => {
      if (ex.allTimePRWeightKg > 0) totalPRCount++;
      if (ex.netWeightGainKg > 0) {
        progressingCount++;
        totalGainKg += ex.netWeightGainKg;
        if (!topLift || ex.netWeightGainKg > topLift.netWeightGainKg) {
          topLift = ex;
        }
      }
    });

    return {
      totalPRCount,
      progressingCount,
      totalTracked: exerciseSummaries.length,
      totalGainKg: Math.round(totalGainKg * 10) / 10,
      topLift
    };
  }, [exerciseSummaries]);

  // Search & Muscle Quick Suggest Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const toggleExpand = (name: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchModalOpen) setIsSearchModalOpen(false);
        if (logToDelete) setLogToDelete(null);
        if (selectedExerciseForModal) setSelectedExerciseForModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, logToDelete, selectedExerciseForModal]);

  if (!currentUser) return null;

  if (activeSessionDay && userPlan) {
    return (
      <LiveWorkoutSession
        plan={userPlan}
        day={activeSessionDay}
        onExit={() => setActiveSessionDay(null)}
        onSessionCompleted={() => setActiveSessionDay(null)}
      />
    );
  }

  const topLift = prHeroStats.topLift;

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto space-y-6 pb-28 md:pb-12">
      
      {/* 1. TOP HERO: Single Unified All-Time PRs Milestone Card */}
      <div className="gym-card relative overflow-hidden">
        {/* Subtle Ambient Sapphire Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[var(--main-color)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10 items-center">
          
          {/* Side 1: All-Time PRs Broken Milestone */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)]" />
              <span className="gym-label-mono text-slate-400">
                ALL-TIME PRS
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-0.5">
              <span className="gym-num text-base sm:text-lg font-bold text-white">
                {prHeroStats.totalPRCount}
              </span>
              <span className="gym-label-mono text-slate-400 text-[10px]">
                Records
              </span>
            </div>
            <p className="gym-subtext pt-0.5">
              {prHeroStats.progressingCount > 0 
                ? `${prHeroStats.progressingCount} of ${prHeroStats.totalTracked} Lifts Overloaded`
                : 'Personal Bests Established'}
            </p>
          </div>

          {/* Side 2: Top Overload Achievement */}
          <div className="border-l border-white/[0.08] pl-3 sm:pl-4 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="gym-label-mono text-slate-400">
                {topLift ? 'TOP OVERLOAD' : 'TOTAL GAIN'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-0.5">
              <span className="gym-num text-base sm:text-lg font-bold text-[var(--main-color)]">
                {topLift 
                  ? `+${topLift.netWeightGainKg}k` 
                  : `+${prHeroStats.totalGainKg}k`}
              </span>
            </div>
            <p className="gym-subtext truncate pt-0.5">
              {topLift 
                ? `${topLift.exerciseName}` 
                : 'Cumulative Strength Added'}
            </p>
          </div>

        </div>
      </div>

      {/* 2. SLIM VIEW SWITCHER */}
      <div className="p-1 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] grid grid-cols-2 gap-1">
        <button
          onClick={() => setViewMode('strength')}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
            viewMode === 'strength'
              ? 'bg-[var(--card-subtle-bg)] text-white border border-white/[0.1] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Exercises &amp; Overload
        </button>

        <button
          onClick={() => setViewMode('sessions')}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
            viewMode === 'sessions'
              ? 'bg-[var(--card-subtle-bg)] text-white border border-white/[0.1] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Session Logs ({logs.length})
        </button>
      </div>

      {/* 3. TAB CONTENT: STRENGTH OVERLOAD */}
      {viewMode === 'strength' && (
        <div className="space-y-4">
          
          {/* Authentic Real Search Input Bar + Quick Muscle Filter Trigger */}
          <div className="flex items-center gap-2">
            
            {/* Real Search Input Field */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search exercise (e.g. Bench, Squat)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="gym-input w-full pr-8 text-xs font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Muscle Filter Button (Opens Quick Suggest Modal) */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className={`h-10 px-3.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                selectedCategory !== 'All'
                  ? 'bg-[var(--main-color)]/15 border-[var(--main-color)] text-[var(--main-color)] shadow-sm shadow-[var(--main-color)]/20'
                  : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span>{selectedCategory === 'All' ? 'Filter' : selectedCategory}</span>
              {selectedCategory !== 'All' && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('All');
                  }}
                  className="w-3.5 h-3.5 rounded-full bg-[var(--main-color)]/30 hover:bg-[var(--main-color)]/50 text-white flex items-center justify-center text-[9px] ml-0.5"
                  title="Reset to All"
                >
                  ✕
                </span>
              )}
            </button>

          </div>

          {/* Exercises List */}
          {filteredExercises.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-300">
                  {searchQuery || selectedCategory !== 'All' 
                    ? 'No matching exercises' 
                    : 'No exercise logs found'}
                </h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  {searchQuery || selectedCategory !== 'All'
                    ? `No logged exercises found for "${searchQuery || selectedCategory}". Try resetting your filter.`
                    : 'Complete workout sessions to track your overload and sets progression.'}
                </p>
              </div>

              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[var(--main-color)]/15 border border-[var(--main-color)]/40 text-[var(--main-color)] text-xs font-bold hover:bg-[var(--main-color)]/25 active:scale-95 transition-all cursor-pointer"
                >
                  Clear Search & Filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {filteredExercises.map((exSummary) => {
                const isExpanded = expandedExercises[exSummary.exerciseName] ?? false;
                const hasGain = exSummary.netWeightGainKg > 0;
                const sessionsChronological = [...exSummary.history].reverse();
                
                // Dynamic scaling math:
                const weights = sessionsChronological.map((s) => s.maxWeightKg);
                const minW = Math.min(...weights, 1);
                const maxW = Math.max(...weights, 1);
                const range = maxW - minW;

                return (
                  <div
                    key={exSummary.exerciseName}
                    className="gym-card space-y-2 shadow-sm"
                  >
                    {/* Header: Pure Typography */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="gym-label-mono flex items-center gap-1.5 text-slate-400">
                          <span>{exSummary.targetMuscle}</span>
                          {hasGain && (
                            <span className="text-[var(--main-color)] font-bold">
                              • +{exSummary.netWeightGainKg}kg Overload
                            </span>
                          )}
                        </div>
                        <h3 className="gym-heading-card truncate mt-0.5">
                          {exSummary.exerciseName}
                        </h3>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="gym-label-mono block text-slate-400">
                          Best PR
                        </span>
                        <span className="gym-num text-sm text-[var(--main-color)]">
                          {exSummary.allTimePRWeightKg} kg
                        </span>
                      </div>
                    </div>

                    {/* Integrated Metric Strip (Zero Nested Bulky Box) */}
                    <div className="grid grid-cols-4 gap-1 py-1.5 border-y border-[var(--card-border)] text-center">
                      <div>
                        <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Day 1</span>
                        <span className="text-xs font-extrabold font-numeric text-zinc-300">
                          {exSummary.firstWeightKg} kg
                        </span>
                      </div>
                      <div className="border-x border-[var(--card-border)]">
                        <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Peak PR</span>
                        <span className="text-xs font-extrabold font-numeric text-[var(--main-color)]">
                          {exSummary.allTimePRWeightKg} kg
                        </span>
                      </div>
                      <div className="border-r border-[var(--card-border)]">
                        <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Net Gain</span>
                        <span className={`text-xs font-extrabold font-numeric ${hasGain ? 'text-[var(--main-color)]' : 'text-zinc-400'}`}>
                          {hasGain ? `+${exSummary.netWeightGainKg} kg` : '0 kg'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Est. 1RM</span>
                        <span className="text-xs font-extrabold font-numeric text-zinc-200">
                          {exSummary.allTime1RMKg} kg
                        </span>
                      </div>
                    </div>

                    {/* Weight Progression Blocks (Click to Open Full History) */}
                    {sessionsChronological.length > 1 && (
                      <div
                        onClick={() => setSelectedExerciseForModal(exSummary)}
                        className="p-2.5 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 active:scale-[0.99] transition-all cursor-pointer group space-y-2"
                        title="Click to view full progression history timeline"
                      >
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono px-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-300">Progression</span>
                            {exSummary.percentageGain > 0 ? (
                              <span className="text-[var(--main-color)] font-bold">+{exSummary.percentageGain}% Gain</span>
                            ) : (
                              <span className="text-zinc-500">Steady</span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 group-hover:text-[var(--main-color)] transition-colors">
                            All History ({sessionsChronological.length})
                          </span>
                        </div>

                        <ProgressionBlocks
                          sessions={sessionsChronological.slice(-6)}
                          barHeightPx={24}
                          blockWidthClass="max-w-[42px]"
                        />
                      </div>
                    )}

                    {/* Sets Accordion Toggle */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleExpand(exSummary.exerciseName)}
                        className="w-full flex items-center justify-between text-xs font-bold text-zinc-400 hover:text-white py-0.5 cursor-pointer"
                      >
                        <span className="font-mono text-[10px] text-zinc-500">
                          {exSummary.history.length} Sessions Logged
                        </span>
                        <span className="font-mono text-[10px] text-[var(--main-color)]">
                          {isExpanded ? 'Hide Sets' : 'View Sets'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 pt-1 border-t border-[var(--card-border)]">
                          {exSummary.history.map((sessRecord) => (
                            <div
                              key={sessRecord.logId}
                              className="p-2 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white text-[11px]">
                                    {sessRecord.date}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    {sessRecord.dayName}
                                  </span>
                                </div>
                                {sessRecord.overloadBadge && (
                                  <span className="text-[9px] font-mono font-bold text-[var(--main-color)]">
                                    {sessRecord.overloadBadge}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {sessRecord.sets.map((s, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className={`text-[10px] font-numeric font-bold px-2 py-0.5 rounded border ${
                                      s.isTopSet
                                        ? 'bg-[var(--main-color)]/15 text-[var(--main-color)] border-[var(--main-color)]/40'
                                        : 'bg-[var(--card-bg)] text-zinc-300 border-[var(--card-border)]'
                                    }`}
                                  >
                                    {s.weightKg}kg × {s.reps}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 4. TAB CONTENT: FULL WORKOUT SESSION LOGS */}
      {viewMode === 'sessions' && (
        <div className="space-y-3.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] md:col-span-2">
              <h4 className="text-sm font-bold text-zinc-300">No workout sessions logged yet</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Start a workout from Today&apos;s Session to log your weights, reps, and volume.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const mins = Math.round(log.durationSeconds / 60);

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--main-color)]/30 transition-all space-y-3"
                >
                  {/* Session Header */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[var(--card-border)]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                        <span>{log.date}</span>
                        <span>•</span>
                        <span>{mins} mins</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white tracking-tight mt-0.5 truncate">
                        {log.dayName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Re-do Session Button */}
                      {userPlan && (() => {
                        const matchedDay = userPlan.days.find(
                           (d) => d.id === log.dayId || d.dayName.toLowerCase() === log.dayName.toLowerCase()
                        );
                        if (!matchedDay) return null;

                        return (
                          <button
                            type="button"
                            onClick={() => setActiveSessionDay(matchedDay)}
                            className="px-2.5 py-1 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-xs font-mono text-zinc-300 hover:text-[var(--main-color)] transition-all cursor-pointer"
                          >
                            Re-do
                          </button>
                        );
                      })()}

                      {/* Delete Session Button */}
                      <button
                        type="button"
                        onClick={() => setLogToDelete(log)}
                        className="px-2.5 py-1 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-xs font-mono text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Completed Exercises Table */}
                  <div className="divide-y divide-[var(--card-border)] text-xs">
                    {log.completedExercises.map((ex, i) => {
                      const completedSets = ex.sets.filter((s) => s.completed);

                      return (
                        <div key={i} className="py-2 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-zinc-200">{ex.exerciseName}</span>
                            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                              {ex.targetMuscle} • {completedSets.length} sets
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 justify-end">
                            {completedSets.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] font-numeric font-bold text-[var(--main-color)] px-2 py-0.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--main-color)]/20"
                              >
                                {s.weightKg}kg × {s.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* 7. DELETE LOG CONFIRMATION MODAL */}
      {logToDelete && (
        <div 
          onClick={() => setLogToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 text-center space-y-4 cursor-default"
          >
            <div>
              <h3 className="text-base font-extrabold text-white">Delete Workout Session?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to remove &quot;{logToDelete.dayName}&quot; ({logToDelete.date}) from your history?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="py-2.5 px-3 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteWorkoutLog(logToDelete.id);
                  showToast('Workout session removed from history', 'info');
                  setLogToDelete(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. SEARCH & MUSCLE QUICK SUGGEST MODAL */}
      {isSearchModalOpen && (
        <div 
          onClick={() => setIsSearchModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[var(--card-bg)] border-t sm:border border-[var(--card-border)] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto cursor-default"
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]">
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  Search & Muscle Filter
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  Quick suggest muscle groups & exercises
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-zinc-400 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search exercise (e.g. Bench, Squat)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="gym-input w-full text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Suggest Muscle Groups */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                QUICK SUGGEST • MUSCLE GROUPS
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {CATEGORY_TABS.map((cat) => {
                  const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                        isActive
                          ? 'bg-[var(--main-color)] text-white shadow-md shadow-[var(--main-color)]/25'
                          : 'bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-zinc-300 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer with matches count & Done button */}
            <div className="pt-2 border-t border-[var(--card-border)] flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-zinc-400">
                {filteredExercises.length} Exercise{filteredExercises.length === 1 ? '' : 's'} Match
              </span>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="gym-btn-primary py-2 px-5 text-xs font-bold"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. FULL EXERCISE PROGRESSION HISTORY MODAL */}
      {selectedExerciseForModal && (() => {
        const modalSessions = [...selectedExerciseForModal.history].reverse();
        const hasGain = selectedExerciseForModal.netWeightGainKg > 0;

        return (
          <div
            onClick={() => setSelectedExerciseForModal(null)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--card-bg)] border-t sm:border border-[var(--card-border)] rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl space-y-2.5 max-h-[92vh] overflow-y-auto cursor-default"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--card-border)]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                      {selectedExerciseForModal.targetMuscle} • PROGRESSION
                    </span>
                    {hasGain && (
                      <span className="text-[9px] font-mono text-[var(--main-color)] font-bold">
                        +{selectedExerciseForModal.netWeightGainKg}kg
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5">
                    {selectedExerciseForModal.exerciseName}
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono block">
                    All-Time History ({modalSessions.length} Sessions)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedExerciseForModal(null)}
                  className="w-7 h-7 rounded-full bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-zinc-400 hover:text-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* 4 Telemetry Metrics */}
              <div className="grid grid-cols-4 gap-1 py-1.5 px-2 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-center">
                <div>
                  <span className="block text-[7.5px] font-mono uppercase text-zinc-500 font-bold">Day 1</span>
                  <span className="text-xs font-extrabold font-numeric text-zinc-300">
                    {selectedExerciseForModal.firstWeightKg} kg
                  </span>
                </div>
                <div className="border-x border-[var(--card-border)]">
                  <span className="block text-[7.5px] font-mono uppercase text-zinc-500 font-bold">Peak PR</span>
                  <span className="text-xs font-extrabold font-numeric text-[var(--main-color)]">
                    {selectedExerciseForModal.allTimePRWeightKg} kg
                  </span>
                </div>
                <div className="border-r border-[var(--card-border)]">
                  <span className="block text-[7.5px] font-mono uppercase text-zinc-500 font-bold">Total Gain</span>
                  <span className={`text-xs font-extrabold font-numeric ${hasGain ? 'text-[var(--main-color)]' : 'text-zinc-400'}`}>
                    {hasGain ? `+${selectedExerciseForModal.netWeightGainKg} kg` : '0 kg'}
                  </span>
                </div>
                <div>
                  <span className="block text-[7.5px] font-mono uppercase text-zinc-500 font-bold">Est. 1RM</span>
                  <span className="text-xs font-extrabold font-numeric text-zinc-200">
                    {selectedExerciseForModal.allTime1RMKg} kg
                  </span>
                </div>
              </div>

              {/* Full Progression Blocks (Zero Scroll, Fits Box Perfectly) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 px-0.5">
                  <span className="font-bold text-zinc-400">Progression Blocks</span>
                  <span className="text-zinc-500 text-[9px] font-mono">
                    {modalSessions.length} Sessions
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] w-full">
                  <ProgressionBlocks
                    sessions={modalSessions}
                    barHeightPx={26}
                    blockWidthClass="max-w-[46px]"
                  />
                </div>
              </div>

              {/* Session Sets Breakdown Table */}
              <div className="space-y-1 pt-0.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block px-0.5">
                  SESSION-BY-SESSION BREAKDOWN
                </span>
                <div className="space-y-1">
                  {selectedExerciseForModal.history.map((sess) => (
                    <div
                      key={sess.logId}
                      className="py-1.5 px-2.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-zinc-200 text-[10px]">{sess.date}</span>
                          <span className="text-[9px] text-zinc-500 font-mono truncate">{sess.dayName}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {sess.sets.map((s, idx) => (
                            <span
                              key={idx}
                              className={`text-[9px] font-numeric px-1.5 py-0.5 rounded border leading-none ${
                                s.isTopSet
                                  ? 'bg-[var(--main-color)]/15 text-[var(--main-color)] border-[var(--main-color)]/40 font-bold'
                                  : 'bg-[var(--card-bg)] text-zinc-300 border-[var(--card-border)]'
                              }`}
                            >
                              {s.weightKg}kg × {s.reps}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[11px] font-numeric font-extrabold text-[var(--main-color)] block leading-tight">
                          Top: {sess.maxWeightKg} kg
                        </span>
                        {sess.overloadBadge && (
                          <span className="text-[8.5px] font-mono text-[var(--main-color)] block font-bold leading-tight">
                            {sess.overloadBadge}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
