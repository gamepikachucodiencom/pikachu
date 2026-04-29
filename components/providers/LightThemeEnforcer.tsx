'use client';

import { useEffect } from 'react';

/**
 * Ensures the site always uses light theme.
 * Removes data-theme attribute and sets localStorage to 'light' on mount.
 */
export function LightThemeEnforcer() {
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }, []);

  return null;
}
