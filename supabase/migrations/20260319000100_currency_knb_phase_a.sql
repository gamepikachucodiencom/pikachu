-- Phase A: Introduce canonical KNB currency with backward-compatible backfill.

-- 1) Profiles: add canonical knb balance and backfill from legacy columns.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS knb INTEGER;

UPDATE public.profiles
SET knb = COALESCE(knb, coins, 0)
WHERE knb IS NULL;

ALTER TABLE public.profiles
ALTER COLUMN knb SET DEFAULT 0;

UPDATE public.profiles
SET knb = 0
WHERE knb IS NULL;

ALTER TABLE public.profiles
ALTER COLUMN knb SET NOT NULL;

-- 2) Shop items: normalize currency to knb.
ALTER TABLE public.shop_items
ALTER COLUMN currency TYPE TEXT;

UPDATE public.shop_items
SET currency = 'knb'
WHERE currency IN ('coins', 'gems');

ALTER TABLE public.shop_items
DROP CONSTRAINT IF EXISTS shop_items_currency_check;

ALTER TABLE public.shop_items
ADD CONSTRAINT shop_items_currency_check
CHECK (currency = 'knb');

ALTER TABLE public.shop_items
ALTER COLUMN currency SET DEFAULT 'knb';

-- 3) Transactions: normalize currency to knb.
ALTER TABLE public.transactions
ALTER COLUMN currency TYPE TEXT;

UPDATE public.transactions
SET currency = 'knb'
WHERE currency IN ('coins', 'gems');

ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_currency_check;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_currency_check
CHECK (currency = 'knb');

ALTER TABLE public.transactions
ALTER COLUMN currency SET DEFAULT 'knb';
