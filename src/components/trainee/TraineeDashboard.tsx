'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { WorkoutPlan, WorkoutDay, Exercise } from '@/types';
import { LiveWorkoutSession } from './LiveWorkoutSession';
import { getISOWeekKey } from '@/lib/progressEngine';
import { getSavedWeightLogs, calculateDynamicWeightChange } from '@/lib/weightEngine';
import { 
  UserHabit,
  getUserHabits,
  getTodayRecordForHabit,
  setHabitRecord,
  calculateHabitStreak,
  calculateQuitLiveStats,
  getHabitsAdherenceForDate
} from '@/lib/habitsEngine';
import { RenderHabitIcon } from './TraineeHabitsView';
import { 
  getActiveWorkoutDraft, 
  hasActiveWorkoutDraft, 
  clearActiveWorkoutDraft 
} from '@/lib/activeWorkoutEngine';
import { 
  Play, 
  ChevronRight, 
  Calendar, 
  Flame, 
  Check, 
  Plus, 
  Minus, 
  Pill, 
  CigaretteOff, 
  Droplets, 
  Moon, 
  Dumbbell, 
  Layers, 
  Target, 
  Shield, 
  Zap, 
  Activity, 
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  Award,
  Scale,
  Sparkles,
  RotateCcw,
  Trash2
} from 'lucide-react';

interface TraineeDashboardProps {
  onNavigateToSplit: () => void;
  onNavigateToHistory: () => void;
  onNavigateToHabits: () => void;
}

