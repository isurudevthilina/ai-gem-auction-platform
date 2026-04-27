/*
══════════════════════════════════════════════════════════════════════════════
  001_dataset_alignment.sql
  Align gems table constraints and categories to match the ML dataset.

  HOW TO RUN:
    Supabase Dashboard → SQL Editor → New Query → paste → Run

  WHAT THIS CHANGES:
    1. gems.cut        → 10 dataset shapes
    2. gems.clarity    → 5 dataset clarity grades (with full label strings)
    3. gems.treatment  → 5 dataset treatment values + default updated
    4. categories      → pruned to 8 dataset gem types only

  ⚠  Data migration note:
    Existing gem rows with OLD cut/clarity/treatment values will have those
    fields set to NULL by the UPDATE statements below before the new
    constraints are applied. If you want to preserve data, map old → new
    values manually before running.
══════════════════════════════════════════════════════════════════════════════
*/

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 1 — Nullify gem rows whose current values won't fit new constraints
-- ════════════════════════════════════════════════════════════════════════════

-- Clarity: any value not in new set → NULL
UPDATE public.gems
SET clarity = NULL
WHERE clarity IS NOT NULL
  AND clarity NOT IN (
    'I1 (Included 1)',
    'SI1 (Slightly Included 1)',
    'SI2 (Slightly Included 2)',
    'VS (Eye Clean 2)',
    'VVS (Eye Clean 1)'
  );

-- Cut: any value not in new set → NULL
UPDATE public.gems
SET cut = NULL
WHERE cut IS NOT NULL
  AND cut NOT IN (
    'Cushion','Fancy','Heart','Marquise','Octagon',
    'Other','Oval','Pear','Round','Trillion'
  );

-- Treatment: any value not in new set → NULL
UPDATE public.gems
SET treatment = NULL
WHERE treatment IS NOT NULL
  AND treatment NOT IN (
    'Be Heated','Fracture Filled','Heated','Irradiated','Untreated'
  );


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 2 — Drop old CHECK constraints on gems table
-- ════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.gems'::regclass
          AND contype = 'c'
          AND (conname LIKE '%clarity%' OR conname LIKE '%cut%' OR conname LIKE '%treatment%')
    LOOP
        EXECUTE format('ALTER TABLE public.gems DROP CONSTRAINT IF EXISTS %I', r.conname);
    END LOOP;
END $$;


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 3 — Add new CHECK constraints with dataset-aligned values
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.gems
    ADD CONSTRAINT gems_clarity_check CHECK (clarity IN (
        'I1 (Included 1)',
        'SI1 (Slightly Included 1)',
        'SI2 (Slightly Included 2)',
        'VS (Eye Clean 2)',
        'VVS (Eye Clean 1)'
    ));

ALTER TABLE public.gems
    ADD CONSTRAINT gems_cut_check CHECK (cut IN (
        'Cushion','Fancy','Heart','Marquise','Octagon',
        'Other','Oval','Pear','Round','Trillion'
    ));

ALTER TABLE public.gems
    ADD CONSTRAINT gems_treatment_check CHECK (treatment IN (
        'Be Heated','Fracture Filled','Heated','Irradiated','Untreated'
    ));

-- Update default treatment value to match dataset
ALTER TABLE public.gems
    ALTER COLUMN treatment SET DEFAULT 'Untreated';


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 4 — Rebuild categories to match the 8 dataset gem types
-- ════════════════════════════════════════════════════════════════════════════

-- Nullify category_id on gems whose category will be removed
UPDATE public.gems
SET category_id = NULL
WHERE category_id IN (
    SELECT id FROM public.categories
    WHERE slug NOT IN (
        'amethyst','citrine','pyrope-garnet','ruby',
        'sapphire','spinel','topaz','tourmaline'
    )
);

-- Delete all child categories first (FK: parent_id)
DELETE FROM public.categories WHERE parent_id IS NOT NULL;

-- Delete parent categories not in the dataset
DELETE FROM public.categories
WHERE slug NOT IN (
    'amethyst','citrine','pyrope-garnet','ruby',
    'sapphire','spinel','topaz','tourmaline'
);

-- Insert pyrope garnet if it doesn't exist
INSERT INTO public.categories (name, slug)
SELECT 'Pyrope Garnet', 'pyrope-garnet'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'pyrope-garnet');

-- Ensure all 8 dataset types exist
INSERT INTO public.categories (name, slug)
VALUES
    ('Amethyst',      'amethyst'),
    ('Citrine',       'citrine'),
    ('Ruby',          'ruby'),
    ('Sapphire',      'sapphire'),
    ('Spinel',        'spinel'),
    ('Topaz',         'topaz'),
    ('Tourmaline',    'tourmaline')
ON CONFLICT (slug) DO NOTHING;
