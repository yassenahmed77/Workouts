'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { User, WorkoutPlan } from '@/types';
import { Navbar } from '@/components/Navbar';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { CoachDashboardView } from '@/components/coach/CoachDashboardView';
import { AlertCenterDrawer } from '@/components/coach/alerts/AlertCenterDrawer';
import { deriveCoachAlerts } from '@/lib/alertsEngine';
import { ClientsList } from '@/components/coach/ClientsList';
import { ExerciseLibraryView } from '@/components/coach/ExerciseLibraryView';
import { WorkoutPlanBuilderModal } from '@/components/coach/WorkoutPlanBuilderModal';
import { ClientDetailModal } from '@/components/coach/ClientDetailModal';
import { ClientDetailView, ClientDetailSubTab } from '@/components/coach/client-detail/ClientDetailView';
import { DietPlansView } from '@/components/coach/DietPlansView';
import { CompetitorsView } from '@/components/coach/CompetitorsView';
import { CoachSidebar } from '@/components/coach/CoachSidebar';
import { SplitsStudioView } from '@/components/coach/SplitsStudioView';
import { CoachAlertsView } from '@/components/coach/CoachAlertsView';
import { CalendarView } from '@/components/coach/CalendarView';
import { CoachSettingsView } from '@/components/coach/CoachSettingsView';
import { NewTraineeModal } from '@/components/modals/NewTraineeModal';
import { TraineeDashboard } from '@/components/trainee/TraineeDashboard';
import { WeeklySplitView } from '@/components/trainee/WeeklySplitView';
import { WorkoutHistoryView } from '@/components/trainee/WorkoutHistoryView';
import { TraineeProfileView } from '@/components/trainee/TraineeProfileView';
import { TraineeHabitsView } from '@/components/trainee/TraineeHabitsView';
import { InstallPwaBanner } from '@/components/pwa/InstallPwaBanner';
import { CommandPalette } from '@/components/ui';
import { useAppRouting } from '@/hooks/useAppRouting';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { currentUser, users, plans, dietPlans, checkIns, logs, switchUser, isLoaded } = useGym();
  
  // Headless Two-Way URL Routing & Deep-Linking Engine
  const {
    activeTab,
    selectedClientFor360,
    clientDetailInitialSubTab,
    navigateToTab,
    navigateToClient360,
    closeClient360,
    setClientDetailInitialSubTab
  } = useAppRouting({ currentUser, users, isLoaded });

  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);

  // Derived Normalized System Alerts (Scoped to Coach)
  const coachAlerts = useMemo(() => {
    const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
    return deriveCoachAlerts(users, checkIns, plans, dietPlans, logs, coachId);
  }, [users, checkIns, plans, dietPlans, logs, currentUser]);

  const handleNavigateTab = (tab: string) => {
    navigateToTab(tab);
  };

  const handleSelectClientFor360 = (user: User, initialSubTab: ClientDetailSubTab = 'overview') => {
    navigateToClient360(user, initialSubTab);
  };

  // Modals state
  const [isPlanBuilderOpen, setIsPlanBuilderOpen] = useState(false);
  const [planBuilderInitialPlan, setPlanBuilderInitialPlan] = useState<WorkoutPlan | null>(null);
  const [planBuilderTargetUserId, setPlanBuilderTargetUserId] = useState<string | undefined>(undefined);

  const [isNewTraineeModalOpen, setIsNewTraineeModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Command Palette Shortcut (Cmd+K on Mac, Ctrl+K on Windows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // Register Service Worker for Native Push Notifications & PWA
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);


  // Loading state during initial storage/database hydration
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-[#2f80ed] animate-spin mb-3" />
        <span className="text-xs font-mono text-zinc-400">Loading Workouts PRO OS...</span>
      </div>
    );
  }

  // Not logged in -> Show Authentication / Portal Selection Screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Coach Actions
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
    handleNavigateTab('today');
  };

  return (
    <div className={`min-h-screen ${currentUser.role === 'coach' ? 'md:h-screen bg-[#0a0a0c] md:overflow-hidden' : 'bg-[#0a0a0c]'} text-[#f4f4f5] selection:bg-[#2f80ed]/30 selection:text-white`}>
      {currentUser.role === 'coach' ? (
        // Coach Experience: Left Vertical Sidebar on Desktop, Mobile Bar on Phones
        <div className="min-h-screen md:h-full flex flex-col md:flex-row md:overflow-hidden">
          {/* Mobile Top Navbar (Hidden on Desktop) */}
          <div className="md:hidden flex-shrink-0">
            <Navbar
              activeTab={activeTab}
              setActiveTab={handleNavigateTab}
              onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
            />
          </div>

          {/* Desktop Left Sidebar (Sticky/Fixed) */}
          <CoachSidebar
            activeTab={activeTab}
            setActiveTab={handleNavigateTab}
            onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
            onOpenPlanBuilder={() => handleOpenPlanBuilder()}
            onSwitchToTrainee={handleSwitchToTrainee}
            onOpenAlerts={() => setIsAlertCenterOpen(true)}
            alertsCount={coachAlerts.length}
          />

          {/* Main Coach Workspace Area - Full Width Fit with Proper Top Breathing Room */}
          <main className={`flex-1 w-full max-w-none px-3 sm:px-5 lg:px-6 transition-all md:h-full select-none ${
            selectedClientFor360 
              ? 'pt-4 sm:pt-5 pb-3 overflow-hidden flex flex-col min-h-0' 
              : (activeTab === 'splits-studio' || activeTab === 'diet')
                ? 'pt-2.5 sm:pt-3 pb-2.5 overflow-y-auto lg:overflow-hidden flex flex-col min-h-0'
                : activeTab === 'dashboard' 
                  ? 'pt-2 sm:pt-2.5 pb-2 overflow-y-auto custom-scrollbar' 
                  : activeTab === 'clients'
                    ? 'pt-2.5 sm:pt-3 pb-2 overflow-y-auto custom-scrollbar'
                    : 'pt-4 sm:pt-6 pb-6 overflow-y-auto custom-scrollbar'
          }`}>
            {activeTab === 'dashboard' && (
              <CoachDashboardView
                onOpenAssignModal={(u) => {
                  const target = u || users.find((x) => x.role === 'trainee') || users[0];
                  if (target) handleOpenPlanBuilder(undefined, target.id);
                }}
                onOpenPlanBuilder={() => handleOpenPlanBuilder()}
                onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
                onSelectClient={(u, subTab) => handleSelectClientFor360(u, (subTab as ClientDetailSubTab) || 'overview')}
                onNavigateToClients={() => handleNavigateTab('clients')}
                onNavigateToCompetitors={() => handleNavigateTab('competitors')}
                onNavigateToDiet={() => handleNavigateTab('diet')}
                onNavigateToPlans={() => handleNavigateTab('splits-studio')}
                onOpenAlerts={() => handleNavigateTab('alerts')}
                alerts={coachAlerts}
              />
            )}

            {activeTab === 'splits-studio' && (
              <SplitsStudioView
                onOpenPlanBuilder={(plan, targetUserId) => handleOpenPlanBuilder(plan, targetUserId)}
                onNavigateToClient={(clientId) => {
                  const target = users.find((u) => u.id === clientId);
                  if (target) handleSelectClientFor360(target, 'workout');
                }}
              />
            )}

            {activeTab === 'competitors' && (
              <CompetitorsView
                onSelectClientFor360={(u) => handleSelectClientFor360(u, 'overview')}
                onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
                onSwitchToTrainee={handleSwitchToTrainee}
              />
            )}

            {activeTab === 'clients' && (
              selectedClientFor360 ? (
                <ClientDetailView
                  client={users.find((u) => u.id === selectedClientFor360.id) || selectedClientFor360}
                  initialSubTab={clientDetailInitialSubTab}
                  onBack={() => closeClient360()}
                  onOpenAssignPlan={(u) => handleOpenPlanBuilder(undefined, u.id)}
                  onOpenPlanBuilderForUser={(userId, plan) => handleOpenPlanBuilder(plan, userId)}
                  onSwitchToTrainee={handleSwitchToTrainee}
                />
              ) : (
                <ClientsList
                  onOpenAssignModal={(u) => handleOpenPlanBuilder(undefined, u.id)}
                  onOpenPlanBuilderForUser={(userId, plan) => handleOpenPlanBuilder(plan, userId)}
                  onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
                  onSelectTraineeDetails={(u, subTab) => handleSelectClientFor360(u, (subTab as ClientDetailSubTab) || 'overview')}
                  onSwitchToTrainee={handleSwitchToTrainee}
                  onNavigateToDiet={() => handleNavigateTab('diet')}
                />
              )
            )}

            {activeTab === 'diet' && (
              <DietPlansView
                onNavigateToClient={(clientId) => {
                  const target = users.find((u) => u.id === clientId);
                  if (target) handleSelectClientFor360(target, 'nutrition');
                }}
              />
            )}

            {activeTab === 'exercises' && <ExerciseLibraryView />}

            {activeTab === 'alerts' && (
              <CoachAlertsView
                alerts={coachAlerts}
                onNavigateToClient={(clientId, subTab) => {
                  const target = users.find((u) => u.id === clientId);
                  if (target) {
                    handleSelectClientFor360(target, (subTab as ClientDetailSubTab) || 'overview');
                  }
                }}
                onOpenAssignModal={(u) => handleOpenPlanBuilder(undefined, u.id)}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                onSelectClient={(client) => handleSelectClientFor360(client, 'overview')}
                onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
              />
            )}

            {activeTab === 'settings' && <CoachSettingsView />}
          </main>
        </div>
      ) : (
        // Athlete Experience (Rawan Ahmed / Trainee Portal)
        <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
          <Navbar
            activeTab={activeTab}
            setActiveTab={handleNavigateTab}
            onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
          />

          <main className="flex-1 w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-1.5 sm:pt-4 pb-24 md:pb-12 transition-all">
            {activeTab === 'today' && (
              <TraineeDashboard
                onNavigateToSplit={() => handleNavigateTab('split')}
                onNavigateToHistory={() => handleNavigateTab('history')}
                onNavigateToHabits={() => handleNavigateTab('habits')}
              />
            )}

            {activeTab === 'split' && <WeeklySplitView />}

            {activeTab === 'habits' && <TraineeHabitsView />}

            {activeTab === 'history' && <WorkoutHistoryView />}

            {activeTab === 'profile' && <TraineeProfileView />}
          </main>
        </div>
      )}

      {/* Global Modals */}
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
          handleOpenPlanBuilder(undefined, newUserId);
        }}
        onNavigateToStudio={(targetUserId) => {
          setIsNewTraineeModalOpen(false);
          handleOpenPlanBuilder(undefined, targetUserId);
        }}
        onNavigateToDietStudio={() => {
          setIsNewTraineeModalOpen(false);
          handleNavigateTab('diet');
        }}
        onNavigateToClient360={(newAthlete) => {
          setIsNewTraineeModalOpen(false);
          handleSelectClientFor360(newAthlete, 'overview');
        }}
      />

      <ClientDetailModal
        isOpen={isClientDetailModalOpen}
        user={detailUser}
        onClose={() => {
          setIsClientDetailModalOpen(false);
          setDetailUser(null);
        }}
        onOpenAssignPlan={(u) => handleOpenPlanBuilder(undefined, u.id)}
        onOpenPlanBuilderForUser={(userId) => handleOpenPlanBuilder(undefined, userId)}
      />

      {/* Normalized Alert Center Slide-Over Drawer */}
      <AlertCenterDrawer
        isOpen={isAlertCenterOpen}
        onClose={() => setIsAlertCenterOpen(false)}
        alerts={coachAlerts}
        onNavigateToClient={(clientId, subTab) => {
          const target = users.find((u) => u.id === clientId);
          if (target) {
            handleSelectClientFor360(target, (subTab as ClientDetailSubTab) || 'overview');
            setIsAlertCenterOpen(false);
          }
        }}
      />

      {/* Global Command Palette (Cmd + K Spotlight Search) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectClient={(user) => {
          handleSelectClientFor360(user, 'overview');
        }}
        onNavigateTab={(tab) => {
          handleNavigateTab(tab);
        }}
        onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}
      />

      {/* PWA Install Banner */}
      <InstallPwaBanner />
    </div>
  );
}
