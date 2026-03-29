const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

/**
 * Fetch the authenticated user's bid history across all auctions.
 * Single query + JS dedup (Supabase doesn't support DISTINCT ON).
 */
const getMyBidHistory = async (bidderId, { status = 'all', sort = 'newest', page = 0, limit = 12 }) => {
    const { data: allBids, error } = await supabaseAdmin
        .from('bids')
        .select(`
            id, auction_id, amount, is_winning, created_at,
            auction:auctions!bids_auction_id_fkey(
                id, current_price, end_time, start_time, status,
                winner_id, bid_count, reserve_price,
                gem:gems!auctions_gem_id_fkey(
                    id, title, images, carat_weight, color, cut, origin,
                    category:categories!gems_category_id_fkey(id, name)
                ),
                seller:profiles!auctions_seller_id_fkey(
                    id, full_name, avatar_url, is_verified
                )
            )
        `)
        .eq('bidder_id', bidderId)
        .order('amount', { ascending: false });

    if (error) throw new ApiError(500, 'Failed to fetch bid history', error.message);

    // Deduplicate — keep highest-amount bid per auction
    const seen = new Map();
    for (const bid of allBids) {
        if (!seen.has(bid.auction_id)) {
            seen.set(bid.auction_id, bid);
        }
    }
    let deduped = Array.from(seen.values());

    // Status filter
    if (status === 'active') {
        deduped = deduped.filter(b => b.auction?.status === 'active');
    } else if (status === 'won') {
        deduped = deduped.filter(b => b.auction?.winner_id === bidderId);
    } else if (status === 'outbid') {
        deduped = deduped.filter(b =>
            ['active', 'completed'].includes(b.auction?.status) &&
            b.auction?.winner_id !== bidderId &&
            b.auction?.winner_id != null
        );
    } else if (status === 'ended') {
        deduped = deduped.filter(b =>
            ['completed', 'cancelled', 'reserve_not_met'].includes(b.auction?.status)
        );
    }
    // 'all' — no filter

    // Sort
    if (sort === 'newest') {
        deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'ending') {
        deduped.sort((a, b) => new Date(a.auction.end_time) - new Date(b.auction.end_time));
    } else if (sort === 'highest') {
        deduped.sort((a, b) => b.amount - a.amount);
    } else if (sort === 'lowest') {
        deduped.sort((a, b) => a.amount - b.amount);
    }

    // Pagination
    const total = deduped.length;
    const pageNum = parseInt(page) || 0;
    const pageSize = Math.min(parseInt(limit) || 12, 50);
    const paginated = deduped.slice(pageNum * pageSize, (pageNum + 1) * pageSize);

    // Fetch transaction info for each paginated item
    const enriched = await Promise.all(
        paginated.map(async (item) => {
            const { data: txn } = await supabaseAdmin
                .from('transactions')
                .select('id, status, amount')
                .eq('auction_id', item.auction_id)
                .eq('buyer_id', bidderId)
                .maybeSingle();
            return { ...item, transaction: txn || null };
        })
    );

    return { data: enriched, total, page: pageNum, limit: pageSize };
};

/**
 * Aggregate bid statistics for the authenticated user.
 */
const getBidStats = async (bidderId) => {
    const { data: bids, error } = await supabaseAdmin
        .from('bids')
        .select('id, auction_id, amount, is_winning, auction:auctions!bids_auction_id_fkey(id, status, winner_id)')
        .eq('bidder_id', bidderId);

    if (error) throw new ApiError(500, 'Failed to fetch bid stats', error.message);

    const auctionMap = new Map();
    let highestBid = null;
    for (const bid of bids) {
        if (!auctionMap.has(bid.auction_id)) {
            auctionMap.set(bid.auction_id, bid);
        }
        if (highestBid === null || bid.amount > highestBid) {
            highestBid = bid.amount;
        }
    }

    const uniqueAuctions = Array.from(auctionMap.values());
    const total_auctions = uniqueAuctions.length;
    const currently_winning = uniqueAuctions.filter(
        b => b.is_winning && b.auction?.status === 'active'
    ).length;
    const auctions_won = uniqueAuctions.filter(
        b => b.auction?.winner_id === bidderId
    ).length;

    // Total spent from completed transactions
    const { data: txns, error: txnErr } = await supabaseAdmin
        .from('transactions')
        .select('amount')
        .eq('buyer_id', bidderId)
        .eq('status', 'completed');

    if (txnErr) throw new ApiError(500, 'Failed to fetch transactions', txnErr.message);

    const total_spent = txns && txns.length > 0
        ? txns.reduce((sum, t) => sum + parseFloat(t.amount), 0)
        : null;

    return {
        total_auctions,
        currently_winning,
        auctions_won,
        total_spent,
        highest_bid_ever: highestBid,
    };
};

/**
 * Fetch all bids the user placed on a specific auction.
 */
const getBidsByAuction = async (auctionId, bidderId) => {
    const { data, error } = await supabaseAdmin
        .from('bids')
        .select('id, amount, is_winning, created_at')
        .eq('auction_id', auctionId)
        .eq('bidder_id', bidderId)
        .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, 'Failed to fetch auction bids', error.message);
    return data;
};

module.exports = { getMyBidHistory, getBidStats, getBidsByAuction };
