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
}

export const DailyMealsChecklist: React.FC<DailyMealsChecklistProps> = React.memo(({
  dietPlan,
  planMeals,
  completedMealIds,
  onToggleMealCompleted,
  onSelectMealDetail,
  onOpenFullDietModal
}) => {
  const eatenMealsCount = useMemo(() => {
    return planMeals.filter((m) => completedMealIds[m.id]).length;
  }, [planMeals, completedMealIds]);

  const mealsPercentage = useMemo(() => {
    return planMeals.length > 0 ? (eatenMealsCount / planMeals.length) * 100 : 0;
  }, [eatenMealsCount, planMeals.length]);

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#18191e] border border-[#24262e] shadow-lg space-y-3.5">
      {/* Nutrition Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#24262e]/70">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Daily Nutrition</h3>
          <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
            {dietPlan?.title || 'Daily Meal Plan'}
          </span>
        </div>

        <div className="text-right font-mono">
          <span className="text-xs font-bold text-white tabular-nums px-2.5 py-1 rounded-full bg-[#15161a] border border-[#2f80ed]/30 inline-block shadow-sm">
            {dietPlan ? dietPlan.targetCalories.toLocaleString() : '2,350'} <span className="text-[10px] text-[#2f80ed] font-medium">kcal</span>
          </span>
        </div>
      </div>

      {/* Macro Glance Pills (Protein, Carbs, Fats) - Unified Electric Blue Brand Accent */}
      <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
        <div className="p-2 rounded-xl bg-[#141519] border border-[#24262e] hover:border-[#2f80ed]/30 transition-colors">
          <span className="text-[9px] uppercase tracking-wider text-[#2f80ed] font-semibold block">Protein</span>
          <span className="text-xs font-bold text-white tabular-nums mt-0.5 block">
            {dietPlan?.targetProteinG || 155}g
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#141519] border border-[#24262e] hover:border-[#2f80ed]/30 transition-colors">
          <span className="text-[9px] uppercase tracking-wider text-[#2f80ed] font-semibold block">Carbs</span>
          <span className="text-xs font-bold text-white tabular-nums mt-0.5 block">
            {dietPlan?.targetCarbsG || 240}g
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#141519] border border-[#24262e] hover:border-[#2f80ed]/30 transition-colors">
          <span className="text-[9px] uppercase tracking-wider text-[#2f80ed] font-semibold block">Fats</span>
          <span className="text-xs font-bold text-white tabular-nums mt-0.5 block">
            {dietPlan?.targetFatsG || 65}g
          </span>
        </div>
      </div>

      {/* Meals Completion Progress Bar */}
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-300 uppercase tracking-wider font-semibold">Today&apos;s Meals Checklist</span>
          <span className="text-[#2f80ed] font-bold">
            {eatenMealsCount} / {planMeals.length} Completed
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#141519] overflow-hidden">
          <div
            className="h-full bg-[#2f80ed] rounded-full shadow-[0_0_10px_rgba(47,128,237,0.45)] transition-all duration-300"
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
                  ? 'bg-[#2f80ed]/5 border-[#2f80ed]/25 hover:border-[#2f80ed]/40'
                  : 'bg-[#141519] border-[#24262e] hover:border-[#2f80ed]/40'
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
                      ? 'bg-[#2f80ed] text-white border-[#2f80ed] shadow-[0_0_8px_rgba(47,128,237,0.4)]'
                      : 'bg-[#1c1d22] border-zinc-700 hover:border-[#2f80ed]'
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
                <span className="text-[#2f80ed] text-[10px] block font-medium">{mealProtein}g P</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link: Single word 'Diet' in website electric blue accent */}
      <button
        type="button"
        onClick={onOpenFullDietModal}
        className="w-full py-2.5 px-3 rounded-xl bg-[#2f80ed]/10 hover:bg-[#2f80ed]/20 border border-[#2f80ed]/30 hover:border-[#2f80ed]/50 text-center text-xs font-mono text-[#2f80ed] hover:text-white font-bold cursor-pointer transition-all shadow-sm"
      >
        Diet
      </button>
    </div>
  );
});
