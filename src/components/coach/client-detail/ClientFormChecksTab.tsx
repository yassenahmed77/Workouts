'use client';

import React, { useState, useMemo } from 'react';
import { User, FormCheckVideo } from '@/types';
import { useGym } from '@/context/GymContext';
import { FormCheckVideoCard } from './FormCheckVideoCard';
import { RecordFormCheckModal } from './RecordFormCheckModal';
import { FormCheckModal } from './FormCheckModal';
import { buildWhatsAppFormCheckUrl } from '@/lib/whatsapp';
import { 
  Video, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Play, 
  MessageCircle,
  Dumbbell
} from 'lucide-react';

interface ClientFormChecksTabProps {
  client: User;
}

export const ClientFormChecksTab: React.FC<ClientFormChecksTabProps> = ({ client }) => {
  const { getFormCheckVideosForUser, updateFormCheckVideo } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [selectedVideo, setSelectedVideo] = useState<FormCheckVideo | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const allVideos = getFormCheckVideosForUser(client.id);

  const filteredVideos = useMemo(() => {
    return allVideos.filter((v) => {
      const matchQuery =
        v.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.notes && v.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.targetMuscle && v.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [allVideos, searchQuery, statusFilter]);

  const pendingCount = allVideos.filter((v) => v.status === 'pending').length;
  const reviewedCount = allVideos.filter((v) => v.status === 'reviewed').length;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent, video: FormCheckVideo) => {
    e.stopPropagation();
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

  return (
    <div className="space-y-3 select-none">
      {/* 1. Summary Bar & Controls */}
      <div className="p-3 rounded-xl bg-[#090d14] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Video className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Technique Vault &bull; Form Check Archive
              </h2>
              <span className="text-xs text-slate-400 font-mono">({allVideos.length})</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {pendingCount} Pending Coach Review &bull; {reviewedCount} Completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center p-0.5 rounded-lg bg-black border border-white/10 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({allVideos.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-2 py-1 rounded-md transition-colors ${
                statusFilter === 'pending' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('reviewed')}
              className={`px-2 py-1 rounded-md transition-colors ${
                statusFilter === 'reviewed' ? 'bg-emerald-500 text-black font-bold' : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              Reviewed ({reviewedCount})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsRecordModalOpen(true)}
            className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-black font-bold text-xs inline-flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Record / Upload</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by exercise name (e.g. Squat, Deadlift, Bench Press)..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090d14] border border-white/[0.07] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="py-12 text-center rounded-xl bg-[#090d14] border border-white/[0.07] space-y-2">
          <Dumbbell className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-200">No form check videos found</p>
          <p className="text-[11px] text-slate-400 font-mono">
            {searchQuery ? 'Try matching another exercise keyword.' : 'Upload or film your first technique check.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredVideos.map((video) => {
            const formattedDate = formatDate(video.recordedAt);
            const isReviewed = video.status === 'reviewed';

            return (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="p-3 rounded-xl bg-[#090d14] hover:bg-white/[0.03] border border-white/[0.07] hover:border-white/15 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-20 h-16 rounded-lg bg-black border border-white/15 overflow-hidden flex-shrink-0 relative group/thumb shadow">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.exerciseName}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
                        <Video className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                      <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow">
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {video.exerciseName}
                      </h4>
                      {video.targetMuscle && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300 font-mono border border-white/10">
                          {video.targetMuscle}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                          isReviewed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {isReviewed ? 'Reviewed' : 'Pending Review'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                      <span>{formattedDate}</span>
                      {video.setDetails && (
                        <>
                          <span>&bull;</span>
                          <span className="text-slate-200 font-semibold">{video.setDetails}</span>
                        </>
                      )}
                    </div>

                    {video.notes && (
                      <p className="text-[11px] text-slate-300 italic line-clamp-2 mt-1">
                        &ldquo;{video.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Bar with Coach WhatsApp Action */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Click to review in slow-mo
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleWhatsAppClick(e, video)}
                    className="py-1 px-3 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/30 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                    title="Send instant critique via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Reply on WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <FormCheckModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
        client={client}
      />

      {/* Record Modal */}
      <RecordFormCheckModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        client={client}
      />
    </div>
  );
};
