'use client';
import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { calculateMacrosForGrams } from '@/lib/foodDatabase';

/**
 * FoodItemCard - بطاقة عنصر غذائي في قائمة نتائج البحث
 * - الضغط على البطاقة: يفتح نافذة ضبط الجرامات وتعيين Preset جديد
 * - الضغط على زر (+): يضيف الطعام فوراً بآخر Preset تم استخدامه دون فتح نوافذ
 */
export function FoodItemCard({ 
    food, 
    isSelected, 
    onSelect, 
    onQuickAdd,
    portionGrams = 100 
}) {
    const [isJustAdded, setIsJustAdded] = useState(false);

    const effectiveGrams = portionGrams || food.defaultServingGrams || food.servingSizeGrams || 100;
    const effectiveMacros = calculateMacrosForGrams(food, effectiveGrams);
    const brandOrCategory = food.brand || (food.category ? food.category.charAt(0).toUpperCase() + food.category.slice(1) : 'Generic');
    const displayName = food.nameEn || food.nameAr || 'Food Item';

    const handleQuickAddClick = (e) => {
        e.stopPropagation();
        if (onQuickAdd) {
            onQuickAdd(food);
            setIsJustAdded(true);
            setTimeout(() => setIsJustAdded(false), 1200);
        } else {
            onSelect(food);
        }
    };

    return (
        <div
            onClick={() => onSelect(food)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group select-none ${
                isSelected
                    ? 'bg-[var(--card-subtle-bg)] border-[var(--main-color)] ring-1 ring-[var(--main-color)]/30 text-white shadow-sm'
                    : 'bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border-[var(--card-border)] hover:border-white/15 text-slate-200'
            }`}
        >
            {/* Left Info: Name & Dynamic Subtitle (reflecting last used portion & calories) */}
            <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-[clamp(12px,1.3vw,13.5px)] font-medium text-white group-hover:text-[var(--main-color)] transition-colors truncate">
                    {displayName}
                </h4>

                <div className="flex items-center gap-1.5 text-[clamp(10px,1.1vw,11.5px)] text-slate-400 font-numeric truncate">
                    <span className="text-white font-bold">{effectiveMacros.calories} cal</span>
                    <span>&bull;</span>
                    <span className="truncate">{brandOrCategory}</span>
                    <span>&bull;</span>
                    <span className="flex-shrink-0 font-medium text-slate-300">
                        {effectiveGrams}g
                        {food.servingUnit && food.servingUnit !== 'g' && food.servingUnit !== '100g' ? ` (${food.servingUnit})` : ''}
                    </span>
                    {food.preparation && food.preparation !== 'cooked' && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/[0.04] text-slate-400 uppercase">
                            {food.preparation}
                        </span>
                    )}
                </div>
            </div>

            {/* Circular Direct Add (+) Button */}
            <button
                type="button"
                onClick={handleQuickAddClick}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                    isJustAdded
                        ? 'bg-[var(--main-color)]/20 border border-[var(--main-color)]/50 text-[var(--main-color)] shadow-sm scale-110'
                        : isSelected
                        ? 'bg-[var(--main-color)] text-white shadow-md'
                        : 'bg-[var(--card-subtle-bg)] border border-white/10 text-[var(--main-color)] group-hover:bg-[var(--main-color)] group-hover:text-white group-hover:border-[var(--main-color)]'
                }`}
                title={`Quick Add ${effectiveGrams}g directly`}
            >
                {isJustAdded ? (
                    <Check className="w-4 h-4 stroke-[3] animate-in zoom-in-75 duration-150" />
                ) : (
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                )}
            </button>
        </div>
    );
}
