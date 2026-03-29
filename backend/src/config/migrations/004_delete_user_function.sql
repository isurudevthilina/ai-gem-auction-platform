-- Function to delete user data, temporarily dropping the no_delete_bids rule
-- Run this in Supabase SQL Editor once
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS void AS $$
BEGIN
    DROP RULE IF EXISTS no_delete_bids ON public.bids;
    DELETE FROM public.profiles WHERE id = target_user_id;
    CREATE RULE no_delete_bids AS ON DELETE TO public.bids DO INSTEAD NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
