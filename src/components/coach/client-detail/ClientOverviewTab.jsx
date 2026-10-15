'use client';

import React, { useMemo, useState } from 'react';
import { useGym } from '@/context/GymContext';
import { useClientOverview } from '@/hooks/useClientOverview';
import { ClientWeightTrajectoryCard } from './overview/ClientWeightTrajectoryCard';
import { ClientPhysiquePhotosCard } from './overview/ClientPhysiquePhotosCard';
import { ClientHealthPulseCard } from './overview/ClientHealthPulseCard';
import { ClientMobileProfileHero } from './overview/ClientMobileProfileHero';
import { PhotoComparisonModal } from './PhotoComparisonModal';
import { BrokenRecordsModal } from './BrokenRecordsModal';
import { ClientMembershipModal } from './ClientMembershipModal';
import { SmartDiagnosticReportModal } from './SmartDiagnosticReportModal';
import { WeeklyWorkoutSessionsModal } from './modals/WeeklyWorkoutSessionsModal';
import { WeeklyNutritionMealsModal } from './modals/WeeklyNutritionMealsModal';

/**
 * ClientOverviewTab — Viewport-Fit Presentation Container (Clean Architecture - Layer 1).
 *
 * Utilizes 100% of the viewport height on Desktop (h-full flex flex-col justify-between)
 * while providing an executive TikTok-style Profile Hero & Native Segmented Chips on Mobile (< lg).
 */
