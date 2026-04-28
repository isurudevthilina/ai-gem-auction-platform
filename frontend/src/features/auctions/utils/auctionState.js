export const toLocalDateTimeInputValue = (value = new Date()) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const pad = (part) => String(part).padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const localDateTimeWithOffset = (offsetHours = 0) =>
    toLocalDateTimeInputValue(new Date(Date.now() + offsetHours * 3_600_000));

const getTime = (value) => {
    if (!value) return null;
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : null;
};

export const getAuctionState = (auction, now = Date.now()) => {
    if (!auction) return 'unknown';

    const nowMs = now instanceof Date ? now.getTime() : now;
    const startMs = getTime(auction.start_time);
    const endMs = getTime(auction.end_time);

    if (auction.status === 'cancelled') return 'cancelled';
    if (auction.status === 'reserve_not_met') return 'reserve_not_met';
    if (auction.status === 'completed') return 'completed';
    if (endMs !== null && endMs <= nowMs) return 'ended';
    if (auction.status === 'scheduled') return 'scheduled';
    if (auction.status === 'active' && startMs !== null && startMs > nowMs) return 'scheduled';
    if (auction.status === 'active') return 'live';

    return auction.status || 'unknown';
};

export const isAuctionLive = (auction, now) => getAuctionState(auction, now) === 'live';

export const isAuctionOpen = (auction, now) => {
    const state = getAuctionState(auction, now);
    return state === 'live' || state === 'scheduled';
};

export const isAuctionEnded = (auction, now) => {
    const state = getAuctionState(auction, now);
    return state === 'ended' || state === 'completed' || state === 'reserve_not_met';
};

export const getDashboardAuctionClass = (auction, now) => {
    const state = getAuctionState(auction, now);
    if (state === 'live') return 'active';
    if (state === 'scheduled') return 'scheduled';
    if (state === 'cancelled') return 'cancelled';
    if (state === 'ended' || state === 'completed' || state === 'reserve_not_met') return 'completed';
    return state;
};

export const getAuctionStatusLabel = (auction, now) => {
    const state = getAuctionState(auction, now);
    if (state === 'live') return 'LIVE';
    if (state === 'scheduled') return 'UPCOMING';
    if (state === 'cancelled') return 'CANCELLED';
    return 'ENDED';
};
