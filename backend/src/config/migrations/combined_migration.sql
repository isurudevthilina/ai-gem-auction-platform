-- ============================================================
-- GemBid — Auction Schema Migration 001
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. PROFILES (mirrors auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT,
    role        TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('admin', 'seller', 'buyer')),
    avatar_url  TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
    id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name      TEXT NOT NULL UNIQUE,
    slug      TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL
);

INSERT INTO public.categories (name, slug) VALUES
    ('Sapphire', 'sapphire'),
    ('Ruby', 'ruby'),
    ('Emerald', 'emerald'),
    ('Diamond', 'diamond'),
    ('Topaz', 'topaz'),
    ('Alexandrite', 'alexandrite'),
    ('Spinel', 'spinel'),
    ('Tourmaline', 'tourmaline')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 3. GEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gems (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    carat_weight    NUMERIC(8,3),
    cut             TEXT,
    clarity         TEXT,
    color           TEXT,
    origin          TEXT,
    image_url       TEXT,
    listing_type    TEXT NOT NULL DEFAULT 'auction' CHECK (listing_type IN ('auction', 'direct_sell')),
    status          TEXT NOT NULL DEFAULT 'draft'  CHECK (status IN ('draft', 'listed', 'sold')),
    buy_now_price   NUMERIC(12,2),
    predicted_price NUMERIC(12,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. AUCTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auctions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gem_id            UUID NOT NULL REFERENCES public.gems(id) ON DELETE CASCADE,
    seller_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    starting_price    NUMERIC(12,2) NOT NULL CHECK (starting_price >= 0),
    current_price     NUMERIC(12,2) NOT NULL CHECK (current_price >= 0),
    min_bid_increment NUMERIC(12,2) NOT NULL DEFAULT 10 CHECK (min_bid_increment > 0),
    start_time        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time          TIMESTAMPTZ NOT NULL,
    status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    winner_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    bid_count         INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT end_after_start CHECK (end_time > start_time)
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_auctions_status       ON public.auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_seller_id    ON public.auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_end_time     ON public.auctions(end_time);

-- ─────────────────────────────────────────────
-- 5. BIDS (immutable — no UPDATE allowed)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bids (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id  UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    bidder_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    is_winning  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent UPDATE on bids (immutable audit log)
CREATE OR REPLACE RULE no_update_bids AS ON UPDATE TO public.bids DO INSTEAD NOTHING;

CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id  ON public.bids(bidder_id);

-- ─────────────────────────────────────────────
-- 6. TRANSACTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id  UUID REFERENCES public.auctions(id) ON DELETE SET NULL,
    gem_id      UUID REFERENCES public.gems(id) ON DELETE SET NULL,
    buyer_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    seller_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount      NUMERIC(12,2) NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('auction_win', 'buy_now')),
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 7. WATCHLIST_FOLDERS + WATCHLIST
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.watchlist_folders (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name       TEXT NOT NULL DEFAULT 'My Watchlist',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.watchlist (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    folder_id  UUID REFERENCES public.watchlist_folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, auction_id)
);

-- ─────────────────────────────────────────────
-- 8. NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('outbid', 'auction_won', 'auction_ending', 'new_bid', 'auction_cancelled')),
    data        JSONB NOT NULL DEFAULT '{}',
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);

-- ─────────────────────────────────────────────
-- 9. ENABLE REALTIME on BIDS + AUCTIONS (idempotent)
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'bids'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'auctions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
  END IF;
END $$;
-- ============================================================
-- GemBid — place_bid() Atomic RPC Function
-- Run AFTER 001_auction_schema.sql in Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────
-- Row Level Security Policies
-- ─────────────────────────────────────────────

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_read_all"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_read_all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- GEMS
ALTER TABLE public.gems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gems_read_listed"   ON public.gems;
DROP POLICY IF EXISTS "gems_insert_seller" ON public.gems;
DROP POLICY IF EXISTS "gems_update_seller" ON public.gems;
DROP POLICY IF EXISTS "gems_delete_seller" ON public.gems;
CREATE POLICY "gems_read_listed"    ON public.gems FOR SELECT USING (status = 'listed' OR seller_id = auth.uid());
CREATE POLICY "gems_insert_seller"  ON public.gems FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "gems_update_seller"  ON public.gems FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "gems_delete_seller"  ON public.gems FOR DELETE USING (auth.uid() = seller_id);

-- AUCTIONS
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auctions_read_all"      ON public.auctions;
DROP POLICY IF EXISTS "auctions_insert_seller" ON public.auctions;
DROP POLICY IF EXISTS "auctions_update_seller" ON public.auctions;
DROP POLICY IF EXISTS "auctions_delete_seller" ON public.auctions;
CREATE POLICY "auctions_read_all"      ON public.auctions FOR SELECT USING (true);
CREATE POLICY "auctions_insert_seller" ON public.auctions FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "auctions_update_seller" ON public.auctions FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "auctions_delete_seller" ON public.auctions FOR DELETE USING (auth.uid() = seller_id);

-- BIDS: anyone reads; only place_bid RPC can insert (SECURITY DEFINER bypasses RLS)
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bids_read_all" ON public.bids;
CREATE POLICY "bids_read_all" ON public.bids FOR SELECT USING (true);