export const ClientOverviewTab = ({
  client: propClient,
  onNavigateSubTab,
  onOpenNotes,
  onBack,
  onSwitchToTrainee
}) => {
  const { users, getUserLogs, getCheckInsForUser, getPlanForUser, getDietPlanForUser } = useGym();
  const client = users.find((u) => u.id === propClient.id) || propClient;

  const clientLogs = useMemo(() => getUserLogs(client.id), [getUserLogs, client.id]);
  const assignedPlan = getPlanForUser(client.id);
  const assignedDiet = useMemo(() => (getDietPlanForUser ? getDietPlanForUser(client.id) : null), [getDietPlanForUser, client.id]);
  const clientCheckIns = useMemo(() => {
    return getCheckInsForUser(client.id).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [getCheckInsForUser, client.id]);

  const overview = useClientOverview(client, clientLogs, clientCheckIns, assignedPlan);

  const targetWeight = client.targetWeightKg || 60;
  const weightToGoal = Math.round(Math.abs(client.weightKg - targetWeight) * 10) / 10;
  const firstCheckIn = clientCheckIns[0];
  const latestCheckIn = clientCheckIns[clientCheckIns.length - 1];

  const [activeMobileTab, setActiveMobileTab] = useState('pulse');
  const [isWeeklySessionsOpen, setIsWeeklySessionsOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);

  const whatsappUrl = useMemo(() => {
    const formattedPhone = client.phone ? client.phone.replace(/[^0-9]/g, '') : null;
    return formattedPhone ? `https://wa.me/${formattedPhone}` : null;
  }, [client.phone]);

  return (
    <>
      {/* 1. MOBILE ONLY (< lg): TikTok Profile Hero + Native Segmented Chips + Active Card Display */}
      <div className="flex flex-col w-full lg:hidden flex-1 min-h-0 justify-between gap-1.5 pb-1">
        <ClientMobileProfileHero
          client={client}
          startWeight={firstCheckIn?.weightKg || overview.overallWeightStats?.startingWeight}
          targetWeight={targetWeight}
          weightToGoal={weightToGoal}
          whatsappUrl={whatsappUrl}
          onBack={onBack}
          onOpenNotes={onOpenNotes}
          onSwitchToTrainee={onSwitchToTrainee}
          activeMobileTab={activeMobileTab}
          setActiveMobileTab={setActiveMobileTab}
          subscriptionInfo={overview.subscriptionInfo}
          onOpenMembership={() => overview.setIsMembershipModalOpen(true)}
        />

        {/* Selected Card View Based on Active Chip (Equalized Full Stretch Container) */}
        <div className="w-full flex-1 min-h-0 flex flex-col">
          {activeMobileTab === 'pulse' && (
            <ClientHealthPulseCard
              client={client}
              weekAttendance={overview.weekAttendance}
              weekOffset={overview.weekOffset}
              setWeekOffset={overview.setWeekOffset}
              onSelectDate={overview.selectDateFromCalendar}
              assignedDiet={assignedDiet}
              onNavigateSubTab={onNavigateSubTab}
              onOpenWeeklySessions={() => setIsWeeklySessionsOpen(true)}
              onOpenNutritionModal={() => setIsNutritionModalOpen(true)}
              isMobile={true}
            />
          )}

          {activeMobileTab === 'weight' && (
            <ClientWeightTrajectoryCard
              client={client}
              hasWeighIns={overview.hasWeighIns}
              totalTrajectoryPages={overview.totalTrajectoryPages}
              activePage={overview.activePage}
              visibleWeightPoints={overview.visibleWeightPoints}
              allWeightEntries={overview.allWeightEntries}
              hoveredTrajectoryIndex={overview.hoveredTrajectoryIndex}
              setHoveredTrajectoryIndex={overview.setHoveredTrajectoryIndex}
              setTrajectoryPage={overview.setTrajectoryPage}
              trajectorySvgData={overview.trajectorySvgData}
              overallWeightStats={overview.overallWeightStats}
              targetWeight={targetWeight}
              isMobile={true}
            />
          )}

          {activeMobileTab === 'photos' && (
            <ClientPhysiquePhotosCard
              activePhotoAngle={overview.activePhotoAngle}
              setActivePhotoAngle={overview.setActivePhotoAngle}
              firstCheckIn={firstCheckIn}
              latestCheckIn={latestCheckIn}
              onOpenFullscreenCompare={() => overview.setIsPhotoModalOpen(true)}
              isMobile={true}
            />
          )}
        </div>
      </div>

      {/* 2. DESKTOP ONLY (lg+): 100% Unchanged, Fully Locked & Untouched Cockpit */}
      <div className="hidden lg:flex h-full flex-1 flex-col justify-between gap-2 select-none overflow-hidden">
        {/* Top Hero: 2-Column Split expanding to fill 100% of available height */}
        <div className="grid grid-cols-12 gap-2 flex-1 min-h-0 items-stretch">
          {/* Left Column (col-span-7): Weight Progression Journey (Full Stretch) */}
          <div className="col-span-7 flex flex-col h-full min-h-0">
            <ClientWeightTrajectoryCard
              client={client}
              hasWeighIns={overview.hasWeighIns}
              totalTrajectoryPages={overview.totalTrajectoryPages}
              activePage={overview.activePage}
              visibleWeightPoints={overview.visibleWeightPoints}
              allWeightEntries={overview.allWeightEntries}
              hoveredTrajectoryIndex={overview.hoveredTrajectoryIndex}
              setHoveredTrajectoryIndex={overview.setHoveredTrajectoryIndex}
              setTrajectoryPage={overview.setTrajectoryPage}
              trajectorySvgData={overview.trajectorySvgData}
              overallWeightStats={overview.overallWeightStats}
              targetWeight={targetWeight}
              isMobile={false}
            />
          </div>

          {/* Right Column (col-span-5): Before & After Photos Transformation (Full Stretch) */}
          <div className="col-span-5 flex flex-col h-full min-h-0">
            <ClientPhysiquePhotosCard
              activePhotoAngle={overview.activePhotoAngle}
              setActivePhotoAngle={overview.setActivePhotoAngle}
              firstCheckIn={firstCheckIn}
              latestCheckIn={latestCheckIn}
              onOpenFullscreenCompare={() => overview.setIsPhotoModalOpen(true)}
              isMobile={false}
            />
          </div>
        </div>

        {/* Bottom Hero (col-span-12): Weekly Health & Adherence Pulse (Anchored at the bottom) */}
        <ClientHealthPulseCard
          client={client}
          weekAttendance={overview.weekAttendance}
          weekOffset={overview.weekOffset}
          setWeekOffset={overview.setWeekOffset}
          onSelectDate={overview.selectDateFromCalendar}
          assignedDiet={assignedDiet}
          onNavigateSubTab={onNavigateSubTab}
          onOpenWeeklySessions={() => setIsWeeklySessionsOpen(true)}
          onOpenNutritionModal={() => setIsNutritionModalOpen(true)}
          isMobile={false}
        />
      </div>

      {/* Weekly Training Sessions Timeline Modal (Numbered Nodes & Continuous Pipe) */}
      <WeeklyWorkoutSessionsModal
        isOpen={isWeeklySessionsOpen}
        onClose={() => setIsWeeklySessionsOpen(false)}
        client={client}
        assignedPlan={assignedPlan}
        clientLogs={clientLogs}
        weekAttendance={overview.weekAttendance}
        weekOffset={overview.weekOffset}
        setWeekOffset={overview.setWeekOffset}
        onSelectDate={overview.selectDateFromCalendar}
        whatsappUrl={whatsappUrl}
      />

      {/* Weekly Nutrition Meals Pipeline Modal (Numbered Nodes & Assigned Macros Telemetry) */}
      <WeeklyNutritionMealsModal
        isOpen={isNutritionModalOpen}
        onClose={() => setIsNutritionModalOpen(false)}
        client={client}
        assignedDiet={assignedDiet}
      />

      {/* Fullscreen Photo Comparison Modal (with 50/50 interactive slider) */}
      <PhotoComparisonModal
        client={client}
        checkIns={clientCheckIns}
        isOpen={overview.isPhotoModalOpen}
        onClose={() => overview.setIsPhotoModalOpen(false)}
      />

      {/* Broken Records Modal */}
      <BrokenRecordsModal
        client={client}
        isOpen={overview.isBrokenRecordsOpen}
        onClose={() => overview.setIsBrokenRecordsOpen(false)}
        summaries={overview.exerciseSummaries}
        onViewExerciseGraph={(exerciseName) => onNavigateSubTab('logs', exerciseName)}
      />

      {/* Subscription Management Modal */}
      <ClientMembershipModal
        client={client}
        isOpen={overview.isMembershipModalOpen}
        onClose={() => overview.setIsMembershipModalOpen(false)}
      />

      {/* Smart Diagnostic Report Modal */}
      <SmartDiagnosticReportModal
        isOpen={Boolean(overview.selectedDiagnosticReport)}
        onClose={() => overview.setSelectedDiagnosticReport(null)}
        report={overview.selectedDiagnosticReport}
        onOpenHistory={(exerciseName) => {
          overview.setSelectedDiagnosticReport(null);
          onNavigateSubTab('logs', exerciseName);
        }}
      />
    </>
  );
};
