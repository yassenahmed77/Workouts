'use client';
import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { Search, Copy, Trash2, X, Plus, Eye, PanelLeft } from 'lucide-react';
import { workoutService } from '@/services/workoutService';
import { clientService } from '@/services/clientService';
export const SplitsStudioView = ({ onOpenPlanBuilder, onNavigateToClient, isSidebarOpen, onToggleSidebar }) => {
    const { plans, users, currentUser, deletePlan, createPlan } = useGym();
    const { showToast, confirmDialog } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
    const trainees = useMemo(() => {
        return clientService.getTrainees(users, coachId);
    }, [users, coachId]);
    const scopedPlans = useMemo(() => {
        if (!coachId)
            return plans;
        return workoutService.getPlansByCoach(plans, coachId);
    }, [plans, coachId]);
    // Trainees who have a split deployed (either via assignedPlanId or createdForUserId)
    const traineesWithSplit = useMemo(() => {
        return trainees.filter((t) => {
            return Boolean(t.assignedPlanId) || scopedPlans.some((p) => p.createdForUserId === t.id);
        });
    }, [trainees, scopedPlans]);
    const splitCoveragePct = Math.round((traineesWithSplit.length / Math.max(1, trainees.length)) * 100);
    // Active Plans deployed for athletes or available as master templates
    const activeAthletePlans = useMemo(() => {
        return scopedPlans.map((plan) => {
            // Check direct creation mapping
            const directAthlete = users.find((u) => u.id === plan.createdForUserId);
            // Check users who have this plan assigned
            const assignedAthletes = users.filter((u) => u.assignedPlanId === plan.id);
            const athlete = directAthlete || assignedAthletes[0];
            const totalAssignedCount = assignedAthletes.length;
            const isTemplate = !directAthlete && totalAssignedCount === 0;
            return {
                plan,
                athlete,
                totalAssignedCount,
                assignedAthletes,
                isTemplate
            };
        }).filter((item) => {
            if (!searchQuery)
                return true;
            const q = searchQuery.toLowerCase();
            const matchTitle = item.plan.title.toLowerCase().includes(q);
            const matchAthlete = item.athlete?.name.toLowerCase().includes(q);
            const matchDesc = item.plan.description?.toLowerCase().includes(q);
            const matchLevel = item.plan.level?.toLowerCase().includes(q);
            return matchTitle || matchAthlete || matchDesc || matchLevel;
        });
    }, [plans, users, searchQuery]);
    // Trainees who currently have no split deployed
    const pendingAthletes = useMemo(() => {
        return trainees.filter((t) => {
            const hasPlan = Boolean(t.assignedPlanId) || plans.some((p) => p.createdForUserId === t.id);
            if (hasPlan)
                return false;
            if (!searchQuery)
                return true;
            const q = searchQuery.toLowerCase();
            return t.name.toLowerCase().includes(q) || (t.goal && t.goal.toLowerCase().includes(q));
        });
    }, [trainees, plans, searchQuery]);
    const handleDuplicatePlan = async (sourcePlan) => {
        try {
            const cloned = workoutService.duplicatePlan(sourcePlan);
            const duplicated = await createPlan(cloned);
            showToast(`Duplicated "${sourcePlan.title}"`, 'success');
            onOpenPlanBuilder(duplicated, sourcePlan.createdForUserId);
        }
        catch {
            showToast('Failed to duplicate split', 'error');
        }
    };
    const handleDeletePlan = (planId, planTitle) => {
        confirmDialog({
            title: 'Delete Workout Split',
            message: `Are you sure you want to delete "${planTitle}"? This will permanently remove this split architecture.`,
            confirmText: 'Delete Split',
            variant: 'danger',
            onConfirm: async () => {
                await deletePlan(planId);
                showToast(`Deleted "${planTitle}"`, 'info');
            }
        });
    };
    return (<div className="flex flex-col flex-1 h-full min-h-0 w-full space-y-2 pb-24 md:pb-3 font-sans text-slate-100 select-none overflow-y-auto lg:overflow-hidden">
      
      {/* 1. Header, Telemetry Pills, & Search Bar */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-white/[0.07]">
        {/* Title (Sidebar icon left-aligned on mobile, centered title) */}
        <div className="relative min-w-0 w-full md:w-auto flex items-center justify-center md:justify-start gap-2">
          {onToggleSidebar && (<button type="button" onClick={onToggleSidebar} className="absolute left-0 md:static p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors flex items-center justify-center cursor-pointer shrink-0 min-[1025px]:hidden" title={isSidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"} aria-label="Toggle Navigation Sidebar">
              <PanelLeft className="w-4 h-4 text-slate-300"/>
            </button>)}
          <div className="min-w-0 text-center md:text-left px-8 md:px-0">
            <h1 className="gym-heading-page text-sm sm:text-base md:text-lg truncate">
              Workout Plans & Splits Studio
            </h1>
            <p className="gym-subtext mt-0.5 truncate hidden sm:block">
              Client-centric periodization, custom split architectures, and reusable master templates.
            </p>
          </div>
        </div>

        {/* Action Controls & Search Input */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"/>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search athlete or split..." className="w-full gym-input !pl-8 pr-7 text-xs"/>
            {searchQuery && (<button type="button" onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5 cursor-pointer transition-colors" title="Clear search">
                <X className="w-3.5 h-3.5"/>
              </button>)}
          </div>

          <button type="button" onClick={() => onOpenPlanBuilder()} className="gym-btn-primary text-xs px-2.5 sm:px-3 py-1.5 h-[34px] font-semibold shrink-0 cursor-pointer">
            + Build Split
          </button>
        </div>
      </div>

      {/* 2. Micro Telemetry Capsule Strip (optimized for 320px screens while preserving desktop layout) */}
      <div className="flex-shrink-0 flex items-center justify-between sm:justify-center lg:justify-start gap-1 sm:gap-2 overflow-x-auto no-scrollbar font-mono py-0.5 w-full">
        <div className="gym-card-subtle px-1.5 sm:px-2.5 py-0.5 sm:py-1 flex items-center justify-center gap-1 sm:gap-1.5 flex-1 sm:flex-initial text-[8.5px] sm:text-[10px] md:text-[10.5px]">
          <span className="gym-label-mono text-slate-400 text-[8px] sm:text-[9.5px]">Splits:</span>
          <span className="gym-num text-white font-bold">{plans.length}</span>
        </div>
        <div className="gym-card-subtle px-1.5 sm:px-2.5 py-0.5 sm:py-1 flex items-center justify-center gap-1 sm:gap-1.5 flex-1 sm:flex-initial text-[8.5px] sm:text-[10px] md:text-[10.5px]">
          <span className="gym-label-mono text-slate-400 text-[8px] sm:text-[9.5px]">Coverage:</span>
          <span className="gym-num text-white font-bold">{splitCoveragePct}%</span>
          <span className="text-slate-500 text-[7.5px] sm:text-[9px] whitespace-nowrap">({traineesWithSplit.length}/{trainees.length})</span>
        </div>
        <div className="gym-card-subtle px-1.5 sm:px-2.5 py-0.5 sm:py-1 flex items-center justify-center gap-1 sm:gap-1.5 flex-1 sm:flex-initial text-[8.5px] sm:text-[10px] md:text-[10.5px]">
          <span className="gym-label-mono text-slate-400 text-[8px] sm:text-[9.5px]">Awaiting:</span>
          <span className="gym-num text-slate-300 font-bold">{pendingAthletes.length}</span>
        </div>
      </div>

      {/* 3. 2-Column Split: Active Protocols vs Awaiting Protocols */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        
        {/* Left Column (col-span-7): Active Athlete Splits & Templates */}
        <div className="lg:col-span-7 gym-card !p-0 flex flex-col min-h-0 overflow-hidden shadow-xs">
          {/* Panel Header */}
          <div className="px-2.5 sm:px-3.5 py-2 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
            <h2 className="gym-heading-card">
              Active Athlete Splits & Templates
            </h2>
            <span className="gym-delta-blue text-[10px]">
              {activeAthletePlans.length} active
            </span>
          </div>

          {/* Connected Scrollable List */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-[var(--card-border)]">
            {activeAthletePlans.length === 0 ? (<div className="p-8 text-center space-y-1.5">
                <h3 className="text-xs font-bold text-white">No Active Splits Found</h3>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {searchQuery ? 'No active splits match your search query.' : 'Build a custom split for one of the pending athletes on the right.'}
                </p>
              </div>) : (activeAthletePlans.map(({ plan, athlete, isTemplate, totalAssignedCount }) => {
            const planSets = plan.days.reduce((dTotal, day) => {
                if (day.isRestDay)
                    return dTotal;
                return dTotal + day.exercises.reduce((exTotal, ex) => exTotal + (Number(ex.sets) || 1), 0);
            }, 0);
            return (<div key={plan.id} onClick={() => onOpenPlanBuilder(plan, plan.createdForUserId)} className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-2 sm:gap-3 group cursor-pointer">
                    {/* Athlete / Template Info */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                      {isTemplate ? (<span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] border border-white/10 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          T
                        </span>) : athlete?.avatarUrl ? (<img src={athlete.avatarUrl} alt={athlete.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/10 shrink-0"/>) : (<span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 transition-colors">
                          {athlete ? athlete.name.charAt(0) : 'A'}
                        </span>)}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {isTemplate ? (<>
                              <span className="text-xs font-bold text-white block truncate transition-colors">
                                {plan.title}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/10 text-[9.5px] font-mono text-slate-400">
                                Template
                              </span>
                            </>) : (<>
                              <button type="button" onClick={(e) => {
                        if (athlete && onNavigateToClient) {
                            e.stopPropagation();
                            onNavigateToClient(athlete.id);
                        }
                    }} className="text-xs font-bold text-white hover:text-slate-200 transition-colors truncate text-left cursor-pointer">
                                {athlete?.name}
                              </button>
                            </>)}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-mono truncate mt-0.5">
                          {!isTemplate && (<>
                              <span className="text-slate-300 font-medium truncate">{plan.title}</span>
                              <span className="text-slate-600">&bull;</span>
                            </>)}
                          <span>{plan.days.length}d/wk</span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-white font-numeric font-medium">{planSets} sets</span>
                          <span className="text-slate-600 hidden sm:inline">&bull;</span>
                          <span className="text-slate-400 hidden sm:inline">{plan.level}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => handleDuplicatePlan(plan)} className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all cursor-pointer" title="Duplicate Split">
                        <Copy className="w-3.5 h-3.5"/>
                      </button>
                      <button type="button" onClick={() => handleDeletePlan(plan.id, plan.title)} className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer" title="Delete Split">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>

                      <button type="button" onClick={() => onOpenPlanBuilder(plan, plan.createdForUserId)} className="w-7 h-7 sm:w-auto sm:px-2.5 sm:py-1 sm:h-7.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 text-xs font-medium" title="Open in Studio" aria-label="Open in Studio">
                        <Eye className="w-3.5 h-3.5 text-slate-300 sm:!hidden"/>
                        <span className="!hidden sm:!inline whitespace-nowrap">Open in Studio</span>
                      </button>
                    </div>
                  </div>);
        }))}
          </div>
        </div>

        {/* Right Column (col-span-5): Pending Athletes Requiring Splits */}
        <div className="lg:col-span-5 gym-card !p-0 flex flex-col min-h-0 overflow-hidden shadow-xs">
          {/* Panel Header */}
          <div className="px-2.5 sm:px-3.5 py-2 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
            <h2 className="gym-heading-card">
              Awaiting Workout Split
            </h2>
            <span className="gym-delta-neutral text-[10px]">
              {pendingAthletes.length} athletes
            </span>
          </div>

          {/* Connected Scrollable List */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-[var(--card-border)]">
            {pendingAthletes.length === 0 ? (<div className="p-8 text-center space-y-1.5">
                <h3 className="gym-heading-card text-white">Full Split Coverage</h3>
                <p className="gym-subtext max-w-xs mx-auto">
                  Every active athlete on your roster currently has a customized training routine deployed.
                </p>
              </div>) : (pendingAthletes.map((athlete) => (<div key={athlete.id} onClick={() => onOpenPlanBuilder(undefined, athlete.id)} className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-2 sm:gap-3 group cursor-pointer">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                    {athlete.avatarUrl ? (<img src={athlete.avatarUrl} alt={athlete.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/10 shrink-0"/>) : (<span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-[var(--main-color)] text-xs font-mono font-bold flex items-center justify-center shrink-0 transition-colors">
                        {athlete.name.charAt(0)}
                      </span>)}
                    <div className="min-w-0 flex-1">
                      <button type="button" onClick={(e) => {
                if (onNavigateToClient) {
                    e.stopPropagation();
                    onNavigateToClient(athlete.id);
                }
            }} className="text-xs font-bold text-white hover:text-[var(--main-color)] transition-colors truncate text-left cursor-pointer block">
                        {athlete.name}
                      </button>
                      <span className="gym-subtext font-mono block truncate mt-0.5">
                        {athlete.goal || 'General Fitness'} &bull; {athlete.weightKg ? `${athlete.weightKg} kg` : 'Athlete'}
                      </span>
                    </div>
                  </div>

                  <button type="button" onClick={(e) => {
                e.stopPropagation();
                onOpenPlanBuilder(undefined, athlete.id);
            }} className="w-7 h-7 sm:w-auto sm:px-3 sm:py-1.5 sm:h-8 rounded-lg gym-btn-primary flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-all text-xs font-semibold" title="Build Split" aria-label="Build Split">
                    <Plus className="w-4 h-4 stroke-[2.5] text-white shrink-0 sm:!hidden"/>
                    <span className="!hidden sm:!inline whitespace-nowrap">+ Build Split</span>
                  </button>
                </div>)))}
          </div>
        </div>

      </div>

      {/* Mobile Bottom Safe Spacing for Fixed Navbar */}
      <div className="h-16 md:hidden shrink-0 pointer-events-none" aria-hidden="true"/>

    </div>);
};
