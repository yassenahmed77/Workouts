'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, DietPlan } from '@/types';
import { X, Check, Utensils, Flame, Droplets, ArrowRight } from 'lucide-react';

interface AssignDietModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
}

export const AssignDietModal: React.FC<AssignDietModalProps> = ({
  isOpen,
  onClose,
  targetUser
}) => {
  const { users, dietPlans, assignDietPlanToUser } = useGym();
  const { showToast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>(targetUser?.id || '');
  const [selectedDietPlanId, setSelectedDietPlanId] = useState<string>('');

  useEffect(() => {
    if (targetUser) {
      setSelectedUserId(targetUser.id);
      setSelectedDietPlanId(targetUser.assignedDietPlanId || (dietPlans[0]?.id ?? ''));
    } else if (users.length > 0 && !selectedUserId) {
      const firstTrainee = users.find(u => u.role === 'trainee');
      if (firstTrainee) {
        setSelectedUserId(firstTrainee.id);
        setSelectedDietPlanId(firstTrainee.assignedDietPlanId || (dietPlans[0]?.id ?? ''));
      }
    }
  }, [targetUser, users, dietPlans, selectedUserId]);

  // Escape key dismissal
  useEffect(() => {
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
    if (!selectedUserId || !selectedDietPlanId) return;
    assignDietPlanToUser(selectedUserId, selectedDietPlanId);
    const chosenPlan = dietPlans.find(d => d.id === selectedDietPlanId);
    showToast(`Assigned ${chosenPlan?.title || 'Diet Plan'} to ${currentSelectedUser?.name || 'Athlete'}`, 'success');
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
          <div className="w-9 h-9 rounded-xl bg-[var(--card-subtle-bg)] text-[var(--main-color)] border border-[var(--card-border)] flex items-center justify-center flex-shrink-0">
            <Utensils className="w-4 h-4 text-[var(--main-color)]" />
          </div>
          <div>
            <h3 className="gym-heading-section">
              Assign Diet Plan
            </h3>
            <p className="gym-subtext mt-0.5">
              Deploy structured macronutrient and caloric targets to athlete profile.
            </p>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {/* Athlete Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 font-bold">
              1. Target Athlete
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trainees.map((trainee) => {
                const isSelected = trainee.id === selectedUserId;
                const assignedDiet = dietPlans.find((d) => d.id === trainee.assignedDietPlanId);
                return (
                  <button
                    key={trainee.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(trainee.id);
                      if (trainee.assignedDietPlanId) {
                        setSelectedDietPlanId(trainee.assignedDietPlanId);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--card-subtle-bg)] border-[var(--main-color)] shadow-md shadow-[var(--main-color)]/15'
                        : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] hover:border-zinc-700'
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
                        <div className="w-8 h-8 rounded-full bg-[var(--card-bg)] text-[var(--main-color)] border border-[var(--card-border)] text-[11px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                          {trainee.avatarText}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{trainee.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {assignedDiet ? assignedDiet.title : 'No diet assigned'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[var(--main-color)] text-white flex items-center justify-center flex-shrink-0 ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diet Plans Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 font-bold">
              2. Select Diet Plan
            </label>
            <div className="space-y-2">
              {dietPlans.map((plan) => {
                const isSelected = plan.id === selectedDietPlanId;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedDietPlanId(plan.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--card-subtle-bg)] border-[var(--main-color)] shadow-lg shadow-[var(--main-color)]/15'
                        : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{plan.title}</h4>
                          {isSelected && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--main-color)]/15 text-[var(--main-color)] border border-[var(--main-color)]/30">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{plan.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-mono font-bold text-[var(--main-color)] flex-shrink-0">
                        <Flame className="w-3.5 h-3.5 text-[var(--main-color)]" />
                        <span>{plan.targetCalories} kcal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[var(--card-border)] text-center font-mono">
                      <div className="py-1 px-2 rounded-lg bg-[var(--card-bg)]">
                        <span className="text-[9px] text-zinc-500 block font-bold">Protein</span>
                        <span className="text-xs text-white font-bold">{plan.targetProteinG}g</span>
                      </div>
                      <div className="py-1 px-2 rounded-lg bg-[var(--card-bg)]">
                        <span className="text-[9px] text-zinc-500 block font-bold">Carbs</span>
                        <span className="text-xs text-white font-bold">{plan.targetCarbsG}g</span>
                      </div>
                      <div className="py-1 px-2 rounded-lg bg-[var(--card-bg)]">
                        <span className="text-[9px] text-zinc-500 block font-bold">Fats</span>
                        <span className="text-xs text-white font-bold">{plan.targetFatsG}g</span>
                      </div>
                      <div className="py-1 px-2 rounded-lg bg-[var(--card-bg)] flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-[var(--main-color)]" />
                        <span className="text-xs text-[var(--main-color)] font-bold">{plan.waterTargetLiters}L</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-[var(--card-border)] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="gym-btn-ghost text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedUserId || !selectedDietPlanId}
            className="gym-btn-primary text-xs inline-flex items-center gap-2"
          >
            <span>Deploy Diet Plan</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
