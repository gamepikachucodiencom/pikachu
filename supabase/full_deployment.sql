-- ============================================================================
-- FULL DATABASE DEPLOYMENT SCRIPT
-- ============================================================================
-- This file combines all SQL files from the project for manual deployment
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

/* ---------------------------------------------------- */
/* SOURCE: database/schema.sql                         */
/* ---------------------------------------------------- */

-- Chinese Chess Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE NOT NULL,
  avatar TEXT,
  coins INTEGER DEFAULT 100 NOT NULL,
  gems INTEGER DEFAULT 0 NOT NULL,
  rating INTEGER DEFAULT 1000 NOT NULL,
  wins INTEGER DEFAULT 0 NOT NULL,
  losses INTEGER DEFAULT 0 NOT NULL,
  draws INTEGER DEFAULT 0 NOT NULL,
  is_banned BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Shop items table
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('coins', 'gems')),
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('piece', 'board', 'theme', 'powerup', 'other')),
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'deposit', 'refund', 'reward')),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('coins', 'gems')),
  description TEXT,
  shop_item_id UUID REFERENCES shop_items(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User purchases (track what users own)
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shop_item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, shop_item_id)
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code TEXT UNIQUE,
  player1_id UUID REFERENCES profiles(id),
  player2_id UUID REFERENCES profiles(id),
  game_type TEXT NOT NULL CHECK (game_type IN ('human-vs-human', 'human-vs-ai', 'hidden-chess')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'paused', 'finished')),
  current_player TEXT CHECK (current_player IN ('red', 'black')),
  board_fen TEXT NOT NULL,
  move_history JSONB DEFAULT '[]'::jsonb,
  winner_id UUID REFERENCES profiles(id),
  ai_difficulty TEXT CHECK (ai_difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Game moves table (for detailed move history)
CREATE TABLE IF NOT EXISTS game_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  from_position TEXT NOT NULL,
  to_position TEXT NOT NULL,
  piece_type TEXT,
  captured_piece TEXT,
  player_color TEXT NOT NULL CHECK (player_color IN ('red', 'black')),
  move_notation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Shop items policies
DROP POLICY IF EXISTS "Anyone can view shop items" ON shop_items;
CREATE POLICY "Anyone can view shop items"
  ON shop_items FOR SELECT
  USING (true);

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User purchases policies
DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
CREATE POLICY "Users can view own purchases"
  ON user_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Games policies
DROP POLICY IF EXISTS "Users can view games they're in" ON games;
CREATE POLICY "Users can view games they're in"
  ON games FOR SELECT
  USING (
    auth.uid() = player1_id OR
    auth.uid() = player2_id OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_banned = false
    )
  );

DROP POLICY IF EXISTS "Users can create games" ON games;
CREATE POLICY "Users can create games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

DROP POLICY IF EXISTS "Users can update games they're in" ON games;
CREATE POLICY "Users can update games they're in"
  ON games FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Game moves policies
DROP POLICY IF EXISTS "Users can view moves for games they're in" ON game_moves;
CREATE POLICY "Users can view moves for games they're in"
  ON game_moves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_moves.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, coins)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_game_moves_game_id ON game_moves(game_id);


/* ---------------------------------------------------- */
/* SOURCE: supabase/migrations/20241220000000_create_profiles.sql */
/* ---------------------------------------------------- */

-- Migration: Create/Update profiles table as Source of Truth for user data
-- This migration ensures profiles table has all required fields and proper structure

