/**
 * Coming Soon Notification Utility
 * 
 * Displays a friendly "Coming Soon" message for features not yet ready.
 * Used to provide user feedback instead of showing 404 or broken pages.
 * 
 * This is a simple wrapper that can be called from anywhere.
 * Components should use useToast hook directly for better integration.
 */

// Global toast instance (will be set by ToastProvider)
let globalShowToast: ((message: string, type?: 'success' | 'error' | 'info') => void) | null = null;

/**
 * Set the global toast function (called by ToastProvider on mount)
 * @internal
 */
export function setGlobalToast(
  showToast: ((message: string, type?: 'success' | 'error' | 'info') => void) | null
) {
  globalShowToast = showToast;
}

/**
 * Show a "Coming Soon" notification for a feature
 * @param featureName - The name of the feature in Vietnamese (e.g., "Cửa Hàng", "Chơi Online")
 */
export function showComingSoon(featureName: string) {
  const message = `Tính năng ${featureName} hiện chưa khả dụng và sẽ được cập nhật sớm.`;
  
  if (globalShowToast) {
    globalShowToast(message, 'info');
  } else {
    // Fallback to alert if toast context is not available
    alert(message);
  }
}

/**
 * Show a "Coming Soon" notification with a custom icon
 * @param featureName - The name of the feature in Vietnamese
 * @param icon - Optional custom icon component (not used, kept for API compatibility)
 */
export function showComingSoonWithIcon(
  featureName: string,
  icon?: React.ReactNode
) {
  const message = `Tính năng ${featureName} hiện chưa khả dụng và sẽ được cập nhật sớm.`;
  
  if (globalShowToast) {
    globalShowToast(message, 'info');
  } else {
    // Fallback to alert if toast context is not available
    alert(message);
  }
}
