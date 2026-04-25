-- 010_wallet_gems_and_withdrawals.sql
-- Adds in-app Gem purchases and simulated bank withdrawals for virtual wallet.

ALTER TABLE public.wallets
    ADD COLUMN IF NOT EXISTS gem_balance INTEGER NOT NULL DEFAULT 0 CHECK (gem_balance >= 0);

CREATE TABLE IF NOT EXISTS public.wallet_gem_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    usd_amount NUMERIC(12,2) NOT NULL CHECK (usd_amount > 0),
    gems_amount INTEGER NOT NULL CHECK (gems_amount > 0),
    exchange_rate INTEGER NOT NULL CHECK (exchange_rate > 0),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_gem_purchases_user_id ON public.wallet_gem_purchases(user_id, created_at DESC);

ALTER TABLE public.wallet_gem_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_gem_purchases_select_own" ON public.wallet_gem_purchases;
CREATE POLICY "wallet_gem_purchases_select_own" ON public.wallet_gem_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.wallet_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    transfer_reference TEXT,
    status TEXT NOT NULL DEFAULT 'successful' CHECK (status IN ('successful', 'failed')),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_withdrawals_user_id ON public.wallet_withdrawals(user_id, created_at DESC);

ALTER TABLE public.wallet_withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_withdrawals_select_own" ON public.wallet_withdrawals;
CREATE POLICY "wallet_withdrawals_select_own" ON public.wallet_withdrawals
    FOR SELECT USING (auth.uid() = user_id);
