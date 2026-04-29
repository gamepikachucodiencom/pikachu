-- Additional schema updates for online play
-- Run this in Supabase SQL Editor after the main schema

-- Add is_public and timer fields to games table
ALTER TABLE games
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS turn_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_per_move INTEGER DEFAULT 60; -- seconds per move

-- Add spectators table for viewing games
CREATE TABLE IF NOT EXISTS game_spectators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

