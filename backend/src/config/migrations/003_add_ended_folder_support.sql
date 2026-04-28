-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION 003 — Ended Watchlist Folder Automation
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. Add is_system flag to watchlist_folders to distinguish system-managed folders.
ALTER TABLE public.watchlist_folders
    ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false;

-- 2. Update handle_new_user() to auto-create the "Ended" folder for new signups.
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

-- 3. Backfill "Ended" folders for existing users who don't have one yet.
INSERT INTO public.watchlist_folders (user_id, name, is_system)
SELECT id, 'Ended', true
FROM public.profiles
WHERE id NOT IN (
    SELECT user_id FROM public.watchlist_folders WHERE name = 'Ended' AND is_system = true
)
ON CONFLICT DO NOTHING;

-- 4. Helper: ensure a user has an "Ended" folder (used by triggers).
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

-- 5. Trigger: when a gem reaches a terminal status, move watchlist items to "Ended".
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

            UPDATE public.watchlist
            SET folder_id = ended_id
            WHERE id = wl_record.id;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gems_ended_watchlist ON public.gems;
CREATE TRIGGER gems_ended_watchlist
    AFTER UPDATE OF status ON public.gems
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.trigger_gem_ended_watchlist();

-- 6. Trigger: when an auction reaches a terminal status, move watchlist items to "Ended".
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

            UPDATE public.watchlist
            SET folder_id = ended_id
            WHERE id = wl_record.id;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auctions_ended_watchlist ON public.auctions;
CREATE TRIGGER auctions_ended_watchlist
    AFTER UPDATE OF status ON public.auctions
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.trigger_auction_ended_watchlist();
