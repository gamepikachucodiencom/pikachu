import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ARTICLE_STATUS } from '@/lib/constants/enums';

// Force static generation - no cookies, no dynamic rendering
export const dynamic = 'force-static';

// Create a static Supabase client using only environment variables (no cookies)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cach-choi-co-tuong`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/choi-co-tuong-voi-may`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/choi-co-tuong-online`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/co-up`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bang-xep-hang-co-tuong`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ban-co-tuong`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dang-nhap`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic blog articles
  let blogPages: MetadataRoute.Sitemap = [];

  try {
    // Fetch all published article slugs using static client (no cookies)
    // Only include articles that are published AND have a published_at date
    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select('slug, updated_at, published_at')
      .eq('status', ARTICLE_STATUS.PUBLISHED)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (!error && articles) {
      blogPages = articles.map((article) => ({
        url: `${baseUrl}/cach-choi-co-tuong/${article.slug}`,
        lastModified: article.updated_at
          ? new Date(article.updated_at)
          : article.published_at
            ? new Date(article.published_at)
            : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching blog articles for sitemap:', error);
    // Continue without blog pages if there's an error
  }

  return [...staticPages, ...blogPages];
}
