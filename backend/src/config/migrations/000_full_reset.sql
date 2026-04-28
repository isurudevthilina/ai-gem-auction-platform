/*
══════════════════════════════════════════════════════════════════════════════════
  GemBid LK — FULL DATABASE RESET & MIGRATION
══════════════════════════════════════════════════════════════════════════════════

  HOW TO RUN:
    1. Go to your Supabase Dashboard → SQL Editor → New Query
    2. Paste this entire file
    3. Click "Run"

  ⚠  WARNING: This will DROP every GemBid table and recreate them from scratch.
     All existing data will be deleted. auth.users is NOT touched.

  After running, also ensure Realtime is enabled:
    Dashboard → Database → Replication → supabase_realtime
    → toggle ON for: bids, auctions, notifications

══════════════════════════════════════════════════════════════════════════════════
*/


-- ════════════════════════════════════════════════════════════════════════════════
-- STEP 0: NUCLEAR CLEANUP — Drop everything in safe dependency order
-- ════════════════════════════════════════════════════════════════════════════════

-- Remove tables from realtime publication first (ignore errors)
DO $$ BEGIN
    BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.bids;           EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.auctions;       EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- Drop view
DROP VIEW IF EXISTS public.seller_ratings CASCADE;

-- Drop RPC functions
DROP FUNCTION IF EXISTS public.place_bid(UUID, UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.complete_expired_auctions() CASCADE;
DROP FUNCTION IF EXISTS public.buy_now(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.delete_user_data(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.delete_auction_data(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.next_review_post_sequence(UUID, UUID) CASCADE;

-- Drop triggers on auth.users (must come before dropping the functions they call)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login   ON auth.users;

-- Drop trigger functions
DROP FUNCTION IF EXISTS public.handle_new_user()   CASCADE;
DROP FUNCTION IF EXISTS public.update_last_login()  CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at()     CASCADE;

-- Drop all tables (CASCADE handles FK references between them)
DROP TABLE IF EXISTS public.wallet_withdrawals   CASCADE;
DROP TABLE IF EXISTS public.wallet_gem_purchases CASCADE;
DROP TABLE IF EXISTS public.second_chance_offers CASCADE;
DROP TABLE IF EXISTS public.wallet_holds        CASCADE;
DROP TABLE IF EXISTS public.wallet_topups       CASCADE;
DROP TABLE IF EXISTS public.wallets             CASCADE;
DROP TABLE IF EXISTS public.review_reports      CASCADE;
DROP TABLE IF EXISTS public.reviews             CASCADE;
DROP TABLE IF EXISTS public.watchlist           CASCADE;
DROP TABLE IF EXISTS public.watchlist_folders   CASCADE;
DROP TABLE IF EXISTS public.certificates        CASCADE;
DROP TABLE IF EXISTS public.notifications       CASCADE;
DROP TABLE IF EXISTS public.transactions        CASCADE;
DROP TABLE IF EXISTS public.bids               CASCADE;
DROP TABLE IF EXISTS public.auctions            CASCADE;
DROP TABLE IF EXISTS public.gems               CASCADE;
DROP TABLE IF EXISTS public.categories          CASCADE;
DROP TABLE IF EXISTS public.profiles            CASCADE;


-- ════════════════════════════════════════════════════════════════════════════════
-- STEP 1: EXTENSIONS
-- ════════════════════════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ════════════════════════════════════════════════════════════════════════════════
-- STEP 2: SHARED UTILITY — set_updated_at() trigger function
-- ════════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 1 — profiles
-- Mirrors auth.users. Auto-created on signup via trigger.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.profiles (
    id                           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email                        TEXT NOT NULL,
    full_name                    TEXT,
    role                         TEXT NOT NULL DEFAULT 'buyer'
                                   CHECK (role IN ('admin', 'seller', 'buyer')),
    avatar_url                   TEXT,
    is_verified                  BOOLEAN DEFAULT FALSE,
    phone_number                 TEXT,
    district                     TEXT,
    province                     TEXT,
    city                         TEXT,
    address_line1                TEXT,
    address_line2                TEXT,
    postal_code                  TEXT,
    nic_number                   TEXT,
    business_name                TEXT,
    business_registration_number TEXT,
    business_address             TEXT,
    email_verified               BOOLEAN DEFAULT FALSE,
    last_login_at                TIMESTAMPTZ,
    last_activity_at             TIMESTAMPTZ,
    created_at                   TIMESTAMPTZ DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-set updated_at
CREATE TRIGGER profiles_set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger function: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    new_user_id UUID := NEW.id;
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new_user_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'buyer')
    )
    ON CONFLICT (id) DO NOTHING;

    -- Auto-create the system "Ended" folder for every new user
    INSERT INTO public.watchlist_folders (user_id, name, is_system)
    VALUES (new_user_id, 'Ended', true)
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function: auto-update last_login_at
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE public.profiles SET last_login_at = NOW() WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.update_last_login();

-- Indexes
CREATE INDEX idx_profiles_email ON public.profiles (email);
CREATE INDEX idx_profiles_role  ON public.profiles (role);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role IN ('buyer', 'seller'));


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 2 — categories
-- Gem type taxonomy with parent/child support.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_public" ON public.categories
    FOR SELECT USING (true);

-- Seed parent categories
INSERT INTO public.categories (name, slug) VALUES
    ('Sapphire',    'sapphire'),
    ('Ruby',        'ruby'),
    ('Alexandrite', 'alexandrite'),
    ('Spinel',      'spinel'),
    ('Emerald',     'emerald'),
    ('Aquamarine',  'aquamarine'),
    ('Tourmaline',  'tourmaline'),
    ('Chrysoberyl', 'chrysoberyl'),
    ('Garnet',      'garnet'),
    ('Tanzanite',   'tanzanite'),
    ('Amethyst',    'amethyst'),
    ('Citrine',     'citrine'),
    ('Peridot',     'peridot'),
    ('Topaz',       'topaz'),
    ('Moonstone',   'moonstone'),
    ('Zircon',      'zircon'),
    ('Other Gems',  'other-gems');

-- Seed child categories — Sapphire
INSERT INTO public.categories (name, slug, parent_id) VALUES
    ('Blue Sapphire',         'blue-sapphire',         (SELECT id FROM public.categories WHERE slug = 'sapphire')),
    ('Pink Sapphire',         'pink-sapphire',         (SELECT id FROM public.categories WHERE slug = 'sapphire')),
    ('Yellow Sapphire',       'yellow-sapphire',       (SELECT id FROM public.categories WHERE slug = 'sapphire')),
    ('White Sapphire',        'white-sapphire',        (SELECT id FROM public.categories WHERE slug = 'sapphire')),
    ('Padparadscha Sapphire', 'padparadscha-sapphire', (SELECT id FROM public.categories WHERE slug = 'sapphire')),
    ('Star Sapphire',         'star-sapphire',         (SELECT id FROM public.categories WHERE slug = 'sapphire'));

-- Seed child categories — Ruby
INSERT INTO public.categories (name, slug, parent_id) VALUES
    ('Star Ruby', 'star-ruby', (SELECT id FROM public.categories WHERE slug = 'ruby'));

-- Seed child categories — Spinel
INSERT INTO public.categories (name, slug, parent_id) VALUES
    ('Red Spinel',  'red-spinel',  (SELECT id FROM public.categories WHERE slug = 'spinel')),
    ('Blue Spinel', 'blue-spinel', (SELECT id FROM public.categories WHERE slug = 'spinel')),
    ('Pink Spinel', 'pink-spinel', (SELECT id FROM public.categories WHERE slug = 'spinel'));

-- Seed child categories — Tourmaline
INSERT INTO public.categories (name, slug, parent_id) VALUES
    ('Rubellite',              'rubellite',              (SELECT id FROM public.categories WHERE slug = 'tourmaline')),
    ('Paraiba Tourmaline',     'paraiba-tourmaline',     (SELECT id FROM public.categories WHERE slug = 'tourmaline')),
    ('Green Tourmaline',       'green-tourmaline',       (SELECT id FROM public.categories WHERE slug = 'tourmaline')),
    ('Watermelon Tourmaline',  'watermelon-tourmaline',  (SELECT id FROM public.categories WHERE slug = 'tourmaline'));

-- Seed child categories — Chrysoberyl
INSERT INTO public.categories (name, slug, parent_id) VALUES
    ('Cats Eye Chrysoberyl', 'cats-eye-chrysoberyl', (SELECT id FROM public.categories WHERE slug = 'chrysoberyl'));

-- Seed child categories — Garnet
INSERT INTO public.categories (name, slug, parent_id) VALUES
    ('Tsavorite Garnet',   'tsavorite-garnet',   (SELECT id FROM public.categories WHERE slug = 'garnet')),
    ('Rhodolite Garnet',   'rhodolite-garnet',   (SELECT id FROM public.categories WHERE slug = 'garnet')),
    ('Hessonite Garnet',   'hessonite-garnet',   (SELECT id FROM public.categories WHERE slug = 'garnet')),
    ('Demantoid Garnet',   'demantoid-garnet',   (SELECT id FROM public.categories WHERE slug = 'garnet')),
    ('Alexandrite Garnet', 'alexandrite-garnet',  (SELECT id FROM public.categories WHERE slug = 'garnet'));

-- Seed child categories — Topaz
INSERT INTO public.categories (name, slug, parent_id) VALUES
    ('Imperial Topaz', 'imperial-topaz', (SELECT id FROM public.categories WHERE slug = 'topaz')),
    ('Blue Topaz',     'blue-topaz',     (SELECT id FROM public.categories WHERE slug = 'topaz'));

-- Seed child categories — Other Gems
INSERT INTO public.categories (name, slug, parent_id) VALUES
    ('Labradorite',        'labradorite',     (SELECT id FROM public.categories WHERE slug = 'other-gems')),
    ('Andalusite',         'andalusite',      (SELECT id FROM public.categories WHERE slug = 'other-gems')),
    ('Kornerupine',        'kornerupine',     (SELECT id FROM public.categories WHERE slug = 'other-gems')),
    ('Iolite',             'iolite',          (SELECT id FROM public.categories WHERE slug = 'other-gems')),
    ('Sphene (Titanite)',  'sphene-titanite', (SELECT id FROM public.categories WHERE slug = 'other-gems'));


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 3 — gems
-- Core listing table. Supports both Direct Sell and Auction types.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.gems (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id        UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title              TEXT NOT NULL,
    description        TEXT,
    carat_weight       NUMERIC(8,3) CHECK (carat_weight > 0),
    color              TEXT,
    clarity            TEXT CHECK (clarity IN (
                           'I1 (Included 1)',
                           'SI1 (Slightly Included 1)',
                           'SI2 (Slightly Included 2)',
                           'VS (Eye Clean 2)',
                           'VVS (Eye Clean 1)'
                       )),
    cut                TEXT CHECK (cut IN (
                           'Cushion','Fancy','Heart','Marquise','Octagon',
                           'Other','Oval','Pear','Round','Trillion'
                       )),
    origin             TEXT CHECK (origin IN (
                           'Sri Lanka (Ceylon)','Burma (Myanmar)','Madagascar',
                           'Thailand','Colombia','Brazil','Zambia','Tanzania',
                           'India','Afghanistan','Australia','Other'
                       )),
    treatment          TEXT DEFAULT 'Untreated' CHECK (treatment IN (
                           'Be Heated','Fracture Filled',
                           'Heated','Irradiated','Untreated'
                       )),
    certification      TEXT,
    certification_body TEXT,
    images             TEXT[] DEFAULT '{}',
    listing_type       TEXT NOT NULL DEFAULT 'auction'
                           CHECK (listing_type IN ('auction', 'direct_sell')),
    status             TEXT NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'listed', 'in_auction', 'sold', 'unlisted')),
    buy_now_price      NUMERIC(12,2) CHECK (buy_now_price > 0),
    predicted_price    NUMERIC(12,2),
    x                  NUMERIC(8,3) CHECK (x > 0),
    y                  NUMERIC(8,3) CHECK (y > 0),
    z                  NUMERIC(8,3) CHECK (z > 0),
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER gems_set_updated_at
    BEFORE UPDATE ON public.gems
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_gems_seller_id    ON public.gems(seller_id);
CREATE INDEX idx_gems_category_id  ON public.gems(category_id);
CREATE INDEX idx_gems_status       ON public.gems(status);
CREATE INDEX idx_gems_listing_type ON public.gems(listing_type);

-- RLS
ALTER TABLE public.gems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gems_select" ON public.gems
    FOR SELECT
    USING (status IN ('listed', 'in_auction', 'sold') OR seller_id = auth.uid());

CREATE POLICY "gems_insert_seller" ON public.gems
    FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "gems_update_seller" ON public.gems
    FOR UPDATE
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "gems_delete_draft" ON public.gems
    FOR DELETE
    USING (auth.uid() = seller_id AND status = 'draft');


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 4 — auctions
-- One auction per gem (UNIQUE on gem_id).
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.auctions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gem_id            UUID NOT NULL UNIQUE REFERENCES public.gems(id) ON DELETE CASCADE,
    seller_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    starting_price    NUMERIC(12,2) NOT NULL CHECK (starting_price >= 0),
    reserve_price     NUMERIC(12,2) CHECK (reserve_price >= 0),
    current_price     NUMERIC(12,2) NOT NULL CHECK (current_price >= 0),
    min_bid_increment NUMERIC(12,2) NOT NULL DEFAULT 10 CHECK (min_bid_increment > 0),
    start_time        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time          TIMESTAMPTZ NOT NULL,
    status            TEXT NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled', 'active', 'completed',
                                          'cancelled', 'reserve_not_met')),
    winner_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    bid_count         INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT end_after_start CHECK (end_time > start_time)
);