-- WATCHLIST
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "watchlist_own" ON public.watchlist;
CREATE POLICY "watchlist_own" ON public.watchlist USING (auth.uid() = user_id);

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications USING (auth.uid() = user_id);

-- TRANSACTIONS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transactions_parties" ON public.transactions;
CREATE POLICY "transactions_parties" ON public.transactions FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ─────────────────────────────────────────────
-- place_bid() — Atomic Bid Placement RPC
-- ─────────────────────────────────────────────
-- Called from frontend:
--   supabase.rpc('place_bid', { p_auction_id, p_bidder_id, p_amount })
-- Returns JSON: { success, new_price, bid_id, error_code, error_message }

CREATE OR REPLACE FUNCTION public.place_bid(
    p_auction_id UUID,
    p_bidder_id  UUID,
    p_amount     NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auction         RECORD;
    v_new_bid_id      UUID;
    v_min_required    NUMERIC;
BEGIN
    -- ── 1. Lock the auction row to prevent concurrent race conditions ──
    SELECT * INTO v_auction
    FROM public.auctions
    WHERE id = p_auction_id
    FOR UPDATE;

    -- ── 2. Existence check ──
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'auction_not_found',
            'error_message', 'Auction does not exist.'
        );
    END IF;

    -- ── 3. Status check ──
    IF v_auction.status != 'active' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'auction_not_active',
            'error_message', 'This auction is ' || v_auction.status || '.'
        );
    END IF;

    -- ── 4. Time window check ──
    IF NOW() < v_auction.start_time THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'auction_not_started',
            'error_message', 'Auction has not started yet.'
        );
    END IF;

    IF NOW() > v_auction.end_time THEN
        -- Auto-complete expired auction
        UPDATE public.auctions SET status = 'completed' WHERE id = p_auction_id;
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'auction_ended',
            'error_message', 'Auction has ended.'
        );
    END IF;

    -- ── 5. Bidder ≠ seller ──
    IF p_bidder_id = v_auction.seller_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'seller_cannot_bid',
            'error_message', 'You cannot bid on your own auction.'
        );
    END IF;

    -- ── 6. Minimum bid check ──
    v_min_required := v_auction.current_price + v_auction.min_bid_increment;
    IF p_amount < v_min_required THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'bid_too_low',
            'error_message', 'Minimum bid is ' || v_min_required || '. You bid ' || p_amount || '.',
            'min_required', v_min_required
        );
    END IF;

    -- ── 7. Mark previous winning bid as not winning ──
    UPDATE public.bids
    SET is_winning = false
    WHERE auction_id = p_auction_id AND is_winning = true;

    -- ── 8. Insert new bid ──
    INSERT INTO public.bids (auction_id, bidder_id, amount, is_winning)
    VALUES (p_auction_id, p_bidder_id, p_amount, true)
    RETURNING id INTO v_new_bid_id;

    -- ── 9. Update auction current price + bid count ──
    UPDATE public.auctions
    SET
        current_price = p_amount,
        bid_count     = bid_count + 1
    WHERE id = p_auction_id;

    -- ── 10. Notify previous top bidder they've been outbid ──
    -- (Insert notification for any previous winning bidder if different from new bidder)
    INSERT INTO public.notifications (user_id, type, data)
    SELECT DISTINCT b.bidder_id,
           'outbid'::text,
           jsonb_build_object(
               'auction_id', p_auction_id,
               'new_price',  p_amount
           )
    FROM public.bids b
    WHERE b.auction_id = p_auction_id
      AND b.bidder_id != p_bidder_id
      AND b.id != v_new_bid_id
    ORDER BY b.bidder_id;

    -- ── 11. Return success ──
    RETURN jsonb_build_object(
        'success',   true,
        'bid_id',    v_new_bid_id,
        'new_price', p_amount,
        'auction_id', p_auction_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error_code', 'internal_error',
        'error_message', SQLERRM
    );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.place_bid(UUID, UUID, NUMERIC) TO authenticated;

-- ─────────────────────────────────────────────
-- complete_expired_auctions() — Cron / manual cleanup
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_expired_auctions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count INTEGER;
BEGIN
    WITH updated AS (
        UPDATE public.auctions
        SET
            status    = 'completed',
            winner_id = (
                SELECT bidder_id FROM public.bids
                WHERE auction_id = auctions.id AND is_winning = true
                LIMIT 1
            )
        WHERE status = 'active' AND end_time < NOW()
        RETURNING id, winner_id, seller_id,
                  current_price, gem_id
    ),
    txn_insert AS (
        INSERT INTO public.transactions
            (auction_id, gem_id, buyer_id, seller_id, amount, type, status)
        SELECT id, gem_id, winner_id, seller_id, current_price, 'auction_win', 'pending'
        FROM updated
        WHERE winner_id IS NOT NULL
    )
    SELECT COUNT(*) INTO v_count FROM updated;

    -- Mark gems as sold
    UPDATE public.gems g
    SET status = 'sold'
    FROM public.auctions a
    WHERE a.gem_id = g.id AND a.status = 'completed' AND a.winner_id IS NOT NULL;

    RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_expired_auctions() TO service_role;

