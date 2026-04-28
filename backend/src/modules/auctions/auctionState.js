const TERMINAL_STATUSES = new Set(['completed', 'cancelled', 'reserve_not_met']);

const computeAuctionState = (auction, now = new Date()) => {
    if (!auction) return 'unknown';

    const status = auction.status;
    const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
    const startMs = auction.start_time ? new Date(auction.start_time).getTime() : null;
    const endMs = auction.end_time ? new Date(auction.end_time).getTime() : null;

    if (status === 'cancelled') return 'cancelled';
    if (status === 'reserve_not_met') return 'reserve_not_met';
    if (status === 'completed') return 'completed';
    if (Number.isFinite(endMs) && endMs <= nowMs) return 'ended';
    if (status === 'scheduled') return 'scheduled';
    if (status === 'active' && Number.isFinite(startMs) && startMs > nowMs) return 'scheduled';
    if (status === 'active') return 'live';
    if (TERMINAL_STATUSES.has(status)) return status;

    return status || 'unknown';
};

module.exports = { computeAuctionState };
