'use client';

import React from 'react';
import { ClientOverviewTab } from './ClientOverviewTab';
import { ClientCheckInsTab } from './ClientCheckInsTab';
import { ClientNutritionTab } from './ClientNutritionTab';
import { ClientWorkoutTab } from './ClientWorkoutTab';
import { ClientLogsTab } from './ClientLogsTab';
import { ClientNotesTab } from './ClientNotesTab';
import { ClientTimelineTab } from './ClientTimelineTab';
import { ClientFormChecksTab } from './ClientFormChecksTab';
import { BrokenRecordsModal } from './BrokenRecordsModal';
import { ClientDetailHeader } from './header/ClientDetailHeader';
import { ClientDetailTabs } from './header/ClientDetailTabs';
import { ClientNotesModal } from './modals/ClientNotesModal';
import { ErrorBoundary } from '@/components/ui';
import { useClientDetail } from '@/hooks/useClientDetail';

/**
 * ClientDetailView (Clean Architecture - Presentation Layer Orchestrator)
 *
 * Ultra-lean, decoupled container (< 100 lines). Delegates logic to `useClientDetail`
 * and presentation to atomic sub-components (`ClientDetailHeader`, `ClientDetailTabs`, `ClientNotesModal`).
 */
export const ClientDetailView = ({
  client: propClient,
  initialSubTab = 'overview',
  onBack,
  onOpenAssignPlan,
  onOpenPlanBuilderForUser,
  onSwitchToTrainee
}) => {
  const {
    client,
    activeSubTab,
    setActiveSubTab,
    scrollContainerRef,
    handleSelectSubTab,
    isNotesModalOpen,
    setIsNotesModalOpen,
    notesInput,
    setNotesInput,
    isSavingNotes,
    handleSaveNotes,
    isBrokenRecordsOpen,
    setIsBrokenRecordsOpen,
    selectedExerciseForGraph,
    setSelectedExerciseForGraph,
    pendingFormChecksCount,
    pendingCheckInsCount,
    subDaysLeft,
    whatsappUrl,
    exerciseSummaries
  } = useClientDetail({ client: propClient, initialSubTab });

  return (
    <ErrorBoundary fallbackTitle="Unable to render Client 360 profile">
      <div className="flex flex-col h-full space-y-1.5 w-full max-w-none select-none overflow-hidden">
        {/* 1. Desktop Only: Header & Executive Telemetry Strip (Hidden on Mobile) */}
        <div className="hidden lg:block flex-shrink-0">
          <ClientDetailHeader
            client={client}
            subDaysLeft={subDaysLeft}
            whatsappUrl={whatsappUrl}
            onBack={onBack}
            onOpenNotes={() => setIsNotesModalOpen(true)}
            onSwitchToTrainee={onSwitchToTrainee}
          />
        </div>

        {/* 2. Desktop Only: Top Sub-Navigation Tabs Strip (Hidden on Mobile) */}
        <div className="hidden lg:block flex-shrink-0">
          <ClientDetailTabs
            activeSubTab={activeSubTab}
            onSelectSubTab={handleSelectSubTab}
            pendingCheckInsCount={pendingCheckInsCount}
            pendingFormChecksCount={pendingFormChecksCount}
          />
        </div>

        {/* Mobile-Only Minimal Header Bar (Only visible when NOT on overview) */}
        {activeSubTab !== 'overview' && (
          <div className="lg:hidden flex items-center justify-between p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex-shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="gym-btn-secondary gym-btn-sm font-mono text-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="font-mono text-xs">&larr;</span>
              <span>Back</span>
            </button>
            <h3 className="text-xs font-bold text-white truncate max-w-[150px]">
              {client.name}
            </h3>
            {onSwitchToTrainee && (
              <button
                type="button"
                onClick={onSwitchToTrainee}
                className="gym-btn-primary text-xs py-1 px-2.5 font-bold shadow-sm cursor-pointer"
              >
                Athlete View
              </button>
            )}
          </div>
        )}

        {/* 3. Active Tab Content Rendering */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-0.5 flex flex-col"
        >
          {activeSubTab === 'overview' && (
            <ClientOverviewTab
              client={client}
              onNavigateSubTab={(tab, exerciseName) => {
                if (exerciseName) setSelectedExerciseForGraph(exerciseName);
                setActiveSubTab(tab);
              }}
              onOpenAssignPlan={onOpenAssignPlan}
              onOpenNotes={() => setIsNotesModalOpen(true)}
              onBack={onBack}
              onSwitchToTrainee={onSwitchToTrainee}
            />
          )}
          {activeSubTab === 'workout' && (
            <ClientWorkoutTab
              client={client}
              onOpenPlanBuilderForUser={onOpenPlanBuilderForUser}
            />
          )}
          {activeSubTab === 'nutrition' && <ClientNutritionTab client={client} />}
          {activeSubTab === 'checkins' && <ClientCheckInsTab client={client} />}
          {activeSubTab === 'formchecks' && <ClientFormChecksTab client={client} />}
          {activeSubTab === 'timeline' && <ClientTimelineTab client={client} />}
          {activeSubTab === 'logs' && (
            <ClientLogsTab
              client={client}
              initialExerciseName={selectedExerciseForGraph}
            />
          )}
          {activeSubTab === 'notes' && <ClientNotesTab client={client} />}
        </div>

        {/* 4. Mobile Only: Modern Bottom Navigation Dock (Thrown all the way to the bottom) */}
        <div className="lg:hidden flex-shrink-0">
          <ClientDetailTabs
            activeSubTab={activeSubTab}
            onSelectSubTab={handleSelectSubTab}
            pendingCheckInsCount={pendingCheckInsCount}
            pendingFormChecksCount={pendingFormChecksCount}
            isMobileBottom={true}
          />
        </div>

        {/* 4. Broken Records Modal */}
        <BrokenRecordsModal
          client={client}
          isOpen={isBrokenRecordsOpen}
          onClose={() => setIsBrokenRecordsOpen(false)}
          summaries={exerciseSummaries}
          onViewExerciseGraph={(exerciseName) => {
            setSelectedExerciseForGraph(exerciseName);
            setActiveSubTab('logs');
          }}
        />

        {/* 5. Isolated Coach Notes Modal */}
        <ClientNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          clientName={client.name}
          notesInput={notesInput}
          onNotesChange={setNotesInput}
          onSave={handleSaveNotes}
          isSaving={isSavingNotes}
        />
      </div>
    </ErrorBoundary>
  );
};
