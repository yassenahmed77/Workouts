'use client';
import React from 'react';
const MacroProgressCircle = ({ label, consumed, goal, remaining, color, unit = 'g' }) => {
    const safeGoal = goal > 0 ? goal : 1;
    const percentage = Math.min(100, Math.round((consumed / safeGoal) * 100));
    // Circle with radius 15.9155 has circumference ~100
    const strokeDashoffset = 100 - percentage;
    return (<div className="flex flex-col items-center text-center">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          {/* Background Track */}
          <path className="text-white/[0.08]" strokeWidth="3.2" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          {/* Animated Fill Circle */}
          <path stroke={color} strokeWidth="3.2" strokeDasharray="100, 100" strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="none" className="transition-all duration-500 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        </svg>

        {/* Value Inside Circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
          <span className="text-[10px] font-bold text-white tabular-nums leading-none">
            {consumed}
          </span>
          <span className="text-[7.5px] text-zinc-400 leading-none mt-0.5">
            {unit}
          </span>
        </div>
      </div>

      {/* Label & Target Below Circle */}
      <div className="mt-1 font-mono">
        <span className="gym-label-mono block leading-tight font-bold" style={{ color }}>
          {label}
        </span>
        <span className="text-[9.5px] text-zinc-400 tabular-nums block leading-tight mt-0.5">
          /{goal}{unit}
        </span>
      </div>
    </div>);
};
export const DietCaloriesEquationCard = React.memo(({ totals }) => {
    const { goalCalories, consumedCalories, remainingCalories, goalProteinG, consumedProteinG, remainingProteinG, goalCarbsG, consumedCarbsG, remainingCarbsG, goalFatsG, consumedFatsG, remainingFatsG } = totals;
    return (<div className="gym-card space-y-2.5 p-3 sm:p-3.5 rounded-2xl border-[var(--card-border)] bg-[var(--card-bg)]">
      {/* Header: Only "Calories & Macros Remaining" */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--card-border)]">
        <span className="gym-label-mono text-[var(--main-color)] font-bold">
          Calories & Macros Remaining
        </span>
      </div>

      {/* Line 1: Compact Equation: 1850 Goal - 918 Food = 932 Remaining */}
      <div className="flex items-center justify-between px-1 py-1 font-mono text-center">
        {/* Goal */}
        <div className="flex-1">
          <span className="gym-num text-sm sm:text-base text-white block leading-tight">
            {goalCalories.toLocaleString()}
          </span>
          <span className="gym-label-mono text-zinc-400 block text-[9px] mt-0.5">
            Goal
          </span>
        </div>

        {/* Minus Sign */}
        <div className="text-zinc-500 font-bold text-sm px-1 select-none">
          −
        </div>

        {/* Food */}
        <div className="flex-1">
          <span className="gym-num text-sm sm:text-base text-[var(--main-color)] block leading-tight">
            {consumedCalories.toLocaleString()}
          </span>
          <span className="gym-label-mono text-zinc-400 block text-[9px] mt-0.5">
            Food
          </span>
        </div>

        {/* Equals Sign */}
        <div className="text-zinc-500 font-bold text-sm px-1 select-none">
          =
        </div>

        {/* Remaining */}
        <div className="flex-1">
          <span className="gym-num text-sm sm:text-base text-emerald-400 block leading-tight font-extrabold">
            {remainingCalories.toLocaleString()}
          </span>
          <span className="gym-label-mono text-emerald-400/90 block text-[9px] mt-0.5">
            Remaining
          </span>
        </div>
      </div>

      {/* Line 2: Three Circular Rings for Macros */}
      <div className="pt-2 border-t border-[var(--card-border)] grid grid-cols-3 gap-2 items-center justify-items-center">
        <MacroProgressCircle label="Protein" consumed={consumedProteinG} goal={goalProteinG} remaining={remainingProteinG} color="var(--main-color)"/>

        <MacroProgressCircle label="Carbs" consumed={consumedCarbsG} goal={goalCarbsG} remaining={remainingCarbsG} color="var(--accent-amber)"/>

        <MacroProgressCircle label="Fats" consumed={consumedFatsG} goal={goalFatsG} remaining={remainingFatsG} color="var(--accent-critical)"/>
      </div>
    </div>);
});
DietCaloriesEquationCard.displayName = 'DietCaloriesEquationCard';
