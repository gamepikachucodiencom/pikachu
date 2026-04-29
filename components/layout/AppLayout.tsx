'use client';

import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  /** Deprecated: navbar visibility is now controlled by AppShell in the root layout. */
  hideNavbar?: boolean;
}

/**
 * Pass-through wrapper for backwards compatibility.
 * Layout (navbar + content width) is handled by AppShell in the root layout.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return <>{children}</>;
}
