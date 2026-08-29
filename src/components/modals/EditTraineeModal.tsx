'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { User, UserGoal } from '@/types';
import { X, Check, Trash2, User as UserIcon, Mail, Scale, Ruler, Target, Shield, AlertTriangle } from 'lucide-react';

interface EditTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const GOALS: UserGoal[] = [
  'Hypertrophy / Muscle Gain',
  'Strength & Power',
  'Fat Loss & Conditioning',
  'Athletic Performance',
  'Rehabilitation & Mobility'
];

export const EditTraineeModal: React.FC<EditTraineeModalProps> = ({ isOpen, onClose, user }) => {
  const { updateUserProfile, deleteUser } = useGym();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [goal, setGoal] = useState<UserGoal>('Hypertrophy / Muscle Gain');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'inactive'>('active');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setWeightKg(user.weightKg);
      setTargetWeightKg(user.targetWeightKg || user.weightKg);
      setHeightCm(user.heightCm);
      setGoal(user.goal);
      setNotes(user.notes || '');
      setStatus(user.status || 'active');
      setShowDeleteConfirm(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSaving(true);
    await updateUserProfile(user.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      weightKg: Number(weightKg),
      targetWeightKg: Number(targetWeightKg),
      heightCm: Number(heightCm),
      goal,
      notes: notes.trim(),
      status
    });
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    await deleteUser(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#111117] border border-[#272736] rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              {user.avatarText}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Edit Athlete Profile
              </h2>
              <p className="text-xs text-zinc-400">
                Update email, metrics, weight, goal, and notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Athlete Name *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Current Wt (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] font-numeric text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-purple-400 mb-1">
                Target Wt (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-purple-900/50 font-numeric text-xs text-purple-300 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Height (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] font-numeric text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as UserGoal)}
                className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {GOALS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'pending' | 'inactive')}
                className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="active">Active</option>
                <option value="pending">Pending Plan</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Coach Directives & Athlete Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs shoulder warmups, recovering from left knee strain..."
              className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Delete athlete section */}
          <div className="pt-2 border-t border-zinc-800/80">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Athlete Account</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 space-y-2">
                <div className="flex items-center gap-2 text-xs text-red-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Are you sure you want to delete {user.name}?</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  This will remove the athlete and their logs permanently from Supabase.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
