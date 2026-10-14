'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { User, WorkoutPlan } from '@/types';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Eye, 
  LogIn, 
  Link as LinkIcon, 
  Edit3, 
  Dumbbell, 
  Utensils, 
  User as UserIcon,
  MessageCircle,
  PanelLeft,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw
} from 'lucide-react';
import { EditTraineeModal } from '@/components/modals/EditTraineeModal';
import { AssignDietModal } from '@/components/coach/AssignDietModal';
import { SegmentedTabs, SearchInput, ErrorBoundary } from '@/components/ui';
import { clientService } from '@/services/clientService';

interface ClientsListProps {
  onOpenAssignModal: (user: User) => void;
  onOpenPlanBuilderForUser: (userId: string, plan?: WorkoutPlan) => void;
  onOpenNewTraineeModal: () => void;
  onSelectTraineeDetails: (user: User, initialSubTab?: 'overview' | 'checkins' | 'workout' | 'nutrition' | 'logs' | 'notes' | 'timeline') => void;
  onSwitchToTrainee: (userId: string) => void;
  onNavigateToDiet?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

import { useClientsList, AthleteComputedStatus } from '@/hooks/useClientsList';

export type { AthleteComputedStatus };

export const ClientsList: React.FC<ClientsListProps> = ({
  onOpenAssignModal,
  onOpenPlanBuilderForUser,
  onOpenNewTraineeModal,
  onSelectTraineeDetails,
  onSwitchToTrainee,
  onNavigateToDiet,
  isSidebarOpen,
  onToggleSidebar
}) => {
  const {
    trainees,
    filteredTrainees,
    paginatedTrainees,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    sortBy,
    setSortBy,
    getWorkoutWeeklyProgress,
    getAthleteStatus,
    formatSimpleAttention,
    copiedId,
    editingTrainee,
    setEditingTrainee,
    assignDietTrainee,
    setAssignDietTrainee,
    activeActionMenuId,
    setActiveActionMenuId,
    menuCoords,
    setMenuCoords,
    handleCopyAthleteLink,
    plans,
    dietPlans,
    getCheckInsForUser,
    getDietPlanForUser
  } = useClientsList({ customItemsPerPage: 10 });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [expandedTraineeId, setExpandedTraineeId] = useState<string | null>(null);
  const [mobileActionTrainee, setMobileActionTrainee] = useState<User | null>(null);

  const statusFilterTabs = [
    { key: 'all' as const, label: 'All' },
    { key: 'active' as const, label: 'All Set' },
    { key: 'needs_plan' as const, label: 'Needs Plan' },
    { key: 'needs_diet' as const, label: 'Needs Diet' },
    { key: 'needs_setup' as const, label: 'Needs Setup' },
    { key: 'on_hold' as const, label: 'On Hold' }
  ];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: trainees.length,
      active: 0,
      needs_plan: 0,
      needs_diet: 0,
      needs_setup: 0,
      on_hold: 0
    };
    trainees.forEach((t) => {
      const statusKey = getAthleteStatus(t).key;
      if (counts[statusKey] !== undefined) {
        counts[statusKey]++;
      }
    });
    return counts;
  }, [trainees, getAthleteStatus]);

  // Dynamic Viewport Capacity: Calculate how many rows fit naturally
  useEffect(() => {
    const calculateCapacity = () => {
      if (typeof window === 'undefined') return;

      const windowH = window.innerHeight;
      const windowW = window.innerWidth;
      const isMobile = windowW < 768;
      if (isMobile) {
        if (windowW < 375) {
          // Port 320 (< 375px): Exactly 13 clients per page
          setItemsPerPage(13);
          return;
        }
        // Port 375 & Port 425 (375px - 767px): Exactly 10 clients per page
        setItemsPerPage(10);
        return;
      }

      // Desktop: Exactly 10 clients per page so client 11 is cleanly moved to page 2 without any cut off
      setItemsPerPage(10);
    };

    calculateCapacity();
    window.addEventListener('resize', calculateCapacity);
    return () => window.removeEventListener('resize', calculateCapacity);
  }, [setItemsPerPage]);

  // Port 320: Close expanded accordion card when clicking anywhere outside
  useEffect(() => {
    if (!expandedTraineeId) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // If clicking inside the currently expanded card, another card's header, or a modal, do not close
      if (
        target.closest('[data-expanded-client="true"]') ||
        target.closest('[data-accordion-header]') ||
        target.closest('.fixed')
      ) {
        return;
      }
      setExpandedTraineeId(null);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [expandedTraineeId]);

  return (
    <ErrorBoundary fallbackTitle="Unable to load Athletes Directory">
      <div className="flex flex-col flex-1 h-full min-h-0 w-full max-w-none select-none gap-2">
      {/* 1. Elevated Header Section - Search Centered Between Title and Action */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 pb-1.5 border-b border-white/[0.07] shrink-0 min-h-[38px]">
        {isMobileSearchOpen ? (
          /* Mobile Expandable Search Bar Mode */
          <div className="flex sm:hidden items-center gap-2 w-full animate-in fade-in duration-150">
            <div className="flex-1 min-w-0">
              <SearchInput
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
                placeholder="Search athletes..."
                className="w-full"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[var(--card-subtle-bg)] border border-[var(--card-border)] cursor-pointer shrink-0"
              title="Close search"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Left: Heading (Count badge removed per user request) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {onToggleSidebar && (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors flex items-center justify-center cursor-pointer shrink-0 min-[1025px]:hidden"
                  title={isSidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
                  aria-label="Toggle Navigation Sidebar"
                >
                  <PanelLeft className="w-4 h-4 text-slate-300" />
                </button>
              )}
              <h1 className="gym-heading-page text-sm sm:text-base md:text-lg">
                Clients
              </h1>
            </div>

            {/* Center: Desktop Search Input (Hidden on mobile) */}
            <div className="hidden sm:block flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-3">
              <SearchInput
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
                placeholder="Search athletes..."
                className="w-full"
              />
            </div>

            {/* Right: Mobile Search Icon + Add Athlete CTA (+ only on mobile) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="sm:hidden p-1.5 rounded-lg text-slate-300 hover:text-white bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] transition-colors flex items-center justify-center cursor-pointer"
                title="Search athletes"
                aria-label="Search athletes"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenNewTraineeModal}
                className="gym-btn-primary gym-btn-sm shrink-0 whitespace-nowrap text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center gap-1 cursor-pointer"
                title="Add Athlete"
                aria-label="Add Athlete"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Athlete</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 2. Mobile Status Filter (< 768px): Individual Horizontal Scrollable Chips with Right Edge Fade */}
      <div className="md:hidden relative w-full shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth">
          {statusFilterTabs.map((tab) => {
            const isSelected = statusFilter === tab.key;
            const count = statusCounts[tab.key] ?? 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 shrink-0 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs transition-all cursor-pointer border select-none active:scale-95 ${
                  isSelected
                    ? 'bg-[var(--main-color)] text-black border-[var(--main-color)] font-bold shadow-sm shadow-[var(--main-color)]/25'
                    : 'bg-[var(--card-bg)] text-slate-300 hover:text-white border-[var(--card-border)] hover:border-white/20 font-medium'
                }`}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
                <span
                  className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full leading-none font-bold ${
                    isSelected
                      ? 'bg-black/20 text-black'
                      : 'bg-white/[0.08] text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {/* Subtle right gradient fade to indicate more scrollable chips */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--bg-page)] to-transparent" />
      </div>

      {/* 3. Tablet & Desktop Status Filter & Controls Bar (768px+) — 100% LOCKED & UNTOUCHED */}
      <div className="hidden md:flex items-center justify-between gap-2 shrink-0">
        {/* Left: Clean Segmented Status Tabs - Scrollable on mobile & tablet */}
        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar py-0.5">
          <SegmentedTabs
            items={[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'All Set' },
              { key: 'needs_plan', label: 'Needs Plan' },
              { key: 'needs_diet', label: 'Needs Diet' },
              { key: 'needs_setup', label: 'Needs Setup' },
              { key: 'on_hold', label: 'On Hold' }
            ]}
            value={statusFilter}
            onChange={(key) => {
              setStatusFilter(key as any);
              setCurrentPage(1);
            }}
            buttonClassName="whitespace-nowrap text-center justify-center text-[11px] xl:text-[11.5px] px-2.5 xl:px-3 py-1"
          />
        </div>

        {/* Right: Desktop Dropdowns (Hidden on < lg) */}
        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 xl:gap-2 gym-card-subtle px-2 xl:px-2.5 py-1 text-[11px] xl:text-xs">
            <span className="gym-label-mono text-slate-400 whitespace-nowrap text-[9.5px] xl:text-[10px]">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 font-medium text-[11px] xl:text-xs focus:outline-none cursor-pointer pr-1 whitespace-nowrap"
            >
              <option value="name" className="bg-[var(--card-bg)] text-white">Name</option>
              <option value="weight" className="bg-[var(--card-bg)] text-white">Weight</option>
              <option value="adherence" className="bg-[var(--card-bg)] text-white">Workout Progress</option>
            </select>
            <ChevronDown className="w-3 xl:w-3.5 h-3 xl:h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter Plans Dropdown */}
          <div className="flex items-center gap-1.5 xl:gap-2 gym-card-subtle px-2 xl:px-2.5 py-1 text-[11px] xl:text-xs">
            <span className="gym-label-mono text-slate-400 whitespace-nowrap text-[9.5px] xl:text-[10px]">Plan</span>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 font-medium text-[11px] xl:text-xs focus:outline-none cursor-pointer pr-1 whitespace-nowrap max-w-[85px] xl:max-w-none"
            >
              <option value="all" className="bg-[var(--card-bg)] text-white">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id} className="bg-[var(--card-bg)] text-white">
                  {p.title}
                </option>
              ))}
              <option value="none" className="bg-[var(--card-bg)] text-white">No Plan</option>
            </select>
            <ChevronDown className="w-3 xl:w-3.5 h-3 xl:h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Right: Mobile & Tablet "Sort & Filter" Trigger Button (lg:hidden) */}
        <button
          type="button"
          onClick={() => setIsFilterSheetOpen(true)}
          className="lg:hidden gym-card-subtle px-2.5 py-1.5 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          aria-label="Open Sort & Filter menu"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--main-color)]" />
          <span className="font-medium text-[11px] sm:text-xs whitespace-nowrap">Sort & Filter</span>
          {(sortBy !== 'name' || planFilter !== 'all') && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)]" />
          )}
        </button>
      </div>

      {/* Sort & Filter iOS Bottom Sheet Modal (Mobile & Tablet) */}
      {isFilterSheetOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsFilterSheetOpen(false)}
        >
          <div 
            className="w-full max-w-md gym-card-elevated rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[var(--card-border)] overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS drag handle indicator */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--card-border)] shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--main-color)]" />
                <h2 className="text-sm font-semibold text-white">Sort & Filter</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Body - Fluid Scrollable */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              {/* Sort Section */}
              <div>
                <label className="gym-label-mono text-slate-400 text-xs mb-2 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3 h-3 text-[var(--main-color)]" />
                  Sort By
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'name', label: 'Athlete Name' },
                    { id: 'weight', label: 'Body Weight' },
                    { id: 'adherence', label: 'Workout Progress' }
                  ].map((opt) => {
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSortBy(opt.id as any)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium text-left flex items-center justify-between border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--main-color)] bg-[var(--main-color)]/10 text-[var(--main-color)]'
                            : 'border-[var(--card-border)] bg-[var(--card-subtle-bg)] text-slate-300 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[var(--main-color)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plan Filter Section */}
              <div>
                <label className="gym-label-mono text-slate-400 text-xs mb-2 flex items-center gap-1.5">
                  Workout Plan Filter
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPlanFilter('all');
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      planFilter === 'all'
                        ? 'border-[var(--main-color)] bg-[var(--main-color)]/10 text-[var(--main-color)]'
                        : 'border-[var(--card-border)] bg-[var(--card-subtle-bg)] text-slate-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    All Plans
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanFilter('none');
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      planFilter === 'none'
                        ? 'border-[var(--main-color)] bg-[var(--main-color)]/10 text-[var(--main-color)]'
                        : 'border-[var(--card-border)] bg-[var(--card-subtle-bg)] text-slate-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    No Plan
                  </button>
                  {plans.map((p) => {
                    const isSelected = planFilter === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPlanFilter(p.id);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer truncate max-w-[200px] ${
                          isSelected
                            ? 'border-[var(--main-color)] bg-[var(--main-color)]/10 text-[var(--main-color)]'
                            : 'border-[var(--card-border)] bg-[var(--card-subtle-bg)] text-slate-300 hover:text-white hover:border-white/20'
                        }`}
                        title={p.title}
                      >
                        {p.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="flex items-center gap-2 p-4 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSortBy('name');
                  setPlanFilter('all');
                  setCurrentPage(1);
                }}
                disabled={sortBy === 'name' && planFilter === 'all'}
                className="gym-btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="gym-btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Conditional Rendering: Empty State vs Desktop Table & Mobile Cards */}
      {filteredTrainees.length === 0 ? (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--card-bg)] text-slate-400 border border-[var(--card-border)] flex items-center justify-center mx-auto">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Athletes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No clients match your filter criteria. Reset your filters or register a new athlete.
          </p>
          <button
            onClick={onOpenNewTraineeModal}
            className="gym-btn-primary text-xs inline-flex items-center gap-2 mt-2 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Athlete</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. Mobile Viewport 320px (< 375px): Accordion Roster */}
          <div className="viewport-mobile-compact space-y-1">
            {paginatedTrainees.map((trainee) => {
              const isExpanded = expandedTraineeId === trainee.id;
              const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
              const assignedDiet = getDietPlanForUser(trainee.id);
              const traineeCheckIns = getCheckInsForUser(trainee.id);
              const workoutProg = getWorkoutWeeklyProgress(trainee);
              const statusBadge = getAthleteStatus(trainee);
              const attention = formatSimpleAttention(trainee, traineeCheckIns);

              return (
                <div
                  key={trainee.id}
                  data-expanded-client={isExpanded ? 'true' : undefined}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'bg-[var(--card-bg)] border-[var(--main-color)]/50 shadow-md'
                      : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-white/20'
                  }`}
                >
                  {/* Accordion Header */}
                  <div
                    data-accordion-header="true"
                    onClick={() => setExpandedTraineeId(isExpanded ? null : trainee.id)}
                    className="flex items-center justify-between px-2.5 py-1.5 cursor-pointer gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        {trainee.avatarUrl ? (
                          <img
                            src={trainee.avatarUrl}
                            alt={trainee.name}
                            className="w-8 h-8 rounded-full object-cover border border-[var(--card-border)]"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--card-subtle-bg)] text-slate-300 border border-[var(--card-border)] font-mono text-[11px] font-semibold flex items-center justify-center">
                            {trainee.avatarText}
                          </div>
                        )}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-[var(--card-bg)] ${statusBadge.dot}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[11.5px] font-bold text-white truncate leading-tight">
                            {trainee.name}
                          </h3>
                          {attention.dot && (
                            <span className={`w-1.5 h-1.5 rounded-full ${attention.dot} shrink-0`} />
                          )}
                        </div>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 truncate leading-none">
                          {trainee.weightKg} kg
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cleanPhone = (trainee.phone || '+201012345678').replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-1 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 cursor-pointer"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </button>
                      <div className={`p-0.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[var(--main-color)]' : ''}`}>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Accordion Expanded Body */}
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 pt-1 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)]/60 space-y-2 animate-in fade-in duration-150">
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div 
                          onClick={() => onSelectTraineeDetails(trainee, 'workout')}
                          className="p-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] cursor-pointer hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mb-0.5">
                            <span>Workout Split</span>
                            <span className="text-[var(--main-color)]">{workoutProg.workoutPct}%</span>
                          </div>
                          <p className="font-semibold text-white text-[10.5px] truncate">
                            {assignedPlan ? assignedPlan.title : 'Build Routine'}
                          </p>
                          <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--main-color)]"
                              style={{ width: `${workoutProg.workoutPct}%` }}
                            />
                          </div>
                        </div>

                        <div 
                          onClick={() => onSelectTraineeDetails(trainee, 'nutrition')}
                          className="p-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] cursor-pointer hover:border-white/20 transition-colors"
                        >
                          <div className="text-[9px] text-slate-400 font-mono mb-0.5">
                            <span>Diet Calories</span>
                          </div>
                          <p className="font-semibold text-white text-[10.5px] truncate">
                            {assignedDiet?.targetCalories ? `${assignedDiet.targetCalories.toLocaleString()} kcal/d` : 'Assign Diet'}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                            {assignedDiet ? assignedDiet.title : 'No diet assigned'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                          className="gym-btn-primary flex-1 py-1 text-[11px] text-center justify-center font-medium rounded-lg"
                        >
                          Full Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileActionTrainee(trainee)}
                          className="p-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white cursor-pointer"
                          title="More Options"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 2. Mobile Viewports 375px & 425px (375px - 767px): Smart Compact Row Roster */}
          <div className="viewport-mobile-standard space-y-1.5">
            {paginatedTrainees.map((trainee) => {
              const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
              const assignedDiet = getDietPlanForUser(trainee.id);
              const traineeCheckIns = getCheckInsForUser(trainee.id);
              const workoutProg = getWorkoutWeeklyProgress(trainee);
              const statusBadge = getAthleteStatus(trainee);
              const membershipBadge = clientService.getMembershipBadge(trainee);
              const attention = formatSimpleAttention(trainee, traineeCheckIns);

              return (
                <div
                  key={trainee.id}
                  onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] hover:border-white/20 transition-all cursor-pointer shadow-sm active:scale-[0.99] gap-2.5"
                >
                  {/* Left: Avatar */}
                  <div className="relative shrink-0">
                    {trainee.avatarUrl ? (
                      <img
                        src={trainee.avatarUrl}
                        alt={trainee.name}
                        className="w-10 h-10 rounded-full object-cover border border-[var(--card-border)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--card-subtle-bg)] text-slate-300 border border-[var(--card-border)] font-mono text-xs font-semibold flex items-center justify-center">
                        {trainee.avatarText}
                      </div>
                    )}
                  </div>

                  {/* Center: Name & Metrics Subtitle */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-xs font-bold text-white truncate leading-tight">
                        {trainee.name}
                      </h3>
                      {attention.dot && (
                        <span 
                          className={`w-1.5 h-1.5 rounded-full ${attention.dot} shrink-0`} 
                          title={`${attention.label}${attention.timeframe ? ` • ${attention.timeframe}` : ''}`}
                        />
                      )}
                      <span className="ml-auto mr-1 text-[10px] font-mono text-slate-400 shrink-0">
                        {membershipBadge.label}
                      </span>
                    </div>

                    {/* Micro Metrics Line */}
                    <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-slate-400 font-mono truncate">
                      <span className="text-white font-medium">{trainee.weightKg} kg</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="truncate max-w-[85px] text-slate-300">
                        {assignedPlan ? assignedPlan.title : 'No Split'}
                      </span>
                      {assignedPlan && (
                        <span className="text-[9.5px] text-[var(--main-color)]">
                          ({workoutProg.workoutPct}%)
                        </span>
                      )}
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-slate-300 truncate">
                        {assignedDiet?.targetCalories ? `${assignedDiet.targetCalories} kcal` : 'No diet'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const cleanPhone = (trainee.phone || '+201012345678').replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="p-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 transition-colors cursor-pointer"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileActionTrainee(trainee);
                      }}
                      className="p-1.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Desktop & Tablet Table (Hidden on Mobile < md) — Fits content neatly without vertical gap */}
          <div className="hidden md:flex flex-col h-fit gym-card p-0 overflow-hidden shadow-lg border border-white/[0.07]">
            <div ref={tableContainerRef} className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-full">
                <thead className="sticky top-0 bg-[var(--card-subtle-bg)] z-10">
              <tr className="border-b border-white/[0.07] bg-[var(--card-subtle-bg)] text-[10px] xl:text-[10px] min-[1388px]:text-[10.5px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-2 px-2 md:px-2.5 text-left whitespace-nowrap min-w-[180px] md:min-w-[200px] xl:min-w-[210px] min-[1388px]:min-w-[250px]">
                  Athlete
                </th>
                <th className="py-2 px-1 text-center whitespace-nowrap min-w-[65px] lg:min-w-[72px] xl:min-w-[78px] min-[1388px]:min-w-[88px]">
                  Membership
                </th>
                <th className="py-2 px-1 text-center whitespace-nowrap min-w-[58px] lg:min-w-[76px] xl:min-w-[82px] min-[1388px]:min-w-[95px]">
                  <span className="hidden lg:inline">Current / Target</span>
                  <span className="lg:hidden">Weight</span>
                </th>
                <th className="py-2 px-1 text-center whitespace-nowrap min-w-[72px] lg:min-w-[85px] xl:min-w-[95px] min-[1388px]:min-w-[115px]">
                  Workout Split
                </th>
                <th className="py-2 px-1 text-center whitespace-nowrap min-w-[62px] lg:min-w-[74px] xl:min-w-[80px] min-[1388px]:min-w-[90px]">
                  Diet Plan
                </th>
                <th className="hidden xl:table-cell py-2 px-1 text-center whitespace-nowrap min-w-[70px] xl:min-w-[78px] min-[1388px]:min-w-[95px]">
                  Attention
                </th>
                <th className="py-2 px-1 text-center whitespace-nowrap min-w-[55px] lg:min-w-[82px] xl:min-w-[90px] min-[1388px]:min-w-[105px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {paginatedTrainees.map((trainee) => {
                const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
                const assignedDiet = getDietPlanForUser(trainee.id);
                const traineeCheckIns = getCheckInsForUser(trainee.id);
                const workoutProg = getWorkoutWeeklyProgress(trainee);
                const isMenuOpen = activeActionMenuId === trainee.id;

                // Dynamic Actionable Membership & Status Badges
                const statusBadge = getAthleteStatus(trainee);
                const membershipBadge = clientService.getMembershipBadge(trainee);

                // Simplified Attention with Quiet Micro-dots
                const attention = formatSimpleAttention(trainee, traineeCheckIns);

                // Weight delta since baseline
                const earliestCheckIn = traineeCheckIns.length > 0
                  ? [...traineeCheckIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
                  : null;
                const weightDelta = earliestCheckIn
                  ? Number((trainee.weightKg - earliestCheckIn.weightKg).toFixed(1))
                  : null;

                return (
                  <tr 
                    key={trainee.id}
                    className="hover:bg-white/[0.03] transition-colors group relative"
                  >
                    {/* 1. Athlete Column (Circular Avatar, Name, Gender • Age • Email with Seamless Hover Quick-Jumps) */}
                    <td className="py-1.5 px-2 md:px-2.5 text-left align-middle min-w-[180px] md:min-w-[200px] xl:min-w-[210px] min-[1388px]:min-w-[250px]">
                      <div className="flex items-center gap-2 xl:gap-2">
                        <div 
                          onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                          className="relative cursor-pointer flex-shrink-0 self-center"
                        >
                          {trainee.avatarUrl ? (
                            <img
                              src={trainee.avatarUrl}
                              alt={trainee.name}
                              className="w-8 h-8 rounded-full object-cover border border-[var(--card-border)] group-hover:border-white/20 transition-colors shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--card-subtle-bg)] text-slate-400 border border-[var(--card-border)] font-mono text-[10.5px] font-semibold flex items-center justify-center group-hover:border-white/20 transition-colors shadow-sm">
                              {trainee.avatarText}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                          <h3 
                            onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                            className="text-xs md:text-[12px] xl:text-[12.5px] min-[1388px]:text-[13px] font-semibold text-white group-hover:text-[var(--main-color)] transition-colors cursor-pointer truncate whitespace-nowrap leading-tight flex items-center gap-1.5"
                          >
                            <span className="truncate">{trainee.name}</span>
                            {attention.dot && (
                              <span 
                                className={`xl:hidden w-1.5 h-1.5 rounded-full ${attention.dot} shrink-0`} 
                                title={`${attention.label}${attention.timeframe ? ` • ${attention.timeframe}` : ''}`}
                              />
                            )}
                          </h3>
                          <div className="relative h-3.5 mt-0.5 min-w-[160px] md:min-w-[180px] xl:min-w-[190px] min-[1388px]:min-w-[230px] w-full">
                            {/* Normal info - hidden on hover */}
                            <p className="text-[9.5px] md:text-[9.5px] xl:text-[10px] text-slate-400 font-normal whitespace-nowrap absolute inset-0 transition-opacity duration-150 group-hover:opacity-0 pointer-events-none">
                              {trainee.gender || 'Athlete'} &bull; {trainee.age ? `${trainee.age} y/o` : 'Active'} &bull; {trainee.email}
                            </p>
                            {/* Subtle Quick Jumps on Hover - seamlessly replaces info in exact same space */}
                            <div className="flex items-center gap-1.5 xl:gap-1.5 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap flex-nowrap z-10">
                              <button
                                type="button"
                                onClick={() => onSelectTraineeDetails(trainee, 'checkins')}
                                className="text-[10px] text-[var(--main-color)] hover:text-[var(--main-color-hover)] transition-colors cursor-pointer font-medium hover:underline leading-none whitespace-nowrap flex-shrink-0"
                              >
                                Check-ins
                              </button>
                              <span className="text-slate-600 text-[9px] leading-none flex-shrink-0">&bull;</span>
                              <button
                                type="button"
                                onClick={() => onSelectTraineeDetails(trainee, 'workout')}
                                className="text-[10px] text-[var(--main-color)] hover:text-[var(--main-color-hover)] transition-colors cursor-pointer font-medium hover:underline leading-none whitespace-nowrap flex-shrink-0"
                              >
                                Split
                              </button>
                              <span className="text-slate-600 text-[9px] leading-none flex-shrink-0">&bull;</span>
                              <button
                                type="button"
                                onClick={() => onSelectTraineeDetails(trainee, 'nutrition')}
                                className="text-[10px] text-[var(--main-color)] hover:text-[var(--main-color-hover)] transition-colors cursor-pointer font-medium hover:underline leading-none whitespace-nowrap flex-shrink-0"
                              >
                                Diet
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Membership Column (Plain text, no badge, normal text color) */}
                    <td className="py-1.5 px-1 text-center align-middle whitespace-nowrap">
                      <span className="text-[10px] xl:text-[10.5px] min-[1388px]:text-[11px] font-mono font-medium text-slate-300">
                        {membershipBadge.label}
                      </span>
                    </td>

                    {/* 3. Current / Target Column (Centered on 1 Line, Clean Tabular Numerics) */}
                    <td className="py-1.5 px-1 text-center align-middle">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-[10.5px] xl:text-[11px] min-[1388px]:text-[11.5px] font-medium text-white font-numeric whitespace-nowrap flex items-center justify-center gap-1 min-[1388px]:gap-1.5">
                          <span>{trainee.weightKg} kg</span>
                          <span className="hidden lg:inline text-slate-500">/</span>
                          <span className="hidden lg:inline text-slate-400">{trainee.targetWeightKg || trainee.weightKg} kg</span>
                          {weightDelta !== null && (
                            <span
                              className={`hidden lg:inline text-[9px] font-mono px-0.5 py-0.2 rounded border ml-0.5 ${
                                weightDelta < 0
                                    ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
                                    : weightDelta > 0
                                    ? 'bg-amber-950/30 text-amber-400 border-amber-500/20'
                                    : 'bg-[var(--card-subtle-bg)] text-slate-400 border-[var(--card-border)]'
                              }`}
                              title="Weight change since first check-in"
                            >
                              {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 4. Workout Split & Attendance Progress Column */}
                    <td className="py-1.5 px-1 text-center align-middle">
                      <div className="flex flex-col items-center justify-center">
                        {assignedPlan ? (
                          <div 
                            onClick={() => onSelectTraineeDetails(trainee, 'workout')}
                            className="cursor-pointer group/split flex flex-col items-center justify-center"
                          >
                            <p className="text-[10.5px] xl:text-[11px] min-[1388px]:text-[11.5px] font-medium text-white group-hover/split:text-slate-200 transition-colors whitespace-nowrap truncate max-w-[90px] xl:max-w-[95px] min-[1388px]:max-w-[125px] leading-tight">
                              {assignedPlan.title}
                            </p>
                            
                            {/* Workout Attendance Progress Bar */}
                            <div className="w-14 xl:w-16 min-[1388px]:w-22 h-1 rounded-full bg-[var(--card-subtle-bg)] mt-1 overflow-hidden mx-auto">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  workoutProg.workoutPct >= 100
                                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                    : workoutProg.workoutPct >= 50
                                    ? 'bg-[var(--main-color)] shadow-[0_0_8px_var(--main-color-glow)]'
                                    : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                }`}
                                style={{ width: `${workoutProg.workoutPct}%` }}
                              />
                            </div>

                            <p className="text-[8.5px] xl:text-[9px] min-[1388px]:text-[9.5px] text-slate-400 font-mono whitespace-nowrap mt-0.5 leading-tight">
                              {workoutProg.completedDays} of {workoutProg.targetDays} &bull; {workoutProg.workoutPct}%
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenAssignModal(trainee)}
                            className="text-[9px] xl:text-[9.5px] min-[1388px]:text-[10px] font-medium text-slate-400 hover:text-white whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-1.5 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] transition-colors"
                          >
                            <span>Build Split</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 5. Diet Plan Column (Compact Button with Target Calories or Build) */}
                    <td className="py-1.5 px-1 text-center align-middle">
                      <div className="flex flex-col items-center justify-center">
                        {assignedDiet ? (
                          <button
                            type="button"
                            onClick={() => onSelectTraineeDetails(trainee, 'nutrition')}
                            className="text-[9px] xl:text-[9.5px] min-[1388px]:text-[10px] font-mono font-medium text-white hover:text-[var(--main-color)] whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-1.5 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 transition-colors"
                            title={`View Diet: ${assignedDiet.title}`}
                          >
                            <span>{assignedDiet.targetCalories ? `${assignedDiet.targetCalories.toLocaleString()} kcal/d` : 'View Diet'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAssignDietTrainee(trainee)}
                            className="text-[9px] xl:text-[9.5px] min-[1388px]:text-[10px] font-medium text-slate-400 hover:text-white whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-1.5 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] transition-colors"
                          >
                            <span>Build Diet</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 6. Attention Column (Centered, Restrained Micro-dots - Desktop xl+) */}
                    <td className="hidden xl:table-cell py-1.5 px-1 text-center align-middle">
                      <div className="flex flex-col items-center justify-center">
                        {!attention.dot ? (
                          <span className="text-[10px] xl:text-[10.5px] min-[1388px]:text-[11px] text-slate-400 whitespace-nowrap font-normal">
                            &mdash; All Good
                          </span>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                              <span className={`w-1.5 h-1.5 rounded-full ${attention.dot} flex-shrink-0`} />
                              <span className="text-[10px] xl:text-[10.5px] min-[1388px]:text-[11px] font-medium text-white leading-tight">
                                {attention.label}
                              </span>
                            </div>
                            {attention.timeframe && (
                              <span className="text-[8.5px] xl:text-[9px] min-[1388px]:text-[9.5px] text-slate-400 whitespace-nowrap mt-0.5 font-mono leading-tight">
                                {attention.timeframe}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 7. Actions Column (Centered Header and Actions) */}
                    <td className="py-1.5 px-1 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1 min-[1388px]:gap-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cleanPhone = (trainee.phone || '+201012345678').replace(/[^0-9]/g, '');
                            window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
                          }}
                          className="p-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 hover:border-emerald-700/50 text-emerald-400 transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                          title={`Open WhatsApp (${trainee.phone || '+20 101 234 5678'})`}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                          className="hidden lg:inline-flex py-1 px-1.5 xl:px-1.5 min-[1388px]:px-2.5 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-white/20 text-[9.5px] xl:text-[10px] min-[1388px]:text-[10.5px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer items-center active:scale-95 shadow-sm whitespace-nowrap flex-nowrap flex-shrink-0"
                          title="Open full athlete profile & progress 360"
                        >
                          <span className="whitespace-nowrap">Full Profile</span>
                        </button>

                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeActionMenuId === trainee.id) {
                                setActiveActionMenuId(null);
                                setMenuCoords(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const openUpwards = spaceBelow < 250;
                                setMenuCoords({
                                  top: openUpwards ? undefined : rect.bottom + 6,
                                  bottom: openUpwards ? window.innerHeight - rect.top + 6 : undefined,
                                  right: window.innerWidth - rect.right,
                                  openUpwards,
                                });
                                setActiveActionMenuId(trainee.id);
                              }
                            }}
                            className={`p-1 min-[1440px]:p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                              isMenuOpen 
                                ? 'bg-white/[0.08] border-white/20 text-white' 
                                : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] text-slate-400 hover:text-white hover:border-white/20'
                            }`}
                            title="More Actions"
                          >
                            <MoreVertical className="w-3 h-3 min-[1440px]:w-3.5 min-[1440px]:h-3.5 flex-shrink-0" />
                          </button>

                          {/* Dropdown Menu - Floated and Anchored to Three Dots */}
                          {isMenuOpen && menuCoords && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  setMenuCoords(null);
                                }}
                              />
                              <div 
                                style={{
                                  position: 'fixed',
                                  top: menuCoords.top !== undefined ? `${menuCoords.top}px` : 'auto',
                                  bottom: menuCoords.bottom !== undefined ? `${menuCoords.bottom}px` : 'auto',
                                  right: `${menuCoords.right}px`,
                                }}
                                className={`min-w-[190px] w-auto whitespace-nowrap rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 text-left ${
                                  menuCoords.openUpwards ? 'origin-bottom-right' : 'origin-top-right'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setMenuCoords(null);
                                    onOpenAssignModal(trainee);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
                                >
                                  {assignedPlan ? 'Edit Workout Routine' : 'Build Workout Routine'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setMenuCoords(null);
                                    setAssignDietTrainee(trainee);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
                                >
                                  Assign Diet Plan
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setMenuCoords(null);
                                    onSwitchToTrainee(trainee.id);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
                                >
                                  Switch to Athlete View
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setMenuCoords(null);
                                    handleCopyAthleteLink(trainee.id, trainee.name);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
                                >
                                  Copy Portal Link
                                </button>

                                <div className="my-1 border-t border-[var(--card-border)]" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setMenuCoords(null);
                                    setEditingTrainee(trainee);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
                                >
                                  Edit Profile
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Global Navigator / Pagination Bar — Single horizontal bar to fit viewport without scroll */}
      <div className="shrink-0 flex items-center justify-between gap-1.5 pt-1 px-0.5 mt-0.5 sm:mt-1.5">
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal whitespace-nowrap">
          Showing {paginatedTrainees.length} of {filteredTrainees.length}
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-[var(--main-color)]/20 text-[var(--main-color)] border border-[var(--main-color)]/40 shadow-sm'
                  : 'bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

        </>
      )}

      {/* Assign Diet Modal */}
      {assignDietTrainee && (
        <AssignDietModal
          isOpen={true}
          onClose={() => setAssignDietTrainee(null)}
          targetUser={assignDietTrainee}
        />
      )}

      {/* Edit Trainee Modal */}
      {editingTrainee && (
        <EditTraineeModal
          isOpen={true}
          onClose={() => setEditingTrainee(null)}
          user={editingTrainee}
        />
      )}

      {/* Mobile Trainee Actions iOS Bottom Sheet (md:hidden) */}
      {mobileActionTrainee && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/80 backdrop-blur-md animate-in fade-in md:hidden"
          onClick={() => setMobileActionTrainee(null)}
        >
          <div 
            className="w-full gym-card-elevated rounded-t-3xl shadow-2xl border border-[var(--card-border)] overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS handle indicator */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-2 shrink-0" />
            
            {/* Trainee Identity Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[var(--card-subtle-bg)] border border-[var(--card-border)] flex items-center justify-center font-mono text-xs font-bold text-white shrink-0">
                  {mobileActionTrainee.avatarText}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-white truncate">{mobileActionTrainee.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{mobileActionTrainee.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileActionTrainee(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions List */}
            <div className="p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => {
                  const t = mobileActionTrainee;
                  setMobileActionTrainee(null);
                  onSelectTraineeDetails(t, 'overview');
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-white block cursor-pointer transition-colors"
              >
                <span>Full Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const t = mobileActionTrainee;
                  setMobileActionTrainee(null);
                  onOpenAssignModal(t);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-white block cursor-pointer transition-colors"
              >
                <span>{mobileActionTrainee.assignedPlanId ? 'Edit Workout Routine' : 'Build Workout Routine'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const t = mobileActionTrainee;
                  setMobileActionTrainee(null);
                  setAssignDietTrainee(t);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-white block cursor-pointer transition-colors"
              >
                <span>Assign / Edit Diet Plan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const t = mobileActionTrainee;
                  setMobileActionTrainee(null);
                  onSwitchToTrainee(t.id);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-slate-300 block cursor-pointer transition-colors"
              >
                <span>Switch to Athlete View</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const t = mobileActionTrainee;
                  setMobileActionTrainee(null);
                  handleCopyAthleteLink(t.id, t.name);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-slate-300 block cursor-pointer transition-colors"
              >
                <span>Copy Portal Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const t = mobileActionTrainee;
                  setMobileActionTrainee(null);
                  setEditingTrainee(t);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-slate-400 block cursor-pointer transition-colors"
              >
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
};
