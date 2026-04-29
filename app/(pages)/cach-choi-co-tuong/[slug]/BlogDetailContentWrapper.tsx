'use client';

import { useState, useEffect } from 'react';
import type { BlogArticle } from '@/lib/blog/blogService';

interface BlogDetailContentWrapperProps {
  article: BlogArticle;
}

export default function BlogDetailContentWrapper({ article }: BlogDetailContentWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [BlogDetailContent, setBlogDetailContent] = useState<React.ComponentType<{ article: BlogArticle }> | null>(null);

  useEffect(() => {
    // Only import after mount to ensure we're client-side
    if (typeof window !== 'undefined') {
      setMounted(true);
      // Use dynamic import to load the component only on client
      import('./BlogDetailContent').then((mod) => {
        setBlogDetailContent(() => mod.default);
      });
    }
  }, []);

  // Show loading state until mounted and component is loaded
  if (!mounted || !BlogDetailContent) {
    return (
      <div style={{ padding: '2rem', color: 'white', textAlign: 'center', minHeight: '400px' }}>
        Đang tải...
      </div>
    );
  }

  return <BlogDetailContent article={article} />;
}

