const { supabaseAdmin } = require('../../config/supabase');

const AUCTION_SELECT_LIST = `
    id, starting_price, current_price, min_bid_increment,
    start_time, end_time, status, bid_count, created_at,
    seller:profiles!auctions_seller_id_fkey ( id, full_name, avatar_url ),
    gem:gems (
        id, title, carat_weight, cut, clarity, color, origin,
        images, buy_now_price, predicted_price,
        category:categories ( id, name, slug ),
        certificates:certificates!certificates_gem_id_fkey ( id, status, issued_by )
    )
`;

const AUCTION_SELECT_FULL = `
    id, starting_price, current_price, reserve_price,
    min_bid_increment, start_time, end_time, status,
    bid_count, created_at, winner_id,
    seller:profiles!auctions_seller_id_fkey ( id, full_name, avatar_url ),
    winner:profiles!auctions_winner_id_fkey ( id, full_name ),
    gem:gems (
        id, title, description, carat_weight, cut, clarity, color,
        origin, treatment, certification, images,
        listing_type, buy_now_price, predicted_price,
        category:categories ( id, name, slug ),
        certificates:certificates!certificates_gem_id_fkey ( id, status, issued_by )
    )
`;

const findAll = async ({ status, upcoming, seller_id, category_id, search, page = 1, limit = 12, sort = 'end_time', order = 'asc' }) => {
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to   = from + parseInt(limit) - 1;

    let query = supabaseAdmin
        .from('auctions')
        .select(AUCTION_SELECT_LIST, { count: 'exact' })
        .range(from, to)
        .order(sort, { ascending: order === 'asc' });

    const now = new Date().toISOString();

    if (upcoming === 'true') {
        query = query
            .eq('status', 'active')
            .gt('start_time', now);
    } else if (status === 'active') {
        // "Live" = status is active AND end_time hasn't passed yet
        query = query
            .eq('status', 'active')
            .gt('end_time', now);
    } else if (status === 'completed') {
        // "Ended" = explicitly completed OR active but past end_time (cron hasn't run yet)
        query = query.or(`status.eq.completed,and(status.eq.active,end_time.lt.${now})`);
    } else if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (seller_id) query = query.eq('seller_id', seller_id);

    const { data, error, count } = await query;
    if (error) throw error;

    let filtered = data || [];
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(a => a.gem?.title?.toLowerCase().includes(q));
    }
    if (category_id) {
        filtered = filtered.filter(a => a.gem?.category?.id === category_id);
    }

    return {
        data: filtered,
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
        .select('id, seller_id, status, bid_count, gem_id')
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

module.exports = { findAll, findById, findBySeller, create, update, findRaw, findBids };
