'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { UserGoal } from '@/types';
import { X, UserPlus, ArrowRight } from 'lucide-react';

interface NewTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSelect?: (userId: string) => void;
}

export const NewTraineeModal: React.FC<NewTraineeModalProps> = ({
  isOpen,
  onClose,
  onSuccessSelect
}) => {
  const { createTrainee } = useGym();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState<UserGoal>('Hypertrophy / Muscle Gain');
  const [weightKg, setWeightKg] = useState('75');
  const [heightCm, setHeightCm] = useState('175');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newTrainee = await createTrainee(
      name.trim(),
      email.trim(),
      goal,
      parseFloat(weightKg) || 75,
      parseFloat(heightCm) || 175
    );

    setName('');
    setEmail('');
    showToast(`Registered athlete ${newTrainee.name}`, 'success');
    onClose();
    if (onSuccessSelect) {
      onSuccessSelect(newTrainee.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#141418] border border-zinc-700 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Register New Trainee
            </h3>
            <p className="text-xs text-zinc-400">
              Add athlete profile to your coaching roster
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Youssef Adel"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-zinc-700 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-zinc-700 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
              Primary Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as UserGoal)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-zinc-700 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
            >
              <option value="Hypertrophy / Muscle Gain">Hypertrophy / Muscle Gain</option>
              <option value="Strength & Power">Strength & Power</option>
              <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
              <option value="Athletic Performance">Athletic Performance</option>
              <option value="Rehabilitation & Mobility">Rehabilitation & Mobility</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-zinc-700 text-sm font-numeric text-white focus:outline-none focus:border-zinc-500 transition-colors font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                Height (cm)
              </label>
              <input
                type="number"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-zinc-700 text-sm font-numeric text-white focus:outline-none focus:border-zinc-500 transition-colors font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-white rounded-xl transition-all shadow-sm"
            >
              <span>Add Athlete</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
