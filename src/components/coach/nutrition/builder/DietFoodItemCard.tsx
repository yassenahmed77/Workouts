'use client';

import React from 'react';
import { ChevronDown, Trash2, X } from 'lucide-react';
import { DietMealItem } from '@/types';
import { VERIFIED_FOOD_DATABASE } from '@/lib/foodDatabase';

interface DietFoodItemCardProps {
  item: DietMealItem;
  mealId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateGrams: (newGrams: number) => void;
  onRemoveItem: () => void;
  onOpenAltSearch: () => void;
  onRemoveAlt: (altId: string) => void;
}

export const DietFoodItemCard: React.FC<DietFoodItemCardProps> = ({
  item,
  isExpanded,
  onToggleExpand,
  onUpdateGrams,
  onRemoveItem,
  onOpenAltSearch,
  onRemoveAlt
}) => {
  const foodRef = VERIFIED_FOOD_DATABASE.find((f) => f.id === item.foodId);
  const altsCount = item.badeel?.length || 0;

  return (
    <div
      data-food-card="true"
      className="p-2 sm:px-3 sm:py-2 rounded-lg bg-[#05080e] border border-[#16202e] hover:border-[#223044] transition-all space-y-2"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-white truncate max-w-[140px] sm:max-w-xs">
            {item.name}
          </span>
          {foodRef && (
            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06] flex-shrink-0">
              {foodRef.preparation === 'cooked' ? 'Cooked' : 'Raw'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Grams Input */}
          <div className="flex items-center gap-1 bg-[#090d14] px-2 py-0.5 rounded-lg border border-[#16202e] focus-within:border-slate-500">
            <input
              type="number"
              min="1"
              step="5"
              value={item.grams || 100}
              onChange={(e) => onUpdateGrams(Math.max(1, Number(e.target.value) || 0))}
              className="w-12 text-center text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
            />
            <span className="text-[9.5px] font-mono text-slate-500">g</span>
          </div>

          {/* Macros */}
          <span className="text-xs font-mono text-slate-300">
            <strong className="text-white font-numeric">{item.calories} kcal</strong> &bull; {item.proteinG}P &bull; {item.carbsG}C &bull; {item.fatsG}F
          </span>

          {/* Badeel Toggle */}
          <button
            type="button"
            onClick={onToggleExpand}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all cursor-pointer flex items-center gap-1 ${
              isExpanded
                ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300 font-bold'
                : altsCount > 0
                ? 'bg-white/[0.04] border-white/[0.1] text-slate-300 hover:text-white'
                : 'bg-[#090d14] border-[#16202e] text-slate-500 hover:text-slate-300'
            }`}
            title="View and configure food alternatives"
          >
            <span>Badeel ({altsCount})</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Remove Food */}
          <button
            type="button"
            onClick={onRemoveItem}
            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
            title="Remove food item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Badeel Section */}
      {isExpanded && (
        <div className="pt-2 border-t border-[#16202e] space-y-1.5 pl-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Approved Food Alternatives (Badeel)
            </span>
            <button
              type="button"
              onClick={onOpenAltSearch}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
            >
              + Add Alternative
            </button>
          </div>

          {item.badeel && item.badeel.length > 0 ? (
            <div className="space-y-1">
              {item.badeel.map((alt) => (
                <div
                  key={alt.id}
                  className="p-1.5 px-2.5 rounded-lg bg-[#090d14] border border-[#16202e] flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-slate-200">{alt.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px]">
                      {alt.calories} kcal &bull; {alt.proteinG}P &bull; {alt.carbsG}C &bull; {alt.fatsG}F
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveAlt(alt.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove alternative"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 font-mono italic">
              No alternative swaps added yet. Click &quot;+ Add Alternative&quot; to give the athlete equivalent options.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
