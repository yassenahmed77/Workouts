'use client';

import React from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { WorkoutPlan } from '@/types';
import { 
  ClipboardList, 
  Plus, 
  Dumbbell, 
  Calendar, 
  Users, 
  Clock, 
  Edit3, 
  Trash2, 
  Check, 
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface WorkoutPlansViewProps {
  onOpenCreatePlanModal: () => void;
  onOpenEditPlanModal: (plan: WorkoutPlan) => void;
  onOpenAssignModalForPlan: (plan: WorkoutPlan) => void;
}

export const WorkoutPlansView: React.FC<WorkoutPlansViewProps> = ({
  onOpenCreatePlanModal,
  onOpenEditPlanModal,
  onOpenAssignModalForPlan
}) => {
  const { plans, users, deletePlan } = useGym();
  const { showToast } = useToast();

  const getTraineesForPlan = (planId: string) => {
    return users.filter((u) => u.assignedPlanId === planId);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6b00] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20">
                Master Protocols
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1.5">
              Workout Program Templates
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Build, optimize, and periodize training splits for your athletes.
            </p>
          </div>

          <button
            onClick={onOpenCreatePlanModal}
            className="px-4 py-2.5 rounded-xl btn-orange text-xs font-black flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Split</span>
          </button>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-3.5">
        {plans.map((plan) => {
          const assignedTrainees = getTraineesForPlan(plan.id);
          const totalExercises = plan.days.reduce((acc, d) => acc + d.exercises.length, 0);

          return (
            <div
              key={plan.id}
              className="p-5 rounded-3xl bg-[#111218] border border-[#212330] hover:border-[#35384d] transition-all shadow-md space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      {plan.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {plan.description || 'Targeted progressive overload protocol.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditPlanModal(plan)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-[#1e202c] rounded-xl transition-colors cursor-pointer"
                      title="Edit Split"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        deletePlan(plan.id);
                        showToast(`Deleted "${plan.title}" split 🗑️`, 'info');
                      }}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-[#1e202c] rounded-xl transition-colors cursor-pointer"
                      title="Delete Split"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Plan Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center font-numeric text-xs">
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Days / Wk</span>
                    <span className="font-extrabold text-white">{plan.daysPerWeek}</span>
                  </div>
                  <div className="border-x border-[#1e202c]">
                    <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Duration</span>
                    <span className="font-extrabold text-[#ff6b00]">{plan.durationWeeks} wks</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Exercises</span>
                    <span className="font-extrabold text-zinc-200">{totalExercises}</span>
                  </div>
                </div>

                {/* Days Breakdown Preview */}
                <div className="space-y-1.5 mt-3">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Scheduled Days ({plan.days.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {plan.days.map((day) => (
                      <div
                        key={day.id}
                        className="px-3 py-2 rounded-xl bg-[#09090b] border border-[#1e202c] flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-zinc-200 truncate max-w-[140px]">
                          {day.dayName}
                        </span>
                        {day.isRestDay ? (
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#1c1d27] text-zinc-500 font-bold">
                            Rest
                          </span>
                        ) : (
                          <span className="text-[10px] font-numeric font-mono font-bold text-[#ff6b00]">
                            {day.exercises.length} ex
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Athletes Strip */}
                <div className="mt-3 pt-3 border-t border-[#1e202c]">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                    Enrolled Athletes ({assignedTrainees.length})
                  </span>
                  {assignedTrainees.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedTrainees.map((trainee) => (
                        <span
                          key={trainee.id}
                          className="px-2.5 py-1 rounded-xl bg-[#09090b] border border-[#1e202c] text-xs text-zinc-300 font-medium flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {trainee.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No athletes currently assigned to this split</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1e202c] flex items-center justify-between gap-3">
                <button
                  onClick={() => onOpenAssignModalForPlan(plan)}
                  className="px-3.5 py-2 rounded-xl bg-[#171822] hover:bg-[#202230] border border-[#2e303d] text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Users className="w-3.5 h-3.5 text-[#ff6b00]" />
                  <span>Assign to Trainee</span>
                </button>
                <button
                  onClick={() => onOpenEditPlanModal(plan)}
                  className="px-3.5 py-2 rounded-xl btn-orange text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  <span>Edit Split</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <div className="p-10 rounded-3xl bg-[#111218] border border-[#212330] text-center shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-extrabold text-white">No Workout Splits Created Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              You have not created any workout splits yet. Design and build your own custom training split from scratch.
            </p>
            <button
              onClick={onOpenCreatePlanModal}
              className="px-5 py-2.5 rounded-xl btn-orange text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md active:scale-95 mt-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Your First Split</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
