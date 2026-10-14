'use client';
import React from 'react';
export const PageTitle = ({ children, className = '', ...props }) => (<h1 className={`gym-heading-page ${className}`} {...props}>
    {children}
  </h1>);
export const SectionTitle = ({ children, className = '', ...props }) => (<h2 className={`gym-heading-section ${className}`} {...props}>
    {children}
  </h2>);
export const CardTitle = ({ children, className = '', ...props }) => (<h3 className={`gym-heading-card ${className}`} {...props}>
    {children}
  </h3>);
export const Subtext = ({ children, className = '', ...props }) => (<p className={`gym-subtext ${className}`} {...props}>
    {children}
  </p>);
export const DeltaBadge = ({ type, children, className = '', ...props }) => {
    const typeClass = type === 'positive' ? 'gym-delta-pos' :
        type === 'negative' ? 'gym-delta-neg' :
            type === 'blue' ? 'gym-delta-blue' :
                'gym-delta-neutral';
    return (<span className={`${typeClass} ${className}`} {...props}>
      {children}
    </span>);
};
