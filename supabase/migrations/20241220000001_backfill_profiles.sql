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

