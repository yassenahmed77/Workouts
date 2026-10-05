'use client';

import React from 'react';

export interface AthleteAvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatusDot?: boolean;
  statusDotColor?: string;
  onClick?: () => void;
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-7 h-7 text-xs',
  lg: 'w-9 h-9 text-sm'
};

export function AthleteAvatar({
  src,
  name,
  size = 'md',
  showStatusDot = false,
  statusDotColor = 'bg-emerald-400',
  onClick,
  className = ''
}: AthleteAvatarProps) {
  const isInteractive = Boolean(onClick);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      title={name}
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${
        isInteractive ? 'cursor-pointer transition-transform hover:scale-105' : ''
      } ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${SIZE_CLASSES[size]} rounded-full object-cover border border-[#1a2333]`}
        />
      ) : (
        <div
          className={`${SIZE_CLASSES[size]} rounded-full bg-[#16202e] border border-[#233146] flex items-center justify-center font-bold text-slate-200 font-mono`}
        >
          {initials}
        </div>
      )}

      {showStatusDot && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#080c14] ${statusDotColor}`}
        />
      )}
    </div>
  );
}

export interface AvatarGroupProps {
  athletes: Array<{ name: string; avatarUrl?: string; [key: string]: any }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  onSelect?: (athlete: any) => void;
  className?: string;
}

export function AvatarGroup({
  athletes,
  max = 8,
  size = 'md',
  onSelect,
  className = ''
}: AvatarGroupProps) {
  const visible = athletes.slice(0, max);
  const remaining = athletes.length - max;

  return (
    <div className={`flex items-center -space-x-1.5 overflow-hidden ${className}`}>
      {visible.map((a, i) => (
        <AthleteAvatar
          key={i}
          src={a.avatarUrl}
          name={a.name}
          size={size}
          onClick={onSelect ? () => onSelect(a) : undefined}
          className="border-2 border-[#080c14] hover:z-10 hover:scale-115 transition-transform"
        />
      ))}

      {remaining > 0 && (
        <div
          className={`${SIZE_CLASSES[size]} rounded-full bg-[#16202e] border-2 border-[#080c14] flex items-center justify-center font-mono font-bold text-slate-300 text-[10px]`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
