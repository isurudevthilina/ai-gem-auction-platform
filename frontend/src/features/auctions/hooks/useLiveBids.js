import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../config/supabase';

/**
 * useLiveBids(auctionId, initialBids)
 * Subscribes to Supabase Realtime for live bid inserts.
 * Prepends new bids to the top of the list.
 *
 * Returns: { bids, isConnected }
 */
const useLiveBids = (auctionId, initialBids = []) => {
    const [bids, setBids]               = useState(initialBids);
    const [isConnected, setIsConnected] = useState(false);
    const channelRef                    = useRef(null);

    // Sync initialBids when parent data loads
    useEffect(() => {
        if (initialBids?.length) setBids(initialBids);
    }, [initialBids?.length]); // eslint-disable-line

    useEffect(() => {
        if (!auctionId) return;

        const channel = supabase
            .channel(`bids-${auctionId}`)
            .on(
                'postgres_changes',
                {
                    event:  'INSERT',
                    schema: 'public',
                    table:  'bids',
                    filter: `auction_id=eq.${auctionId}`,
                },
                async (payload) => {
                    const newBid = payload.new;

                    // Fetch bidder profile to get full_name (payload only has raw columns)
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .eq('id', newBid.bidder_id)
                        .single();

                    const enrichedBid = {
                        ...newBid,
                        bidder: profile || { id: newBid.bidder_id, full_name: 'Anonymous' },
                    };

                    setBids((prev) => [enrichedBid, ...prev].slice(0, 50)); // keep last 50
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            setIsConnected(false);
        };
    }, [auctionId]);

    return { bids, isConnected };
};

export default useLiveBids;
