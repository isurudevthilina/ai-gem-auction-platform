import { useState, useEffect, useCallback } from 'react';
import { getAuction } from '../services/auctionsService';
import { supabase } from '../../../config/supabase';

/**
 * useAuction(id)
 * Fetches auction data and keeps current_price in sync via Supabase Realtime.
 * Returns: { auction, loading, error, refresh }
 */
const useAuction = (id) => {
    const [auction, setAuction]   = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error,   setError]     = useState(null);

    const fetchAuction = useCallback(async () => {
        if (!id) return;
        try {
            setError(null);
            const res = await getAuction(id);
            setAuction(res.data);
        } catch (err) {
            setError(err?.message || 'Failed to load auction.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAuction();
    }, [fetchAuction]);

    // Subscribe to Realtime changes on auctions table for this row
    useEffect(() => {
        if (!id) return;

        const channel = supabase
            .channel(`auction-${id}`)
            .on(
                'postgres_changes',
                {
                    event:  'UPDATE',
                    schema: 'public',
                    table:  'auctions',
                    filter: `id=eq.${id}`,
                },
                (payload) => {
                    // Merge updated fields (current_price, bid_count, status)
                    setAuction((prev) =>
                        prev ? { ...prev, ...payload.new } : prev
                    );
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [id]);

    return { auction, loading, error, refresh: fetchAuction };
};

export default useAuction;
