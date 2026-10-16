'use client';

import React from 'react';

/**
 * ClientDetailHeader (Presentation Layer - Zero Decorative Icons)
 *
 * Ultra-slim executive command bar displaying client identity,
 * real-time telemetry capsule, status/warning badges, and quick actions.
 */
export const ClientDetailHeader = ({
  client,
  subDaysLeft,
  whatsappUrl,
  onBack,
  onOpenNotes,
  onSwitchToTrainee
}) => {
  if (!client) return null;

  const hasNotes = Boolean(client.notes && client.notes.trim().length > 0);
  const isExpiringSoon = subDaysLeft !== null && subDaysLeft <= 7;
  const isExpired = subDaysLeft !== null && subDaysLeft <= 0;

  return (
    <div className="flex items-center justify-between fluid-gap-controls fluid-card-p rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex-shrink-0 select-none">
      {/* 1. Left: Back Button + Client Identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="gym-btn-secondary gym-btn-sm"
          title="Back to client list"
        >
          <span className="font-mono text-xs mr-0.5">&larr;</span>
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 min-w-0">
          {client.avatarUrl ? (
            <img
              src={client.avatarUrl}
              alt={client.name}
              className="w-6 h-6 rounded-md object-cover border border-white/10 flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
              {client.avatarText || client.name.substring(0, 2).toUpperCase()}
            </div>
          )}

          <h2 className="gym-heading-card truncate" title={client.name}>
            {client.name}
          </h2>

          {/* Status Badge */}
          <span className="gym-delta-neutral text-[10px] hidden xs:inline-flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                client.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="capitalize">{client.status}</span>
          </span>

          {/* Red Flag / Critical Medical Injury Only (No routine notes like Photos Due) */}
          {client.attentionNote && (client.attentionNote.type === 'injury' || client.attentionNote.type === 'critical') && (
            <span
              className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border bg-rose-500/10 text-rose-400 border-rose-500/20"
              title={client.attentionNote.label}
            >
              <span className="truncate max-w-[140px]">
                [ATTN] {client.attentionNote.label}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Center: The Unified Telemetry Capsule (Linear-Grade Segmented Capsule) */}
      <div className="hidden md:flex items-center rounded-lg bg-[var(--bg-main)] border border-[var(--card-border)] divide-x divide-[var(--card-border)] text-xs font-mono overflow-hidden shadow-inner">
        {/* Height */}
        {client.heightCm > 0 && (
          <div className="px-2.5 py-1 flex items-center gap-1">
            <span className="text-slate-500 text-[10px]">H:</span>
            <span className="text-slate-200 font-semibold">{client.heightCm}cm</span>
          </div>
        )}

        {/* Current Weight */}
        <div className="px-2.5 py-1 flex items-center gap-1">
          <span className="text-slate-500 text-[10px]">W:</span>
          <span className="gym-num text-white">{client.weightKg}kg</span>
        </div>

        {/* Target Goal Weight */}
        {client.targetWeightKg && client.targetWeightKg !== client.weightKg && (
          <div className="px-2.5 py-1 flex items-center gap-1">
            <span className="text-slate-500 text-[10px]">Goal:</span>
            <span className="text-slate-200 font-semibold">{client.targetWeightKg}kg</span>
          </div>
        )}

        {/* Demographics (Age / Gender) */}
        {(client.age || client.gender) && (
          <div className="px-2.5 py-1 text-slate-400 flex items-center gap-1">
            {client.age && <span>{client.age}y</span>}
            {client.age && client.gender && <span className="text-slate-600">•</span>}
            {client.gender && <span>{client.gender === 'Female' ? 'F' : 'M'}</span>}
          </div>
        )}

        {/* Primary Goal */}
        {client.goal && (
          <div
            className="px-2.5 py-1 text-slate-300 font-sans text-xs truncate max-w-[130px]"
            title={client.goal}
          >
            {client.goal.replace(' & Conditioning', '').replace(' / Muscle Gain', '')}
          </div>
        )}

        {/* Subscription Days Left */}
        {client.subscription && (
          <div className="px-2.5 py-1 flex items-center gap-1.5">
            <span className="text-slate-300 truncate max-w-[110px]">
              {client.subscription.planType?.replace(' Coaching', '') || 'VIP'}
            </span>
            {subDaysLeft !== null && (
              <span
                className={`text-[10px] font-bold ${
                  isExpired
                    ? 'text-rose-400'
                    : isExpiringSoon
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {isExpired ? 'Expired' : `${subDaysLeft}d`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Right: Quick Action Buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gym-btn-secondary gym-btn-sm"
            title="Chat with client on WhatsApp"
          >
            WhatsApp
          </a>
        )}

        <button
          type="button"
          onClick={onOpenNotes}
          className="gym-btn-secondary gym-btn-sm relative"
          title="Coach Directives & Notes"
        >
          <span>Notes</span>
          {hasNotes && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)] ml-1.5 inline-block" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onSwitchToTrainee(client.id)}
          className="gym-btn-primary gym-btn-sm"
          title="Preview exact mobile view for athlete"
        >
          Athlete View
        </button>
      </div>
    </div>
  );
};
