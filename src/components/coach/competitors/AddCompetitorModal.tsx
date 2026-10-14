'use client';

import React, { useEffect, useState } from 'react';
import { User, CompetitorDivision } from '@/types';
import { X, Trophy, Plus } from 'lucide-react';
import { competitorService } from '@/services/competitorService';
import { useToast } from '@/context/ToastContext';

interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTrainees: User[];
  onAddCompetitor: (
    userId: string,
    showData: {
      targetShow: string;
      division: CompetitorDivision;
      targetWeightClassKg: number;
      daysOut: number;
      prepPhase: 'Off-Season' | 'Prep Phase (16w)' | 'Cutting Phase (8w)' | 'Peak Week' | 'Show Day';
    }
  ) => Promise<void>;
}

export const AddCompetitorModal: React.FC<AddCompetitorModalProps> = ({
  isOpen,
  onClose,
  availableTrainees,
  onAddCompetitor
}) => {
  const { showToast } = useToast();

  const [newCompUserId, setNewCompUserId] = useState('');
  const [newCompShow, setNewCompShow] = useState('NPC Egypt Muscle Showdown');
  const [newCompDivision, setNewCompDivision] = useState<CompetitorDivision>('Classic Physique');
  const [newCompTargetWeight, setNewCompTargetWeight] = useState<number>(84);
  const [newCompDaysOut, setNewCompDaysOut] = useState<number>(30);
  const [newCompPhase, setNewCompPhase] = useState<'Off-Season' | 'Prep Phase (16w)' | 'Cutting Phase (8w)' | 'Peak Week' | 'Show Day'>('Cutting Phase (8w)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Resilience Standard (Rule 6.3): Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompUserId) {
      showToast('Please select an athlete from your roster', 'error');
      return;
    }

    const selectedAthlete = availableTrainees.find((u) => u.id === newCompUserId);
    if (!selectedAthlete) {
      showToast('Selected athlete was not found', 'error');
      return;
    }

    // Validate using competitorService schema
    const validation = competitorService.validateProfile({
      targetShow: newCompShow.trim(),
      showDate: new Date(Date.now() + newCompDaysOut * 86400000).toISOString().split('T')[0],
      division: newCompDivision,
      targetWeightClassKg: Number(newCompTargetWeight) || selectedAthlete.weightKg,
      currentWeightKg: selectedAthlete.weightKg || 80,
      prepPhase: newCompPhase,
      stageReadinessScore: 75,
      posingApproval: 'Pending Review',
      daysOut: Number(newCompDaysOut) || 30,
      waterIntakeLiters: 4,
      carbLoadGrams: 300
    });

    if (!validation.success || !validation.data) {
      showToast(validation.error || 'Invalid competitor setup', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddCompetitor(newCompUserId, {
        targetShow: validation.data.targetShow,
        division: validation.data.division,
        targetWeightClassKg: validation.data.targetWeightClassKg,
        daysOut: validation.data.daysOut,
        prepPhase: validation.data.prepPhase
      });
      onClose();
    } catch {
      showToast('Failed to add competitor', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[var(--card-subtle-bg)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--card-border)]">
          <div className="w-10 h-10 rounded-2xl bg-[var(--card-subtle-bg)] text-white border border-[var(--card-border)] flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Designate Stage Competitor
            </h3>
            <p className="text-xs text-slate-400">
              Add an athlete to your active championship stage prep cohort.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {/* Athlete select */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
              1. Select Athlete
            </label>
            <select
              value={newCompUserId}
              onChange={(e) => {
                setNewCompUserId(e.target.value);
                const sel = availableTrainees.find((u) => u.id === e.target.value);
                if (sel) {
                  setNewCompTargetWeight(sel.targetWeightKg || sel.weightKg);
                }
              }}
              className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white focus:outline-none focus:border-[var(--main-color)] cursor-pointer font-medium"
              required
            >
              <option value="">-- Choose Athlete from Roster --</option>
              {availableTrainees.map((t) => (
                <option key={t.id} value={t.id} className="bg-[var(--card-bg)] text-white">
                  {t.name} ({t.weightKg} kg &bull; {t.email})
                </option>
              ))}
            </select>
          </div>

          {/* Target Show Name */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
              2. Target Championship Show
            </label>
            <input
              type="text"
              value={newCompShow}
              onChange={(e) => setNewCompShow(e.target.value)}
              placeholder="e.g. NPC Egypt Muscle Showdown"
              className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] font-medium"
              required
            />
          </div>

          {/* Division & Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                3. Division
              </label>
              <select
                value={newCompDivision}
                onChange={(e) => setNewCompDivision(e.target.value as CompetitorDivision)}
                className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white focus:outline-none focus:border-[var(--main-color)] cursor-pointer font-medium"
              >
                <option value="Classic Physique" className="bg-[var(--card-bg)] text-white">Classic Physique</option>
                <option value="Men's Physique" className="bg-[var(--card-bg)] text-white">Men&apos;s Physique</option>
                <option value="Open Bodybuilding" className="bg-[var(--card-bg)] text-white">Open Bodybuilding</option>
                <option value="Bikini Pro" className="bg-[var(--card-bg)] text-white">Bikini Pro</option>
                <option value="Figure" className="bg-[var(--card-bg)] text-white">Figure</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                4. Prep Phase
              </label>
              <select
                value={newCompPhase}
                onChange={(e) => setNewCompPhase(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white focus:outline-none focus:border-[var(--main-color)] cursor-pointer font-medium"
              >
                <option value="Peak Week" className="bg-[var(--card-bg)] text-white">Peak Week (&lt; 7d out)</option>
                <option value="Cutting Phase (8w)" className="bg-[var(--card-bg)] text-white">Cutting Phase (8w out)</option>
                <option value="Prep Phase (16w)" className="bg-[var(--card-bg)] text-white">Prep Phase (16w out)</option>
                <option value="Off-Season" className="bg-[var(--card-bg)] text-white">Off-Season</option>
              </select>
            </div>
          </div>

          {/* Target Weight Limit & Days Out */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={newCompTargetWeight}
                onChange={(e) => setNewCompTargetWeight(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white focus:outline-none focus:border-[var(--main-color)] font-numeric font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                Days Out
              </label>
              <input
                type="number"
                value={newCompDaysOut}
                onChange={(e) => setNewCompDaysOut(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white focus:outline-none focus:border-[var(--main-color)] font-numeric font-medium"
                required
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 mt-2 border-t border-[var(--card-border)] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="gym-btn-ghost text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="gym-btn-primary text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isSubmitting ? 'Registering...' : 'Register Competitor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
