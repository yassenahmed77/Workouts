'use client';

import React, { useMemo } from 'react';
import { User } from '@/types';
import { useGym } from '@/context/GymContext';
import { useClientOverview } from '@/hooks/useClientOverview';
import { ClientWeightTrajectoryCard } from './overview/ClientWeightTrajectoryCard';
import { ClientStrengthProgressCard } from './overview/ClientStrengthProgressCard';
import { ClientPhysiquePhotosCard } from './overview/ClientPhysiquePhotosCard';
import { ClientHabitsAttendanceCard } from './overview/ClientHabitsAttendanceCard';
import { ExerciseProgressionVaultModal } from './ExerciseProgressionVaultModal';
import { PhotoComparisonModal } from './PhotoComparisonModal';
import { BrokenRecordsModal } from './BrokenRecordsModal';
import { ClientMembershipModal } from './ClientMembershipModal';
import { SmartDiagnosticReportModal } from './SmartDiagnosticReportModal';

interface ClientOverviewTabProps {
  client: User;
  onNavigateSubTab: (tab: 'workout' | 'nutrition' | 'checkins' | 'timeline' | 'logs' | 'formchecks' | 'notes', exerciseName?: string) => void;
  onOpenAssignPlan?: (user: User) => void;
  onOpenNotes?: () => void;
}

/**
 * ClientOverviewTab — Decoupled Presentation Container (Clean Architecture - Layer 1).
 * 
 * Orchestrates atomic overview cards and modals while delegating all math,
 * state transitions, and pagination to useClientOverview headless hook.
 */
export const ClientOverviewTab: React.FC<ClientOverviewTabProps> = ({
  client: propClient,
  onNavigateSubTab
}) => {
  const { users, getUserLogs, getCheckInsForUser, getPlanForUser } = useGym();
  const client = users.find((u) => u.id === propClient.id) || propClient;

  const clientLogs = useMemo(() => getUserLogs(client.id), [getUserLogs, client.id]);
  const assignedPlan = getPlanForUser(client.id);
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

  return (
    <>
      {/* 2-Column Responsive Layout Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 select-none">
        {/* Left Column (col-span-7): Trajectory Curve & Core Overload */}
        <div className="lg:col-span-7 space-y-2">
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
            subscriptionInfo={overview.subscriptionInfo}
            targetWeight={targetWeight}
            weightToGoal={weightToGoal}
            onOpenMembership={() => overview.setIsMembershipModalOpen(true)}
          />

          <ClientStrengthProgressCard
            client={client}
            analyzedCoreLifts={overview.analyzedCoreLifts}
            overloadDiagnosticSummary={overview.overloadDiagnosticSummary}
            onNavigateSubTab={onNavigateSubTab}
            onSelectDiagnosticReport={(rep) => overview.setSelectedDiagnosticReport(rep)}
          />
        </div>

        {/* Right Column (col-span-5): Transformation Photos & Attendance */}
        <div className="lg:col-span-5 space-y-2">
          <ClientPhysiquePhotosCard
            activePhotoAngle={overview.activePhotoAngle}
            setActivePhotoAngle={overview.setActivePhotoAngle}
            firstCheckIn={firstCheckIn}
            latestCheckIn={latestCheckIn}
            onOpenFullscreenCompare={() => overview.setIsPhotoModalOpen(true)}
          />

          <ClientHabitsAttendanceCard
            weekAttendance={overview.weekAttendance}
            weekOffset={overview.weekOffset}
            setWeekOffset={overview.setWeekOffset}
          />
        </div>
      </div>

      {/* Modals & Inspection Drawers */}
      <ExerciseProgressionVaultModal
        client={client}
        isOpen={overview.isHistoryOpen}
        onClose={() => overview.setIsHistoryOpen(false)}
        initialExerciseName={overview.selectedExerciseName}
      />

      <PhotoComparisonModal
        client={client}
        checkIns={clientCheckIns}
        isOpen={overview.isPhotoModalOpen}
        onClose={() => overview.setIsPhotoModalOpen(false)}
      />

      <BrokenRecordsModal
        client={client}
        isOpen={overview.isBrokenRecordsOpen}
        onClose={() => overview.setIsBrokenRecordsOpen(false)}
        summaries={overview.exerciseSummaries}
        onViewExerciseGraph={(exerciseName) => onNavigateSubTab('logs', exerciseName)}
      />

      <ClientMembershipModal
        client={client}
        isOpen={overview.isMembershipModalOpen}
        onClose={() => overview.setIsMembershipModalOpen(false)}
      />

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
