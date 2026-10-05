'use client';

import React, { useState } from 'react';
import { DietPlan, FoodItem } from '@/types';
import { FoodSearchModal } from './FoodSearchModal';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { ArrowLeft } from 'lucide-react';
import { useNutritionPlanBuilder } from '@/hooks/useNutritionPlanBuilder';
import { NutritionCalendarStrip } from './builder/NutritionCalendarStrip';
import { DietMealCard } from './builder/DietMealCard';

interface NutritionPlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: DietPlan | null;
  targetUserId?: string;
}

export const NutritionPlanBuilderModal: React.FC<NutritionPlanBuilderModalProps> = (props) => {
  const { isOpen, onClose, initialPlan } = props;
  const builder = useNutritionPlanBuilder(props);

  // Local UI-only state: customFoods catalog created in session, meal view mode, collapsed meals
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [mealsViewMode, setMealsViewMode] = useState<'stacked' | 'grid'>('stacked');
  const [collapsedMealIds, setCollapsedMealIds] = useState<Record<string, boolean>>({});

  const toggleMealCollapse = (mealId: string) => {
    setCollapsedMealIds((prev) => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  if (!isOpen) return null;

  const {
    title,
    setTitle,
    description,
    setDescription,
    selectedUserId,
    setSelectedUserId,
    targetCalories,
    setTargetCalories,
    targetProteinG,
    setTargetProteinG,
    targetCarbsG,
    setTargetCarbsG,
    targetFatsG,
    setTargetFatsG,
    waterTargetLiters,
    setWaterTargetLiters,
    trainees,
    targetAthlete,
    todayKey,
    selectedDate,
    visibleDateKeys,
    currentDateLabel,
    dayType,
    setDayType,
    handleSelectDate,
    handlePrevDay,
    handleNextDay,
    handleCopyToTomorrow,
    handleResetDay,
    meals,
    handleAddMeal,
    handleDuplicateMeal,
    handleRemoveMeal,
    handleUpdateMeal,
    handleSelectFoodItem,
    handleUpdateItemGrams,
    handleRemoveItem,
    handleSelectAltFood,
    handleRemoveAlt,
    isFoodSearchOpen,
    setIsFoodSearchOpen,
    activeTargetMealId,
    handleOpenFoodSearch,
    isAltFoodSearchOpen,
    setIsAltFoodSearchOpen,
    handleOpenAltSearch,
    expandedItemIds,
    toggleItemExpand,
    mobileView,
    setMobileView,
    dailyTotals,
    caloriesDelta,
    macroRatios,
    calProgressPct,
    proteinProgressPct,
    carbsProgressPct,
    fatsProgressPct,
    handleSave
  } = builder;

  const activeTargetMeal = meals.find((m) => m.id === activeTargetMealId);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#070a0f] flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150 select-none text-slate-100 font-sans">
        
        {/* 1. Studio Edge-to-Edge Top Navigation Bar */}
        <header className="flex-shrink-0 border-b border-white/[0.08] bg-[#090d14] px-3 sm:px-5 py-2 z-30 flex items-center justify-between gap-3">
          {/* Left: Back Arrow, Title, Athlete Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex-shrink-0"
              title="Close diet studio"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0 leading-none hidden md:inline">
                Diet Studio
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0 hidden md:inline" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Diet Plan Title..."
                className="text-xs sm:text-sm font-bold text-white tracking-tight bg-transparent border-b border-transparent hover:border-[#1e293b] focus:border-slate-500 focus:outline-none px-1 py-0.5 truncate max-w-[140px] sm:max-w-xs leading-none"
              />
              {targetAthlete && (
                <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9.5px] font-mono text-slate-300 font-bold flex-shrink-0 truncate max-w-[120px] sm:max-w-none leading-none hidden sm:inline-block">
                  FOR {targetAthlete.name.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Center: Interactive Day-by-Day Calendar Navigation Strip */}
          <NutritionCalendarStrip
            visibleDateKeys={visibleDateKeys}
            selectedDate={selectedDate}
            todayKey={todayKey}
            dailySchedules={{}}
            currentMealsCount={meals.length}
            onSelectDate={handleSelectDate}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
          />

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-block px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {initialPlan ? 'Save Diet Plan' : 'Publish Diet Plan'}
            </button>
          </div>
        </header>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden items-center justify-center p-1 rounded-lg bg-[#05080e] border border-[#16202e] text-xs font-semibold m-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMobileView('meals')}
            className={`flex-1 py-1 rounded text-center transition-all ${
              mobileView === 'meals'
                ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Meals ({meals.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileView('targets')}
            className={`flex-1 py-1 rounded text-center transition-all ${
              mobileView === 'targets'
                ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Targets & Macros
          </button>
        </div>

        {/* 2. Studio Body: Responsive 2-Column Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full relative">
          
          {/* Left Sidebar: Targets & Macro Engine */}
          <aside className={`w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-[#141b26] bg-[#080c14] flex flex-col h-full overflow-hidden ${
            mobileView === 'targets' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'
          }`}>
            {/* Scrollable Form Cards */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
              
              {/* Card 1: Target Athlete & Day Protocol */}
              <div className="p-3 rounded-xl bg-[#090e17] border border-[#141b26] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Athlete & Day Directive
                </span>

                <div>
                  <SelectDropdown
                    label="Target Athlete"
                    value={selectedUserId || ''}
                    onChange={(val) => setSelectedUserId(String(val) || '')}
                    options={trainees.map((t) => ({
                      value: t.id,
                      label: `${t.name} (${t.goal || 'Athlete'})`
                    }))}
                    placeholder="Select Athlete..."
                  />
                  {targetAthlete && (
                    <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5">
                      <span>Status: <strong className="text-slate-300 font-normal">{targetAthlete.goal || 'Hypertrophy'}</strong></span>
                      <span>Weight: <strong className="text-slate-200 font-numeric">{targetAthlete.weightKg || 80} kg</strong></span>
                    </div>
                  )}
                </div>

                {/* Day Type Selector */}
                <div>
                  <label className="block text-[9.5px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Day Type ({currentDateLabel.main})
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-[#05080e] border border-[#16202e]">
                    <button
                      type="button"
                      onClick={() => setDayType('training')}
                      className={`py-1 rounded text-[10px] font-semibold transition-all cursor-pointer text-center ${
                        dayType === 'training'
                          ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Training
                    </button>
                    <button
                      type="button"
                      onClick={() => setDayType('rest')}
                      className={`py-1 rounded text-[10px] font-semibold transition-all cursor-pointer text-center ${
                        dayType === 'rest'
                          ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Rest
                    </button>
                    <button
                      type="button"
                      onClick={() => setDayType('refeed')}
                      className={`py-1 rounded text-[10px] font-semibold transition-all cursor-pointer text-center ${
                        dayType === 'refeed'
                          ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Refeed
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9.5px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Protocol Notes
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Carb cycling, high water intake"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Card 2: Unified Telemetry & Target Engine */}
              <div className="p-3 rounded-xl bg-[#090e17] border border-[#141b26] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Macro & Calorie Telemetry
                </span>

                {/* Calorie Engine */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">DAILY CALORIES</span>
                    <div className="flex items-center gap-1 bg-[#05080e] px-2 py-0.5 rounded-md border border-[#16202e] focus-within:border-slate-500">
                      <input
                        type="number"
                        step="50"
                        value={targetCalories}
                        onChange={(e) => setTargetCalories(Number(e.target.value) || 0)}
                        className="w-12 text-right text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
                      />
                      <span className="text-[9.5px] font-mono text-slate-500">kcal</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-numeric font-bold text-white">{dailyTotals.calories}</span>
                      <span className="text-[10px] font-mono text-slate-500">/ {targetCalories} kcal</span>
                    </div>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/[0.06] border border-white/10 text-slate-300">
                      {caloriesDelta === 0 ? 'On Target' : caloriesDelta > 0 ? `+${caloriesDelta} Over` : `${Math.abs(caloriesDelta)} kcal Left`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-[#05080e] rounded-full overflow-hidden border border-[#16202e]">
                    <div
                      className="h-full bg-slate-300 transition-all duration-300"
                      style={{ width: `${calProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Macronutrients 3-Column Grid */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {/* Protein */}
                  <div className="p-2 rounded-lg bg-[#05080e] border border-[#16202e] space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>PROTEIN</span>
                      <span className="text-slate-300 font-bold">{macroRatios.proteinPct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={targetProteinG}
                        onChange={(e) => setTargetProteinG(Number(e.target.value) || 0)}
                        className="w-8 text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
                      />
                      <span className="text-[9px] text-slate-500 font-mono">g</span>
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-300 truncate">
                      <strong className="text-white font-numeric">{dailyTotals.proteinG}</strong>/{targetProteinG}g
                    </div>
                    <div className="h-1 w-full bg-[#0a101a] rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 transition-all" style={{ width: `${proteinProgressPct}%` }} />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="p-2 rounded-lg bg-[#05080e] border border-[#16202e] space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>CARBS</span>
                      <span className="text-slate-300 font-bold">{macroRatios.carbsPct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={targetCarbsG}
                        onChange={(e) => setTargetCarbsG(Number(e.target.value) || 0)}
                        className="w-8 text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
                      />
                      <span className="text-[9px] text-slate-500 font-mono">g</span>
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-300 truncate">
                      <strong className="text-white font-numeric">{dailyTotals.carbsG}</strong>/{targetCarbsG}g
                    </div>
                    <div className="h-1 w-full bg-[#0a101a] rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 transition-all" style={{ width: `${carbsProgressPct}%` }} />
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="p-2 rounded-lg bg-[#05080e] border border-[#16202e] space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>FATS</span>
                      <span className="text-slate-300 font-bold">{macroRatios.fatsPct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={targetFatsG}
                        onChange={(e) => setTargetFatsG(Number(e.target.value) || 0)}
                        className="w-8 text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
                      />
                      <span className="text-[9px] text-slate-500 font-mono">g</span>
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-300 truncate">
                      <strong className="text-white font-numeric">{dailyTotals.fatsG}</strong>/{targetFatsG}g
                    </div>
                    <div className="h-1 w-full bg-[#0a101a] rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 transition-all" style={{ width: `${fatsProgressPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Hydration Target Row */}
                <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-400 border-t border-[#16202e]">
                  <span className="text-[10px]">Hydration Target:</span>
                  <div className="flex items-center gap-1 bg-[#05080e] px-2 py-0.5 rounded-md border border-[#16202e]">
                    <input
                      type="number"
                      step="0.5"
                      value={waterTargetLiters}
                      onChange={(e) => setWaterTargetLiters(Number(e.target.value) || 3)}
                      className="w-8 text-right text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
                    />
                    <span className="text-[9.5px] text-slate-500 font-mono">L/day</span>
                  </div>
                </div>

                {/* Day Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#16202e]">
                  <button
                    type="button"
                    onClick={handleCopyToTomorrow}
                    className="py-1.5 px-2 rounded-lg text-[10.5px] font-medium text-slate-300 hover:text-white bg-[#05080e] hover:bg-white/[0.06] border border-[#16202e] hover:border-white/20 transition-all cursor-pointer active:scale-95 text-center truncate"
                    title="Copy today's meals to tomorrow"
                  >
                    Copy to Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDay}
                    className="py-1.5 px-2 rounded-lg text-[10.5px] font-medium text-slate-400 hover:text-rose-300 bg-[#05080e] hover:bg-rose-500/10 border border-[#16202e] hover:border-rose-500/20 transition-all cursor-pointer active:scale-95 text-center truncate"
                    title="Reset meals for this day"
                  >
                    Reset Day
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Metrics Footer */}
            <div className="p-3 border-t border-[#141b26] bg-[#090e17] flex items-center justify-between text-[10px] font-mono text-slate-400 flex-shrink-0">
              <span>Meals: <strong className="text-white font-numeric">{meals.length} Prescribed</strong></span>
              <span>Water: <strong className="text-slate-200 font-numeric">{waterTargetLiters} L/day</strong></span>
            </div>
          </aside>

          {/* Right Main Canvas: Prescribed Daily Meals */}
          <main className={`flex-1 flex-col bg-[#05080e] overflow-hidden min-w-0 ${
            mobileView === 'meals' ? 'flex' : 'hidden md:flex'
          }`}>
            
            {/* Canvas Sub-Header */}
            <div className="min-h-10 py-1.5 flex-shrink-0 px-3 sm:px-4 border-b border-[#141b26] bg-[#070a0f] flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              {/* Left: Section Title + Day Type Tag + Add Meal Button */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                    Meals &bull; {currentDateLabel.main}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-medium text-slate-300 bg-white/[0.05] border border-white/10 flex-shrink-0 hidden sm:inline-block">
                    {dayType === 'training' ? 'Training Day' : dayType === 'rest' ? 'Rest Day' : 'Refeed'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ({meals.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddMeal}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#080c14] bg-white hover:bg-slate-100 transition-all shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
                  title="Add a new meal to this day"
                >
                  + Add Meal
                </button>
              </div>

              {/* Right: View Mode Toggle & Prescribed Calories Telemetry */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 flex-shrink-0">
                <div className="flex items-center p-0.5 rounded-lg bg-[#05080e] border border-white/[0.06] text-[10px]">
                  <button
                    type="button"
                    onClick={() => setMealsViewMode('stacked')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                      mealsViewMode === 'stacked'
                        ? 'bg-white/[0.1] text-white font-bold border border-white/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Stacked View"
                  >
                    Stacked
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealsViewMode('grid')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                      mealsViewMode === 'grid'
                        ? 'bg-white/[0.1] text-white font-bold border border-white/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    Grid
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Prescribed: <strong className="text-white font-numeric font-bold">{dailyTotals.calories} kcal</strong>
                </span>
              </div>
            </div>

            {/* Canvas Scrollable Meals List */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 custom-scrollbar">
              <div className={mealsViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-2 items-start' : 'space-y-2'}>
                {meals.map((meal, mealIdx) => (
                  <DietMealCard
                    key={meal.id}
                    meal={meal}
                    index={mealIdx}
                    totalMealsCount={meals.length}
                    isCollapsed={Boolean(collapsedMealIds[meal.id])}
                    expandedItemIds={expandedItemIds}
                    onToggleCollapse={() => toggleMealCollapse(meal.id)}
                    onToggleItemExpand={toggleItemExpand}
                    onUpdateMeal={(field, val) => handleUpdateMeal(meal.id, field, val)}
                    onDuplicateMeal={() => handleDuplicateMeal(meal.id)}
                    onRemoveMeal={() => handleRemoveMeal(meal.id)}
                    onOpenFoodSearch={() => handleOpenFoodSearch(meal.id)}
                    onUpdateItemGrams={(itemId, grams) => handleUpdateItemGrams(meal.id, itemId, grams)}
                    onRemoveItem={(itemId) => handleRemoveItem(meal.id, itemId)}
                    onOpenAltSearch={(itemId) => handleOpenAltSearch(meal.id, itemId)}
                    onRemoveAlt={(itemId, altId) => handleRemoveAlt(meal.id, itemId, altId)}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Primary Food Search Modal */}
      <FoodSearchModal
        isOpen={isFoodSearchOpen}
        onClose={() => setIsFoodSearchOpen(false)}
        targetMealName={activeTargetMeal?.name || 'Meal'}
        onSelectFood={handleSelectFoodItem}
        customFoods={customFoods}
        onAddCustomFood={(food) => setCustomFoods([...customFoods, food])}
      />

      {/* Alternative Food Search Modal */}
      <FoodSearchModal
        isOpen={isAltFoodSearchOpen}
        onClose={() => setIsAltFoodSearchOpen(false)}
        targetMealName="Alternative"
        onSelectFood={handleSelectAltFood}
        customFoods={customFoods}
        onAddCustomFood={(food) => setCustomFoods([...customFoods, food])}
      />
    </>
  );
};
