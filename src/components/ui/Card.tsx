'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'elevated' | 'subtle';
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  children,
  className = '',
  ...props
}, ref) => {
  const variantClass =
    variant === 'interactive' ? 'gym-card-interactive' :
    variant === 'elevated' ? 'gym-card-elevated' :
    variant === 'subtle' ? 'gym-card-subtle' :
    'gym-card';

  return (
    <div
      ref={ref}
      className={`${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
