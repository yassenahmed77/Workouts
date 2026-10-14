'use client';
import React, { useState } from 'react';
import { FoodSearchModal } from './FoodSearchModal';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, FileText, X, Plus } from 'lucide-react';
import { useNutritionPlanBuilder } from '@/hooks/useNutritionPlanBuilder';
import { NutritionCalendarStrip } from './builder/NutritionCalendarStrip';
import { DietMealCard } from './builder/DietMealCard';
const MacroRing = ({ label, current, target, color }) => {
    const radius = 22;
    const stroke = 3.5;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    return (<div className="flex flex-col items-center justify-center p-1 flex-1 min-w-0">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          <circle stroke="rgba(255, 255, 255, 0.08)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius}/>
          <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.4s ease' }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none pointer-events-none">
          <span className="text-[11px] font-numeric font-bold text-white">
            {current}
          </span>
          <span className="text-[7px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">
            {label}
          </span>
        </div>
      </div>
      <span className="text-[9px] font-mono text-slate-500 mt-0.5 truncate">
        /{target}g
      </span>
    </div>);
};
export const NutritionPlanBuilderModal = (props) => {
    const { isOpen, onClose, initialPlan } = props;
    const builder = useNutritionPlanBuilder(props);
    // Local UI-only state: customFoods catalog created in session, meal view mode, collapsed meals, notes modal
    const [customFoods, setCustomFoods] = useState([]);
    const [mealsViewMode, setMealsViewMode] = useState('stacked');
    const [collapsedMealIds, setCollapsedMealIds] = useState({});
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const toggleMealCollapse = (mealId) => {
        setCollapsedMealIds((prev) => ({
            ...prev,
            [mealId]: !prev[mealId]
        }));
    };
    if (!isOpen)
        return null;
    const { title, setTitle, description, setDescription, selectedUserId, setSelectedUserId, targetCalories, setTargetCalories, targetProteinG, setTargetProteinG, targetCarbsG, setTargetCarbsG, targetFatsG, setTargetFatsG, waterTargetLiters, setWaterTargetLiters, trainees, targetAthlete, todayKey, selectedDate, visibleDateKeys, dailySchedules, currentDateLabel, dayType, setDayType, handleSelectDate, handlePrevDay, handleNextDay, handleCopyToTomorrow, handleResetDay, meals, handleAddMeal, handleDuplicateMeal, handleRemoveMeal, handleUpdateMeal, handleSelectFoodItem, handleUpdateItemGrams, handleRemoveItem, handleSelectAltFood, handleUpdateAltGrams, handleRemoveAlt, isFoodSearchOpen, setIsFoodSearchOpen, activeTargetMealId, setActiveTargetMealId, handleOpenFoodSearch, isAltFoodSearchOpen, setIsAltFoodSearchOpen, altTargetMealId, altTargetItemId, handleOpenAltSearch, expandedItemIds, toggleItemExpand, mobileView, setMobileView, dailyTotals, caloriesDelta, macroRatios, calProgressPct, proteinProgressPct, carbsProgressPct, fatsProgressPct, handleSave } = builder;
    const activeTargetMeal = meals.find((m) => m.id === activeTargetMealId);
    const altTargetMeal = meals.find((m) => m.id === altTargetMealId);
    const altTargetItem = altTargetMeal?.items?.find((i) => i.id === altTargetItemId);
    const altExcludeFoodIds = altTargetItem ? [
        altTargetItem.foodId, 
        altTargetItem.name, 
        ...(altTargetItem.badeel || []).flatMap((b) => [b.foodId, b.name])
    ].filter(Boolean) : [];
    return (<>
      <div className="fixed inset-0 z-50 bg-[var(--card-bg)] flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150 select-none text-slate-100 font-sans">
        
        {/* 1. Studio Edge-to-Edge Top Navigation Bar */}
        <header className="flex-shrink-0 border-b border-white/[0.08] bg-[var(--card-bg)] px-3 sm:px-5 py-2 z-30 flex items-center justify-between gap-3">
          {/* Left: Back Arrow, Title, Athlete Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-shrink-0">
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex-shrink-0" title="Close diet studio">
              <ArrowLeft className="w-4 h-4"/>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0 leading-none hidden md:inline">
                Diet Studio
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0 hidden md:inline"/>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Diet Plan Title..." className="text-xs sm:text-sm font-bold text-white tracking-tight bg-transparent border-b border-transparent hover:border-[var(--card-border)] focus:border-[var(--main-color)] focus:outline-none px-1 py-0.5 truncate max-w-[140px] sm:max-w-xs leading-none"/>
              {targetAthlete && (<span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9.5px] font-mono text-slate-300 font-bold flex-shrink-0 truncate max-w-[120px] sm:max-w-none leading-none hidden sm:inline-block">
                  FOR {targetAthlete.name.toUpperCase()}
                </span>)}
            </div>
          </div>

          {/* Center: Interactive Day-by-Day Calendar Navigation Strip (Desktop & Tablet: md and above) */}
          <div className="hidden md:flex flex-1 min-w-0 items-center justify-center">
            <NutritionCalendarStrip visibleDateKeys={visibleDateKeys} selectedDate={selectedDate} todayKey={todayKey} dailySchedules={dailySchedules || {}} currentMealsCount={meals.length} onSelectDate={handleSelectDate} onPrevDay={handlePrevDay} onNextDay={handleNextDay}/>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button type="button" onClick={onClose} className="hidden sm:inline-block px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">
              Cancel
            </button>

            {/* Mobile-Only Header Publish Button (Strictly hidden on tablet & desktop ports) */}
            <button
              type="button"
              onClick={handleSave}
              className="gym-btn-primary text-xs !hidden max-md:!inline-flex"
            >
              {initialPlan ? 'Save Diet Plan' : 'Publish Diet Plan'}
            </button>
          </div>
        </header>

        {/* Mobile-Only Dedicated Date Row: Single day with Prev/Next arrows & Calendar Picker */}
        <div className="flex md:hidden items-center justify-between px-3 py-1.5 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex-shrink-0">
          <button type="button" onClick={handlePrevDay} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer" title="Previous Day">
            <ChevronLeft className="w-4 h-4"/>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-white tracking-tight">
              {currentDateLabel.main}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {currentDateLabel.sub}
            </span>
            {currentDateLabel.isToday && (<span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)] flex-shrink-0"/>)}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button type="button" onClick={handleNextDay} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer" title="Next Day">
              <ChevronRight className="w-4 h-4"/>
            </button>

            <label className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer relative" title="Pick Date">
              <Calendar className="w-3.5 h-3.5"/>
              <input type="date" value={selectedDate} onChange={(e) => {
            if (e.target.value)
                handleSelectDate(e.target.value);
        }} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"/>
            </label>
          </div>
        </div>

        {/* 2. Studio Body: Responsive 2-Column Workspace (Desktop) & 65/35 Split (Mobile) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full relative">
          
          {/* Left Sidebar: Targets & Macro Engine (Desktop & Tablet only: md and above) */}
          <aside className="hidden md:flex md:w-80 flex-shrink-0 border-r border-[var(--card-border)] bg-[var(--card-bg)] flex-col h-full overflow-hidden">
            {/* Scrollable Form Cards */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
              
              {/* Card 1: Target Athlete & Day Protocol */}
              <div className="p-3 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Athlete & Day Directive
                </span>

                <div>
                  <SelectDropdown label="Target Athlete" value={selectedUserId || ''} onChange={(val) => setSelectedUserId(String(val) || '')} options={trainees.map((t) => ({
            value: t.id,
            label: `${t.name} (${t.goal || 'Athlete'})`
        }))} placeholder="Select Athlete..."/>
                  {targetAthlete && (<div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5">
                      <span>Status: <strong className="text-slate-300 font-normal">{targetAthlete.goal || 'Hypertrophy'}</strong></span>
                      <span>Weight: <strong className="text-slate-200 font-numeric">{targetAthlete.weightKg || 80} kg</strong></span>
                    </div>)}
                </div>

                {/* Day Type Selector */}
                <div>
                  <label className="block text-[9.5px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Day Type ({currentDateLabel.main})
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)]">
                    <button type="button" onClick={() => setDayType('training')} className={`py-1 rounded text-[10px] font-semibold transition-all cursor-pointer text-center ${dayType === 'training'
            ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
            : 'text-slate-400 hover:text-white'}`}>
                      Training
                    </button>
                    <button type="button" onClick={() => setDayType('rest')} className={`py-1 rounded text-[10px] font-semibold transition-all cursor-pointer text-center ${dayType === 'rest'
            ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
            : 'text-slate-400 hover:text-white'}`}>
                      Rest
                    </button>
                    <button type="button" onClick={() => setDayType('refeed')} className={`py-1 rounded text-[10px] font-semibold transition-all cursor-pointer text-center ${dayType === 'refeed'
            ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
            : 'text-slate-400 hover:text-white'}`}>
                      Refeed
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9.5px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Protocol Notes
                  </label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Carb cycling, high water intake" className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[var(--main-color)] transition-colors"/>
                </div>
              </div>

              {/* Card 2: Unified Telemetry & Target Engine */}
              <div className="p-3 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Macro & Calorie Telemetry
                </span>

                {/* Calorie Engine */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">DAILY CALORIES</span>
                    <div className="flex items-center gap-1 bg-[var(--input-bg)] px-2 py-0.5 rounded-md border border-[var(--input-border)] focus-within:border-[var(--main-color)]">
                      <input type="number" step="50" value={targetCalories} onChange={(e) => setTargetCalories(Number(e.target.value) || 0)} className="w-12 text-right text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"/>
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
                  <div className="h-1.5 w-full bg-[var(--card-bg)] rounded-full overflow-hidden border border-[var(--card-border)]">
                    <div className="h-full bg-[var(--main-color)] transition-all duration-300" style={{ width: `${calProgressPct}%` }}/>
                  </div>
                </div>

                {/* Macronutrients 3-Column Grid */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {/* Protein */}
                  <div className="p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>PROTEIN</span>
                      <span className="text-slate-300 font-bold">{macroRatios.proteinPct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input type="number" value={targetProteinG} onChange={(e) => setTargetProteinG(Number(e.target.value) || 0)} className="w-8 text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"/>
                      <span className="text-[9px] text-slate-500 font-mono">g</span>
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-300 truncate">
                      <strong className="text-white font-numeric">{dailyTotals.proteinG}</strong>/{targetProteinG}g
                    </div>
                    <div className="h-1 w-full bg-[var(--card-border)] rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 transition-all" style={{ width: `${proteinProgressPct}%` }}/>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>CARBS</span>
                      <span className="text-slate-300 font-bold">{macroRatios.carbsPct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input type="number" value={targetCarbsG} onChange={(e) => setTargetCarbsG(Number(e.target.value) || 0)} className="w-8 text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"/>
                      <span className="text-[9px] text-slate-500 font-mono">g</span>
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-300 truncate">
                      <strong className="text-white font-numeric">{dailyTotals.carbsG}</strong>/{targetCarbsG}g
                    </div>
                    <div className="h-1 w-full bg-[var(--card-border)] rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 transition-all" style={{ width: `${carbsProgressPct}%` }}/>
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>FATS</span>
                      <span className="text-slate-300 font-bold">{macroRatios.fatsPct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input type="number" value={targetFatsG} onChange={(e) => setTargetFatsG(Number(e.target.value) || 0)} className="w-8 text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"/>
                      <span className="text-[9px] text-slate-500 font-mono">g</span>
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-300 truncate">
                      <strong className="text-white font-numeric">{dailyTotals.fatsG}</strong>/{targetFatsG}g
                    </div>
                    <div className="h-1 w-full bg-[var(--card-border)] rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 transition-all" style={{ width: `${fatsProgressPct}%` }}/>
                    </div>
                  </div>
                </div>

                {/* Hydration Target Row */}
                <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-400 border-t border-[var(--card-border)]">
                  <span className="text-[10px]">Hydration Target:</span>
                  <div className="flex items-center gap-1 bg-[var(--input-bg)] px-2 py-0.5 rounded-md border border-[var(--input-border)]">
                    <input type="number" step="0.5" value={waterTargetLiters} onChange={(e) => setWaterTargetLiters(Number(e.target.value) || 3)} className="w-8 text-right text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"/>
                    <span className="text-[9.5px] text-slate-500 font-mono">L/day</span>
                  </div>
                </div>

                {/* Day Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[var(--card-border)]">
                  <button type="button" onClick={handleCopyToTomorrow} className="py-1.5 px-2 rounded-lg text-[10.5px] font-medium text-slate-300 hover:text-white bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-white/20 transition-all cursor-pointer active:scale-95 text-center truncate" title="Copy today's meals to tomorrow">
                    Copy to Tomorrow
                  </button>
                  <button type="button" onClick={handleResetDay} className="py-1.5 px-2 rounded-lg text-[10.5px] font-medium text-slate-400 hover:text-rose-300 bg-[var(--card-subtle-bg)] hover:bg-rose-500/10 border border-[var(--card-border)] hover:border-rose-500/20 transition-all cursor-pointer active:scale-95 text-center truncate" title="Reset meals for this day">
                    Reset Day
                  </button>
                </div>
              </div>

            </div>

            {/* Left Sidebar Footer: Quick Metrics & Publish Diet Plan Action (Desktop & Tablet: md and above) */}
            <div className="p-3 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Meals: <strong className="text-white font-numeric">{meals.length} Prescribed</strong></span>
                <span>Water: <strong className="text-slate-200 font-numeric">{waterTargetLiters} L/day</strong></span>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="gym-btn-primary w-full py-2.5 px-3 text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] transition-transform"
              >
                {initialPlan ? 'Save Diet Plan' : 'Publish Diet Plan'}
              </button>
            </div>
          </aside>

          {/* Right Main Canvas: Prescribed Daily Meals (and Mobile 35% Top Macro Widget) */}
          <main className="flex-1 flex flex-col bg-[var(--card-subtle-bg)] overflow-hidden min-w-0">
            
            {/* Mobile-Only 35% Macro & Targets Widget */}
            <div className="flex md:hidden flex-col p-2.5 border-b border-[var(--card-border)] bg-[var(--card-bg)] space-y-2 flex-shrink-0">
              {/* 1. Calories Progress Bar Header (Matches Exact Screenshot: 0 / 2400 kcal on left, 2400 kcal Left badge on right, progress bar below) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--main-color)] flex-shrink-0 animate-pulse"/>
                    <span className="text-xs font-numeric font-bold text-white">
                      {dailyTotals.calories}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      / {targetCalories} kcal
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-white/[0.04] border border-white/10 text-slate-300 flex-shrink-0">
                    {caloriesDelta === 0 ? 'On Target' : caloriesDelta > 0 ? `+${caloriesDelta} Over` : `${Math.abs(caloriesDelta)} kcal Left`}
                  </span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="h-1.5 w-full bg-[var(--card-subtle-bg)] rounded-full overflow-hidden border border-[var(--card-border)]">
                  <div className="h-full bg-[var(--main-color)] transition-all duration-300 rounded-full" style={{ width: `${calProgressPct}%` }}/>
                </div>
              </div>

              {/* 2. Three Circular Macro Rings Side-by-Side (Protein, Carbs, Fats) */}
              <div className="flex items-center justify-between gap-1 py-1 px-2 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
                <MacroRing label="Protein" current={dailyTotals.proteinG} target={targetProteinG} color="var(--main-color)"/>
                <div className="w-[1px] h-9 bg-[var(--card-border)] flex-shrink-0"/>
                <MacroRing label="Carbs" current={dailyTotals.carbsG} target={targetCarbsG} color="var(--main-color)"/>
                <div className="w-[1px] h-9 bg-[var(--card-border)] flex-shrink-0"/>
                <MacroRing label="Fats" current={dailyTotals.fatsG} target={targetFatsG} color="var(--main-color)"/>
              </div>

              {/* 3. Sub-Row: Target Athlete, Day Type, and Notes Modal Icon */}
              <div className="flex items-center gap-1.5">
                <div className="flex-1 min-w-0">
                  <SelectDropdown value={selectedUserId || ''} onChange={(val) => setSelectedUserId(String(val) || '')} options={trainees.map((t) => ({
            value: t.id,
            label: t.name
        }))} placeholder="Select Athlete..."/>
                </div>

                <div className="w-[105px] xs:w-[115px] flex-shrink-0">
                  <SelectDropdown value={dayType} onChange={(val) => setDayType(val)} options={[
            { value: 'training', label: 'Training' },
            { value: 'rest', label: 'Rest Day' },
            { value: 'refeed', label: 'Refeed' }
        ]} placeholder="Day Type"/>
                </div>

                <button type="button" onClick={() => setIsNotesModalOpen(true)} className={`w-8 h-8 rounded-lg border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 relative ${description?.trim()
            ? 'bg-[var(--main-color)]/20 border-[var(--main-color)]/40 text-white shadow-xs'
            : 'bg-[var(--input-bg)] border-[var(--input-border)] text-slate-400 hover:text-white'}`} title="Protocol Directives & Notes">
                  <FileText className="w-3.5 h-3.5"/>
                  {description?.trim() && (<span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)] absolute top-1 right-1"/>)}
                </button>
              </div>
            </div>

            {/* Canvas Sub-Header */}
            <div className="min-h-10 py-1.5 flex-shrink-0 px-2 sm:px-3 border-b border-[var(--card-border)] bg-[var(--card-bg)] flex items-center justify-between gap-2">
              {/* Left: Section Title + Meals Count */}
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                  Meals &bull; {currentDateLabel.main}
                </h3>
                <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                  ({meals.length})
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium text-slate-300 bg-white/[0.05] border border-white/10 flex-shrink-0 hidden sm:inline-block">
                  {dayType === 'training' ? 'Training Day' : dayType === 'rest' ? 'Rest Day' : 'Refeed'}
                </span>
              </div>

              {/* Right: Prescribed Calories Telemetry & Compact Add Meal Action */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10.5px] font-mono text-slate-400 hidden sm:inline">
                  Prescribed: <strong className="text-white font-numeric font-bold">{dailyTotals.calories} kcal</strong>
                </span>

                <button type="button" onClick={handleAddMeal} className="gym-btn-primary !h-6 sm:!h-7 !px-2 sm:!px-2.5 !text-[10px] sm:!text-xs flex items-center justify-center gap-1 flex-shrink-0 font-bold" title="Add a new meal to this day">
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]"/>
                  <span>Add Meal</span>
                </button>
              </div>
            </div>

            {/* Canvas Scrollable Meals List */}
            <div className="flex-1 overflow-y-auto p-1.5 sm:p-2.5 custom-scrollbar">
              <div className="space-y-1.5">
                {meals.map((meal, mealIdx) => (<DietMealCard key={meal.id} meal={meal} index={mealIdx} totalMealsCount={meals.length} isCollapsed={Boolean(collapsedMealIds[meal.id])} expandedItemIds={expandedItemIds} onToggleCollapse={() => toggleMealCollapse(meal.id)} onToggleItemExpand={toggleItemExpand} onUpdateMeal={(field, val) => handleUpdateMeal(meal.id, field, val)} onDuplicateMeal={() => handleDuplicateMeal(meal.id)} onRemoveMeal={() => handleRemoveMeal(meal.id)} onOpenFoodSearch={() => handleOpenFoodSearch(meal.id)} onUpdateItemGrams={(itemId, grams) => handleUpdateItemGrams(meal.id, itemId, grams)} onRemoveItem={(itemId) => handleRemoveItem(meal.id, itemId)} onOpenAltSearch={(itemId) => handleOpenAltSearch(meal.id, itemId)} onUpdateAltGrams={(itemId, altId, grams) => handleUpdateAltGrams(meal.id, itemId, altId, grams)} onRemoveAlt={(itemId, altId) => handleRemoveAlt(meal.id, itemId, altId)}/>))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Protocol Notes Modal */}
      {isNotesModalOpen && (<div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-text" onClick={() => setIsNotesModalOpen(false)}>
          <div className="w-full max-w-sm rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] p-3.5 space-y-2.5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400"/>
                <span className="text-xs font-bold text-white">Protocol Directives & Notes</span>
              </div>
              <button type="button" onClick={() => setIsNotesModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Carb cycling, high water intake, post-workout window directives..." rows={4} className="w-full px-2.5 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[var(--main-color)] resize-none" autoFocus/>
            <div className="flex justify-end">
              <button type="button" onClick={() => setIsNotesModalOpen(false)} className="gym-btn-primary text-xs px-3 py-1 cursor-pointer">
                Done
              </button>
            </div>
          </div>
        </div>)}

      {/* Primary Food Search Modal */}
      <FoodSearchModal
        isOpen={isFoodSearchOpen}
        onClose={() => setIsFoodSearchOpen(false)}
        targetMealName={activeTargetMeal?.name || 'Meal'}
        meals={meals}
        activeMealId={activeTargetMealId}
        onSwitchMeal={(mealId) => setActiveTargetMealId(mealId)}
        onSelectFood={handleSelectFoodItem}
        customFoods={customFoods}
        onAddCustomFood={(food) => setCustomFoods([...customFoods, food])}
      />

      {/* Alternative Food Search Modal */}
      <FoodSearchModal
        isOpen={isAltFoodSearchOpen}
        onClose={() => setIsAltFoodSearchOpen(false)}
        targetMealName={`Alternative for ${altTargetItem?.name || 'Item'}`}
        excludeFoodIds={altExcludeFoodIds}
        onSelectFood={handleSelectAltFood}
        customFoods={customFoods}
        onAddCustomFood={(food) => setCustomFoods([...customFoods, food])}
      />
    </>);
};
