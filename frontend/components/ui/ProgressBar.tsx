'use client';

import React from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Tailwind bg class for the filled portion, e.g. 'bg-blue-600' */
  color?: string;
  /** Optional label rendered above the bar */
  label?: string;
  /** Show the numeric percentage value */
  showValue?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'bg-slate-900',
  label,
  showValue = false,
  className,
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('w-full', className)}>
      {/* Header row: label + value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-slate-700">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-slate-900 tabular-nums">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            color
          )}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
