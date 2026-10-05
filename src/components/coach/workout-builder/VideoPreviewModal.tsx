'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { sanitizeUrl } from '@/lib/sanitizer';

interface VideoPreviewModalProps {
  videoUrl: string | null;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  videoUrl,
  onClose
}) => {
  if (!videoUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#090d14] border border-[#16202e] rounded-2xl p-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#141a24]">
          <h3 className="text-xs font-bold text-white">Video Demonstration</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-300 font-mono break-all bg-[#05080e] p-2.5 rounded-lg border border-[#16202e]">
            {videoUrl}
          </p>
          <div className="flex justify-end gap-2">
            {sanitizeUrl(videoUrl) ? (
              <a
                href={sanitizeUrl(videoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#080c14] bg-white hover:bg-slate-100 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Link ↗</span>
              </a>
            ) : (
              <span className="text-xs text-rose-400 font-mono py-1.5">
                Invalid or unsafe URL
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
