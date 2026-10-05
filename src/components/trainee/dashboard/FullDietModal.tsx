'use client';

import React from 'react';
import { DietPlan, DietMeal } from '@/types';
import { X, Clock, Repeat } from 'lucide-react';

interface FullDietModalProps {
  isOpen: boolean;
  dietPlan?: DietPlan | null;
  meals: DietMeal[];
  onClose: () => void;
}

export const FullDietModal: React.FC<FullDietModalProps> = ({
  isOpen,
  dietPlan,
  meals,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Complete Nutrition Protocol"
    >
      <div className="w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-[#18191e] border border-[#24262e] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#24262e] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#2f80ed] uppercase tracking-wider font-bold">
              Complete Nutrition Protocol
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight mt-0.5">
              {dietPlan?.title || 'Daily Meal Plan'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1d22] border border-[#24262e] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            aria-label="Close diet protocol"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Macro Summary Strip */}
        <div className="px-4 py-2.5 bg-[#141519] border-b border-[#24262e] flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold tabular-nums">
            {dietPlan ? dietPlan.targetCalories.toLocaleString() : '2,350'} kcal
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[#2f80ed] font-semibold">{dietPlan?.targetProteinG || 155}g Protein</span>
            <span className="text-zinc-300 font-semibold">{dietPlan?.targetCarbsG || 240}g Carbs</span>
            <span className="text-zinc-300 font-semibold">{dietPlan?.targetFatsG || 65}g Fats</span>
          </div>
        </div>

        {/* Meals List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 no-scrollbar">
          {meals.map((meal) => {
            const cleanName = meal.name.replace(/^(Meal\s*\d+\s*[-•:]*\s*|\d+[\.\-\)]\s*)/i, '').trim() || meal.name;
            return (
              <div key={meal.id} className="p-3.5 rounded-2xl bg-[#141519] border border-[#24262e] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{cleanName}</span>
                  {meal.time && (
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#2f80ed]" />
                      <span>{meal.time}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  {meal.items.map((item) => (
                    <div key={item.id} className="text-xs p-2 rounded-xl bg-[#18191e] border border-[#24262e]/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{item.name}</span>
                        <span className="font-mono text-[#2f80ed] text-[11px] tabular-nums font-semibold">{item.quantity}</span>
                      </div>
                      {item.swaps && item.swaps.length > 0 && (
                        <div className="text-[10px] font-mono text-zinc-400 flex items-start gap-1 pt-0.5">
                          <Repeat className="w-3 h-3 text-[#2f80ed] flex-shrink-0 mt-0.5" />
                          <span>Badeel: {item.swaps.join(' or ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
