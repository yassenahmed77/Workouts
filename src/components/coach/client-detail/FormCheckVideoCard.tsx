'use client';

import React, { useState } from 'react';
import { User, FormCheckVideo } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { buildWhatsAppFormCheckUrl, formatWhatsAppPhone } from '@/lib/whatsapp';
import { FormCheckModal } from './FormCheckModal';
import { RecordFormCheckModal } from './RecordFormCheckModal';
import { 
  Play, 
  Video, 
  Plus, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Dumbbell, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface FormCheckVideoCardProps {
  client: User;
  onViewAll?: () => void;
  maxItems?: number;
  compact?: boolean;
}

export const FormCheckVideoCard: React.FC<FormCheckVideoCardProps> = ({
  client,
  onViewAll,
  maxItems = 3,
  compact = false
}) => {
  const { getFormCheckVideosForUser, updateFormCheckVideo, updateUserProfile } = useGym();
  const { showToast } = useToast();

  const [selectedVideo, setSelectedVideo] = useState<FormCheckVideo | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [phonePromptOpen, setPhonePromptOpen] = useState(false);
  const [tempPhone, setTempPhone] = useState(client.phone || '');

  const athleteVideos = getFormCheckVideosForUser(client.id);
  const pendingCount = athleteVideos.filter((v) => v.status === 'pending').length;
  const displayedVideos = athleteVideos.slice(0, maxItems);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent, video: FormCheckVideo) => {
    e.stopPropagation();
    if (!client.phone) {
      setPhonePromptOpen(true);
      return;
    }

    // Auto update status to reviewed when coach clicks to reply
    if (video.status === 'pending') {
      updateFormCheckVideo(video.id, {
        status: 'reviewed',
        reviewedAt: new Date().toISOString()
      });
    }

    const url = buildWhatsAppFormCheckUrl({
      phone: client.phone,
      clientName: client.name,
      exerciseName: video.exerciseName,
      recordedAt: formatDate(video.recordedAt),
      setDetails: video.setDetails,
      coachFeedback: video.coachFeedback
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSavePromptPhone = async () => {
    if (!tempPhone.trim()) return;
    try {
      await updateUserProfile(client.id, { phone: tempPhone.trim() });
      showToast('Client phone updated', 'success');
      setPhonePromptOpen(false);
    } catch {
      showToast('Failed to update phone', 'error');
    }
  };

  return (
    <>
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-2 select-none shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Technique Review &bull; Form Checks
              </span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none mt-0.5 truncate">
              Exercise Performance &amp; Lift Videos
            </h3>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onViewAll && athleteVideos.length > maxItems && (
              <button
                type="button"
                onClick={onViewAll}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-[11px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                All ({athleteVideos.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRecordModalOpen(true)}
              className="py-1 px-2 rounded-md bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Record or upload exercise execution video"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Record / Upload</span>
            </button>
          </div>
        </div>

        {/* Videos List / Empty State */}
        {athleteVideos.length === 0 ? (
          <div className="py-4 px-3 text-center rounded-lg bg-[#05080e] border border-white/[0.06] space-y-2">
            <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <Video className="w-4 h-4 text-cyan-400/80" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                No form check videos uploaded yet
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-xs mx-auto">
                Trainees can record their lifts during training to check execution, squat depth, and spinal alignment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Upload First Lift Video</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {displayedVideos.map((video) => {
              const formattedDate = formatDate(video.recordedAt);
              const isReviewed = video.status === 'reviewed';

              return (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="p-2 rounded-lg bg-[#05080e] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Thumbnail with Play Icon */}
                    <div className="w-14 h-11 sm:w-16 sm:h-12 rounded-md bg-black border border-white/15 overflow-hidden flex-shrink-0 relative group/thumb shadow-sm">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.exerciseName}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
                          <Video className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <div className="w-6 h-6 rounded-full bg-white/90 text-black flex items-center justify-center shadow">
                          <Play className="w-3 h-3 fill-black ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Metadata: Exercise Name, Date, Set info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {video.exerciseName}
                        </span>
                        {video.targetMuscle && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300 font-mono border border-white/10 flex-shrink-0">
                            {video.targetMuscle}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border flex-shrink-0 ${
                            isReviewed
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {isReviewed ? 'Reviewed' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formattedDate}</span>
                        </span>
                        {video.setDetails && (
                          <>
                            <span>&bull;</span>
                            <span className="text-slate-300 font-semibold truncate">
                              {video.setDetails}
                            </span>
                          </>
                        )}
                      </div>

                      {video.notes && (
                        <p className="text-[10px] text-slate-400 italic truncate mt-0.5 max-w-xs sm:max-w-md">
                          &ldquo;{video.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Coach WhatsApp Quick Reply Action Button */}
                  <div className="flex items-center gap-2 flex-shrink-0 justify-end">
                    <button
                      type="button"
                      onClick={(e) => handleWhatsAppClick(e, video)}
                      className="py-1 px-2.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/30 hover:border-[#25D366] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                      title={`Open WhatsApp chat with ${client.name} to reply on this form check`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span className="whitespace-nowrap">Reply on WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Check Playback & Critique Modal */}
      <FormCheckModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
        client={client}
      />

      {/* Record / Upload Video Modal */}
      <RecordFormCheckModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        client={client}
      />

      {/* Phone Number Prompt Dialog (if client.phone is empty) */}
      {phonePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="p-4 rounded-xl bg-[#090d14] border border-white/20 w-full max-w-sm space-y-3 text-white shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400">
              <MessageCircle className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white">Enter Client WhatsApp Number</h4>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Enter {client.name}&apos;s mobile number to send direct technique reviews on WhatsApp.
            </p>
            <input
              type="text"
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value)}
              placeholder="e.g. 01012345678 or +201012345678"
              className="w-full p-2 rounded-lg bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPhonePromptOpen(false)}
                className="px-3 py-1 rounded-md text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePromptPhone}
                className="px-3 py-1 rounded-md bg-[#25D366] text-black font-bold text-xs shadow"
              >
                Save &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
