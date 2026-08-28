'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
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
  Sparkles
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
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<WorkoutPlan | null>(null);

  const getTraineesForPlan = (planId: string) => {
    return users.filter((u) => u.assignedPlanId === planId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121218] border border-[#22222d]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-400" />
            Workout Program Templates
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Build and manage comprehensive periodized workout splits for your athletes
          </p>
        </div>

        <button
          onClick={onOpenCreatePlanModal}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const assignedTrainees = getTraineesForPlan(plan.id);
          const totalExercises = plan.days.reduce((acc, d) => acc + d.exercises.length, 0);

          return (
            <div
              key={plan.id}
              className="p-5 rounded-xl bg-[#111116] border border-[#22222e] hover:border-purple-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {plan.title}
                      </h3>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {plan.level}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditPlanModal(plan)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                      title="Edit Plan"
                    >
                      <Edit3 className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete plan "${plan.title}"?`)) {
                          deletePlan(plan.id);
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Plan Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-[#0d0d12] border border-zinc-900 my-3 text-center text-xs">
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-zinc-500">Days / Wk</span>
                    <span className="font-bold font-numeric text-zinc-200">{plan.daysPerWeek}</span>
                  </div>
                  <div className="border-x border-zinc-800">
                    <span className="block text-[9px] font-mono uppercase text-zinc-500">Cycle</span>
                    <span className="font-bold font-numeric text-zinc-200">{plan.durationWeeks} wks</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-zinc-500">Exercises</span>
                    <span className="font-bold font-numeric text-purple-400">{totalExercises}</span>
                  </div>
                </div>

                {/* Days Breakdown Preview */}
                <div className="space-y-1.5 my-3">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Scheduled Days ({plan.days.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {plan.days.map((day) => (
                      <div
                        key={day.id}
                        className="px-2.5 py-1.5 rounded-md bg-[#16161f] border border-zinc-900 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-zinc-300 truncate max-w-[140px]">
                          {day.dayName}
                        </span>
                        {day.isRestDay ? (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-500">
                            Rest
                          </span>
                        ) : (
                          <span className="text-[10px] font-numeric text-purple-300">
                            {day.exercises.length} ex
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Athletes Strip */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Enrolled Athletes ({assignedTrainees.length})
                  </span>
                  {assignedTrainees.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedTrainees.map((trainee) => (
                        <span
                          key={trainee.id}
                          className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          {trainee.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No athletes currently assigned</p>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => onOpenAssignModalForPlan(plan)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-md transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Assign to Trainee</span>
                </button>
                <button
                  onClick={() => onOpenEditPlanModal(plan)}
                  className="text-xs text-purple-300 hover:text-white font-medium flex items-center gap-1"
                >
                  <span>Edit Split Details →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
