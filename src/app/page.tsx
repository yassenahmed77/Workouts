'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { User, WorkoutPlan } from '@/types';
import { Navbar } from '@/components/Navbar';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { ClientsList } from '@/components/coach/ClientsList';
import { WorkoutPlansView } from '@/components/coach/WorkoutPlansView';
import { ExerciseLibraryView } from '@/components/coach/ExerciseLibraryView';
import { AssignPlanModal } from '@/components/coach/AssignPlanModal';
import { WorkoutPlanBuilderModal } from '@/components/coach/WorkoutPlanBuilderModal';
import { ClientDetailModal } from '@/components/coach/ClientDetailModal';
import { NewTraineeModal } from '@/components/modals/NewTraineeModal';
import { TraineeDashboard } from '@/components/trainee/TraineeDashboard';
import { WeeklySplitView } from '@/components/trainee/WeeklySplitView';
import { WorkoutHistoryView } from '@/components/trainee/WorkoutHistoryView';
import { TraineeProfileView } from '@/components/trainee/TraineeProfileView';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { currentUser, switchUser, isLoaded } = useGym();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>('clients');

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetUser, setAssignTargetUser] = useState<User | null>(null);

  const [isPlanBuilderOpen, setIsPlanBuilderOpen] = useState(false);
  const [planBuilderInitialPlan, setPlanBuilderInitialPlan] = useState<WorkoutPlan | null>(null);
  const [planBuilderTargetUserId, setPlanBuilderTargetUserId] = useState<string | undefined>(undefined);

  const [isNewTraineeModalOpen, setIsNewTraineeModalOpen] = useState(false);

  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // Sync default tab when user changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'coach') {
        if (!['clients', 'plans', 'exercises'].includes(activeTab)) {
          setActiveTab('clients');
        }
      } else {
        if (!['today', 'split', 'history', 'profile'].includes(activeTab)) {
          setActiveTab('today');
        }
      }
    }
  }, [currentUser, activeTab]);

  // Loading state during initial storage/database hydration
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
        <span className="text-xs font-mono text-zinc-400">Loading Workouts PRO OS...</span>
      </div>
    );
  }

  // Not logged in -> Show Authentication / Portal Selection Screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Coach Actions
  const handleOpenAssignModal = (user: User) => {
    setAssignTargetUser(user);
    setIsAssignModalOpen(true);
  };

  const handleOpenPlanBuilder = (initialPlan?: WorkoutPlan, targetUserId?: string) => {
    setPlanBuilderInitialPlan(initialPlan || null);
    setPlanBuilderTargetUserId(targetUserId);
    setIsPlanBuilderOpen(true);
  };

  const handleOpenClientDetails = (user: User) => {
    setDetailUser(user);
    setIsClientDetailModalOpen(true);
  };

  const handleSwitchToTrainee = (traineeId: string) => {
    switchUser(traineeId);
    setActiveTab('today');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f6] flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Top Navbar with live role switcher & sign out */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'coach' ? (
          // Coach View
          <>
            {activeTab === 'clients' && (
              <ClientsList
                onOpenAssignModal={handleOpenAssignModal}
                onOpenPlanBuilderForUser={(userId) => handleOpenPlanBuilder(undefined, userId)}
                onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
                onSelectTraineeDetails={handleOpenClientDetails}
                onSwitchToTrainee={handleSwitchToTrainee}
              />
            )}

            {activeTab === 'plans' && (
              <WorkoutPlansView
                onOpenCreatePlanModal={() => handleOpenPlanBuilder()}
                onOpenEditPlanModal={(plan) => handleOpenPlanBuilder(plan)}
                onOpenAssignModalForPlan={(plan) => {
                  setAssignTargetUser(null);
                  setIsAssignModalOpen(true);
                }}
              />
            )}

            {activeTab === 'exercises' && <ExerciseLibraryView />}
          </>
        ) : (
          // Trainee View (Rawan Ahmed or any Athlete)
          <>
            {activeTab === 'today' && (
              <TraineeDashboard
                onNavigateToSplit={() => setActiveTab('split')}
                onNavigateToHistory={() => setActiveTab('history')}
              />
            )}

            {activeTab === 'split' && <WeeklySplitView />}

            {activeTab === 'history' && <WorkoutHistoryView />}

            {activeTab === 'profile' && <TraineeProfileView />}
          </>
        )}
      </main>

      {/* Global Modals */}
      <AssignPlanModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignTargetUser(null);
        }}
        targetUser={assignTargetUser}
      />

      <WorkoutPlanBuilderModal
        isOpen={isPlanBuilderOpen}
        onClose={() => {
          setIsPlanBuilderOpen(false);
          setPlanBuilderInitialPlan(null);
          setPlanBuilderTargetUserId(undefined);
        }}
        initialPlan={planBuilderInitialPlan}
        targetUserId={planBuilderTargetUserId}
      />

      <NewTraineeModal
        isOpen={isNewTraineeModalOpen}
        onClose={() => setIsNewTraineeModalOpen(false)}
        onSuccessSelect={(newUserId) => {
          const added = { id: newUserId } as User;
          handleOpenAssignModal(added);
        }}
      />

      <ClientDetailModal
        isOpen={isClientDetailModalOpen}
        user={detailUser}
        onClose={() => {
          setIsClientDetailModalOpen(false);
          setDetailUser(null);
        }}
        onOpenAssignPlan={(u) => handleOpenAssignModal(u)}
        onOpenPlanBuilderForUser={(userId) => handleOpenPlanBuilder(undefined, userId)}
      />
    </div>
  );
}
