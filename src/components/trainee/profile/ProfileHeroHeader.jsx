'use client';
import React from 'react';
import { AthleteAvatar } from '@/components/ui/AthleteAvatar';
export const ProfileHeroHeader = React.memo(({ user }) => {
    const isAccountActive = user.status !== 'inactive';
    return (<div className="gym-card flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <AthleteAvatar name={user.name} src={user.avatarUrl} size="lg" showStatusDot={isAccountActive} statusDotColor="bg-emerald-400"/>
        <div className="min-w-0">
          <h2 className="gym-heading-page truncate">
            {user.name}
          </h2>
          <p className="gym-subtext truncate mt-0.5">
            {user.email}
            {user.phone ? ` • ${user.phone}` : ''}
          </p>
          <p className="gym-label-mono mt-0.5">
            MEMBER SINCE {user.joinedDate}
          </p>
        </div>
      </div>
    </div>);
});
ProfileHeroHeader.displayName = 'ProfileHeroHeader';
