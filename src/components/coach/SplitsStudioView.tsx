'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { WorkoutPlan } from '@/types';
import { Search, Copy, Trash2 } from 'lucide-react';

import { workoutService } from '@/services/workoutService';
import { clientService } from '@/services/clientService';

interface SplitsStudioViewProps {
  onOpenPlanBuilder: (plan?: WorkoutPlan, targetUserId?: string) => void;
  onNavigateToClient?: (clientId: string) => void;
}

export const SplitsStudioView: React.FC<SplitsStudioViewProps> = ({
  onOpenPlanBuilder,
  onNavigateToClient
}) => {
  const { plans, users, currentUser, deletePlan, createPlan } = useGym();
  const { showToast, confirmDialog } = useToast();

  const [searchQuery, setSearchQuery] = useState('');

  const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;

  const trainees = useMemo(() => {
    return clientService.getTrainees(users, coachId);
  }, [users, coachId]);

  const scopedPlans = useMemo(() => {
    if (!coachId) return plans;
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
      if (!searchQuery) return true;
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
      if (hasPlan) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || (t.goal && t.goal.toLowerCase().includes(q));
    });
  }, [trainees, plans, searchQuery]);

  const handleDuplicatePlan = async (sourcePlan: WorkoutPlan) => {
    try {
      const cloned = workoutService.duplicatePlan(sourcePlan);
      const duplicated = await createPlan(cloned);
      showToast(`Duplicated "${sourcePlan.title}"`, 'success');
      onOpenPlanBuilder(duplicated, sourcePlan.createdForUserId);
    } catch {
      showToast('Failed to duplicate split', 'error');
    }
  };

  const handleDeletePlan = (planId: string, planTitle: string) => {
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

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 w-full space-y-2 pb-2.5 sm:pb-3 font-sans text-slate-100 select-none overflow-hidden">
      
      {/* 1. Header, Telemetry Pills, & Search Bar */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2 border-b border-[#24262e]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
              Workout Plans & Splits Studio
            </h1>
            <span className="px-1.5 py-0.2 rounded bg-[#2f80ed]/10 border border-[#2f80ed]/20 text-[9.5px] font-mono text-[#2f80ed] font-bold hidden sm:inline">
              Periodization OS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            Client-centric periodization, custom split architectures, and reusable master templates.
          </p>
        </div>

        {/* Action Controls & Search Input */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete or split..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#141519] border border-[#24262e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#2f80ed] transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenPlanBuilder()}
            className="btn-cyan py-1.5 px-3.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs transition-all whitespace-nowrap"
          >
            + Build Split
          </button>
        </div>
      </div>

      {/* 2. Micro Telemetry Capsule Strip */}
      <div className="flex-shrink-0 flex items-center gap-2 overflow-x-auto text-[10.5px] font-mono">
        <div className="px-2.5 py-1 rounded-lg bg-[#18191e] border border-[#24262e] flex items-center gap-1.5 flex-shrink-0">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">Total Splits:</span>
          <span className="font-bold text-white font-numeric">{plans.length}</span>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-[#18191e] border border-[#24262e] flex items-center gap-1.5 flex-shrink-0">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">Split Coverage:</span>
          <span className="font-bold text-white font-numeric">{splitCoveragePct}%</span>
          <span className="text-zinc-500">({traineesWithSplit.length}/{trainees.length})</span>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-[#18191e] border border-[#24262e] flex items-center gap-1.5 flex-shrink-0">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">Awaiting Split:</span>
          <span className="font-bold text-zinc-300 font-numeric">
            {pendingAthletes.length}
          </span>
        </div>
      </div>

      {/* 3. 2-Column Split: Active Protocols vs Awaiting Protocols */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        
        {/* Left Column (col-span-7): Active Athlete Splits & Templates */}
        <div className="lg:col-span-7 rounded-xl bg-[#18191e] border border-[#24262e] flex flex-col min-h-0 overflow-hidden shadow-xs">
          {/* Panel Header */}
          <div className="px-3.5 py-2 bg-[#141519] border-b border-[#24262e] flex items-center justify-between flex-shrink-0">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
              Active Athlete Splits & Templates
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/20 font-bold">
              {activeAthletePlans.length} active
            </span>
          </div>

          {/* Connected Scrollable List */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-[#24262e]">
            {activeAthletePlans.length === 0 ? (
              <div className="p-8 text-center space-y-1.5">
                <h3 className="text-xs font-bold text-white">No Active Splits Found</h3>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {searchQuery ? 'No active splits match your search query.' : 'Build a custom split for one of the pending athletes on the right.'}
                </p>
              </div>
            ) : (
              activeAthletePlans.map(({ plan, athlete, isTemplate, totalAssignedCount }) => {
                const planSets = plan.days.reduce((dTotal, day) => {
                  if (day.isRestDay) return dTotal;
                  return dTotal + day.exercises.reduce((exTotal, ex) => exTotal + (Number(ex.sets) || 1), 0);
                }, 0);

                return (
                  <div
                    key={plan.id}
                    onClick={() => onOpenPlanBuilder(plan, plan.createdForUserId)}
                    className="px-3.5 py-2.5 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    {/* Athlete / Template Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isTemplate ? (
                        <span className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 text-slate-400 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                          T
                        </span>
                      ) : athlete?.avatarUrl ? (
                        <img
                          src={athlete.avatarUrl}
                          alt={athlete.name}
                          className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 transition-colors">
                          {athlete ? athlete.name.charAt(0) : 'A'}
                        </span>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {isTemplate ? (
                            <>
                              <span className="text-xs font-bold text-white block truncate transition-colors">
                                {plan.title}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/10 text-[9.5px] font-mono text-slate-400">
                                Template
                              </span>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  if (athlete && onNavigateToClient) {
                                    e.stopPropagation();
                                    onNavigateToClient(athlete.id);
                                  }
                                }}
                                className="text-xs font-bold text-white hover:text-slate-200 transition-colors truncate text-left cursor-pointer"
                              >
                                {athlete?.name}
                              </button>
                              {totalAssignedCount > 1 && (
                                <span className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/10 text-[9.5px] font-mono text-slate-300">
                                  +{totalAssignedCount - 1} more
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-mono truncate mt-0.5">
                          {!isTemplate && (
                            <>
                              <span className="text-slate-300 font-medium truncate">{plan.title}</span>
                              <span className="text-slate-600">&bull;</span>
                            </>
                          )}
                          <span>{plan.days.length}d/wk</span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-white font-numeric font-medium">{planSets} sets</span>
                          <span className="text-slate-600 hidden sm:inline">&bull;</span>
                          <span className="text-slate-400 hidden sm:inline">{plan.level}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDuplicatePlan(plan)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all cursor-pointer"
                        title="Duplicate Split"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan.id, plan.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                        title="Delete Split"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenPlanBuilder(plan, plan.createdForUserId)}
                        className="py-1 px-2.5 rounded-lg bg-[#141519] hover:bg-[#1c1d22] text-zinc-200 hover:text-white border border-[#24262e] hover:border-[#2f80ed]/40 text-xs font-medium transition-all cursor-pointer whitespace-nowrap active:scale-95"
                      >
                        Open in Studio
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (col-span-5): Pending Athletes Requiring Splits */}
        <div className="lg:col-span-5 rounded-xl bg-[#18191e] border border-[#24262e] flex flex-col min-h-0 overflow-hidden shadow-xs">
          {/* Panel Header */}
          <div className="px-3.5 py-2 bg-[#141519] border-b border-[#24262e] flex items-center justify-between flex-shrink-0">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
              Awaiting Workout Split
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/20 font-bold">
              {pendingAthletes.length} athletes
            </span>
          </div>

          {/* Connected Scrollable List */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-[#24262e]">
            {pendingAthletes.length === 0 ? (
              <div className="p-8 text-center space-y-1.5">
                <h3 className="text-xs font-bold text-white">Full Split Coverage</h3>
                <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                  Every active athlete on your roster currently has a customized training routine deployed.
                </p>
              </div>
            ) : (
              pendingAthletes.map((athlete) => (
                <div
                  key={athlete.id}
                  onClick={() => onOpenPlanBuilder(undefined, athlete.id)}
                  className="px-3.5 py-2.5 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {athlete.avatarUrl ? (
                      <img
                        src={athlete.avatarUrl}
                        alt={athlete.name}
                        className="w-8 h-8 rounded-lg object-cover border border-[#24262e] flex-shrink-0"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-lg bg-[#141519] border border-[#24262e] text-[#2f80ed] text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 transition-colors">
                        {athlete.name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          if (onNavigateToClient) {
                            e.stopPropagation();
                            onNavigateToClient(athlete.id);
                          }
                        }}
                        className="text-xs font-bold text-white hover:text-[#2f80ed] transition-colors truncate text-left cursor-pointer block"
                      >
                        {athlete.name}
                      </button>
                      <span className="text-[10.5px] text-zinc-400 font-mono block truncate mt-0.5">
                        {athlete.goal || 'General Fitness'} &bull; {athlete.weightKg ? `${athlete.weightKg} kg` : 'Athlete'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPlanBuilder(undefined, athlete.id);
                    }}
                    className="btn-cyan py-1 px-3 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap flex-shrink-0"
                  >
                    + Build Split
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
