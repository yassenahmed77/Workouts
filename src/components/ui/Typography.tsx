'use client';

import React from 'react';

export interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ children, className = '', ...props }) => (
  <h1 className={`gym-heading-page ${className}`} {...props}>
    {children}
  </h1>
);

export interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, className = '', ...props }) => (
  <h2 className={`gym-heading-section ${className}`} {...props}>
    {children}
  </h2>
);

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', ...props }) => (
  <h3 className={`gym-heading-card ${className}`} {...props}>
    {children}
  </h3>
);

export interface SubtextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export const Subtext: React.FC<SubtextProps> = ({ children, className = '', ...props }) => (
  <p className={`gym-subtext ${className}`} {...props}>
    {children}
  </p>
);

export interface DeltaBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: 'positive' | 'negative' | 'neutral' | 'blue';
  children: React.ReactNode;
  className?: string;
}

export const DeltaBadge: React.FC<DeltaBadgeProps> = ({ type, children, className = '', ...props }) => {
  const typeClass =
    type === 'positive' ? 'gym-delta-pos' :
    type === 'negative' ? 'gym-delta-neg' :
    type === 'blue' ? 'gym-delta-blue' :
    'gym-delta-neutral';

  return (
    <span className={`${typeClass} ${className}`} {...props}>
      {children}
    </span>
  );
};
