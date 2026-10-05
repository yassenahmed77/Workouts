'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FormCheckVideo, User } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { buildWhatsAppFormCheckUrl, formatWhatsAppPhone } from '@/lib/whatsapp';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Dumbbell, 
  MessageCircle, 
  ExternalLink,
  Edit3,
  Phone
} from 'lucide-react';

interface FormCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: FormCheckVideo | null;
  client: User;
}

export const FormCheckModal: React.FC<FormCheckModalProps> = ({
  isOpen,
  onClose,
  video,
  client
}) => {
  const { updateFormCheckVideo, updateUserProfile } = useGym();
  const { showToast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [coachNotes, setCoachNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [phoneInput, setPhoneInput] = useState(client.phone || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useEffect(() => {
    if (video) {
      setCoachNotes(video.coachFeedback || '');
      setPlaybackRate(1.0);
      if (videoRef.current) {
        videoRef.current.playbackRate = 1.0;
      }
    }
  }, [video]);

  useEffect(() => {
    setPhoneInput(client.phone || '');
  }, [client.phone]);

  if (!video) return null;

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await updateFormCheckVideo(video.id, {
        coachFeedback: coachNotes,
        status: 'reviewed',
        reviewedAt: new Date().toISOString()
      });
      showToast('Form review notes saved', 'success');
    } catch {
      showToast('Failed to save notes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = video.status === 'pending' ? 'reviewed' : 'pending';
    try {
      await updateFormCheckVideo(video.id, {
        status: nextStatus,
        reviewedAt: nextStatus === 'reviewed' ? new Date().toISOString() : undefined
      });
      showToast(`Status marked as ${nextStatus}`, 'info');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return;
    try {
      await updateUserProfile(client.id, { phone: phoneInput.trim() });
      showToast('Client phone updated', 'success');
      setIsEditingPhone(false);
    } catch {
      showToast('Failed to update phone', 'error');
    }
  };

  // Format date nicely
  const displayDate = (() => {
    try {
      const d = new Date(video.recordedAt);
      if (isNaN(d.getTime())) return video.recordedAt;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return video.recordedAt;
    }
  })();

  const whatsappUrl = buildWhatsAppFormCheckUrl({
    phone: client.phone,
    clientName: client.name,
    exerciseName: video.exerciseName,
    recordedAt: displayDate,
    setDetails: video.setDetails,
    coachFeedback: coachNotes
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">
              {video.exerciseName}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Technique &amp; Form Check &bull; {client.name}
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-4 p-1">
        {/* 1. Video Player Container with Glass Controls */}
        <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            playsInline
            className="w-full max-h-[380px] object-contain bg-black"
          />

          {/* Slow-Motion Speed Floating Control Ribbon */}
          <div className="absolute top-3 right-3 flex items-center gap-1 p-1 rounded-lg bg-[#090d14]/90 backdrop-blur-md border border-white/15 shadow-lg">
            <Gauge className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-0.5" />
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold mr-1">
              Speed:
            </span>
            {[0.25, 0.5, 0.75, 1.0].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleSpeedChange(rate)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* 2. Metadata Bar: Exercise Name, Date, Set info, Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-lg bg-[#05080e] border border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Recorded Date
            </span>
            <span className="text-xs font-semibold text-white font-mono mt-0.5 block truncate">
              {displayDate}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#05080e] border border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Sets &amp; Load
            </span>
            <span className="text-xs font-bold text-white font-mono mt-0.5 block truncate">
              {video.setDetails || 'Standard Set'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#05080e] border border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Target Muscle
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">
              {video.targetMuscle || 'Compound'}
            </span>
          </div>

          <div 
            onClick={handleToggleStatus}
            className="p-2.5 rounded-lg bg-[#05080e] border border-white/[0.06] hover:border-white/20 transition-colors cursor-pointer group"
            title="Click to toggle review status"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold group-hover:text-slate-200">
              Status (toggle)
            </span>
            <span
              className={`text-xs font-bold mt-0.5 inline-flex items-center gap-1 ${
                video.status === 'reviewed' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${video.status === 'reviewed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {video.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
            </span>
          </div>
        </div>

        {/* 3. Athlete Notes */}
        {video.notes && (
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.07] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Athlete Notes &amp; Concerns:
            </span>
            <p className="text-xs text-slate-200 italic font-sans leading-relaxed">
              &ldquo;{video.notes}&rdquo;
            </p>
          </div>
        )}

        {/* 4. Coach Technique Notes Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono uppercase tracking-wider text-cyan-400/90 font-bold">
              Coach Form Feedback &amp; Execution Cues:
            </label>
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="px-2.5 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/10 text-xs font-semibold text-slate-200 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Feedback'}
            </button>
          </div>
          <textarea
            rows={3}
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            placeholder="e.g. Good depth! Next time slow down the eccentric descent and keep your chest upright..."
            className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed font-sans"
          />
        </div>

        {/* 5. Direct WhatsApp Reply Action Section */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-xs font-bold text-white">
                Send Direct Form Review via WhatsApp
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <span>Client Phone:</span>
              {isEditingPhone ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+201012345678"
                    className="w-32 px-1.5 py-0.5 rounded bg-black border border-white/20 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSavePhone}
                    className="px-1.5 py-0.5 rounded bg-white/[0.1] text-white text-[10px] font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingPhone(true)}
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer underline decoration-dotted"
                  title="Click to edit phone number"
                >
                  <span>{client.phone || 'No phone set (click to add)'}</span>
                  <Edit3 className="w-3 h-3 text-slate-500" />
                </div>
              )}
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // Automatically mark reviewed when coach replies on WhatsApp
              if (video.status === 'pending') {
                updateFormCheckVideo(video.id, {
                  status: 'reviewed',
                  reviewedAt: new Date().toISOString()
                });
              }
            }}
            className="py-2 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-emerald-500/20 active:scale-95 whitespace-nowrap flex-shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-black text-[#25D366]" />
            <span>Open WhatsApp Reply</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </Modal>
  );
};