-- Step 1: Create profiles table if it doesn't exist, or alter if it does
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  elo_rating INTEGER DEFAULT 1200 NOT NULL,
  wins INTEGER DEFAULT 0 NOT NULL,
  losses INTEGER DEFAULT 0 NOT NULL,
  draws INTEGER DEFAULT 0 NOT NULL,
  current_theme_id TEXT DEFAULT 'default' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Step 2: Add missing columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- Add elo_rating if it doesn't exist (might be named 'rating' in old schema)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'elo_rating'
  ) THEN
    -- Check if 'rating' column exists and migrate data
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'rating'
    ) THEN
      ALTER TABLE public.profiles 
      ADD COLUMN elo_rating INTEGER DEFAULT 1200 NOT NULL;
      UPDATE public.profiles 
      SET elo_rating = COALESCE(rating, 1200) 
      WHERE elo_rating IS NULL;
    ELSE
      ALTER TABLE public.profiles 
      ADD COLUMN elo_rating INTEGER DEFAULT 1200 NOT NULL;
    END IF;
  END IF;

  -- Add current_theme_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'current_theme_id'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN current_theme_id TEXT DEFAULT 'default' NOT NULL;
  END IF;

  -- Add avatar_url if it doesn't exist (might be named 'avatar' in old schema)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    -- Check if 'avatar' column exists and migrate data
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'avatar'
    ) THEN
      ALTER TABLE public.profiles 
      ADD COLUMN avatar_url TEXT;
      UPDATE public.profiles 
      SET avatar_url = avatar 
      WHERE avatar_url IS NULL AND avatar IS NOT NULL;
    ELSE
      ALTER TABLE public.profiles 
      ADD COLUMN avatar_url TEXT;
    END IF;
  END IF;

  -- Ensure username is NOT NULL (add default if needed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'username'
    AND is_nullable = 'YES'
  ) THEN
    -- Update NULL usernames with a default
    UPDATE public.profiles 
    SET username = COALESCE(username, 'user_' || SUBSTRING(id::text, 1, 8))
    WHERE username IS NULL;
    
    ALTER TABLE public.profiles 
    ALTER COLUMN username SET NOT NULL;
  END IF;
END $$;

-- Step 3: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create RLS Policies
-- SELECT: Public (everyone can see opponents' ELO)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- UPDATE: Users can only update their own row
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT: Users can insert their own profile (for manual creation if trigger fails)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 5: Create or replace trigger function for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_username TEXT;
BEGIN
  -- Generate username from email or metadata
  default_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'user_' || SUBSTRING(NEW.id::text, 1, 8)
  );

  -- Insert profile with all required fields
  INSERT INTO public.profiles (
    id,
    username,
    avatar_url,
    elo_rating,
    wins,
    losses,
    draws,
    current_theme_id
  )
  VALUES (
    NEW.id,
    default_username,
    NEW.raw_user_meta_data->>'avatar_url',
    1200, -- Default ELO
    0,
    0,
    0,
    'default'
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists

  RETURN NEW;
END;
$$;

-- Step 6: Create or replace trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Step 8: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_elo_rating ON public.profiles(elo_rating);
CREATE INDEX IF NOT EXISTS idx_profiles_current_theme_id ON public.profiles(current_theme_id);

-- Step 10: Add comments for documentation
COMMENT ON TABLE public.profiles IS 'Source of Truth for user data. auth.users is strictly for authentication.';
COMMENT ON COLUMN public.profiles.elo_rating IS 'ELO rating for matchmaking and rankings';
COMMENT ON COLUMN public.profiles.current_theme_id IS 'Currently selected theme ID (references themes)';


/* ---------------------------------------------------- */
/* SOURCE: supabase/migrations/20241220000001_backfill_profiles.sql */
/* ---------------------------------------------------- */

-- Data Migration: Backfill existing users from auth.users into public.profiles
-- This ensures existing users don't lose access after the refactor
-- Run this AFTER the create_profiles migration

-- Step 1: Insert profiles for users that don't have one yet
INSERT INTO public.profiles (
  id,
  username,
  avatar_url,
  elo_rating,
  wins,
  losses,
  draws,
  current_theme_id,
  created_at,
  updated_at
)
SELECT 
  au.id,
  -- Generate username from metadata or email
  COALESCE(
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1),
    'user_' || SUBSTRING(au.id::text, 1, 8)
  ) AS username,
  -- Get avatar from metadata
  au.raw_user_meta_data->>'avatar_url' AS avatar_url,
  -- Default ELO rating
  1200 AS elo_rating,
  -- Default stats
  0 AS wins,
  0 AS losses,
  0 AS draws,
  -- Default theme
  'default' AS current_theme_id,
  -- Use user creation time
  au.created_at,
  NOW() AS updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.profiles p 
  WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Migrate data from old profile structure if it exists
-- This handles cases where profiles table had different column names
DO $$
BEGIN
  -- Migrate 'rating' to 'elo_rating' if rating column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'rating'
  ) THEN
    UPDATE public.profiles
    SET elo_rating = COALESCE(rating, 1200)
    WHERE elo_rating = 1200 AND rating IS NOT NULL;
  END IF;

  -- Migrate 'avatar' to 'avatar_url' if avatar column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar'
  ) THEN
    UPDATE public.profiles
    SET avatar_url = avatar
    WHERE avatar_url IS NULL AND avatar IS NOT NULL;
  END IF;
