'use client';

import React, { useState } from 'react';
import { WeeklyCheckIn, CheckInPhoto, User } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { PhotoComparisonModal } from './PhotoComparisonModal';

import { sanitizeNotes } from '@/lib/sanitizer';

interface ClientCheckInsTabProps {
  client: User;
}

export const ClientCheckInsTab: React.FC<ClientCheckInsTabProps> = ({ client }) => {
  const { getCheckInsForUser, saveCheckInFeedback } = useGym();
  const { showToast } = useToast();

  const checkIns = getCheckInsForUser(client.id);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Active check-in selected for detailed review
  const [selectedCheckInId, setSelectedCheckInId] = useState<string>(
    checkIns.length > 0 ? checkIns[0].id : ''
  );

  // Side-by-Side Comparison Mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareIdA, setCompareIdA] = useState<string>(
    checkIns.length > 1 ? checkIns[checkIns.length - 1].id : (checkIns[0]?.id || '')
  );
  const [compareIdB, setCompareIdB] = useState<string>(
    checkIns.length > 0 ? checkIns[0].id : ''
  );
  const [selectedAngle, setSelectedAngle] = useState<'front' | 'side' | 'back'>('front');

  // Lightbox Modal state
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<{ url: string; title: string; date: string } | null>(null);

  // Feedback draft state
  const [feedbackDraft, setFeedbackDraft] = useState<{ [checkInId: string]: string }>({});
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  // Escape key handler for lightbox
  React.useEffect(() => {
    if (!activeLightboxPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveLightboxPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxPhoto]);

  const activeCheckIn = checkIns.find((c) => c.id === selectedCheckInId) || checkIns[0];
  const compareCheckInA = checkIns.find((c) => c.id === compareIdA);
  const compareCheckInB = checkIns.find((c) => c.id === compareIdB);

  const handleSaveFeedback = async (checkInId: string) => {
    const rawText = feedbackDraft[checkInId] ?? activeCheckIn?.coachFeedback ?? '';
    const cleanText = sanitizeNotes(rawText);

    setIsSavingFeedback(true);
    await saveCheckInFeedback(checkInId, cleanText);
    setIsSavingFeedback(false);
    showToast('Coach feedback saved', 'success');
  };

  if (checkIns.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-[#090d14] border border-white/[0.07] space-y-2 select-none">
        <h3 className="text-sm font-bold text-white">No Check-Ins Submitted Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          When {client.name} submits weekly check-in forms and progress photos, they will appear chronologically here for your coaching review.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-2 select-none">
      
      {/* 1. Header Controls: View Mode & Quick Stats (Compact & Clean) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#090d14] border border-white/[0.07] flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Weekly Submissions
            </span>
            <span className="text-slate-600 text-xs">&bull;</span>
            <span className="text-[10px] font-mono text-slate-500">
              {checkIns.length} Check-ins &bull; Latest: {checkIns[0]?.date}
            </span>
          </div>
        </div>

        {checkIns.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              Compare Photos
            </button>
            <button
              type="button"
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                isCompareMode
                  ? 'bg-white text-black border-white shadow-sm font-semibold'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]'
              }`}
            >
              {isCompareMode ? 'Exit Compare' : 'Side-by-Side'}
            </button>
          </div>
        )}
      </div>

      {/* 2. Side-by-Side Comparison Modal / Box */}
      {isCompareMode && compareCheckInA && compareCheckInB && (
        <div className="p-3 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.05]">
            <span className="text-xs font-semibold text-white">
              Visual Transformation ({selectedAngle.toUpperCase()} View)
            </span>

            <div className="flex items-center gap-1">
              {(['front', 'side', 'back'] as const).map((angle) => (
                <button
                  key={angle}
                  onClick={() => setSelectedAngle(angle)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase transition-all cursor-pointer ${
                    selectedAngle === angle
                      ? 'bg-white/[0.1] text-white border border-white/20 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {angle}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono px-1">
                <span className="text-slate-400">{compareCheckInA.date}</span>
                <span className="text-white font-medium">{compareCheckInA.weightKg} kg</span>
              </div>
              <div className="relative aspect-[3/4] max-h-48 rounded-lg overflow-hidden bg-black border border-white/[0.05]">
                {(() => {
                  const photo = compareCheckInA.photos.find((p) => p.angle === selectedAngle) || compareCheckInA.photos[0];
                  return photo ? (
                    <img src={photo.url} alt="A" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">None</div>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono px-1">
                <span className="text-slate-400">{compareCheckInB.date}</span>
                <span className="text-white font-medium">{compareCheckInB.weightKg} kg</span>
              </div>
              <div className="relative aspect-[3/4] max-h-48 rounded-lg overflow-hidden bg-black border border-white/20">
                {(() => {
                  const photo = compareCheckInB.photos.find((p) => p.angle === selectedAngle) || compareCheckInB.photos[0];
                  return photo ? (
                    <img src={photo.url} alt="B" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">None</div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Horizontal Date Selector Strip (No clipping, sleek buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 flex-shrink-0">
        {checkIns.map((item) => {
          const isSelected = item.id === (activeCheckIn?.id || '');
          return (
            <button
              key={item.id}
              onClick={() => setSelectedCheckInId(item.id)}
              className={`py-1 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                isSelected
                  ? 'bg-white/[0.1] text-white border-white/20 shadow-sm font-semibold'
                  : 'bg-[#090d14] text-slate-400 hover:text-white border-white/[0.05]'
              }`}
            >
              <span>{item.date}</span>
              <span className="font-numeric text-slate-500 text-[10px]">({item.weightKg} kg)</span>
              {!item.reviewed && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" title="Needs Review" />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Active Selected Check-in Detail Card (Internal Scroll Container) */}
      {activeCheckIn && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          <div className="p-3 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-3">
            {/* Top Status & Date Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Check-In: {activeCheckIn.date}
                  </h4>
                  {activeCheckIn.reviewed ? (
                    <span className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[9px] font-mono">
                      Reviewed
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-white/[0.08] border border-white/20 text-white text-[9px] font-mono font-medium">
                      Needs Review
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-numeric">
                  Body Weight: <strong className="text-white font-medium">{activeCheckIn.weightKg} kg</strong>
                </span>
              </div>

              {/* Bio Feedback Indicators */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <div className="px-2 py-0.5 rounded bg-[#05080e] border border-white/[0.04] text-center">
                  <span className="text-[8px] text-slate-500 uppercase block">Energy</span>
                  <span className="text-white font-medium">{activeCheckIn.energyRating || 4}/5</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-[#05080e] border border-white/[0.04] text-center">
                  <span className="text-[8px] text-slate-500 uppercase block">Sleep</span>
                  <span className="text-white font-medium">{activeCheckIn.sleepQuality || 4}/5</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-[#05080e] border border-white/[0.04] text-center">
                  <span className="text-[8px] text-slate-500 uppercase block">Hunger</span>
                  <span className="text-white font-medium">{activeCheckIn.hungerRating || 3}/5</span>
                </div>
              </div>
            </div>

            {/* Check-in Photos Gallery */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase text-slate-500 font-medium block">
                Physique Photos ({activeCheckIn.photos.length} angles)
              </span>

              <div className="grid grid-cols-3 gap-2">
                {activeCheckIn.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-[3/4] max-h-48 rounded-lg overflow-hidden bg-black border border-white/[0.07] group cursor-pointer"
                    onClick={() => setActiveLightboxPhoto({ url: photo.url, title: `${photo.angle.toUpperCase()} View`, date: activeCheckIn.date })}
                  >
                    <img
                      src={photo.url}
                      alt={`Photo ${photo.angle}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[9px] uppercase">
                      {photo.angle}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Circumference Measurements */}
            {activeCheckIn.measurements && (
              <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-white/[0.05] text-center font-mono">
                <div className="p-1 rounded bg-[#05080e] border border-white/[0.04]">
                  <span className="text-[8px] text-slate-500 uppercase block">Waist</span>
                  <span className="text-xs font-medium text-white">{activeCheckIn.measurements.waistCm || '—'} cm</span>
                </div>
                <div className="p-1 rounded bg-[#05080e] border border-white/[0.04]">
                  <span className="text-[8px] text-slate-500 uppercase block">Chest</span>
                  <span className="text-xs font-medium text-white">{activeCheckIn.measurements.chestCm || '—'} cm</span>
                </div>
                <div className="p-1 rounded bg-[#05080e] border border-white/[0.04]">
                  <span className="text-[8px] text-slate-500 uppercase block">Arms</span>
                  <span className="text-xs font-medium text-white">{activeCheckIn.measurements.armsCm || '—'} cm</span>
                </div>
                <div className="p-1 rounded bg-[#05080e] border border-white/[0.04]">
                  <span className="text-[8px] text-slate-500 uppercase block">Hips</span>
                  <span className="text-xs font-medium text-white">{activeCheckIn.measurements.hipsCm || '—'} cm</span>
                </div>
              </div>
            )}

            {/* Coach Feedback Note */}
            <div className="pt-2 border-t border-white/[0.05] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
                  Coach Feedback & Review
                </span>
                <button
                  type="button"
                  onClick={() => handleSaveFeedback(activeCheckIn.id)}
                  disabled={isSavingFeedback}
                  className="px-2.5 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-[10px] font-medium text-slate-200 hover:text-white cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSavingFeedback ? 'Saving...' : 'Save Feedback'}
                </button>
              </div>

              <textarea
                rows={2}
                value={feedbackDraft[activeCheckIn.id] ?? activeCheckIn.coachFeedback ?? ''}
                onChange={(e) => setFeedbackDraft({ ...feedbackDraft, [activeCheckIn.id]: e.target.value })}
                placeholder="Give constructive feedback on this week's progress..."
                className="w-full p-1.5 rounded-lg bg-black border border-white/[0.06] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition-colors leading-relaxed font-sans resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveLightboxPhoto(null);
          }}
        >
          <div 
            className="relative max-w-lg max-h-[85vh] rounded-xl overflow-hidden bg-black border border-white/20 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={activeLightboxPhoto.url} alt={activeLightboxPhoto.title} className="max-w-full max-h-[75vh] object-contain mx-auto rounded" />
            <div className="flex items-center justify-between mt-2 px-1 text-xs text-slate-300 font-mono">
              <span>{activeLightboxPhoto.title}</span>
              <span>{activeLightboxPhoto.date}</span>
            </div>
          </div>
        </div>
      )}

      {/* Photo Comparison Split Modal */}
      <PhotoComparisonModal
        client={client}
        checkIns={checkIns}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};
