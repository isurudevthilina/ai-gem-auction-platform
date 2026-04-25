-- ════════════════════════════════════════════════════════════════════
-- TABLE 11 — wallets
-- Virtual wallet balances for simulated deposits and top-ups.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.wallets (
    user_id           UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    available_balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
    locked_balance     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (locked_balance >= 0),
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS wallets_set_updated_at ON public.wallets;
CREATE TRIGGER wallets_set_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_select_own" ON public.wallets;
CREATE POLICY "wallets_select_own" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallets_update_own" ON public.wallets;
CREATE POLICY "wallets_update_own" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════
-- TABLE 12 — wallet_topups
-- Demo payment records for simulated card top-ups.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.wallet_topups (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    card_last4        TEXT,
    payment_reference TEXT,
    metadata          JSONB NOT NULL DEFAULT '{}',
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_topups_user_id ON public.wallet_topups(user_id);
ALTER TABLE public.wallet_topups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_topups_select_own" ON public.wallet_topups;
CREATE POLICY "wallet_topups_select_own" ON public.wallet_topups
    FOR SELECT USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════
-- TABLE 13 — wallet_holds
-- Deposit locks for active bids.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.wallet_holds (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    auction_id              UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    bid_amount              NUMERIC(12,2) NOT NULL CHECK (bid_amount > 0),
    deposit_amount          NUMERIC(12,2) NOT NULL CHECK (deposit_amount >= 0),
    status                  TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'released', 'transferred')),
    transferred_to_user_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    released_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS wallet_holds_set_updated_at ON public.wallet_holds;
CREATE TRIGGER wallet_holds_set_updated_at
    BEFORE UPDATE ON public.wallet_holds
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_holds_unique_locked
    ON public.wallet_holds(user_id, auction_id)
    WHERE status = 'locked';

ALTER TABLE public.wallet_holds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_holds_select_own" ON public.wallet_holds;
CREATE POLICY "wallet_holds_select_own" ON public.wallet_holds
    FOR SELECT USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════
-- TABLE 14 — second_chance_offers
-- Seller-offered fallback purchase for the next highest bidder.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.second_chance_offers (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id            UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    transaction_id        UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    original_winner_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    next_bidder_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount                NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'completed')),
    expires_at            TIMESTAMPTZ,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS second_chance_offers_set_updated_at ON public.second_chance_offers;
CREATE TRIGGER second_chance_offers_set_updated_at
    BEFORE UPDATE ON public.second_chance_offers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_second_chance_offers_next_bidder ON public.second_chance_offers(next_bidder_id, status);
CREATE INDEX IF NOT EXISTS idx_second_chance_offers_seller_id ON public.second_chance_offers(seller_id, status);

ALTER TABLE public.second_chance_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "second_chance_offers_select_own" ON public.second_chance_offers;
CREATE POLICY "second_chance_offers_select_own" ON public.second_chance_offers
    FOR SELECT USING (auth.uid() = next_bidder_id OR auth.uid() = seller_id);
