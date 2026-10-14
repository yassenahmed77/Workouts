'use client';

import React from 'react';
import { CheckInPhotoAngle, CheckInPhoto } from '@/types';

export interface TimelinePhotoItem extends CheckInPhoto {
  checkInDate: string;
  weightKg?: number;
}

interface PhysiqueTimelineSectionProps {
  photos: TimelinePhotoItem[];
  allPhotosCount: number;
  selectedFilter: 'all' | CheckInPhotoAngle;
  onFilterChange: (filter: 'all' | CheckInPhotoAngle) => void;
  onOpenAllPhotosModal: () => void;
  onPhotoClick: (photo: TimelinePhotoItem) => void;
  // Upload controls
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  photoAngle: CheckInPhotoAngle;
  onAngleChange: (angle: CheckInPhotoAngle) => void;
  photoPreview: string | null;
  isUploading: boolean;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSavePhoto: () => void;
  onDiscardPreview: () => void;
  currentCheckInDate: string;
}

export const PhysiqueTimelineSection: React.FC<PhysiqueTimelineSectionProps> = React.memo(({
  photos,
  allPhotosCount,
  selectedFilter,
  onFilterChange,
  onOpenAllPhotosModal,
  onPhotoClick,
  fileInputRef,
  photoAngle,
  onAngleChange,
  photoPreview,
  isUploading,
  onPhotoSelect,
  onSavePhoto,
  onDiscardPreview,
  currentCheckInDate
}) => {
  return (
    <div className="gym-card space-y-3">
      {/* Centered Header */}
      <div className="space-y-2 pb-2 border-b border-[var(--card-border)]">
        <div className="text-center">
          <span className="gym-label-mono block text-[var(--main-color)]">
            PHYSIQUE TIMELINE
          </span>
          <h3 className="gym-heading-card mt-0.5">
            Transformation Photos
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
          {/* Angle Filter Buttons */}
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            {(['all', 'front', 'side', 'back'] as const).map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => onFilterChange(angle)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                  selectedFilter === angle
                    ? 'bg-[var(--main-color)] text-white font-bold'
                    : 'text-zinc-400 hover:text-white bg-[var(--card-subtle-bg)] border border-[var(--card-border)]'
                }`}
              >
                {angle}
              </button>
            ))}
          </div>

          {/* View All Photos History Button */}
          {allPhotosCount > 0 && (
            <button
              type="button"
              onClick={onOpenAllPhotosModal}
              className="gym-btn-secondary gym-btn-sm mx-auto sm:mx-0"
            >
              View All Photos ({allPhotosCount})
            </button>
          )}
        </div>
      </div>

      {/* Upload Drop Strip */}
      <div className="p-2.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="gym-label-mono whitespace-nowrap">ANGLE</span>
          <div className="flex items-center gap-1">
            {(['front', 'side', 'back'] as const).map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => onAngleChange(angle)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                  photoAngle === angle
                    ? 'bg-zinc-200 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {angle}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoSelect}
            className="hidden"
            id="transformation-photo-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="gym-btn-secondary text-xs"
          >
            Select Photo
          </button>
          {photoPreview && (
            <button
              type="button"
              disabled={isUploading}
              onClick={onSavePhoto}
              className="gym-btn-primary text-xs"
            >
              {isUploading ? 'Uploading...' : 'Save to Timeline'}
            </button>
          )}
        </div>
      </div>

      {/* Upload Preview if selected */}
      {photoPreview && (
        <div className="p-2 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--main-color)]/30 flex items-center gap-3">
          <div className="w-16 h-20 rounded bg-black overflow-hidden flex-shrink-0 border border-white/[0.1]">
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="gym-label-mono block text-[var(--main-color)]">Ready to Upload</span>
            <p className="gym-subtext text-xs text-white font-mono mt-0.5">
              Angle: {photoAngle.toUpperCase()} • Date: {currentCheckInDate}
            </p>
            <button
              type="button"
              onClick={onDiscardPreview}
              className="gym-label-mono text-zinc-500 hover:text-red-400 mt-1 cursor-pointer block"
            >
              Discard Photo
            </button>
          </div>
        </div>
      )}

      {/* Photos Grid Timeline (With clear date stamped next to each photo) */}
      {photos.length === 0 ? (
        <div className="py-6 text-center rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
          <span className="gym-label-mono block text-zinc-500">NO PHOTOS RECORDED YET</span>
          <p className="gym-subtext text-xs text-zinc-400 mt-1">
            Upload your physique check-in photos to build your visual timeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div 
              key={photo.id}
              className="rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] overflow-hidden flex flex-col group cursor-pointer"
              onClick={() => onPhotoClick(photo)}
            >
              <div className="relative w-full h-36 bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.angle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8.5px] font-mono text-white font-bold uppercase">
                  {photo.angle}
                </span>
              </div>
              {/* Dedicated Photo Metadata Row: Date and Weight clearly visible */}
              <div className="p-1.5 px-2 flex items-center justify-between text-[10px] font-mono bg-[var(--card-bg)] border-t border-[var(--card-border)]">
                <span className="text-zinc-200 font-bold">{photo.checkInDate}</span>
                <span className="text-[var(--main-color)] font-bold">{photo.weightKg}k</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

PhysiqueTimelineSection.displayName = 'PhysiqueTimelineSection';