-- Trigger
CREATE TRIGGER auctions_set_updated_at
    BEFORE UPDATE ON public.auctions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_auctions_status    ON public.auctions(status);
CREATE INDEX idx_auctions_seller_id ON public.auctions(seller_id);
CREATE INDEX idx_auctions_end_time  ON public.auctions(end_time);
CREATE INDEX idx_auctions_gem_id    ON public.auctions(gem_id);

-- RLS
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auctions_select_public" ON public.auctions
    FOR SELECT USING (true);

CREATE POLICY "auctions_insert_seller" ON public.auctions
    FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "auctions_update_seller" ON public.auctions
    FOR UPDATE
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "auctions_delete_seller" ON public.auctions
    FOR DELETE
    USING (auth.uid() = seller_id AND status IN ('scheduled', 'cancelled'));


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 5 — bids
-- Immutable audit log. No UPDATE or DELETE allowed.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.bids (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    bidder_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    is_winning BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutability rules
CREATE RULE no_update_bids AS ON UPDATE TO public.bids DO INSTEAD NOTHING;
CREATE RULE no_delete_bids AS ON DELETE TO public.bids DO INSTEAD NOTHING;

-- Indexes
CREATE INDEX idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX idx_bids_bidder_id  ON public.bids(bidder_id);

-- RLS
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bids_select_public" ON public.bids
    FOR SELECT USING (true);

-- INSERT is handled exclusively by place_bid() SECURITY DEFINER RPC.


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 6 — transactions
-- Created on auction win or buy-now purchase.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.transactions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id        UUID REFERENCES public.auctions(id) ON DELETE SET NULL,
    gem_id            UUID REFERENCES public.gems(id) ON DELETE SET NULL,
    buyer_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    seller_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    type              TEXT NOT NULL CHECK (type IN ('auction_win', 'buy_now')),
    status            TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'completed', 'disputed', 'refunded')),
    payment_reference TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER transactions_set_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_transactions_buyer_id  ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX idx_transactions_status    ON public.transactions(status);

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON public.transactions
    FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 7 — notifications
