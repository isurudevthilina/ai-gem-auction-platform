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
