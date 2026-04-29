import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { getPageBySlug } from '@/lib/cms/server';
import AppLayout from '@/components/layout/AppLayout';
import CustomStyleInjector from '@/components/custom/CustomStyleInjector';
import { SANITIZATION_CONFIG } from '@/lib/constants/security';
import styles from './page.module.css';

interface DynamicPageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Paths that are not custom pages (e.g. .well-known, Chrome DevTools).
 * Return 404 without calling Supabase.
 */
function isNonPageSlug(slug: string[]): boolean {
  if (!slug?.length) return true;
  const first = slug[0];
  return first === '.well-known' || first.startsWith('.');
}

/**
 * Generate metadata for custom pages
 * Uses meta_title and meta_description from the page, with fallbacks
 */
export async function generateMetadata({
  params,
}: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isNonPageSlug(slug)) {
    notFound();
  }
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: 'Trang không tìm thấy',
      description: 'Trang bạn đang tìm kiếm không tồn tại.',
    };
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || `Trang ${page.title}`,
  };
}

/**
 * Dynamic catch-all route for custom pages
 * Handles routes like /about, /rules, /about/us, etc.
 *
 * Route precedence: Next.js matches specific routes before catch-all,
 * so /choi-co-tuong-online, /cach-choi-co-tuong, etc. will still work correctly.
 */
export default async function DynamicPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  if (isNonPageSlug(slug)) {
    notFound();
  }
  const page = await getPageBySlug(slug);

  // If page not found or not published, return 404
  if (!page) {
    notFound();
  }

  // Sanitize HTML content to prevent XSS attacks
  // Use DOMPurify with the same config as blog articles
  const sanitizedHtml = DOMPurify.sanitize(
    page.html_content,
    SANITIZATION_CONFIG
  );

  return (
    <AppLayout>
      <main className={styles.container}>
        {/* Page Title */}
        <h1 className={styles.title}>{page.title}</h1>

        {/* Per-page CSS injection */}
        <CustomStyleInjector css={page.custom_css} id={`page-css-${page.id}`} />

        {/* Page Content */}
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </main>
    </AppLayout>
  );
}

// Enable dynamic rendering to fetch fresh data on each request
export const dynamic = 'force-dynamic';
