'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, UserGoal } from '@/types';
import { clientService } from '@/services/clientService';
import { sanitizeString, sanitizeNotes } from '@/lib/sanitizer';
import { X, Check, Trash2, Mail, Scale, Ruler, Target, Shield, AlertTriangle } from 'lucide-react';

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

/**
 * EditTraineeModal
 * 
 * Secure modal for updating an athlete's vital metrics, goals, and account status.
 * Validates inputs against strict Zod schema before dispatching updates.
 */
export const EditTraineeModal: React.FC<EditTraineeModalProps> = ({ isOpen, onClose, user }) => {
  const { updateUserProfile, deleteUser } = useGym();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [weightKg, setWeightKg] = useState<number | string>(70);
  const [targetWeightKg, setTargetWeightKg] = useState<number | string>(70);
  const [heightCm, setHeightCm] = useState<number | string>(175);
  const [goal, setGoal] = useState<UserGoal>('Hypertrophy / Muscle Gain');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'inactive' | 'on_hold'>('active');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setWeightKg(user.weightKg || 70);
      setTargetWeightKg(user.targetWeightKg || user.weightKg || 70);
      setHeightCm(user.heightCm || 175);
      setGoal(user.goal || 'Hypertrophy / Muscle Gain');
      setNotes(user.notes || '');
      setStatus(user.status || 'active');
      setShowDeleteConfirm(false);
      setValidationErrors([]);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedWeight = typeof weightKg === 'number' ? weightKg : parseFloat(String(weightKg));
    const parsedTarget = typeof targetWeightKg === 'number' ? targetWeightKg : parseFloat(String(targetWeightKg));
    const parsedHeight = typeof heightCm === 'number' ? heightCm : parseFloat(String(heightCm));

    // Runtime validation via clientService Zod Schema
    const validation = clientService.validateUpdate({
      id: user.id,
      name: sanitizeString(name),
      email: email.trim().toLowerCase(),
      weightKg: isNaN(parsedWeight) ? undefined : parsedWeight,
      targetWeightKg: isNaN(parsedTarget) ? undefined : parsedTarget,
      heightCm: isNaN(parsedHeight) ? undefined : parsedHeight,
      goal,
      notes: sanitizeNotes(notes),
      status
    });

    if (!validation.success) {
      setValidationErrors(validation.errors);
      showToast('Please fix the validation errors below', 'error');
      return;
    }

    setIsSaving(true);
    setValidationErrors([]);

    try {
      await updateUserProfile(user.id, {
        name: sanitizeString(name),
        email: email.trim().toLowerCase(),
        weightKg: parsedWeight,
        targetWeightKg: parsedTarget,
        heightCm: parsedHeight,
        goal,
        notes: sanitizeNotes(notes),
        status
      });
      showToast('Athlete profile updated successfully', 'success');
      onClose();
    } catch {
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(user.id);
      showToast(`Athlete ${user.name} removed`, 'info');
      onClose();
    } catch {
      showToast('Failed to remove athlete', 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-lg bg-[#0b0f17] border border-white/[0.1] rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white font-bold font-mono">
              {clientService.getInitials(user.name)}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Edit Athlete Profile
              </h2>
              <p className="text-xs text-slate-400">
                Update account details, target metrics, and coaching status
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Errors Alert Banner */}
        {validationErrors.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Please correct the following:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300/80">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-4">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Athlete Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 bg-[#05080e] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@example.com"
                className="w-full px-3 py-2 bg-[#05080e] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
                required
              />
            </div>
          </div>

          {/* Vitals: Weight, Target Weight, Height */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Scale className="w-3 h-3 text-slate-400" />
                <span>Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 bg-[#05080e] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Target className="w-3 h-3 text-cyan-400" />
                <span>Goal (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="w-full px-3 py-2 bg-[#05080e] border border-white/[0.08] rounded-xl text-xs text-cyan-300 focus:outline-none focus:border-cyan-500/40 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Ruler className="w-3 h-3 text-slate-400" />
                <span>Height (cm)</span>
              </label>
              <input
                type="number"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 bg-[#05080e] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                required
              />
            </div>
          </div>

          {/* Goal & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Primary Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as UserGoal)}
                className="w-full px-3 py-2 bg-[#05080e] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/40"
              >
                {GOALS.map((g) => (
                  <option key={g} value={g} className="bg-[#0b0f17]">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>Status</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#05080e] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/40"
              >
                <option value="active" className="bg-[#0b0f17]">Active</option>
                <option value="on_hold" className="bg-[#0b0f17]">On Hold</option>
                <option value="pending" className="bg-[#0b0f17]">Pending Setup</option>
                <option value="inactive" className="bg-[#0b0f17]">Inactive</option>
              </select>
            </div>
          </div>

          {/* Private Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Coach Directives &amp; Background Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private athlete history, injuries, preferences..."
              rows={3}
              className="w-full px-3 py-2 bg-[#05080e] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 resize-none leading-relaxed"
            />
          </div>

          {/* Delete Danger Zone */}
          <div className="pt-2 border-t border-white/[0.06]">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Athlete Account</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                <p className="text-xs text-rose-300">
                  Are you sure? This will remove <strong>{user.name}</strong> and all associated logs permanently.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
