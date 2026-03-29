'use client';

import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...rest }) => {
  return (
    <div
      className={clsx(
        // Base styles
        'bg-white border border-slate-200 rounded-2xl shadow-sm',
        // Hoverable transition
        hoverable && [
          'transition-all duration-300 ease-in-out',
          'hover:-translate-y-1 hover:shadow-md',
        ],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
