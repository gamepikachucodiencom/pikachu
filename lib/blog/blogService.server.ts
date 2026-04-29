import { createServerClient } from '@/lib/supabase/server';
import {
  ARTICLE_STATUS,
  type ArticleType,
  type ArticleStatus,
} from '@/lib/constants/enums';

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  article_type: ArticleType;
  status: ArticleStatus;
  author_id: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  view_count: number;
  like_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_username?: string;
  author_avatar?: string | null;
  reading_time_minutes?: number;
}

/**
 * Server-side function to fetch published articles
 */
export async function getPublishedArticlesServer(filters?: {
  type?: ArticleType | null;
  limit?: number;
  offset?: number;
}): Promise<{ data: BlogArticle[]; error: Error | null; count: number }> {
  try {
    const supabase = await createServerClient();

    let query = supabase
      .from('blog_articles')
      .select(
        `
        *,
        profiles:author_id (
          username,
          avatar
        )
      `,
        { count: 'exact' }
      )
      .eq('status', ARTICLE_STATUS.PUBLISHED)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('article_type', filters.type);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const articles: BlogArticle[] =
      data?.map((article: any) => ({
        ...article,
        author_username: article.profiles?.username,
        author_avatar: article.profiles?.avatar,
        reading_time_minutes: calculateReadingTime(article.content),
      })) || [];

    return { data: articles, error: null, count: count || 0 };
  } catch (error) {
    console.error('Error fetching published articles:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Unknown error'),
      count: 0,
    };
  }
}

/**
 * Server-side function to fetch article by slug
 */
export async function getArticleBySlugServer(
  slug: string
): Promise<{ data: BlogArticle | null; error: Error | null }> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('blog_articles')
      .select(
        `
        *,
        profiles:author_id (
          username,
          avatar
        )
      `
      )
      .eq('slug', slug)
      .eq('status', ARTICLE_STATUS.PUBLISHED)
      .not('published_at', 'is', null)
      .single();

    // Handle Supabase errors - PGRST116 means "no rows returned" which is expected for missing articles
    if (error) {
      // If it's a "no rows" error, treat it as article not found (not an actual error)
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        return { data: null, error: null };
      }
      // For other errors, log and throw
      console.error('Supabase error fetching article by slug:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    if (!data) {
      return { data: null, error: null };
    }

    const article: BlogArticle = {
      ...data,
      author_username: (data as any).profiles?.username,
      author_avatar: (data as any).profiles?.avatar,
      reading_time_minutes: calculateReadingTime(data.content),
    };

    return { data: article, error: null };
  } catch (error) {
    // Better error logging for debugging
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : String(error);

    console.error('Error fetching article by slug:', {
      slug,
      error: errorMessage,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

    return {
      data: null,
      error: error instanceof Error ? error : new Error(errorMessage),
    };
  }
}

function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const textContent = content.replace(/<[^>]*>/g, ' ');
  const wordCount = textContent
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);
  return Math.max(1, readingTime);
}
