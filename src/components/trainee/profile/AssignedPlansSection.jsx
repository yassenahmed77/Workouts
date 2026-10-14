'use client';
import React from 'react';
export const AssignedPlansSection = React.memo(({ plan, dietPlan, logsCount, onNavigateToWorkouts, onOpenDietModal }) => {
    return (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* 1. Workout Plan Card */}
      <div className="gym-card space-y-2 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Centered Header */}
          <div className="text-center pb-1.5 border-b border-[var(--card-border)]">
            <span className="gym-label-mono block text-[var(--main-color)]">WORKOUT PLAN</span>
            <h3 className="gym-heading-card mt-0.5">
              Assigned Workout Plan
            </h3>
            {plan && (<span className="gym-label-mono text-zinc-400 block mt-0.5">
                {plan.daysPerWeek} DAYS / WK
              </span>)}
          </div>

          {plan ? (<div className="gym-card-subtle space-y-2">
              <div>
                <h4 className="gym-heading-section">{plan.title}</h4>
                <p className="gym-subtext mt-0.5 line-clamp-2">{plan.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-white/[0.06] text-xs font-mono text-center">
                <div>
                  <span className="gym-label-mono block">Schedule</span>
                  <span className="text-zinc-200 font-bold">{plan.daysPerWeek} Days</span>
                </div>
                <div>
                  <span className="gym-label-mono block">Duration</span>
                  <span className="text-zinc-200 font-bold">{plan.durationWeeks} Wks</span>
                </div>
                <div>
                  <span className="gym-label-mono block">Sessions</span>
                  <span className="text-zinc-200 font-bold">{logsCount} Logged</span>
                </div>
              </div>
            </div>) : (<div className="py-4 text-center rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
              <span className="gym-label-mono block text-zinc-500">NO ACTIVE WORKOUT PLAN</span>
              <p className="gym-subtext text-xs text-zinc-400 mt-0.5">
                Your coach has not assigned a custom program yet.
              </p>
            </div>)}
        </div>

        <div className="pt-2">
          <button type="button" onClick={onNavigateToWorkouts} className="gym-btn-primary w-full text-xs cursor-pointer">
            Go to Workouts
          </button>
        </div>
      </div>

      {/* 2. Nutrition Plan Card */}
      <div className="gym-card space-y-2 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Centered Header */}
          <div className="text-center pb-1.5 border-b border-[var(--card-border)]">
            <span className="gym-label-mono block text-[var(--main-color)]">NUTRITION PLAN</span>
            <h3 className="gym-heading-card mt-0.5">
              Assigned Nutrition Plan
            </h3>
            {dietPlan && (<span className="gym-label-mono text-zinc-400 block mt-0.5">
                {dietPlan.targetCalories.toLocaleString()} KCAL
              </span>)}
          </div>

          {dietPlan ? (<div className="gym-card-subtle space-y-2">
              <div>
                <h4 className="gym-heading-section">{dietPlan.title}</h4>
                <p className="gym-subtext mt-0.5 line-clamp-2">{dietPlan.description || 'Target macros and meal guidelines'}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-white/[0.06] text-xs font-mono text-center">
                <div>
                  <span className="gym-label-mono block">Protein</span>
                  <span className="text-[var(--main-color)] font-bold">{dietPlan.targetProteinG}g</span>
                </div>
                <div>
                  <span className="gym-label-mono block">Carbs</span>
                  <span className="text-zinc-200 font-bold">{dietPlan.targetCarbsG}g</span>
                </div>
                <div>
                  <span className="gym-label-mono block">Fats</span>
                  <span className="text-zinc-200 font-bold">{dietPlan.targetFatsG}g</span>
                </div>
              </div>
            </div>) : (<div className="py-4 text-center rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
              <span className="gym-label-mono block text-zinc-500">NO ACTIVE DIET PLAN</span>
              <p className="gym-subtext text-xs text-zinc-400 mt-0.5">
                Your coach has not assigned a custom nutrition plan yet.
              </p>
            </div>)}
        </div>

        <div className="pt-2">
          <button type="button" onClick={onOpenDietModal} className="gym-btn-secondary w-full text-xs cursor-pointer">
            {dietPlan ? 'View Diet Plan' : 'Preview Nutrition'}
          </button>
        </div>
      </div>
    </div>);
});
AssignedPlansSection.displayName = 'AssignedPlansSection';
