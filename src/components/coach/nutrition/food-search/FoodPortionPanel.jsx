'use client';
import React from 'react';
import { X } from 'lucide-react';

/**
 * FoodPortionPanel - لوحة ضبط وزن الحصة وحساب الماكروز اللحظية
 *
 * تسمح للمدرب باختيار الجرامات يدوياً أو عبر Presets جاهزة، وتعديلها بأزرار Steppers سريعة،
 * وعرض ملخص الطاقة (السعرات، البروتين، الكارب، الدهون) في الوقت الفعلي مع زر الإضافة للوجبة.
 */
export function FoodPortionPanel({
    activeFood,
    targetMealName,
    portionGrams,
    portionMode,
    setPortionMode,
    manualGramsInput,
    handleManualGramsChange,
    handleAdjustManualGrams,
    handleSelectPortionPreset,
    calculatedMacros,
    handleConfirmAdd,
    onClose
}) {
    if (!activeFood) return null;

    return (
        <div className="w-full md:w-80 h-full min-h-0 bg-[var(--card-subtle-bg)] flex flex-col flex-shrink-0 border-t md:border-t-0 md:border-l border-[var(--card-border)] overflow-hidden">
            {/* Scrollable Upper Configuration Content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3.5 space-y-3">
                {/* Selected Food Header */}
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--card-border)]">
                        <div className="space-y-0.5 min-w-0">
                            <span className="text-[9.5px] font-mono uppercase tracking-wider text-[var(--main-color)] font-semibold block">
                                Configuring Portion
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug truncate">
                                {activeFood.nameEn || activeFood.nameAr}
                            </h4>
                            {activeFood.brand && (
                                <span className="text-[10px] text-slate-400 block truncate">
                                    {activeFood.brand}
                                </span>
                            )}
                        </div>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
                                title="Close portion panel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Portion Weight Selection: Manual vs Presets */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-200">
                                Portion Weight:
                            </label>
                            <div className="flex items-center gap-1.5">
                                {activeFood.defaultServingGrams && activeFood.defaultServingGrams !== 100 && (
                                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/10 font-semibold">
                                        1 serving = {activeFood.defaultServingGrams}g
                                    </span>
                                )}
                                <span className="text-[10px] font-mono text-slate-200 font-bold">
                                    {portionGrams || 0}g selected
                                </span>
                            </div>
                        </div>

                        {/* Mode Toggle: Manual vs Preset */}
                        <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)]">
                            <button
                                type="button"
                                onClick={() => setPortionMode('manual')}
                                className={`py-1 rounded-md text-xs font-semibold transition-all cursor-pointer text-center ${
                                    portionMode === 'manual'
                                        ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                                        : 'text-slate-400 hover:text-white border border-transparent'
                                }`}
                            >
                                Manual
                            </button>
                            <button
                                type="button"
                                onClick={() => setPortionMode('preset')}
                                className={`py-1 rounded-md text-xs font-semibold transition-all cursor-pointer text-center ${
                                    portionMode === 'preset'
                                        ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                                        : 'text-slate-400 hover:text-white border border-transparent'
                                }`}
                            >
                                Presets
                            </button>
                        </div>

                        {portionMode === 'manual' ? (
                            /* Manual Grams Input with Live Recalculation & Rapid Steppers */
                            <div className="space-y-1.5">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="3000"
                                        value={manualGramsInput}
                                        onChange={(e) => handleManualGramsChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleConfirmAdd();
                                            }
                                        }}
                                        placeholder="Enter grams..."
                                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--main-color)] text-sm font-bold text-white font-numeric focus:outline-none transition-all"
                                    />
                                    <span className="text-xs font-mono text-slate-400 font-bold absolute right-3 top-1/2 -translate-y-1/2">
                                        grams
                                    </span>
                                </div>

                                {/* Quick Fine-Tuning Steppers */}
                                <div className="flex items-center justify-between gap-1">
                                    {[-50, -10, -5, +5, +10, +50].map((delta) => (
                                        <button
                                            key={delta}
                                            type="button"
                                            onClick={() => handleAdjustManualGrams(delta)}
                                            className="flex-1 py-1 rounded-md bg-[var(--card-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-white/20 text-[10px] font-mono font-medium text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
                                        >
                                            {delta > 0 ? `+${delta}` : delta}g
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Quick Grams Presets Grid */
                            <div className="grid grid-cols-4 gap-1">
                                {[
                                    ...(activeFood.defaultServingGrams && ![50, 100, 150, 200, 250, 300, 400, 500].includes(activeFood.defaultServingGrams)
                                        ? [activeFood.defaultServingGrams]
                                        : []),
                                    50, 100, 150, 200, 250, 300, 400, 500
                                ].slice(0, 8).map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => handleSelectPortionPreset(g)}
                                        className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                                            portionGrams === g
                                                ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                                                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white hover:border-white/10'
                                        }`}
                                    >
                                        {g}g
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Real-time Calculated Nutrition Facts */}
                    <div className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                        <div className="flex items-baseline justify-between border-b border-[var(--card-border)] pb-1.5">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                                Energy Yield
                            </span>
                            <div className="flex items-baseline gap-1 font-numeric">
                                <span className="text-xl font-bold text-white tracking-tight">
                                    {calculatedMacros.calories}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">kcal</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center">
                            <div className="p-1.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
                                <span className="text-[9px] font-mono uppercase text-slate-400 block font-medium">
                                    Protein
                                </span>
                                <span className="text-xs font-bold text-white font-numeric mt-0.5 block">
                                    {calculatedMacros.proteinG}g
                                </span>
                            </div>

                            <div className="p-1.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
                                <span className="text-[9px] font-mono uppercase text-slate-400 block font-medium">
                                    Carbs
                                </span>
                                <span className="text-xs font-bold text-white font-numeric mt-0.5 block">
                                    {calculatedMacros.carbsG}g
                                </span>
                            </div>

                            <div className="p-1.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
                                <span className="text-[9px] font-mono uppercase text-slate-400 block font-medium">
                                    Fats
                                </span>
                                <span className="text-xs font-bold text-white font-numeric mt-0.5 block">
                                    {calculatedMacros.fatsG}g
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Confirm Add Button Pinned at the Very Bottom */}
            <div className="p-3.5 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex-shrink-0 mt-auto">
                <button
                    type="button"
                    onClick={handleConfirmAdd}
                    className="gym-btn-primary w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-bold text-center cursor-pointer shadow-md active:scale-98 transition-all"
                >
                    Add {portionGrams || activeFood.defaultServingGrams || 100}g to {targetMealName}
                </button>
            </div>
        </div>
    );
}
