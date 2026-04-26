const repository = require('./bids.repository');

/**
 * Fetch bid history with enriched outcome data.
 */
const getMyBidHistory = async (bidderId, filters) => {
    const result = await repository.getMyBidHistory(bidderId, filters);
    const now = Date.now();

    const enrichedItems = result.data.map((item) => {
        const auction = item.auction;
        const auctionActive = auction.status === 'active' &&
            new Date(auction.end_time).getTime() > now;

        let bid_outcome;
        if (auctionActive && item.is_winning) {
            bid_outcome = 'winning';
        } else if (auctionActive && !item.is_winning) {
            bid_outcome = 'outbid';
        } else if (auction.status === 'completed' && auction.winner_id === bidderId) {
            bid_outcome = 'won';
        } else if (auction.status === 'completed' && auction.winner_id !== bidderId) {
            bid_outcome = 'lost';
        } else if (auction.status === 'cancelled') {
            bid_outcome = 'cancelled';
        } else if (auction.status === 'reserve_not_met') {
            bid_outcome = 'reserve_not_met';
        } else {
            bid_outcome = 'ended';
        }

        const outbid_by_amount = bid_outcome === 'outbid'
            ? auction.current_price - item.amount
            : null;

        const time_remaining_ms = auctionActive
            ? new Date(auction.end_time).getTime() - now
            : null;

        return { ...item, bid_outcome, outbid_by_amount, time_remaining_ms };
    });

    return { ...result, data: enrichedItems };
};

/**
 * Bid stats pass-through.
 */
const getBidStats = async (bidderId) => {
    return repository.getBidStats(bidderId);
};

/**
 * Bids on a single auction pass-through.
 */
const getBidsByAuction = async (auctionId, bidderId) => {
    return repository.getBidsByAuction(auctionId, bidderId);
};

module.exports = { getMyBidHistory, getBidStats, getBidsByAuction };
