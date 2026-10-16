'use client';

import React, { useEffect } from 'react';
import { Scale, Camera, Activity, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { useGym } from '@/context/GymContext';

/**
 * TraineeCheckInBanner (Athlete Prompt & Real-Time Seen Telemetry)
 *
 * Automatically stamps `seenAt` when rendered on Trainee Dashboard,
 * closing the real-time loop for the Coach Request Inspector (Sent → Seen → Due).
 */
export const TraineeCheckInBanner = ({ onNavigateProfile }) => {
  const { currentUser, updateUserProfile } = useGym();
  const request = currentUser?.pendingCheckInRequest;

  // Auto-stamp seenAt timestamp the moment athlete views their dashboard
  useEffect(() => {
    if (request && request.status === 'pending' && !request.seenAt && currentUser?.id) {
      const todayStr = new Date().toISOString().split('T')[0];
      updateUserProfile(currentUser.id, {
        pendingCheckInRequest: {
          ...request,
          seenAt: todayStr
        }
      });
    }
  }, [request, currentUser?.id, updateUserProfile]);

  if (!request || request.status !== 'pending') {
    return null;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const isImmediate = request.dueDate === 'immediate';
  const isOverdue = !isImmediate && request.dueDate && request.dueDate < todayStr;
  const scope = request.scope || { weight: true, photos: true, inBody: true };

  return (
    <div className="rounded-2xl border border-cyan-500/35 bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-black/60 p-3 sm:p-4 backdrop-blur-md shadow-lg select-none flex-shrink-0 animate-in fade-in slide-in-from-top-2 duration-200 mb-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Indicator + Text */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
              Audit Requested by Coach
            </span>
            <span className="text-zinc-600 font-mono">•</span>
            <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
              isOverdue
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
            }`}>
              {isImmediate ? 'Immediate Audit' : isOverdue ? 'Overdue' : `Due: ${request.dueDate}`}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white tracking-tight">
            Weekly Progress Check-In Pending
          </h4>

          {request.notes && (
            <p className="text-xs text-zinc-300 italic font-sans line-clamp-1">
              "{request.notes}"
            </p>
          )}

          {/* Scope Pills */}
          <div className="flex items-center gap-1.5 pt-1 text-[9.5px] font-mono text-zinc-300">
            <span className="text-zinc-400 uppercase">Scope:</span>
            {scope.weight !== false && (
              <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 flex items-center gap-1">
                <Scale className="w-2.5 h-2.5 text-cyan-400" />
                <span>Scale</span>
              </span>
            )}
            {scope.photos !== false && (
              <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 flex items-center gap-1">
                <Camera className="w-2.5 h-2.5 text-cyan-400" />
                <span>Photos</span>
              </span>
            )}
            {scope.inBody !== false && (
              <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-cyan-400" />
                <span>InBody</span>
              </span>
            )}
          </div>
        </div>

        {/* Right CTA */}
        {onNavigateProfile && (
          <button
            type="button"
            onClick={onNavigateProfile}
            className="gym-btn-primary gym-btn-sm self-start sm:self-center flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer shadow-cyan-500/20"
          >
            <span>Complete Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
