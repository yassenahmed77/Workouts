'use client';
import React, { useState } from 'react';
import { Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
export const DietMealCard = React.memo(({ meal, isCompleted, onToggleCompleted, onSwapItem }) => {
    const [showSwaps, setShowSwaps] = useState({});
    const cardRef = React.useRef(null);
    // Close expanded choices when clicking anywhere outside
    React.useEffect(() => {
        const isAnyOpen = Object.values(showSwaps).some(Boolean);
        if (!isAnyOpen)
            return;
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setShowSwaps({});
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showSwaps]);
    const cleanMealName = meal.name.replace(/^(Meal\s*\d+\s*[-•:]*\s*|\d+[\.\-\)]\s*)/i, '').trim() || meal.name;
    const mealTotals = React.useMemo(() => {
        let cals = 0;
        let p = 0;
        let c = 0;
        let f = 0;
        meal.items.forEach((item) => {
            cals += item.calories || 0;
            p += item.proteinG || 0;
            c += item.carbsG || 0;
            f += item.fatsG || 0;
        });
        return {
            calories: Math.round(cals),
            proteinG: Math.round(p * 10) / 10,
            carbsG: Math.round(c * 10) / 10,
            fatsG: Math.round(f * 10) / 10
        };
    }, [meal.items]);
    const toggleSwapVisibility = (itemId) => {
        setShowSwaps((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };
    return (<div ref={cardRef} className={`gym-card space-y-2.5 p-3 sm:p-3.5 rounded-2xl transition-all border ${isCompleted
            ? 'bg-[var(--card-bg)] border-[var(--main-color)]/30'
            : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] hover:border-white/[0.12]'}`}>
      {/* Meal Header (Title, Total kcal, Macros, and Completion Checkbox) */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm sm:text-base font-bold tracking-tight truncate ${isCompleted ? 'text-[var(--main-color)]' : 'text-white'}`}>
              {cleanMealName}
            </h3>
            {meal.time && (<span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3 text-[var(--main-color)]"/>
                {meal.time}
              </span>)}
          </div>

          {/* Macros String: Carbs Xg · Fat Yg · Protein Zg */}
          <div className="text-[10.5px] font-mono text-zinc-400 mt-0.5 truncate">
            Carbs {mealTotals.carbsG}g · Fat {mealTotals.fatsG}g · Protein {mealTotals.proteinG}g
          </div>
        </div>

        {/* Right side: Calories number & Checkbox */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="text-right font-mono">
            <span className="text-sm sm:text-base font-extrabold text-white block tabular-nums">
              {mealTotals.calories}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block leading-none">
              kcal
            </span>
          </div>

          <button type="button" onClick={onToggleCompleted} className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${isCompleted
            ? 'bg-[var(--main-color)] border-[var(--main-color)] text-white'
            : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] hover:border-[var(--main-color)] text-transparent'}`} aria-label={`Mark ${cleanMealName} as ${isCompleted ? 'eaten' : 'uneaten'}`} title={isCompleted ? 'Meal completed' : 'Mark meal as eaten'}>
            <Check className={`w-4 h-4 stroke-[3] ${isCompleted ? 'opacity-100' : 'opacity-0'}`}/>
          </button>
        </div>
      </div>

      {/* Prescribed Meal Items List */}
      <div className="space-y-2">
        {meal.items.map((item) => {
            const hasSwaps = Boolean(item.badeel && item.badeel.length > 0);
            const isSwapOpen = Boolean(showSwaps[item.id]);
            return (<div key={item.id} className="gym-card-subtle p-2.5 rounded-xl border border-white/[0.04] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className={`text-xs font-semibold block truncate ${isCompleted ? 'text-zinc-300' : 'text-zinc-100'}`}>
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                    {item.quantity || (item.grams ? `${item.grams}g` : '1 Serving')}
                  </span>
                </div>

                <div className="text-right flex-shrink-0 font-mono text-xs tabular-nums">
                  <span className="text-zinc-200 font-bold block">{item.calories} kcal</span>
                  <span className="text-[10px] text-zinc-400 block">
                    P {item.proteinG}g · C {item.carbsG}g · F {item.fatsG}g
                  </span>
                </div>
              </div>

              {/* Food Choices Toggle */}
              {hasSwaps && (<div className="pt-1 border-t border-white/[0.04]">
                  <button type="button" onClick={() => toggleSwapVisibility(item.id)} className="text-[10px] font-mono text-[var(--main-color)] hover:opacity-80 flex items-center gap-1.5 transition-colors cursor-pointer py-0.5 w-full">
                    <span>Choices</span>
                    <span className="text-zinc-500 text-[9px]">({item.badeel?.length})</span>
                    {isSwapOpen ? <ChevronUp className="w-3 h-3 ml-auto"/> : <ChevronDown className="w-3 h-3 ml-auto"/>}
                  </button>

                  {/* Expanded Interactive Choices List */}
                  {isSwapOpen && (<div className="mt-2 space-y-1.5 pt-1 border-t border-white/[0.04] animate-in fade-in duration-150">
                      {item.badeel?.map((alt, idx) => {
                            const calDiff = alt.calories - item.calories;
                            const diffText = calDiff === 0 ? '±0' : calDiff > 0 ? `+${calDiff}` : `${calDiff}`;
                            return (<div key={`alt-${idx}`} className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 flex items-center justify-between gap-2 transition-all group">
                            <div className="min-w-0 flex-1 font-mono">
                              <span className="text-xs font-semibold text-zinc-200 block truncate group-hover:text-white">
                                {alt.name}
                              </span>
                              <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                                <span>{alt.grams}g</span>
                                <span>•</span>
                                <span className="font-bold text-zinc-300">{alt.calories} kcal</span>
                                <span className="text-[9px] text-zinc-500">
                                  ({diffText} kcal)
                                </span>
                              </div>
                            </div>

                            <button type="button" onClick={() => {
                                    onSwapItem(item, alt);
                                    setShowSwaps((prev) => ({ ...prev, [item.id]: false }));
                                }} className="px-2.5 py-1 rounded-md bg-[var(--main-color)]/10 hover:bg-[var(--main-color)] border border-[var(--main-color)]/30 hover:border-[var(--main-color)] text-[var(--main-color)] hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95 flex-shrink-0" title={`Choose ${alt.name}`}>
                              Choose
                            </button>
                          </div>);
                        })}
                    </div>)}
                </div>)}
            </div>);
        })}
      </div>
    </div>);
});
DietMealCard.displayName = 'DietMealCard';
