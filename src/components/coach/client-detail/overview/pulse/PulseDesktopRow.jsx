'use client';

import React from 'react';
import { PulseWeekNavigator } from './PulseWeekNavigator';

/**
 * PulseDesktopRow (Clean Architecture - Desktop Presentation)
 *
 * 100% original, locked, compact bottom strip (gym-card flex-shrink-0).
 * Preserves exact desktop layout without bleeding into mobile.
 * Zero decorative icons (Rule 2 compliant).
 */
export const PulseDesktopRow = ({
  client,
  weekAttendance,
  weekOffset,
  setWeekOffset,
  onOpenCalendar,
  telemetry,
  checkInTelemetry,
  consumedCalories,
  targetCalories,
  consumedProtein,
  consumedCarbs,
  consumedFats,
  adherencePct,
  attention,
  hasActiveInjury,
  hasWarning,
  onNavigateSubTab,
  onOpenWeeklySessions,
  onOpenNutritionModal
}) => {
  const targetCal = telemetry ? telemetry.targetCalories : (targetCalories || 2200);
  const avgCal = telemetry ? telemetry.avgCalories : (consumedCalories || 1850);
  const avgProt = telemetry ? telemetry.avgProteinG : (consumedProtein || 140);
  const avgCarb = telemetry ? telemetry.avgCarbsG : (consumedCarbs || 220);
  const avgFat = telemetry ? telemetry.avgFatsG : (consumedFats || 55);
  const status = telemetry?.status;
  const deltaText = telemetry?.deltaText;
  const statusLabel = telemetry?.statusLabel;
  const pillClass = telemetry?.pillClass;
  return (
    <div className="gym-card space-y-1.5 select-none p-2 sm:p-2.5 flex-shrink-0">
      {/* Header: Title + Week Navigator + Calendar Picker */}
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.07] gap-2 flex-wrap">
        <span className="gym-label-mono font-bold tracking-wider">
          WEEKLY ACTIVITY & HEALTH STATUS
        </span>

        <PulseWeekNavigator
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          dateRangeLabel={weekAttendance?.dateRangeLabel}
          onOpenCalendar={onOpenCalendar}
          isMobile={false}
        />
      </div>

      {/* 4-Column Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* 1. Workout Weekly Sessions (With 7-Day Sat-Fri Cycle Strip) */}
        <div
          onClick={onOpenWeeklySessions || (() => onNavigateSubTab('workout'))}
          className="gym-card-subtle p-2 flex flex-col justify-between hover:border-white/20 cursor-pointer transition-colors group"
          title="Click to view weekly training sessions pipeline"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span className="font-semibold text-slate-300">WORKOUTS</span>
          </div>

          <div className="my-0.5">
            <div className="py-0.5">
              <span className="text-xs sm:text-sm font-bold text-white font-mono tracking-tight block">
                {weekAttendance.completedCount} / {weekAttendance.targetSessions} Sessions
              </span>
            </div>

            {/* 7-Days Cycle Status Strip (Sat to Fri) */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mt-1">
              {(weekAttendance.days || []).map((day) => {
                let badgeClass = 'bg-white/[0.03] text-slate-500 border-white/[0.06]';
                let symbol = '—';

                if (day.hasWorkout) {
                  badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
                  symbol = '✓';
                } else if (weekOffset < 0 || day.isPast) {
                  badgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold';
                  symbol = '✕';
                } else if (day.isToday) {
                  badgeClass = 'bg-white/[0.08] text-slate-200 border-white/20 font-semibold';
                  symbol = '⏱';
                }

                return (
                  <div
                    key={day.dateStr}
                    className={`rounded py-0.5 border text-center transition-all ${badgeClass}`}
                    title={`${day.dayName} ${day.dayNum}: ${
                      day.hasWorkout
                        ? day.workoutTitle || 'Completed'
                        : (weekOffset < 0 || day.isPast)
                        ? 'Missed Session'
                        : day.isToday
                        ? 'Today (Pending)'
                        : 'Scheduled'
                    }`}
                  >
                    <span className="text-[7px] font-mono block leading-none opacity-60">
                      {day.dayName[0]}
                    </span>
                    <span className="text-[9px] font-mono leading-none block mt-0.5">
                      {symbol}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <span className="text-[9px] font-mono text-slate-400 block truncate mt-2 sm:mt-2.5 pt-0.5 border-t border-white/[0.04]">
            {weekOffset < 0
              ? `${Math.max(0, weekAttendance.targetSessions - weekAttendance.completedCount)} missed in cycle`
              : `${weekAttendance.percentage}% completed`}
          </span>
        </div>

        {/* 2. Nutrition Meals & Target Macros (Coach Magic Eye Desktop) */}
        <div
          onClick={onOpenNutritionModal || (() => onNavigateSubTab('nutrition'))}
          className="gym-card-subtle p-2 flex flex-col justify-between hover:border-white/20 cursor-pointer transition-colors group"
          title="Click to view daily prescribed meals & macros pipeline"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span className="font-semibold text-slate-300">NUTRITION</span>
            {statusLabel && (
              <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold border ${pillClass}`}>
                {statusLabel}
              </span>
            )}
          </div>

          <div className="my-0.5">
            <div className="py-0.5 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-white font-mono tracking-tight block">
                {avgCal.toLocaleString()} / {targetCal.toLocaleString()} kcal
              </span>
              {deltaText && deltaText !== '±0 kcal' && (
                <span className="text-[9.5px] font-mono font-semibold text-slate-300">
                  ({deltaText})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono">
              <span className="text-[var(--main-color)] font-semibold">{avgProt}g P</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-white/70 font-semibold">{avgCarb}g C</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-white/50 font-semibold">{avgFat}g F</span>
            </div>
          </div>

          <span className="text-[9px] font-mono text-slate-400 block truncate mt-2 sm:mt-2.5 pt-0.5 border-t border-white/[0.04]">
            {telemetry
              ? `${telemetry.loggedDaysCount}/${telemetry.totalDays} days logged • ${telemetry.adherencePct}% energy track`
              : `${adherencePct}% prescribed meals on track`}
          </span>
        </div>

        {/* 3. Health & Injury Status */}
        <div className="gym-card-subtle p-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span className="font-semibold text-slate-300">HEALTH / INJURY</span>
          </div>

          <div className="my-1">
            <span
              className={`text-xs font-bold font-mono block truncate ${
                hasActiveInjury
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {attention?.label || '100% Fit & Healthy'}
            </span>
            <span className="text-[9px] font-mono text-slate-400 block mt-0.5 truncate">
              {attention?.timeframe || 'Zero injury flags'}
            </span>
          </div>

          <span className="text-[9px] font-mono text-slate-500">
            {hasActiveInjury ? 'Needs coach review' : 'Ready for heavy volume'}
          </span>
        </div>

        {/* 4. Check-in Timeline Status (Coach Magic Eye) */}
        <div
          onClick={() => onNavigateSubTab('checkins')}
          className="gym-card-subtle p-2 flex flex-col justify-between hover:border-white/20 cursor-pointer transition-colors group"
          title="Click to view weekly check-in photos & measurements"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span className="font-semibold text-slate-300">CHECK-IN STATUS</span>
            {checkInTelemetry?.statusLabel && (
              <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold border ${checkInTelemetry.pillClass}`}>
                {checkInTelemetry.statusLabel}
              </span>
            )}
          </div>

          <div className="my-1">
            <span className="text-xs sm:text-sm font-bold text-white font-mono block truncate">
              {checkInTelemetry?.headline || (client?.lastCheckInDate ? `Last: ${client.lastCheckInDate}` : 'Friday Due')}
            </span>
            <span className={`text-[9px] font-mono font-semibold block mt-0.5 truncate ${
              checkInTelemetry?.hasNewSubmission ? 'text-[var(--main-color)]' : 'text-slate-400'
            }`}>
              {checkInTelemetry?.subline || 'Weekly progress audit'}
            </span>
          </div>

          <span className="text-[9px] font-mono text-slate-400 truncate">
            Scale ({checkInTelemetry?.pillars?.scale?.value || '—'}) • Photos ({checkInTelemetry?.photosCount || 0}) • InBody ({checkInTelemetry?.pillars?.inBody?.value || 'Pending'})
          </span>
        </div>
      </div>
    </div>
  );
};
