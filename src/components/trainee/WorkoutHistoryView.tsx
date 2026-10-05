'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { WorkoutDay, WorkoutLog } from '@/types';
import { LiveWorkoutSession } from './LiveWorkoutSession';
import { 
  getExerciseProgressAnalysis, 
  ExerciseProgressSummary,
  calculateDynamicWorkoutStreak,
  calculateDynamicStrengthPace
} from '@/lib/progressEngine';
import { 
  getUserHabits,
  calculateOverallHabitsSummary 
} from '@/lib/habitsEngine';
import { 
  History, 
  Dumbbell, 
  TrendingUp, 
  MessageSquare, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Sparkles,
  Trash2,
  RotateCcw,
  Play
} from 'lucide-react';

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

// Reusable Dynamic SVG Circular Progress Ring
const ProgressRing: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}> = ({
  percentage,
  size = 48,
  strokeWidth = 3.5,
  color = '#2f80ed',
  children
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        {/* Background Track */}
        <path
          className="text-[#24262e]"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        {/* Dynamic Filled Progress Path */}
        <path
          style={{ stroke: color }}
          className="transition-all duration-700 ease-out"
          strokeDasharray={`${clamped}, 100`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

export const WorkoutHistoryView: React.FC = () => {
  const { currentUser, getUserLogs, getPlanForUser, deleteWorkoutLog } = useGym();
  const { showToast } = useToast();
  
  // Main view toggle: 'exercises' (Weight & Overload progression) or 'sessions' (Full workout logs)
  const [viewMode, setViewMode] = useState<'exercises' | 'sessions'>('exercises');
  
  // Category filter for exercises
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Expanded exercise cards tracking
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});

  // Active session deletion & restart state
  const [logToDelete, setLogToDelete] = useState<WorkoutLog | null>(null);
  const [activeSessionDay, setActiveSessionDay] = useState<WorkoutDay | null>(null);

  const logs = useMemo(() => (currentUser ? getUserLogs(currentUser.id) : []), [currentUser, getUserLogs]);
  const userPlan = useMemo(() => (currentUser ? getPlanForUser(currentUser.id) : undefined), [currentUser, getPlanForUser]);

  // 1. 100% Dynamic Exercise Progression Analysis across ALL exercises & plan movements
  const exerciseSummaries = useMemo(() => {
    return getExerciseProgressAnalysis(logs, userPlan);
  }, [logs, userPlan]);

  // 2. Filter exercises by Category and Search Query
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

  // 3. 100% Dynamic Workout Commitment Streak Calculation
  const workoutStreak = useMemo(() => {
    return calculateDynamicWorkoutStreak(logs, userPlan?.daysPerWeek || 4);
  }, [logs, userPlan]);

  // 4. 100% Dynamic Strength & Overload Progression Health
  const strengthPace = useMemo(() => {
    return calculateDynamicStrengthPace(exerciseSummaries);
  }, [exerciseSummaries]);

  // 5. 100% Dynamic Habits Adherence & Streak
  const habitsMetrics = useMemo(() => {
    if (!currentUser) return { activeStreak: 0, adherencePercentage: 0 };
    const userHabitsList = getUserHabits(currentUser.id);
    return calculateOverallHabitsSummary(currentUser.id, userHabitsList);
  }, [currentUser]);

  const toggleExpand = (name: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

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

  return (
    <div className="w-full max-w-md md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-5 pb-28 md:pb-12">
      
      {/* 1. Mode Switcher Bar (Exercise Progress vs Sessions Log) */}
      <div className="p-1.5 rounded-2xl bg-[#18191e] border border-[#24262e] grid grid-cols-2 gap-1 shadow-md">
        <button
          onClick={() => setViewMode('exercises')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'exercises'
              ? 'bg-[#2f80ed] text-white shadow-md shadow-[#2f80ed]/25'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Exercise Strength</span>
        </button>

        <button
          onClick={() => setViewMode('sessions')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'sessions'
              ? 'bg-[#2f80ed] text-white shadow-md shadow-[#2f80ed]/25'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Session Logs ({logs.length})</span>
        </button>
      </div>

      {/* 2. Top Unified Analytics & Streaks Hero Card with Dynamic Circular Rings */}
      <div className="relative p-4 sm:p-5 rounded-3xl bg-[#18191e] border border-[#24262e] shadow-xl overflow-hidden space-y-4">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#2f80ed]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Row 1: Weekly Workout Streak Header with Dynamic Percentage Circle */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Dynamic Circular Progress Ring for Weekly Commitment */}
            <ProgressRing
              percentage={workoutStreak.completionPercentage}
              size={44}
              strokeWidth={3.5}
              color="#2f80ed"
            >
              <span className="text-[11px] font-black font-numeric text-white leading-none">
                {workoutStreak.completionPercentage}%
              </span>
            </ProgressRing>

            <div className="min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                WORKOUT COMMITMENT
              </span>
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1 whitespace-nowrap">
                <Flame className="w-4 h-4 text-[#2f80ed]" />
                <span>{workoutStreak.streakWeeks} Weeks Streak</span>
              </h4>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-xs font-mono font-extrabold text-[#2f80ed] block whitespace-nowrap">
              {workoutStreak.currentWeekCount} / {workoutStreak.targetDaysPerWeek} Days
            </span>
            <span className="text-[10px] font-mono text-zinc-400 font-medium whitespace-nowrap block">
              {workoutStreak.isTargetMetThisWeek ? 'Target Met' : 'Weekly Goal'}
            </span>
          </div>
        </div>

        {/* Row 2: Two Analytical Panels with Achieved Numbers Inside Dynamic Circles */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {/* Panel 1: Strength Progression Rate */}
          <div className="p-3 rounded-2xl bg-[#141519] border border-[#24262e] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                STRENGTH PACE
              </span>
              <span className="text-xs font-extrabold text-white block mt-0.5">
                {strengthPace.overloadingCount}/{strengthPace.totalTracked} Gaining
              </span>
              <span className="text-[10px] text-zinc-500 block">
                Overload Rate
              </span>
            </div>

            <ProgressRing
              percentage={Math.min(100, Math.max(0, strengthPace.avgPercentageGain))}
              size={40}
              strokeWidth={3.5}
              color="#2f80ed"
            >
              <span className="text-[10px] font-black font-numeric text-white leading-none">
                +{strengthPace.avgPercentageGain}%
              </span>
            </ProgressRing>
          </div>

          {/* Panel 2: Habits Discipline Streak */}
          <div className="p-3 rounded-2xl bg-[#141519] border border-[#24262e] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                HABITS ROUTINE
              </span>
              <span className="text-xs font-extrabold text-white block mt-0.5">
                {habitsMetrics.activeStreak} Days Streak
              </span>
              <span className="text-[10px] text-purple-400 font-medium block">
                Daily Routine
              </span>
            </div>

            <ProgressRing
              percentage={Math.min(100, Math.max(0, habitsMetrics.adherencePercentage))}
              size={40}
              strokeWidth={3.5}
              color="#a855f7"
            >
              <span className="text-[10px] font-black font-numeric text-purple-300 leading-none">
                {habitsMetrics.adherencePercentage}%
              </span>
            </ProgressRing>
          </div>
        </div>
      </div>

      {/* 3. EXERCISE STRENGTH & PROGRESSIVE OVERLOAD VIEW */}
      {viewMode === 'exercises' && (
        <div className="space-y-3.5">
          
          {/* Muscle Group Filter Grid (Zero Horizontal Scroll, Clean 4x2 Mobile Layout) */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {CATEGORY_TABS.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-1 text-center rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate active:scale-95 ${
                    isActive
                      ? 'bg-[#18191e] text-[#2f80ed] border border-[#2f80ed]/40 shadow-sm'
                      : 'bg-[#141519] border border-[#24262e] text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercise (e.g. Bench Press)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#141519] border border-[#24262e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#2f80ed]"
            />
          </div>

          {/* Exercises List */}
          {filteredExercises.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#18191e] border border-[#24262e]">
              <Dumbbell className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
              <h4 className="text-xs font-bold text-zinc-300">No exercise logs found</h4>
              <p className="text-[11px] text-zinc-500 mt-1">
                Complete workout sessions to unlock progressive overload charts and sets comparison.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
              {filteredExercises.map((exSummary) => {
              const isExpanded = expandedExercises[exSummary.exerciseName] ?? true; // Default open
              const hasGain = exSummary.netWeightGainKg > 0;
              const sessionsChronological = [...exSummary.history].reverse(); // oldest to newest for sparkline

              // Calculate min and max weights for the sparkline chart
              const maxSessWeight = Math.max(...sessionsChronological.map(s => s.maxWeightKg), 1);
              const minSessWeight = Math.min(...sessionsChronological.map(s => s.maxWeightKg), 0);

              return (
                <div
                  key={exSummary.exerciseName}
                  className="rounded-3xl bg-[#18191e] border border-[#24262e] overflow-hidden shadow-lg transition-all space-y-3 p-4"
                >
                  {/* Exercise Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#141519] text-zinc-400 border border-[#24262e]">
                          {exSummary.targetMuscle}
                        </span>
                        {hasGain && (
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/30 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5 fill-current" />
                            <span>+{exSummary.netWeightGainKg}kg Overload</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-white tracking-tight mt-1">
                        {exSummary.exerciseName}
                      </h3>
                    </div>

                    {/* All-time Top PR Badge */}
                    <div className="px-3 py-1.5 rounded-2xl bg-[#141519] border border-[#24262e] text-right flex-shrink-0">
                      <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Max PR</span>
                      <span className="text-sm font-black font-numeric text-[#2f80ed]">
                        {exSummary.allTimePRWeightKg} kg
                      </span>
                    </div>
                  </div>

                  {/* Progressive Overload KPI Strip */}
                  <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-2xl bg-[#141519] border border-[#24262e] text-center">
                    <div>
                      <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Day 1</span>
                      <span className="text-xs font-extrabold font-numeric text-zinc-300">
                        {exSummary.firstWeightKg} kg
                      </span>
                    </div>

                    <div className="border-x border-[#24262e]">
                      <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Current PR</span>
                      <span className="text-xs font-extrabold font-numeric text-[#2f80ed]">
                        {exSummary.allTimePRWeightKg} kg
                      </span>
                    </div>

                    <div className="border-r border-[#24262e]">
                      <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Total Gain</span>
                      <span className={`text-xs font-extrabold font-numeric ${hasGain ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {hasGain ? `+${exSummary.netWeightGainKg}k` : '0 kg'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Est. 1RM</span>
                      <span className="text-xs font-extrabold font-numeric text-purple-300">
                        {exSummary.allTime1RMKg} kg
                      </span>
                    </div>
                  </div>

                  {/* Visual Weight Progression Sparkline Bar Chart */}
                  {sessionsChronological.length > 1 && (
                    <div className="p-3 rounded-2xl bg-[#141519] border border-[#24262e] space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-mono flex items-center gap-1.5 font-bold text-zinc-300">
                          <TrendingUp className="w-3.5 h-3.5 text-[#2f80ed]" />
                          <span>Weight Progression Curve</span>
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <ProgressRing
                            percentage={Math.min(100, exSummary.percentageGain)}
                            size={28}
                            strokeWidth={3.2}
                            color="#2f80ed"
                          />
                          <span className="font-mono font-bold text-[#2f80ed]">
                            +{exSummary.percentageGain}% Since Day 1
                          </span>
                        </div>
                      </div>

                      {/* Progression Step Bars */}
                      <div className="flex items-end gap-1.5 h-16 pt-2">
                        {sessionsChronological.map((sess, sIdx) => {
                          const heightPct = Math.max(25, Math.round((sess.maxWeightKg / maxSessWeight) * 100));
                          const isPR = sess.isAllTimePR;

                          return (
                            <div key={sIdx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                              <span className="text-[9px] font-mono font-extrabold text-white opacity-90 group-hover:text-[#2f80ed]">
                                {sess.maxWeightKg}k
                              </span>
                              <div
                                className={`w-full rounded-t-lg transition-all duration-500 ${
                                  isPR
                                    ? 'bg-[#2f80ed] shadow-[0_0_8px_#2f80ed]'
                                    : 'bg-[#24262e] group-hover:bg-[#383b54]'
                                }`}
                                style={{ height: `${heightPct}%` }}
                              />
                              <span className="text-[7px] font-mono text-zinc-500 truncate max-w-full">
                                {sess.date.slice(5)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Detailed Sets Comparison Accordion Toggle */}
                  <div className="pt-1 border-t border-[#24262e]">
                    <button
                      onClick={() => toggleExpand(exSummary.exerciseName)}
                      className="w-full flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-white py-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span>Session History ({exSummary.history.length} Sessions)</span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>

                    {/* Sets Comparison Table from Day 1 to Today */}
                    {isExpanded && (
                      <div className="mt-2.5 space-y-2">
                        {exSummary.history.map((sessRecord, idx) => (
                          <div
                            key={sessRecord.logId}
                            className="p-2.5 rounded-2xl bg-[#141519] border border-[#24262e] flex flex-col gap-1.5"
                          >
                            {/* Session Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-white">
                                  {sessRecord.date}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {sessRecord.dayName}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {sessRecord.overloadBadge && (
                                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#18191e] text-[#2f80ed] border border-[#2f80ed]/30">
                                    {sessRecord.overloadBadge}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetLog = logs.find((l) => l.id === sessRecord.logId);
                                    if (targetLog) {
                                      setLogToDelete(targetLog);
                                    }
                                  }}
                                  className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                                  title="Delete this session from history"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Sets Breakdown List */}
                            <div className="flex flex-wrap gap-1.5">
                              {sessRecord.sets.map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className={`text-[11px] font-numeric font-bold px-2.5 py-1 rounded-xl border ${
                                    s.isTopSet
                                      ? 'bg-[#2f80ed]/15 text-[#2f80ed] border-[#2f80ed]/40'
                                      : 'bg-[#18191e] text-zinc-200 border-[#24262e]'
                                  }`}
                                >
                                  {s.weightKg}kg × {s.reps}
                                </span>
                              ))}
                              <span className="text-[10px] text-zinc-500 font-mono self-center ml-auto">
                                Vol: {sessRecord.totalVolumeKg}kg
                              </span>
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

      {/* 4. FULL WORKOUT SESSION LOGS VIEW */}
      {viewMode === 'sessions' && (
        <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#18191e] border border-[#24262e]">
              <History className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
              <h4 className="text-xs font-bold text-zinc-300">No workout sessions logged yet</h4>
              <p className="text-[11px] text-zinc-500 mt-1">
                Start a workout from Today&apos;s Session to log your weights, reps, and volume.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const mins = Math.round(log.durationSeconds / 60);

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-3xl bg-[#18191e] border border-[#24262e] hover:border-zinc-700 transition-all shadow-md space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#24262e]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400">
                          {log.date}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs font-mono text-zinc-400 font-numeric">
                          {mins} mins
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white tracking-tight mt-0.5 truncate">
                        {log.dayName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="px-2.5 py-1 rounded-xl bg-[#141519] border border-[#24262e] text-right">
                        <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Volume</span>
                        <span className="text-xs font-extrabold font-numeric text-[#2f80ed]">
                          {log.totalVolumeKg.toLocaleString()} kg
                        </span>
                      </div>

                      {/* Re-do / Restart Workout Button */}
                      {userPlan && (() => {
                        const matchedDay = userPlan.days.find(
                          (d) => d.id === log.dayId || d.dayName.toLowerCase() === log.dayName.toLowerCase()
                        );
                        if (!matchedDay) return null;

                        return (
                          <button
                            type="button"
                            onClick={() => setActiveSessionDay(matchedDay)}
                            className="w-8 h-8 rounded-xl bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] text-zinc-300 hover:text-[#2f80ed] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Re-do / Restart this Workout"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        );
                      })()}

                      {/* Delete Log Button */}
                      <button
                        type="button"
                        onClick={() => setLogToDelete(log)}
                        className="w-8 h-8 rounded-xl bg-[#141519] hover:bg-red-950/40 border border-[#24262e] hover:border-red-500/40 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                        title="Delete Session from History"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Coach Feedback callout if present */}
                  {log.coachFeedback && (
                    <div className="p-2.5 rounded-2xl bg-[#141519] border border-[#24262e] text-xs text-zinc-300 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#2f80ed] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                          Coach Feedback
                        </span>
                        <p className="text-zinc-300 leading-snug">{log.coachFeedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Completed Exercises Table */}
                  <div className="divide-y divide-[#24262e] text-xs">
                    {log.completedExercises.map((ex, i) => {
                      const completedSets = ex.sets.filter((s) => s.completed);

                      return (
                        <div key={i} className="py-2 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-zinc-200 text-xs">{ex.exerciseName}</span>
                            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                              {ex.targetMuscle} • {completedSets.length} sets
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 justify-end">
                            {completedSets.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] font-numeric font-bold text-[#2f80ed] px-2 py-0.5 rounded-lg bg-[#18191e] border border-[#2f80ed]/20"
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

      {/* Delete Log Confirmation Modal */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#18191e] border border-[#24262e] rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Delete Workout Session?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to remove <span className="text-white font-bold">&quot;{logToDelete.dayName}&quot;</span> ({logToDelete.date}) from your history?
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#141519] border border-[#24262e] grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Volume</span>
                <span className="text-xs font-extrabold font-numeric text-[#2f80ed]">{logToDelete.totalVolumeKg.toLocaleString()} kg</span>
              </div>
              <div>
                <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold">Duration</span>
                <span className="text-xs font-extrabold font-numeric text-white">{Math.round(logToDelete.durationSeconds / 60)} Mins</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="py-2.5 px-3 rounded-xl bg-[#141519] border border-[#24262e] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteWorkoutLog(logToDelete.id);
                  showToast('Workout session removed from history!', 'info');
                  setLogToDelete(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black cursor-pointer shadow-md shadow-red-600/30"
              >
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
