'use client';

import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  error: 'bg-red-50 text-red-700 border-red-100',
  info: 'bg-blue-50 text-blue-700 border-blue-100',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className,
}) => {
  return (
    <span
      className={clsx(
        // Base
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        'text-xs font-medium border',
        'whitespace-nowrap',
        // Variant colors
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