END $$;

-- Step 3: Ensure all profiles have required fields
UPDATE public.profiles
SET 
  username = COALESCE(username, 'user_' || SUBSTRING(id::text, 1, 8)),
  elo_rating = COALESCE(elo_rating, 1200),
  wins = COALESCE(wins, 0),
  losses = COALESCE(losses, 0),
  draws = COALESCE(draws, 0),
  current_theme_id = COALESCE(current_theme_id, 'default')
WHERE 
  username IS NULL 
  OR elo_rating IS NULL 
  OR wins IS NULL 
  OR losses IS NULL 
  OR draws IS NULL 
  OR current_theme_id IS NULL;

-- Step 4: Log migration results
DO $$
DECLARE
  migrated_count INTEGER;
  total_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM public.profiles;
  SELECT COUNT(*) INTO total_users FROM auth.users;
  
  RAISE NOTICE 'Migration complete: % profiles created from % total users', migrated_count, total_users;
END $$;


/* ---------------------------------------------------- */
/* SOURCE: database/blog_schema.sql                    */
/* ---------------------------------------------------- */

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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(article_id, user_id)
);

-- Article comments table
CREATE TABLE IF NOT EXISTS blog_article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- View for published articles with author info (SECURITY INVOKER so view respects RLS)
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

-- Grant access to the view
GRANT SELECT ON blog_articles_published TO authenticated, anon;


/* ---------------------------------------------------- */
/* SOURCE: database/schema_updates.sql                 */
/* ---------------------------------------------------- */

-- Additional schema updates for online play
-- Run this in Supabase SQL Editor after the main schema

-- Add is_public and timer fields to games table
ALTER TABLE games
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS turn_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_per_move INTEGER DEFAULT 60; -- seconds per move

-- Add spectators table for viewing games
CREATE TABLE IF NOT EXISTS game_spectators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  spectator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(game_id, spectator_id)
);

-- Add index for spectators
CREATE INDEX IF NOT EXISTS idx_game_spectators_game_id ON game_spectators(game_id);
CREATE INDEX IF NOT EXISTS idx_game_spectators_spectator_id ON game_spectators(spectator_id);

-- Enable RLS for spectators
ALTER TABLE game_spectators ENABLE ROW LEVEL SECURITY;

-- Spectators policies
DROP POLICY IF EXISTS "Anyone can view spectators" ON game_spectators;
CREATE POLICY "Anyone can view spectators"
  ON game_spectators FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can join as spectators" ON game_spectators;
CREATE POLICY "Users can join as spectators"
  ON game_spectators FOR INSERT
  WITH CHECK (auth.uid() = spectator_id);

DROP POLICY IF EXISTS "Users can leave as spectators" ON game_spectators;
CREATE POLICY "Users can leave as spectators"
  ON game_spectators FOR DELETE
  USING (auth.uid() = spectator_id);

-- Update games table to ensure room_code is indexed and unique
-- (Already in main schema, but ensuring it exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_games_room_code_unique ON games(room_code) WHERE room_code IS NOT NULL;

-- Function to generate unique room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  -- Check if code already exists
  WHILE EXISTS (SELECT 1 FROM games WHERE room_code = result) LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;


/* ---------------------------------------------------- */
/* SOURCE: database/user_profiles.sql                   */
/* NOTE: This file may be redundant as the migrations   */
/* above handle profile creation. Included for          */
/* completeness but may conflict with migration logic. */
/* ---------------------------------------------------- */

-- 1. Create the Profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  
  -- Game Specific Stats
  elo_rating integer default 1200,
  wins integer default 0,
  losses integer default 0,
  draws integer default 0,
  
  -- Settings
  current_theme_id text default 'default',
  
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable RLS (Security)
alter table public.profiles enable row level security;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. The Magic Trigger (Auto-create profile on Sign Up)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name', -- Get from Google/Email metadata
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================================
-- END OF FULL DEPLOYMENT SCRIPT
-- ============================================================================
-- All SQL files have been combined above
-- Original files remain unchanged in their respective directories
-- ============================================================================

