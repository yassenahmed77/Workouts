'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { Navbar } from '@/components/Navbar';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { CoachDashboardView } from '@/components/coach/CoachDashboardView';
import { AlertCenterDrawer } from '@/components/coach/alerts/AlertCenterDrawer';
import { deriveCoachAlerts } from '@/lib/alertsEngine';
import { ClientsList } from '@/components/coach/ClientsList';
import { ExerciseLibraryView } from '@/components/coach/ExerciseLibraryView';
import { WorkoutPlanBuilderModal } from '@/components/coach/WorkoutPlanBuilderModal';
import { ClientDetailModal } from '@/components/coach/ClientDetailModal';
import { ClientDetailView } from '@/components/coach/client-detail/ClientDetailView';
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
import { TraineeDietView } from '@/components/trainee/TraineeDietView';
import { InstallPwaBanner } from '@/components/pwa/InstallPwaBanner';
import { CommandPalette } from '@/components/ui';
import { useAppRouting } from '@/hooks/useAppRouting';
import { Loader2 } from 'lucide-react';
export default function Home() {
    const { currentUser, users, plans, dietPlans, checkIns, logs, switchUser, isLoaded } = useGym();
    // Headless Two-Way URL Routing & Deep-Linking Engine
    const { activeTab, selectedClientFor360, clientDetailInitialSubTab, navigateToTab, navigateToClient360, closeClient360, setClientDetailInitialSubTab } = useAppRouting({ currentUser, users, isLoaded });
    const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);
    // Derived Normalized System Alerts (Scoped to Coach)
    const coachAlerts = useMemo(() => {
        const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
        return deriveCoachAlerts(users, checkIns, plans, dietPlans, logs, coachId);
    }, [users, checkIns, plans, dietPlans, logs, currentUser]);
    const handleNavigateTab = (tab) => {
        navigateToTab(tab);
    };
    const handleSelectClientFor360 = (user, initialSubTab = 'overview') => {
        navigateToClient360(user, initialSubTab);
    };
    // Modals state
    const [isPlanBuilderOpen, setIsPlanBuilderOpen] = useState(false);
    const [planBuilderInitialPlan, setPlanBuilderInitialPlan] = useState(null);
    const [planBuilderTargetUserId, setPlanBuilderTargetUserId] = useState(undefined);
    const [isNewTraineeModalOpen, setIsNewTraineeModalOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    // Global Command Palette Shortcut (Cmd+K on Mac, Ctrl+K on Windows)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
    const [detailUser, setDetailUser] = useState(null);
    // Responsive Coach Sidebar State: strictly Closed on <= 1024px, Open on > 1024px
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                setIsSidebarOpen(window.innerWidth > 1024);
            }
        };
        if (typeof window !== 'undefined') {
            setIsSidebarOpen(window.innerWidth > 1024);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar anywhere
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsSidebarOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
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
        return (<div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-[var(--main-color)] animate-spin mb-3"/>
        <span className="text-xs font-mono text-zinc-400">Loading Workouts PRO OS...</span>
      </div>);
    }
    // Not logged in -> Show Authentication / Portal Selection Screen
    if (!currentUser) {
        return <AuthScreen />;
    }
    // Coach Actions
    const handleOpenPlanBuilder = (initialPlan, targetUserId) => {
        setPlanBuilderInitialPlan(initialPlan || null);
        setPlanBuilderTargetUserId(targetUserId);
        setIsPlanBuilderOpen(true);
    };
    const handleOpenClientDetails = (user) => {
        setDetailUser(user);
        setIsClientDetailModalOpen(true);
    };
    const handleSwitchToTrainee = (traineeId) => {
        switchUser(traineeId);
        handleNavigateTab('today');
    };
    return (<div className={`min-h-screen ${currentUser.role === 'coach' ? 'h-[100dvh] bg-[var(--bg-page)] md:overflow-hidden' : 'bg-[var(--bg-page)]'} text-[#f4f4f5] selection:bg-[var(--main-color)]/30 selection:text-white`}>
      {currentUser.role === 'coach' ? (
        // Coach Experience: Left Vertical Sidebar on Desktop, Mobile Bar on Phones
        <div className="h-full flex flex-col md:flex-row md:overflow-hidden relative">
          {/* Mobile Top Navbar (Hidden on Desktop, and hidden when inside Client 360 on Mobile) */}
          {!selectedClientFor360 && (
            <div className="md:hidden flex-shrink-0">
              <Navbar activeTab={activeTab} setActiveTab={handleNavigateTab} onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}/>
            </div>
          )}

          {/* Desktop & Tablet Coach Sidebar (Collapsible / Slide-over Drawer) */}
          <CoachSidebar activeTab={activeTab} setActiveTab={handleNavigateTab} onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)} onOpenPlanBuilder={() => handleOpenPlanBuilder()} onSwitchToTrainee={handleSwitchToTrainee} onOpenAlerts={() => setIsAlertCenterOpen(true)} alertsCount={coachAlerts.length} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>

          {/* Main Coach Workspace Area - Full Width Fit with Proper Top Breathing Room */}
          <main className={`flex-1 w-full max-w-none fluid-page-px transition-all h-full select-none ${selectedClientFor360
                ? 'pt-0 sm:pt-5 pb-0 overflow-hidden flex flex-col min-h-0'
                : (activeTab === 'splits-studio' || activeTab === 'diet')
                    ? 'pt-2.5 sm:pt-3 pb-20 md:pb-2.5 overflow-y-auto lg:overflow-hidden flex flex-col min-h-0'
                    : activeTab === 'dashboard'
                        ? 'pt-2 sm:pt-2.5 pb-2 overflow-y-auto custom-scrollbar'
                        : activeTab === 'clients'
                            ? 'pt-2 sm:pt-3 pb-1 md:pb-2.5 overflow-hidden flex flex-col min-h-0 h-full'
                            : 'pt-4 sm:pt-6 pb-6 overflow-y-auto custom-scrollbar'}`}>
            {activeTab === 'dashboard' && (<CoachDashboardView onOpenAssignModal={(u) => {
                    const target = u || users.find((x) => x.role === 'trainee') || users[0];
                    if (target)
                        handleOpenPlanBuilder(undefined, target.id);
                }} onOpenPlanBuilder={() => handleOpenPlanBuilder()} onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)} onSelectClient={(u, subTab) => handleSelectClientFor360(u, subTab || 'overview')} onNavigateToClients={() => handleNavigateTab('clients')} onNavigateToCompetitors={() => handleNavigateTab('competitors')} onNavigateToDiet={() => handleNavigateTab('diet')} onNavigateToPlans={() => handleNavigateTab('splits-studio')} onOpenAlerts={() => handleNavigateTab('alerts')} alerts={coachAlerts} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}/>)}

            {activeTab === 'splits-studio' && (<SplitsStudioView onOpenPlanBuilder={(plan, targetUserId) => handleOpenPlanBuilder(plan, targetUserId)} onNavigateToClient={(clientId) => {
                    const target = users.find((u) => u.id === clientId);
                    if (target)
                        handleSelectClientFor360(target, 'workout');
                }} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}/>)}

            {activeTab === 'competitors' && (<CompetitorsView onSelectClientFor360={(u) => handleSelectClientFor360(u, 'overview')} onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)} onSwitchToTrainee={handleSwitchToTrainee} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}/>)}

            {activeTab === 'clients' && (selectedClientFor360 ? (<ClientDetailView client={users.find((u) => u.id === selectedClientFor360.id) || selectedClientFor360} initialSubTab={clientDetailInitialSubTab} onBack={() => closeClient360()} onOpenAssignPlan={(u) => handleOpenPlanBuilder(undefined, u.id)} onOpenPlanBuilderForUser={(userId, plan) => handleOpenPlanBuilder(plan, userId)} onSwitchToTrainee={handleSwitchToTrainee}/>) : (<ClientsList onOpenAssignModal={(u) => handleOpenPlanBuilder(undefined, u.id)} onOpenPlanBuilderForUser={(userId, plan) => handleOpenPlanBuilder(plan, userId)} onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)} onSelectTraineeDetails={(u, subTab) => handleSelectClientFor360(u, subTab || 'overview')} onSwitchToTrainee={handleSwitchToTrainee} onNavigateToDiet={() => handleNavigateTab('diet')} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}/>))}

            {activeTab === 'diet' && (<DietPlansView onNavigateToClient={(clientId) => {
                    const target = users.find((u) => u.id === clientId);
                    if (target)
                        handleSelectClientFor360(target, 'nutrition');
                }} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}/>)}

            {activeTab === 'exercises' && (<ExerciseLibraryView isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}/>)}

            {activeTab === 'alerts' && (<CoachAlertsView alerts={coachAlerts} onNavigateToClient={(clientId, subTab) => {
                    const target = users.find((u) => u.id === clientId);
                    if (target) {
                        handleSelectClientFor360(target, subTab || 'overview');
                    }
                }} onOpenAssignModal={(u) => handleOpenPlanBuilder(undefined, u.id)} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}/>)}

            {activeTab === 'calendar' && (<CalendarView onSelectClient={(client) => handleSelectClientFor360(client, 'overview')} onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}/>)}

            {activeTab === 'settings' && (<CoachSettingsView isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}/>)}
          </main>
        </div>) : (
        // Athlete Experience (Rawan Ahmed / Trainee Portal)
        <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
          <Navbar activeTab={activeTab} setActiveTab={handleNavigateTab} onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}/>

          <main className="flex-1 w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-1.5 sm:pt-4 pb-24 md:pb-12 transition-all">
            {activeTab === 'today' && (<TraineeDashboard onNavigateToSplit={() => handleNavigateTab('split')} onNavigateToHistory={() => handleNavigateTab('history')} onNavigateToHabits={() => handleNavigateTab('habits')} onNavigateToDiet={() => handleNavigateTab('diet')} onNavigateToProfile={() => handleNavigateTab('profile')}/>)}

            {activeTab === 'split' && <WeeklySplitView />}

            {activeTab === 'diet' && <TraineeDietView />}

            {activeTab === 'habits' && <TraineeHabitsView />}

            {activeTab === 'history' && <WorkoutHistoryView />}

            {activeTab === 'profile' && (<TraineeProfileView onNavigateToWorkouts={() => handleNavigateTab('split')} onNavigateToDiet={() => handleNavigateTab('diet')}/>)}
          </main>
        </div>)}

      {/* Global Modals */}
      <WorkoutPlanBuilderModal isOpen={isPlanBuilderOpen} onClose={() => {
            setIsPlanBuilderOpen(false);
            setPlanBuilderInitialPlan(null);
            setPlanBuilderTargetUserId(undefined);
        }} initialPlan={planBuilderInitialPlan} targetUserId={planBuilderTargetUserId}/>

      <NewTraineeModal isOpen={isNewTraineeModalOpen} onClose={() => setIsNewTraineeModalOpen(false)} onSuccessSelect={(newUserId) => {
            handleOpenPlanBuilder(undefined, newUserId);
        }} onNavigateToStudio={(targetUserId) => {
            setIsNewTraineeModalOpen(false);
            handleOpenPlanBuilder(undefined, targetUserId);
        }} onNavigateToDietStudio={() => {
            setIsNewTraineeModalOpen(false);
            handleNavigateTab('diet');
        }} onNavigateToClient360={(newAthlete) => {
            setIsNewTraineeModalOpen(false);
            handleSelectClientFor360(newAthlete, 'overview');
        }}/>

      <ClientDetailModal isOpen={isClientDetailModalOpen} user={detailUser} onClose={() => {
            setIsClientDetailModalOpen(false);
            setDetailUser(null);
        }} onOpenAssignPlan={(u) => handleOpenPlanBuilder(undefined, u.id)} onOpenPlanBuilderForUser={(userId) => handleOpenPlanBuilder(undefined, userId)}/>

      {/* Normalized Alert Center Slide-Over Drawer */}
      <AlertCenterDrawer isOpen={isAlertCenterOpen} onClose={() => setIsAlertCenterOpen(false)} alerts={coachAlerts} onNavigateToClient={(clientId, subTab) => {
            const target = users.find((u) => u.id === clientId);
            if (target) {
                handleSelectClientFor360(target, subTab || 'overview');
                setIsAlertCenterOpen(false);
            }
        }}/>

      {/* Global Command Palette (Cmd + K Spotlight Search) */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onSelectClient={(user) => {
            handleSelectClientFor360(user, 'overview');
        }} onNavigateTab={(tab) => {
            handleNavigateTab(tab);
        }} onOpenNewTraineeModal={() => setIsNewTraineeModalOpen(true)}/>

      {/* PWA Install Banner */}
      <InstallPwaBanner />
    </div>);
}
