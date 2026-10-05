'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { DietPlan } from '@/types';
import { NutritionPlanBuilderModal } from './nutrition/NutritionPlanBuilderModal';
import { Search, Copy, Trash2 } from 'lucide-react';

import { dietService } from '@/services/dietService';
import { clientService } from '@/services/clientService';

interface DietPlansViewProps {
  onOpenDietBuilder?: (plan?: DietPlan, targetUserId?: string) => void;
  onNavigateToClient?: (clientId: string) => void;
}

export const DietPlansView: React.FC<DietPlansViewProps> = ({ 
  onOpenDietBuilder,
  onNavigateToClient 
}) => {
  const { dietPlans, users, currentUser, deleteDietPlan, createDietPlan } = useGym();
  const { showToast, confirmDialog } = useToast();

  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | undefined>(undefined);

  const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;

  const trainees = useMemo(() => {
    return clientService.getTrainees(users, coachId);
  }, [users, coachId]);

  const scopedDietPlans = useMemo(() => {
    return dietService.getDietPlans(dietPlans, coachId);
  }, [dietPlans, coachId]);

  // Trainees who have a diet plan deployed (either via assignedDietPlanId or assignedUserId)
  const traineesWithDiet = useMemo(() => {
    return trainees.filter((t) => {
      return Boolean(t.assignedDietPlanId) || scopedDietPlans.some((d) => d.assignedUserId === t.id);
    });
  }, [trainees, scopedDietPlans]);

  const dietCoveragePct = Math.round((traineesWithDiet.length / Math.max(1, trainees.length)) * 100);

  // Active Diet Protocols mapped to athletes or available as master templates
  const activeAthleteDiets = useMemo(() => {
    return scopedDietPlans.map((plan) => {
      // Check direct assigned user mapping
      const directAthlete = users.find((u) => u.id === plan.assignedUserId);
      // Check users who have this diet plan assigned
      const assignedAthletes = users.filter((u) => u.assignedDietPlanId === plan.id);
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
      return matchTitle || matchAthlete || matchDesc;
    });
  }, [dietPlans, users, searchQuery]);

  // Trainees who currently have no diet protocol deployed
  const pendingDietAthletes = useMemo(() => {
    return trainees.filter((t) => {
      const hasDiet = Boolean(t.assignedDietPlanId) || dietPlans.some((d) => d.assignedUserId === t.id);
      if (hasDiet) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || (t.goal && t.goal.toLowerCase().includes(q));
    });
  }, [trainees, dietPlans, searchQuery]);

  const handleOpenBuilderInternal = (plan?: DietPlan, userId?: string) => {
    if (onOpenDietBuilder) {
      onOpenDietBuilder(plan, userId);
    } else {
      setSelectedPlan(plan || null);
      setTargetUserId(userId);
      setIsBuilderOpen(true);
    }
  };

  const handleDuplicatePlan = async (sourcePlan: DietPlan) => {
    try {
      const cloned = dietService.duplicateDietPlan(sourcePlan);
      const duplicated = await createDietPlan(cloned);

      showToast(`Duplicated "${sourcePlan.title}"`, 'success');
      handleOpenBuilderInternal(duplicated, sourcePlan.assignedUserId);
    } catch {
      showToast('Failed to duplicate diet plan', 'error');
    }
  };

  const handleDeletePlan = (planId: string, planTitle: string) => {
    confirmDialog({
      title: 'Delete Diet Plan',
      message: `Are you sure you want to delete "${planTitle}"? This will permanently remove this nutrition protocol.`,
      confirmText: 'Delete Diet Plan',
      variant: 'danger',
      onConfirm: async () => {
        await deleteDietPlan(planId);
        showToast(`Deleted "${planTitle}"`, 'info');
      }
    });
  };

  return (
    <>
      <div className="flex flex-col flex-1 h-full min-h-0 w-full space-y-2 pb-2.5 sm:pb-3 font-sans text-slate-100 select-none overflow-hidden">
        
        {/* 1. Header, Telemetry Pills, & Search Bar */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2 border-b border-[#24262e]">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Diet Plans & Nutrition Studio
              </h1>
              <span className="px-1.5 py-0.2 rounded bg-[#2f80ed]/10 border border-[#2f80ed]/20 text-[9.5px] font-mono text-[#2f80ed] font-bold hidden sm:inline">
                Nutrition OS
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              Client-centric macronutrient targets, verified meal breakdowns, and athlete diet plans.
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
                placeholder="Search athlete or diet plan..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#141519] border border-[#24262e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#2f80ed] transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => handleOpenBuilderInternal()}
              className="btn-cyan py-1.5 px-3.5 rounded-lg text-xs font-bold cursor-pointer shadow-xs transition-all whitespace-nowrap"
            >
              + Build Diet Plan
            </button>
          </div>
        </div>

        {/* 2. Micro Telemetry Capsule Strip */}
        <div className="flex-shrink-0 flex items-center gap-2 overflow-x-auto text-[10.5px] font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-[#18191e] border border-[#24262e] flex items-center gap-1.5 flex-shrink-0">
            <span className="text-zinc-500 uppercase tracking-wider font-semibold">Total Plans:</span>
            <span className="font-bold text-white font-numeric">{dietPlans.length}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#18191e] border border-[#24262e] flex items-center gap-1.5 flex-shrink-0">
            <span className="text-zinc-500 uppercase tracking-wider font-semibold">Diet Coverage:</span>
            <span className="font-bold text-white font-numeric">{dietCoveragePct}%</span>
            <span className="text-zinc-500">({traineesWithDiet.length}/{trainees.length})</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#18191e] border border-[#24262e] flex items-center gap-1.5 flex-shrink-0">
            <span className="text-zinc-500 uppercase tracking-wider font-semibold">Awaiting Diet:</span>
            <span className="font-bold text-zinc-300 font-numeric">
              {pendingDietAthletes.length}
            </span>
          </div>
        </div>

        {/* 3. 2-Column Split: Active Protocols vs Awaiting Protocols */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
          
          {/* Left Column (col-span-7): Active Athlete Diets & Templates */}
          <div className="lg:col-span-7 rounded-xl bg-[#18191e] border border-[#24262e] flex flex-col min-h-0 overflow-hidden shadow-xs">
            {/* Panel Header */}
            <div className="px-3.5 py-2 bg-[#141519] border-b border-[#24262e] flex items-center justify-between flex-shrink-0">
              <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                Active Athlete Diets & Templates
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/20 font-bold">
                {activeAthleteDiets.length} active
              </span>
            </div>

            {/* Connected Scrollable List */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-[#24262e]">
              {activeAthleteDiets.length === 0 ? (
                <div className="p-8 text-center space-y-1.5">
                  <h3 className="text-xs font-bold text-white">No Active Diet Plans Found</h3>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    {searchQuery ? 'No active diet plans match your search query.' : 'Build a custom diet plan for one of the pending athletes on the right.'}
                  </p>
                </div>
              ) : (
                activeAthleteDiets.map(({ plan, athlete, isTemplate, totalAssignedCount }) => {
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleOpenBuilderInternal(plan, plan.assignedUserId)}
                      className="px-3.5 py-2.5 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      {/* Athlete / Template Info & Diet Details */}
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
                          <span className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 group-hover:border-white/20 transition-colors">
                            {athlete ? athlete.name.charAt(0) : 'A'}
                          </span>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {isTemplate ? (
                              <>
                                <span className="text-xs font-bold text-white block truncate group-hover:text-slate-200 transition-colors">
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
                            <span className="text-white font-numeric font-bold">{plan.targetCalories} kcal</span>
                            <span className="text-slate-600">&bull;</span>
                            <span>P:{plan.targetProteinG}g C:{plan.targetCarbsG}g F:{plan.targetFatsG}g</span>
                            {plan.waterTargetLiters && (
                              <>
                                <span className="text-slate-600 hidden sm:inline">&bull;</span>
                                <span className="text-slate-400 hidden sm:inline">{plan.waterTargetLiters}L</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleDuplicatePlan(plan)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all cursor-pointer"
                          title="Duplicate Diet Plan"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id, plan.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                          title="Delete Diet Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenBuilderInternal(plan, plan.assignedUserId)}
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

          {/* Right Column (col-span-5): Pending Athletes Requiring Diets */}
          <div className="lg:col-span-5 rounded-xl bg-[#18191e] border border-[#24262e] flex flex-col min-h-0 overflow-hidden shadow-xs">
            {/* Panel Header */}
            <div className="px-3.5 py-2 bg-[#141519] border-b border-[#24262e] flex items-center justify-between flex-shrink-0">
              <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                Awaiting Diet Plan
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/20 font-bold">
                {pendingDietAthletes.length} athletes
              </span>
            </div>

            {/* Connected Scrollable List */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-[#24262e]">
              {pendingDietAthletes.length === 0 ? (
                <div className="p-8 text-center space-y-1.5">
                  <h3 className="text-xs font-bold text-white">Full Nutrition Coverage</h3>
                  <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                    Every active athlete on your roster currently has a tailored diet plan deployed.
                  </p>
                </div>
              ) : (
                pendingDietAthletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    onClick={() => handleOpenBuilderInternal(undefined, athlete.id)}
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
                        <span className="w-8 h-8 rounded-lg bg-[#141519] border border-[#24262e] text-[#2f80ed] text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 group-hover:border-[#2f80ed]/40 transition-colors">
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
                          {athlete.goal || 'Weight Management'} &bull; {athlete.weightKg ? `${athlete.weightKg} kg` : 'Athlete'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBuilderInternal(undefined, athlete.id);
                      }}
                      className="btn-cyan py-1 px-3 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap flex-shrink-0"
                    >
                      + Build Diet Plan
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Standalone Nutrition Studio Builder Modal */}
      <NutritionPlanBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setSelectedPlan(null);
          setTargetUserId(undefined);
        }}
        initialPlan={selectedPlan}
        targetUserId={targetUserId}
      />
    </>
  );
};

