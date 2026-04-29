-- Phase B: Remove legacy currency columns after codebase migration to KNB.

ALTER TABLE public.profiles
DROP COLUMN IF EXISTS coins,
DROP COLUMN IF EXISTS gems;
