-- 006_reviews_media_uploads.sql
-- Adds buyer review media support (photos/videos).

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS media_urls TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_media_urls_max6;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_media_urls_max6
  CHECK (COALESCE(array_length(media_urls, 1), 0) <= 6);
