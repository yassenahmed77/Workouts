'use client';

import React, { useMemo } from 'react';
import { DietPlan, DietMeal } from '@/types';
import { Check } from 'lucide-react';

interface DailyMealsChecklistProps {
  dietPlan?: DietPlan | null;
  planMeals: DietMeal[];
  completedMealIds: Record<string, boolean>;
  onToggleMealCompleted: (mealId: string) => void;
  onSelectMealDetail: (meal: DietMeal) => void;
  onOpenFullDietModal: () => void;
  onNavigateToDiet?: () => void;
}

export const DailyMealsChecklist: React.FC<DailyMealsChecklistProps> = React.memo(({
  dietPlan,
  planMeals,
  completedMealIds,
  onToggleMealCompleted,
  onSelectMealDetail,
  onOpenFullDietModal,
  onNavigateToDiet
}) => {
  const eatenMealsCount = useMemo(() => {
    return planMeals.filter((m) => completedMealIds[m.id]).length;
  }, [planMeals, completedMealIds]);

  const mealsPercentage = useMemo(() => {
    return planMeals.length > 0 ? (eatenMealsCount / planMeals.length) * 100 : 0;
  }, [eatenMealsCount, planMeals.length]);

  return (
    <div className="gym-card-elevated space-y-3 p-3.5 sm:p-4 rounded-2xl border-[var(--gym-border-base)]">
      {/* Nutrition Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--gym-border-subtle)]">
        <div>
          <h3 className="gym-heading-card">Daily Nutrition</h3>
          <span className="gym-subtext block mt-0.5">
            {dietPlan?.title || 'Daily Meal Plan'}
          </span>
        </div>

        <div className="text-right font-mono">
          <span className="gym-delta-blue">
            {dietPlan ? dietPlan.targetCalories.toLocaleString() : '2,350'} <span className="text-[10px] opacity-80">kcal</span>
          </span>
        </div>
      </div>

      {/* Macro Glance Pills (Protein, Carbs, Fats) */}
      <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
        <div className="gym-card-subtle py-1.5">
          <span className="gym-label-mono text-[var(--main-color)] block">Protein</span>
          <span className="gym-num text-xs text-white mt-0.5 block">
            {dietPlan?.targetProteinG || 155}g
          </span>
        </div>

        <div className="gym-card-subtle py-1.5">
          <span className="gym-label-mono text-[var(--main-color)] block">Carbs</span>
          <span className="gym-num text-xs text-white mt-0.5 block">
            {dietPlan?.targetCarbsG || 240}g
          </span>
        </div>

        <div className="gym-card-subtle py-1.5">
          <span className="gym-label-mono text-[var(--main-color)] block">Fats</span>
          <span className="gym-num text-xs text-white mt-0.5 block">
            {dietPlan?.targetFatsG || 65}g
          </span>
        </div>
      </div>

      {/* Meals Completion Progress Bar */}
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-300 uppercase tracking-wider font-semibold">Today&apos;s Meals Checklist</span>
          <span className="text-[var(--main-color)] font-bold">
            {eatenMealsCount} / {planMeals.length} Completed
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[var(--card-subtle-bg)] overflow-hidden">
          <div
            className="h-full bg-[var(--main-color)] rounded-full shadow-[0_0_10px_rgba(47,128,237,0.45)] transition-all duration-300"
            style={{ width: `${mealsPercentage}%` }}
          />
        </div>
      </div>

      {/* Interactive Meals Checklist */}
      <div className="space-y-1.5">
        {planMeals.map((meal) => {
          const isDone = Boolean(completedMealIds[meal.id]);
          const mealCals = meal.items.reduce((acc, it) => acc + (it.calories || 0), 0) || 450;
          const mealProtein = meal.items.reduce((acc, it) => acc + (it.proteinG || 0), 0) || 35;
          const cleanMealName = meal.name.replace(/^(Meal\s*\d+\s*[-•:]*\s*|\d+[\.\-\)]\s*)/i, '').trim() || meal.name;
          const foodDescription = meal.items.map((i) => i.quantity || i.name).join(', ');

          return (
            <div
              key={meal.id}
              onClick={() => onSelectMealDetail(meal)}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer group active:scale-98 ${
                isDone
                  ? 'bg-[var(--main-color)]/5 border-[var(--main-color)]/25 hover:border-[var(--main-color)]/40'
                  : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] hover:border-[var(--main-color)]/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMealCompleted(meal.id);
                  }}
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                    isDone
                      ? 'bg-[var(--main-color)] text-white border-[var(--main-color)] shadow-[0_0_8px_rgba(47,128,237,0.4)]'
                      : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] hover:border-[var(--main-color)]'
                  }`}
                  aria-label={`Mark ${cleanMealName} as ${isDone ? 'incomplete' : 'completed'}`}
                >
                  {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <span className={`text-xs font-bold block truncate transition-colors ${
                    isDone ? 'text-zinc-400 line-through' : 'text-white'
                  }`}>
                    {cleanMealName}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 block truncate">
                    {meal.time ? `${meal.time} • ` : ''}{foodDescription}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 font-mono text-[11px] tabular-nums">
                <span className="text-zinc-200 block font-semibold">{mealCals} kcal</span>
                <span className="text-[var(--main-color)] text-[10px] block font-medium">{mealProtein}g P</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <button
        type="button"
        onClick={() => {
          if (onNavigateToDiet) onNavigateToDiet();
          else onOpenFullDietModal();
        }}
        className="w-full py-2 px-3 gym-btn-secondary text-xs text-center font-mono cursor-pointer"
      >
        View Full Diet Diary
      </button>
    </div>
  );
});
