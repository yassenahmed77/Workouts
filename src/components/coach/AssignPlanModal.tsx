'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { User, WorkoutPlan } from '@/types';
import { X, Check, Dumbbell, Calendar, Target, Sparkles, ArrowRight } from 'lucide-react';

interface AssignPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
}

export const AssignPlanModal: React.FC<AssignPlanModalProps> = ({
  isOpen,
  onClose,
  targetUser
}) => {
  const { users, plans, assignPlanToUser } = useGym();
  const [selectedUserId, setSelectedUserId] = useState<string>(targetUser?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Keep state synced with targetUser prop when modal opens
  React.useEffect(() => {
    if (targetUser) {
      setSelectedUserId(targetUser.id);
      setSelectedPlanId(targetUser.assignedPlanId || (plans[0]?.id ?? ''));
    } else if (users.length > 0 && !selectedUserId) {
      const firstTrainee = users.find(u => u.role === 'trainee');
      if (firstTrainee) {
        setSelectedUserId(firstTrainee.id);
        setSelectedPlanId(firstTrainee.assignedPlanId || (plans[0]?.id ?? ''));
      }
    }
  }, [targetUser, users, plans]);

  if (!isOpen) return null;

  const trainees = users.filter((u) => u.role === 'trainee');
  const currentSelectedUser = trainees.find((u) => u.id === selectedUserId);

  const handleAssign = () => {
    if (!selectedUserId || !selectedPlanId) return;
    assignPlanToUser(selectedUserId, selectedPlanId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#121218] border border-[#272734] rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Assign Training Protocol
            </h3>
            <p className="text-xs text-zinc-400">
              Select an athlete and deploy a custom periodized workout split
            </p>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Athlete Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Select Athlete
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trainees.map((trainee) => {
                const isSelected = trainee.id === selectedUserId;
                const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
                return (
                  <button
                    key={trainee.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(trainee.id);
                      if (trainee.assignedPlanId) {
                        setSelectedPlanId(trainee.assignedPlanId);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#181824] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'bg-[#0d0d12] border-[#22222c] hover:border-[#323242]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300">
                        {trainee.avatarText}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">
                          {trainee.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {assignedPlan ? assignedPlan.title : 'No plan active'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workout Plan Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Available Training Plans ({plans.length})
              </label>
              <span className="text-[10px] text-zinc-500">Pick template to assign</span>
            </div>

            <div className="space-y-2.5">
              {plans.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                const totalExercises = plan.days.reduce((acc, d) => acc + d.exercises.length, 0);

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#171724] border-purple-500 ring-1 ring-purple-500/50'
                        : 'bg-[#0d0d12] border-[#22222c] hover:border-[#333344]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            {plan.title}
                          </h4>
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {plan.level}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {plan.description}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-600 text-white' 
                          : 'border-zinc-700 bg-zinc-900'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1.5 font-numeric">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {plan.daysPerWeek} Days / Week
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="flex items-center gap-1.5 font-numeric">
                        <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
                        {totalExercises} Total Exercises
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="font-numeric">
                        {plan.durationWeeks} Weeks Cycle
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-5 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            {currentSelectedUser ? (
              <>Assigning to <span className="text-white font-semibold">{currentSelectedUser.name}</span></>
            ) : (
              'Select an athlete to proceed'
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUserId || !selectedPlanId}
              onClick={handleAssign}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)]"
            >
              <span>Deploy Plan to Athlete</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
