import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo/metadata';
import { requireFeature } from '@/lib/features';
import AppLayout from '@/components/layout/AppLayout';
import BlogPageContent from './BlogPageContent';
import { getPublishedArticlesServer } from '@/lib/blog/blogService.server';

export const metadata: Metadata = generateMetadata('/cach-choi-co-tuong');

export const dynamic = 'force-dynamic'; // Force dynamic rendering due to cookies usage

export default async function BlogPage() {
  requireFeature('BLOG'); // Redirects if feature is disabled

  // Fetch articles on the server for SSR
  const {
    data: articles,
    error,
    count,
  } = await getPublishedArticlesServer({
    limit: 6,
    offset: 0,
  });

  return (
    <AppLayout>
      <BlogPageContent
        initialArticles={articles}
        initialCount={count}
        initialError={error}
      />
    </AppLayout>
  );
}
