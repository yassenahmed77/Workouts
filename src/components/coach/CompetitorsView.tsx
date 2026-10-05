'use client';

import React from 'react';
import { User } from '@/types';
import { useGym } from '@/context/GymContext';
import {
  Trophy,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle
} from 'lucide-react';
import { SearchInput, SegmentedTabs } from '@/components/ui';
import { useCompetitors, CompetitorPhaseFilter } from '@/hooks/useCompetitors';
import { CompetitorAuditModal } from './competitors/CompetitorAuditModal';
import { AddCompetitorModal } from './competitors/AddCompetitorModal';

interface CompetitorsViewProps {
  onSelectClientFor360?: (user: User) => void;
  onOpenNewTraineeModal?: () => void;
  onSwitchToTrainee?: (userId: string) => void;
}

export const CompetitorsView: React.FC<CompetitorsViewProps> = ({
  onSelectClientFor360,
  onSwitchToTrainee
}) => {
  const { getUserLogs, getDietPlanForUser, logs } = useGym();

  const {
    competitors,
    nonCompetitorTrainees,
    uniqueShows,
    filteredCompetitors,
    paginatedCompetitors,
    totalPages,
    searchQuery,
    setSearchQuery,
    divisionFilter,
    setDivisionFilter,
    showFilter,
    setShowFilter,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    activeActionMenuId,
    setActiveActionMenuId,
    menuCoords,
    setMenuCoords,
    auditCompetitor,
    setAuditCompetitor,
    isAddCompetitorModalOpen,
    setIsAddCompetitorModalOpen,
    handleSavePrivateNotes,
    handleAddCompetitor,
    handleCopyAthleteLink,
    plans
  } = useCompetitors();

  // Calculate real workout completion against weekly plan
  const getWorkoutWeeklyProgress = (trainee: User) => {
    const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
    if (!assignedPlan) {
      return {
        completedDays: 0,
        targetDays: 0,
        workoutPct: 0,
        hasPlan: false,
        label: 'No Plan'
      };
    }

    const targetDays = assignedPlan.daysPerWeek || assignedPlan.days?.length || 4;
    
    // Check recent logs (last 7 days)
    const userLogs = getUserLogs ? getUserLogs(trainee.id) : (logs || []).filter((l) => l.userId === trainee.id);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = userLogs.filter((l) => new Date(l.date).getTime() >= sevenDaysAgo.getTime());

    let completedDays = recentLogs.length;

    if (completedDays === 0 && trainee.currentSplitProgress) {
      const match = trainee.currentSplitProgress.match(/Day\s*(\d+)/i);
      if (match && match[1]) {
        completedDays = parseInt(match[1], 10);
      } else if (userLogs.length > 0) {
        completedDays = ((userLogs.length - 1) % targetDays) + 1;
      }
    }

    completedDays = Math.min(targetDays, Math.max(0, completedDays));
    const workoutPct = targetDays > 0 ? Math.round((completedDays / targetDays) * 100) : 0;

    return {
      completedDays,
      targetDays,
      workoutPct,
      hasPlan: true,
      label: `${completedDays}/${targetDays} Days`
    };
  };

  // Status helper - unified calm dark obsidian pill with quiet micro-indicator
  const getCompetitorStatus = (comp: User) => {
    const basePill = 'bg-[#0b1018] border-[#161f2e] text-[#cbd5e1]';
    const profile = comp.competitionProfile;
    const phase = profile?.prepPhase || 'Stage Prep';
    const daysOut = profile?.daysOut ?? 45;
    const weightDiff = comp.weightKg - (profile?.targetWeightClassKg || comp.weightKg);

    if (phase.toLowerCase().includes('peak') || daysOut <= 7) {
      return {
        key: 'peak_week',
        label: 'Peak Week',
        dot: 'bg-amber-400/60',
        pillClass: basePill
      };
    }

    if (weightDiff <= 0) {
      return {
        key: 'target_met',
        label: 'Weight Met',
        dot: 'bg-emerald-400/60',
        pillClass: basePill
      };
    }

    if (phase.toLowerCase().includes('cut')) {
      return {
        key: 'cutting',
        label: 'Cutting Phase',
        dot: 'bg-[#64748b]',
        pillClass: basePill
      };
    }

    return {
      key: 'prep',
      label: profile?.prepPhase || 'Stage Prep',
      dot: 'bg-[#64748b]',
      pillClass: basePill
    };
  };

  // Helper for weight progress towards stage limit
  const calculateWeightProgress = (current: number, target: number) => {
    if (!target || target === current) return 100;
    const diff = Math.max(0, current - target);
    const ratio = Math.max(25, Math.min(98, Math.round(100 - diff * 8)));
    return ratio;
  };

  return (
    <div className="space-y-2.5 sm:space-y-3.5 w-full max-w-none pb-2 select-none">
      {/* 1. Header Section - Clean Monochrome Luxury */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Competitors Directory
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#111827] text-[#94a3b8] border border-[#1f293d]">
              {competitors.length} athletes
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-semibold">
            Manage stage prep readiness, target weight limits, championship countdowns, and posing audits.
          </p>
        </div>

        <button
          onClick={() => setIsAddCompetitorModalOpen(true)}
          className="py-1.5 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Competitor</span>
        </button>
      </div>

      {/* 2. Search, Status Filter & Controls Bar - Minimalist Segmented Aesthetic */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Left: Search input */}
        <SearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search by competitor, show, or division..."
          className="flex-1 max-w-sm sm:max-w-md"
        />

        {/* Center: Clean Segmented Division Tabs */}
        <SegmentedTabs
          items={[
            { key: 'All', label: 'All' },
            { key: 'Classic Physique', label: 'Classic Physique' },
            { key: "Men's Physique", label: "Men's Physique" },
            { key: 'Open Bodybuilding', label: 'Open Bodybuilding' },
            { key: 'Peak Week', label: 'Peak Week' }
          ]}
          value={divisionFilter}
          onChange={(tab) => {
            setDivisionFilter(tab as CompetitorPhaseFilter);
            setCurrentPage(1);
          }}
        />

        {/* Right: Minimal Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-[#090e17] border border-[#16202e] rounded-xl px-3 py-1.5 text-xs text-[#64748b]">
            <span className="text-[11px] text-[#475569] whitespace-nowrap">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-[#cbd5e1] font-medium text-xs focus:outline-none cursor-pointer pr-1 whitespace-nowrap"
            >
              <option value="days_out" className="bg-[#090e17] text-white">Days Out</option>
              <option value="weight" className="bg-[#090e17] text-white">Weight</option>
              <option value="readiness" className="bg-[#090e17] text-white">Readiness</option>
              <option value="workout" className="bg-[#090e17] text-white">Workout Progress</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#475569] pointer-events-none" />
          </div>

          {/* Filter Shows Dropdown */}
          <div className="flex items-center gap-2 bg-[#090e17] border border-[#16202e] rounded-xl px-3 py-1.5 text-xs text-[#64748b]">
            <span className="text-[11px] text-[#475569] whitespace-nowrap">Show</span>
            <select
              value={showFilter}
              onChange={(e) => {
                setShowFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[#cbd5e1] font-medium text-xs focus:outline-none cursor-pointer pr-1 whitespace-nowrap max-w-[140px] truncate"
            >
              <option value="all" className="bg-[#090e17] text-white">All Shows</option>
              {uniqueShows.map((s) => (
                <option key={s} value={s} className="bg-[#090e17] text-white">
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#475569] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Desktop High-Density Table */}
      <div className="hidden lg:block rounded-2xl bg-[#080c14] border border-[#141b26] overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="border-b border-[#141b26] bg-[#070a10] text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3 text-left whitespace-nowrap w-[22%] min-w-[180px]">
                  Athlete
                </th>
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-[11%] min-w-[90px]">
                  Status
                </th>
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-[13%] min-w-[115px]">
                  Current / Limit
                </th>
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-[15%] min-w-[125px]">
                  Workout Split
                </th>
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-[13%] min-w-[115px]">
                  Diet &amp; Macros
                </th>
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-[14%] min-w-[125px]">
                  Championship
                </th>
                <th className="py-2.5 pr-3 pl-1 text-right whitespace-nowrap w-[12%] min-w-[140px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101622] text-xs">
              {paginatedCompetitors.map((comp) => {
                const profile = comp.competitionProfile;
                const targetLimit = profile?.targetWeightClassKg || comp.targetWeightKg || comp.weightKg;
                const progressWidth = calculateWeightProgress(comp.weightKg, targetLimit);
                const weightDiff = (comp.weightKg - targetLimit).toFixed(1);
                const statusBadge = getCompetitorStatus(comp);
                const isMenuOpen = activeActionMenuId === comp.id;
                const posingApproved = profile?.posingApproval === 'Approved';
                const readinessScore = profile?.stageReadinessScore ?? 88;
                const assignedPlan = plans.find((p) => p.id === comp.assignedPlanId);
                const assignedDiet = getDietPlanForUser ? getDietPlanForUser(comp.id) : undefined;
                const workoutProg = getWorkoutWeeklyProgress(comp);

                return (
                  <tr
                    key={comp.id}
                    className="hover:bg-[#0b1018] transition-colors group relative"
                  >
                    {/* 1. Athlete Column */}
                    <td className="py-2.5 px-3 align-middle text-left">
                      <div className="flex items-center gap-2.5">
                        <div
                          onClick={() => onSelectClientFor360 ? onSelectClientFor360(comp) : setAuditCompetitor(comp)}
                          className="relative cursor-pointer flex-shrink-0 self-center"
                        >
                          {comp.avatarUrl ? (
                            <img
                              src={comp.avatarUrl}
                              alt={comp.name}
                              className="w-9 h-9 rounded-full object-cover border border-[#1b2535] group-hover:border-[#334155] transition-colors shadow-sm"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#0d131e] text-[#94a3b8] border border-[#1b2535] font-mono text-xs font-semibold flex items-center justify-center group-hover:border-[#334155] transition-colors shadow-sm">
                              {comp.avatarText || comp.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            <h3
                              onClick={() => onSelectClientFor360 ? onSelectClientFor360(comp) : setAuditCompetitor(comp)}
                              className="text-xs sm:text-[13px] font-semibold text-white group-hover:text-cyan-300 transition-colors cursor-pointer truncate leading-snug"
                            >
                              {comp.name}
                            </h3>
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/40 flex-shrink-0">
                              {profile?.division || 'Classic'}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#64748b] truncate mt-0.5 font-normal leading-tight">
                            {profile?.daysOut !== undefined ? `${profile.daysOut}d out` : 'Prep'} &bull; {comp.email}
                          </p>
                          <div className="h-3.5 flex items-center gap-2 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            {onSelectClientFor360 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onSelectClientFor360(comp)}
                                  className="text-[9.5px] text-[#64748b] hover:text-[#2f80ed] transition-colors cursor-pointer font-medium hover:underline leading-none"
                                >
                                  Profile 360
                                </button>
                                <span className="text-[#2a3649] text-[8px] leading-none">&bull;</span>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setAuditCompetitor(comp)}
                              className="text-[9.5px] text-[#64748b] hover:text-[#2f80ed] transition-colors cursor-pointer font-medium hover:underline leading-none"
                            >
                              Stage Audit
                            </button>
                            <span className="text-[#2a3649] text-[8px] leading-none">&bull;</span>
                            <button
                              type="button"
                              onClick={() => setAuditCompetitor(comp)}
                              className="text-[9.5px] text-[#64748b] hover:text-[#2f80ed] transition-colors cursor-pointer font-medium hover:underline leading-none"
                            >
                              Posing
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Stage Status Column */}
                    <td className="py-2 px-1.5 align-middle text-center">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium whitespace-nowrap border ${statusBadge.pillClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                          {statusBadge.label}
                        </span>
                      </div>
                    </td>

                    {/* 3. Current / Limit Column */}
                    <td className="py-2 px-1.5 align-middle text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-[11.5px] font-medium text-white font-numeric whitespace-nowrap flex items-center justify-center gap-1">
                          <span>{comp.weightKg} kg</span>
                          <span className="text-[#475569]">/</span>
                          <span className="text-[#94a3b8]">{targetLimit} kg</span>
                          <span
                            className={`text-[9.5px] font-mono px-1 py-0.2 rounded border ml-0.5 ${
                              Number(weightDiff) <= 0
                                ? 'bg-[#0b1612] text-[#34d399] border-[#10b981]/20'
                                : 'bg-[#18150e] text-[#f59e0b] border-[#f59e0b]/20'
                            }`}
                            title="Weight vs Stage limit"
                          >
                            {Number(weightDiff) <= 0 ? 'Met' : `+${weightDiff} kg`}
                          </span>
                        </div>
                        <div className="w-20 sm:w-24 h-1.5 rounded-full bg-[#111722] mt-1 overflow-hidden mx-auto">
                          <div
                            className="h-full bg-cyan-400/70 rounded-full transition-all duration-300"
                            style={{ width: `${progressWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 4. Workout Split Column */}
                    <td className="py-2 px-1.5 align-middle text-center">
                      <div className="flex flex-col items-center justify-center">
                        {assignedPlan ? (
                          <div
                            onClick={() => onSelectClientFor360 && onSelectClientFor360(comp)}
                            className="cursor-pointer group/split flex flex-col items-center justify-center"
                          >
                            <p className="text-[11.5px] font-medium text-white group-hover/split:text-[#cbd5e1] transition-colors whitespace-nowrap truncate max-w-[130px]">
                              {assignedPlan.title}
                            </p>
                            <div className="w-20 sm:w-24 h-1.5 rounded-full bg-[#111722] mt-1 overflow-hidden mx-auto">
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
                            <p className="text-[9.5px] text-[#64748b] font-mono whitespace-nowrap mt-0.5">
                              {workoutProg.completedDays} of {workoutProg.targetDays}d &bull; {workoutProg.workoutPct}%
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectClientFor360 && onSelectClientFor360(comp)}
                            className="text-[10.5px] font-medium text-[#94a3b8] hover:text-white whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-2 rounded-lg bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] transition-colors"
                          >
                            <span>Build Split</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 5. Diet & Macros Column */}
                    <td className="py-2 px-1.5 align-middle text-center">
                      <div className="flex flex-col items-center justify-center">
                        {assignedDiet ? (
                          <div className="flex flex-col items-center justify-center">
                            <button
                              type="button"
                              onClick={() => onSelectClientFor360 && onSelectClientFor360(comp)}
                              className="text-[10.5px] font-mono font-medium text-white hover:text-cyan-300 whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-2 rounded-lg bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] hover:border-cyan-500/40 transition-colors"
                              title={`View Diet: ${assignedDiet.title}`}
                            >
                              <span>{assignedDiet.targetCalories ? `${assignedDiet.targetCalories.toLocaleString()} kcal/d` : 'View Diet'}</span>
                            </button>
                            <p className="text-[9.5px] text-[#64748b] font-mono whitespace-nowrap mt-0.5">
                              {assignedDiet.targetProteinG}g P &bull; {assignedDiet.targetCarbsG}g C &bull; {assignedDiet.targetFatsG}g F
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectClientFor360 && onSelectClientFor360(comp)}
                            className="text-[10.5px] font-medium text-[#94a3b8] hover:text-white whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-2 rounded-lg bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] transition-colors"
                          >
                            <span>Build Diet</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 6. Championship Column */}
                    <td className="py-2 px-1.5 align-middle text-center">
                      <div
                        onClick={() => setAuditCompetitor(comp)}
                        className="flex flex-col items-center justify-center cursor-pointer group/championship"
                      >
                        <p className="text-[11.5px] font-medium text-white group-hover/championship:text-cyan-300 transition-colors whitespace-nowrap truncate max-w-[140px]">
                          {profile?.targetShow || 'Championship Prep'}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              posingApproved ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          <span className="text-[9.5px] text-[#94a3b8] font-mono whitespace-nowrap">
                            {readinessScore}% Ready &bull; {posingApproved ? 'Posing OK' : 'Audit Posing'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 7. Actions Column */}
                    <td className="py-2 pr-3 pl-1 align-middle text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cleanPhone = (comp.phone || '+201012345678').replace(/[^0-9]/g, '');
                            window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
                          }}
                          className="p-1.5 rounded-lg bg-[#0a1812] hover:bg-[#10241b] border border-[#1b3d2c] hover:border-[#2b5941] text-[#34d399] transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                          title={`Open WhatsApp (${comp.phone || '+20 101 234 5678'})`}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#34d399]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setAuditCompetitor(comp)}
                          className="py-1 px-2.5 rounded-lg bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] hover:border-[#2a384e] text-[11px] font-medium text-[#cbd5e1] hover:text-white transition-all cursor-pointer inline-flex items-center active:scale-95 shadow-sm whitespace-nowrap flex-nowrap flex-shrink-0"
                          title="Open Stage Audit &amp; Private Notes"
                        >
                          <span className="whitespace-nowrap">Stage Audit</span>
                        </button>

                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeActionMenuId === comp.id) {
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
                                setActiveActionMenuId(comp.id);
                              }
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                              isMenuOpen
                                ? 'bg-[#141c2a] border-[#2a384e] text-white'
                                : 'bg-[#0d131e] border-[#1a2333] text-[#64748b] hover:text-white hover:border-[#233146]'
                            }`}
                          >
                            <span className="text-xs">&bull;&bull;&bull;</span>
                          </button>

                          {/* Floating Popover Menu */}
                          {isMenuOpen && menuCoords && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => {
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
                                className="z-50 w-44 rounded-xl bg-[#090e17] border border-[#16202e] shadow-2xl py-1 text-left select-none animate-in fade-in zoom-in-95 duration-100"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setMenuCoords(null);
                                    setAuditCompetitor(comp);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#141c2a] hover:text-white transition-colors cursor-pointer text-left block"
                                >
                                  Open Stage Audit
                                </button>

                                {onSelectClientFor360 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      setMenuCoords(null);
                                      onSelectClientFor360(comp);
                                    }}
                                    className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#141c2a] hover:text-white transition-colors cursor-pointer text-left block"
                                  >
                                    Open Client 360
                                  </button>
                                )}

                                {onSwitchToTrainee && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      setMenuCoords(null);
                                      onSwitchToTrainee(comp.id);
                                    }}
                                    className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#141c2a] hover:text-white transition-colors cursor-pointer text-left block"
                                  >
                                    Switch to Athlete View
                                  </button>
                                )}

                                <div className="my-1 border-t border-[#141d2a]" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setMenuCoords(null);
                                    handleCopyAthleteLink(comp.id, comp.name);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-slate-400 hover:bg-[#141c2a] hover:text-white transition-colors cursor-pointer text-left block"
                                >
                                  Copy Portal Link
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

      {/* 4. Mobile & Tablet Card Layout (< 1024px) */}
      <div className="lg:hidden space-y-3">
        {paginatedCompetitors.map((comp) => {
          const profile = comp.competitionProfile;
          const targetLimit = profile?.targetWeightClassKg || comp.targetWeightKg || comp.weightKg;
          const progressWidth = calculateWeightProgress(comp.weightKg, targetLimit);
          const weightDiff = (comp.weightKg - targetLimit).toFixed(1);
          const statusBadge = getCompetitorStatus(comp);
          const posingApproved = profile?.posingApproval === 'Approved';
          const readinessScore = profile?.stageReadinessScore ?? 88;
          const assignedPlan = plans.find((p) => p.id === comp.assignedPlanId);
          const assignedDiet = getDietPlanForUser ? getDietPlanForUser(comp.id) : undefined;
          const workoutProg = getWorkoutWeeklyProgress(comp);

          return (
            <div
              key={comp.id}
              className="p-4 rounded-2xl bg-[#080c14] border border-[#141b26] space-y-3 shadow-md"
            >
              {/* Top Row: Circular Avatar, Name, Division badge & Status Badge */}
              <div className="flex items-center justify-between gap-3">
                <div
                  onClick={() => onSelectClientFor360 ? onSelectClientFor360(comp) : setAuditCompetitor(comp)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                >
                  {comp.avatarUrl ? (
                    <img
                      src={comp.avatarUrl}
                      alt={comp.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#1b2535] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0d131e] text-[#94a3b8] border border-[#1b2535] font-mono text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {comp.avatarText || comp.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {comp.name}
                      </h3>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/40">
                        {profile?.division || 'Classic Physique'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                      {profile?.targetShow || 'Championship Prep'} &bull; {profile?.daysOut !== undefined ? `${profile.daysOut}d out` : 'Prep'} &bull; {comp.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.pillClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              {/* Data Row 1: Current vs Target Limit + Readiness */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#090d14] border border-[#141b26]">
                <div>
                  <span className="text-[9px] font-mono uppercase text-[#64748b] block">Current / Stage Limit</span>
                  <div className="text-xs font-medium text-white font-numeric mt-0.5 flex items-center gap-1">
                    <span>{comp.weightKg} kg</span>
                    <span className="text-[#475569]">/</span>
                    <span className="text-[#94a3b8]">{targetLimit} kg</span>
                    <span className="text-[9px] font-mono text-[#f59e0b] ml-1">
                      {Number(weightDiff) <= 0 ? 'Met' : `+${weightDiff}k`}
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[#111722] mt-1 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${progressWidth}%` }} />
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-[#64748b] block">Readiness &amp; Posing</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${posingApproved ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-xs font-medium text-white">
                      {readinessScore}% &bull; {posingApproved ? 'Approved' : 'Needs Review'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748b] font-mono block mt-0.5 truncate">
                    {profile?.targetShow || 'Championship'}
                  </span>
                </div>
              </div>

              {/* Data Row 2: Workout Attendance + Diet Calories */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#090d14] border border-[#141b26]">
                <div>
                  <span className="text-[9px] font-mono uppercase text-[#64748b] block">Workout Split</span>
                  <p className="text-xs font-medium text-white truncate mt-0.5">
                    {assignedPlan?.title || 'No Split'}
                  </p>
                  <p className="text-[10px] text-[#64748b] font-mono mt-0.5">
                    {workoutProg.completedDays}/{workoutProg.targetDays} Days &bull; {workoutProg.workoutPct}%
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-[#64748b] block">Diet Plan</span>
                  <p className="text-xs font-mono font-medium text-white mt-0.5">
                    {assignedDiet ? `${assignedDiet.targetCalories.toLocaleString()} kcal` : 'No Diet'}
                  </p>
                  <p className="text-[10px] text-[#64748b] font-mono mt-0.5">
                    {assignedDiet ? `${assignedDiet.targetProteinG}P • ${assignedDiet.targetCarbsG}C • ${assignedDiet.targetFatsG}F` : 'Not assigned'}
                  </p>
                </div>
              </div>

              {/* Bottom Action Row: WhatsApp, Stage Audit, Profile */}
              <div className="grid grid-cols-12 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const cleanPhone = (comp.phone || '+201012345678').replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="col-span-2 py-2 rounded-xl bg-[#0a1812] border border-[#1b3d2c] text-[#34d399] flex items-center justify-center cursor-pointer"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setAuditCompetitor(comp)}
                  className="col-span-6 py-2 px-3 rounded-xl bg-[#0d131e] hover:bg-[#141c2a] border border-[#1a2333] text-xs font-medium text-[#cbd5e1] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>Stage Audit</span>
                </button>

                {onSelectClientFor360 && (
                  <button
                    type="button"
                    onClick={() => onSelectClientFor360(comp)}
                    className="col-span-4 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-semibold flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    <span>Profile 360</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Pagination & Client Count Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-[#64748b] font-normal whitespace-nowrap">
          Showing {paginatedCompetitors.length} of {filteredCompetitors.length} competitors
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-xl bg-[#090e17] border border-[#16202e] text-[#64748b] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-8 h-8 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
            className="w-8 h-8 rounded-xl bg-[#090e17] border border-[#16202e] text-[#64748b] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredCompetitors.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#080c14] border border-[#141b26] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#090e17] text-[#64748b] border border-[#16202e] flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Competitors Found</h3>
          <p className="text-xs text-[#64748b] max-w-sm mx-auto">
            No athletes match your filter criteria. Reset your filters or add a new stage competitor.
          </p>
          <button
            onClick={() => setIsAddCompetitorModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 mt-2 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Competitor</span>
          </button>
        </div>
      )}

      {/* 6. Interactive Stage Audit & Private Notes Modal */}
      <CompetitorAuditModal
        competitor={auditCompetitor}
        onClose={() => setAuditCompetitor(null)}
        onSelectClientFor360={onSelectClientFor360}
        onSavePrivateNotes={handleSavePrivateNotes}
      />

      {/* 7. Add Competitor Modal */}
      <AddCompetitorModal
        isOpen={isAddCompetitorModalOpen}
        onClose={() => setIsAddCompetitorModalOpen(false)}
        availableTrainees={nonCompetitorTrainees}
        onAddCompetitor={handleAddCompetitor}
      />
    </div>
  );
};
