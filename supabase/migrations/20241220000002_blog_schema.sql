-- Blog Feature Database Schema for Supabase
-- Run this in Supabase SQL Editor
-- This schema supports the /blog page with articles, categories, and user interactions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Article categories/types enum
CREATE TYPE article_type AS ENUM ('Guide', 'Openings', 'Puzzles', 'Endgame');

-- Article status enum
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

-- Blog articles table
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- HTML content
  image_url TEXT,
  article_type article_type NOT NULL,
  status article_status DEFAULT 'draft' NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Analytics
  view_count INTEGER DEFAULT 0 NOT NULL,
  like_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'), -- Only lowercase, numbers, and hyphens
  CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  CONSTRAINT excerpt_length CHECK (excerpt IS NULL OR (char_length(excerpt) >= 10 AND char_length(excerpt) <= 500))
);

-- Article tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT tag_name_format CHECK (name ~ '^[A-Za-z0-9\s-]+$'),
  CONSTRAINT tag_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Article-tag junction table
CREATE TABLE IF NOT EXISTS blog_article_tags (
  article_id UUID NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (article_id, tag_id)
);

-- Article likes/favorites table
CREATE TABLE IF NOT EXISTS blog_article_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(article_id, user_id)
);

-- Article comments table
CREATE TABLE IF NOT EXISTS blog_article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES blog_article_comments(id) ON DELETE CASCADE, -- For nested comments
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT comment_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

-- Article reading history (for analytics and "continue reading" features)
CREATE TABLE IF NOT EXISTS blog_article_reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  reading_progress INTEGER DEFAULT 0 CHECK (reading_progress >= 0 AND reading_progress <= 100), -- Percentage
  UNIQUE(article_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON blog_articles(status);
CREATE INDEX IF NOT EXISTS idx_blog_articles_type ON blog_articles(article_type);
CREATE INDEX IF NOT EXISTS idx_blog_articles_author_id ON blog_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON blog_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_created_at ON blog_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_view_count ON blog_articles(view_count DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_blog_articles_search ON blog_articles 
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')));

-- Tag indexes
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_article_tags_article_id ON blog_article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_article_tags_tag_id ON blog_article_tags(tag_id);

-- Like indexes
CREATE INDEX IF NOT EXISTS idx_blog_article_likes_article_id ON blog_article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_article_likes_user_id ON blog_article_likes(user_id);

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_blog_article_comments_article_id ON blog_article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_article_comments_user_id ON blog_article_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_article_comments_parent_id ON blog_article_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_blog_article_comments_created_at ON blog_article_comments(created_at DESC);

-- Reading history indexes
CREATE INDEX IF NOT EXISTS idx_blog_reading_history_article_id ON blog_article_reading_history(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_reading_history_user_id ON blog_article_reading_history(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_reading_history ENABLE ROW LEVEL SECURITY;

-- Blog articles policies
DROP POLICY IF EXISTS "Anyone can view published articles" ON blog_articles;
CREATE POLICY "Anyone can view published articles"
  ON blog_articles FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Authors can view their own articles" ON blog_articles;
CREATE POLICY "Authors can view their own articles"
  ON blog_articles FOR SELECT
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can insert their own articles" ON blog_articles;
CREATE POLICY "Authors can insert their own articles"
  ON blog_articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own articles" ON blog_articles;
CREATE POLICY "Authors can update their own articles"
  ON blog_articles FOR UPDATE
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own articles" ON blog_articles;
CREATE POLICY "Authors can delete their own articles"
  ON blog_articles FOR DELETE
  USING (auth.uid() = author_id);

-- Blog tags policies
DROP POLICY IF EXISTS "Anyone can view tags" ON blog_tags;
CREATE POLICY "Anyone can view tags"
  ON blog_tags FOR SELECT
  USING (true);

-- Only admins can manage tags (you may want to create an admin check function)
-- For now, allowing authenticated users to insert tags
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON blog_tags;
CREATE POLICY "Authenticated users can insert tags"
  ON blog_tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Blog article tags policies
DROP POLICY IF EXISTS "Anyone can view article tags" ON blog_article_tags;
CREATE POLICY "Anyone can view article tags"
  ON blog_article_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Article authors can manage article tags" ON blog_article_tags;
CREATE POLICY "Article authors can manage article tags"
  ON blog_article_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM blog_articles
      WHERE blog_articles.id = blog_article_tags.article_id
      AND blog_articles.author_id = auth.uid()
    )
  );

-- Blog article likes policies
DROP POLICY IF EXISTS "Anyone can view article likes" ON blog_article_likes;
CREATE POLICY "Anyone can view article likes"
  ON blog_article_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can like/unlike articles" ON blog_article_likes;
CREATE POLICY "Users can like/unlike articles"
  ON blog_article_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Blog article comments policies
DROP POLICY IF EXISTS "Anyone can view approved comments" ON blog_article_comments;
CREATE POLICY "Anyone can view approved comments"
  ON blog_article_comments FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own comments" ON blog_article_comments;
CREATE POLICY "Users can insert their own comments"
  ON blog_article_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON blog_article_comments;
CREATE POLICY "Users can update their own comments"
  ON blog_article_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON blog_article_comments;
CREATE POLICY "Users can delete their own comments"
  ON blog_article_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Blog reading history policies
DROP POLICY IF EXISTS "Users can view their own reading history" ON blog_article_reading_history;
CREATE POLICY "Users can view their own reading history"
  ON blog_article_reading_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reading history" ON blog_article_reading_history;
CREATE POLICY "Users can insert their own reading history"
  ON blog_article_reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reading history" ON blog_article_reading_history;
CREATE POLICY "Users can update their own reading history"
  ON blog_article_reading_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Functions and Triggers

-- Update updated_at timestamp for articles
DROP TRIGGER IF EXISTS update_blog_articles_updated_at ON blog_articles;
CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for comments
DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON blog_article_comments;
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_article_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update article like count
CREATE OR REPLACE FUNCTION update_article_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_articles
    SET like_count = like_count + 1
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_articles
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_like_count_on_insert ON blog_article_likes;
CREATE TRIGGER update_like_count_on_insert
  AFTER INSERT ON blog_article_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_article_like_count();

DROP TRIGGER IF EXISTS update_like_count_on_delete ON blog_article_likes;
CREATE TRIGGER update_like_count_on_delete
  AFTER DELETE ON blog_article_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_article_like_count();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_article_view_count(article_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_articles
  SET view_count = view_count + 1
  WHERE id = article_uuid AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_article_slug(title_text TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(title_text, '[^a-z0-9]+', '-', 'gi'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists, append number if needed
  WHILE EXISTS (SELECT 1 FROM blog_articles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate reading time (estimate based on content length)
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  reading_time INTEGER;
BEGIN
  -- Rough estimate: 200 words per minute
  word_count := array_length(string_to_array(content_text, ' '), 1);
  reading_time := GREATEST(1, CEIL(word_count::NUMERIC / 200));
  RETURN reading_time;
END;
$$ LANGUAGE plpgsql;

-- View for published articles with author info
CREATE OR REPLACE VIEW blog_articles_published AS
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

-- Grant access to the view
GRANT SELECT ON blog_articles_published TO authenticated, anon;

