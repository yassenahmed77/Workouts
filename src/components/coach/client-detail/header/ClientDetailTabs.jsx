'use client';

import React from 'react';
import { SegmentedTabs } from '@/components/ui';

/**
 * ClientDetailTabs (Presentation Layer - Atomic Component)
 *
 * Renders the clean typography sub-navigation strip for Client 360:
 * - Desktop: Classic top segmented glass bar (100% locked & untouched)
 * - Mobile: Modern floating bottom navigation dock with glowing active pills and badges
 */
export const ClientDetailTabs = ({
  activeSubTab,
  onSelectSubTab,
  pendingCheckInsCount = 0,
  pendingFormChecksCount = 0,
  isMobileBottom = false
}) => {
  const tabs = [
    { key: 'overview', label: 'Overview', shortLabel: 'Overview' },
    { key: 'workout', label: 'Workout Plan', shortLabel: 'Workouts' },
    { key: 'nutrition', label: 'Diet Plan', shortLabel: 'Diet' },
    { key: 'checkins', label: 'Check-ins', shortLabel: 'Check-ins', badge: pendingCheckInsCount > 0 ? pendingCheckInsCount : undefined },
    { key: 'formchecks', label: 'Form Checks', shortLabel: 'Form', badge: pendingFormChecksCount > 0 ? pendingFormChecksCount : undefined },
    { key: 'timeline', label: 'Timeline & Notes', shortLabel: 'Timeline' },
    { key: 'logs', label: 'Exercise History', shortLabel: 'Logs' }
  ];

  if (isMobileBottom) {
    return (
      <div className="w-full px-2.5 pb-2 pt-0.5 flex-shrink-0 select-none z-30">
        <nav
          aria-label="Mobile Sub Navigation"
          className="w-full bg-black/75 backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-1.5 flex items-center sm:justify-center gap-1.5 overflow-x-auto no-scrollbar shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
        >
          {tabs.map((tab) => {
            const isActive = activeSubTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectSubTab(tab.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? 'bg-[var(--main-color)] text-white font-bold shadow-lg shadow-[var(--main-color)]/30 border border-[var(--main-color)]/50 scale-[1.02]'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.05]'
                }`}
              >
                <span>{tab.shortLabel}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-black font-bold shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <SegmentedTabs
      items={tabs}
      value={activeSubTab}
      onChange={(key) => onSelectSubTab(key)}
      variant="glass"
      className="flex-shrink-0 bg-[var(--card-bg)] border-[var(--card-border)] select-none"
    />
  );
};
