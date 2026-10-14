'use client';
import React from 'react';
export const Button = React.forwardRef(({ variant = 'primary', size = 'md', children, icon, iconPosition = 'left', className = '', disabled, ...props }, ref) => {
    const variantClass = variant === 'secondary' ? 'gym-btn-secondary' :
        variant === 'ghost' ? 'gym-btn-ghost' :
            variant === 'danger' ? 'gym-btn-danger' :
                'gym-btn-primary';
    const sizeClass = size === 'sm' ? 'gym-btn-sm' :
        size === 'lg' ? 'gym-btn-lg' :
            '';
    return (<button ref={ref} disabled={disabled} className={`${variantClass} ${sizeClass} ${className}`} {...props}>
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>);
});
Button.displayName = 'Button';
