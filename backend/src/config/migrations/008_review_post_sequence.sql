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
