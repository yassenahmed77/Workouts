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
        className="w-full max-w-lg bg-[#0b0f17] border border-[#1e2638] rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#64748b] hover:text-white p-2 rounded-xl hover:bg-[#151c27] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#18202d]">
          <div className="w-10 h-10 rounded-2xl bg-[#111724] text-white border border-[#1e293b] flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Designate Stage Competitor
            </h3>
            <p className="text-xs text-[#64748b]">
              Add an athlete to your active championship stage prep cohort.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {/* Athlete select */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1.5 font-bold">
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
              className="w-full p-2.5 rounded-xl bg-[#090d14] border border-[#16202e] text-xs text-white focus:outline-none focus:border-[#334155] cursor-pointer font-medium"
              required
            >
              <option value="">-- Choose Athlete from Roster --</option>
              {availableTrainees.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#090d14] text-white">
                  {t.name} ({t.weightKg} kg &bull; {t.email})
                </option>
              ))}
            </select>
          </div>

          {/* Target Show Name */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1.5 font-bold">
              2. Target Championship Show
            </label>
            <input
              type="text"
              value={newCompShow}
              onChange={(e) => setNewCompShow(e.target.value)}
              placeholder="e.g. NPC Egypt Muscle Showdown"
              className="w-full p-2.5 rounded-xl bg-[#090d14] border border-[#16202e] text-xs text-white placeholder-[#526075] focus:outline-none focus:border-[#334155] font-medium"
              required
            />
          </div>

          {/* Division & Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1.5 font-bold">
                3. Division
              </label>
              <select
                value={newCompDivision}
                onChange={(e) => setNewCompDivision(e.target.value as CompetitorDivision)}
                className="w-full p-2.5 rounded-xl bg-[#090d14] border border-[#16202e] text-xs text-white focus:outline-none focus:border-[#334155] cursor-pointer font-medium"
              >
                <option value="Classic Physique" className="bg-[#090d14] text-white">Classic Physique</option>
                <option value="Men's Physique" className="bg-[#090d14] text-white">Men&apos;s Physique</option>
                <option value="Open Bodybuilding" className="bg-[#090d14] text-white">Open Bodybuilding</option>
                <option value="Bikini Pro" className="bg-[#090d14] text-white">Bikini Pro</option>
                <option value="Figure" className="bg-[#090d14] text-white">Figure</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1.5 font-bold">
                4. Prep Phase
              </label>
              <select
                value={newCompPhase}
                onChange={(e) => setNewCompPhase(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[#090d14] border border-[#16202e] text-xs text-white focus:outline-none focus:border-[#334155] cursor-pointer font-medium"
              >
                <option value="Peak Week" className="bg-[#090d14] text-white">Peak Week (&lt; 7d out)</option>
                <option value="Cutting Phase (8w)" className="bg-[#090d14] text-white">Cutting Phase (8w out)</option>
                <option value="Prep Phase (16w)" className="bg-[#090d14] text-white">Prep Phase (16w out)</option>
                <option value="Off-Season" className="bg-[#090d14] text-white">Off-Season</option>
              </select>
            </div>
          </div>

          {/* Target Weight Limit & Days Out */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1.5 font-bold">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={newCompTargetWeight}
                onChange={(e) => setNewCompTargetWeight(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#090d14] border border-[#16202e] text-xs text-white focus:outline-none focus:border-[#334155] font-numeric font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1.5 font-bold">
                Days Out
              </label>
              <input
                type="number"
                value={newCompDaysOut}
                onChange={(e) => setNewCompDaysOut(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#090d14] border border-[#16202e] text-xs text-white focus:outline-none focus:border-[#334155] font-numeric font-medium"
                required
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 mt-2 border-t border-[#18202d] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-[#202a38] text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-[#151c27] transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all disabled:opacity-50"
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
