'use client';

import React from 'react';
import { CheckInPhotoAngle } from '@/types';
import { TimelinePhotoItem } from './PhysiqueTimelineSection';

interface AllPhotosArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: TimelinePhotoItem[];
  allPhotosCount: number;
  filter: 'all' | CheckInPhotoAngle;
  onFilterChange: (filter: 'all' | CheckInPhotoAngle) => void;
  onPhotoClick: (photo: TimelinePhotoItem) => void;
}

export const AllPhotosArchiveModal: React.FC<AllPhotosArchiveModalProps> = React.memo(({
  isOpen,
  onClose,
  photos,
  allPhotosCount,
  filter,
  onFilterChange,
  onPhotoClick
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex items-center justify-between gap-3">
          <div>
            <span className="gym-label-mono block text-[var(--main-color)]">TRANSFORMATION ARCHIVE</span>
            <h3 className="gym-heading-card text-base mt-0.5">
              Visual Evolution Timeline ({allPhotosCount} Photos)
            </h3>
            <p className="gym-subtext text-xs text-zinc-400 mt-0.5">
              Complete chronological check-in photo history with exact date stamps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Angle Filter in Modal */}
            <div className="flex items-center gap-1 bg-[var(--card-bg)] p-1 rounded border border-[var(--card-border)]">
              {(['all', 'front', 'side', 'back'] as const).map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => onFilterChange(angle)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                    filter === angle
                      ? 'bg-[var(--main-color)] text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {angle}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="gym-btn-ghost text-xs px-2.5 py-1 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Photos Scrollable Gallery */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {photos.length === 0 ? (
            <div className="py-12 text-center">
              <span className="gym-label-mono text-zinc-500">NO PHOTOS FOUND FOR THIS FILTER</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div 
                  key={photo.id}
                  className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden flex flex-col shadow-sm"
                >
                  <div 
                    className="relative w-full aspect-[3/4] bg-black cursor-pointer overflow-hidden group"
                    onClick={() => onPhotoClick(photo)}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.angle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8.5px] font-mono text-white font-bold uppercase border border-white/10">
                      {photo.angle}
                    </span>
                  </div>

                  {/* Prominent Date & Weight Banner (Chronological Tracking) */}
                  <div className="p-2 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold">{photo.checkInDate}</span>
                      <span className="text-[var(--main-color)] font-bold">{photo.weightKg} kg</span>
                    </div>
                    <span className="gym-label-mono text-[9px] text-zinc-500 block">
                      Angle: {photo.angle.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

AllPhotosArchiveModal.displayName = 'AllPhotosArchiveModal';
