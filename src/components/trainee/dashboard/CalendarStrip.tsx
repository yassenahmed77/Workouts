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
    <div className="p-2.5 sm:p-3 rounded-2xl bg-[#18191e] border border-[#24262e] shadow-sm space-y-2">
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
            className="w-6 h-6 rounded-lg bg-[#15161a] hover:bg-[#1c1d22] border border-[#24262e] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Previous week"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="w-6 h-6 rounded-lg bg-[#15161a] hover:bg-[#1c1d22] border border-[#24262e] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
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
                  ? 'bg-[#1c1d22] border-2 border-[#2f80ed] text-white shadow-[0_0_12px_rgba(47,128,237,0.3)]'
                  : isToday
                    ? 'bg-[#18191e] border border-[#2f80ed]/40 text-white'
                    : 'bg-[#15161a] border border-[#24262e]/70 text-[#94a3b8] hover:border-zinc-700'
              }`}
            >
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                isSelected ? 'text-[#2f80ed] font-extrabold' : isToday ? 'text-[#2f80ed]' : 'text-[#8e8e93]'
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
                        stroke="#272930"
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
                          stroke="#71717a"
                          strokeWidth="1.1"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  </div>
                ) : item.isToday ? (
                  <span 
                    className="w-1.5 h-1.5 rounded-full bg-[#2f80ed]" 
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