-- In-app notification feed per user.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type       TEXT NOT NULL CHECK (type IN (
                   'outbid', 'auction_won', 'auction_ending',
                   'new_bid', 'auction_cancelled',
                   'certificate_verified', 'certificate_rejected',
                   'auction_started'
               )),
    title      TEXT NOT NULL,
    message    TEXT NOT NULL,
    data       JSONB NOT NULL DEFAULT '{}',
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, is_read);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- INSERT is done by SECURITY DEFINER RPCs.


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 8 — watchlist_folders
-- Custom named folders per buyer.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.watchlist_folders (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name       TEXT NOT NULL DEFAULT 'My Watchlist',
    is_system  BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER watchlist_folders_set_updated_at
    BEFORE UPDATE ON public.watchlist_folders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.watchlist_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_folders_all_own" ON public.watchlist_folders
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 9 — watchlist
-- Saves auction or direct-sell gem to a folder.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.watchlist (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gem_id     UUID REFERENCES public.gems(id) ON DELETE CASCADE,
    auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
    folder_id  UUID REFERENCES public.watchlist_folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT must_have_gem_or_auction CHECK (gem_id IS NOT NULL OR auction_id IS NOT NULL),
    CONSTRAINT watchlist_user_gem_unique UNIQUE (user_id, gem_id)
);

-- Indexes
CREATE INDEX idx_watchlist_user_id   ON public.watchlist(user_id);
CREATE INDEX idx_watchlist_folder_id ON public.watchlist(folder_id);

-- RLS
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_all_own" ON public.watchlist
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 10 — certificates
-- Gem certification documents. One per gem. Admin verifies.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.certificates (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gem_id             UUID NOT NULL UNIQUE REFERENCES public.gems(id) ON DELETE CASCADE,
    seller_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    certificate_number TEXT,
    issued_by          TEXT NOT NULL DEFAULT 'Other'
                         CHECK (issued_by IN ('GIA','AGS','IGI','GRS','GIT','GGTL','Gübelin','Other')),
    issued_date        DATE,
    document_url       TEXT NOT NULL,
    status             TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at        TIMESTAMPTZ,
    notes              TEXT,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER certificates_set_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_certificates_gem_id    ON public.certificates(gem_id);
CREATE INDEX idx_certificates_status    ON public.certificates(status);
CREATE INDEX idx_certificates_seller_id ON public.certificates(seller_id);

-- RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificates_select" ON public.certificates
    FOR SELECT
    USING (
        seller_id = auth.uid()
        OR status = 'verified'
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "certificates_insert_seller" ON public.certificates
    FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "certificates_update" ON public.certificates
    FOR UPDATE
    USING (
        (auth.uid() = seller_id AND status = 'pending')
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
        (auth.uid() = seller_id AND status = 'pending')
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "certificates_delete_pending" ON public.certificates
    FOR DELETE
    USING (auth.uid() = seller_id AND status = 'pending');


-- ════════════════════════════════════════════════════════════════════════════════
-- TABLE 11 — reviews
-- Post-purchase seller ratings. One per transaction. Buyer only.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE TABLE public.reviews (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL UNIQUE REFERENCES public.transactions(id) ON DELETE CASCADE,
    rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT reviews_unique_per_transaction UNIQUE (reviewer_id, transaction_id),
    CONSTRAINT reviewer_ne_seller CHECK (reviewer_id != seller_id)
);

-- Trigger
CREATE TRIGGER reviews_set_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_reviews_seller_id      ON public.reviews(seller_id);
CREATE INDEX idx_reviews_reviewer_id    ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_transaction_id ON public.reviews(transaction_id);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_public" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "reviews_insert_buyer" ON public.reviews
    FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id
        AND EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
              AND t.buyer_id = auth.uid()
              AND t.status = 'completed'
        )
    );

CREATE POLICY "reviews_update_recent" ON public.reviews
    FOR UPDATE
    USING (auth.uid() = reviewer_id AND created_at > NOW() - INTERVAL '7 days')
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "reviews_delete" ON public.reviews
    FOR DELETE
    USING (
        auth.uid() = reviewer_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );


-- ════════════════════════════════════════════════════════════════════════════════
-- VIEW — seller_ratings
-- Pre-computes rating breakdown per seller.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.seller_ratings AS
SELECT
    seller_id,
    COUNT(*)::INTEGER                           AS review_count,
    ROUND(AVG(rating)::NUMERIC, 2)              AS avg_rating,
    COUNT(*) FILTER (WHERE rating = 5)::INTEGER AS five_star,
    COUNT(*) FILTER (WHERE rating = 4)::INTEGER AS four_star,
    COUNT(*) FILTER (WHERE rating = 3)::INTEGER AS three_star,
    COUNT(*) FILTER (WHERE rating = 2)::INTEGER AS two_star,
    COUNT(*) FILTER (WHERE rating = 1)::INTEGER AS one_star
FROM public.reviews
GROUP BY seller_id;

GRANT SELECT ON public.seller_ratings TO authenticated;


-- ════════════════════════════════════════════════════════════════════════════════
-- RPC FUNCTION 1 — place_bid()
-- Atomic bid placement. Called via supabase.rpc('place_bid', {...})
-- SECURITY DEFINER — bypasses RLS, runs as postgres
-- ════════════════════════════════════════════════════════════════════════════════
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
    v_auction     RECORD;
    v_bid_id      UUID;
    v_prev_winner UUID;
BEGIN
    -- 1. Lock the auction row to prevent race conditions
    SELECT * INTO v_auction
    FROM public.auctions
    WHERE id = p_auction_id
    FOR UPDATE;

    -- 2. Auction must exist
    IF v_auction IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'auction_not_found',
            'error_message', 'Auction not found.'
        );
    END IF;

    -- 3. Must be active
    IF v_auction.status != 'active' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'auction_not_active',
            'error_message', 'Auction is not currently active.'
        );
    END IF;

    -- 4. Must have started
    IF NOW() < v_auction.start_time THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'auction_not_started',
            'error_message', 'Auction has not started yet.'
        );
    END IF;

    -- 5. Must not have ended
    IF NOW() > v_auction.end_time THEN
        UPDATE public.auctions SET status = 'completed' WHERE id = p_auction_id;
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'auction_ended',
            'error_message', 'Auction has already ended.'
        );
    END IF;

    -- 6. Seller cannot bid on own auction
    IF p_bidder_id = v_auction.seller_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'seller_cannot_bid',
            'error_message', 'Sellers cannot bid on their own auctions.'
        );
    END IF;

    -- 7. Bid must meet minimum increment
    IF p_amount < v_auction.current_price + v_auction.min_bid_increment THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'bid_too_low',
            'error_message', 'Bid must be at least ' || (v_auction.current_price + v_auction.min_bid_increment)::TEXT,
            'min_required', v_auction.current_price + v_auction.min_bid_increment
        );
    END IF;

    -- 8. Record previous winning bidder for outbid notification
    SELECT bidder_id INTO v_prev_winner
    FROM public.bids
    WHERE auction_id = p_auction_id AND is_winning = true
    LIMIT 1;

    -- 9. Clear previous winning flag
    UPDATE public.bids
    SET is_winning = false
    WHERE auction_id = p_auction_id AND is_winning = true;

    -- 10. Insert the new bid
    INSERT INTO public.bids (auction_id, bidder_id, amount, is_winning)
    VALUES (p_auction_id, p_bidder_id, p_amount, true)
    RETURNING id INTO v_bid_id;

    -- 11. Update auction current price and bid count
    UPDATE public.auctions
    SET current_price = p_amount,
        bid_count     = bid_count + 1
    WHERE id = p_auction_id;

    -- 12. Notify previous winner they have been outbid
    IF v_prev_winner IS NOT NULL AND v_prev_winner != p_bidder_id THEN
        INSERT INTO public.notifications (user_id, type, title, message, data)
        VALUES (
            v_prev_winner,
            'outbid',
            'You have been outbid!',
            'A new bid of $' || p_amount::TEXT || ' was placed on an auction you were winning.',
            jsonb_build_object('auction_id', p_auction_id, 'new_price', p_amount)
        );
    END IF;

    -- 13. Return success
    RETURN jsonb_build_object(
        'success', true,
        'bid_id', v_bid_id,
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

GRANT EXECUTE ON FUNCTION public.place_bid(UUID, UUID, NUMERIC) TO authenticated;


-- ════════════════════════════════════════════════════════════════════════════════
-- RPC FUNCTION 2 — complete_expired_auctions()
-- Called by node-cron job every minute via service_role key.
-- ════════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.complete_expired_auctions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auction    RECORD;
    v_winner_id  UUID;
    v_completed  INTEGER := 0;
BEGIN
    FOR v_auction IN
        SELECT a.*, g.title AS gem_title
        FROM public.auctions a
        JOIN public.gems g ON g.id = a.gem_id
        WHERE a.status = 'active' AND a.end_time < NOW()
        FOR UPDATE OF a
    LOOP
        -- Determine the winning bidder
        SELECT bidder_id INTO v_winner_id
        FROM public.bids
        WHERE auction_id = v_auction.id AND is_winning = true
        LIMIT 1;

        -- Check if reserve price was met
        IF v_auction.reserve_price IS NOT NULL
           AND v_auction.current_price < v_auction.reserve_price THEN
            -- Reserve not met
            UPDATE public.auctions
            SET status    = 'reserve_not_met',
                winner_id = NULL
            WHERE id = v_auction.id;

        ELSE
            -- Auction completed successfully
            UPDATE public.auctions
            SET status    = 'completed',
                winner_id = v_winner_id
            WHERE id = v_auction.id;

            -- Create transaction and update gem if there was a winner
            IF v_winner_id IS NOT NULL THEN
                INSERT INTO public.transactions (auction_id, gem_id, buyer_id, seller_id, amount, type, status)
                VALUES (
                    v_auction.id,
                    v_auction.gem_id,
                    v_winner_id,
                    v_auction.seller_id,
                    v_auction.current_price,
                    'auction_win',
                    'pending'
                );

                UPDATE public.gems SET status = 'sold' WHERE id = v_auction.gem_id;

                -- Notify winner
                INSERT INTO public.notifications (user_id, type, title, message, data)
                VALUES (
                    v_winner_id,
                    'auction_won',
                    'You won the auction!',
                    'Congratulations! Your bid of $' || v_auction.current_price::TEXT
                        || ' won the auction for ' || COALESCE(v_auction.gem_title, 'a gem') || '.',
                    jsonb_build_object(
                        'auction_id', v_auction.id,
                        'gem_id', v_auction.gem_id,
                        'amount', v_auction.current_price
                    )
                );

                -- Notify seller
                INSERT INTO public.notifications (user_id, type, title, message, data)
                VALUES (
                    v_auction.seller_id,
                    'auction_started',
                    'Your gem has been sold!',
                    'Your auction ended. Final price: $' || v_auction.current_price::TEXT,
                    jsonb_build_object(
                        'auction_id', v_auction.id,
                        'gem_id', v_auction.gem_id,
                        'amount', v_auction.current_price,
                        'buyer_id', v_winner_id
                    )
                );
            END IF;
        END IF;

        v_completed := v_completed + 1;
    END LOOP;

    RETURN v_completed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_expired_auctions() TO service_role;


-- ════════════════════════════════════════════════════════════════════════════════
-- RPC FUNCTION 3 — buy_now()
-- Direct purchase. Called via supabase.rpc('buy_now', {...})
-- ════════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.buy_now(
    p_gem_id   UUID,
    p_buyer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_gem            RECORD;
    v_transaction_id UUID;
BEGIN
    -- 1. Lock the gem row
    SELECT * INTO v_gem
    FROM public.gems
    WHERE id = p_gem_id
    FOR UPDATE;

    -- 2. Gem must exist
    IF v_gem IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'gem_not_found',
            'error_message', 'Gem not found.'
        );
    END IF;

    -- 3. Must be a listed direct-sell gem
    IF v_gem.status != 'listed' OR v_gem.listing_type != 'direct_sell' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'not_available',
            'error_message', 'This gem is not available for direct purchase.'
        );
    END IF;

    -- 4. Buyer cannot be the seller
    IF p_buyer_id = v_gem.seller_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'seller_cannot_buy',
            'error_message', 'You cannot buy your own gem.'
        );
    END IF;

    -- 5. Must have a buy_now_price
    IF v_gem.buy_now_price IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'no_price_set',
            'error_message', 'No buy-now price set for this gem.'
        );
    END IF;

    -- 6. Mark gem as sold
    UPDATE public.gems SET status = 'sold' WHERE id = p_gem_id;

    -- 7. Create transaction
    INSERT INTO public.transactions (gem_id, buyer_id, seller_id, amount, type, status)
    VALUES (p_gem_id, p_buyer_id, v_gem.seller_id, v_gem.buy_now_price, 'buy_now', 'pending')
    RETURNING id INTO v_transaction_id;

    -- 8. Notify seller
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
        v_gem.seller_id,
        'new_bid',
        'Your gem was purchased!',
        'A buyer purchased ' || COALESCE(v_gem.title, 'your gem') || ' for $' || v_gem.buy_now_price::TEXT,
        jsonb_build_object(
            'gem_id', p_gem_id,
            'amount', v_gem.buy_now_price,
            'buyer_id', p_buyer_id,
            'transaction_id', v_transaction_id
        )
    );

    -- 9. Return success
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'amount', v_gem.buy_now_price
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error_code', 'internal_error',
        'error_message', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.buy_now(UUID, UUID) TO authenticated;


