'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Scrolls the window to top on route change.
 * Complements the root layout: with html/body using min-height (no scroll trap),
 * the window is the scroll container, so window.scrollTo restores expected behavior.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
