'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, WorkoutPlan } from '@/types';
import { X, Check, Dumbbell, Calendar, Target, ArrowRight, Layers } from 'lucide-react';

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
  const { showToast } = useToast();
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
  }, [targetUser, users, plans, selectedUserId]);

  if (!isOpen) return null;

  const trainees = users.filter((u) => u.role === 'trainee');
  const currentSelectedUser = trainees.find((u) => u.id === selectedUserId);

  const handleAssign = () => {
    if (!selectedUserId || !selectedPlanId) return;
    assignPlanToUser(selectedUserId, selectedPlanId);
    showToast(`Workout plan assigned to ${currentSelectedUser?.name || 'athlete'}! 🎯`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#111218] border border-[#212330] rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-[#1c1d27] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1e202c]">
          <div className="w-10 h-10 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Assign Training Protocol
            </h3>
            <p className="text-xs text-zinc-400">
              Select an athlete and deploy a customized workout split.
            </p>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Athlete Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 font-bold">
              1. Select Athlete
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
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#18151f] border-[#ff6b00]/50 shadow-md shadow-[#ff6b00]/10'
                        : 'bg-[#09090b] border-[#1e202c] hover:border-[#35384d]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#171822] border border-[#252736] flex items-center justify-center font-mono font-bold text-xs text-[#ff6b00] flex-shrink-0">
                        {trainee.avatarText}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-extrabold text-white truncate">
                          {trainee.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {assignedPlan ? assignedPlan.title : 'No active split'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#ff6b00] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
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
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                2. Available Training Plans ({plans.length})
              </label>
              <span className="text-[10px] text-zinc-500">Select template to deploy</span>
            </div>

            <div className="space-y-2.5">
              {plans.map((plan, idx) => {
                const isSelected = plan.id === selectedPlanId;
                const totalExercises = plan.days.reduce((acc, d) => acc + d.exercises.length, 0);

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#18151f] border-[#ff6b00]/50 shadow-md shadow-[#ff6b00]/10'
                        : 'bg-[#09090b] border-[#1e202c] hover:border-[#35384d]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-[#171822] text-[#ff6b00] border border-[#252736] flex items-center justify-center font-mono text-xs font-black flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-white tracking-tight truncate">
                            {plan.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                            {plan.description || 'Targeted progressive overload protocol.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected 
                            ? 'border-[#ff6b00] bg-[#ff6b00] text-white shadow-md shadow-[#ff6b00]/25' 
                            : 'border-[#252736] bg-[#14151e]'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-[#1e202c] text-[11px] text-zinc-400 font-numeric">
                      <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {plan.daysPerWeek} Days / Wk
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                        <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
                        {totalExercises} Total Exercises
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="font-bold text-[#ff6b00] font-mono">
                        {plan.durationWeeks} Wks Cycle
                      </span>
                    </div>
                  </div>
                );
              })}

              {plans.length === 0 && (
                <div className="p-8 rounded-2xl bg-[#09090b] border border-dashed border-[#212330] text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center mx-auto mb-2">
                    <Layers className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h4 className="text-xs font-extrabold text-white">No Workout Splits Created Yet</h4>
                  <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                    You haven&apos;t built any workout splits yet. Build your first master split using Split Architect to deploy it to your athletes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 mt-4 border-t border-[#1e202c] flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-400 truncate">
            {currentSelectedUser ? (
              <>Assigning to: <span className="text-white font-bold">{currentSelectedUser.name}</span></>
            ) : (
              'Select an athlete to proceed'
            )}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl hover:bg-[#1e202c] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUserId || !selectedPlanId || plans.length === 0}
              onClick={handleAssign}
              className="px-4 sm:px-5 py-2.5 rounded-xl btn-orange text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all"
            >
              <span>Deploy Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
