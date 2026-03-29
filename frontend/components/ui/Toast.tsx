'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const variantConfig: Record<ToastVariant, { icon: React.ElementType; bg: string; border: string; text: string; iconColor: string }> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-white',
    border: 'border-emerald-200',
    text: 'text-slate-800',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-white',
    border: 'border-red-200',
    text: 'text-slate-800',
    iconColor: 'text-red-500',
  },
  info: {
    icon: Info,
    bg: 'bg-white',
    border: 'border-blue-200',
    text: 'text-slate-800',
    iconColor: 'text-blue-500',
  },
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);
    return () => clearTimeout(exitTimer);
  }, [toast, onDismiss]);

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full',
        'transition-all duration-300 ease-in-out',
        config.bg, config.border,
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-8 opacity-0',
      )}
    >
      <Icon className={clsx('w-5 h-5 shrink-0', config.iconColor)} />
      <span className={clsx('text-sm font-medium flex-1', config.text)}>
        {toast.message}
      </span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Toast Container ─────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ─── Hook for easy usage ─────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((variant: ToastVariant, message: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, variant, message, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}

export default ToastContainer;
