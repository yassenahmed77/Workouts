'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getRelativeDateLabel } from '@/hooks/useNutritionPlanBuilder';

interface NutritionCalendarStripProps {
  visibleDateKeys: string[];
  selectedDate: string;
  todayKey: string;
  dailySchedules: Record<string, any>;
  currentMealsCount: number;
  onSelectDate: (dateKey: string) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export const NutritionCalendarStrip: React.FC<NutritionCalendarStripProps> = ({
  visibleDateKeys,
  selectedDate,
  todayKey,
  dailySchedules,
  currentMealsCount,
  onSelectDate,
  onPrevDay,
  onNextDay
}) => {
  return (
    <div className="flex-1 min-w-0 flex items-center justify-center px-1 sm:px-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 rounded-xl bg-[#05080e] border border-white/[0.06] flex-shrink-0">
        {/* Previous Day Arrow */}
        <button
          type="button"
          onClick={onPrevDay}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Previous Day"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Day Tabs */}
        {visibleDateKeys.map((dateKey) => {
          const isSelected = dateKey === selectedDate;
          const { main, sub, isToday } = getRelativeDateLabel(dateKey, todayKey);
          const dayPlan = dailySchedules[dateKey];
          const dayMealsCount = dayPlan ? dayPlan.meals?.length : (dateKey === selectedDate ? currentMealsCount : 0);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {isToday && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-500'}`} />
              )}
              <span>{main}</span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300 font-normal' : 'text-slate-500'}`}>
                {sub}
              </span>
              {dayMealsCount > 0 && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-slate-500" />
              )}
            </button>
          );
        })}

        {/* Next Day Arrow */}
        <button
          type="button"
          onClick={onNextDay}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Next Day"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Jump to Date Picker */}
        <label className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer relative" title="Pick Calendar Date">
          <Calendar className="w-3.5 h-3.5" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) onSelectDate(e.target.value);
            }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
