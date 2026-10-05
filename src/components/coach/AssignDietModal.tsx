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
        className="w-full max-w-2xl bg-[#18191e] border border-[#24262e] rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-[#141519] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#24262e]">
          <div className="w-10 h-10 rounded-2xl bg-[#141519] text-[#2f80ed] border border-[#24262e] flex items-center justify-center flex-shrink-0">
            <Utensils className="w-5 h-5 text-[#2f80ed]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Assign Diet Plan
            </h3>
            <p className="text-xs text-zinc-400">
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
                        ? 'bg-[#141519] border-[#2f80ed]/50 shadow-md shadow-[#2f80ed]/15'
                        : 'bg-[#141519] border-[#24262e] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {trainee.avatarUrl ? (
                        <img 
                          src={trainee.avatarUrl} 
                          alt={trainee.name} 
                          className="w-8 h-8 rounded-full object-cover border border-[#2f80ed]/40 flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#18191e] text-[#2f80ed] border border-[#24262e] text-[11px] font-mono font-bold flex items-center justify-center flex-shrink-0">
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
                      <div className="w-5 h-5 rounded-full bg-[#2f80ed] text-white flex items-center justify-center flex-shrink-0 ml-2">
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
                        ? 'bg-[#141519] border-[#2f80ed]/50 shadow-lg shadow-[#2f80ed]/15'
                        : 'bg-[#141519] border-[#24262e] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{plan.title}</h4>
                          {isSelected && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#2f80ed]/15 text-[#2f80ed] border border-[#2f80ed]/30">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{plan.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#18191e] border border-[#24262e] text-xs font-mono font-bold text-[#2f80ed] flex-shrink-0">
                        <Flame className="w-3.5 h-3.5 text-[#2f80ed]" />
                        <span>{plan.targetCalories} kcal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#24262e] text-center font-mono">
                      <div className="py-1 px-2 rounded-lg bg-[#18191e]">
                        <span className="text-[9px] text-zinc-500 block font-bold">Protein</span>
                        <span className="text-xs text-white font-bold">{plan.targetProteinG}g</span>
                      </div>
                      <div className="py-1 px-2 rounded-lg bg-[#18191e]">
                        <span className="text-[9px] text-zinc-500 block font-bold">Carbs</span>
                        <span className="text-xs text-white font-bold">{plan.targetCarbsG}g</span>
                      </div>
                      <div className="py-1 px-2 rounded-lg bg-[#18191e]">
                        <span className="text-[9px] text-zinc-500 block font-bold">Fats</span>
                        <span className="text-xs text-white font-bold">{plan.targetFatsG}g</span>
                      </div>
                      <div className="py-1 px-2 rounded-lg bg-[#18191e] flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-[#2f80ed]" />
                        <span className="text-xs text-[#2f80ed] font-bold">{plan.waterTargetLiters}L</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-[#24262e] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#24262e] text-xs font-bold text-zinc-400 hover:text-white hover:bg-[#141519] transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedUserId || !selectedDietPlanId}
            className="px-6 py-2.5 rounded-xl btn-cyan disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md shadow-[#2f80ed]/30 active:scale-95 transition-all"
          >
            <span>Deploy Diet Plan</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
