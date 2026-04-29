/**
 * Toast Notification Utility
 * 
 * Provides a simple API for showing toast notifications throughout the app.
 * Replaces Mantine notifications with our custom toast system.
 */

import { useToast } from '@/components/ui/Toast/ToastProvider';

type ToastType = 'success' | 'error' | 'info';

/**
 * Show a toast notification
 * This is a hook-based function that must be called from within a component.
 * For use outside components, use the direct context access pattern.
 * 
 * @param message - The message to display
 * @param type - The type of toast (success, error, info)
 */
export function useToastNotification() {
  const { showToast } = useToast();
  
  return {
    show: (message: string, type: ToastType = 'info') => {
      showToast(message, type);
    },
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  };
}

/**
 * Create a toast notification utility that can be used outside React components.
 * This requires access to the toast context, so it's best used within components.
 * 
 * For global use, consider creating a singleton pattern or using a store.
 */
export function createToastNotifier(showToast: (message: string, type?: ToastType) => void) {
  return {
    show: (message: string, type: ToastType = 'info') => showToast(message, type),
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  };
}
