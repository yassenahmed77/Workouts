'use client';
import React, { useState, useId } from 'react';
import { X, Zap, ArrowLeft, Calculator, Check } from 'lucide-react';

/**
 * QuickAddDrawer - إضافة سريعة للسعرات والماكروز بدون تحديد صنف أو مكونات
 *
 * مخصص للحالات التي يعرف فيها المدرب أو المتدرب إجمالي السعرات (مثلاً 1000 كالوري)
 * والماكروز (البروتين، الكارب، الدهون) مباشرة دون الحاجة للبحث عن أطعمة بالاسم.
 */
export function QuickAddDrawer({
    onClose,
    targetMealName = 'Meal',
    onConfirm
}) {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [proteinG, setProteinG] = useState('');
    const [carbsG, setCarbsG] = useState('');
    const [fatsG, setFatsG] = useState('');
    const [autoCalcCalories, setAutoCalcCalories] = useState(true);

    const nameInputId = useId();
    const calsInputId = useId();
    const proteinInputId = useId();
    const carbsInputId = useId();
    const fatsInputId = useId();

    // حساب السعرات المحسوبة من الماكروز: (4 × P) + (4 × C) + (9 × F)
    const pNum = Math.max(0, parseFloat(proteinG) || 0);
    const cNum = Math.max(0, parseFloat(carbsG) || 0);
    const fNum = Math.max(0, parseFloat(fatsG) || 0);
    const calculatedCalsFromMacros = Math.round((pNum * 4) + (cNum * 4) + (fNum * 9));

    // تحديث الماكروز مع خيار الحساب التلقائي للسعرات
    const handleMacroChange = (macro, val) => {
        let newP = pNum;
        let newC = cNum;
        let newF = fNum;

        if (macro === 'protein') {
            setProteinG(val);
            newP = Math.max(0, parseFloat(val) || 0);
        } else if (macro === 'carbs') {
            setCarbsG(val);
            newC = Math.max(0, parseFloat(val) || 0);
        } else if (macro === 'fats') {
            setFatsG(val);
            newF = Math.max(0, parseFloat(val) || 0);
        }

        if (autoCalcCalories) {
            const nextCals = Math.round((newP * 4) + (newC * 4) + (newF * 9));
            if (nextCals > 0 || (newP === 0 && newC === 0 && newF === 0)) {
                setCalories(nextCals > 0 ? String(nextCals) : '');
            }
        }
    };

    const handleCaloriesChange = (val) => {
        setCalories(val);
        // إذا قام المستخدم بكتابة السعرات يدوياً، نعطل التحديث التلقائي لمنع المساس بما كتبه
        if (autoCalcCalories && val !== String(calculatedCalsFromMacros)) {
            setAutoCalcCalories(false);
        }
    };

    const handleApplyCalculated = () => {
        if (calculatedCalsFromMacros > 0) {
            setCalories(String(calculatedCalsFromMacros));
            setAutoCalcCalories(true);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const finalCalories = Number(calories) || calculatedCalsFromMacros || 0;
        if (finalCalories <= 0 && pNum === 0 && cNum === 0 && fNum === 0) {
            return;
        }

        const quickItem = {
            id: `quick-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            nameEn: name.trim() || 'Quick Add',
            nameAr: 'إضافة سريعة',
            calories: finalCalories,
            proteinG: pNum,
            carbsG: cNum,
            fatsG: fNum,
            fiberG: 0,
            grams: 100,
            defaultServingGrams: 100,
            servingUnit: 'portion',
            isQuickAdd: true,
            category: 'custom'
        };

        onConfirm(quickItem);
    };

    const totalMacroGrams = pNum + cNum + fNum;
    const pPct = totalMacroGrams > 0 ? Math.round((pNum / totalMacroGrams) * 100) : 0;
    const cPct = totalMacroGrams > 0 ? Math.round((cNum / totalMacroGrams) * 100) : 0;
    const fPct = totalMacroGrams > 0 ? Math.round((fNum / totalMacroGrams) * 100) : 0;

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-[var(--card-bg)] select-none">
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 sm:px-5 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-1 px-2.5 rounded-lg bg-[var(--card-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                    </button>
                    <div className="h-4 w-px bg-[var(--card-border)] hidden sm:block" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white tracking-tight leading-tight flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-[var(--main-color)]" />
                                <span>Quick Add Macros</span>
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300 border border-white/10 font-bold">
                                {targetMealName}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Log total calories and macros directly without searching for specific ingredients.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer hover:border-white/20"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 space-y-3 max-w-xl mx-auto w-full">
                {/* Optional Title */}
                <div className="p-3.5 rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-1.5">
                    <label htmlFor={nameInputId} className="block text-[11px] font-mono uppercase text-slate-400 font-semibold">
                        Entry Label (Optional)
                    </label>
                    <input
                        id={nameInputId}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Quick Add, Restaurant Meal, Post-Workout Shake"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--main-color)] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                </div>

                {/* Big Calories Hero Input */}
                <div className="p-4 rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor={calsInputId} className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <span>Calories (kcal)</span>
                            <span className="text-[var(--main-color)]">*</span>
                        </label>

                        {/* Auto-calc toggle indicator */}
                        {calculatedCalsFromMacros > 0 && (
                            <button
                                type="button"
                                onClick={handleApplyCalculated}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                    autoCalcCalories
                                        ? 'bg-[var(--main-color)]/15 border-[var(--main-color)]/40 text-[var(--main-color)] font-bold'
                                        : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                                }`}
                                title="Click to sync calories with (4P + 4C + 9F)"
                            >
                                <Calculator className="w-3 h-3" />
                                <span>Calc: {calculatedCalsFromMacros} kcal</span>
                                {autoCalcCalories && <Check className="w-2.5 h-2.5 ml-0.5" />}
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            id={calsInputId}
                            type="number"
                            min="0"
                            max="9999"
                            step="1"
                            value={calories}
                            onChange={(e) => handleCaloriesChange(e.target.value)}
                            placeholder="e.g. 1000"
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--main-color)] text-2xl font-bold font-numeric text-white placeholder-slate-600 focus:outline-none transition-colors"
                        />
                        <span className="text-xs font-mono font-bold text-slate-400 absolute right-4 top-1/2 -translate-y-1/2">
                            KCAL
                        </span>
                    </div>
                </div>

                {/* Macronutrients Grid: Protein, Carbs, Fats */}
                <div className="p-4 rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Macronutrients (Grams)
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                            Optional or live calc
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        {/* Protein */}
                        <div className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] focus-within:border-[var(--main-color)] space-y-1">
                            <label htmlFor={proteinInputId} className="block text-[10px] font-mono font-bold uppercase text-slate-300">
                                Protein
                            </label>
                            <div className="relative">
                                <input
                                    id={proteinInputId}
                                    type="number"
                                    min="0"
                                    max="999"
                                    step="0.5"
                                    value={proteinG}
                                    onChange={(e) => handleMacroChange('protein', e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-transparent text-base sm:text-lg font-bold font-numeric text-white placeholder-slate-600 focus:outline-none pr-4"
                                />
                                <span className="text-[10px] font-mono text-slate-500 absolute right-0 top-1/2 -translate-y-1/2">
                                    g
                                </span>
                            </div>
                        </div>

                        {/* Carbs */}
                        <div className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] focus-within:border-[var(--main-color)] space-y-1">
                            <label htmlFor={carbsInputId} className="block text-[10px] font-mono font-bold uppercase text-slate-300">
                                Carbs
                            </label>
                            <div className="relative">
                                <input
                                    id={carbsInputId}
                                    type="number"
                                    min="0"
                                    max="999"
                                    step="0.5"
                                    value={carbsG}
                                    onChange={(e) => handleMacroChange('carbs', e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-transparent text-base sm:text-lg font-bold font-numeric text-white placeholder-slate-600 focus:outline-none pr-4"
                                />
                                <span className="text-[10px] font-mono text-slate-500 absolute right-0 top-1/2 -translate-y-1/2">
                                    g
                                </span>
                            </div>
                        </div>

                        {/* Fats */}
                        <div className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] focus-within:border-[var(--main-color)] space-y-1">
                            <label htmlFor={fatsInputId} className="block text-[10px] font-mono font-bold uppercase text-slate-300">
                                Fats
                            </label>
                            <div className="relative">
                                <input
                                    id={fatsInputId}
                                    type="number"
                                    min="0"
                                    max="999"
                                    step="0.5"
                                    value={fatsG}
                                    onChange={(e) => handleMacroChange('fats', e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-transparent text-base sm:text-lg font-bold font-numeric text-white placeholder-slate-600 focus:outline-none pr-4"
                                />
                                <span className="text-[10px] font-mono text-slate-500 absolute right-0 top-1/2 -translate-y-1/2">
                                    g
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Macro Distribution Ratio Bar */}
                    {totalMacroGrams > 0 && (
                        <div className="space-y-1.5 pt-1">
                            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex">
                                <div style={{ width: `${pPct}%` }} className="bg-[var(--main-color)] h-full transition-all" />
                                <div style={{ width: `${cPct}%` }} className="bg-[var(--main-color)]/60 h-full transition-all" />
                                <div style={{ width: `${fPct}%` }} className="bg-[var(--main-color)]/30 h-full transition-all" />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                <span>{pPct}% Protein ({pNum * 4} kcal)</span>
                                <span>{cPct}% Carbs ({cNum * 4} kcal)</span>
                                <span>{fPct}% Fats ({fNum * 9} kcal)</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        className="gym-btn-primary w-full py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] transition-all"
                    >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>
                            Add {calories ? `${Number(calories).toLocaleString()} kcal` : 'Macros'} to {targetMealName}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
}
