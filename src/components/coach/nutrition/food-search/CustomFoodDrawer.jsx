'use client';
import React from 'react';
import { X } from 'lucide-react';
import { SelectDropdown } from '@/components/ui/SelectDropdown';

/**
 * CustomFoodDrawer - مكون واجهة إضافة عنصر غذائي مخصص لقاعدة البيانات
 *
 * يسمح للكابتن بإدخال تفاصيل مخصصة لأي وجبة أو مكمل (الاسم، الماركة، طريقة الطبخ، نوع الحصة، والقيم الغذائية).
 */
export function CustomFoodDrawer({
    onClose,
    customForm,
    updateCustomForm,
    onSave
}) {
    return (
        <div className="flex flex-col flex-1 min-h-0 bg-[var(--card-bg)]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:px-5 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-1 px-2.5 rounded-lg bg-[var(--card-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                    >
                        Back to Library
                    </button>
                    <div className="h-4 w-px bg-[var(--card-border)] hidden sm:block" />
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                            Create Custom Food
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Enter product details and nutritional values.
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
            <form onSubmit={onSave} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 space-y-3 max-w-2xl mx-auto w-full">
                {/* Section 1: Basic Information */}
                <div className="relative z-20 p-3 sm:p-3.5 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2.5 shadow-xs">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        Product Identification
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                                Food Name <span className="text-slate-400">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Greek Yogurt, Protein Bar, Beef Patty..."
                                required
                                value={customForm.nameEn}
                                onChange={(e) => updateCustomForm('nameEn', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                                Brand / Source (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Brand Name (Optional)"
                                value={customForm.brand}
                                onChange={(e) => updateCustomForm('brand', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                                Macronutrient Category
                            </label>
                            <SelectDropdown
                                value={customForm.category}
                                onChange={(val) => updateCustomForm('category', val)}
                                options={[
                                    { value: 'protein', label: 'Protein' },
                                    { value: 'carbs', label: 'Carbs' },
                                    { value: 'fats', label: 'Fats' },
                                    { value: 'dairy', label: 'Dairy' },
                                    { value: 'egyptian_staples', label: 'Staples' },
                                    { value: 'fruits', label: 'Fruits' },
                                    { value: 'vegetables', label: 'Vegetables' },
                                    { value: 'supplements', label: 'Supplements' },
                                    { value: 'snacks', label: 'Snacks' }
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                                Preparation State
                            </label>
                            <SelectDropdown
                                value={customForm.prep}
                                onChange={(val) => updateCustomForm('prep', val)}
                                options={[
                                    { value: 'cooked', label: 'Cooked' },
                                    { value: 'raw', label: 'Raw' },
                                    { value: 'packaged', label: 'Packaged' },
                                    { value: 'liquid', label: 'Liquid' }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Portion & Serving Basis */}
                <div className="relative z-10 p-3 sm:p-3.5 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                            Portion Basis
                        </span>
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)]">
                            <button
                                type="button"
                                onClick={() => updateCustomForm('portionType', 'grams')}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                    customForm.portionType === 'grams'
                                        ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                                        : 'text-slate-400 hover:text-white border border-transparent'
                                }`}
                            >
                                By Weight (g)
                            </button>
                            <button
                                type="button"
                                onClick={() => updateCustomForm('portionType', 'serving')}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                    customForm.portionType === 'serving'
                                        ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                                        : 'text-slate-400 hover:text-white border border-transparent'
                                }`}
                            >
                                By Serving / Piece
                            </button>
                        </div>
                    </div>

                    {customForm.portionType === 'grams' ? (
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                                Portion Weight (Grams)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="3000"
                                placeholder="100"
                                value={customForm.weightGrams}
                                onChange={(e) => updateCustomForm('weightGrams', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-bold text-white font-numeric focus:outline-none focus:border-[var(--main-color)] transition-colors"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                                    Serving Description
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1 Scoop, 1 Bar, 1 Bottle, 1 Slice"
                                    value={customForm.servingName}
                                    onChange={(e) => updateCustomForm('servingName', e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                                    Serving Weight in Grams (Optional)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="3000"
                                    placeholder="e.g. 30, 60"
                                    value={customForm.servingGramsWeight}
                                    onChange={(e) => updateCustomForm('servingGramsWeight', e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-bold text-white font-numeric focus:outline-none focus:border-[var(--main-color)] transition-colors"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 3: Nutritional Values */}
                <div className="relative z-0 p-3 sm:p-3.5 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2.5 shadow-xs">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        {customForm.portionType === 'grams'
                            ? `Nutritional Values (${customForm.weightGrams ? customForm.weightGrams + 'g' : '100g'})`
                            : `Nutritional Values (${customForm.servingName.trim() || '1 Serving'})`}
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)]">
                            <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                                Calories (kcal)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="3000"
                                placeholder="0"
                                value={customForm.calories}
                                onChange={(e) => updateCustomForm('calories', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--input-border)] text-sm font-bold text-white font-numeric focus:outline-none focus:border-[var(--main-color)]"
                            />
                        </div>

                        <div className="p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)]">
                            <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                                Protein (g)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="200"
                                step="0.1"
                                placeholder="0"
                                value={customForm.protein}
                                onChange={(e) => updateCustomForm('protein', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--input-border)] text-sm font-bold text-white font-numeric focus:outline-none focus:border-[var(--main-color)]"
                            />
                        </div>

                        <div className="p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)]">
                            <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                                Carbs (g)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="300"
                                step="0.1"
                                placeholder="0"
                                value={customForm.carbs}
                                onChange={(e) => updateCustomForm('carbs', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--input-border)] text-sm font-bold text-white font-numeric focus:outline-none focus:border-[var(--main-color)]"
                            />
                        </div>

                        <div className="p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)]">
                            <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                                Fats (g)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="200"
                                step="0.1"
                                placeholder="0"
                                value={customForm.fats}
                                onChange={(e) => updateCustomForm('fats', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--input-border)] text-sm font-bold text-white font-numeric focus:outline-none focus:border-[var(--main-color)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--card-border)]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-1.5 px-4 rounded-xl bg-[var(--card-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="gym-btn-primary text-xs">
                        Save to Library & Use
                    </button>
                </div>
            </form>
        </div>
    );
}
