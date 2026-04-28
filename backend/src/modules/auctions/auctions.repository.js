const { supabaseAdmin } = require('../../config/supabase');

const AUCTION_SELECT_LIST = `
    id, starting_price, current_price, min_bid_increment,
    start_time, end_time, status, bid_count, created_at,
    seller:profiles!auctions_seller_id_fkey ( id, full_name, avatar_url, is_verified ),
    gem:gems (
        id, title, carat_weight, cut, clarity, color,
        images, buy_now_price, predicted_price,
        category:categories ( id, name, slug ),
        certificates:certificates!certificates_gem_id_fkey ( id, status, issued_by )
    )
`;

const AUCTION_SELECT_FULL = `
    id, starting_price, current_price, reserve_price,
    min_bid_increment, start_time, end_time, status,
    bid_count, created_at, winner_id,
    seller:profiles!auctions_seller_id_fkey ( id, full_name, avatar_url, is_verified ),
    winner:profiles!auctions_winner_id_fkey ( id, full_name ),
    gem:gems (
        id, title, description, carat_weight, cut, clarity, color,
        treatment, certification_body, certification, images,
        listing_type, buy_now_price, predicted_price,
        category:categories ( id, name, slug ),
        certificates:certificates!certificates_gem_id_fkey ( id, status, issued_by )
    )
`;

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const resolveGemIds = async ({ category_id, search }) => {
    if (!category_id && !search) return null;

    let query = supabaseAdmin
        .from('gems')
        .select('id');

    if (category_id) {
        query = query.eq('category_id', category_id);
    }

    if (search) {
        const safeSearch = String(search).replace(/[%_]/g, '\\$&');
        query = query.ilike('title', `%${safeSearch}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((gem) => gem.id);
};

const findAll = async ({
    status,
    upcoming,
    seller_id,
    category_id,
    search,
    min_price,
    max_price,
    page = 1,
    limit = 12,
    sort = 'end_time',
    order = 'asc',
}) => {
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to   = from + parseInt(limit) - 1;
    const now = new Date().toISOString();
    const gemIds = await resolveGemIds({ category_id, search });

    let query = supabaseAdmin
        .from('auctions')
        .select(AUCTION_SELECT_LIST, { count: 'exact' });

    if (upcoming === 'true') {
        query = query
            .eq('status', 'active')
            .gt('start_time', now);
    } else if (status === 'active') {
        // "Live" = status is active and the current time sits inside the auction window.
        query = query
            .eq('status', 'active')
            .lte('start_time', now)
            .gt('end_time', now);
    } else if (status === 'completed') {
        // "Ended" = explicitly completed OR active but past end_time (cron hasn't run yet)
        query = query.or(`status.in.(completed,reserve_not_met),and(status.eq.active,end_time.lte.${now})`);
    } else if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (seller_id) query = query.eq('seller_id', seller_id);
    if (gemIds) query = gemIds.length ? query.in('gem_id', gemIds) : query.in('gem_id', ['00000000-0000-0000-0000-000000000000']);

    const minPrice = toNumber(min_price);
    const maxPrice = toNumber(max_price);
    if (minPrice !== null) query = query.gte('current_price', minPrice);
    if (maxPrice !== null) query = query.lte('current_price', maxPrice);

    query = query
        .order(sort, { ascending: order === 'asc' })
        .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
        data: data || [],
        count,
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil((count || 0) / parseInt(limit)),
        },
    };
};

const findById = async (id) => {
    const { data: auction, error: auctionError } = await supabaseAdmin
        .from('auctions')
        .select(AUCTION_SELECT_FULL)
        .eq('id', id)
        .single();

    if (auctionError) {
        if (auctionError.code === 'PGRST116') return null;
        throw auctionError;
    }

    const { data: bids } = await supabaseAdmin
        .from('bids')
        .select(`
            id, amount, is_winning, created_at,
            bidder:profiles!bids_bidder_id_fkey ( id, full_name, avatar_url )
        `)
        .eq('auction_id', id)
        .order('amount', { ascending: false })
        .limit(10);

    return { ...auction, recent_bids: bids || [] };
};

const findBySeller = async (seller_id) => {
    const { data, error } = await supabaseAdmin
        .from('auctions')
        .select(AUCTION_SELECT_LIST)
        .eq('seller_id', seller_id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

const create = async (record) => {
    const { data, error } = await supabaseAdmin
        .from('auctions')
        .insert(record)
        .select()
        .single();

    if (error) throw error;
    return data;
};

const update = async (id, updates) => {
    const { data, error } = await supabaseAdmin
        .from('auctions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

const findRaw = async (id) => {
    const { data, error } = await supabaseAdmin
        .from('auctions')
        .select('id, seller_id, status, bid_count, gem_id, start_time')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
};

const findBids = async ({ auction_id, page = 1, limit = 20 }) => {
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to   = from + parseInt(limit) - 1;

    const { data, error, count } = await supabaseAdmin
        .from('bids')
        .select(`
            id, amount, is_winning, created_at,
            bidder:profiles!bids_bidder_id_fkey ( id, full_name, avatar_url )
        `, { count: 'exact' })
        .eq('auction_id', auction_id)
        .order('amount', { ascending: false })
        .range(from, to);

    if (error) throw error;

    return {
        data: data || [],
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil((count || 0) / parseInt(limit)),
        },
    };
};

const remove = async (id) => {
    const { error } = await supabaseAdmin.rpc('delete_auction_data', {
        target_auction_id: id,
    });
    if (error) throw error;
};

module.exports = { findAll, findById, findBySeller, create, update, findRaw, findBids, remove };
