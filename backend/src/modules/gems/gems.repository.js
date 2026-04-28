const { supabaseAdmin } = require('../../config/supabase');

// ─── Shared select string ────────────────────────────────────────────────────
const GEM_SELECT = `
    id, title, description, carat_weight, cut, clarity, color,
    treatment, certification_body, certification, images,
    x, y, z,
    listing_type, status, buy_now_price, predicted_price,
    created_at, updated_at,
    seller:profiles!gems_seller_id_fkey ( id, full_name, avatar_url ),
    category:categories ( id, name, slug )
`;

const GEM_SELECT_MINIMAL = `
    id, title, carat_weight, color, clarity, cut, status,
    buy_now_price, images, listing_type, certification_body, certification,
    x, y, z,
    created_at, updated_at,
    category:categories ( id, name, slug )
`;

// ─── Create a gem ────────────────────────────────────────────────────────────
const create = async (record) => {
    const { data, error } = await supabaseAdmin
        .from('gems')
        .insert(record)
        .select(GEM_SELECT)
        .single();
    if (error) throw error;
    return data;
};

// ─── Enhanced select with auction + certificate data ─────────────────────────
const GEM_SELECT_FULL = `
    ${GEM_SELECT.trim()},
    auctions!auctions_gem_id_fkey ( id, current_price, end_time, bid_count, status ),
    certificates!certificates_gem_id_fkey ( id, status, issued_by )
`;

// ─── Find all public gems (status=listed or in_auction) with filters ─────────
const findAll = async ({ filters = {}, page = 1, limit = 12, sort = 'created_at', order = 'desc' }) => {
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    let query = supabaseAdmin
        .from('gems')
        .select(GEM_SELECT_FULL, { count: 'exact' })
        .in('status', ['listed', 'in_auction'])
        .range(from, to)
        .order(sort, { ascending: order === 'asc' });

    if (filters.category_id)   query = query.eq('category_id', filters.category_id);
    if (filters.listing_type)  query = query.eq('listing_type', filters.listing_type);
    if (filters.seller_id)     query = query.eq('seller_id', filters.seller_id);
    if (filters.color)         query = query.ilike('color', `%${filters.color}%`);
    if (filters.clarity)       query = query.ilike('clarity', `%${filters.clarity}%`);
    if (filters.cut)           query = query.ilike('cut', `%${filters.cut}%`);
    if (filters.origin)        query = query.ilike('origin', `%${filters.origin}%`);
    if (filters.treatment)     query = query.ilike('treatment', `%${filters.treatment}%`);
    if (filters.min_price)     query = query.gte('buy_now_price', parseFloat(filters.min_price));
    if (filters.max_price)     query = query.lte('buy_now_price', parseFloat(filters.max_price));
    if (filters.min_carat)     query = query.gte('carat_weight', parseFloat(filters.min_carat));
    if (filters.max_carat)     query = query.lte('carat_weight', parseFloat(filters.max_carat));

    // Server-side search
    if (filters.search) {
        const q = `%${filters.search}%`;
        query = query.or(`title.ilike.${q},color.ilike.${q},origin.ilike.${q}`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], count };
};

// ─── Quick search for typeahead ──────────────────────────────────────────────
const quickSearch = async (query, limit = 8) => {
    const q = `%${query}%`;
    const { data, error } = await supabaseAdmin
        .from('gems')
        .select('id, title, carat_weight, color, buy_now_price, images, listing_type, category:categories ( id, name )')
        .in('status', ['listed', 'in_auction'])
        .or(`title.ilike.${q},color.ilike.${q},origin.ilike.${q}`)
        .limit(limit)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

// ─── Find by ID ──────────────────────────────────────────────────────────────
const findById = async (id) => {
    const { data, error } = await supabaseAdmin
        .from('gems')
        .select(GEM_SELECT_FULL)
        .eq('id', id)
        .single();
    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
};

// ─── Find gems by seller ────────────────────────────────────────────────────
const findBySeller = async (sellerId) => {
    const { data, error } = await supabaseAdmin
        .from('gems')
        .select(GEM_SELECT_MINIMAL)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

// ─── Update a gem ────────────────────────────────────────────────────────────
const update = async (id, updates) => {
    const { data, error } = await supabaseAdmin
        .from('gems')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(GEM_SELECT)
        .single();
    if (error) throw error;
    return data;
};

// ─── Delete a gem ────────────────────────────────────────────────────────────
const remove = async (id) => {
    const { error } = await supabaseAdmin
        .from('gems')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// ─── Check active auctions for a gem ────────────────────────────────────────
const hasActiveAuction = async (gemId) => {
    const { data } = await supabaseAdmin
        .from('auctions')
        .select('id')
        .eq('gem_id', gemId)
        .eq('status', 'active')
        .maybeSingle();
    return !!data;
};

// ─── Categories ──────────────────────────────────────────────────────────────
const findAllCategories = async () => {
    const { data, error } = await supabaseAdmin
        .from('categories')
        .select('id, name, slug, parent_id')
        .order('name');
    if (error) throw error;
    return data || [];
};

// ─── Signed upload URL ──────────────────────────────────────────────────────
const createSignedUploadUrl = async (bucket, path) => {
    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUploadUrl(path);
    if (error) throw error;
    return data;
};

module.exports = {
    create,
    findAll,
    findById,
    findBySeller,
    update,
    remove,
    hasActiveAuction,
    findAllCategories,
    createSignedUploadUrl,
    quickSearch,
};
