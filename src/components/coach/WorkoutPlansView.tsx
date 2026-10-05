'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, WorkoutPlan, WorkoutDay } from '@/types';
import { AthleteAvatar } from '@/components/ui/AthleteAvatar';
import { Modal } from '@/components/ui/Modal';
import { ExerciseVideoModal } from './exercises/ExerciseVideoModal';

interface WorkoutPlansViewProps {
  onOpenCreatePlanModal: (targetUserId?: string) => void;
  onOpenEditPlanModal: (plan: WorkoutPlan, targetUserId?: string) => void;
  onSelectClientForWorkout?: (user: User) => void;
  onOpenAssignModalForPlan?: (plan: WorkoutPlan) => void;
}

export const WorkoutPlansView: React.FC<WorkoutPlansViewProps> = ({
  onOpenCreatePlanModal,
  onOpenEditPlanModal,
  onSelectClientForWorkout,
  onOpenAssignModalForPlan
}) => {
  const { users, plans, getPlanForUser, deletePlan } = useGym();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'NeedsRoutine' | 'Active' | 'Competitors'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Preview routine modal state
  const [previewPlan, setPreviewPlan] = useState<{ plan: WorkoutPlan; athlete: User } | null>(null);
  const [previewDayIndex, setPreviewDayIndex] = useState(0);

  // Video guide preview inside preview modal
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<any | null>(null);

  // Filter only trainees (athletes)
  const trainees = useMemo(() => {
    return users.filter((u) => u.role === 'trainee');
  }, [users]);

  // Aggregate statistics
  const stats = useMemo(() => {
    let activeCount = 0;
    let needsCount = 0;
    let competitorsCount = 0;

    trainees.forEach((t) => {
      const plan = getPlanForUser(t.id);
      if (plan) {
        activeCount++;
      } else {
        needsCount++;
      }
      if (t.isCompetitor) {
        competitorsCount++;
      }
    });

    return {
      total: trainees.length,
      active: activeCount,
      needs: needsCount,
      competitors: competitorsCount
    };
  }, [trainees, getPlanForUser]);

  // Filtered athlete roster
  const filteredAthletes = useMemo(() => {
    return trainees.filter((athlete) => {
      const plan = getPlanForUser(athlete.id);

      // Status filter
      if (selectedFilter === 'NeedsRoutine' && plan) return false;
      if (selectedFilter === 'Active' && !plan) return false;
      if (selectedFilter === 'Competitors' && !athlete.isCompetitor) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = athlete.name.toLowerCase().includes(query);
        const matchesEmail = athlete.email.toLowerCase().includes(query);
        const matchesGoal = athlete.goal?.toLowerCase().includes(query);
        const matchesPlan = plan?.title.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesGoal || matchesPlan;
      }

      return true;
    });
  }, [trainees, getPlanForUser, selectedFilter, searchQuery]);

  const handleOpenPreview = (athlete: User, plan: WorkoutPlan) => {
    setPreviewPlan({ plan, athlete });
    setPreviewDayIndex(0);
  };

  return (
    <div className="space-y-3 w-full max-w-none pb-4 select-none">
      {/* 1. Ultra-Clean Executive Header (Text-Only, No Icons, Obsidian) */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-[#090e17] border border-[#141b26] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
              Athletes Training Hub
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/10 font-bold">
              {stats.total} Athletes
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/10">
              {stats.active} Active Routines
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/10">
              {stats.needs} Awaiting Program
            </span>
            {stats.competitors > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/10">
                {stats.competitors} Prep
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Personalized 1-on-1 athlete training routines, customized periodization, and split progress.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Athlete Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Compact Roster
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenCreatePlanModal()}
            className="py-1.5 px-3.5 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-xs font-bold cursor-pointer shadow-xs transition-all whitespace-nowrap"
          >
            + Build Workout Plan
          </button>
        </div>
      </div>

      {/* 2. Operational Control Strip: Search & Filter Tabs */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#090e17] border border-[#141b26] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-xs">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athlete, goal, or routine title..."
            className="w-full px-3 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 font-sans transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar p-0.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs font-semibold flex-shrink-0">
          <button
            type="button"
            onClick={() => setSelectedFilter('All')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'All'
                ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('NeedsRoutine')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'NeedsRoutine'
                ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Needs Plan ({stats.needs})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('Active')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'Active'
                ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Programs ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('Competitors')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'Competitors'
                ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Competitors ({stats.competitors})
          </button>
        </div>
      </div>

      {/* 3. Athlete Workouts Content */}
      {filteredAthletes.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-xl bg-[#090e17] border border-[#141b26] space-y-2">
          <h3 className="text-sm font-bold text-white">No Athletes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            No athletes match your current search and filter settings.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedFilter('All');
              setSearchQuery('');
            }}
            className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors cursor-pointer border border-white/10"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAthletes.map((athlete) => {
            const plan = getPlanForUser(athlete.id);
            const totalExercises = plan
              ? plan.days.reduce((acc, d) => acc + d.exercises.length, 0)
              : 0;

            return (
              <div
                key={athlete.id}
                className="p-3.5 rounded-xl bg-[#090e17] border border-[#141b26] hover:border-[#1e293b] transition-all shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-3">
                  {/* Athlete Header Row */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AthleteAvatar
                        name={athlete.name}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white tracking-tight truncate">
                            {athlete.name}
                          </h3>
                          {athlete.isCompetitor && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-300 border border-white/10 font-bold">
                              Prep
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate font-sans">
                          {athlete.goal || athlete.email}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {plan ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-200 border border-white/10 font-semibold">
                          Active Routine
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.03] text-slate-400 border border-white/[0.08] font-medium">
                          Needs Routine
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Routine Details OR Call-to-Action */}
                  {plan ? (
                    <div className="space-y-2.5 pt-2 border-t border-[#141b26]">
                      {/* Routine Title & Metrics */}
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                          Tailored Split
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">
                          {plan.title}
                        </h4>
                      </div>

                      {/* Metrics Pill Grid */}
                      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-[#05080e] border border-[#16202e] text-center font-mono text-xs">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Days/Wk</span>
                          <span className="font-bold text-white text-[11px] font-numeric">{plan.daysPerWeek}d</span>
                        </div>
                        <div className="border-x border-[#16202e]">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Duration</span>
                          <span className="font-bold text-white text-[11px] font-numeric">{plan.durationWeeks}w</span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Movements</span>
                          <span className="font-bold text-slate-200 text-[11px] font-numeric">{totalExercises}</span>
                        </div>
                      </div>

                      {/* Scheduled Days Strip */}
                      <div className="space-y-1">
                        <span className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                          Scheduled Days ({plan.days.length})
                        </span>
                        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
                          {plan.days.map((day, idx) => (
                            <div
                              key={day.id || idx}
                              className="px-2 py-0.5 rounded bg-[#05080e] border border-[#16202e] text-[10px] font-mono whitespace-nowrap text-slate-300 flex-shrink-0"
                            >
                              {day.isRestDay ? (
                                <span className="text-slate-500">Rest</span>
                              ) : (
                                <span>{day.dayName.split(':')[0]} ({day.exercises.length})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Athlete Without Routine: Call To Action */
                    <div className="p-3 rounded-lg bg-[#05080e] border border-[#16202e] text-center space-y-2">
                      <p className="text-xs text-slate-400 font-medium">
                        No customized routine built for {athlete.name} yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenCreatePlanModal(athlete.id)}
                        className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-[#080c14] font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                      >
                        + Build Custom Program
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className="pt-2.5 border-t border-[#141b26] flex items-center justify-between gap-2 text-xs">
                  {plan ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(athlete, plan)}
                          className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold transition-colors cursor-pointer border border-white/10"
                        >
                          Preview Routine
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditPlanModal(plan, athlete.id)}
                          className="px-2 py-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer font-medium"
                        >
                          Edit
                        </button>
                      </div>

                      {onSelectClientForWorkout && (
                        <button
                          type="button"
                          onClick={() => onSelectClientForWorkout(athlete)}
                          className="px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 font-semibold transition-colors cursor-pointer font-mono text-[11px]"
                        >
                          Athlete 360 &rarr;
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      {onSelectClientForWorkout && (
                        <button
                          type="button"
                          onClick={() => onSelectClientForWorkout(athlete)}
                          className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
                        >
                          Open Profile
                        </button>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        Bespoke Split Needed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT ROSTER TABLE VIEW */
        <div className="rounded-xl bg-[#090e17] border border-[#141b26] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#141b26] bg-[#070a0f] text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Athlete</th>
                  <th className="py-2.5 px-3 font-semibold">Active Routine</th>
                  <th className="py-2.5 px-3 font-semibold">Days/Wk</th>
                  <th className="py-2.5 px-3 font-semibold">Duration</th>
                  <th className="py-2.5 px-3 font-semibold">Movements</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141b26]">
                {filteredAthletes.map((athlete) => {
                  const plan = getPlanForUser(athlete.id);
                  const totalExercises = plan
                    ? plan.days.reduce((acc, d) => acc + d.exercises.length, 0)
                    : 0;

                  return (
                    <tr
                      key={athlete.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <AthleteAvatar name={athlete.name} size="xs" />
                          <div>
                            <span className="font-bold text-white block">{athlete.name}</span>
                            <span className="text-[10px] text-slate-400 block">{athlete.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-200 font-semibold whitespace-nowrap">
                        {plan ? (
                          <span>{plan.title}</span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-white font-mono font-numeric whitespace-nowrap">
                        {plan ? `${plan.daysPerWeek}d` : '—'}
                      </td>
                      <td className="py-2 px-3 text-white font-mono font-numeric whitespace-nowrap">
                        {plan ? `${plan.durationWeeks}w` : '—'}
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono font-numeric whitespace-nowrap">
                        {plan ? `${totalExercises} ex` : '—'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {plan ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-200 border border-white/10 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.03] text-slate-400 border border-white/[0.08] font-medium">
                            Needs Routine
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {plan ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(athlete, plan)}
                                className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-semibold text-white border border-white/10"
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenEditPlanModal(plan, athlete.id)}
                                className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white"
                              >
                                Edit
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenCreatePlanModal(athlete.id)}
                              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-[11px] font-bold text-[#080c14] shadow-xs active:scale-95"
                            >
                              + Build Plan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Interactive Quick Routine Preview Modal */}
      {previewPlan && (
        <Modal
          isOpen={Boolean(previewPlan)}
          onClose={() => setPreviewPlan(null)}
          maxWidth="max-w-2xl"
          title={
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-0.5">
                <span>Athlete: <strong className="text-white">{previewPlan.athlete.name}</strong></span>
                <span>&bull;</span>
                <span className="text-white font-numeric">{previewPlan.plan.daysPerWeek} Days / Week</span>
                <span>&bull;</span>
                <span className="text-white font-numeric">{previewPlan.plan.durationWeeks} Weeks Split</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {previewPlan.plan.title}
              </h3>
            </div>
          }
        >
          <div className="space-y-3 p-1">
            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 border-b border-[#141b26]">
              {previewPlan.plan.days.map((day, idx) => (
                <button
                  key={day.id || idx}
                  type="button"
                  onClick={() => setPreviewDayIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    previewDayIndex === idx
                      ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {day.dayName}
                  {day.isRestDay ? (
                    <span className="ml-1 text-[9px] font-mono text-slate-500">Rest</span>
                  ) : (
                    <span className="ml-1 text-[10px] font-mono text-slate-400">({day.exercises.length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Day Movements Table */}
            {previewPlan.plan.days[previewDayIndex]?.isRestDay ? (
              <div className="p-8 text-center rounded-xl bg-[#05080e] border border-[#16202e] space-y-1">
                <span className="text-xs font-bold text-white">Scheduled Active Recovery / Rest Day</span>
                <p className="text-[11px] text-slate-400">
                  Targeted CNS recovery and muscular glycogen replenishment.
                </p>
              </div>
            ) : previewPlan.plan.days[previewDayIndex]?.exercises.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#05080e] border border-[#16202e]">
                <span className="text-xs text-slate-400">No exercises added to this training day yet.</span>
              </div>
            ) : (
              <div className="rounded-xl bg-[#05080e] border border-[#16202e] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#16202e] bg-[#070a0f] text-[10px] font-mono uppercase text-slate-400">
                      <th className="py-2 px-3">Movement</th>
                      <th className="py-2 px-3">Muscle</th>
                      <th className="py-2 px-3">Sets</th>
                      <th className="py-2 px-3">Target Reps</th>
                      <th className="py-2 px-3">RPE / RIR</th>
                      <th className="py-2 px-3">Rest</th>
                      <th className="py-2 px-3 text-right">Guide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16202e]">
                    {previewPlan.plan.days[previewDayIndex]?.exercises.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                          {item.exerciseName}
                        </td>
                        <td className="py-2 px-3 text-slate-300 font-mono whitespace-nowrap">
                          {item.targetMuscle}
                        </td>
                        <td className="py-2 px-3 text-white font-mono font-bold font-numeric whitespace-nowrap">
                          {item.sets}
                        </td>
                        <td className="py-2 px-3 text-slate-300 font-mono font-numeric whitespace-nowrap">
                          {item.targetReps}
                        </td>
                        <td className="py-2 px-3 text-slate-400 font-mono font-numeric whitespace-nowrap">
                          {item.targetRpe || '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-400 font-mono font-numeric whitespace-nowrap">
                          {item.restSeconds}s
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap">
                          {item.videoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedVideoExercise({
                                  name: item.exerciseName,
                                  targetMuscle: item.targetMuscle,
                                  equipment: item.equipment,
                                  category: 'Compound',
                                  videoUrl: item.videoUrl,
                                  executionCue: item.notes
                                })
                              }
                              className="px-2 py-0.5 rounded text-[11px] font-semibold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10"
                            >
                              Video Guide
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#141b26]">
              <button
                type="button"
                onClick={() => setPreviewPlan(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const { plan, athlete } = previewPlan;
                    setPreviewPlan(null);
                    onOpenEditPlanModal(plan, athlete.id);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-white text-[#080c14] font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Edit Program in Builder
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Video Guide Modal */}
      {selectedVideoExercise && (
        <ExerciseVideoModal
          exercise={selectedVideoExercise}
          isOpen={Boolean(selectedVideoExercise)}
          onClose={() => setSelectedVideoExercise(null)}
        />
      )}
    </div>
  );
};
