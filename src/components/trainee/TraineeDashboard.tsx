'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { WorkoutDay, DietMeal } from '@/types';
import { LiveWorkoutSession } from './LiveWorkoutSession';
import { getISOWeekKey } from '@/lib/progressEngine';
import { getSavedWeightLogs, calculateDynamicWeightChange } from '@/lib/weightEngine';
import { MealDetailModal } from './dashboard/MealDetailModal';
import { FullDietModal } from './dashboard/FullDietModal';
import { RestartWorkoutModal } from './dashboard/RestartWorkoutModal';
import { DeleteLogModal } from './dashboard/DeleteLogModal';
import { HydrationCard } from './dashboard/HydrationCard';
import { DailyHabitsSection } from './dashboard/DailyHabitsSection';
import { DailyMealsChecklist } from './dashboard/DailyMealsChecklist';
import { CalendarStrip } from './dashboard/CalendarStrip';
import { ProtocolReadinessCard } from './dashboard/ProtocolReadinessCard';
import { TodayWorkoutCard } from './dashboard/TodayWorkoutCard';
import { 
  UserHabit,
  getUserHabits,
  getTodayRecordForHabit,
  setHabitRecord,
  calculateHabitStreak,
  calculateQuitLiveStats,
  getHabitsAdherenceForDate,
  calculateDailyAdherenceScore
} from '@/lib/habitsEngine';
import { 
  getActiveWorkoutDraft, 
  hasActiveWorkoutDraft, 
  clearActiveWorkoutDraft,
  clearUnfinishedStatus
} from '@/lib/activeWorkoutEngine';


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
  const { currentUser, getPlanForUser, getUserLogs, deleteWorkoutLog, getDietPlanForUser } = useGym();
  const { showToast } = useToast();

  const [activeSessionDay, setActiveSessionDay] = useState<WorkoutDay | null>(null);
  const [showRestartConfirmModal, setShowRestartConfirmModal] = useState(false);
  const [showDeleteLogConfirm, setShowDeleteLogConfirm] = useState(false);

  // Dynamic Habits state from persistent habitsEngine
  const [userHabits, setUserHabits] = useState<UserHabit[]>(() => (currentUser ? getUserHabits(currentUser.id) : []));
  const [habitRefreshKey, setHabitRefreshKey] = useState(0);


  useEffect(() => {
    if (currentUser) {
      setUserHabits(getUserHabits(currentUser.id));
    }
  }, [currentUser, habitRefreshKey]);

  const plan = currentUser ? getPlanForUser(currentUser.id) : null;
  const userLogs = currentUser ? getUserLogs(currentUser.id) : [];
  const dietPlan = currentUser ? getDietPlanForUser(currentUser.id) : null;

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isSelectedDateToday = selectedDate === todayDateStr;

  // Selected date log (if user logged a workout on that day)
  const selectedDateWorkoutLog = userLogs.find((l) => l.date === selectedDate);
  const isSelectedDateWorkoutCompleted = Boolean(selectedDateWorkoutLog);

  // Day of week index for selectedDate (Monday=0, Tuesday=1 ... Sunday=6)
  const selectedDayIndex = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return (d.getDay() + 6) % 7;
  }, [selectedDate]);

  const scheduledDayForSelectedDate = plan?.days?.[selectedDayIndex] || plan?.days[0];

  // Week key for the selectedDate
  const selectedWeekKey = useMemo(() => getISOWeekKey(selectedDate), [selectedDate]);

  // All logs recorded in the same week as selectedDate
  const currentWeekLogs = useMemo(
    () => userLogs.filter((l) => getISOWeekKey(l.date) === selectedWeekKey),
    [userLogs, selectedWeekKey]
  );

  // All non-rest workout days in trainee's plan
  const planTrainingDays = useMemo(
    () => plan?.days.filter((d) => !d.isRestDay) || [],
    [plan?.days]
  );


  // Completed sessions from trainee's plan this week
  const completedTrainingDaysThisWeek = useMemo(() => {
    return planTrainingDays.filter((sessionDay) =>
      currentWeekLogs.some(
        (l) => l.dayId === sessionDay.id || l.dayName === sessionDay.dayName
      )
    );
  }, [planTrainingDays, currentWeekLogs]);

  // Set of completed day IDs and dayNames for instant lookup
  const completedDayIdentifiersThisWeek = useMemo(() => {
    const set = new Set<string>();
    completedTrainingDaysThisWeek.forEach((d) => {
      set.add(d.id);
      set.add(d.dayName);
    });
    return set;
  }, [completedTrainingDaysThisWeek]);

  // Next pending session in the weekly split (not yet logged this week)
  const nextPendingSession = useMemo(() => {
    return planTrainingDays.find(
      (d) => !completedDayIdentifiersThisWeek.has(d.id) && !completedDayIdentifiersThisWeek.has(d.dayName)
    );
  }, [planTrainingDays, completedDayIdentifiersThisWeek]);

  // Trainee manual session selection override (resets when selectedDate changes)
  const [manualSessionDayId, setManualSessionDayId] = useState<string | null>(null);
  useEffect(() => {
    setManualSessionDayId(null);
  }, [selectedDate]);

  // Rest day manual toggle state per date (YYYY-MM-DD -> boolean)
  const [restDayOverrides, setRestDayOverrides] = useState<Record<string, boolean>>({});

  // Check if selectedDate is a rest day (either manual override or scheduled)
  const isEffectiveRestDay = useMemo(() => {
    if (restDayOverrides[selectedDate] !== undefined) {
      return restDayOverrides[selectedDate];
    }
    const d = plan?.days?.[selectedDayIndex];
    return d ? d.isRestDay || d.exercises.length === 0 : false;
  }, [restDayOverrides, selectedDate, plan?.days, selectedDayIndex]);

  // Daily habits adherence status for selectedDate
  const selectedDateHabitsStatus = useMemo(() => {
    return currentUser
      ? getHabitsAdherenceForDate(currentUser.id, userHabits, selectedDate)
      : { completedCount: 0, totalCount: 0, isAllCompleted: true, hasPartial: false };
  }, [currentUser, userHabits, selectedDate, habitRefreshKey]);

  // Selected date daily adherence score (weighted nesba w tanasob between workout and habits)
  const selectedDateAdherence = useMemo(() => {
    return calculateDailyAdherenceScore(
      selectedDate,
      isSelectedDateWorkoutCompleted,
      isEffectiveRestDay,
      selectedDateHabitsStatus
    );
  }, [
    selectedDate,
    isSelectedDateWorkoutCompleted,
    isEffectiveRestDay,
    selectedDateHabitsStatus
  ]);

  // Active workout day selection:
  // 1. If selected date already has a log, load that logged session.
  // 2. If trainee manually clicked a session in the protocol pool, load that session.
  // 3. If there is a pending session in this week's protocol pool, queue it automatically (prevents repeating completed sessions!).
  // 4. Fallback to scheduled day or first training day.
  const activeDay = useMemo(() => {
    if (isSelectedDateWorkoutCompleted && selectedDateWorkoutLog) {
      return (
        plan?.days.find(
          (d) => d.id === selectedDateWorkoutLog.dayId || d.dayName === selectedDateWorkoutLog.dayName
        ) ||
        scheduledDayForSelectedDate ||
        plan?.days[0]
      );
    }

    if (manualSessionDayId) {
      const manual = plan?.days.find((d) => d.id === manualSessionDayId);
      if (manual) return manual;
    }

    if (nextPendingSession) {
      return nextPendingSession;
    }

    return scheduledDayForSelectedDate || planTrainingDays[0] || plan?.days[0];
  }, [
    isSelectedDateWorkoutCompleted,
    selectedDateWorkoutLog,
    manualSessionDayId,
    nextPendingSession,
    scheduledDayForSelectedDate,
    plan?.days,
    planTrainingDays
  ]);

  // Target exercises count for selectedDate session
  const targetExercisesCount = useMemo(() => {
    if (isEffectiveRestDay) return 0;
    return activeDay?.exercises.length || 0;
  }, [isEffectiveRestDay, activeDay]);

  // Dynamic 7-Day Calendar Strip with Week Offset Navigation
  const { calendarDays, weekHeaderLabel } = useMemo(() => {
    const daysArr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const curr = new Date();

    // Shift by weekOffset weeks
    const baseDate = new Date(curr);
    baseDate.setDate(curr.getDate() + weekOffset * 7);

    // Get Monday of that week
    const dayOfWeek = baseDate.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - distanceToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = weekOffset === 0 
      ? `This Week • ${monthNames[monday.getMonth()]} ${monday.getDate()} - ${sunday.getDate()}`
      : `${monthNames[monday.getMonth()]} ${monday.getDate()} - ${monthNames[sunday.getMonth()]} ${sunday.getDate()}`;

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const hasWorkoutLog = userLogs.some((l) => l.date === dateStr);
      const habitsStatus = currentUser 
        ? getHabitsAdherenceForDate(currentUser.id, userHabits, dateStr)
        : { completedCount: 0, totalCount: 0, isAllCompleted: true, hasPartial: false };

      const isToday = dateStr === todayDateStr;
      const scheduledD = plan?.days?.[i];
      const isDayRest = restDayOverrides[dateStr] !== undefined
        ? restDayOverrides[dateStr]
        : (scheduledD ? scheduledD.isRestDay || scheduledD.exercises.length === 0 : false);

      // Weighted daily adherence calculation ("nesba w tanasob")
      const adherence = calculateDailyAdherenceScore(
        dateStr,
        hasWorkoutLog,
        isDayRest,
        habitsStatus
      );

      const isPast = dateStr < todayDateStr;
      const isFuture = dateStr > todayDateStr;

      return {
        day: daysArr[d.getDay()],
        date: d.getDate(),
        dateStr,
        isToday,
        isPast,
        isFuture,
        score: adherence.score,
        isFullComplete: adherence.isFullComplete,
        isPartial: adherence.hasPartial
      };
    });

    return { calendarDays: days, weekHeaderLabel: label };
  }, [userLogs, userHabits, currentUser?.id, habitRefreshKey, plan?.days, weekOffset, todayDateStr, restDayOverrides]);

  // Today's workout log check (for draft & live state)
  const todayWorkoutLog = userLogs.find(
    (l) => l.date === todayDateStr && (l.dayId === activeDay?.id || l.dayName === activeDay?.dayName)
  );
  const isTodayWorkoutCompleted = Boolean(todayWorkoutLog);

  // In-progress workout draft check
  const activeDraft = activeDay && currentUser ? getActiveWorkoutDraft(currentUser.id, activeDay.id) : null;
  const isDraftInProgress = Boolean(activeDay && currentUser && hasActiveWorkoutDraft(currentUser.id, activeDay.id));

  // Motivational Cue Engine
  const motivationalQuote = useMemo(() => {
    if (selectedDateAdherence.score >= 100) {
      return 'Day 100% completed! Great job, get good rest.';
    }
    if (isEffectiveRestDay) {
      return 'Active rest day. Recover strong and conquer your habits.';
    }
    if (isSelectedDateWorkoutCompleted) {
      return 'Workout crushed! Complete remaining habits to close the day.';
    }
    return "Ready to crush today? Let's get it done.";
  }, [selectedDateAdherence.score, isEffectiveRestDay, isSelectedDateWorkoutCompleted]);


  // Dynamic Weekly Calculations (Memoized for high performance)
  const currentWeekKey = useMemo(() => getISOWeekKey(todayDateStr), [todayDateStr]);
  const thisWeekLogs = useMemo(
    () => userLogs.filter((l) => getISOWeekKey(l.date) === currentWeekKey),
    [userLogs, currentWeekKey]
  );
  const weeklyTargetSessions = useMemo(
    () => plan?.daysPerWeek || plan?.days.filter((d) => !d.isRestDay).length || 4,
    [plan]
  );
  const completedSessions = thisWeekLogs.length;
  const progressPercent = useMemo(
    () => Math.min(100, Math.round((completedSessions / (weeklyTargetSessions || 1)) * 100)),
    [completedSessions, weeklyTargetSessions]
  );

  const targetExercisesThisWeek = useMemo(
    () => plan?.days.reduce((acc, d) => acc + (d.isRestDay ? 0 : d.exercises.length), 0) || 16,
    [plan?.days]
  );
  const completedExercisesThisWeek = useMemo(
    () => thisWeekLogs.reduce((acc, l) => acc + l.completedExercises.length, 0),
    [thisWeekLogs]
  );

  // Dynamic Weight Change Analysis
  const weightLogs = useMemo(() => (currentUser ? getSavedWeightLogs(currentUser.id) : []), [currentUser]);
  const weightAnalysis = useMemo(
    () => calculateDynamicWeightChange(weightLogs, currentUser?.weightKg || 70),
    [weightLogs, currentUser?.weightKg]
  );

  // Quick Water Habit Finder (or default tracker if coach or trainee set a target)
  const waterHabit = useMemo(
    () =>
      userHabits.find(
        (h) =>
          h.iconKey === 'droplets' ||
          h.title.toLowerCase().includes('water') ||
          h.title.toLowerCase().includes('hydration')
      ),
    [userHabits]
  );
  const waterRecord = waterHabit && currentUser ? getTodayRecordForHabit(currentUser.id, waterHabit) : null;
  const currentWaterLiters = waterRecord ? waterRecord.value : 0;

  // Only display if the coach set a water target in the diet plan, or the trainee/coach set a water habit target
  const coachWaterTarget = dietPlan && typeof dietPlan.waterTargetLiters === 'number' && dietPlan.waterTargetLiters > 0
    ? dietPlan.waterTargetLiters
    : null;
  const traineeWaterTarget = waterHabit && typeof waterHabit.targetValue === 'number' && waterHabit.targetValue > 0
    ? waterHabit.targetValue
    : null;

  const hasWaterTarget = Boolean(coachWaterTarget || traineeWaterTarget);
  const targetWaterLiters = coachWaterTarget || traineeWaterTarget || 0;
  const waterPercent = useMemo(
    () => (hasWaterTarget && targetWaterLiters > 0 ? Math.min(100, Math.round((currentWaterLiters / targetWaterLiters) * 100)) : 0),
    [hasWaterTarget, currentWaterLiters, targetWaterLiters]
  );

  const handleWaterStep = useCallback((stepDelta: number) => {
    if (!currentUser) return;
    if (waterHabit) {
      const next = Math.max(0, Math.round((currentWaterLiters + stepDelta) * 10) / 10);
      setHabitRecord(currentUser.id, waterHabit, next, next >= targetWaterLiters);
      setHabitRefreshKey((k) => k + 1);
      if (next >= targetWaterLiters && currentWaterLiters < targetWaterLiters) {
        showToast('Hydration goal achieved for today! 💧', 'success');
      }
    } else {
      showToast(`Water logged: ${(currentWaterLiters + stepDelta).toFixed(1)}L`, 'info');
    }
  }, [currentUser, waterHabit, currentWaterLiters, targetWaterLiters, showToast]);

  // Nutrition Presentation States (Checklist & Modal)
  const [completedMealIds, setCompletedMealIds] = useState<Record<string, boolean>>({});
  const [showFullDietModal, setShowFullDietModal] = useState(false);
  const [selectedMealDetail, setSelectedMealDetail] = useState<DietMeal | null>(null);

  // Plan Meals with Athletic Fallback Structure
  const planMeals: DietMeal[] = useMemo(() => {
    if (dietPlan?.meals && dietPlan.meals.length > 0) {
      return dietPlan.meals;
    }
    const cal = dietPlan?.targetCalories || 2350;
    const p = dietPlan?.targetProteinG || 155;
    const c = dietPlan?.targetCarbsG || 240;
    const f = dietPlan?.targetFatsG || 65;

    return [
      {
        id: 'meal-1',
        name: 'Breakfast',
        time: '08:30 AM',
        items: [
          {
            id: 'item-1',
            name: 'Oats & Whole Eggs',
            quantity: '70g Oats + 3 Eggs',
            calories: Math.round(cal * 0.25),
            proteinG: Math.round(p * 0.25),
            carbsG: Math.round(c * 0.25),
            fatsG: Math.round(f * 0.25),
            swaps: ['4 Egg Whites + 2 Whole Wheat Toast', '1 Scoop Whey + 60g Cream of Rice']
          }
        ]
      },
      {
        id: 'meal-2',
        name: 'Lunch',
        time: '01:30 PM',
        items: [
          {
            id: 'item-2',
            name: 'Grilled Chicken & Basmati Rice',
            quantity: '180g Chicken + 200g Rice',
            calories: Math.round(cal * 0.35),
            proteinG: Math.round(p * 0.35),
            carbsG: Math.round(c * 0.35),
            fatsG: Math.round(f * 0.3),
            swaps: ['200g White Fish / Tilapia', '180g Lean Beef 5%']
          }
        ]
      },
      {
        id: 'meal-3',
        name: 'Pre-Workout Fuel',
        time: '05:30 PM',
        items: [
          {
            id: 'item-3',
            name: 'Banana & Peanut Butter Rice Cakes',
            quantity: '1 Banana + 3 Rice Cakes',
            calories: Math.round(cal * 0.15),
            proteinG: Math.round(p * 0.15),
            carbsG: Math.round(c * 0.2),
            fatsG: Math.round(f * 0.15),
            swaps: ['1 Apple + 25g Almond Butter', '1 Scoop Whey Protein + Berries']
          }
        ]
      },
      {
        id: 'meal-4',
        name: 'Dinner & Recovery',
        time: '09:00 PM',
        items: [
          {
            id: 'item-4',
            name: 'Tuna / Beef & Sweet Potato',
            quantity: '180g Tuna / Beef + 200g Potato',
            calories: Math.round(cal * 0.25),
            proteinG: Math.round(p * 0.25),
            carbsG: Math.round(c * 0.2),
            fatsG: Math.round(f * 0.3),
            swaps: ['200g Cottage Cheese (Gebna Areesh) + Salad', '180g Chicken Breast + Avocado']
          }
        ]
      }
    ];
  }, [dietPlan]);

  const handleToggleMealCompleted = useCallback((mealId: string) => {
    setCompletedMealIds((prev) => {
      const next = !prev[mealId];
      if (next) {
        showToast('Meal logged! Fueling the engine 🔥', 'success');
      }
      return { ...prev, [mealId]: next };
    });
  }, [showToast]);

  const handleToggleHabit = useCallback((habit: UserHabit, nextCompleted: boolean, targetValue: number) => {
    if (!currentUser) return;
    setHabitRecord(currentUser.id, habit, nextCompleted ? targetValue : 0, nextCompleted);
    setHabitRefreshKey((k) => k + 1);
    if (nextCompleted) {
      showToast(`Completed "${habit.title}"`, 'success');
    }
  }, [currentUser, showToast]);

  const handleDeleteAndRestart = useCallback(async () => {
    if (todayWorkoutLog) {
      await deleteWorkoutLog(todayWorkoutLog.id);
    }
    if (activeDay && currentUser) {
      clearActiveWorkoutDraft(currentUser.id, activeDay.id);
      clearUnfinishedStatus(currentUser.id, activeDay.id);
    }
    setShowRestartConfirmModal(false);
    showToast('Previous log deleted. Ready to start fresh!', 'success');
  }, [todayWorkoutLog, deleteWorkoutLog, activeDay, currentUser, showToast]);

  const handleStartExtraSession = useCallback(() => {
    setShowRestartConfirmModal(false);
    setActiveSessionDay(activeDay || null);
  }, [activeDay]);

  const handleConfirmDeleteLog = useCallback(async () => {
    const logToDelete = selectedDateWorkoutLog || todayWorkoutLog;
    if (logToDelete) {
      await deleteWorkoutLog(logToDelete.id);
      showToast('Workout log removed!', 'info');
    }
    setShowDeleteLogConfirm(false);
  }, [selectedDateWorkoutLog, todayWorkoutLog, deleteWorkoutLog, showToast]);

  const handleToggleRestDay = useCallback(() => {
    const nextState = !isEffectiveRestDay;
    setRestDayOverrides((prev) => ({ ...prev, [selectedDate]: nextState }));
    if (nextState) {
      showToast('Rest & Recovery Day 🌙', 'info');
    } else {
      showToast('Active Training Day ⚡', 'info');
    }
  }, [isEffectiveRestDay, selectedDate, showToast]);

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
    <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto space-y-3.5 pb-6 md:pb-8 px-0 select-none animate-in fade-in duration-200">
      
      {/* 1. Dynamic 7-Day Interactive Calendar Strip */}
      <CalendarStrip
        weekHeaderLabel={weekHeaderLabel}
        calendarDays={calendarDays}
        selectedDate={selectedDate}
        onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
        onNextWeek={() => setWeekOffset((prev) => prev + 1)}
        onSelectDate={setSelectedDate}
      />

      {/* 2. Ambient Sunrise Horizon Arc Card (Daily Protocol Readiness) */}
      <ProtocolReadinessCard
        isSelectedDateToday={isSelectedDateToday}
        selectedDate={selectedDate}
        isEffectiveRestDay={isEffectiveRestDay}
        onToggleRestDay={handleToggleRestDay}
        adherenceScore={selectedDateAdherence.score}
        motivationalQuote={motivationalQuote}
        isSelectedDateWorkoutCompleted={isSelectedDateWorkoutCompleted}
        selectedDateWorkoutLog={selectedDateWorkoutLog}
        targetExercisesCount={targetExercisesCount}
        habitsCompletedCount={selectedDateHabitsStatus.completedCount}
        habitsTotalCount={selectedDateHabitsStatus.totalCount}
      />


      {/* 3. Hero Workout Card: Today's Training Protocol */}
      <TodayWorkoutCard
        activeDay={activeDay}
        plan={plan}
        selectedDate={selectedDate}
        todayDateStr={todayDateStr}
        isSelectedDateToday={isSelectedDateToday}
        isEffectiveRestDay={isEffectiveRestDay}
        isSelectedDateWorkoutCompleted={isSelectedDateWorkoutCompleted}
        selectedDateWorkoutLog={selectedDateWorkoutLog}
        isDraftInProgress={isDraftInProgress}
        activeDraft={activeDraft}
        onSelectSessionDay={(day) => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          setActiveSessionDay(day);
        }}
        onNavigateToSplit={onNavigateToSplit}
        onRestartWorkout={() => setShowRestartConfirmModal(true)}
        onDeleteLog={() => setShowDeleteLogConfirm(true)}
        onResumeWorkout={() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          setActiveSessionDay(activeDay || null);
        }}
        onResetDraftAndStartFresh={() => {
          if (activeDay && currentUser) {
            clearActiveWorkoutDraft(currentUser.id, activeDay.id);
            clearUnfinishedStatus(currentUser.id, activeDay.id);
            showToast('Workout draft reset. Ready to start fresh!', 'info');
          }
        }}
        onStartWorkout={() => {
          if (activeDay && plan) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            setActiveSessionDay(activeDay);
          } else {
            onNavigateToSplit();
          }
        }}
      />

      {/* 5. Modern Daily Meals Checklist */}
      <DailyMealsChecklist
        dietPlan={dietPlan}
        planMeals={planMeals}
        completedMealIds={completedMealIds}
        onToggleMealCompleted={handleToggleMealCompleted}
        onSelectMealDetail={setSelectedMealDetail}
        onOpenFullDietModal={() => setShowFullDietModal(true)}
      />

      {/* 6. Quick Hydration Tracker (+250ml Stepper) */}
      <HydrationCard
        hasWaterTarget={hasWaterTarget}
        currentWaterLiters={currentWaterLiters}
        targetWaterLiters={targetWaterLiters}
        waterPercent={waterPercent}
        onWaterStep={handleWaterStep}
      />

      {/* 7. Habits Preview (If Active Habits Exist) */}
      <DailyHabitsSection
        userHabits={userHabits}
        currentUser={currentUser}
        onNavigateToHabits={onNavigateToHabits}
        onToggleHabit={handleToggleHabit}
        calculateQuitLiveStats={calculateQuitLiveStats}
        getTodayRecordForHabit={getTodayRecordForHabit}
        calculateHabitStreak={calculateHabitStreak}
      />

      {/* Individual Meal Details Modal */}
      <MealDetailModal
        meal={selectedMealDetail}
        isDone={Boolean(selectedMealDetail && completedMealIds[selectedMealDetail.id])}
        onClose={() => setSelectedMealDetail(null)}
        onToggleCompleted={handleToggleMealCompleted}
      />

      {/* Full Diet Plan & Swaps (Badeel) Slide-over Modal */}
      <FullDietModal
        isOpen={showFullDietModal}
        dietPlan={dietPlan}
        meals={planMeals}
        onClose={() => setShowFullDietModal(false)}
      />

      {/* Restart Workout Confirmation Modal */}
      <RestartWorkoutModal
        isOpen={showRestartConfirmModal}
        activeDay={activeDay}
        todayWorkoutLog={todayWorkoutLog}
        onClose={() => setShowRestartConfirmModal(false)}
        onDeleteAndRestart={handleDeleteAndRestart}
        onStartExtraSession={handleStartExtraSession}
      />

      {/* Delete Today's Log Confirmation Modal */}
      <DeleteLogModal
        isOpen={showDeleteLogConfirm}
        onClose={() => setShowDeleteLogConfirm(false)}
        onConfirmDelete={handleConfirmDeleteLog}
      />


    </div>
  );
};
