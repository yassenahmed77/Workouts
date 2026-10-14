'use client';
import React from 'react';
export const PhotoLightboxModal = React.memo(({ photo, onClose }) => {
    if (!photo)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div className="max-w-md w-full rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-3 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--card-subtle-bg)]">
          <div>
            <span className="gym-label-mono text-[var(--main-color)]">{photo.angle.toUpperCase()} VIEW</span>
            <h4 className="gym-heading-card mt-0.5">Logged: {photo.date}</h4>
          </div>
          <button type="button" onClick={onClose} className="gym-btn-ghost text-xs text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="relative aspect-[3/4] bg-black">
          <img src={photo.url} alt="Enlarged" className="w-full h-full object-contain"/>
        </div>
        <div className="p-2.5 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">Date: <strong className="text-white">{photo.date}</strong></span>
          {photo.weightKg && (<span className="text-zinc-400">Weight: <strong className="text-[var(--main-color)]">{photo.weightKg} kg</strong></span>)}
        </div>
      </div>
    </div>);
});
PhotoLightboxModal.displayName = 'PhotoLightboxModal';