-- ════════════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════════════
-- MERGED FEATURE MIGRATIONS — reviews moderation, wallet, second chance flows
-- ════════════════════════════════════════════════════════════════════════════════

-- Migration 003: Add certification_body column to gems table
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Safe to re-run — uses IF NOT EXISTS guard

ALTER TABLE public.gems
    ADD COLUMN IF NOT EXISTS certification_body TEXT;
-- Function to delete user data, temporarily dropping the no_delete_bids rule
-- Run this in Supabase SQL Editor once
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS void AS $$
BEGIN
    DROP RULE IF EXISTS no_delete_bids ON public.bids;
    DELETE FROM public.profiles WHERE id = target_user_id;
    CREATE RULE no_delete_bids AS ON DELETE TO public.bids DO INSTEAD NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to hard-delete an auction, temporarily dropping the no_delete_bids rule
-- so that ON DELETE CASCADE from auctions → bids works correctly.
-- Run this in Supabase SQL Editor once.
CREATE OR REPLACE FUNCTION delete_auction_data(target_auction_id UUID)
RETURNS void AS $$
BEGIN
    DROP RULE IF EXISTS no_delete_bids ON public.bids;
    DELETE FROM public.auctions WHERE id = target_auction_id;
    CREATE RULE no_delete_bids AS ON DELETE TO public.bids DO INSTEAD NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Migration 004: Enforce review creation time window and max edit count
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- Safe to re-run

