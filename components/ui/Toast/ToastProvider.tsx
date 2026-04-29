'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { setGlobalToast } from '@/lib/utils/coming-soon';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  isExiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
        );
        // Wait for animation to finish before removing
        setTimeout(() => removeToast(id), 300);
      }, 3000);
    },
    [removeToast]
  );

  // Register global toast function for use in non-React contexts
  useEffect(() => {
    setGlobalToast(showToast);
    return () => {
      setGlobalToast(null);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]} ${toast.isExiting ? styles.exiting : ''}`}
          >
            <span className={styles.message}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className={styles.closeBtn}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const noopToast = { showToast: () => {} };

export function useToast() {
  const context = useContext(ToastContext);
  // During SSR or before ToastProvider has mounted (e.g. RSC/streaming), context
  // can be undefined. Return a no-op instead of throwing so the app doesn't crash.
  // After hydration, the real context is used and toasts work.
  return context ?? noopToast;
}
