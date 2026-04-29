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

