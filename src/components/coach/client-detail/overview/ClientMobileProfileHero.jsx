'use client';

import React from 'react';

/**
 * ClientMobileProfileHero (Floating Native Athlete Profile & Segmented Switcher)
 *
 * Implements modern floating/borderless TikTok & native mobile athlete profile:
 * - Floating directly on the page background (Zero enclosing card box)
 * - Top action bar: [← Clients] on the left, [Notes], [WA], and [Athlete View] on the right
 * - Prominent circular avatar with active status ring & initials fallback
 * - Centered athlete name, clean bio without leading bullets
 * - 3 Floating Swiss KPI metric cards (Weight, Goal, Weekly Workouts)
 * - Native Segmented Control Chips (Activity Pulse, Weight Curve, Physique Photos)
 * - Fully isolated to mobile viewports (< lg)
 */
export const ClientMobileProfileHero = ({
  client,
  startWeight,
  targetWeight,
  weightToGoal,
  whatsappUrl,
  onBack,
  onOpenNotes,
  onSwitchToTrainee,
  activeMobileTab,
  setActiveMobileTab,
  subscriptionInfo,
  onOpenMembership
}) => {
  if (!client) return null;

  const initialWeight = startWeight || client.weightKg;

  // Clean bio elements without awkward leading bullets
  const bioParts = [
    client.age ? `${client.age}y` : null,
    client.gender ? (client.gender === 'Female' ? 'Female' : 'Male') : null,
    client.heightCm > 0 ? `${client.heightCm}cm` : null,
    client.goal ? client.goal.replace(' & Conditioning', '').replace(' / Muscle Gain', '') : null,
    client.subscription?.planType ? client.subscription.planType.replace(' Coaching', '') : null
  ].filter(Boolean);

  return (
    <div className="w-full flex flex-col items-center text-center pt-0 pb-1 px-0.5 select-none relative flex-shrink-0">
      {/* 1. Top Command Bar (Floating: Left Back Button + Right Action Pills) */}
      <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/[0.06] z-10">
        <button
          type="button"
          onClick={onBack}
          className="gym-btn-secondary gym-btn-sm font-mono text-[11px] py-1 px-2 flex items-center gap-1 cursor-pointer bg-white/[0.04] border-white/10 hover:bg-white/[0.08]"
          title="Back to client list"
        >
          <span className="font-mono text-xs">&larr;</span>
          <span>Clients</span>
        </button>

        <div className="flex items-center gap-1.5">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold transition-colors"
              title="Chat with athlete on WhatsApp"
            >
              WA
            </a>
          )}

          {onOpenNotes && (
            <button
              type="button"
              onClick={onOpenNotes}
              className="gym-btn-secondary gym-btn-sm font-mono text-[11px] py-1 px-2 flex items-center gap-1 cursor-pointer bg-white/[0.04] border-white/10 hover:bg-white/[0.08]"
              title="Coach internal notes"
            >
              Notes
            </button>
          )}

          {onSwitchToTrainee && (
            <button
              type="button"
              onClick={onSwitchToTrainee}
              className="gym-btn-primary text-[11px] py-1 px-2.5 font-bold shadow-sm cursor-pointer"
              title="Preview athlete dashboard"
            >
              Athlete View
            </button>
          )}
        </div>
      </div>

      {/* 2. Floating Circular Avatar (Seamlessly on canvas with glowing accent ring) */}
      <div className="relative mt-0.5">
        <div className="p-0.5 rounded-full bg-gradient-to-b from-[var(--main-color)]/60 via-white/15 to-transparent shadow-xl">
          {client.avatarUrl ? (
            <img
              src={client.avatarUrl}
              alt={client.name}
              className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 rounded-full object-cover border-2 border-[var(--bg-page)]"
            />
          ) : (
            <div className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 rounded-full bg-[var(--card-bg)] border-2 border-[var(--bg-page)] text-white font-bold text-lg min-[375px]:text-xl flex items-center justify-center font-mono shadow-inner">
              {client.avatarText || client.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Live Status Badge */}
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-page)] shadow-md ${
            client.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
          title={`Status: ${client.status || 'Active'}`}
        />
      </div>

      {/* 3. Centered Athlete Name & Status */}
      <div className="mt-1.5 flex items-center justify-center gap-1.5 flex-wrap">
        <h2 className="text-base min-[375px]:text-lg font-bold text-white tracking-tight">
          {client.name}
        </h2>
        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold uppercase">
          {client.status || 'Active'}
        </span>
      </div>

      {/* 4. Clean Demographics & Goal Bio (Zero leading bullets) */}
      {bioParts.length > 0 && (
        <div className="text-[10px] min-[375px]:text-[11px] font-mono text-slate-400 mt-0.5 flex items-center justify-center gap-1.5 flex-wrap">
          {bioParts.map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-slate-600">&bull;</span>}
              <span className={index === bioParts.length - 1 ? 'text-slate-300 font-semibold' : ''}>
                {part}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* 5. Three Floating Swiss Metric KPI Cards (Weight, Membership, Target) */}
      <div className="grid grid-cols-3 gap-1.5 min-[375px]:gap-2 w-full mt-2 min-[375px]:mt-2.5 font-mono">
        {/* Tile 1: Current Weight (Left) */}
        <div className="bg-[var(--card-bg)]/85 backdrop-blur-md border border-white/[0.07] rounded-xl p-1.5 min-[375px]:p-2 flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[8px] min-[375px]:text-[8.5px] text-slate-400 uppercase tracking-wider block">
            Weight
          </span>
          <span className="text-xs min-[360px]:text-sm font-bold text-white block mt-0.5">
            {client.weightKg} <span className="text-[9px] font-normal text-slate-400">kg</span>
          </span>
          <span className="text-[7.5px] min-[375px]:text-[8.5px] text-slate-500 block truncate w-full mt-0.5">
            Start: {initialWeight}kg
          </span>
        </div>

        {/* Tile 2: Membership (Center - Brand Identity Compliant) */}
        <div
          onClick={onOpenMembership}
          className="bg-[var(--card-bg)]/85 backdrop-blur-md border border-white/[0.07] hover:border-[var(--main-color)]/40 rounded-xl p-1.5 min-[375px]:p-2 flex flex-col items-center justify-center text-center shadow-md cursor-pointer transition-all active:scale-95 group relative overflow-hidden"
          title="Click to manage membership package"
        >
          <span className="text-[8px] min-[375px]:text-[8.5px] text-slate-400 uppercase tracking-wider block">
            Membership
          </span>
          <span className="text-xs min-[360px]:text-sm font-bold block mt-0.5 truncate max-w-[95px] min-[360px]:max-w-[115px] text-white">
            {subscriptionInfo?.hasSubscription ? subscriptionInfo.name : 'No Plan'}
          </span>
          <span className="text-[7.5px] min-[375px]:text-[8.5px] block truncate w-full mt-0.5 font-semibold">
            {subscriptionInfo?.hasSubscription ? (
              <span className="text-slate-300">
                {subscriptionInfo.statusText}
              </span>
            ) : (
              <span className="text-[var(--main-color)] group-hover:underline">
                + Assign Plan
              </span>
            )}
          </span>
        </div>

        {/* Tile 3: Goal Target (Right) */}
        <div className="bg-[var(--card-bg)]/85 backdrop-blur-md border border-white/[0.07] rounded-xl p-1.5 min-[375px]:p-2 flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[8px] min-[375px]:text-[8.5px] text-slate-400 uppercase tracking-wider block">
            Target
          </span>
          <span className="text-xs min-[360px]:text-sm font-bold text-[var(--main-color)] block mt-0.5">
            {targetWeight} <span className="text-[9px] font-normal text-slate-400">kg</span>
          </span>
          <span className="text-[7.5px] min-[375px]:text-[8.5px] text-[var(--main-color)]/80 block truncate w-full mt-0.5 font-semibold">
            {weightToGoal > 0 ? `${weightToGoal}kg left` : 'Target hit!'}
          </span>
        </div>
      </div>

      {/* 6. Native Segmented Control Chips Switcher */}
      <div className="w-full p-0.5 rounded-xl bg-black/60 border border-white/[0.08] grid grid-cols-3 gap-1 shadow-inner font-mono text-center mt-2 min-[375px]:mt-2.5">
        <button
          type="button"
          onClick={() => setActiveMobileTab('pulse')}
          className={`py-1.5 px-1 rounded-lg text-[10px] min-[360px]:text-[11px] min-[400px]:text-xs transition-all cursor-pointer truncate ${
            activeMobileTab === 'pulse'
              ? 'bg-[var(--main-color)] text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          Activity Pulse
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('weight')}
          className={`py-1.5 px-1 rounded-lg text-[10px] min-[360px]:text-[11px] min-[400px]:text-xs transition-all cursor-pointer truncate ${
            activeMobileTab === 'weight'
              ? 'bg-[var(--main-color)] text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          Weight Curve
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('photos')}
          className={`py-1.5 px-1 rounded-lg text-[10px] min-[360px]:text-[11px] min-[400px]:text-xs transition-all cursor-pointer truncate ${
            activeMobileTab === 'photos'
              ? 'bg-[var(--main-color)] text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          Physique Photos
        </button>
      </div>
    </div>
  );
};
