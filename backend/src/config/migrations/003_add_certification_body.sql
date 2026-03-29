-- Migration 003: Add certification_body column to gems table
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Safe to re-run — uses IF NOT EXISTS guard

ALTER TABLE public.gems
    ADD COLUMN IF NOT EXISTS certification_body TEXT;
