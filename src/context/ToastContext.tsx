'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, Trash2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void | Promise<void>;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void | Promise<void>;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: ToastAction) => void;
  confirmDialog: (options: ConfirmDialogOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmDialogOptions | null>(null);
  const lastToastRef = React.useRef<{ message: string; timestamp: number }>({ message: '', timestamp: 0 });

  const showToast = useCallback((message: string, type: ToastType = 'success', action?: ToastAction) => {
    const now = Date.now();
    // Prevent duplicate toast calls within 1200ms
    if (lastToastRef.current.message === message && now - lastToastRef.current.timestamp < 1200) {
      return;
    }
    lastToastRef.current = { message, timestamp: now };

    const id = `toast-${now}-${Math.random().toString(36).substring(2, 7)}`;
    const duration = action ? 5500 : 3200; // Longer duration for actionable/Undo toasts
    
    // Defer state update to next tick
    setTimeout(() => {
      setToasts((prev) => {
        if (prev.some((t) => t.message === message)) {
          return prev;
        }
        return [...prev, { id, message, type, action }];
      });
    }, 0);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const confirmDialog = useCallback((options: ConfirmDialogOptions) => {
    setConfirmState(options);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Close confirm dialog on Escape key
  useEffect(() => {
    if (!confirmState) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConfirmState(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmState]);

  return (
    <ToastContext.Provider value={{ showToast, confirmDialog }}>
      {children}

      {/* 1. Custom Confirmation Dialog (Replaces native browser window.confirm) */}
      {confirmState && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
        >
          {/* Backdrop */}
          <div 
            onClick={() => setConfirmState(null)} 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Dialog Card */}
          <div 
            className="relative w-full max-w-sm rounded-2xl bg-[#090d14] border border-[#1e2a3c] shadow-2xl p-5 z-10 flex flex-col space-y-4 animate-in zoom-in-95 duration-150 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                confirmState.variant === 'warning' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {confirmState.variant === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {confirmState.title || 'Confirm Action'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {confirmState.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#141b26]">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
              >
                {confirmState.cancelText || 'Cancel'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  const onConfirm = confirmState.onConfirm;
                  setConfirmState(null);
                  await onConfirm();
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95 ${
                  confirmState.variant === 'warning'
                    ? 'bg-amber-500 hover:bg-amber-400 text-[#080c14]'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                }`}
              >
                {confirmState.confirmText || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Centered Minimal Rich Toast Notification with Action / Undo */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none flex flex-col items-center gap-2 max-w-[90vw]">
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto px-4 py-2.5 rounded-xl bg-[#090d14]/95 border border-[#1e2a3c] shadow-2xl backdrop-blur-xl flex items-center gap-3 transition-all duration-200 animate-in fade-in slide-in-from-top-2 hover:border-cyan-500/40"
            >
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {isError && <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
              
              <p className="text-xs font-semibold text-slate-100 whitespace-normal leading-relaxed">
                {toast.message}
              </p>

              {/* Action Button (e.g. "Undo") */}
              {toast.action && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                    await toast.action?.onClick();
                  }}
                  className="ml-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
