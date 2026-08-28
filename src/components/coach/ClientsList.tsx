'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { User, WorkoutPlan } from '@/types';
import { 
  Users, 
  Search, 
  Plus, 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  LogIn
} from 'lucide-react';

interface ClientsListProps {
  onOpenAssignModal: (user: User) => void;
  onOpenPlanBuilderForUser: (userId: string) => void;
  onOpenNewTraineeModal: () => void;
  onSelectTraineeDetails: (user: User) => void;
  onSwitchToTrainee: (userId: string) => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({
  onOpenAssignModal,
  onOpenPlanBuilderForUser,
  onOpenNewTraineeModal,
  onSelectTraineeDetails,
  onSwitchToTrainee
}) => {
  const { users, plans, logs } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');

  const trainees = users.filter((u) => u.role === 'trainee');

  const filteredTrainees = trainees.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.goal.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && t.assignedPlanId) ||
      (statusFilter === 'pending' && !t.assignedPlanId);

    return matchesSearch && matchesStatus;
  });

  const activePlansCount = trainees.filter((t) => t.assignedPlanId).length;
  const pendingPlansCount = trainees.length - activePlansCount;

  return (
    <div className="space-y-6">
      {/* Top Coach Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#111116] border border-[#22222d]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Athletes</span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-bold font-numeric text-white mt-2">{trainees.length}</p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Registered in roster</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111116] border border-[#22222d]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Active Protocols</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-numeric text-purple-400 mt-2">{activePlansCount}</p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Assigned and active</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111116] border border-[#22222d]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Pending Setup</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-numeric text-amber-400 mt-2">{pendingPlansCount}</p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Awaiting plan assignment</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111116] border border-[#22222d]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Logged Sessions</span>
            <Activity className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-2xl font-bold font-numeric text-purple-300 mt-2">{logs.length}</p>
          <span className="text-[10px] text-zinc-500 mt-1 block">Completed by trainees</span>
        </div>
      </div>

      {/* Direct Quick Action Bar for Instant Modifying */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#14141d] to-[#101017] border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(168,85,247,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">
              Fast Protocol Architect & Modifier
            </h3>
            <p className="text-[11px] text-zinc-400">
              Directly build or modify workouts for any athlete with 1-click deploy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenPlanBuilderForUser('')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 transition-colors flex items-center gap-1.5"
          >
            <span>+ Build / Edit Split</span>
          </button>
          <button
            onClick={onOpenNewTraineeModal}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add New Trainee</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Register CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete by name, email, or goal..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#111116] border border-[#23232f] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter buttons */}
          <div className="flex items-center bg-[#111116] border border-[#23232f] rounded-lg p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-[#22222e] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({trainees.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'active' ? 'bg-[#22222e] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Active ({activePlansCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'pending' ? 'bg-[#22222e] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Pending ({pendingPlansCount})
            </button>
          </div>
        </div>
      </div>

      {/* Trainees Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTrainees.map((trainee) => {
          const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
          const traineeLogs = logs.filter((l) => l.userId === trainee.id);

          return (
            <div
              key={trainee.id}
              className="p-5 rounded-xl bg-[#111117] border border-[#22222e] hover:border-purple-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Athlete identity & status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-sm text-zinc-200 group-hover:border-purple-500/50 transition-colors">
                      {trainee.avatarText}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {trainee.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 truncate max-w-[170px]">
                        {trainee.email}
                      </p>
                    </div>
                  </div>

                  {assignedPlan ? (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      NEEDS PLAN
                    </span>
                  )}
                </div>

                {/* Body Metrics & Goal Badges */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-[#0d0d12] border border-zinc-900 mb-3 text-center">
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-zinc-500">Weight</span>
                    <span className="text-xs font-bold font-numeric text-zinc-200">{trainee.weightKg} kg</span>
                  </div>
                  <div className="border-x border-zinc-800/80">
                    <span className="block text-[9px] font-mono uppercase text-zinc-500">Height</span>
                    <span className="text-xs font-bold font-numeric text-zinc-200">{trainee.heightCm} cm</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-zinc-500">Sessions</span>
                    <span className="text-xs font-bold font-numeric text-purple-400">{traineeLogs.length}</span>
                  </div>
                </div>

                {/* Primary Goal */}
                <div className="mb-4">
                  <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                    Primary Fitness Objective
                  </span>
                  <span className="text-xs font-medium text-zinc-300 block truncate">
                    {trainee.goal}
                  </span>
                </div>

                {/* Assigned Plan Box */}
                <div className="p-3 rounded-lg bg-[#16161f] border border-[#262634] mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                      Assigned Workout Plan
                    </span>
                    <button
                      onClick={() => onOpenAssignModal(trainee)}
                      className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {assignedPlan ? 'Modify Plan ↗' : 'Assign Now ↗'}
                    </button>
                  </div>
                  {assignedPlan ? (
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">
                        {assignedPlan.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400 font-numeric">
                        <span>{assignedPlan.daysPerWeek} Days/Week</span>
                        <span>•</span>
                        <span>{assignedPlan.durationWeeks} Weeks</span>
                        <span>•</span>
                        <span className="text-zinc-500 uppercase">{assignedPlan.level}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-400/90 font-medium">No workout protocol assigned</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: High accessibility for modifying */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenAssignModal(trainee)}
                    className="py-2 px-2.5 rounded-lg text-xs font-bold text-white bg-purple-600/90 hover:bg-purple-600 border border-purple-500/40 transition-colors text-center shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                  >
                    {assignedPlan ? 'Change Plan' : 'Assign Plan'}
                  </button>
                  <button
                    onClick={() => onOpenPlanBuilderForUser(trainee.id)}
                    className="py-2 px-2.5 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors text-center"
                  >
                    Modify / Build
                  </button>
                </div>

                {/* Inspect Profile / Switch View */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectTraineeDetails(trainee)}
                    className="flex-1 py-1.5 text-[11px] font-semibold text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-md border border-zinc-800/70 transition-colors"
                  >
                    Profile & Notes
                  </button>
                  <button
                    onClick={() => onSwitchToTrainee(trainee.id)}
                    className="flex-1 py-1.5 text-[11px] font-semibold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/50 rounded-md border border-purple-800/40 transition-colors flex items-center justify-center gap-1"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Test View</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTrainees.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-purple-900/40 rounded-2xl bg-[#0e0e14] p-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-3">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Roster is Clean & Ready</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-5">
              No trainees in the roster. Add your athletes now to assign workout plans and track their sets and volume!
            </p>
            <button
              onClick={onOpenNewTraineeModal}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Register Trainee Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
