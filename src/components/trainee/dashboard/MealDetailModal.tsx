'use client';

import React from 'react';
import { DietMeal } from '@/types';
import { Clock, X, Repeat, Check } from 'lucide-react';

interface MealDetailModalProps {
  meal: DietMeal | null;
  isDone: boolean;
  onClose: () => void;
  onToggleCompleted: (mealId: string) => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  isDone,
  onClose,
  onToggleCompleted
}) => {
  if (!meal) return null;

  const cleanName = meal.name.replace(/^(Meal\s*\d+\s*[-•:]*\s*|\d+[\.\-\)]\s*)/i, '').trim() || meal.name;
  const totalCals = meal.items.reduce((acc, it) => acc + (it.calories || 0), 0) || 450;
  const totalP = meal.items.reduce((acc, it) => acc + (it.proteinG || 0), 0) || 35;
  const totalC = meal.items.reduce((acc, it) => acc + (it.carbsG || 0), 0) || 45;
  const totalF = meal.items.reduce((acc, it) => acc + (it.fatsG || 0), 0) || 15;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Meal Details: ${cleanName}`}
    >
      <div className="w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-[#18191e] border border-[#24262e] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#24262e] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#2f80ed] uppercase tracking-wider font-bold">
              Meal Details
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight mt-0.5">{cleanName}</h3>
            {meal.time && (
              <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#2f80ed]" />
                <span>{meal.time}</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1d22] border border-[#24262e] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            aria-label="Close meal details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meal Macros Summary Strip */}
        <div className="grid grid-cols-4 gap-1.5 p-3 bg-[#141519] border-b border-[#24262e] text-center font-mono">
          <div className="p-1.5 rounded-xl bg-[#18191e] border border-[#24262e]">
            <span className="text-[9px] uppercase tracking-wider text-[#2f80ed] font-semibold block">Calories</span>
            <span className="text-xs font-bold text-white tabular-nums mt-0.5 block">{totalCals}</span>
          </div>
          <div className="p-1.5 rounded-xl bg-[#18191e] border border-[#24262e]">
            <span className="text-[9px] uppercase tracking-wider text-[#2f80ed] font-semibold block">Protein</span>
            <span className="text-xs font-bold text-white tabular-nums mt-0.5 block">{totalP}g</span>
          </div>
          <div className="p-1.5 rounded-xl bg-[#18191e] border border-[#24262e]">
            <span className="text-[9px] uppercase tracking-wider text-[#2f80ed] font-semibold block">Carbs</span>
            <span className="text-xs font-bold text-white tabular-nums mt-0.5 block">{totalC}g</span>
          </div>
          <div className="p-1.5 rounded-xl bg-[#18191e] border border-[#24262e]">
            <span className="text-[9px] uppercase tracking-wider text-[#2f80ed] font-semibold block">Fats</span>
            <span className="text-xs font-bold text-white tabular-nums mt-0.5 block">{totalF}g</span>
          </div>
        </div>

        {/* Items List & Food Swaps */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 no-scrollbar flex-1">
          {meal.items.map((item) => (
            <div key={item.id} className="p-3.5 rounded-2xl bg-[#141519] border border-[#24262e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{item.name}</span>
                <span className="text-xs font-mono font-semibold text-[#2f80ed] bg-[#2f80ed]/10 px-2.5 py-0.5 rounded-lg border border-[#2f80ed]/25">
                  {item.quantity}
                </span>
              </div>

              {item.swaps && item.swaps.length > 0 && (
                <div className="pt-2 border-t border-[#24262e]/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                    Alternatives (Badeel):
                  </span>
                  <div className="space-y-1">
                    {item.swaps.map((swap, sIdx) => (
                      <div key={sIdx} className="text-xs font-mono text-zinc-300 flex items-center gap-1.5 bg-[#18191e] p-2 rounded-xl border border-[#24262e]/60">
                        <Repeat className="w-3 h-3 text-[#2f80ed] flex-shrink-0" />
                        <span>{swap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#24262e] bg-[#141519] flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleCompleted(meal.id)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isDone
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
                : 'bg-[#2f80ed] text-white hover:bg-blue-600 shadow-md shadow-[#2f80ed]/30'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isDone ? 'Mark Incomplete' : 'Mark as Eaten'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
