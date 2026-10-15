'use client';

import React, { useState } from 'react';
import { ObsidianCalendarModal } from '@/components/ui/ObsidianCalendarModal';
import { PulseDesktopRow } from './pulse/PulseDesktopRow';
import { PulseMobileGrid } from './pulse/PulseMobileGrid';

/**
 * ClientHealthPulseCard (Clean Architecture - Layer 1 Orchestrator)
 *
 * Executive 4-metric scorecard summarizing:
 * - Weekly Workout Attendance & adherence %
 * - Nutrition compliance rate & target macros
 * - Active injury / health status
 * - Upcoming check-in due date
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

  // Nutrition targets and consumed telemetry
  const targetCalories = assignedDiet?.targetCalories || 2200;
  const targetProtein = assignedDiet?.targetProteinG || 160;
  const targetCarbs = assignedDiet?.targetCarbsG || 240;
  const targetFats = assignedDiet?.targetFatsG || 60;
  const adherencePct = client?.nutritionAdherence || 85;

  const consumedCalories = Math.round(targetCalories * (adherencePct / 100));
  const consumedProtein = Math.round(targetProtein * (adherencePct / 100));
  const consumedCarbs = Math.round(targetCarbs * (adherencePct / 100));
  const consumedFats = Math.round(targetFats * (adherencePct / 100));

  return (
    <>
      {!isMobile ? (
        <PulseDesktopRow
          client={client}
          weekAttendance={weekAttendance}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          onOpenCalendar={() => setIsCalendarOpen(true)}
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
