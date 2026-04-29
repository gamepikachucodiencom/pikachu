-- Add ready flags for online games

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS player1_ready boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS player2_ready boolean NOT NULL DEFAULT false;

