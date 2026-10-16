'use client';

import React from 'react';

/**
 * CheckInPulseTile (Clean Architecture - Atomic Mobile Widget)
 *
 * Brand Identity & Unified Luxury Palette:
 * - Dynamic Telemetry from checkInService (Zero hardcoded mockups)
 * - Trainee self-initiated / unreviewed submission flags
 * - Real Scale weight, Photos count, and Tape girth status
 * - Proportional typography hierarchy
 * - Zero decorative icons (Rule 2 compliant).
 */
export const CheckInPulseTile = ({
  client,
  telemetry,
  onNavigateSubTab
}) => {
  const statusLabel = telemetry?.statusLabel || (client?.lastCheckInDate ? 'UP TO DATE ✓' : 'FRIDAY DUE');
  const pillClass = telemetry?.pillClass || 'bg-white/[0.06] text-slate-300 border-white/10';
  const headline = telemetry?.headline || (client?.lastCheckInDate ? `Last: ${client.lastCheckInDate}` : 'Friday Due');
  const subline = telemetry?.subline || 'Weekly progress audit';
  const hasNewSubmission = telemetry?.hasNewSubmission;

  const scale = telemetry?.pillars?.scale || {
    label: 'SCALE',
    value: client?.weightKg ? `${client.weightKg} kg` : '—',
    detail: 'Weight',
    isCompleted: Boolean(client?.weightKg)
  };

  const photos = telemetry?.pillars?.photos || {
    label: 'PHOTOS',
    value: '0 Photos',
    detail: 'Visual',
    isCompleted: false
  };

  const inBody = telemetry?.pillars?.inBody || telemetry?.pillars?.tape || {
    label: 'INBODY',
    value: 'Pending',
    detail: 'Scan',
    isCompleted: false
  };

  return (
    <div
      onClick={() => onNavigateSubTab('checkins')}
      className="bg-[var(--card-bg)]/90 backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-2 min-[390px]:p-2.5 flex flex-col justify-between shadow-md cursor-pointer transition-all active:scale-[0.98] group h-full select-none"
      title="Click to view weekly check-in photos & InBody scans"
    >
      {/* 1. Header: Label + Action / Status Badge */}
      <div className="flex items-center justify-between gap-1 text-[8.5px] min-[390px]:text-[9px] font-mono pb-1 border-b border-white/[0.05] flex-shrink-0">
        <span className="font-semibold text-slate-400 tracking-wider uppercase">CHECK-IN</span>
        <span className={`px-1.5 py-0.5 rounded-md text-[7.5px] min-[390px]:text-[8px] font-bold whitespace-nowrap border ${pillClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* 2. Hero Headline Date */}
      <div className="my-0.5 min-[390px]:my-1 flex flex-col gap-0.5 flex-shrink-0 font-mono sm:items-center sm:text-center">
        <div className="flex items-baseline justify-between sm:justify-center w-full">
          <span className="text-sm min-[390px]:text-base font-bold text-white tracking-tight truncate sm:text-center">
            {headline}
          </span>
        </div>
        <span className={`text-[8px] min-[390px]:text-[8.5px] font-medium truncate sm:text-center ${
          hasNewSubmission ? 'text-[var(--main-color)] font-semibold' : 'text-slate-400'
        }`}>
          {subline}
        </span>
      </div>

      {/* 3. 3 Protocol Pillars - Real Telemetry (Scale, Photos, InBody) */}
      <div className="grid grid-cols-3 gap-0.5 min-[390px]:gap-1 flex-1 min-h-0 my-0.5 min-[390px]:my-1 items-stretch">
        {/* Scale */}
        <div className={`border rounded-lg min-[390px]:rounded-xl p-1 min-[390px]:p-1.5 flex flex-col items-center justify-between text-center transition-colors ${
          scale.isCompleted ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.05]'
        }`}>
          <span className="text-[7px] min-[390px]:text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
            {scale.label}
          </span>
          <span className={`text-[11px] min-[390px]:text-xs font-mono font-bold block my-auto ${
            scale.isCompleted ? 'text-emerald-400' : 'text-white'
          }`}>
            {scale.value}
          </span>
          <span className="text-[6.5px] min-[390px]:text-[7px] font-mono text-slate-400 block uppercase">
            {scale.detail}
          </span>
        </div>

        {/* Photos */}
        <div className={`border rounded-lg min-[390px]:rounded-xl p-1 min-[390px]:p-1.5 flex flex-col items-center justify-between text-center transition-colors ${
          photos.isCompleted ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.05]'
        }`}>
          <span className="text-[7px] min-[390px]:text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
            {photos.label}
          </span>
          <span className={`text-[11px] min-[390px]:text-xs font-mono font-bold block my-auto ${
            photos.isCompleted ? 'text-emerald-400' : 'text-white'
          }`}>
            {photos.value}
          </span>
          <span className="text-[6.5px] min-[390px]:text-[7px] font-mono text-slate-400 block uppercase">
            {photos.detail}
          </span>
        </div>

        {/* InBody */}
        <div className={`border rounded-lg min-[390px]:rounded-xl p-1 min-[390px]:p-1.5 flex flex-col items-center justify-between text-center transition-colors ${
          inBody.isCompleted ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.05]'
        }`}>
          <span className="text-[7px] min-[390px]:text-[7.5px] font-mono text-slate-400 block uppercase font-semibold">
            {inBody.label}
          </span>
          <span className={`text-[11px] min-[390px]:text-xs font-mono font-bold block my-auto ${
            inBody.isCompleted ? 'text-emerald-400' : 'text-white'
          }`}>
            {inBody.value}
          </span>
          <span className="text-[6.5px] min-[390px]:text-[7px] font-mono text-slate-400 block uppercase">
            {inBody.detail}
          </span>
        </div>
      </div>

      {/* 4. Bottom Directive (Single Line, No Wrap) */}
      <div className="pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[8px] font-mono text-slate-400 flex-shrink-0">
        <span className="truncate">
          {hasNewSubmission
            ? 'Tap to review new trainee audit'
            : telemetry?.daysUntilDue === 0
            ? 'Due today • Tap to audit'
            : `Next: ${telemetry?.preferredDay || 'Friday'} • Tap to review`}
        </span>
        <span className="text-[var(--main-color)] font-bold ml-1 opacity-80">
          &rarr;
        </span>
      </div>
    </div>
  );
};
