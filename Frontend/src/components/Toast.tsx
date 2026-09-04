import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  showToast: (message: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const iconMap: Record<ToastType, React.FC<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    text: 'text-emerald-400',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    text: 'text-red-400',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    text: 'text-amber-400',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    text: 'text-blue-400',
  },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => onDismiss(toast.id), duration);

    // Animate progress bar
    if (progressRef.current) {
      progressRef.current.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => {
        if (progressRef.current) {
          progressRef.current.style.width = '0%';
        }
      });
    }

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${colors.bg} ${colors.border} animate-slideIn`}
      style={{ minWidth: '320px', maxWidth: '420px' }}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colors.icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-zinc-400 mt-0.5 break-words">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/60 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800/40">
        <div
          ref={progressRef}
          className={`h-full ${colors.icon.replace('text-', 'bg-')} opacity-60`}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const contextValue: ToastContextType = {
    toast: addToast,
    showToast: (message: string, type: ToastType = 'info') => addToast(type, message),
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message),
    warning: (title, message) => addToast('warning', title, message),
    info: (title, message) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
