-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION 004 — Add priority column to watchlist
-- ════════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.watchlist
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'low'
    CHECK (priority IN ('high', 'medium', 'low'));
