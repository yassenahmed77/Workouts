'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarDayItem {
  day: string;
  date: number;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  score: number;
  isFullComplete: boolean;
}

interface CalendarStripProps {
  weekHeaderLabel: string;
  calendarDays: CalendarDayItem[];
  selectedDate: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = React.memo(({
  weekHeaderLabel,
  calendarDays,
  selectedDate,
  onPrevWeek,
  onNextWeek,
  onSelectDate
}) => {
  return (
    <div className="gym-card-elevated space-y-2 border-[var(--gym-border-base)]">
      {/* Week Header & Navigation */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider truncate">
            {weekHeaderLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onPrevWeek}
            className="w-6 h-6 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.04] border border-[var(--card-border)] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Previous week"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="w-6 h-6 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.04] border border-[var(--card-border)] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Next week"
            aria-label="Next week"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7-Days Buttons Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((item, i) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.isToday;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(item.dateStr)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-[var(--card-subtle-bg)] border-2 border-[var(--main-color)] text-white shadow-[0_0_12px_rgba(47,128,237,0.3)]'
                  : isToday
                    ? 'bg-[var(--card-bg)] border border-[var(--main-color)]/40 text-white'
                    : 'bg-[var(--card-subtle-bg)] border border-[var(--card-border)]/70 text-slate-400 hover:border-zinc-700'
              }`}
            >
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                isSelected ? 'text-[var(--main-color)] font-extrabold' : isToday ? 'text-[var(--main-color)]' : 'text-zinc-500'
              }`}>
                {item.day}
              </span>
              <span className={`text-xs font-black font-mono tabular-nums mt-0.5 ${
                isSelected || isToday ? 'text-white font-extrabold' : 'text-zinc-200'
              }`}>
                {item.date}
              </span>

              <div className="mt-1 flex items-center justify-center h-3">
                {item.isPast ? (
                  <div 
                    className="w-3 h-3 flex items-center justify-center"
                    title={item.isFullComplete ? '100% Completed' : `${item.score}% Completed`}
                  >
                    <svg className="w-3 h-3 text-zinc-400" viewBox="0 0 12 12">
                      {/* Background track (muted dark ring) */}
                      <circle
                        cx="6"
                        cy="6"
                        r="4.6"
                        fill="none"
                        stroke="var(--card-border)"
                        strokeWidth="1.2"
                      />
                      {/* Progress ring filled by item.score % */}
                      {item.score > 0 && (
                        <circle
                          cx="6"
                          cy="6"
                          r="4.6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeDasharray="28.9"
                          strokeDashoffset={28.9 - (28.9 * Math.min(100, item.score)) / 100}
                          strokeLinecap="round"
                          transform="rotate(-90 6 6)"
                        />
                      )}
                      {/* Check if 100%, X if < 100% */}
                      {item.isFullComplete ? (
                        <path
                          d="M3.8 6.1 L5.2 7.5 L8.2 4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : (
                        <path
                          d="M4.2 4.2 L7.8 7.8 M7.8 4.2 L4.2 7.8"
                          fill="none"
                          stroke="currentColor"
                          className="text-zinc-500"
                          strokeWidth="1.1"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  </div>
                ) : item.isToday ? (
                  <span 
                    className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)]" 
                    title="Today" 
                  />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-zinc-700/60" title="Upcoming" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
