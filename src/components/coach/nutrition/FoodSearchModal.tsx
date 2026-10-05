'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FoodItem, FoodCategory, FoodPreparationState } from '@/types';
import { VERIFIED_FOOD_DATABASE, calculateMacrosForGrams, searchFoodDatabase } from '@/lib/foodDatabase';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { dietService } from '@/services/dietService';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMealName?: string;
  onSelectFood: (
    food: FoodItem, 
    grams: number, 
    macros: { calories: number; proteinG: number; carbsG: number; fatsG: number }
  ) => void;
  customFoods?: FoodItem[];
  onAddCustomFood?: (food: FoodItem) => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  targetMealName = 'Meal',
  onSelectFood,
  customFoods = [],
  onAddCustomFood
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [selectedPrep, setSelectedPrep] = useState<FoodPreparationState | 'all'>('all');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isCustomFoodOpen, setIsCustomFoodOpen] = useState(false);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isBarcodeModalOpen) {
          setIsBarcodeModalOpen(false);
          return;
        }
        if (isCustomFoodOpen) {
          setIsCustomFoodOpen(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBarcodeModalOpen, isCustomFoodOpen, onClose]);

  // Session foods added or scanned during this modal session
  const [sessionCustomFoods, setSessionCustomFoods] = useState<FoodItem[]>([]);
  // When coach scans or adds a food, isolate the main scene to only show that food
  const [activeIsolatedFood, setActiveIsolatedFood] = useState<FoodItem | null>(null);

  // Selected food item in preview panel
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [portionMode, setPortionMode] = useState<'manual' | 'preset'>('manual');
  const [manualGramsInput, setManualGramsInput] = useState<string>('100');

  // Custom food form state
  const [customNameEn, setCustomNameEn] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customCategory, setCustomCategory] = useState<FoodCategory>('protein');
  const [customPrep, setCustomPrep] = useState<FoodPreparationState>('cooked');
  const [customPortionType, setCustomPortionType] = useState<'grams' | 'serving'>('grams');
  const [customWeightGrams, setCustomWeightGrams] = useState<string>('');
  const [customServingName, setCustomServingName] = useState<string>('');
  const [customServingGramsWeight, setCustomServingGramsWeight] = useState<string>('');
  const [customCalories, setCustomCalories] = useState<string>('');
  const [customProtein, setCustomProtein] = useState<string>('');
  const [customCarbs, setCustomCarbs] = useState<string>('');
  const [customFats, setCustomFats] = useState<string>('');

  // Refs for modal elements
  const customFoodBtnRef = useRef<HTMLButtonElement>(null);

  const allFoods = useMemo(() => {
    const combined = [...sessionCustomFoods, ...customFoods, ...VERIFIED_FOOD_DATABASE];
    const seen = new Set<string>();
    return combined.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [sessionCustomFoods, customFoods]);

  const displayedFoods = useMemo(() => {
    if (activeIsolatedFood) {
      return [activeIsolatedFood];
    }
    return searchFoodDatabase(allFoods, searchQuery, selectedCategory, selectedPrep);
  }, [activeIsolatedFood, allFoods, searchQuery, selectedCategory, selectedPrep]);

  const activeFood = selectedFood || displayedFoods[0] || null;

  // Whenever activeFood changes, if portionGrams doesn't match default serving, calibrate it
  const handleSelectFoodItem = (food: FoodItem) => {
    setSelectedFood(food);
    const targetGrams = food.defaultServingGrams || food.servingSizeGrams || 100;
    setPortionGrams(targetGrams);
    setManualGramsInput(String(targetGrams));
  };

  const calculatedMacros = useMemo(() => {
    if (!activeFood) return { grams: 0, calories: 0, proteinG: 0, carbsG: 0, fatsG: 0 };
    return calculateMacrosForGrams(activeFood, portionGrams);
  }, [activeFood, portionGrams]);

  const handleManualGramsChange = (val: string) => {
    setManualGramsInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setPortionGrams(parsed);
    } else if (val === '') {
      setPortionGrams(0);
    }
  };

  const handleAdjustManualGrams = (delta: number) => {
    const current = Number(portionGrams) || 100;
    const next = Math.max(1, current + delta);
    setPortionGrams(next);
    setManualGramsInput(String(next));
  };

  const handleSelectPortionPreset = (grams: number) => {
    setPortionGrams(grams);
    setManualGramsInput(String(grams));
  };

  const handleConfirmAdd = () => {
    if (!activeFood) return;
    const finalGrams = Math.max(1, portionGrams || activeFood.defaultServingGrams || 100);
    const finalMacros = calculateMacrosForGrams(activeFood, finalGrams);
    onSelectFood(activeFood, finalGrams, finalMacros);
    onClose();
  };

  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNameEn.trim()) return;

    const enteredCalories = Math.max(0, Number(customCalories) || 0);
    const enteredProtein = Math.max(0, Number(customProtein) || 0);
    const enteredCarbs = Math.max(0, Number(customCarbs) || 0);
    const enteredFats = Math.max(0, Number(customFats) || 0);

    let defaultGrams = 100;
    let unitLabel = '100g';
    let baseCalories = enteredCalories;
    let baseProtein = enteredProtein;
    let baseCarbs = enteredCarbs;
    let baseFats = enteredFats;

    if (customPortionType === 'grams') {
      const g = Math.max(1, Number(customWeightGrams) || 100);
      defaultGrams = g;
      unitLabel = `${g}g`;
      if (g !== 100) {
        const factor = 100 / g;
        baseCalories = Math.round(enteredCalories * factor);
        baseProtein = Math.round(enteredProtein * factor * 10) / 10;
        baseCarbs = Math.round(enteredCarbs * factor * 10) / 10;
        baseFats = Math.round(enteredFats * factor * 10) / 10;
      }
    } else {
      // Serving / Piece
      const sName = customServingName.trim() || '1 Serving';
      const sWeight = Number(customServingGramsWeight);
      if (sWeight && sWeight > 0) {
        defaultGrams = sWeight;
        unitLabel = `${sName} (${sWeight}g)`;
        const factor = 100 / sWeight;
        baseCalories = Math.round(enteredCalories * factor);
        baseProtein = Math.round(enteredProtein * factor * 10) / 10;
        baseCarbs = Math.round(enteredCarbs * factor * 10) / 10;
        baseFats = Math.round(enteredFats * factor * 10) / 10;
      } else {
        defaultGrams = 100;
        unitLabel = sName;
        baseCalories = enteredCalories;
        baseProtein = enteredProtein;
        baseCarbs = enteredCarbs;
        baseFats = enteredFats;
      }
    }

    const newFood: FoodItem = {
      id: `custom-food-${Date.now()}`,
      nameEn: customNameEn.trim(),
      nameAr: customNameEn.trim(),
      brand: customBrand.trim() || undefined,
      category: customCategory,
      preparation: customPrep,
      servingUnit: unitLabel,
      servingSizeGrams: 100,
      defaultServingGrams: defaultGrams,
      calories: baseCalories,
      proteinG: baseProtein,
      carbsG: baseCarbs,
      fatsG: baseFats,
      isVerified: false,
      isCustom: true
    };

    const validation = dietService.validateCustomFood(newFood);
    if (!validation.success) {
      showToast(validation.errors[0] || 'Please check custom food input values', 'error');
      return;
    }

    setSessionCustomFoods((prev) => [newFood, ...prev]);
    if (onAddCustomFood) {
      onAddCustomFood(newFood);
    }
    setSelectedFood(newFood);
    setPortionGrams(defaultGrams);
    setManualGramsInput(String(defaultGrams));
    setActiveIsolatedFood(newFood);
    setSearchQuery('');

    // Reset form fields
    setCustomNameEn('');
    setCustomBrand('');
    setCustomWeightGrams('');
    setCustomServingName('');
    setCustomServingGramsWeight('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFats('');

    setIsCustomFoodOpen(false);
  };

  const handleBarcodeFoodFound = (food: FoodItem) => {
    setSessionCustomFoods((prev) => [food, ...prev.filter((f) => f.id !== food.id)]);
    if (onAddCustomFood) {
      onAddCustomFood(food);
    }
    setSelectedFood(food);
    const servingGrams = food.defaultServingGrams || food.servingSizeGrams || 100;
    setPortionGrams(servingGrams);
    setManualGramsInput(String(servingGrams));
    setActiveIsolatedFood(food);
    setSearchQuery('');
  };

  if (!isOpen) return null;

  const categories: { id: FoodCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Foods' },
    { id: 'protein', label: 'Proteins' },
    { id: 'carbs', label: 'Carbs' },
    { id: 'fats', label: 'Fats' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'egyptian_staples', label: 'Staples' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'supplements', label: 'Supplements' }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans text-slate-100"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className={`w-full ${isCustomFoodOpen ? 'max-w-2xl max-h-[92vh]' : 'max-w-5xl h-[90vh] max-h-[820px]'} bg-[#080c14] border border-[#141b26] rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {isCustomFoodOpen ? (
            /* ========================================================= */
            /* 1. DEDICATED FULL-SPACE VIEW: CREATE CUSTOM FOOD          */
            /* ========================================================= */
            <div className="flex flex-col flex-1 min-h-0 bg-[#080c14]">
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:px-5 border-b border-[#141b26] bg-[#070a0f] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCustomFoodOpen(false)}
                    className="py-1 px-2.5 rounded-lg bg-[#05080e] hover:bg-white/[0.06] border border-[#16202e] hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                  >
                    Back to Library
                  </button>
                  <div className="h-4 w-px bg-[#16202e] hidden sm:block" />
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
                  onClick={() => setIsCustomFoodOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#05080e] border border-[#16202e] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer hover:border-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body - Compact & Fit-Screen Layout */}
              <form 
                onSubmit={handleSaveCustomFood}
                className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 space-y-3 max-w-2xl mx-auto w-full"
              >
                {/* Section 1: Basic Information */}
                <div className="relative z-20 p-3 sm:p-3.5 rounded-xl bg-[#090e17] border border-[#141b26] space-y-2.5 shadow-xs">
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
                        value={customNameEn}
                        onChange={(e) => setCustomNameEn(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                        Brand / Source (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Brand Name (Optional)"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                        Macronutrient Category
                      </label>
                      <SelectDropdown
                        value={customCategory}
                        onChange={(val) => setCustomCategory(val as FoodCategory)}
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
                        value={customPrep}
                        onChange={(val) => setCustomPrep(val as FoodPreparationState)}
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
                <div className="relative z-10 p-3 sm:p-3.5 rounded-xl bg-[#090e17] border border-[#141b26] space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Portion Basis
                    </span>
                    {/* Segmented Toggle: By Weight (g) vs By Serving / Piece */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#05080e] border border-[#16202e]">
                      <button
                        type="button"
                        onClick={() => setCustomPortionType('grams')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          customPortionType === 'grams'
                            ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white border border-transparent'
                        }`}
                      >
                        By Weight (g)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomPortionType('serving')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          customPortionType === 'serving'
                            ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white border border-transparent'
                        }`}
                      >
                        By Serving / Piece
                      </button>
                    </div>
                  </div>

                  {customPortionType === 'grams' ? (
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-slate-300 font-semibold mb-1">
                        Portion Weight (Grams)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="3000"
                        placeholder="100"
                        value={customWeightGrams}
                        onChange={(e) => setCustomWeightGrams(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs font-bold text-white font-numeric focus:outline-none focus:border-slate-400 transition-colors"
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
                          value={customServingName}
                          onChange={(e) => setCustomServingName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition-colors"
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
                          value={customServingGramsWeight}
                          onChange={(e) => setCustomServingGramsWeight(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs font-bold text-white font-numeric focus:outline-none focus:border-slate-400 transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Nutritional Values */}
                <div className="relative z-0 p-3 sm:p-3.5 rounded-xl bg-[#090e17] border border-[#141b26] space-y-2.5 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    {customPortionType === 'grams'
                      ? `Nutritional Values (${customWeightGrams ? customWeightGrams + 'g' : '100g'})`
                      : `Nutritional Values (${customServingName.trim() || '1 Serving'})`}
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg bg-[#05080e] border border-[#16202e]">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                        Calories (kcal)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="3000"
                        placeholder="0"
                        value={customCalories}
                        onChange={(e) => setCustomCalories(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#070a0f] border border-[#16202e] text-sm font-bold text-white font-numeric focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    <div className="p-2 rounded-lg bg-[#05080e] border border-[#16202e]">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.1"
                        placeholder="0"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#070a0f] border border-[#16202e] text-sm font-bold text-white font-numeric focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    <div className="p-2 rounded-lg bg-[#05080e] border border-[#16202e]">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="300"
                        step="0.1"
                        placeholder="0"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#070a0f] border border-[#16202e] text-sm font-bold text-white font-numeric focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    <div className="p-2 rounded-lg bg-[#05080e] border border-[#16202e]">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                        Fats (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.1"
                        placeholder="0"
                        value={customFats}
                        onChange={(e) => setCustomFats(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-[#070a0f] border border-[#16202e] text-sm font-bold text-white font-numeric focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#141b26]">
                  <button
                    type="button"
                    onClick={() => setIsCustomFoodOpen(false)}
                    className="py-1.5 px-4 rounded-xl bg-[#05080e] hover:bg-white/[0.06] border border-[#16202e] text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="py-1.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    Save to Library & Use
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================= */
            /* 2. FOOD LIBRARY VIEW (Search, Choices List & Split View)  */
            /* ========================================================= */
            <>
              {/* 1. Modal Top Bar - Obsidian Clean */}
              <div className="flex items-center justify-between p-3.5 sm:px-5 border-b border-[#141b26] bg-[#070a0f] flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                      Food Library
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300 border border-white/10 font-bold">
                      Adding to: {targetMealName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Search verified ingredients, select portion in grams, and add to your meal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBarcodeModalOpen(true)}
                    className="py-1.5 px-3 rounded-lg bg-[#05080e] hover:bg-white/[0.06] border border-[#16202e] hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Scan Barcode
                  </button>

                  <button
                    ref={customFoodBtnRef}
                    type="button"
                    onClick={() => setIsCustomFoodOpen(true)}
                    className="py-1.5 px-3 rounded-lg bg-[#05080e] hover:bg-white/[0.06] border border-[#16202e] hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer active:scale-95"
                  >
                    Add Custom Food
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-[#05080e] border border-[#16202e] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer hover:border-white/20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. Filters & Search Bar */}
              <div className="p-3 sm:px-5 border-b border-[#141b26] bg-[#070a0f] space-y-2 flex-shrink-0">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search food by name (e.g. Chicken, Oats, Rice, Tuna, Beef, Greek Yogurt)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (activeIsolatedFood) setActiveIsolatedFood(null);
                    }}
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>

                {/* Category Pills & Preparation Toggle - Unified Design */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#05080e] border border-[#16202e] overflow-x-auto custom-scrollbar pb-1 sm:pb-0.5">
                    {categories.map((cat) => {
                      const isActive = selectedCategory === cat.id && !activeIsolatedFood;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setActiveIsolatedFood(null);
                            setSelectedCategory(cat.id);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Cooked vs Raw Filter - Unified Design */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#05080e] border border-[#16202e] self-start sm:self-auto flex-shrink-0">
                    {(['all', 'cooked', 'raw'] as const).map((prep) => {
                      const isActive = selectedPrep === prep;
                      return (
                        <button
                          key={prep}
                          type="button"
                          onClick={() => setSelectedPrep(prep)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer capitalize ${
                            isActive
                              ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                          }`}
                        >
                          {prep === 'all' ? 'All Prep' : prep}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Main Split View: Left Food List & Right Grams Engine */}
              <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-[#05080e]">
                
                {/* Left Column: Food List */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-1.5 border-r border-[#141b26]">
                  {/* Isolated Action Banner (When scanned or custom added) */}
                  {activeIsolatedFood && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.05] border border-white/15 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-xs font-semibold text-slate-200">
                          {activeIsolatedFood.barcode ? `Scanned Product (${activeIsolatedFood.barcode})` : 'New Custom Food Added'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveIsolatedFood(null);
                          setSearchQuery('');
                        }}
                        className="text-[11px] font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#05080e] border border-[#16202e] hover:border-white/20 transition-all cursor-pointer"
                      >
                        View All Foods
                      </button>
                    </div>
                  )}

                  {displayedFoods.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                      <p className="text-xs text-slate-400">
                        No foods found matching &quot;{searchQuery}&quot;.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsCustomFoodOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#090e17] border border-[#16202e] text-slate-200 text-xs font-medium hover:border-white/20 cursor-pointer"
                      >
                        Add as Custom Food
                      </button>
                    </div>
                  ) : (
                    displayedFoods.map((food) => {
                      const isSelected = activeFood?.id === food.id;
                      return (
                        <div
                          key={food.id}
                          onClick={() => handleSelectFoodItem(food)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-[#0c1424] border-white/25 text-white shadow-xs'
                              : 'bg-[#070a10] border-[#141b26] hover:bg-[#0a0f1a] hover:border-white/10 text-slate-300'
                          }`}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-white truncate">
                                {food.nameEn}
                              </span>
                              
                              {/* Preparation State Badge */}
                              <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded border bg-[#05080e] border-[#16202e] text-slate-400 font-medium">
                                {food.preparation === 'cooked' ? 'Cooked' : food.preparation === 'raw' ? 'Raw' : food.preparation}
                              </span>

                              {/* Standard Serving Size Badge */}
                              {food.defaultServingGrams && food.defaultServingGrams !== 100 && (
                                <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/10 font-semibold">
                                  {food.servingUnit || `${food.defaultServingGrams}g`}
                                </span>
                              )}

                              {food.barcode && (
                                <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-[#16202e]">
                                  Barcode
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Per 100g Macro Strip */}
                          <div className="text-right flex-shrink-0 font-mono text-xs">
                            <span className="font-bold text-white font-numeric block">
                              {food.calories} kcal
                            </span>
                            <span className="text-[10px] text-slate-400 block font-numeric">
                              {food.proteinG}P &bull; {food.carbsG}C &bull; {food.fatsG}F
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right Column: Instant Grams Engine */}
                {activeFood && (
                  <div className="w-full md:w-80 min-h-0 bg-[#070a0f] flex flex-col flex-shrink-0 border-t md:border-t-0 md:border-l border-[#141b26] overflow-y-auto custom-scrollbar">
                    <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3 min-h-min">
                      <div className="space-y-3">
                        
                        {/* Selected Food Header */}
                        <div className="space-y-0.5 pb-2 border-b border-[#141b26]">
                          <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                            Configuring Portion
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug truncate">
                            {activeFood.nameEn}
                          </h4>
                          {activeFood.brand && (
                            <span className="text-[10px] text-slate-400 block">
                              {activeFood.brand}
                            </span>
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

                          {/* Mode Toggle: Manual vs Preset - Unified Design */}
                          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#05080e] border border-[#16202e]">
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
                                  className="w-full px-3 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] focus:border-slate-400 text-sm font-bold text-white font-numeric focus:outline-none transition-all"
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
                                    className="flex-1 py-1 rounded-md bg-[#05080e] hover:bg-white/[0.06] border border-[#16202e] hover:border-white/20 text-[10px] font-mono font-medium text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
                                  >
                                    {delta > 0 ? `+${delta}` : delta}g
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            /* Quick Grams Presets Grid - Unified Design */
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
                                      : 'bg-[#05080e] border border-[#16202e] text-slate-400 hover:text-white hover:border-white/10'
                                  }`}
                                >
                                  {g}g
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Real-time Calculated Nutrition Facts */}
                        <div className="p-2.5 rounded-xl bg-[#05080e] border border-[#141b26] space-y-2">
                          <div className="flex items-baseline justify-between border-b border-[#141b26] pb-1.5">
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
                            <div className="p-1.5 rounded-lg bg-[#070a0f] border border-[#16202e]">
                              <span className="text-[9px] font-mono uppercase text-slate-400 block font-medium">
                                Protein
                              </span>
                              <span className="text-xs font-bold text-white font-numeric mt-0.5 block">
                                {calculatedMacros.proteinG}g
                              </span>
                            </div>

                            <div className="p-1.5 rounded-lg bg-[#070a0f] border border-[#16202e]">
                              <span className="text-[9px] font-mono uppercase text-slate-400 block font-medium">
                                Carbs
                              </span>
                              <span className="text-xs font-bold text-white font-numeric mt-0.5 block">
                                {calculatedMacros.carbsG}g
                              </span>
                            </div>

                            <div className="p-1.5 rounded-lg bg-[#070a0f] border border-[#16202e]">
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

                      {/* Confirm Add Button Sticky at Bottom */}
                      <div className="pt-2 sticky bottom-0 bg-[#070a0f]/95 backdrop-blur-sm -mx-3.5 -mb-3.5 p-3.5 border-t border-[#141b26] flex-shrink-0 z-10">
                        <button
                          type="button"
                          onClick={handleConfirmAdd}
                          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer text-center"
                        >
                          Add {portionGrams || activeFood.defaultServingGrams || 100}g to {targetMealName}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onFoodFound={handleBarcodeFoodFound}
      />
    </>
  );
};
