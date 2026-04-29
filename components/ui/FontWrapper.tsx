'use client';

import { ReactNode } from 'react';

interface FontWrapperProps {
  children: ReactNode;
  lang?: 'vi' | 'en';
  className?: string;
}

/**
 * Wrapper component to apply correct font based on language
 * Vietnamese: Be Vietnam Pro (default)
 * English: Inter
 */
export function FontWrapper({
  children,
  lang = 'vi',
  className = '',
}: FontWrapperProps) {
  const fontClass = lang === 'en' ? 'font-english' : 'font-vietnamese';

  return (
    <div className={`${fontClass} ${className}`} lang={lang}>
      {children}
    </div>
  );
}

/**
 * Vietnamese text component (uses Be Vietnam Pro)
 */
export function VNText({
  children,
  className = '',
  as: Component = 'span',
  ...props
}: {
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  [key: string]: unknown;
}) {
  return (
    <Component className={`font-vietnamese ${className}`} lang="vi" {...props}>
      {children}
    </Component>
  );
}

/**
 * English text component (uses Inter)
 */
export function ENText({
  children,
  className = '',
  as: Component = 'span',
  ...props
}: {
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  [key: string]: unknown;
}) {
  return (
    <Component className={`font-english ${className}`} lang="en" {...props}>
      {children}
    </Component>
  );
}

