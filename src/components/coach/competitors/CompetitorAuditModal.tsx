'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import { 
  X, 
  Lock, 
  CheckCircle2, 
  Save, 
  ExternalLink, 
  Camera 
} from 'lucide-react';
import { sanitizeNotes } from '@/lib/sanitizer';

interface CompetitorAuditModalProps {
  competitor: User | null;
  onClose: () => void;
  onSelectClientFor360?: (user: User) => void;
  onSavePrivateNotes: (competitor: User, notes: string) => Promise<void>;
}

export const CompetitorAuditModal: React.FC<CompetitorAuditModalProps> = ({
  competitor,
  onClose,
  onSelectClientFor360,
  onSavePrivateNotes
}) => {
  const [modalPrivateNote, setModalPrivateNote] = useState('');
  const [isModalNoteSaving, setIsModalNoteSaving] = useState(false);
  const [modalNoteSavedFeedback, setModalNoteSavedFeedback] = useState(false);

  useEffect(() => {
    if (competitor) {
      setModalPrivateNote(
        competitor.privateCoachNotes || competitor.competitionProfile?.privateCoachNotes || ''
      );
      setModalNoteSavedFeedback(false);
    }
  }, [competitor]);

  // Modal Resilience Standard (Rule 6.3): Escape key dismissal
  useEffect(() => {
    if (!competitor) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [competitor, onClose]);

  if (!competitor) return null;

  const handleSaveNotes = async () => {
    setIsModalNoteSaving(true);
    const cleaned = sanitizeNotes(modalPrivateNote);
    await onSavePrivateNotes(competitor, cleaned);
    setIsModalNoteSaving(false);
    setModalNoteSavedFeedback(true);
    setTimeout(() => setModalNoteSavedFeedback(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-3xl bg-[#0b0f17] border border-[#1e2638] rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#64748b] hover:text-white p-2 rounded-xl hover:bg-[#151c27] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#18202d]">
          {competitor.avatarUrl ? (
            <img
              src={competitor.avatarUrl}
              alt={competitor.name}
              className="w-12 h-12 rounded-full object-cover border border-[#1b2535] flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#111622] text-[#94a3b8] border border-[#1b2535] font-mono text-sm font-semibold flex items-center justify-center flex-shrink-0">
              {competitor.avatarText || competitor.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {competitor.name}
              </h2>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#111724] text-[#cbd5e1] border border-[#1e293b]">
                {competitor.competitionProfile?.division || 'Competitor'}
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5 font-mono">
              {competitor.competitionProfile?.targetShow || 'Championship Prep'} &bull;{' '}
              <span className="text-white font-medium">
                {competitor.competitionProfile?.daysOut ?? 30} Days Out
              </span>
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-4 custom-scrollbar">
          {/* Stage Biometrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#090d14] border border-[#161f2e] text-center font-mono">
            <div>
              <span className="text-[10px] text-[#64748b] block">Current / Limit</span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {competitor.weightKg} kg / {competitor.competitionProfile?.targetWeightClassKg || 80} kg
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] block">Conditioning Score</span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {competitor.competitionProfile?.stageReadinessScore ?? 88}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] block">Water Loading</span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {competitor.competitionProfile?.waterIntakeLiters ?? 6.0} L / day
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] block">Carb Load</span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {competitor.competitionProfile?.carbLoadGrams ?? 350}g / day
              </span>
            </div>
          </div>

          {/* 4 Mandatory Stage Posing Angles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-[#64748b] font-bold block">
                Mandatory Stage Posing (4 Angles)
              </span>
              <span className="text-[10px] font-mono text-[#cbd5e1]">
                Status: {competitor.competitionProfile?.posingApproval || 'Approved'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'front', label: 'Front Relaxed', url: competitor.competitionProfile?.mandatoryPhotos?.frontUrl },
                { key: 'back', label: 'Back Double Bicep', url: competitor.competitionProfile?.mandatoryPhotos?.backUrl },
                { key: 'side', label: 'Side Chest/Tri', url: competitor.competitionProfile?.mandatoryPhotos?.sideUrl },
                { key: 'legs', label: 'Abs & Thighs', url: competitor.competitionProfile?.mandatoryPhotos?.legsUrl }
              ].map((pose) => (
                <div
                  key={pose.key}
                  className="aspect-[3/4] rounded-xl bg-[#090d14] border border-[#161f2e] overflow-hidden relative group shadow-sm"
                >
                  {pose.url ? (
                    <img
                      src={pose.url}
                      alt={pose.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#526075] p-2">
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-mono text-center">{pose.label}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <span className="text-[9px] font-mono text-white truncate block text-center">
                      {pose.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Stage Cues */}
          {competitor.competitionProfile?.stageNotes && (
            <div className="p-3 rounded-xl bg-[#090d14] border border-[#161f2e]">
              <span className="text-[10px] font-mono uppercase text-[#64748b] block font-bold mb-1">
                Coach Stage Cues (Posing Feedback)
              </span>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                {competitor.competitionProfile.stageNotes}
              </p>
            </div>
          )}

          {/* Private Coach Notes Section */}
          <div className="p-4 rounded-xl bg-[#090d14] border border-[#161f2e] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#141a24]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#111622] border border-[#1a2436] flex items-center justify-center text-[#94a3b8]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Private Coach Notes
                  </h4>
                  <span className="text-[10px] text-[#64748b] block leading-none">
                    Confidential &bull; Only visible to you
                  </span>
                </div>
              </div>

              {modalNoteSavedFeedback ? (
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              ) : (
                <span className="text-[10px] font-mono text-[#526075] px-1.5 py-0.5 rounded bg-[#0b0f17] border border-[#161f2e]">
                  Auto-sync
                </span>
              )}
            </div>

            {/* Quick Tags */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
              <span className="text-[#64748b] mr-1">Insert Cue:</span>
              {[
                'Water Cut',
                'Conditioning Peak',
                'Holding Water',
                'Delts Full',
                'Sodium Taper',
                'Mindset Sharp'
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setModalPrivateNote((prev) => (prev ? `${prev} [${tag}]` : `[${tag}]`))}
                  className="px-2 py-0.5 rounded bg-[#0b0f17] hover:bg-[#141c2a] text-[#8896aa] hover:text-white border border-[#161f2e] transition-colors cursor-pointer"
                >
                  +{tag}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              rows={3}
              value={modalPrivateNote}
              onChange={(e) => setModalPrivateNote(e.target.value)}
              placeholder="Record confidential notes on conditioning rate, water protocols, vascularity, gut distension, or judge feedback..."
              className="w-full p-3 rounded-xl bg-[#0b0f17] border border-[#1a2436] text-xs text-white placeholder-[#526075] focus:outline-none focus:border-[#334155] font-sans leading-relaxed resize-none transition-colors"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-[#526075]">
                Encrypted in coach profile
              </span>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isModalNoteSaving}
                className="py-1.5 px-4 rounded-lg bg-white hover:bg-slate-100 text-[#080c14] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isModalNoteSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-2 border-t border-[#18202d] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-[#202a38] text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-[#151c27] transition-all cursor-pointer"
          >
            Close Audit
          </button>

          {onSelectClientFor360 && (
            <button
              type="button"
              onClick={() => {
                const c = competitor;
                onClose();
                onSelectClientFor360(c);
              }}
              className="py-2 px-4 rounded-xl bg-[#111724] hover:bg-[#162030] border border-[#1e293b] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              <span>Open Full Client 360</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#94a3b8]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
