'use client';

import React, { useState, useRef } from 'react';
import { Exercise } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { sanitizeUrl } from '@/lib/sanitizer';

interface ExerciseVideoModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  exercise,
  isOpen,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  if (!exercise) return null;

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // If videoUrl is a YouTube link, extract embed or render fallback video
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${videoIdMatch[1]}?autoplay=1&rel=0`;
      }
    }
    return null;
  };

  const embedUrl = getEmbedUrl(exercise.videoUrl);
  const isDirectVideo = exercise.videoUrl && (exercise.videoUrl.endsWith('.mp4') || exercise.videoUrl.endsWith('.webm') || exercise.videoUrl.includes('commondatastorage'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div>
          <h3 className="text-base font-bold text-white tracking-tight leading-none">
            {exercise.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
            <span>{exercise.targetMuscle}</span>
            <span>&bull;</span>
            <span>{exercise.equipment}</span>
            <span>&bull;</span>
            <span className="text-cyan-400">{exercise.category}</span>
          </div>
        </div>
      }
    >
      <div className="space-y-3.5 p-1 select-none">
        {/* Video Player Box */}
        <div className="rounded-xl overflow-hidden bg-black border border-white/10 relative shadow-2xl aspect-video flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={exercise.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : isDirectVideo ? (
            <div className="w-full h-full relative">
              <video
                ref={videoRef}
                src={exercise.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              {/* Floating Speed Control */}
              <div className="absolute top-2 right-2 flex items-center gap-1 p-1 rounded-md bg-[#090d14]/90 border border-white/15 shadow">
                <span className="text-[10px] font-mono text-slate-400 mr-1">Speed:</span>
                {[0.5, 0.75, 1.0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleSpeedChange(rate)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      playbackSpeed === rate
                        ? 'bg-cyan-500 text-black'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-2">
              <p className="text-xs font-semibold text-slate-300">
                Direct video guide
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {exercise.videoUrl || 'Standard exercise movement pattern'}
              </p>
              {exercise.videoUrl && sanitizeUrl(exercise.videoUrl) && (
                <a
                  href={sanitizeUrl(exercise.videoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                >
                  Open External Source
                </a>
              )}
            </div>
          )}
        </div>

        {/* Coaching Cues & Key Rules */}
        <div className="p-3 rounded-xl bg-[#05080e] border border-white/[0.06] space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
            Key Form Cue
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {exercise.executionCue || 'Maintain strict controlled tempo with full range of motion.'}
          </p>

          {exercise.alternativeExercise && (
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                Alternative (Badeel):
              </span>
              <span className="text-white font-semibold font-mono">
                {exercise.alternativeExercise}
              </span>
            </div>
          )}
        </div>

        {/* Form Checklist */}
        {exercise.tips && exercise.tips.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Form Checklist
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {exercise.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-slate-200 font-mono"
                >
                  &bull; {tip}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
