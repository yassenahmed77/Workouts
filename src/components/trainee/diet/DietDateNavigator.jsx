'use client';
import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
export const DietDateNavigator = React.memo(({ selectedDate, isToday, onPrevDay, onNextDay, onGoToToday, onSelectDate }) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const dateInputRef = useRef(null);
    // Month state for the calendar modal
    const [viewMonthDate, setViewMonthDate] = useState(() => new Date(selectedDate + 'T00:00:00'));
    const formattedDate = useMemo(() => {
        const parts = selectedDate.split('-').map(Number);
        const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return d.toLocaleDateString('en-US', options);
    }, [selectedDate]);
    // Calendar cells generation for month view
    const monthCalendarDays = useMemo(() => {
        const year = viewMonthDate.getFullYear();
        const month = viewMonthDate.getMonth();
        const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // Adjust for Monday start: 0 -> 6, 1 -> 0, etc.
        const startOffset = (firstDayIndex + 6) % 7;
        const days = [];
        // Empty offset days from prev month
        for (let i = 0; i < startOffset; i++) {
            days.push({ dayNum: 0, dateStr: '', isCurrentMonth: false });
        }
        // Days of current month
        for (let d = 1; d <= daysInMonth; d++) {
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(d).padStart(2, '0');
            days.push({
                dayNum: d,
                dateStr: `${year}-${monthStr}-${dayStr}`,
                isCurrentMonth: true
            });
        }
        return days;
    }, [viewMonthDate]);
    const monthName = useMemo(() => {
        return viewMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [viewMonthDate]);
    const handlePrevMonth = () => {
        setViewMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setViewMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    const handleDateClick = (dateStr) => {
        if (!dateStr)
            return;
        onSelectDate(dateStr);
        setIsCalendarOpen(false);
    };
    const handleOpenPicker = () => {
        const parts = selectedDate.split('-').map(Number);
        setViewMonthDate(new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1));
        setIsCalendarOpen(true);
    };
    return (<>
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--gym-border-base)]">
        {/* Previous Day Arrow (Clean, No inner block) */}
        <button type="button" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPrevDay();
        }} className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90" aria-label="Previous day" title="Previous day">
          <ChevronLeft className="w-5 h-5 stroke-[2.2]"/>
        </button>

        {/* Center Date (Clean Text, No inner block, Opens Calendar Picker) */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleOpenPicker} className="text-xs sm:text-sm font-mono font-bold text-white hover:text-[var(--main-color)] transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5" title="Click to pick any date">
            <span>{isToday ? `Today (${formattedDate})` : formattedDate}</span>
          </button>

          {!isToday && (<button type="button" onClick={onGoToToday} className="text-[var(--main-color)] hover:underline text-[10px] font-mono font-bold transition-all cursor-pointer">
              Today
            </button>)}
        </div>

        {/* Next Day Arrow (Clean, No inner block) */}
        <button type="button" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNextDay();
        }} className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90" aria-label="Next day" title="Next day">
          <ChevronRight className="w-5 h-5 stroke-[2.2]"/>
        </button>
      </div>

      {/* Full Interactive Calendar Modal */}
      {isCalendarOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150" role="dialog" aria-modal="true" onClick={() => setIsCalendarOpen(false)}>
          <div className="w-full max-w-xs rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] p-3.5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header: Month Navigation */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]">
              <button type="button" onClick={handlePrevMonth} className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-90">
                <ChevronLeft className="w-3.5 h-3.5"/>
              </button>

              <span className="text-xs font-mono font-bold text-white">
                {monthName}
              </span>

              <div className="flex items-center gap-1">
                <button type="button" onClick={handleNextMonth} className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-90">
                  <ChevronRight className="w-3.5 h-3.5"/>
                </button>
                <button type="button" onClick={() => setIsCalendarOpen(false)} className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer active:scale-90 ml-1">
                  <X className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-zinc-500 font-bold">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 font-mono text-xs">
              {monthCalendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                    return <div key={`empty-${idx}`} className="h-7"/>;
                }
                const isSelected = cell.dateStr === selectedDate;
                const isCellToday = cell.dateStr === new Date().toISOString().split('T')[0];
                return (<button key={cell.dateStr} type="button" onClick={() => handleDateClick(cell.dateStr)} className={`h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer active:scale-90 ${isSelected
                        ? 'bg-[var(--main-color)] text-white font-bold'
                        : isCellToday
                            ? 'bg-[var(--main-color)]/20 text-[var(--main-color)] border border-[var(--main-color)]/40'
                            : 'text-zinc-300 hover:bg-white/[0.08] hover:text-white'}`}>
                    {cell.dayNum}
                  </button>);
            })}
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <button type="button" onClick={() => {
                onGoToToday();
                setIsCalendarOpen(false);
            }} className="gym-btn-secondary text-[11px] py-1 px-2.5 rounded-lg font-mono cursor-pointer">
                Jump to Today
              </button>

              <button type="button" onClick={() => setIsCalendarOpen(false)} className="gym-btn-ghost text-[11px] py-1 px-2.5 font-mono cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>)}
    </>);
});
DietDateNavigator.displayName = 'DietDateNavigator';