-- ============================================================
-- GemBid — Migration: Certificates & Reviews
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Run AFTER combined_migration.sql
-- ============================================================

-- ─────────────────────────────────────────────
-- 9. CERTIFICATES
-- Stores gem certification documents uploaded by sellers.
-- Admin verifies or rejects each submission.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificates (
    id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    gem_id             UUID        NOT NULL REFERENCES public.gems(id)     ON DELETE CASCADE,
    seller_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    certificate_number TEXT,
    issued_by          TEXT        NOT NULL DEFAULT 'Other'
                           CHECK (issued_by IN ('GIA', 'AGS', 'IGI', 'GRS', 'GIT', 'GGTL', 'Other')),
    issued_date        DATE,
    document_url       TEXT        NOT NULL,
    status             TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by        UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at        TIMESTAMPTZ,
    notes              TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One certificate per gem
CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_gem_id    ON public.certificates(gem_id);
CREATE INDEX        IF NOT EXISTS idx_certificates_status    ON public.certificates(status);
CREATE INDEX        IF NOT EXISTS idx_certificates_seller_id ON public.certificates(seller_id);

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS certificates_updated_at ON public.certificates;
CREATE TRIGGER certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — CERTIFICATES
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certs_read_own_or_admin_or_verified" ON public.certificates;
CREATE POLICY "certs_read_own_or_admin_or_verified"
    ON public.certificates FOR SELECT
    USING (
        seller_id = auth.uid()
        OR status = 'verified'
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "certs_insert_seller" ON public.certificates;
CREATE POLICY "certs_insert_seller"
    ON public.certificates FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "certs_update_seller_or_admin" ON public.certificates;
CREATE POLICY "certs_update_seller_or_admin"
    ON public.certificates FOR UPDATE
    USING (
        (auth.uid() = seller_id AND status = 'pending')
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "certs_delete_seller" ON public.certificates;
CREATE POLICY "certs_delete_seller"
    ON public.certificates FOR DELETE
    USING (auth.uid() = seller_id AND status = 'pending');


-- ─────────────────────────────────────────────
-- 10. REVIEWS
-- Buyers leave a 1–5 rating + comment for a seller
-- after a completed transaction. One review per transaction.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
    id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id UUID        NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    rating         SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT reviews_unique_per_transaction UNIQUE (reviewer_id, transaction_id),
    CONSTRAINT reviewer_ne_seller             CHECK  (reviewer_id != seller_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller_id      ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id    ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_transaction_id ON public.reviews(transaction_id);

DROP TRIGGER IF EXISTS reviews_updated_at ON public.reviews;
CREATE TRIGGER reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — REVIEWS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_read_all" ON public.reviews;
CREATE POLICY "reviews_read_all"
    ON public.reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "reviews_insert_buyer" ON public.reviews;
CREATE POLICY "reviews_insert_buyer"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id
        AND EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
              AND t.buyer_id = auth.uid()
              AND t.status = 'completed'
        )
    );

DROP POLICY IF EXISTS "reviews_update_reviewer" ON public.reviews;
CREATE POLICY "reviews_update_reviewer"
    ON public.reviews FOR UPDATE
    USING (
        auth.uid() = reviewer_id
        AND created_at > NOW() - INTERVAL '7 days'
    );

DROP POLICY IF EXISTS "reviews_delete_reviewer_or_admin" ON public.reviews;
CREATE POLICY "reviews_delete_reviewer_or_admin"
    ON public.reviews FOR DELETE
    USING (
        auth.uid() = reviewer_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );


-- ─────────────────────────────────────────────
-- HELPER VIEW — seller_ratings
-- Pre-computes avg + star breakdown per seller.
-- Usage: SELECT * FROM seller_ratings WHERE seller_id = '<uuid>';
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW public.seller_ratings AS
SELECT
    seller_id,
    COUNT(*)::INTEGER                          AS review_count,
    ROUND(AVG(rating)::NUMERIC, 2)             AS avg_rating,
    COUNT(*) FILTER (WHERE rating = 5)::INTEGER AS five_star,
    COUNT(*) FILTER (WHERE rating = 4)::INTEGER AS four_star,
    COUNT(*) FILTER (WHERE rating = 3)::INTEGER AS three_star,
    COUNT(*) FILTER (WHERE rating = 2)::INTEGER AS two_star,
    COUNT(*) FILTER (WHERE rating = 1)::INTEGER AS one_star
FROM public.reviews
GROUP BY seller_id;

GRANT SELECT ON public.seller_ratings TO authenticated;


-- ─────────────────────────────────────────────
-- GEMS TABLE — add treatment column
-- (used by AI Predictor; safe to re-run)
-- ─────────────────────────────────────────────
ALTER TABLE public.gems
    ADD COLUMN IF NOT EXISTS treatment TEXT DEFAULT 'None'
        CHECK (treatment IN ('None', 'Heat Treated', 'Fracture Filled', 'Irradiation'));

-- ============================================================
-- END OF MIGRATION
-- ============================================================