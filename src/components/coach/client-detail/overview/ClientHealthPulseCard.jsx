'use client';

import React, { useState, useMemo } from 'react';
import { ObsidianCalendarModal } from '@/components/ui/ObsidianCalendarModal';
import { PulseDesktopRow } from './pulse/PulseDesktopRow';
import { PulseMobileGrid } from './pulse/PulseMobileGrid';
import { dietService } from '@/services/dietService';
import { checkInService } from '@/services/checkInService';

/**
 * ClientHealthPulseCard (Clean Architecture - Layer 1 Orchestrator)
 *
 * Executive 4-metric scorecard summarizing:
 * - Weekly Workout Attendance & adherence %
 * - Nutrition compliance rate & target macros (Coach Magic Eye)
 * - Active injury / health status
 * - Upcoming check-in due date & trainee submission alerts
 *
 * Viewport Isolation:
 * - Desktop (!isMobile): 100% original, locked compact bottom strip (`PulseDesktopRow`).
 * - Mobile (isMobile): 2x2 Rich Telemetry Widgets (`PulseMobileGrid`).
 * - Zero decorative icons (Rule 2 compliant).
 */
export const ClientHealthPulseCard = ({
  client,
  weekAttendance,
  weekOffset = 0,
  setWeekOffset,
  onSelectDate,
  assignedDiet,
  clientCheckIns = [],
  onNavigateSubTab,
  onOpenWeeklySessions,
  onOpenNutritionModal,
  isMobile = false
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Health / Attention state
  const attention = client?.attentionNote;
  const hasActiveInjury = attention && attention.type === 'danger';
  const hasWarning = attention && attention.type === 'warning';

  // Coach Magic Eye: Nutrition Telemetry (Average intake vs target + surplus/deficit deltas)
  const nutritionTelemetry = useMemo(() => {
    return dietService.calculateNutritionTelemetry(client, assignedDiet);
  }, [client, assignedDiet]);

  // Coach Magic Eye: Check-In Telemetry (Schedules, Pending Requests, New Unreviewed Submissions)
  const checkInTelemetry = useMemo(() => {
    return checkInService.calculateCheckInTelemetry(client, clientCheckIns);
  }, [client, clientCheckIns]);

  const targetCalories = nutritionTelemetry.targetCalories || assignedDiet?.targetCalories || 2200;
  const targetProtein = nutritionTelemetry.targetProteinG || assignedDiet?.targetProteinG || 160;
  const targetCarbs = nutritionTelemetry.targetCarbsG || assignedDiet?.targetCarbsG || 240;
  const targetFats = nutritionTelemetry.targetFatsG || assignedDiet?.targetFatsG || 60;
  const consumedCalories = nutritionTelemetry.avgCalories;
  const consumedProtein = nutritionTelemetry.avgProteinG;
  const consumedCarbs = nutritionTelemetry.avgCarbsG;
  const consumedFats = nutritionTelemetry.avgFatsG;
  const adherencePct = nutritionTelemetry.adherencePct;

  return (
    <>
      {!isMobile ? (
        <PulseDesktopRow
          client={client}
          weekAttendance={weekAttendance}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          telemetry={nutritionTelemetry}
          checkInTelemetry={checkInTelemetry}
          consumedCalories={consumedCalories}
          targetCalories={targetCalories}
          consumedProtein={consumedProtein}
          consumedCarbs={consumedCarbs}
          consumedFats={consumedFats}
          adherencePct={adherencePct}
          attention={attention}
          hasActiveInjury={hasActiveInjury}
          hasWarning={hasWarning}
          onNavigateSubTab={onNavigateSubTab}
          onOpenWeeklySessions={onOpenWeeklySessions}
          onOpenNutritionModal={onOpenNutritionModal}
        />
      ) : (
        <PulseMobileGrid
          client={client}
          weekAttendance={weekAttendance}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          telemetry={nutritionTelemetry}
          checkInTelemetry={checkInTelemetry}
          consumedCalories={consumedCalories}
          targetCalories={targetCalories}
          consumedProtein={consumedProtein}
          targetProtein={targetProtein}
          consumedCarbs={consumedCarbs}
          targetCarbs={targetCarbs}
          consumedFats={consumedFats}
          targetFats={targetFats}
          adherencePct={adherencePct}
          attention={attention}
          hasActiveInjury={hasActiveInjury}
          hasWarning={hasWarning}
          onNavigateSubTab={onNavigateSubTab}
          onOpenWeeklySessions={onOpenWeeklySessions}
          onOpenNutritionModal={onOpenNutritionModal}
        />
      )}

      {/* Standalone Obsidian Calendar Picker Modal */}
      <ObsidianCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={weekAttendance?.startDateStr}
        activeWeekStartStr={weekAttendance?.startDateStr}
        activeWeekEndStr={weekAttendance?.endDateStr}
        onSelectDate={(dateStr) => {
          onSelectDate && onSelectDate(dateStr);
        }}
      />
    </>
  );
};
