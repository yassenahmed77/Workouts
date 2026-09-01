'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, X, Sparkles, Flame } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Portal (Center-Top on Mobile, Bottom-Right on Desktop) */}
      <div className="fixed top-5 sm:top-auto sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 flex flex-col gap-2 max-w-sm w-[92vw] sm:w-80 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 animate-in slide-in-from-top-3 sm:slide-in-from-bottom-3 fade-in ${
              toast.type === 'success'
                ? 'bg-[#111218]/95 border-[#ff6b00]/40 text-white shadow-[#ff6b00]/10'
                : toast.type === 'error'
                ? 'bg-[#150f12]/95 border-rose-500/40 text-white shadow-rose-900/10'
                : 'bg-[#111218]/95 border-[#2b2d3d] text-white shadow-black/40'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                toast.type === 'success'
                  ? 'bg-[#ff6b00]/20 text-[#ff6b00] border border-[#ff6b00]/30'
                  : toast.type === 'error'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-[#1c1d29] text-zinc-300 border border-[#2b2d3d]'
              }`}>
                {toast.type === 'success' && <Flame className="w-4 h-4 fill-current animate-pulse" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                {toast.type === 'info' && <Sparkles className="w-4 h-4 text-[#ff6b00]" />}
              </div>
              <span className="text-xs font-bold tracking-tight truncate text-zinc-100">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#1c1d29] cursor-pointer flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
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
