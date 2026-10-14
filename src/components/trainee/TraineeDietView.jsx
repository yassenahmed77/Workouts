'use client';
import React from 'react';
import { useTraineeDiet } from '@/hooks/useTraineeDiet';
import { DietDateNavigator } from './diet/DietDateNavigator';
import { DietCaloriesEquationCard } from './diet/DietCaloriesEquationCard';
import { DietMealCard } from './diet/DietMealCard';
export const TraineeDietView = () => {
    const { planMeals, selectedDate, isToday, completedMealIds, totals, toggleMealCompleted, swapMealItem, goToPreviousDay, goToNextDay, goToToday, setSelectedDate } = useTraineeDiet();
    return (<div className="space-y-3 max-w-2xl mx-auto pb-12 animate-in fade-in duration-150">
      {/* 1. Date Navigator with Full Interactive Calendar Picker */}
      <DietDateNavigator selectedDate={selectedDate} isToday={isToday} onPrevDay={goToPreviousDay} onNextDay={goToNextDay} onGoToToday={goToToday} onSelectDate={setSelectedDate}/>

      {/* 2. Compact 2-Row Calories & Macros Remaining Card */}
      <DietCaloriesEquationCard totals={totals}/>

      {/* 3. Prescribed Meals Section (No Icon Beside Header - Clean Typography) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="gym-heading-card">Assigned Meals</h2>
          <span className="gym-label-mono text-zinc-400">
            {planMeals.length} MEALS PRESCRIBED
          </span>
        </div>

        <div className="space-y-2.5">
          {planMeals.map((meal) => (<DietMealCard key={meal.id} meal={meal} isCompleted={Boolean(completedMealIds[meal.id])} onToggleCompleted={() => toggleMealCompleted(meal.id)} onSwapItem={swapMealItem}/>))}
        </div>
      </div>
    </div>);
};
