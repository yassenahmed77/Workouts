'use client';

import React from 'react';
import { PulseWeekNavigator } from './PulseWeekNavigator';
import { WorkoutPulseTile } from './WorkoutPulseTile';
import { NutritionPulseTile } from './NutritionPulseTile';
import { HealthStatusPulseTile } from './HealthStatusPulseTile';
import { CheckInPulseTile } from './CheckInPulseTile';

/**
 * PulseMobileGrid (Clean Architecture - Mobile Container Orchestrator)
 *
 * 2x2 Rich Telemetry Widgets:
 * - Workouts: Hero ratio, animated progress bar, 7-day status strip
 * - Nutrition: Hero calories, visual calorie track, 3 macro mini-bars P/C/F
 * - Health & Readiness: Hero condition, 5-segment volume capacity gauge
 * - Check-In: Next due audit, 3 checklist capsules (Scale, Photos, Tape)
 *
 * Viewport Isolation: Fits cleanly in mobile flex container without page scrolling.
 * Zero decorative icons (Rule 2 compliant).
 */
export const PulseMobileGrid = ({
  client,
  weekAttendance,
  weekOffset,
  setWeekOffset,
  onOpenCalendar,
  consumedCalories,
  targetCalories,
  consumedProtein,
  targetProtein,
  consumedCarbs,
  targetCarbs,
  consumedFats,
  targetFats,
  adherencePct,
  attention,
  hasActiveInjury,
  hasWarning,
  onNavigateSubTab,
  onOpenWeeklySessions,
  onOpenNutritionModal
}) => {
  return (
    <div className="select-none p-0 bg-transparent h-full flex-1 flex flex-col justify-between space-y-1.5 min-h-0">
      {/* 1. Header: Title + Week Navigator */}
      <div className="flex flex-col items-center justify-between pb-1.5 border-b border-white/[0.06] gap-1.5 flex-shrink-0">
        <span className="gym-label-mono font-bold tracking-wider text-center w-full">
          WEEKLY ACTIVITY & HEALTH STATUS
        </span>

        <PulseWeekNavigator
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          dateRangeLabel={weekAttendance?.dateRangeLabel}
          onOpenCalendar={onOpenCalendar}
          isMobile={true}
        />
      </div>

      {/* 2. 2x2 Rich Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 items-stretch">
        {/* Top-Left: Workouts */}
        <WorkoutPulseTile
          weekAttendance={weekAttendance}
          weekOffset={weekOffset}
          onClick={onOpenWeeklySessions || (() => onNavigateSubTab('workout'))}
        />

        {/* Top-Right: Nutrition */}
        <NutritionPulseTile
          consumedCalories={consumedCalories}
          targetCalories={targetCalories}
          consumedProtein={consumedProtein}
          targetProtein={targetProtein}
          consumedCarbs={consumedCarbs}
          targetCarbs={targetCarbs}
          consumedFats={consumedFats}
          targetFats={targetFats}
          adherencePct={adherencePct}
          onClick={onOpenNutritionModal || (() => onNavigateSubTab('nutrition'))}
        />

        {/* Bottom-Left: Health & Readiness */}
        <HealthStatusPulseTile
          attention={attention}
          hasActiveInjury={hasActiveInjury}
          hasWarning={hasWarning}
        />

        {/* Bottom-Right: Check-In Status */}
        <CheckInPulseTile
          client={client}
          onNavigateSubTab={onNavigateSubTab}
        />
      </div>
    </div>
  );
};
