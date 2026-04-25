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
