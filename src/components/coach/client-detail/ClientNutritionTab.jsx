'use client';
import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { NutritionPlanBuilderModal } from '@/components/coach/nutrition/NutritionPlanBuilderModal';
import { ChevronRight } from 'lucide-react';
export const ClientNutritionTab = ({ client }) => {
    const { dietPlans, getDietPlanForUser, assignDietPlanToUser } = useGym();
    const { showToast } = useToast();
    const currentDietPlan = getDietPlanForUser(client.id);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDietBuilderOpen, setIsDietBuilderOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(currentDietPlan?.id || (dietPlans[0]?.id || ''));
    React.useEffect(() => {
        if (!isAssignModalOpen)
            return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                setIsAssignModalOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAssignModalOpen]);
    const handleAssign = async () => {
        if (!selectedPlanId)
            return;
        await assignDietPlanToUser(client.id, selectedPlanId);
        setIsAssignModalOpen(false);
        showToast('Nutrition plan assigned to athlete', 'success');
    };
    if (!currentDietPlan) {
        return (<div className="gym-card p-8 text-center space-y-3">
        <div>
          <h3 className="gym-heading-card">No Diet Plan Assigned</h3>
          <p className="gym-subtext max-w-sm mx-auto mt-1">
            Assign a tailored diet plan with daily calories, protein targets, and meal breakdowns for {client.name}.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1">
          <button type="button" onClick={() => setIsDietBuilderOpen(true)} className="gym-btn-primary inline-flex items-center gap-1.5 text-xs">
            <span>Build Custom Diet Plan</span>
          </button>

          {dietPlans.length > 0 && (<button type="button" onClick={() => setIsAssignModalOpen(true)} className="gym-btn-secondary inline-flex items-center gap-1.5 text-xs">
              <span>Assign Existing Template</span>
            </button>)}
        </div>

        {/* Assign Modal */}
        {isAssignModalOpen && (<div onClick={(e) => {
                    if (e.target === e.currentTarget)
                        setIsAssignModalOpen(false);
                }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md gym-card p-5 space-y-3 text-left shadow-2xl">
              <h4 className="gym-heading-card">Select Diet Plan</h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                {dietPlans.map((dp) => (<div key={dp.id} onClick={() => setSelectedPlanId(dp.id)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPlanId === dp.id
                        ? 'bg-[var(--gym-surface-hover)] border-[var(--gym-accent-primary)] text-white'
                        : 'bg-[var(--gym-surface-base)] border-[var(--gym-border-subtle)] text-slate-300 hover:border-[var(--gym-border-base)]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{dp.title}</span>
                      <span className="font-numeric font-medium text-slate-200 text-xs">
                        {dp.targetCalories} kcal
                      </span>
                    </div>
                    <p className="gym-subtext mt-0.5 font-mono">
                      P: {dp.targetProteinG}g &bull; C: {dp.targetCarbsG}g &bull; F: {dp.targetFatsG}g
                    </p>
                  </div>))}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--gym-border-subtle)]">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="gym-btn-ghost text-xs">
                  Cancel
                </button>
                <button type="button" onClick={handleAssign} className="gym-btn-primary text-xs">
                  Assign to Client
                </button>
              </div>
            </div>
          </div>)}
      </div>);
    }
    // Calculate macro calorie percentages
    const proteinCals = currentDietPlan.targetProteinG * 4;
    const carbsCals = currentDietPlan.targetCarbsG * 4;
    const fatsCals = currentDietPlan.targetFatsG * 9;
    const totalMacroCals = proteinCals + carbsCals + fatsCals || 1;
    const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
    const carbsPct = Math.round((carbsCals / totalMacroCals) * 100);
    const fatsPct = Math.round((fatsCals / totalMacroCals) * 100);
    return (<div className="flex flex-col h-full space-y-2 select-none">
      
      {/* 1. Nutrition Protocol Header & Target Macros Strip (Compact & Clean) */}
      <div className="gym-card space-y-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="gym-label-mono text-[var(--gym-text-muted)]">
                Diet Plan
              </span>
              <span className="text-[var(--gym-border-base)] text-xs">&bull;</span>
              <span className="gym-label-mono text-[var(--gym-text-secondary)]">
                Hydration: {currentDietPlan.waterTargetLiters}L/day
              </span>
            </div>
            <h3 className="gym-heading-card mt-0.5">
              {currentDietPlan.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setIsDietBuilderOpen(true)} className="gym-btn-primary inline-flex items-center gap-1 text-xs">
              <span>Open in Studio</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]"/>
            </button>

            <button type="button" onClick={() => setIsAssignModalOpen(true)} className="gym-btn-secondary text-xs">
              Switch
            </button>
          </div>
        </div>

        {/* Target Macros 4-Metric Grid (Calm, High-Contrast Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-medium">Daily Energy</span>
            <span className="text-base font-semibold font-numeric text-white mt-0.5 block tracking-tight">
              {currentDietPlan.targetCalories.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">kcal / day</span>
          </div>

          <div className="p-2 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-medium">Protein</span>
            <span className="text-base font-semibold font-numeric text-white mt-0.5 block tracking-tight">
              {currentDietPlan.targetProteinG}g
            </span>
            <span className="text-[9px] text-slate-400 font-mono">{proteinPct}% of energy</span>
          </div>

          <div className="p-2 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-medium">Carbohydrates</span>
            <span className="text-base font-semibold font-numeric text-white mt-0.5 block tracking-tight">
              {currentDietPlan.targetCarbsG}g
            </span>
            <span className="text-[9px] text-slate-400 font-mono">{carbsPct}% of energy</span>
          </div>

          <div className="p-2 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-medium">Dietary Fats</span>
            <span className="text-base font-semibold font-numeric text-white mt-0.5 block tracking-tight">
              {currentDietPlan.targetFatsG}g
            </span>
            <span className="text-[9px] text-slate-400 font-mono">{fatsPct}% of energy</span>
          </div>
        </div>

        {/* Macro Distribution Stacked Bar (Sleek Slate Tones) */}
        <div className="w-full h-1 rounded-full overflow-hidden flex bg-white/[0.05]">
          <div style={{ width: `${proteinPct}%` }} className="bg-[var(--main-color)] h-full" title={`Protein ${proteinPct}%`}/>
          <div style={{ width: `${carbsPct}%` }} className="bg-white/40 h-full" title={`Carbs ${carbsPct}%`}/>
          <div style={{ width: `${fatsPct}%` }} className="bg-white/20 h-full" title={`Fats ${fatsPct}%`}/>
        </div>
      </div>

      {/* 2. Structured Meals Breakdown (Internal Scroll Area with Tight Spacing) */}
      <div className="flex-1 min-h-0 flex flex-col space-y-1.5">
        <div className="flex items-center justify-between px-1 flex-shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
            Daily Meal Schedule ({currentDietPlan.meals.length} Meals)
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Scroll for full day schedule
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {currentDietPlan.meals.map((meal, idx) => {
            const mealCals = meal.items.reduce((sum, i) => sum + i.calories, 0);
            const mealProtein = meal.items.reduce((sum, i) => sum + i.proteinG, 0);
            const mealCarbs = meal.items.reduce((sum, i) => sum + i.carbsG, 0);
            const mealFats = meal.items.reduce((sum, i) => sum + i.fatsG, 0);
            return (<div key={meal.id} className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-2">
                {/* Meal Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="text-xs font-semibold text-white">
                        {meal.name}
                      </h5>
                      {meal.time && (<span className="text-[10px] text-slate-500 font-mono">
                          {meal.time}
                        </span>)}
                    </div>
                  </div>

                  <div className="text-right font-numeric text-xs">
                    <span className="font-semibold text-white block">{mealCals} kcal</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mealProtein}P &bull; {mealCarbs}C &bull; {mealFats}F
                    </span>
                  </div>
                </div>

                {/* Meal Items List */}
                <div className="space-y-1">
                  {meal.items.map((item) => (<div key={item.id} className="px-2.5 py-1.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="font-medium text-slate-200 block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Portion: {item.quantity || `${item.grams}g`}
                          {item.swaps && item.swaps.length > 0 && ` &bull; Swap: ${item.swaps.join(', ')}`}
                        </span>
                        {item.badeel && item.badeel.length > 0 && (<div className="pt-1 space-y-0.5">
                            {item.badeel.map((alt) => (<span key={alt.id} className="text-[9px] font-mono text-[var(--main-color)] block truncate">
                                &bull; بديل: {alt.name} ({alt.calories} kcal)
                              </span>))}
                          </div>)}
                      </div>

                      <div className="text-right flex-shrink-0 font-numeric text-xs font-mono">
                        <span className="font-medium text-white">{item.calories} kcal</span>
                        <span className="block text-[9px] text-slate-500">
                          {item.proteinG}P &bull; {item.carbsG}C &bull; {item.fatsG}F
                        </span>
                      </div>
                    </div>))}
                </div>
              </div>);
        })}
        </div>
      </div>

      {/* Change Plan Modal */}
      {isAssignModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 space-y-3 text-left shadow-2xl">
            <h4 className="gym-heading-card">Switch Diet Plan</h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
              {dietPlans.map((dp) => (<div key={dp.id} onClick={() => setSelectedPlanId(dp.id)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPlanId === dp.id
                    ? 'bg-[var(--main-color)]/15 border-[var(--main-color)]/30 text-white'
                    : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] text-slate-300 hover:border-white/20'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{dp.title}</span>
                    <span className="font-numeric font-medium text-slate-200 text-xs">
                      {dp.targetCalories} kcal
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    P: {dp.targetProteinG}g &bull; C: {dp.targetCarbsG}g &bull; F: {dp.targetFatsG}g
                  </p>
                </div>))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--card-border)]">
              <button type="button" onClick={() => setIsAssignModalOpen(false)} className="gym-btn-ghost text-xs">
                Cancel
              </button>
              <button type="button" onClick={handleAssign} className="gym-btn-primary text-xs">
                Save Assignment
              </button>
            </div>
          </div>
        </div>)}

      {/* Full-Screen Nutrition Plan Builder Modal */}
      <NutritionPlanBuilderModal isOpen={isDietBuilderOpen} onClose={() => setIsDietBuilderOpen(false)} initialPlan={currentDietPlan} targetUserId={client.id}/>

    </div>);
};
