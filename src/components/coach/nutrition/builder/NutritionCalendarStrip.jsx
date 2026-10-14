'use client';
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getRelativeDateLabel } from '@/hooks/useNutritionPlanBuilder';
export const NutritionCalendarStrip = ({ visibleDateKeys, selectedDate, todayKey, dailySchedules = {}, currentMealsCount, onSelectDate, onPrevDay, onNextDay }) => {
    const selectedIdx = visibleDateKeys.indexOf(selectedDate);
    const activeIndex = selectedIdx !== -1 ? selectedIdx : 3;

    return (<div className="flex-1 min-w-0 flex items-center justify-center px-1 sm:px-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-0.5 min-[1200px]:gap-1 p-0.5 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] flex-shrink-0">
        {/* Previous Day Arrow */}
        <button type="button" onClick={onPrevDay} className="p-1 min-[1200px]:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer" title="Previous Day">
          <ChevronLeft className="w-3 h-3 min-[1200px]:w-3.5 min-[1200px]:h-3.5"/>
        </button>

        {/* Day Tabs */}
        {visibleDateKeys.map((dateKey, idx) => {
            const isSelected = dateKey === selectedDate;
            const { main, sub, isToday } = getRelativeDateLabel(dateKey, todayKey);
            const dayPlan = dailySchedules[dateKey];
            const dayMealsCount = dayPlan ? dayPlan.meals?.length : (dateKey === selectedDate ? currentMealsCount : 0);

            // Responsive progressive day reduction:
            // dist 0 (selected / today): always visible on tablet & desktop
            // dist 1 (±1 day): visible >= 880px (3 days)
            // dist 2 (±2 days): visible >= 1040px (5 days)
            // dist >= 3 (±3 days / full week): visible >= 1200px (7 days)
            const dist = Math.abs(idx - activeIndex);
            const responsiveVisibility = dist === 0
                ? 'flex'
                : dist === 1
                    ? 'hidden min-[880px]:flex'
                    : dist === 2
                        ? 'hidden min-[1040px]:flex'
                        : 'hidden min-[1200px]:flex';

            return (<button key={dateKey} type="button" onClick={() => onSelectDate(dateKey)} className={`items-center gap-1 min-[1200px]:gap-1.5 px-1.5 min-[1200px]:px-2.5 py-0.5 min-[1200px]:py-1 rounded-lg text-[11px] min-[1200px]:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${responsiveVisibility} ${isSelected
                    ? 'bg-[var(--main-color)]/15 border border-[var(--main-color)]/35 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
              {isToday && (<span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-[var(--main-color)]' : 'bg-slate-500'}`}/>)}
              <span>{main}</span>
              <span className={`text-[9.5px] min-[1200px]:text-[10px] font-mono shrink-0 ${isSelected ? 'text-slate-300 font-normal' : 'text-slate-500'}`}>
                {sub}
              </span>
              {dayMealsCount > 0 && !isSelected && (<span className="w-1 h-1 rounded-full bg-slate-500 shrink-0"/>)}
            </button>);
        })}

        {/* Next Day Arrow */}
        <button type="button" onClick={onNextDay} className="p-1 min-[1200px]:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer" title="Next Day">
          <ChevronRight className="w-3 h-3 min-[1200px]:w-3.5 min-[1200px]:h-3.5"/>
        </button>

        {/* Jump to Date Picker */}
        <label className="p-1 min-[1200px]:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer relative" title="Pick Calendar Date">
          <Calendar className="w-3 h-3 min-[1200px]:w-3.5 min-[1200px]:h-3.5"/>
          <input type="date" value={selectedDate} onChange={(e) => {
            if (e.target.value)
                onSelectDate(e.target.value);
        }} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"/>
        </label>
      </div>
    </div>);
};
