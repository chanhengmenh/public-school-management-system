'use client';

import React from 'react';
import clsx from 'clsx';
import { Loader2, type LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  isLoading?: boolean;
  /** Override primary bg color, e.g. 'bg-orange-600' (Student) or 'bg-blue-600' (Teacher) */
  color?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'text-white shadow-sm hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400',
  outline:
    'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading = false,
  color,
  children,
  className,
  disabled,
  ...rest
}) => {
  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? (color ?? 'bg-slate-900') : '';

  return (
    <button
      className={clsx(
        // Base
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-200 ease-in-out',
        'focus-visible:outline-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        // Variant
        variantStyles[variant],
        // Primary bg (custom or default)
        isPrimary && bgColor,
        // Primary hover color override
        isPrimary && color && 'hover:opacity-90',
        // Size
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <Loader2 size={iconSizes[size]} className="animate-spin" />
      ) : (
        Icon && <Icon size={iconSizes[size]} />
      )}
      {children}
    </button>
  );
};

export default Button;
