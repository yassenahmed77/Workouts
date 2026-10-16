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
    <div className="w-full flex flex-col items-center text-center pt-0 pb-0.5 px-0.5 select-none relative flex-shrink-0">
      {/* 1. Top Command Bar (Floating: Left Back Button + Right Action Pills with Safe Area Inset) */}
      <div className="w-full flex items-center justify-between pb-1.5 mb-1 border-b border-white/[0.06] z-10 pt-[max(env(safe-area-inset-top),6px)]">
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
              className="p-1 min-[360px]:p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              title="Chat with athlete on WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-emerald-400">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m-4.51 3.81c-.24 0-.64.09-.97.45-.33.37-1.27 1.24-1.27 3.03s1.3 3.52 1.48 3.76c.18.24 2.51 3.99 6.18 5.43 3.04 1.2 3.66.96 4.32.9.66-.06 2.13-.87 2.43-1.72.3-.84.3-1.57.21-1.72-.09-.15-.33-.24-.69-.42-.36-.18-2.13-1.05-2.46-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.53-.56-2.91-1.79-1.07-.96-1.8-2.14-2.01-2.5-.21-.36-.02-.56.16-.74.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.3-.7-.59-.61-.81-.62-.21-.01-.45-.01-.69-.01" />
              </svg>
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
              className="w-12 h-12 min-[390px]:w-14 min-[390px]:h-14 rounded-full object-cover border-2 border-[var(--bg-page)]"
            />
          ) : (
            <div className="w-12 h-12 min-[390px]:w-14 min-[390px]:h-14 rounded-full bg-[var(--card-bg)] border-2 border-[var(--bg-page)] text-white font-bold text-base min-[390px]:text-lg flex items-center justify-center font-mono shadow-inner">
              {client.avatarText || client.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Live Status Badge */}
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 min-[390px]:w-3.5 min-[390px]:h-3.5 rounded-full border-2 border-[var(--bg-page)] shadow-md ${
            client.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
          title={`Status: ${client.status || 'Active'}`}
        />
      </div>

      {/* 3. Centered Athlete Name & Status */}
      <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
        <h2 className="text-sm min-[390px]:text-base font-bold text-white tracking-tight">
          {client.name}
        </h2>
        <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold uppercase">
          {client.status || 'Active'}
        </span>
      </div>

      {/* 4. Clean Demographics & Goal Bio (Zero leading bullets) */}
      {bioParts.length > 0 && (
        <div className="text-[9.5px] min-[390px]:text-[10px] font-mono text-slate-400 mt-0.5 flex items-center justify-center gap-1.5 flex-wrap">
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
      <div className="grid grid-cols-3 gap-1 min-[390px]:gap-1.5 w-full mt-1.5 min-[390px]:mt-2 font-mono">
        {/* Tile 1: Current Weight (Left) */}
        <div className="bg-[var(--card-bg)]/85 backdrop-blur-md border border-white/[0.07] rounded-xl py-1 px-1 min-[390px]:p-1.5 flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[7.5px] min-[390px]:text-[8px] text-slate-400 uppercase tracking-wider block">
            Weight
          </span>
          <span className="text-xs min-[360px]:text-sm font-bold text-white block mt-0.5">
            {client.weightKg} <span className="text-[8.5px] font-normal text-slate-400">kg</span>
          </span>
          <span className="text-[7px] min-[390px]:text-[8px] text-slate-500 block truncate w-full mt-0.5">
            Start: {initialWeight}kg
          </span>
        </div>

        {/* Tile 2: Membership (Center - Brand Identity Compliant) */}
        <div
          onClick={onOpenMembership}
          className="bg-[var(--card-bg)]/85 backdrop-blur-md border border-white/[0.07] hover:border-[var(--main-color)]/40 rounded-xl py-1 px-1 min-[390px]:p-1.5 flex flex-col items-center justify-center text-center shadow-md cursor-pointer transition-all active:scale-95 group relative overflow-hidden"
          title="Click to manage membership package"
        >
          <span className="text-[7.5px] min-[390px]:text-[8px] text-slate-400 uppercase tracking-wider block">
            Membership
          </span>
          <span className="text-[10px] min-[360px]:text-[11.5px] font-bold block mt-0.5 truncate w-full text-white leading-tight">
            {subscriptionInfo?.hasSubscription ? subscriptionInfo.name.replace(' Coaching', '') : 'No Plan'}
          </span>
          <span className="text-[7px] min-[390px]:text-[8px] block truncate w-full mt-0.5 font-semibold">
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
        <div className="bg-[var(--card-bg)]/85 backdrop-blur-md border border-white/[0.07] rounded-xl py-1 px-1 min-[390px]:p-1.5 flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[7.5px] min-[390px]:text-[8px] text-slate-400 uppercase tracking-wider block">
            Target
          </span>
          <span className="text-xs min-[360px]:text-sm font-bold text-[var(--main-color)] block mt-0.5">
            {targetWeight} <span className="text-[8.5px] font-normal text-slate-400">kg</span>
          </span>
          <span className="text-[7px] min-[390px]:text-[8px] text-[var(--main-color)]/80 block truncate w-full mt-0.5 font-semibold">
            {weightToGoal > 0 ? `${weightToGoal}kg left` : 'Target hit!'}
          </span>
        </div>
      </div>

      {/* 6. Native Segmented Control Chips Switcher */}
      <div className="w-full p-0.5 rounded-xl bg-black/60 border border-white/[0.08] grid grid-cols-3 gap-1 shadow-inner font-mono text-center mt-1.5 min-[390px]:mt-2">
        <button
          type="button"
          onClick={() => setActiveMobileTab('pulse')}
          className={`py-1 min-[390px]:py-1.5 px-1 rounded-lg text-[10px] min-[360px]:text-[10.5px] min-[400px]:text-xs transition-all cursor-pointer truncate ${
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
          className={`py-1 min-[390px]:py-1.5 px-1 rounded-lg text-[10px] min-[360px]:text-[10.5px] min-[400px]:text-xs transition-all cursor-pointer truncate ${
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
          className={`py-1 min-[390px]:py-1.5 px-1 rounded-lg text-[10px] min-[360px]:text-[10.5px] min-[400px]:text-xs transition-all cursor-pointer truncate ${
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
