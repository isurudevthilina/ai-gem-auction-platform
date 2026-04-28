const repo = require('./gems.repository');

// ─── Create gem ──────────────────────────────────────────────────────────────
const createGem = async (validated, sellerId) => {
    const d = validated;

    const record = {
        seller_id:     sellerId,
        title:         d.title,
        category_id:   d.category_id,
        carat_weight:  d.carat_weight,
        color:         d.color || null,
        clarity:       d.clarity || null,
        cut:           d.cut || null,
        treatment:          d.treatment || null,
        certification_body: d.certification_body || null,
        certification:      d.certification || null,
        description:        d.description || null,
        x:             d.x ?? null,
        y:             d.y ?? null,
        z:             d.z ?? null,
        images:        d.images || [],
        listing_type:  d.listing_type,
        buy_now_price: d.buy_now_price,
        status:        d.status || 'draft',
        predicted_price: null,
    };

    return repo.create(record);
};

// ─── List public gems ────────────────────────────────────────────────────────
const listGems = async (query) => {
    const ALLOWED_SORT  = ['created_at', 'buy_now_price', 'carat_weight', 'title'];
    const ALLOWED_ORDER = ['asc', 'desc'];

    const page  = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 12));
    const sort  = ALLOWED_SORT.includes(query.sort) ? query.sort : 'created_at';
    const order = ALLOWED_ORDER.includes(query.order) ? query.order : 'desc';

    const filters = {};
    const filterKeys = [
        'category_id', 'listing_type', 'color', 'clarity',
        'cut', 'origin', 'treatment', 'min_price', 'max_price',
        'min_carat', 'max_carat', 'seller_id', 'search',
    ];
    for (const key of filterKeys) {
        if (query[key]) filters[key] = query[key];
    }

    // Whitelist listing_type
    if (filters.listing_type && !['auction', 'direct_sell'].includes(filters.listing_type)) {
        delete filters.listing_type;
    }

    const { data, count } = await repo.findAll({ filters, page, limit, sort, order });

    return {
        data,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        },
    };
};

// ─── Quick search for typeahead ──────────────────────────────────────────────
const quickSearch = async (q, limit) => {
    const safeLimit = Math.min(10, Math.max(1, parseInt(limit) || 8));
    if (!q || q.length < 2) return [];
    return repo.quickSearch(q, safeLimit);
};

// ─── Get single gem (with access control) ────────────────────────────────────
const getGemById = async (id, requestUser) => {
    const gem = await repo.findById(id);
    if (!gem) return null;

    // Only show non-listed gems to their seller or admin
    if (gem.status !== 'listed') {
        if (!requestUser) return null;
        if (gem.seller?.id !== requestUser.id && requestUser.role !== 'admin') return null;
    }

    return gem;
};

// ─── Get seller's gems ──────────────────────────────────────────────────────
const getSellerGems = async (sellerId) => {
    return repo.findBySeller(sellerId);
};

// ─── Update gem ──────────────────────────────────────────────────────────────
const updateGem = async (id, validated, requestUser) => {
    const existing = await repo.findById(id);
    if (!existing) return { error: 'not_found' };

    // Ownership
    if (existing.seller?.id !== requestUser.id && requestUser.role !== 'admin') {
        return { error: 'forbidden' };
    }

    if (existing.status === 'sold') {
        return { error: 'sold' };
    }

    const updates = { ...validated };

    const gem = await repo.update(id, updates);
    return { data: gem };
};

// ─── Publish (draft → listed) ────────────────────────────────────────────────
const publishGem = async (id, requestUser) => {
    const existing = await repo.findById(id);
    if (!existing) return { error: 'not_found' };
    if (existing.seller?.id !== requestUser.id && requestUser.role !== 'admin') {
        return { error: 'forbidden' };
    }
    if (existing.status !== 'draft') {
        return { error: 'invalid_status', message: 'Only draft gems can be published.' };
    }
    const gem = await repo.update(id, { status: 'listed' });
    return { data: gem };
};

// ─── Delete gem ──────────────────────────────────────────────────────────────
const deleteGem = async (id, requestUser) => {
    const existing = await repo.findById(id);
    if (!existing) return { error: 'not_found' };
    if (existing.seller?.id !== requestUser.id && requestUser.role !== 'admin') {
        return { error: 'forbidden' };
    }
    if (existing.status === 'sold') {
        return { error: 'sold' };
    }
    const hasAuction = await repo.hasActiveAuction(id);
    if (hasAuction) {
        return { error: 'active_auction' };
    }
    await repo.remove(id);
    return { success: true };
};

// ─── Categories (nested) ────────────────────────────────────────────────────
const getCategories = async () => {
    const rows = await repo.findAllCategories();
    // Build nested structure: parents with children
    const parents = rows.filter(r => !r.parent_id);
    const children = rows.filter(r => r.parent_id);

    return parents.map(p => ({
        ...p,
        children: children.filter(c => c.parent_id === p.id),
    }));
};

// ─── Signed upload URL ──────────────────────────────────────────────────────
const getSignedUploadUrl = async (bucket, ext, userId) => {
    const safeExt = String(ext).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg';
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
    const data = await repo.createSignedUploadUrl(bucket, path);
    return { path: data.path, token: data.token };
};

module.exports = {
    createGem,
    listGems,
    quickSearch,
    getGemById,
    getSellerGems,
    updateGem,
    publishGem,
    deleteGem,
    getCategories,
    getSignedUploadUrl,
};
