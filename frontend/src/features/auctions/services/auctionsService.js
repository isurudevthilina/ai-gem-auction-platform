/**
 * auctionsService.js
 * All API calls for the Auctions + Bidding feature
 * Talks to the Express backend at /api/auctions
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const UUID_V4_LIKE_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assertUuid = (id, label) => {
    if (!UUID_V4_LIKE_REGEX.test(String(id || ''))) {
        throw { success: false, status: 400, message: `Invalid ${label}.` };
    }
};

// ── Helper: auth token ───────────────────────────────────────────────────
const getAuthHeaders = () => {
    const token = localStorage.getItem('gembid_token');
    return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
};

// ── Generic fetch wrapper ─────────────────────────────────────────────────
const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers },
    });
    const data = await res.json();
    if (!res.ok) throw { ...data, status: res.status };
    return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// READ — list auctions
// filters: { status, category_id, seller_id, search, page, limit, sort, order }
// ─────────────────────────────────────────────────────────────────────────────
export const getAuctions = (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v !== undefined && v !== '' && params.set(k, v));
    return apiFetch(`/api/auctions?${params.toString()}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// READ — single auction (includes recent_bids array)
// ─────────────────────────────────────────────────────────────────────────────
export const getAuction = (id) => {
    assertUuid(id, 'auction id');
    return apiFetch(`/api/auctions/${id}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE — new auction (seller only)
// payload: { gem_id, starting_price, min_bid_increment, start_time, end_time }
// ─────────────────────────────────────────────────────────────────────────────
export const createAuction = (payload) =>
    apiFetch('/api/auctions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE — end_time / min_bid_increment / status='cancelled'
// ─────────────────────────────────────────────────────────────────────────────
export const updateAuction = (id, payload) =>
    (assertUuid(id, 'auction id'),
    apiFetch(`/api/auctions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    }));

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — soft-delete (cancels auction)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAuction = (id) =>
    (assertUuid(id, 'auction id'), apiFetch(`/api/auctions/${id}`, { method: 'DELETE' }));

// ─────────────────────────────────────────────────────────────────────────────
// PLACE BID  — calls place_bid() RPC via backend
// ─────────────────────────────────────────────────────────────────────────────
export const placeBid = (auctionId, amount) =>
    (assertUuid(auctionId, 'auction id'),
    apiFetch(`/api/auctions/${auctionId}/bids`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
    }));

// ─────────────────────────────────────────────────────────────────────────────
// GET BID HISTORY
// ─────────────────────────────────────────────────────────────────────────────
export const getBids = (auctionId, page = 1, limit = 20) =>
    (assertUuid(auctionId, 'auction id'),
    apiFetch(`/api/auctions/${auctionId}/bids?page=${page}&limit=${limit}`));

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL BID HISTORY
// ─────────────────────────────────────────────────────────────────────────────
export const getMyBidHistory = (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) =>
        v !== undefined && v !== '' && params.set(k, v));
    return apiFetch(`/api/bids/my-history?${params.toString()}`);
};

export const getMyBidStats = () => apiFetch('/api/bids/my-stats');

export const getMyAuctionBids = (auctionId) =>
    (assertUuid(auctionId, 'auction id'), apiFetch(`/api/bids/${auctionId}/my-bids`));
