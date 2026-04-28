-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION 005 — Certificate Authority Email Audit
-- ════════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.certificates
    ADD COLUMN IF NOT EXISTS authority_email TEXT,
    ADD COLUMN IF NOT EXISTS authority_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS authority_sent_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS authority_message_id TEXT,
    ADD COLUMN IF NOT EXISTS authority_notes TEXT,
    ADD COLUMN IF NOT EXISTS authority_status TEXT NOT NULL DEFAULT 'not_requested'
        CHECK (authority_status IN ('not_requested', 'approved')),
    ADD COLUMN IF NOT EXISTS authority_approved_at TIMESTAMPTZ;
