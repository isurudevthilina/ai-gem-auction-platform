-- Function to hard-delete an auction, temporarily dropping the no_delete_bids rule
-- so that ON DELETE CASCADE from auctions → bids works correctly.
-- Run this in Supabase SQL Editor once.
CREATE OR REPLACE FUNCTION delete_auction_data(target_auction_id UUID)
RETURNS void AS $$
BEGIN
    DROP RULE IF EXISTS no_delete_bids ON public.bids;
    DELETE FROM public.auctions WHERE id = target_auction_id;
    CREATE RULE no_delete_bids AS ON DELETE TO public.bids DO INSTEAD NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
