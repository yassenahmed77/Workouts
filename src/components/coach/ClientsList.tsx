'use client';

import React from 'react';
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
  MessageCircle
} from 'lucide-react';
import { EditTraineeModal } from '@/components/modals/EditTraineeModal';
import { AssignDietModal } from '@/components/coach/AssignDietModal';
import { SegmentedTabs, SearchInput, ErrorBoundary } from '@/components/ui';

interface ClientsListProps {
  onOpenAssignModal: (user: User) => void;
  onOpenPlanBuilderForUser: (userId: string, plan?: WorkoutPlan) => void;
  onOpenNewTraineeModal: () => void;
  onSelectTraineeDetails: (user: User, initialSubTab?: 'overview' | 'checkins' | 'workout' | 'nutrition' | 'logs' | 'notes' | 'timeline') => void;
  onSwitchToTrainee: (userId: string) => void;
  onNavigateToDiet?: () => void;
}

import { useClientsList, AthleteComputedStatus } from '@/hooks/useClientsList';

export type { AthleteComputedStatus };

export const ClientsList: React.FC<ClientsListProps> = ({
  onOpenAssignModal,
  onOpenPlanBuilderForUser,
  onOpenNewTraineeModal,
  onSelectTraineeDetails,
  onSwitchToTrainee,
  onNavigateToDiet
}) => {
  const {
    trainees,
    filteredTrainees,
    paginatedTrainees,
    totalPages,
    currentPage,
    setCurrentPage,
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
  } = useClientsList();

  return (
    <ErrorBoundary fallbackTitle="Unable to load Athletes Directory">
      <div className="space-y-2 sm:space-y-2.5 w-full max-w-none select-none">
      {/* 1. Header Section - Clean Monochrome Luxury */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Clients
          </h1>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#111827] text-[#94a3b8] border border-[#1f293d]">
            {trainees.length} athletes
          </span>
        </div>

        <button
          onClick={onOpenNewTraineeModal}
          className="py-1 px-3 rounded-lg bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          + Athlete
        </button>
      </div>

      {/* 2. Search, Status Filter & Controls Bar - Minimalist Segmented Aesthetic */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        {/* Left: Search input */}
        <SearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search by name, email, or phone..."
          className="flex-1 max-w-sm sm:max-w-md"
        />

        {/* Center: Clean Segmented Status Tabs */}
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
          buttonClassName="w-24 text-center justify-center"
        />

        {/* Right: Minimal Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-[#090e17] border border-[#16202e] rounded-xl px-2.5 py-1 text-xs text-[#64748b]">
            <span className="text-[10px] text-[#475569] whitespace-nowrap">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-[#cbd5e1] font-medium text-xs focus:outline-none cursor-pointer pr-1 whitespace-nowrap"
            >
              <option value="name" className="bg-[#090e17] text-white">Name</option>
              <option value="weight" className="bg-[#090e17] text-white">Weight</option>
              <option value="adherence" className="bg-[#090e17] text-white">Workout Progress</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#475569] pointer-events-none" />
          </div>

          {/* Filter Plans Dropdown */}
          <div className="flex items-center gap-2 bg-[#090e17] border border-[#16202e] rounded-xl px-2.5 py-1 text-xs text-[#64748b]">
            <span className="text-[10px] text-[#475569] whitespace-nowrap">Plan</span>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[#cbd5e1] font-medium text-xs focus:outline-none cursor-pointer pr-1 whitespace-nowrap"
            >
              <option value="all" className="bg-[#090e17] text-white">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#090e17] text-white">
                  {p.title}
                </option>
              ))}
              <option value="none" className="bg-[#090e17] text-white">No Plan</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#475569] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Desktop High-Density Table - Calm, Executive, Non-AI Look */}
      <div className="hidden lg:block rounded-xl bg-[#080c14] border border-[#141b26] overflow-hidden shadow-lg">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-[#141b26] bg-[#070a10] text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-2 px-3.5 text-left whitespace-nowrap w-[26%] min-w-[250px]">
                  Athlete
                </th>
                <th className="py-2 px-2 text-center whitespace-nowrap w-[12%] min-w-[110px]">
                  Status
                </th>
                <th className="py-2 px-2 text-center whitespace-nowrap w-[15%] min-w-[140px]">
                  Current / Target
                </th>
                <th className="py-2 px-2 text-center whitespace-nowrap w-[18%] min-w-[170px]">
                  Workout Split
                </th>
                <th className="py-2 px-2 text-center whitespace-nowrap w-[15%] min-w-[130px]">
                  Diet Plan
                </th>
                <th className="py-2 px-2 text-center whitespace-nowrap w-[13%] min-w-[120px]">
                  Attention
                </th>
                <th className="py-2 pr-3.5 text-right whitespace-nowrap w-[13%] min-w-[140px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101622] text-xs">
              {paginatedTrainees.map((trainee) => {
                const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
                const assignedDiet = getDietPlanForUser(trainee.id);
                const traineeCheckIns = getCheckInsForUser(trainee.id);
                const workoutProg = getWorkoutWeeklyProgress(trainee);
                const isMenuOpen = activeActionMenuId === trainee.id;

                // Dynamic Actionable Status with Unified Dark Badge
                const statusBadge = getAthleteStatus(trainee);

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
                    className="hover:bg-[#0b1018] transition-colors group relative"
                  >
                    {/* 1. Athlete Column (Circular Avatar, Name, Gender • Age • Email with Seamless Hover Quick-Jumps) */}
                    <td className="py-1.5 px-3.5 align-middle text-left">
                      <div className="flex items-center gap-2.5">
                        <div 
                          onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                          className="relative cursor-pointer flex-shrink-0 self-center"
                        >
                          {trainee.avatarUrl ? (
                            <img
                              src={trainee.avatarUrl}
                              alt={trainee.name}
                              className="w-8.5 h-8.5 rounded-full object-cover border border-[#1b2535] group-hover:border-[#334155] transition-colors shadow-sm"
                            />
                          ) : (
                            <div className="w-8.5 h-8.5 rounded-full bg-[#0d131e] text-[#94a3b8] border border-[#1b2535] font-mono text-[11px] font-semibold flex items-center justify-center group-hover:border-[#334155] transition-colors shadow-sm">
                              {trainee.avatarText}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex flex-col justify-center">
                          <h3 
                            onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                            className="text-[13px] font-semibold text-white group-hover:text-cyan-300 transition-colors cursor-pointer truncate whitespace-nowrap leading-tight"
                          >
                            {trainee.name}
                          </h3>
                          <div className="relative h-3.5 mt-0.5 min-w-[180px]">
                            {/* Normal info - hidden on hover */}
                            <p className="text-[10.5px] text-[#64748b] truncate font-normal whitespace-nowrap absolute inset-0 transition-opacity duration-150 group-hover:opacity-0 pointer-events-none">
                              {trainee.gender || 'Athlete'} &bull; {trainee.age ? `${trainee.age} y/o` : 'Active'} &bull; {trainee.email}
                            </p>
                            {/* Subtle Quick Jumps on Hover - seamlessly replaces info in exact same space */}
                            <div className="flex items-center gap-2 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap flex-nowrap z-10">
                              <button
                                type="button"
                                onClick={() => onSelectTraineeDetails(trainee, 'checkins')}
                                className="text-[10.5px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-medium hover:underline leading-none whitespace-nowrap flex-shrink-0"
                              >
                                Check-ins
                              </button>
                              <span className="text-[#2a3649] text-[9px] leading-none flex-shrink-0">&bull;</span>
                              <button
                                type="button"
                                onClick={() => onSelectTraineeDetails(trainee, 'workout')}
                                className="text-[10.5px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-medium hover:underline leading-none whitespace-nowrap flex-shrink-0"
                              >
                                Split
                              </button>
                              <span className="text-[#2a3649] text-[9px] leading-none flex-shrink-0">&bull;</span>
                              <button
                                type="button"
                                onClick={() => onSelectTraineeDetails(trainee, 'nutrition')}
                                className="text-[10.5px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-medium hover:underline leading-none whitespace-nowrap flex-shrink-0"
                              >
                                Diet
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Status Column (Sleek Dark Pill with Micro-dot) */}
                    <td className="py-1.5 px-2 align-middle text-center">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center justify-center gap-1.5 w-26 py-0.5 rounded-full text-[10.5px] font-medium whitespace-nowrap border ${statusBadge.pillClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                          {statusBadge.label}
                        </span>
                      </div>
                    </td>

                    {/* 3. Current / Target Column (Centered on 1 Line, Clean Tabular Numerics) */}
                    <td className="py-1.5 px-2 align-middle text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-[11.5px] font-medium text-white font-numeric whitespace-nowrap flex items-center justify-center gap-1.5">
                          <span>{trainee.weightKg} kg</span>
                          <span className="text-[#475569]">/</span>
                          <span className="text-[#94a3b8]">{trainee.targetWeightKg || trainee.weightKg} kg</span>
                          {weightDelta !== null && (
                            <span
                              className={`text-[9.5px] font-mono px-1 py-0.2 rounded border ml-0.5 ${
                                weightDelta < 0
                                  ? 'bg-[#0b1612] text-[#34d399] border-[#10b981]/20'
                                  : weightDelta > 0
                                  ? 'bg-[#18150e] text-[#f59e0b] border-[#f59e0b]/20'
                                  : 'bg-[#0f141d] text-[#64748b] border-[#1e2736]'
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
                    <td className="py-1.5 px-2 align-middle text-center">
                      <div className="flex flex-col items-center justify-center">
                        {assignedPlan ? (
                          <div 
                            onClick={() => onSelectTraineeDetails(trainee, 'workout')}
                            className="cursor-pointer group/split flex flex-col items-center justify-center"
                          >
                            <p className="text-[11.5px] font-medium text-white group-hover/split:text-[#cbd5e1] transition-colors whitespace-nowrap truncate max-w-[140px] leading-tight">
                              {assignedPlan.title}
                            </p>
                            
                            {/* Workout Attendance Progress Bar */}
                            <div className="w-24 sm:w-28 h-1 rounded-full bg-[#111722] mt-1 overflow-hidden mx-auto">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  workoutProg.workoutPct >= 100
                                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                    : workoutProg.workoutPct >= 50
                                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                                    : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                }`}
                                style={{ width: `${workoutProg.workoutPct}%` }}
                              />
                            </div>

                            <p className="text-[9.5px] text-[#64748b] font-mono whitespace-nowrap mt-0.5 leading-tight">
                              {workoutProg.completedDays} of {workoutProg.targetDays} Days &bull; {workoutProg.workoutPct}%
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenAssignModal(trainee)}
                            className="text-[10.5px] font-medium text-[#94a3b8] hover:text-white whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-2 rounded-lg bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] transition-colors"
                          >
                            <span>Build Split</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 5. Diet Plan Column (Compact Button with Target Calories or Build) */}
                    <td className="py-1.5 px-2 align-middle text-center">
                      <div className="flex flex-col items-center justify-center">
                        {assignedDiet ? (
                          <button
                            type="button"
                            onClick={() => onSelectTraineeDetails(trainee, 'nutrition')}
                            className="text-[10.5px] font-mono font-medium text-white hover:text-cyan-300 whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-2 rounded-lg bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] hover:border-cyan-500/40 transition-colors"
                            title={`View Diet: ${assignedDiet.title}`}
                          >
                            <span>{assignedDiet.targetCalories ? `${assignedDiet.targetCalories.toLocaleString()} kcal/d` : 'View Diet'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAssignDietTrainee(trainee)}
                            className="text-[10.5px] font-medium text-[#94a3b8] hover:text-white whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-2 rounded-lg bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] transition-colors"
                          >
                            <span>Build Diet</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 6. Attention Column (Centered, Restrained Micro-dots) */}
                    <td className="py-1.5 px-2 align-middle text-center">
                      <div className="flex flex-col items-center justify-center">
                        {!attention.dot ? (
                          <span className="text-[11px] text-[#64748b] whitespace-nowrap font-normal">
                            &mdash; All Good
                          </span>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                              <span className={`w-1.5 h-1.5 rounded-full ${attention.dot} flex-shrink-0`} />
                              <span className="text-[11.5px] font-medium text-white leading-tight">
                                {attention.label}
                              </span>
                            </div>
                            {attention.timeframe && (
                              <span className="text-[9.5px] text-[#64748b] whitespace-nowrap mt-0.5 font-mono leading-tight">
                                {attention.timeframe}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 7. Actions Column (Quiet Luxury Button Strictly on 1 Line) */}
                    <td className="py-1.5 pr-3.5 align-middle text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cleanPhone = (trainee.phone || '+201012345678').replace(/[^0-9]/g, '');
                            window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
                          }}
                          className="p-1.5 rounded-lg bg-[#0a1812] hover:bg-[#10241b] border border-[#1b3d2c] hover:border-[#2b5941] text-[#34d399] transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                          title={`Open WhatsApp (${trainee.phone || '+20 101 234 5678'})`}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#34d399]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                          className="py-1 px-2.5 rounded-lg bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] hover:border-[#2a384e] text-[11px] font-medium text-[#cbd5e1] hover:text-white transition-all cursor-pointer inline-flex items-center active:scale-95 shadow-sm whitespace-nowrap flex-nowrap flex-shrink-0"
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
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                              isMenuOpen 
                                ? 'bg-[#141c2a] border-[#2a384e] text-white' 
                                : 'bg-[#0d131e] border-[#1a2333] text-[#64748b] hover:text-white hover:border-[#233146]'
                            }`}
                            title="More Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5 flex-shrink-0" />
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
                                className={`min-w-[190px] w-auto whitespace-nowrap rounded-2xl bg-[#080c14] border border-[#16202e] shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 text-left ${
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
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#141c2a] hover:text-white transition-colors cursor-pointer text-left block"
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
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#141c2a] hover:text-white transition-colors cursor-pointer text-left block"
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
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#141c2a] hover:text-white transition-colors cursor-pointer text-left block"
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
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#141c2a] hover:text-white transition-colors cursor-pointer text-left block"
                                >
                                  Copy Portal Link
                                </button>

                                <div className="my-1 border-t border-[#141d2a]" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setMenuCoords(null);
                                    setEditingTrainee(trainee);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-400 hover:bg-[#141c2a] hover:text-white transition-colors cursor-pointer text-left block"
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

      {/* 4. Mobile & Tablet Card Layout (< 1024px) - Clean Executive Style */}
      <div className="lg:hidden space-y-3">
        {paginatedTrainees.map((trainee) => {
          const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
          const assignedDiet = getDietPlanForUser(trainee.id);
          const traineeCheckIns = getCheckInsForUser(trainee.id);
          const workoutProg = getWorkoutWeeklyProgress(trainee);
          const statusBadge = getAthleteStatus(trainee);
          const attention = formatSimpleAttention(trainee, traineeCheckIns);

          return (
            <div 
              key={trainee.id}
              className="p-4 rounded-2xl bg-[#080c14] border border-[#141b26] space-y-3 shadow-md"
            >
              {/* Top Row: Circular Avatar, Name, Status Badge */}
              <div className="flex items-center justify-between gap-3">
                <div 
                  onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                >
                  {trainee.avatarUrl ? (
                    <img
                      src={trainee.avatarUrl}
                      alt={trainee.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#1b2535] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0d131e] text-[#94a3b8] border border-[#1b2535] font-mono text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {trainee.avatarText}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {trainee.name}
                    </h3>
                    <p className="text-[11px] text-[#64748b] truncate">
                      {trainee.gender || 'Athlete'} &bull; {trainee.age ? `${trainee.age} y/o` : 'Active'} &bull; {trainee.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center justify-center gap-1.5 w-28 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.pillClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              {/* Biometrics Strip: Current/Target Weight */}
              <div className="p-3 rounded-xl bg-[#0a0e16] border border-[#141b26]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#64748b] uppercase font-medium tracking-wider">
                    Weight Target
                  </span>
                  <div className="text-xs font-medium text-white font-numeric flex items-center gap-1">
                    <span>{trainee.weightKg} kg</span>
                    <span className="text-[#475569]">/</span>
                    <span className="text-[#94a3b8]">{trainee.targetWeightKg} kg</span>
                  </div>
                </div>
              </div>

              {/* Protocols Strip: Workout Split & Diet Plan */}
              <div className="grid grid-cols-2 gap-2">
                {/* Workout Split */}
                <div className="p-2.5 rounded-xl bg-[#0a0e16] border border-[#141b26] flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-medium text-[#94a3b8]">
                      Split
                    </span>
                    <button
                      onClick={() => {
                        if (assignedPlan) {
                          onSelectTraineeDetails(trainee, 'workout');
                        } else {
                          onOpenAssignModal(trainee);
                        }
                      }}
                      className="text-[10px] font-medium text-[#94a3b8] hover:text-white hover:underline cursor-pointer"
                    >
                      {assignedPlan ? 'View' : 'Build'}
                    </button>
                  </div>
                  <p 
                    onClick={() => {
                      if (assignedPlan) {
                        onSelectTraineeDetails(trainee, 'workout');
                      } else {
                        onOpenAssignModal(trainee);
                      }
                    }}
                    className="text-xs font-medium text-white truncate cursor-pointer hover:text-slate-300"
                  >
                    {assignedPlan ? assignedPlan.title : 'None'}
                  </p>
                  
                  {assignedPlan && (
                    <div className="w-full h-1.5 rounded-full bg-[#111722] mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          workoutProg.workoutPct >= 100
                            ? 'bg-emerald-400'
                            : workoutProg.workoutPct >= 50
                            ? 'bg-cyan-400'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${workoutProg.workoutPct}%` }}
                      />
                    </div>
                  )}

                  <p className="text-[10px] text-[#64748b] font-mono truncate mt-1">
                    {assignedPlan ? `${workoutProg.completedDays} of ${workoutProg.targetDays} Days • ${workoutProg.workoutPct}%` : 'No split assigned'}
                  </p>
                </div>

                {/* Diet Plan */}
                <div className="p-2.5 rounded-xl bg-[#0a0e16] border border-[#141b26] flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-medium text-[#94a3b8]">
                      Diet Plan
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (assignedDiet) {
                          onSelectTraineeDetails(trainee, 'nutrition');
                        } else {
                          setAssignDietTrainee(trainee);
                        }
                      }}
                      className="text-[10px] font-medium text-[#94a3b8] hover:text-white hover:underline cursor-pointer"
                    >
                      {assignedDiet ? 'View' : 'Build'}
                    </button>
                  </div>
                  {assignedDiet ? (
                    <button
                      type="button"
                      onClick={() => onSelectTraineeDetails(trainee, 'nutrition')}
                      className="text-[11px] font-mono font-medium text-white hover:text-cyan-300 text-left py-0.5 px-2.5 rounded-lg bg-[#0d131e] border border-[#1a2333] hover:border-cyan-500/40 transition-colors inline-block w-fit mt-0.5"
                    >
                      <span>{assignedDiet.targetCalories ? `${assignedDiet.targetCalories.toLocaleString()} kcal/d` : 'Active Diet'}</span>
                    </button>
                  ) : (
                    <p className="text-[10px] text-[#64748b] font-mono mt-1">No diet assigned</p>
                  )}
                </div>
              </div>

              {/* Attention flag if exists */}
              {attention.dot && (
                <div className="py-1.5 px-3 rounded-xl bg-[#0a0e16] border border-[#141b26] flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${attention.dot}`} />
                  <span className="font-medium text-white">{attention.label}</span>
                  {attention.timeframe && (
                    <span className="text-[10px] text-[#64748b] ml-auto font-mono">{attention.timeframe}</span>
                  )}
                </div>
              )}

              {/* Bottom Row: Full Profile Button + WhatsApp + Switch View */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                  className="flex-1 py-2 px-4 rounded-xl bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] text-xs font-medium text-[#cbd5e1] hover:text-white flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-all whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">Full Profile</span>
                </button>

                <button
                  onClick={() => {
                    const cleanPhone = (trainee.phone || '+201012345678').replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="p-2 rounded-xl bg-[#0d131e] hover:bg-[#12221b] border border-[#1a2333] text-[#34d399] flex items-center justify-center cursor-pointer transition-colors"
                  title="Open WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSwitchToTrainee(trainee.id)}
                  className="p-2 rounded-xl bg-[#0a0e16] border border-[#141b26] text-[#64748b] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="View as Athlete"
                >
                  <LogIn className="w-4 h-4 text-[#64748b]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Pagination & Client Count Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-0.5">
        <p className="text-[11px] text-[#64748b] font-normal whitespace-nowrap">
          Showing {paginatedTrainees.length} of {filteredTrainees.length} clients
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 rounded-lg bg-[#090e17] border border-[#16202e] text-[#64748b] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-[#151f2e] text-white border border-[#233146] shadow-sm'
                  : 'bg-[#090e17] border border-[#16202e] text-[#64748b] hover:text-white'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-7 h-7 rounded-lg bg-[#090e17] border border-[#16202e] text-[#64748b] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredTrainees.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#080c14] border border-[#141b26] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#090e17] text-[#64748b] border border-[#16202e] flex items-center justify-center mx-auto">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Athletes Found</h3>
          <p className="text-xs text-[#64748b] max-w-sm mx-auto">
            No clients match your filter criteria. Reset your filters or register a new athlete.
          </p>
          <button
            onClick={onOpenNewTraineeModal}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 mt-2 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Athlete</span>
          </button>
        </div>
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
      </div>
    </ErrorBoundary>
  );
};
