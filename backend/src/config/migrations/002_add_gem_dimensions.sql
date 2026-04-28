-- ════════════════════════════════════════════════════════════════════════════════
-- 002_add_gem_dimensions.sql
-- Add x, y, z dimension columns to gems table for AI valuation with dimensions.
--
-- Run via: Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ════════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.gems
    ADD COLUMN IF NOT EXISTS x NUMERIC(8,3) CHECK (x > 0),
    ADD COLUMN IF NOT EXISTS y NUMERIC(8,3) CHECK (y > 0),
    ADD COLUMN IF NOT EXISTS z NUMERIC(8,3) CHECK (z > 0);
