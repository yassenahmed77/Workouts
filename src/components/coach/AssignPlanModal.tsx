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

  // Escape key dismissal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trainees = users.filter((u) => u.role === 'trainee');
  const currentSelectedUser = trainees.find((u) => u.id === selectedUserId);

  const handleAssign = () => {
    if (!selectedUserId || !selectedPlanId) return;
    assignPlanToUser(selectedUserId, selectedPlanId);
    showToast(`Workout plan assigned to ${currentSelectedUser?.name || 'athlete'}!`, 'success');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="gym-card w-full max-w-2xl p-4 sm:p-5 shadow-2xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.08]">
          <div className="w-9 h-9 rounded-xl bg-[var(--card-subtle-bg)] text-[var(--main-color)] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="gym-heading-section">
              Assign Training Split
            </h3>
            <p className="gym-subtext mt-0.5">
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
                        ? 'bg-[var(--card-subtle-bg)] border-[var(--main-color)]/50 shadow-md shadow-[var(--main-color)]/15'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {trainee.avatarUrl ? (
                        <img
                          src={trainee.avatarUrl}
                          alt={trainee.name}
                          className="w-8 h-8 rounded-full object-cover border border-[var(--main-color)]/40 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--card-subtle-bg)] border border-[var(--card-border)] flex items-center justify-center font-mono font-bold text-xs text-[var(--main-color)] flex-shrink-0">
                          {trainee.avatarText}
                        </div>
                      )}
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
                      <div className="w-5 h-5 rounded-full bg-[var(--main-color)] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
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
                        ? 'bg-[var(--card-subtle-bg)] border-[var(--main-color)]/50 shadow-md shadow-[var(--main-color)]/15'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] text-[var(--main-color)] border border-[var(--card-border)] flex items-center justify-center font-mono text-xs font-black flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-white tracking-tight truncate">
                            {plan.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                            {plan.description || 'Targeted progressive overload training routine.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected 
                            ? 'border-[var(--main-color)] bg-[var(--main-color)] text-white shadow-md shadow-[var(--main-color)]/25' 
                            : 'border-[var(--card-border)] bg-[var(--card-subtle-bg)]'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-[var(--card-border)] text-[11px] text-zinc-400 font-numeric">
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
                      <span className="font-bold text-[var(--main-color)] font-mono">
                        {plan.durationWeeks} Wks Cycle
                      </span>
                    </div>
                  </div>
                );
              })}

              {plans.length === 0 && (
                <div className="p-8 rounded-2xl bg-[var(--card-subtle-bg)] border border-dashed border-[var(--card-border)] text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--card-bg)] text-[var(--main-color)] border border-[var(--card-border)] flex items-center justify-center mx-auto mb-2">
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
        <div className="pt-4 mt-4 border-t border-[var(--card-border)] flex items-center justify-between gap-3">
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
              className="gym-btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUserId || !selectedPlanId || plans.length === 0}
              onClick={handleAssign}
              className="gym-btn-primary text-xs flex items-center gap-1.5"
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
