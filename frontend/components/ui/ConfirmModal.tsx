'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger enter animation on next frame
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={clsx(
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className={clsx(
          'relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6',
          'transition-all duration-200 ease-out',
          isVisible
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-2'
        )}
      >
        {/* Icon */}
        <div
          className={clsx(
            'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4',
            isDanger ? 'bg-red-50' : 'bg-blue-50'
          )}
        >
          <AlertTriangle
            className={clsx(
              'w-6 h-6',
              isDanger ? 'text-red-500' : 'text-blue-500'
            )}
          />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={clsx(
              'flex-1 px-4 py-2.5 font-medium rounded-xl text-sm transition-colors text-white',
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-900 hover:bg-slate-800'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
