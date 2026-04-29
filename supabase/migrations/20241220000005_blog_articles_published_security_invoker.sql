-- Fix: Use SECURITY INVOKER so view respects querying user's RLS (Supabase security alert)
-- View blog_articles_published was defined with SECURITY DEFINER; recreate with security_invoker = true.

CREATE OR REPLACE VIEW blog_articles_published
WITH (security_invoker = true)
AS
SELECT
  a.id,
  a.slug,
  a.title,
  a.excerpt,
  a.image_url,
  a.article_type,
  a.view_count,
  a.like_count,
  a.published_at,
  a.created_at,
  a.updated_at,
  a.meta_title,
  a.meta_description,
  p.username as author_username,
  p.avatar as author_avatar,
  calculate_reading_time(a.content) as reading_time_minutes
FROM blog_articles a
JOIN profiles p ON a.author_id = p.id
WHERE a.status = 'published'
  AND a.published_at IS NOT NULL
ORDER BY a.published_at DESC;

GRANT SELECT ON blog_articles_published TO authenticated, anon;