-- 1) Add edit_count column for review edit limit tracking
ALTER TABLE public.reviews
    ADD COLUMN IF NOT EXISTS edit_count INTEGER NOT NULL DEFAULT 0;

-- 2) Ensure check constraint exists (drop/recreate idempotently)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reviews_edit_count_range'
          AND conrelid = 'public.reviews'::regclass
    ) THEN
        ALTER TABLE public.reviews DROP CONSTRAINT reviews_edit_count_range;
    END IF;
END $$;

ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_edit_count_range CHECK (edit_count BETWEEN 0 AND 3);

-- 3) Update review insert policy to allow only within 3 months of purchase
DROP POLICY IF EXISTS "reviews_insert_buyer" ON public.reviews;
CREATE POLICY "reviews_insert_buyer" ON public.reviews
    FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id
        AND EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id
              AND t.buyer_id = auth.uid()
              AND t.status = 'completed'
              AND NOW() <= t.created_at + INTERVAL '3 months'
        )
    );

-- 4) Replace update policy: max 3 edits instead of 7-day window
DROP POLICY IF EXISTS "reviews_update_recent" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_limited" ON public.reviews;
CREATE POLICY "reviews_update_limited" ON public.reviews
    FOR UPDATE
    USING (auth.uid() = reviewer_id AND edit_count < 3)
    WITH CHECK (auth.uid() = reviewer_id);
