'use client';

import React from 'react';
import { ChevronDown, Clock, Plus, Copy, Trash2 } from 'lucide-react';
import { DietMeal } from '@/types';
import { DietFoodItemCard } from './DietFoodItemCard';

interface DietMealCardProps {
  meal: DietMeal;
  index: number;
  totalMealsCount: number;
  isCollapsed: boolean;
  expandedItemIds: Record<string, boolean>;
  onToggleCollapse: () => void;
  onToggleItemExpand: (itemId: string) => void;
  onUpdateMeal: (field: 'name' | 'time', value: string) => void;
  onDuplicateMeal: () => void;
  onRemoveMeal: () => void;
  onOpenFoodSearch: () => void;
  onUpdateItemGrams: (itemId: string, grams: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenAltSearch: (itemId: string) => void;
  onRemoveAlt: (itemId: string, altId: string) => void;
}

export const DietMealCard: React.FC<DietMealCardProps> = ({
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
  onRemoveAlt
}) => {
  const mealCals = (meal.items || []).reduce((sum, i) => sum + (i.calories || 0), 0);
  const mealP = Math.round((meal.items || []).reduce((sum, i) => sum + (i.proteinG || 0), 0) * 10) / 10;
  const mealC = Math.round((meal.items || []).reduce((sum, i) => sum + (i.carbsG || 0), 0) * 10) / 10;
  const mealF = Math.round((meal.items || []).reduce((sum, i) => sum + (i.fatsG || 0), 0) * 10) / 10;

  return (
    <div className="rounded-xl bg-[#080c14] border border-[#141b26] hover:border-[#1e293b] transition-all overflow-hidden shadow-xs">
      {/* Meal Header */}
      <div className="px-2.5 py-1.5 bg-[#090e17] border-b border-[#141b26] flex items-center justify-between gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-0.5 rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex-shrink-0"
            title={isCollapsed ? 'Expand Meal' : 'Collapse Meal'}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
          </button>

          <span className="w-4.5 h-4.5 rounded bg-[#0d131f] border border-[#16202e] text-slate-400 font-mono text-[9.5px] flex items-center justify-center font-bold flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>

          <input
            type="text"
            value={meal.name}
            onChange={(e) => onUpdateMeal('name', e.target.value)}
            placeholder="Meal Name..."
            className="text-xs font-semibold text-white bg-transparent border-b border-transparent focus:border-slate-500 focus:outline-none px-1 py-0.5 truncate min-w-[70px] max-w-[110px] sm:max-w-[140px]"
          />

          <div className="flex items-center gap-1 text-slate-400 bg-[#05080e] border border-[#16202e] rounded-md px-1.5 py-0.5 text-[9.5px] font-mono flex-shrink-0">
            <Clock className="w-2.5 h-2.5 text-slate-500" />
            <input
              type="text"
              value={meal.time || ''}
              onChange={(e) => onUpdateMeal('time', e.target.value)}
              placeholder="08:30 AM"
              className="bg-transparent focus:outline-none text-slate-200 w-14"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Macro Subtotal */}
          <span className="text-[10px] font-mono text-slate-400 bg-[#05080e] border border-[#16202e] px-1.5 py-0.5 rounded-md hidden sm:inline-block">
            <strong className="text-white font-numeric">{mealCals} kcal</strong>
            {mealCals > 0 && <span className="text-slate-500"> &bull; {mealP}P {mealC}C {mealF}F</span>}
          </span>

          {/* + Add Food Action */}
          <button
            type="button"
            onClick={onOpenFoodSearch}
            className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-200 hover:text-white bg-[#0e1626] hover:bg-[#16233b] border border-[#1e2e4a] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="Add Food from library"
          >
            <Plus className="w-3 h-3" />
            <span>Add Food</span>
          </button>

          {/* Duplicate Meal Action */}
          <button
            type="button"
            onClick={onDuplicateMeal}
            className="p-1 rounded-md bg-[#080d16] border border-[#152030] text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all cursor-pointer active:scale-95"
            title="Duplicate Meal"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* Delete Meal Action */}
          {totalMealsCount > 1 && (
            <button
              type="button"
              onClick={onRemoveMeal}
              className="p-1 rounded-md bg-[#080d16] border border-[#152030] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
              title="Delete Meal"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Meal Food Items List */}
      {!isCollapsed && (
        <div className="p-2 space-y-1.5 border-t border-[#141b26]/50">
          {(meal.items || []).length === 0 ? (
            <div className="py-1.5 px-2.5 border border-dashed border-[#16202e] rounded-lg flex items-center justify-between text-[11px] text-slate-500">
              <span>No foods prescribed for this meal.</span>
              <button
                type="button"
                onClick={onOpenFoodSearch}
                className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
              >
                + Prescribe Ingredients
              </button>
            </div>
          ) : (
            meal.items.map((item) => (
              <DietFoodItemCard
                key={item.id}
                item={item}
                mealId={meal.id}
                isExpanded={Boolean(expandedItemIds[item.id])}
                onToggleExpand={() => onToggleItemExpand(item.id)}
                onUpdateGrams={(grams) => onUpdateItemGrams(item.id, grams)}
                onRemoveItem={() => onRemoveItem(item.id)}
                onOpenAltSearch={() => onOpenAltSearch(item.id)}
                onRemoveAlt={(altId) => onRemoveAlt(item.id, altId)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
