'use client';
import React, { useState } from 'react';
import { ChevronDown, Clock, Plus, Copy, Trash2 } from 'lucide-react';
import { DietFoodItemCard } from './DietFoodItemCard';

export const DietMealCard = ({
  meal,
  index,
  totalMealsCount,
  isCollapsed,
  expandedItemIds,
  onToggleCollapse,
  onToggleItemExpand,
  onUpdateMeal,
  onDuplicateMeal,
  onRemoveMeal,
  onOpenFoodSearch,
  onUpdateItemGrams,
  onRemoveItem,
  onOpenAltSearch,
  onUpdateAltGrams,
  onRemoveAlt
}) => {
    const [showMealPercentage, setShowMealPercentage] = useState(false);

    const mealCals = (meal.items || []).reduce((sum, i) => sum + (i.calories || 0), 0);
    const mealP = Math.round((meal.items || []).reduce((sum, i) => sum + (i.proteinG || 0), 0) * 10) / 10;
    const mealC = Math.round((meal.items || []).reduce((sum, i) => sum + (i.carbsG || 0), 0) * 10) / 10;
    const mealF = Math.round((meal.items || []).reduce((sum, i) => sum + (i.fatsG || 0), 0) * 10) / 10;

    // Macro energy percentage calculations
    const pCal = mealP * 4;
    const cCal = mealC * 4;
    const fCal = mealF * 9;
    const totalCal = pCal + cCal + fCal || mealCals || 1;
    const pPct = Math.round((pCal / totalCal) * 100);
    const cPct = Math.round((cCal / totalCal) * 100);
    const fPct = Math.max(0, 100 - pPct - cPct);

    return (
      <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-slate-700 transition-all overflow-hidden shadow-xs">
        {/* 1. Tiered Header for Mobile & Tablet (< lg only) */}
        <div className="lg:hidden bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] px-2.5 sm:px-3 py-2 space-y-0.5">
          {/* Tier 1 (Main Heading): Left = Meal Name, Right = Calories */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center min-w-0 flex-1 mr-1">
              <input
                type="text"
                value={meal.name}
                onChange={(e) => onUpdateMeal('name', e.target.value)}
                placeholder="Meal Name..."
                className="text-sm sm:text-base font-bold text-white bg-transparent border-b border-transparent focus:border-[var(--main-color)] focus:outline-none px-0.5 py-0.5 truncate flex-1 min-w-[50px]"
              />
            </div>

            <div className="flex items-center gap-1 font-numeric flex-shrink-0">
              <strong className="text-white font-numeric text-sm sm:text-base font-bold tracking-tight">
                {mealCals}
              </strong>
            </div>
          </div>

          {/* Tier 2 (Secondary Subheading): Left = Clean Text Macros (No pill, aligned with name), Right = Time + Copy + Delete */}
          <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
            {/* Left: Clean text macros exactly matching screenshot */}
            <div
              onClick={() => setShowMealPercentage(prev => !prev)}
              className="text-[11px] sm:text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer select-none whitespace-nowrap font-normal"
              title="Click to toggle between Grams (g) and Percentage (%)"
            >
              {showMealPercentage ? (
                <span>Carbs {cPct}% &bull; Fat {fPct}% &bull; Protein {pPct}%</span>
              ) : (
                <span>Carbs {mealC}g &bull; Fat {mealF}g &bull; Protein {mealP}g</span>
              )}
            </div>

            <div className="flex items-center justify-end gap-1 sm:gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-1 text-slate-400 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-1.5 py-0.5 text-[9.5px] sm:text-[10px] font-mono flex-shrink-0">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500 flex-shrink-0"/>
                <input
                  type="text"
                  value={meal.time || ''}
                  onChange={(e) => onUpdateMeal('time', e.target.value)}
                  placeholder="08:30"
                  className="bg-transparent focus:outline-none text-slate-200 w-11 text-center text-[9.5px] sm:text-[10px] font-numeric font-bold"
                />
              </div>

              <button
                type="button"
                onClick={onDuplicateMeal}
                className="p-1 sm:p-1.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-[var(--main-color)] hover:bg-[var(--main-color)]/10 hover:border-[var(--main-color)]/30 transition-all cursor-pointer active:scale-95 flex-shrink-0"
                title="Duplicate Meal"
              >
                <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
              </button>

              {totalMealsCount > 1 && (
                <button
                  type="button"
                  onClick={onRemoveMeal}
                  className="p-1 sm:p-1.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer active:scale-95 flex-shrink-0"
                  title="Delete Meal"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Original Single-Row Header for Laptop & Desktop (lg and above) */}
        <div className="hidden lg:flex px-3 py-2 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] items-center justify-between gap-2 min-w-0">
          {/* Left: Meal Name */}
          <div className="flex items-center min-w-0 flex-1 mr-1">
            <input
              type="text"
              value={meal.name}
              onChange={(e) => onUpdateMeal('name', e.target.value)}
              placeholder="Meal Name..."
              className="text-xs sm:text-sm font-bold text-white bg-transparent border-b border-transparent focus:border-[var(--main-color)] focus:outline-none px-0.5 py-0.5 truncate flex-1 min-w-[50px]"
            />
          </div>

          {/* Center: Meal Macros (Centered, Clickable Grams <-> % Toggle) */}
          <div className="flex-1 flex justify-center min-w-0 px-1">
            <div
              onClick={() => setShowMealPercentage(prev => !prev)}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-lg bg-black/35 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer group select-none shadow-xs active:scale-95 flex-shrink-0"
              title="Click to toggle between Grams (g) and Percentage (%)"
            >
              <strong className="text-white font-numeric text-xs sm:text-[13px] font-bold tracking-tight">
                {mealCals} <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 font-mono">kcal</span>
              </strong>

              {mealCals > 0 && (
                <>
                  <span className="text-slate-600 text-[9px]">&bull;</span>
                  {showMealPercentage ? (
                    <div className="flex items-center gap-1.5 text-[10.5px] sm:text-xs font-mono animate-in fade-in duration-150 text-slate-200">
                      <span><strong className="text-white font-semibold">{pPct}%</strong><span className="text-slate-400 text-[9px] ml-0.5">P</span></span>
                      <span className="text-slate-600">&bull;</span>
                      <span><strong className="text-white font-semibold">{cPct}%</strong><span className="text-slate-400 text-[9px] ml-0.5">C</span></span>
                      <span className="text-slate-600">&bull;</span>
                      <span><strong className="text-white font-semibold">{fPct}%</strong><span className="text-slate-400 text-[9px] ml-0.5">F</span></span>
                      <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--main-color)]/20 border border-[var(--main-color)]/30 text-[var(--main-color)] ml-0.5 uppercase">
                        %
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10.5px] sm:text-xs font-mono animate-in fade-in duration-150 text-slate-200">
                      <span><strong className="text-white font-semibold">{mealP}g</strong><span className="text-slate-400 text-[9px] ml-0.5">P</span></span>
                      <span className="text-slate-600">&bull;</span>
                      <span><strong className="text-white font-semibold">{mealC}g</strong><span className="text-slate-400 text-[9px] ml-0.5">C</span></span>
                      <span className="text-slate-600">&bull;</span>
                      <span><strong className="text-white font-semibold">{mealF}g</strong><span className="text-slate-400 text-[9px] ml-0.5">F</span></span>
                      <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/[0.08] border border-white/10 text-slate-300 ml-0.5">
                        g
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Time + Copy + Delete */}
          <div className="flex items-center justify-end gap-1 sm:gap-1.5 flex-1 min-w-0 flex-shrink-0">
            <div className="flex items-center gap-1 text-slate-400 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-1.5 py-0.5 text-[10px] font-mono flex-shrink-0">
              <Clock className="w-3 h-3 text-slate-500 flex-shrink-0"/>
              <input
                type="text"
                value={meal.time || ''}
                onChange={(e) => onUpdateMeal('time', e.target.value)}
                placeholder="08:30"
                className="bg-transparent focus:outline-none text-slate-200 w-11 text-center text-[10px] font-numeric font-bold"
              />
            </div>

            <button
              type="button"
              onClick={onDuplicateMeal}
              className="p-1 sm:p-1.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-[var(--main-color)] hover:bg-[var(--main-color)]/10 hover:border-[var(--main-color)]/30 transition-all cursor-pointer active:scale-95 flex-shrink-0"
              title="Duplicate Meal"
            >
              <Copy className="w-3.5 h-3.5"/>
            </button>

            {totalMealsCount > 1 && (
              <button
                type="button"
                onClick={onRemoveMeal}
                className="p-1 sm:p-1.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer active:scale-95 flex-shrink-0"
                title="Delete Meal"
              >
                <Trash2 className="w-3.5 h-3.5"/>
              </button>
            )}
          </div>
        </div>

      {/* Meal Food Items List */}
      {!isCollapsed && (<div className="p-2 space-y-1.5 border-t border-[var(--card-border)]/50">
          {(meal.items || []).length === 0 ? (
            <button
              type="button"
              onClick={onOpenFoodSearch}
              className="w-full py-2 px-3 border border-dashed border-[var(--card-border)] hover:border-[var(--main-color)]/50 hover:bg-[var(--main-color)]/5 rounded-lg flex items-center justify-center gap-1.5 text-[clamp(10px,2.4vw,11.5px)] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer active:scale-98"
            >
              <Plus className="w-3.5 h-3.5 text-[var(--main-color)] stroke-[2.5]" />
              <span>Add Food</span>
            </button>
          ) : (
            <div className="space-y-0">
              {meal.items.map((item) => (
                <DietFoodItemCard
                  key={item.id}
                  item={item}
                  mealId={meal.id}
                  isExpanded={Boolean(expandedItemIds[item.id])}
                  onToggleExpand={() => onToggleItemExpand(item.id)}
                  onUpdateGrams={(grams) => onUpdateItemGrams(item.id, grams)}
                  onRemoveItem={() => onRemoveItem(item.id)}
                  onOpenAltSearch={() => onOpenAltSearch(item.id)}
                  onUpdateAltGrams={(altId, grams) => onUpdateAltGrams?.(item.id, altId, grams)}
                  onRemoveAlt={(altId) => onRemoveAlt(item.id, altId)}
                />
              ))}
              <button
                type="button"
                onClick={onOpenFoodSearch}
                className="w-full mt-2 py-1.5 px-2 border border-dashed border-[var(--card-border)] hover:border-[var(--main-color)]/50 hover:bg-[var(--main-color)]/5 rounded-lg flex items-center justify-center gap-1.5 text-[clamp(9.5px,2.4vw,11px)] font-semibold text-slate-400 hover:text-white transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-3 h-3 text-[var(--main-color)] stroke-[2.5]" />
                <span>Add Food</span>
              </button>
            </div>
          )}
        </div>)}
    </div>);
};
