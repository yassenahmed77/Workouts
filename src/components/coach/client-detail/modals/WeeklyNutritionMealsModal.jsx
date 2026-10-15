'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { dietService } from '@/services/dietService';
import { ObsidianCalendarModal } from '@/components/ui/ObsidianCalendarModal';

const STORAGE_PREFIX_MEALS = 'gym_trainee_meals_v1';

function getLocalDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * WeeklyNutritionMealsModal (Presentation Layer - Atomic Timeline Modal)
 *
 * Visual timeline modal rendering the athlete's assigned meals (1, 2, 3, 4...)
 * with numbered nodes (1, 2, 3, 4), horizontal conduits connecting into cards,
 * macro breakdowns (calories, protein, carbs, fats), and strict status icons:
 * - Consumed: [✓] (Emerald square)
 * - Waiting (Today / Future): [⏱] (Neutral slate square, zero orange!)
 * - Missed (Past Day Unlogged): [✕] (Rose square)
 *
 * Displays prescribed targets vs actual consumed calories and macros.
 * Powered by ObsidianCalendarModal date selector.
 * Rule 2 Compliant (Zero decorative icons - Pure Swiss Typography).
 */
export const WeeklyNutritionMealsModal = ({
  isOpen,
  onClose,
  client,
  assignedDiet,
  selectedDate: propSelectedDate,
  onDateChange
}) => {
  const todayStr = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState(() => propSelectedDate || todayStr);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [completedMealIds, setCompletedMealIds] = useState({});

  // Sync with propSelectedDate if provided
  useEffect(() => {
    if (propSelectedDate) setSelectedDate(propSelectedDate);
  }, [propSelectedDate]);

  // Escape key listener for modal resilience
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Read trainee meal completion state from persistent storage
  useEffect(() => {
    if (!isOpen || !client?.id || typeof window === 'undefined') return;
    const mealsKey = `${STORAGE_PREFIX_MEALS}_${client.id}_${selectedDate}`;
    try {
      const raw = localStorage.getItem(mealsKey);
      setCompletedMealIds(raw ? JSON.parse(raw) : {});
    } catch {
      setCompletedMealIds({});
    }
  }, [isOpen, client?.id, selectedDate]);

  // Fallback athlete meals if coach hasn't set custom meals yet
  const mealsList = useMemo(() => {
    if (assignedDiet?.meals && assignedDiet.meals.length > 0) {
      return assignedDiet.meals;
    }
    const cal = assignedDiet?.targetCalories || 2200;
    const p = assignedDiet?.targetProteinG || 160;
    const c = assignedDiet?.targetCarbsG || 240;
    const f = assignedDiet?.targetFatsG || 60;
    return [
      {
        id: 'meal-breakfast',
        name: 'Breakfast',
        time: '08:30 AM',
        items: [
          {
            name: 'Whole Eggs & Rolled Oats Bowl',
            quantity: '3 Whole Eggs + 70g Oats',
            calories: Math.round(cal * 0.25),
            proteinG: Math.round(p * 0.25),
            carbsG: Math.round(c * 0.25),
            fatsG: Math.round(f * 0.25)
          }
        ]
      },
      {
        id: 'meal-lunch',
        name: 'Lunch',
        time: '01:30 PM',
        items: [
          {
            name: 'Grilled Chicken Breast & Basmati Rice',
            quantity: '180g Chicken + 200g Rice',
            calories: Math.round(cal * 0.35),
            proteinG: Math.round(p * 0.35),
            carbsG: Math.round(c * 0.35),
            fatsG: Math.round(f * 0.3)
          }
        ]
      },
      {
        id: 'meal-pre-workout',
        name: 'Pre-Workout Snack',
        time: '05:00 PM',
        items: [
          {
            name: 'Banana & Rice Cakes with Peanut Butter',
            quantity: '1 Banana + 3 Rice Cakes + 15g PB',
            calories: Math.round(cal * 0.15),
            proteinG: Math.round(p * 0.15),
            carbsG: Math.round(c * 0.2),
            fatsG: Math.round(f * 0.15)
          }
        ]
      },
      {
        id: 'meal-dinner',
        name: 'Dinner & Recovery',
        time: '09:00 PM',
        items: [
          {
            name: 'Cottage Cheese (Gebna Areesh) & Toast',
            quantity: '200g Cheese + 1 Toast + Greens',
            calories: Math.round(cal * 0.25),
            proteinG: Math.round(p * 0.25),
            carbsG: Math.round(c * 0.2),
            fatsG: Math.round(f * 0.3)
          }
        ]
      }
    ];
  }, [assignedDiet]);

  // Compute status & macros per meal node
  const mealNodes = useMemo(() => {
    const isPastDate = selectedDate < todayStr;

    return mealsList.map((meal, idx) => {
      const mealNumber = idx + 1;
      const isConsumed = Boolean(completedMealIds[meal.id]);
      const status = isConsumed ? 'completed' : isPastDate ? 'missed' : 'waiting';

      const macros = dietService.calculateMealMacros(meal);

      return {
        mealNumber,
        mealId: meal.id,
        mealName: meal.name || `Meal ${mealNumber}`,
        time: meal.time,
        items: meal.items || [],
        status,
        isConsumed,
        calories: macros.calories,
        proteinG: macros.proteinG,
        carbsG: macros.carbsG,
        fatsG: macros.fatsG
      };
    });
  }, [mealsList, completedMealIds, selectedDate, todayStr]);

  // Aggregate daily consumed vs prescribed targets
  const dailyTelemetry = useMemo(() => {
    const targetCalories = assignedDiet?.targetCalories || 2200;
    const targetProteinG = assignedDiet?.targetProteinG || 160;
    const targetCarbsG = assignedDiet?.targetCarbsG || 240;
    const targetFatsG = assignedDiet?.targetFatsG || 60;

    const consumedCalories = mealNodes
      .filter((m) => m.status === 'completed')
      .reduce((sum, m) => sum + m.calories, 0);

    const consumedProteinG = mealNodes
      .filter((m) => m.status === 'completed')
      .reduce((sum, m) => sum + m.proteinG, 0);

    const consumedCarbsG = mealNodes
      .filter((m) => m.status === 'completed')
      .reduce((sum, m) => sum + m.carbsG, 0);

    const consumedFatsG = mealNodes
      .filter((m) => m.status === 'completed')
      .reduce((sum, m) => sum + m.fatsG, 0);

    const caloriesPct = targetCalories > 0 ? Math.min(100, Math.round((consumedCalories / targetCalories) * 100)) : 0;
    const proteinPct = targetProteinG > 0 ? Math.min(100, Math.round((consumedProteinG / targetProteinG) * 100)) : 0;
    const carbsPct = targetCarbsG > 0 ? Math.min(100, Math.round((consumedCarbsG / targetCarbsG) * 100)) : 0;
    const fatsPct = targetFatsG > 0 ? Math.min(100, Math.round((consumedFatsG / targetFatsG) * 100)) : 0;

    const consumedMealsCount = mealNodes.filter((m) => m.status === 'completed').length;
    const missedMealsCount = mealNodes.filter((m) => m.status === 'missed').length;
    const waitingMealsCount = mealNodes.filter((m) => m.status === 'waiting').length;

    return {
      targetCalories,
      targetProteinG,
      targetCarbsG,
      targetFatsG,
      consumedCalories,
      consumedProteinG: Math.round(consumedProteinG * 10) / 10,
      consumedCarbsG: Math.round(consumedCarbsG * 10) / 10,
      consumedFatsG: Math.round(consumedFatsG * 10) / 10,
      caloriesPct,
      proteinPct,
      carbsPct,
      fatsPct,
      consumedMealsCount,
      missedMealsCount,
      waitingMealsCount,
      totalMeals: mealNodes.length
    };
  }, [assignedDiet, mealNodes]);

  if (!isOpen) return null;

  const handlePrevDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] - 1);
    const newDate = getLocalDateString(d);
    setSelectedDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const handleNextDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + 1);
    const newDate = getLocalDateString(d);
    setSelectedDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const isSelectedToday = selectedDate === todayStr;

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
          <div className="px-3 pt-2.5 pb-2 sm:px-3.5 sm:pt-3 sm:pb-2.5 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex flex-col gap-2 flex-shrink-0">
            {/* MOBILE ONLY (<sm): 3-Row Stacked Clean Header */}
            <div className="flex flex-col gap-2 w-full sm:hidden">
              {/* Row 1: Centered Title + Right Close '✕' Button (No Dot) */}
              <div className="relative flex items-center justify-center w-full min-h-[28px]">
                <span className="gym-label-mono font-bold tracking-wider text-[11px] text-center text-slate-300">
                  DAILY NUTRITION PIPELINE
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

              {/* Row 2: Athlete & Meals Eaten (Centered, Full Width, Zero Breaks) */}
              <div className="w-full text-center">
                <h3 className="gym-heading-section text-white text-xs font-bold truncate whitespace-nowrap block w-full text-center">
                  {client.name} &bull; {dailyTelemetry.consumedMealsCount}/{dailyTelemetry.totalMeals} Meals Eaten
                  {dailyTelemetry.missedMealsCount > 0 && (
                    <span className="text-rose-400 font-mono text-[11px] ml-1.5 font-normal">
                      ({dailyTelemetry.missedMealsCount} Missed)
                    </span>
                  )}
                </h3>
              </div>

              {/* Row 3: Stretched Day Navigator Bar Across Entire Width */}
              <div className="w-full flex items-center gap-1.5 font-mono">
                <div className="flex-1 flex items-center justify-between bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    className="text-slate-400 hover:text-white px-2 py-0.5 font-bold text-xs cursor-pointer active:scale-95 transition-transform"
                    title="Previous day"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(true)}
                    className="text-[11px] text-slate-200 px-2 font-semibold flex items-center gap-1 cursor-pointer hover:text-[var(--main-color)] transition-colors"
                    title="Pick date from calendar"
                  >
                    <span>{isSelectedToday ? 'Today' : selectedDate}</span>
                    <span className="text-[9px] text-[var(--main-color)] font-mono font-bold">&bull; CAL</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="text-slate-400 hover:text-white px-2 py-0.5 font-bold text-xs cursor-pointer active:scale-95 transition-transform"
                    title="Next day"
                  >
                    &rarr;
                  </button>
                </div>
                {!isSelectedToday && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(todayStr);
                      if (onDateChange) onDateChange(todayStr);
                    }}
                    className="text-[10px] px-2.5 py-1.5 rounded-lg bg-[var(--main-color)]/20 text-[var(--main-color)] border border-[var(--main-color)]/30 font-bold hover:bg-[var(--main-color)]/30 transition-colors cursor-pointer flex-shrink-0"
                    title="Jump to today"
                  >
                    Today
                  </button>
                )}
              </div>
            </div>

            {/* DESKTOP & TABLET ONLY (sm+): Completely Locked & Untouched Layout */}
            <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-2 w-full">
              <div className="min-w-0">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="gym-label-mono font-bold tracking-wider">
                    DAILY NUTRITION PIPELINE
                  </span>
                  <span className="text-slate-600 text-xs">&bull;</span>
                  <span className="text-[10px] font-mono text-[var(--main-color)] font-semibold">
                    {assignedDiet?.planName || 'Prescribed Protocol'}
                  </span>
                </div>
                <h3 className="gym-heading-section text-white mt-0.5 truncate">
                  {client.name} &bull; {dailyTelemetry.consumedMealsCount}/{dailyTelemetry.totalMeals} Meals Eaten
                  {dailyTelemetry.missedMealsCount > 0 && (
                    <span className="text-rose-400 font-mono text-xs ml-2 font-normal">
                      ({dailyTelemetry.missedMealsCount} Missed)
                    </span>
                  )}
                </h3>
              </div>

              {/* Day Navigator & Calendar Trigger */}
              <div className="flex items-center gap-1.5 font-mono">
                <div className="flex items-center bg-black/40 border border-white/[0.1] rounded-md px-1 py-0.5">
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    className="text-slate-400 hover:text-white px-1.5 font-bold text-xs cursor-pointer"
                    title="Previous day"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(true)}
                    className="text-[10px] text-slate-200 px-1 font-semibold flex items-center gap-1 cursor-pointer hover:text-[var(--main-color)] transition-colors"
                    title="Pick date from calendar"
                  >
                    <span>{isSelectedToday ? 'Today' : selectedDate}</span>
                    <span className="text-[8px] text-[var(--main-color)] font-mono">&bull; CAL</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="text-slate-400 hover:text-white px-1.5 font-bold text-xs cursor-pointer"
                    title="Next day"
                  >
                    &rarr;
                  </button>
                </div>
                {!isSelectedToday && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(todayStr);
                      if (onDateChange) onDateChange(todayStr);
                    }}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--main-color)]/20 text-[var(--main-color)] border border-[var(--main-color)]/30 font-bold hover:bg-[var(--main-color)]/30 transition-colors cursor-pointer"
                    title="Jump to today"
                  >
                    Today
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="gym-btn-secondary gym-btn-sm font-mono text-xs ml-1"
                  title="Close modal (Esc)"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Daily Macros Target vs Consumed Strip (Equal top & bottom margins) */}
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/[0.06] text-center font-mono">
              <div className="bg-black/30 border border-white/[0.06] rounded-lg p-1.5">
                <span className="text-[8px] text-slate-400 block uppercase">Calories</span>
                <span className="text-xs font-bold text-white block">
                  {dailyTelemetry.consumedCalories}
                  <span className="text-[9px] text-slate-400 font-normal"> / {dailyTelemetry.targetCalories}</span>
                </span>
                <span className="text-[8px] text-[var(--main-color)] block">
                  {dailyTelemetry.caloriesPct}%
                </span>
              </div>

              <div className="bg-black/30 border border-white/[0.06] rounded-lg p-1.5">
                <span className="text-[8px] text-slate-400 block uppercase">Protein</span>
                <span className="text-xs font-bold text-emerald-400 block">
                  {dailyTelemetry.consumedProteinG}g
                  <span className="text-[9px] text-slate-400 font-normal"> / {dailyTelemetry.targetProteinG}g</span>
                </span>
                <span className="text-[8px] text-emerald-400/80 block">
                  {dailyTelemetry.proteinPct}%
                </span>
              </div>

              <div className="bg-black/30 border border-white/[0.06] rounded-lg p-1.5">
                <span className="text-[8px] text-slate-400 block uppercase">Carbs</span>
                <span className="text-xs font-bold text-amber-400 block">
                  {dailyTelemetry.consumedCarbsG}g
                  <span className="text-[9px] text-slate-400 font-normal"> / {dailyTelemetry.targetCarbsG}g</span>
                </span>
                <span className="text-[8px] text-amber-400/80 block">
                  {dailyTelemetry.carbsPct}%
                </span>
              </div>

              <div className="bg-black/30 border border-white/[0.06] rounded-lg p-1.5">
                <span className="text-[8px] text-slate-400 block uppercase">Fats</span>
                <span className="text-xs font-bold text-rose-400 block">
                  {dailyTelemetry.consumedFatsG}g
                  <span className="text-[9px] text-slate-400 font-normal"> / {dailyTelemetry.targetFatsG}g</span>
                </span>
                <span className="text-[8px] text-rose-400/80 block">
                  {dailyTelemetry.fatsPct}%
                </span>
              </div>
            </div>
          </div>

          {/* 2. Timeline Meals Pipeline Container */}
          <div className="px-3 pt-2 pb-3 sm:px-4 sm:pt-2.5 sm:pb-3.5 overflow-y-auto flex-1 custom-scrollbar space-y-2 sm:space-y-2.5">
            {mealNodes.length === 0 ? (
              <div className="gym-card-subtle text-center py-8 space-y-2">
                <span className="gym-heading-card block">
                  No Meals Prescribed
                </span>
                <p className="gym-subtext max-w-xs mx-auto text-xs">
                  Assign a nutrition protocol to this athlete to start tracking their meal pipeline.
                </p>
              </div>
            ) : (
              mealNodes.map((node) => {
                return (
                  <div key={node.mealNumber} className="flex items-center group">
                    {/* Numbered Node Circle (1, 2, 3, 4) - Vertically Centered */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 shadow-md transition-all ${
                        node.status === 'completed'
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 ring-4 ring-emerald-500/10'
                          : node.status === 'missed'
                          ? 'bg-rose-500/15 border-rose-500/50 text-rose-400 ring-4 ring-rose-500/10'
                          : 'bg-[var(--card-subtle-bg)] border-white/15 text-slate-400'
                      }`}
                    >
                      {node.mealNumber}
                    </div>

                    {/* Horizontal Conduit Pipe: From Circle Directly into Meal Card */}
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

                    {/* Branch Card: Meal Details */}
                    <div
                      className={`flex-1 rounded-xl p-2 sm:p-2.5 border transition-all ${
                        node.status === 'completed'
                          ? 'bg-[var(--card-subtle-bg)] border-emerald-500/25 shadow-xs'
                          : node.status === 'missed'
                          ? 'bg-rose-950/15 border-rose-500/25'
                          : 'bg-[var(--bg-main)] border-[var(--card-border)]'
                      }`}
                    >
                      {/* Top Row: Meal Name + Time + Status Box (Strictly Icon Only) */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-baseline gap-2">
                          <h4 className="gym-heading-card text-white truncate text-xs sm:text-sm font-semibold">
                            {node.mealName}
                          </h4>
                          {node.time && (
                            <span className="text-[9px] font-mono text-slate-500">
                              {node.time}
                            </span>
                          )}
                        </div>

                        {/* Status Box: Strictly Icon Only (No Text) */}
                        {node.status === 'completed' ? (
                          <div
                            className="w-6 h-6 rounded-md border border-emerald-500/50 bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shadow-xs select-none flex-shrink-0"
                            title="Consumed"
                          >
                            ✓
                          </div>
                        ) : node.status === 'missed' ? (
                          <div
                            className="w-6 h-6 rounded-md border border-rose-500/50 bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold shadow-xs select-none flex-shrink-0"
                            title="Skipped / Missed"
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

                      {/* Prescribed Food Items snippet */}
                      <div className="mt-1 text-[10px] font-mono text-slate-300 line-clamp-1">
                        {node.items.map((item, i) => (
                          <span key={i}>
                            {item.quantity || item.name}
                            {i < node.items.length - 1 ? ' + ' : ''}
                          </span>
                        ))}
                      </div>

                      {/* Middle Details: Precision Macros Strip */}
                      <div className="mt-1.5 pt-1.5 border-t border-white/[0.06] text-[9px] min-[360px]:text-[9.5px] min-[410px]:text-[10px] sm:text-[11px] font-mono flex items-center justify-between gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        <div className="flex items-center gap-1.5 min-w-0 truncate">
                          <span className="text-white font-semibold">
                            {node.calories} kcal
                          </span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-emerald-400 font-medium">
                            {node.proteinG}g P
                          </span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-amber-400 font-medium">
                            {node.carbsG}g C
                          </span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-rose-400 font-medium">
                            {node.fatsG}g F
                          </span>
                        </div>

                        <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 flex-shrink-0">
                          <span className="session-telemetry-full">
                            {node.status === 'completed'
                              ? 'Logged as eaten'
                              : node.status === 'missed'
                              ? 'Day ended unlogged'
                              : 'Pending trainee check'}
                          </span>
                          <span className="session-telemetry-compact">
                            {node.status === 'completed'
                              ? 'Eaten'
                              : node.status === 'missed'
                              ? 'Unlogged'
                              : 'Pending'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 3. Footer Bar: Contextual Guidance */}
          <div className="px-3 sm:px-4 py-2.5 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between flex-shrink-0 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">
              Daily Target: {dailyTelemetry.targetCalories} kcal &bull; {dailyTelemetry.targetProteinG}g P &bull; {dailyTelemetry.targetCarbsG}g C &bull; {dailyTelemetry.targetFatsG}g F
            </span>

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

      {/* Standalone Obsidian Calendar Picker Modal */}
      <ObsidianCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(dateStr) => {
          setSelectedDate(dateStr);
          if (onDateChange) onDateChange(dateStr);
        }}
      />
    </>
  );
};