-- 005_review_reports_moderation.sql
-- Adds seller->admin review reporting and admin moderation support.

-- 1) Extend notifications type constraint for moderation-related notifications.
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check CHECK (
    type IN (
      'outbid', 'auction_won', 'auction_ending',
      'new_bid', 'auction_cancelled',
      'certificate_verified', 'certificate_rejected',
      'auction_started',
      'review_reported', 'admin_warning'
    )
  );

-- 2) Create review_reports table.
CREATE TABLE IF NOT EXISTS public.review_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(trim(reason)) BETWEEN 10 AND 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  action_taken TEXT CHECK (action_taken IN ('removed_and_warned', 'dismissed')),
  admin_note TEXT,
  review_comment_snapshot TEXT,
  review_rating_snapshot INTEGER CHECK (review_rating_snapshot BETWEEN 1 AND 5),
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_reports_status_created
  ON public.review_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_reports_seller_id
  ON public.review_reports(seller_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_reviewer_id
  ON public.review_reports(reviewer_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_review_reports_open_by_reporter
  ON public.review_reports(review_id, reporter_id)
  WHERE status = 'open';

DROP TRIGGER IF EXISTS review_reports_set_updated_at ON public.review_reports;
CREATE TRIGGER review_reports_set_updated_at
  BEFORE UPDATE ON public.review_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) RLS policies.
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "review_reports_insert_seller" ON public.review_reports;
CREATE POLICY "review_reports_insert_seller"
  ON public.review_reports
  FOR INSERT
  WITH CHECK (reporter_id = auth.uid() AND seller_id = auth.uid());

DROP POLICY IF EXISTS "review_reports_select_seller_or_admin" ON public.review_reports;
CREATE POLICY "review_reports_select_seller_or_admin"
  ON public.review_reports
  FOR SELECT
  USING (
    reporter_id = auth.uid()
    OR seller_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "review_reports_update_admin" ON public.review_reports;
CREATE POLICY "review_reports_update_admin"
  ON public.review_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
-- 006_reviews_media_uploads.sql
-- Adds buyer review media support (photos/videos).

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS media_urls TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_media_urls_max6;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_media_urls_max6
  CHECK (COALESCE(array_length(media_urls, 1), 0) <= 6);
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
-- Track how many times a buyer has posted a review for the same transaction
-- so public UI can show "Second Post" after delete + re-submit.

CREATE TABLE IF NOT EXISTS public.review_post_counters (
    reviewer_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    post_count     INTEGER NOT NULL DEFAULT 0 CHECK (post_count >= 0),
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (reviewer_id, transaction_id)
);

DROP TRIGGER IF EXISTS review_post_counters_set_updated_at ON public.review_post_counters;
CREATE TRIGGER review_post_counters_set_updated_at
    BEFORE UPDATE ON public.review_post_counters
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.review_post_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "review_post_counters_select_own" ON public.review_post_counters;
CREATE POLICY "review_post_counters_select_own" ON public.review_post_counters
    FOR SELECT USING (auth.uid() = reviewer_id);

ALTER TABLE public.reviews
    ADD COLUMN IF NOT EXISTS post_sequence INTEGER NOT NULL DEFAULT 1 CHECK (post_sequence >= 1);

-- Backfill safe default for existing rows.
UPDATE public.reviews SET post_sequence = 1 WHERE post_sequence IS NULL;

CREATE OR REPLACE FUNCTION public.next_review_post_sequence(
    p_reviewer_id UUID,
    p_transaction_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_next INTEGER;
BEGIN
    INSERT INTO public.review_post_counters (reviewer_id, transaction_id, post_count)
    VALUES (p_reviewer_id, p_transaction_id, 1)
    ON CONFLICT (reviewer_id, transaction_id)
    DO UPDATE SET post_count = review_post_counters.post_count + 1,
                  updated_at = NOW()
    WHERE review_post_counters.post_count < 3
    RETURNING post_count INTO v_next;

    IF v_next IS NULL THEN
        RAISE EXCEPTION 'REVIEW_REPOST_LIMIT_REACHED';
    END IF;

    RETURN v_next;
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_review_post_sequence(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.next_review_post_sequence(UUID, UUID) TO authenticated;
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


-- SUPABASE REALTIME — enable on bids, auctions, notifications
-- ════════════════════════════════════════════════════════════════════════════════
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

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;


-- ════════════════════════════════════════════════════════════════════════════════
-- GRANTS — Ensure authenticated & anon roles have baseline access
-- ════════════════════════════════════════════════════════════════════════════════
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;


-- ════════════════════════════════════════════════════════════════════════════════
-- Watchlist "Ended" Folder Automation
-- ════════════════════════════════════════════════════════════════════════════════

-- Helper: ensure a user has a system "Ended" folder.
CREATE OR REPLACE FUNCTION public.ensure_ended_folder(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    ended_folder_id UUID;
BEGIN
    SELECT id INTO ended_folder_id
    FROM public.watchlist_folders
    WHERE user_id = user_uuid AND name = 'Ended' AND is_system = true;

    IF ended_folder_id IS NULL THEN
        INSERT INTO public.watchlist_folders (user_id, name, is_system)
        VALUES (user_uuid, 'Ended', true)
        RETURNING id INTO ended_folder_id;
    END IF;

    RETURN ended_folder_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: move watchlist items to "Ended" when a gem reaches a terminal status.
CREATE OR REPLACE FUNCTION public.trigger_gem_ended_watchlist()
RETURNS TRIGGER AS $$
DECLARE
    wl_record RECORD;
    ended_id UUID;
BEGIN
    IF NEW.status IN ('sold', 'unlisted', 'draft') AND
       (OLD.status IS NULL OR OLD.status NOT IN ('sold', 'unlisted', 'draft')) THEN

        FOR wl_record IN
            SELECT id, user_id FROM public.watchlist WHERE gem_id = NEW.id
        LOOP
            ended_id := public.ensure_ended_folder(wl_record.user_id);
            UPDATE public.watchlist SET folder_id = ended_id WHERE id = wl_record.id;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gems_ended_watchlist
    AFTER UPDATE OF status ON public.gems
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.trigger_gem_ended_watchlist();

-- Trigger: move watchlist items to "Ended" when an auction reaches a terminal status.
CREATE OR REPLACE FUNCTION public.trigger_auction_ended_watchlist()
RETURNS TRIGGER AS $$
DECLARE
    wl_record RECORD;
    ended_id UUID;
BEGIN
    IF NEW.status IN ('completed', 'cancelled', 'reserve_not_met') AND
       (OLD.status IS NULL OR OLD.status NOT IN ('completed', 'cancelled', 'reserve_not_met')) THEN

        FOR wl_record IN
            SELECT DISTINCT id, user_id
            FROM public.watchlist
            WHERE auction_id = NEW.id OR gem_id = NEW.gem_id
        LOOP
            ended_id := public.ensure_ended_folder(wl_record.user_id);
            UPDATE public.watchlist SET folder_id = ended_id WHERE id = wl_record.id;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auctions_ended_watchlist
    AFTER UPDATE OF status ON public.auctions
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.trigger_auction_ended_watchlist();


-- ════════════════════════════════════════════════════════════════════════════════
-- DONE!
-- ════════════════════════════════════════════════════════════════════════════════
-- After running this migration:
--
--   1. Ensure your backend .env has the correct SUPABASE_URL and keys
--   2. Start the backend — it will auto-create storage buckets:
--        gem-images (public), gem-models (public),
--        certificates (private), avatars (public)
--   3. If Realtime isn't working:
--        Dashboard → Database → Replication → supabase_realtime
--        → toggle ON for: bids, auctions, notifications
--
-- Tables created:
--   profiles, categories, gems, auctions, bids, transactions,
--   notifications, watchlist_folders, watchlist, certificates, reviews,
--   review_reports, wallets, wallet_topups, wallet_holds,
--   second_chance_offers, wallet_gem_purchases, wallet_withdrawals
--
-- Views created:
--   seller_ratings
--
-- RPC functions created:
--   place_bid(), complete_expired_auctions(), buy_now()
--
-- Trigger functions created:
--   set_updated_at(), handle_new_user(), update_last_login(),
--   ensure_ended_folder(), trigger_gem_ended_watchlist(), trigger_auction_ended_watchlist()
-- ════════════════════════════════════════════════════════════════════════════════