export const TraineeDashboard: React.FC<TraineeDashboardProps> = ({
  onNavigateToSplit,
  onNavigateToHistory,
  onNavigateToHabits
}) => {
  const { currentUser, getPlanForUser, getUserLogs, deleteWorkoutLog } = useGym();
  const { showToast } = useToast();

  const [activeSessionDay, setActiveSessionDay] = useState<WorkoutDay | null>(null);
  const [showRestartConfirmModal, setShowRestartConfirmModal] = useState(false);
  const [showDeleteLogConfirm, setShowDeleteLogConfirm] = useState(false);

  // Dynamic Habits state from persistent habitsEngine
  const [userHabits, setUserHabits] = useState<UserHabit[]>(() => (currentUser ? getUserHabits(currentUser.id) : []));
  const [habitRefreshKey, setHabitRefreshKey] = useState(0);

  // Live 1-second ticking timer for Quit / Sobriety live counters
  const [, setLiveTick] = useState(0);
  useEffect(() => {
    const hasQuitHabit = userHabits.some((h) => h.type === 'quit');
    if (!hasQuitHabit) return;
    const interval = setInterval(() => {
      setLiveTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [userHabits]);

  useEffect(() => {
    if (currentUser) {
      setUserHabits(getUserHabits(currentUser.id));
    }
  }, [currentUser, habitRefreshKey]);

  const plan = currentUser ? getPlanForUser(currentUser.id) : null;
  const userLogs = currentUser ? getUserLogs(currentUser.id) : [];

  // Active workout day
  const activeDay = plan?.days.find((d) => !d.isRestDay) || plan?.days[0];
  const nextDay = plan?.days.find((d) => d.id !== activeDay?.id && !d.isRestDay) || activeDay;

  // Exercise category icon mapper
  const getExerciseIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('bench') || n.includes('press') || n.includes('chest')) {
      return <Dumbbell className="w-4 h-4 text-[#ff6b00]" />;
    }
    if (n.includes('lat') || n.includes('row') || n.includes('pull')) {
      return <Layers className="w-4 h-4 text-cyan-400" />;
    }
    if (n.includes('curl') || n.includes('triceps') || n.includes('arm') || n.includes('wrist')) {
      return <Target className="w-4 h-4 text-amber-400" />;
    }
    if (n.includes('shoulder') || n.includes('delt') || n.includes('raise')) {
      return <Shield className="w-4 h-4 text-purple-400" />;
    }
    if (n.includes('squat') || n.includes('leg') || n.includes('quad') || n.includes('hamstring') || n.includes('calf')) {
      return <Zap className="w-4 h-4 text-emerald-400" />;
    }
    return <Activity className="w-4 h-4 text-[#ff6b00]" />;
  };

  // 100% Dynamic Time-of-Day Greeting & Motivational Cue Engine
  const { greeting, motivationalQuote } = useMemo(() => {
    const hour = new Date().getHours();
    const todayStr = new Date().toISOString().split('T')[0];
    const hasLoggedToday = userLogs.some((l) => l.date === todayStr);

    let greet = 'Good morning,';
    let quotes = [
      'Attack the morning, win the day ☀️',
      'First fuel, then fury. Let\'s get to work ⚡',
      'Early hours build championship discipline.',
      'Wake up with intent, train with purpose 🎯'
    ];

    if (hour >= 5 && hour < 12) {
      greet = 'Good morning,';
      quotes = [
        'Attack the morning, win the day ☀️',
        'First fuel, then fury. Let\'s get to work ⚡',
        'Early hours build championship discipline.',
        'Wake up with intent, train with purpose 🎯'
      ];
    } else if (hour >= 12 && hour < 17) {
      greet = 'Good afternoon,';
      quotes = [
        'Peak energy window. Time to move iron ⚡',
        'Turn afternoon momentum into muscle gains 🦾',
        'Midday intensity. Lock in and execute.',
        'No slacking on the grind. Let\'s dominate 🔥'
      ];
    } else if (hour >= 17 && hour < 22) {
      greet = 'Good evening,';
      quotes = [
        'Unleash the daily pressure in the weightroom 🔥',
        'Finish the day stronger than you started 🎯',
        'Prime evening session loading. Lock in.',
        'Discipline tonight sets up tomorrow\'s triumph ⚡'
      ];
    } else {
      greet = 'Late night focus,';
      quotes = [
        'Quiet hours, loudest progress 🌙',
        'While others sleep, champions build silently ⚡',
        'Late night iron therapy. Let\'s finish strong.',
        'Complete the protocol, recover deep, conquer tomorrow.'
      ];
    }

    if (hasLoggedToday) {
      return {
        greeting: greet,
        motivationalQuote: 'Session crushed today! 🏆 Great recovery & hydration ahead.'
      };
    }

    if (activeDay?.isRestDay) {
      return {
        greeting: greet,
        motivationalQuote: 'Scheduled Rest Day 🧘 Grow, repair, and recharge for the next session.'
      };
    }

    // Pick deterministic quote based on day of month to rotate daily
    const dayOfMonth = new Date().getDate();
    const quote = quotes[dayOfMonth % quotes.length];

    return {
      greeting: greet,
      motivationalQuote: quote
    };
  }, [userLogs, activeDay]);

  // 100% Dynamic Weekly Calculations (No static dummy data)
  const now = new Date();
  const currentWeekKey = getISOWeekKey(now.toISOString().split('T')[0]);
  
  // 1. Logs completed in the current calendar week
  const thisWeekLogs = userLogs.filter((l) => getISOWeekKey(l.date) === currentWeekKey);
  
  // 2. Weekly Target Sessions (From assigned workout plan, e.g. 4 days/week)
  const weeklyTargetSessions = plan?.daysPerWeek || plan?.days.filter(d => !d.isRestDay).length || 4;
  const completedSessions = thisWeekLogs.length;
  
  // 3. Weekly Completion Percentage
  const progressPercent = Math.min(100, Math.round((completedSessions / weeklyTargetSessions) * 100));

  // 4. Dynamic Exercises Count (Target in routine vs Completed this week)
  const targetExercisesThisWeek = plan?.days.reduce((acc, d) => acc + (d.isRestDay ? 0 : d.exercises.length), 0) || 16;
  const completedExercisesThisWeek = thisWeekLogs.reduce((acc, l) => acc + l.completedExercises.length, 0);

  // 5. Dynamic Weight Change Analysis
  const weightLogs = useMemo(() => (currentUser ? getSavedWeightLogs(currentUser.id) : []), [currentUser?.id]);
  const weightAnalysis = useMemo(
    () => calculateDynamicWeightChange(weightLogs, currentUser?.weightKg || 70),
    [weightLogs, currentUser?.weightKg]
  );

  // 6. Dynamic Calendar Strip (Evaluates real workout logs + habits adherence for each day)
  const calendarDays = useMemo(() => {
    const daysArr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const curr = new Date();
    const todayStr = curr.toISOString().split('T')[0];

    // Get Monday of current week
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - distanceToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const hasWorkoutLog = userLogs.some((l) => l.date === dateStr);
      const habitsStatus = currentUser 
        ? getHabitsAdherenceForDate(currentUser.id, userHabits, dateStr)
        : { completedCount: 0, totalCount: 0, isAllCompleted: true, hasPartial: false };

      const isToday = dateStr === todayStr;

      // Scheduled rest day check (i: 0 = Mon, ..., 6 = Sun)
      const scheduledDay = plan?.days?.[i];
      const isScheduledRestDay = scheduledDay ? scheduledDay.isRestDay || scheduledDay.exercises.length === 0 : false;

      let status: 'full_complete' | 'partial' | 'today' | 'upcoming' = 'upcoming';

      if (isScheduledRestDay && !hasWorkoutLog) {
        // Scheduled rest day: full complete if all habits are completed
        if (habitsStatus.isAllCompleted) {
          status = 'full_complete';
        } else if (habitsStatus.hasPartial) {
          status = 'partial';
        } else if (isToday) {
          status = 'today';
        } else {
          status = 'upcoming';
        }
      } else {
        // Scheduled workout day (or workout was logged):
        if (hasWorkoutLog && habitsStatus.isAllCompleted) {
          status = 'full_complete'; // Both Workout & Habits fully done!
        } else if (hasWorkoutLog || habitsStatus.isAllCompleted || habitsStatus.hasPartial) {
          status = 'partial'; // Partial completion (Workout only OR Habits only)
        } else if (isToday) {
          status = 'today';
        } else {
          status = 'upcoming';
        }
      }

      return {
        day: daysArr[d.getDay()],
        date: d.getDate(),
        dateStr,
        isToday,
        status
      };
    });
  }, [userLogs, userHabits, currentUser?.id, habitRefreshKey, plan?.days]);

  if (!currentUser) return null;

  // If live workout mode is active
  if (activeSessionDay && plan) {
    return (
      <LiveWorkoutSession
        plan={plan}
        day={activeSessionDay}
        onExit={() => setActiveSessionDay(null)}
        onSessionCompleted={() => {
          setActiveSessionDay(null);
          onNavigateToHistory();
        }}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4 pb-28 px-0">
      
      {/* 1. Hero Greeting Section with Glowing Concentric Background Rings */}
      <div className="relative p-5 rounded-3xl bg-[#111218] border border-[#212330] overflow-hidden shadow-xl">
        {/* Glowing Concentric Rings Effect in Top-Right */}
        <div className="absolute -top-12 -right-12 w-64 h-64 pointer-events-none opacity-40">
          <div className="absolute inset-0 rounded-full border border-[#ff6b00]/30 animate-pulse" />
          <div className="absolute inset-6 rounded-full border border-[#ff6b00]/20" />
          <div className="absolute inset-14 rounded-full border border-[#ff6b00]/10" />
          <div className="absolute inset-0 rounded-full bg-radial from-[#ff6b00]/15 to-transparent blur-xl" />
        </div>

        <div className="relative z-10">
          <span className="text-xl font-bold text-zinc-300 block tracking-tight">
            {greeting}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
            <span className="text-[#ff6b00] drop-shadow-[0_0_24px_rgba(255,107,0,0.4)]">
              {currentUser.name}
            </span>
          </h1>
          <p className="text-xs text-zinc-300 mt-1.5 font-medium flex items-center gap-1.5">
            <span>{motivationalQuote}</span>
          </p>
        </div>

        {/* 2. Weekly Progress Integrated Directly into Hero Card (100% Dynamic Math) */}
        <div className="mt-5 pt-4 border-t border-[#1e202c]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>Weekly Progress</span>
            </span>
            <button
              onClick={onNavigateToHistory}
              className="text-[11px] font-bold text-[#ff6b00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>See analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Circular SVG Ring */}
            <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#1a1b26]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#ff6b00] transition-all duration-1000 ease-out"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black font-numeric text-white leading-none">
                  {progressPercent}%
                </span>
                <span className="text-[7px] font-mono uppercase text-zinc-400 mt-0.5 font-bold">
                  Workouts
                </span>
              </div>
            </div>

            {/* Stats Breakdown (100% Real Dynamic Calculations) */}
            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 px-3 rounded-2xl bg-[#09090b]/90 border border-[#1e202c]">
                <span className="text-zinc-400 text-[11px] font-medium">Sessions</span>
                <span className="font-mono font-bold text-white text-[11px]">
                  <span className="text-[#ff6b00]">{completedSessions}</span> / {weeklyTargetSessions}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 px-3 rounded-2xl bg-[#09090b]/90 border border-[#1e202c]">
                <span className="text-zinc-400 text-[11px] font-medium">Exercises</span>
                <span className="font-mono font-bold text-white text-[11px]">
                  <span className="text-zinc-200">{completedExercisesThisWeek}</span> / {targetExercisesThisWeek}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 px-3 rounded-2xl bg-[#09090b]/90 border border-[#1e202c]">
                <span className="text-zinc-400 text-[11px] font-medium">Body Weight</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="font-bold text-[#ff6b00]">{weightAnalysis.currentWeightKg} kg</span>
                  {weightAnalysis.recentWeeklyDeltaKg !== 0 ? (
                    <span className={`text-[10px] font-bold ${
                      weightAnalysis.hasDecreased ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      ({weightAnalysis.recentWeeklyDeltaKg > 0 ? `+${weightAnalysis.recentWeeklyDeltaKg}` : weightAnalysis.recentWeeklyDeltaKg}kg)
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-normal">Steady</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Training Calendar Strip */}
      <div className="p-4 rounded-3xl bg-[#111218] border border-[#212330] shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white tracking-tight">
            Training Calendar
          </h3>
          <button
            onClick={onNavigateToSplit}
            className="text-xs font-semibold text-[#ff6b00] hover:underline flex items-center gap-1"
          >
            <span>See full calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 7-Day Horizontal Row */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((item, i) => {
            const isToday = item.isToday;
            const isFullComplete = item.status === 'full_complete';
            const isPartial = item.status === 'partial';

            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all ${
                  isToday
                    ? 'bg-[#ff6b00] text-white shadow-lg shadow-[#ff6b00]/30 scale-105'
                    : 'bg-[#09090b] border border-[#1e202c] text-zinc-300'
                }`}
              >
                <span className={`text-[9px] font-mono font-bold uppercase ${isToday ? 'text-white' : 'text-zinc-400'}`}>
                  {item.day}
                </span>
                <span className={`text-sm font-extrabold font-numeric mt-0.5 ${isToday ? 'text-white' : 'text-zinc-100'}`}>
                  {item.date}
                </span>

                {/* Status Dot / Checkmark */}
                <div className="mt-1.5 flex items-center justify-center">
                  {isFullComplete ? (
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
                      isToday 
                        ? 'bg-white text-emerald-600' 
                        : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                    }`}>
                      <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                    </div>
                  ) : isPartial ? (
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-white/30 text-white'
                        : 'bg-[#ff6b00]/15 border border-[#ff6b00]/40 text-[#ff6b00]'
                    }`}>
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : isToday ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-white/30 animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-zinc-700/60" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Main Mobile App Stack: Today's Workout -> Habits -> Progress -> Next */}
      <div className="space-y-4">
        
        {/* Today's Workout Card */}
        <div className="p-5 rounded-3xl bg-[#111218] border border-[#212330] shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0 flex-1 mr-2">
                <h2 className="text-base font-extrabold text-white tracking-tight truncate">
                  {plan ? plan.title : 'Custom Workout Split'}
                </h2>
                <p className="text-xs font-bold text-[#ff6b00] mt-0.5 tracking-wide truncate">
                  {activeDay ? activeDay.dayName : 'Today\'s Session'}
                </p>
              </div>

              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#1a1b26] text-zinc-300 border border-[#2a2d3d] flex-shrink-0">
                {activeDay?.exercises.length || 0} Movements
              </span>
            </div>

            {/* Exercises Preview List (Spacious & Clean Layout) */}
            <div className="space-y-2">
              {activeDay && activeDay.exercises.length > 0 ? (
                activeDay.exercises.slice(0, 6).map((ex, idx) => (
                  <div
                    key={ex.id}
                    onClick={() => setActiveSessionDay(activeDay)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] hover:border-[#35384d] hover:bg-[#14151e] transition-all cursor-pointer group gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Number Badge */}
                      <span className="w-6 h-6 rounded-lg bg-[#161722] text-[#ff6b00] font-mono text-xs font-black flex items-center justify-center flex-shrink-0 border border-[#262838]">
                        {idx + 1}
                      </span>

                      {/* Full Exercise Name with ample space */}
                      <p className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-white truncate">
                        {ex.exerciseName}
                      </p>
                    </div>

                    {/* Clean compact Sets x Reps on far right */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-mono font-medium text-zinc-400">
                        {ex.sets} × {ex.targetReps}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#ff6b00] transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#09090b] text-center text-xs text-zinc-500">
                  No exercises scheduled for today
                </div>
              )}
            </div>
          </div>

          {/* If workout has already been completed today */}
          {(() => {
            const todayDateStr = new Date().toISOString().split('T')[0];
            const todayWorkoutLog = userLogs.find(
              (l) => l.date === todayDateStr && (l.dayId === activeDay?.id || l.dayName === activeDay?.dayName)
            );
            const isTodayWorkoutCompleted = Boolean(todayWorkoutLog);

            if (isTodayWorkoutCompleted && todayWorkoutLog) {
              const mins = Math.round(todayWorkoutLog.durationSeconds / 60);

              return (
                <div className="space-y-2.5 pt-1 border-t border-[#1e202c]">
                  {/* Completed Today Badge Banner */}
                  <div className="p-3 rounded-2xl bg-[#141d1a] border border-emerald-500/30 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">Workout Completed Today</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">✓ Done</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-numeric block truncate">
                          {mins} mins • {todayWorkoutLog.totalVolumeKg.toLocaleString()} kg Volume • {todayWorkoutLog.completedExercises.length} Exercises
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Restart & Delete Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRestartConfirmModal(true)}
                      className="py-3 px-3.5 rounded-2xl btn-orange text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#ff6b00]/20 active:scale-98 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Restart Workout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteLogConfirm(true)}
                      className="py-3 px-3.5 rounded-2xl bg-[#161722] hover:bg-[#202232] border border-[#2e3042] text-zinc-300 hover:text-red-400 hover:border-red-500/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Log</span>
                    </button>
                  </div>
                </div>
              );
            }

            // Check if there is an in-progress draft
            const activeDraft = activeDay ? getActiveWorkoutDraft(currentUser.id, activeDay.id) : null;
            const isDraftInProgress = Boolean(activeDay && hasActiveWorkoutDraft(currentUser.id, activeDay.id));

            if (isDraftInProgress && activeDraft && activeDay) {
              const completedSetsCount = activeDraft.exerciseLogs.reduce(
                (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
                0
              );
              const totalSetsCount = activeDraft.exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0);
              const mins = Math.floor(activeDraft.elapsedSeconds / 60);
              const secs = activeDraft.elapsedSeconds % 60;
              const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

              return (
                <div className="space-y-2.5 pt-1 border-t border-[#1e202c]">
                  <div className="p-3 rounded-2xl bg-[#1c1813] border border-[#ff6b00]/30 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#ff6b00]/20 text-[#ff6b00] border border-[#ff6b00]/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Zap className="w-4 h-4 fill-current" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">Workout In Progress</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#ff6b00]/20 text-[#ff6b00]">⚡ Live</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-numeric block truncate">
                          {completedSetsCount} of {totalSetsCount} Sets Logged • {timeStr} Elapsed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <button
                      onClick={() => setActiveSessionDay(activeDay)}
                      className="py-3.5 px-4 rounded-2xl btn-orange text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff6b00]/25 active:scale-98 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>RESUME WORKOUT</span>
                    </button>

                    <button
                      onClick={() => {
                        clearActiveWorkoutDraft(currentUser.id, activeDay.id);
                        setActiveSessionDay(activeDay);
                        showToast('Started workout fresh from scratch', 'info');
                      }}
                      className="py-3.5 px-3.5 rounded-2xl bg-[#161722] hover:bg-[#202232] border border-[#2e3042] text-zinc-400 hover:text-amber-400 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      title="Reset and start clean"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              activeDay && (
                <button
                  onClick={() => {
                    if (activeDay && plan) {
                      setActiveSessionDay(activeDay);
                    } else {
                      onNavigateToSplit();
                    }
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl btn-orange text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff6b00]/20 active:scale-98 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START WORKOUT</span>
                </button>
              )
            );
          })()}
        </div>

        {/* Right Column: Habits & Weekly Progress */}
        <div className="space-y-4">
          
          {/* Dynamic User Habits Widget */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#111218] border border-[#212330] shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff6b00]" />
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Daily Habits ({userHabits.length})
                </h3>
              </div>
              <button
                onClick={onNavigateToHabits}
                className="text-xs font-semibold text-[#ff6b00] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {userHabits.slice(0, 4).map((habit) => {
                if (habit.type === 'quit') {
                  const qStats = calculateQuitLiveStats(habit);
                  return (
                    <div 
                      key={habit.id}
                      onClick={onNavigateToHabits}
                      className="p-3.5 rounded-2xl border transition-all bg-[#09090b] border-[#1e202c] hover:border-[#35384d] cursor-pointer space-y-2.5 shadow-sm group"
                    >
                      {/* Header: Icon + Title + Stage Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: `${habit.color || '#ff6b00'}18`,
                              borderColor: `${habit.color || '#ff6b00'}40`,
                              borderWidth: '1px',
                              color: habit.color || '#ff6b00'
                            }}
                          >
                            <RenderHabitIcon iconKey={habit.iconKey} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-white truncate group-hover:text-[#ff6b00] transition-colors">
                              {habit.title}
                            </h4>
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <span>🎯</span>
                              <span className="truncate">{habit.quitConfig?.targetDays || 90} Days Goal • {qStats.progressPercentage}%</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 text-zinc-500">
                          <span className="text-[10px] font-mono font-bold text-[#ff6b00]">Live</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#ff6b00] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>

                      {/* Live 4-Unit Counter Grid (Exact match to inside habits tab with live ticking) */}
                      <div className="grid grid-cols-4 gap-1.5 text-center font-numeric">
                        <div className="p-1.5 rounded-xl bg-[#14151f] border border-[#212330]">
                          <span className="text-sm font-extrabold text-white block">{qStats.days}</span>
                          <span className="text-[8px] font-mono uppercase text-zinc-400 block font-bold">Days</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-[#14151f] border border-[#212330]">
                          <span className="text-sm font-extrabold text-white block">{String(qStats.hours).padStart(2, '0')}</span>
                          <span className="text-[8px] font-mono uppercase text-zinc-400 block font-bold">Hours</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-[#14151f] border border-[#212330]">
                          <span className="text-sm font-extrabold text-white block">{String(qStats.minutes).padStart(2, '0')}</span>
                          <span className="text-[8px] font-mono uppercase text-zinc-400 block font-bold">Mins</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-[#14151f] border border-[#212330]">
                          <span className="text-sm font-extrabold text-[#ff6b00] block animate-pulse">{String(qStats.seconds).padStart(2, '0')}</span>
                          <span className="text-[8px] font-mono uppercase text-[#ff6b00] block font-bold">Secs</span>
                        </div>
                      </div>

                      {/* Progress Bar & Impact Footer */}
                      <div className="pt-1.5 border-t border-[#1e202c] flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                        <span className="text-emerald-400 font-bold truncate mr-2">
                          🚫 {qStats.unitsAvoided} {qStats.unitLabel} avoided
                        </span>
                        <span className="text-[#ff6b00] font-mono font-bold flex-shrink-0">
                          💰 {qStats.moneySaved} {qStats.currency} saved
                        </span>
                      </div>
                    </div>
                  );
                }

                const record = getTodayRecordForHabit(currentUser.id, habit);
                const streak = calculateHabitStreak(currentUser.id, habit.id);

                return (
                  <div 
                    key={habit.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      record.completed 
                        ? 'bg-[#18151f] border-[#ff6b00]/30 shadow-sm' 
                        : 'bg-[#09090b] border-[#1e202c]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${habit.color}18`,
                          borderColor: `${habit.color}40`,
                          borderWidth: '1px',
                          color: habit.color
                        }}
                      >
                        <RenderHabitIcon iconKey={habit.iconKey} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-white truncate">{habit.title}</h4>
                          {streak > 0 && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#1c1d27] text-[#ff6b00]">
                              {streak}d
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {habit.type === 'boolean' 
                            ? 'Daily check' 
                            : `Goal: ${habit.targetValue} ${habit.unit}`}
                        </p>
                      </div>
                    </div>

                    {habit.type === 'boolean' ? (
                      <button
                        onClick={() => {
                          const next = !record.completed;
                          setHabitRecord(currentUser.id, habit, next ? 1 : 0, next);
                          setHabitRefreshKey(k => k + 1);
                          if (next) showToast(`Marked "${habit.title}" completed! 🔥`, 'success');
                        }}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                          record.completed
                            ? 'bg-[#ff6b00] text-white shadow-md shadow-[#ff6b00]/25'
                            : 'bg-[#1a1b26] text-zinc-500 border border-[#2a2d3d] hover:text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            const stepSize = habit.targetValue <= 10 ? 0.5 : 10;
                            const next = Math.max(0, habit.targetValue <= 10 ? Math.round((record.value - stepSize) * 10) / 10 : record.value - stepSize);
                            setHabitRecord(currentUser.id, habit, next, next >= habit.targetValue);
                            setHabitRefreshKey(k => k + 1);
                          }}
                          className="w-5 h-5 rounded-md bg-[#161722] text-zinc-400 hover:text-white flex items-center justify-center active:scale-95 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-extrabold font-numeric text-white min-w-[34px] text-center">
                          {record.value}
                        </span>
                        <button
                          onClick={() => {
                            const stepSize = habit.targetValue <= 10 ? 0.5 : 10;
                            const next = habit.targetValue <= 10 ? Math.round((record.value + stepSize) * 10) / 10 : record.value + stepSize;
                            setHabitRecord(currentUser.id, habit, next, next >= habit.targetValue);
                            setHabitRefreshKey(k => k + 1);
                            if (next >= habit.targetValue && record.value < habit.targetValue) {
                              showToast(`Target reached for "${habit.title}"! 🎯`, 'success');
                            }
                          }}
                          className="w-5 h-5 rounded-md bg-[#161722] text-[#ff6b00] hover:bg-[#202230] flex items-center justify-center active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {userHabits.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-500 mb-2">No habits configured yet</p>
                  <button
                    onClick={onNavigateToHabits}
                    className="px-3 py-1 rounded-xl btn-orange text-xs font-bold"
                  >
                    + Add Habit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Next Workout Card */}
          {nextDay && (
            <div className="p-3.5 rounded-3xl bg-[#09090b] border border-[#1e202c] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#14151e] border border-[#252736] flex items-center justify-center text-[#ff6b00]">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                    Next Workout
                  </span>
                  <h4 className="text-xs font-bold text-white mt-0.5">
                    {nextDay.dayName}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-numeric">
                    {nextDay.estimatedMinutes} Mins • {nextDay.targetMuscles.join(', ')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSessionDay(nextDay)}
                className="px-3 py-1.5 rounded-xl bg-[#161722] hover:bg-[#202230] text-xs font-bold text-zinc-200 hover:text-white border border-[#2a2d3d] transition-all"
              >
                Preview
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Restart Workout Confirmation Modal */}
      {showRestartConfirmModal && activeDay && (() => {
        const todayDateStr = new Date().toISOString().split('T')[0];
        const todayWorkoutLog = userLogs.find(
          (l) => l.date === todayDateStr && (l.dayId === activeDay?.id || l.dayName === activeDay?.dayName)
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-[#14151e] border border-[#2e303d] rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ff6b00]/15 border border-[#ff6b00]/30 text-[#ff6b00] flex items-center justify-center mx-auto shadow-inner">
                <RotateCcw className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">Restart Today&apos;s Workout?</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  You already have a logged session for today. How would you like to proceed?
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    if (todayWorkoutLog) {
                      await deleteWorkoutLog(todayWorkoutLog.id);
                    }
                    setShowRestartConfirmModal(false);
                    setActiveSessionDay(activeDay);
                    showToast('Previous log deleted. Ready to crush the workout from scratch! 🔥', 'success');
                  }}
                  className="w-full py-3 px-4 rounded-2xl btn-orange text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff6b00]/25"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Old Log & Start Fresh</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRestartConfirmModal(false);
                    setActiveSessionDay(activeDay);
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#1c1d27] hover:bg-[#272938] border border-[#2e303d] text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#ff6b00]" />
                  <span>Start Extra Session (Keep Old Log)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRestartConfirmModal(false)}
                  className="w-full py-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 cursor-pointer pt-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Today's Log Confirmation Modal */}
      {showDeleteLogConfirm && activeDay && (() => {
        const todayDateStr = new Date().toISOString().split('T')[0];
        const todayWorkoutLog = userLogs.find(
          (l) => l.date === todayDateStr && (l.dayId === activeDay?.id || l.dayName === activeDay?.dayName)
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-[#14151e] border border-[#2e303d] rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">Delete Today&apos;s Workout Log?</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Are you sure you want to remove today&apos;s workout log from your history? Your streak and stats will be updated.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteLogConfirm(false)}
                  className="py-2.5 px-3 rounded-xl bg-[#1c1d27] border border-[#2e303d] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (todayWorkoutLog) {
                      await deleteWorkoutLog(todayWorkoutLog.id);
                      showToast('Today\'s workout log removed from history! 🗑️', 'info');
                    }
                    setShowDeleteLogConfirm(false);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black cursor-pointer shadow-md shadow-red-600/30"
                >
                  Delete Log
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
