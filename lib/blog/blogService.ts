import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { SLUG_VALIDATION } from '@/lib/constants/validation';
import {
  ARTICLE_STATUS,
  type ArticleType,
  type ArticleStatus,
} from '@/lib/constants/enums';

// Re-export types for backward compatibility
export type { ArticleType, ArticleStatus };

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
  // Joined fields
  author_username?: string;
  author_avatar?: string | null;
  reading_time_minutes?: number;
}

export interface BlogArticleInsert {
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  image_url?: string | null;
  article_type: ArticleType;
  status?: ArticleStatus;
  author_id: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  published_at?: string | null;
}

export interface BlogArticleUpdate {
  slug?: string;
  title?: string;
  excerpt?: string | null;
  content?: string;
  image_url?: string | null;
  article_type?: ArticleType;
  status?: ArticleStatus;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  published_at?: string | null;
}

export interface BlogArticleFilters {
  type?: ArticleType | null;
  status?: ArticleStatus;
  author_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetch published articles for public viewing
 */
export async function getPublishedArticles(
  filters?: BlogArticleFilters
): Promise<{ data: BlogArticle[]; error: Error | null; count: number }> {
  try {
    // Use the blog_articles_published view for better performance
    let query = supabase
      .from('blog_articles_published')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('article_type', filters.type);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`
      );
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

    // Transform the data - view already includes author info and reading_time
    // Note: The view doesn't include content, so we need to fetch it separately for detail view
    const articles: BlogArticle[] =
      data?.map((article: any) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: '', // View doesn't include content for list view (fetch separately for detail)
        image_url: article.image_url,
        article_type: article.article_type,
        status: ARTICLE_STATUS.PUBLISHED as ArticleStatus,
        author_id: '', // Not needed for public view
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        meta_keywords: article.meta_keywords,
        view_count: article.view_count,
        like_count: article.like_count,
        published_at: article.published_at,
        created_at: article.created_at,
        updated_at: article.updated_at,
        author_username: article.author_username,
        author_avatar: article.author_avatar,
        reading_time_minutes: article.reading_time_minutes || calculateReadingTime(''),
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
 * Fetch a single article by slug (public)
 */
export async function getArticleBySlug(
  slug: string
): Promise<{ data: BlogArticle | null; error: Error | null }> {
  try {
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
      .eq('status', 'published')
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

    // Increment view count
    await incrementArticleViewCount(data.id);

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

/**
 * Fetch all articles (admin only - includes drafts)
 */
export async function getAllArticles(
  filters?: BlogArticleFilters
): Promise<{ data: BlogArticle[]; error: Error | null; count: number }> {
  try {
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
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('article_type', filters.type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.author_id) {
      query = query.eq('author_id', filters.author_id);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`
      );
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
    console.error('Error fetching all articles:', error);
    return {
      data: [],
      error: error instanceof Error ? error : new Error('Unknown error'),
      count: 0,
    };
  }
}

/**
 * Fetch a single article by ID (admin)
 */
export async function getArticleById(
  id: string
): Promise<{ data: BlogArticle | null; error: Error | null }> {
  try {
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
      .eq('id', id)
      .single();

    if (error) {
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
    console.error('Error fetching article by ID:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Create a new article
 */
export async function createArticle(
  article: BlogArticleInsert
): Promise<{ data: BlogArticle | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .insert(article)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data: data as BlogArticle, error: null };
  } catch (error) {
    console.error('Error creating article:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Update an article
 */
export async function updateArticle(
  id: string,
  updates: BlogArticleUpdate
): Promise<{ data: BlogArticle | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data: data as BlogArticle, error: null };
  } catch (error) {
    console.error('Error updating article:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Delete an article
 */
export async function deleteArticle(
  id: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting article:', error);
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Toggle like on an article
 */
export async function toggleArticleLike(
  articleId: string,
  userId: string
): Promise<{ liked: boolean; error: Error | null }> {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('blog_article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('blog_article_likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', userId);

      if (error) throw error;
      return { liked: false, error: null };
    } else {
      // Like
      const { error } = await supabase
        .from('blog_article_likes')
        .insert({ article_id: articleId, user_id: userId });

      if (error) throw error;
      return { liked: true, error: null };
    }
  } catch (error) {
    console.error('Error toggling article like:', error);
    return {
      liked: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Check if user has liked an article
 */
export async function checkArticleLike(
  articleId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('blog_article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Increment article view count
 */
async function incrementArticleViewCount(articleId: string): Promise<void> {
  try {
    await supabase.rpc('increment_article_view_count', {
      article_uuid: articleId,
    });
  } catch (error) {
    // Silently fail - view count is not critical
    console.error('Error incrementing view count:', error);
  }
}

/**
 * Calculate reading time in minutes (rough estimate: 200 words per minute)
 */
function calculateReadingTime(content: string): number {
  if (!content) return 1;
  // Remove HTML tags for word count
  const textContent = content.replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.split(/\s+/).filter((word) => word.length > 0)
    .length;
  const readingTime = Math.ceil(wordCount / 200);
  return Math.max(1, readingTime);
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(SLUG_VALIDATION.REMOVE_SPECIAL_CHARS, '') // Remove special characters
    .replace(SLUG_VALIDATION.NORMALIZE_SEPARATORS, '-') // Replace spaces and underscores with hyphens
    .replace(SLUG_VALIDATION.TRIM_HYPHENS, ''); // Remove leading/trailing hyphens
}

