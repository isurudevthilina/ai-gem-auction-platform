const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const WATCHLIST_SELECT = `
    *,
    gem:gems(id, title, images, carat_weight, color, clarity, cut, origin, status,
        listing_type, buy_now_price, predicted_price,
        category:categories(id, name),
        seller:profiles!gems_seller_id_fkey(id, full_name, avatar_url)),
    auction:auctions(id, current_price, end_time, status, bid_count)
`;

const getFolders = async (userId) => {
    const { data: folders, error } = await supabaseAdmin
        .from('watchlist_folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
    if (error) throw new ApiError(500, error.message);

    const foldersWithCount = await Promise.all(
        folders.map(async (folder) => {
            const { count, error: cErr } = await supabaseAdmin
                .from('watchlist')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('folder_id', folder.id);
            if (cErr) throw new ApiError(500, cErr.message);
            return { ...folder, gem_count: count || 0 };
        })
    );

    return foldersWithCount;
};

const createFolder = async (userId, name) => {
    const { data: existing, error: cErr } = await supabaseAdmin
        .from('watchlist_folders')
        .select('id')
        .eq('user_id', userId);
    if (cErr) throw new ApiError(500, cErr.message);
    if (existing.length >= 20) throw new ApiError(400, 'Maximum 20 folders allowed');

    const { data, error } = await supabaseAdmin
        .from('watchlist_folders')
        .insert({ user_id: userId, name })
        .select()
        .single();
    if (error) throw new ApiError(500, error.message);
    return data;
};

const renameFolder = async (folderId, userId, name) => {
    const { data, error } = await supabaseAdmin
        .from('watchlist_folders')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', folderId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error && error.code === 'PGRST116') throw new ApiError(404, 'Folder not found');
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, 'Folder not found');
    return data;
};

const deleteFolder = async (folderId, userId) => {
    await supabaseAdmin
        .from('watchlist')
        .update({ folder_id: null })
        .eq('folder_id', folderId)
        .eq('user_id', userId);

    const { error } = await supabaseAdmin
        .from('watchlist_folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', userId);
    if (error) throw new ApiError(500, error.message);
    return { deleted: true };
};

const getWatchlistByFolder = async (userId, folderId) => {
    let query = supabaseAdmin
        .from('watchlist')
        .select(WATCHLIST_SELECT)
        .eq('user_id', userId);

    if (folderId === 'uncategorized') {
        query = query.is('folder_id', null);
    } else {
        query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new ApiError(500, error.message);
    return data;
};

const getAll = async (userId) => {
    const { data, error } = await supabaseAdmin
        .from('watchlist')
        .select(WATCHLIST_SELECT)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw new ApiError(500, error.message);
    return data;
};

const addToWatchlist = async (userId, gemId, auctionId, folderId) => {
    if (gemId) {
        const { data: exists } = await supabaseAdmin
            .from('watchlist')
            .select('id')
            .eq('user_id', userId)
            .eq('gem_id', gemId)
            .maybeSingle();
        if (exists) throw new ApiError(409, 'Already in watchlist');
    }

    const { data, error } = await supabaseAdmin
        .from('watchlist')
        .insert({
            user_id: userId,
            gem_id: gemId || null,
            auction_id: auctionId || null,
            folder_id: folderId || null,
        })
        .select()
        .single();
    if (error) throw new ApiError(500, error.message);
    return data;
};

const removeFromWatchlist = async (userId, gemId) => {
    const { data, error } = await supabaseAdmin
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('gem_id', gemId)
        .select();
    if (error) throw new ApiError(500, error.message);
    if (!data || data.length === 0) throw new ApiError(404, 'Not in watchlist');
    return { deleted: true };
};

const moveToFolder = async (userId, watchlistId, folderId) => {
    const { data, error } = await supabaseAdmin
        .from('watchlist')
        .update({ folder_id: folderId })
        .eq('id', watchlistId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error && error.code === 'PGRST116') throw new ApiError(404, 'Watchlist item not found');
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, 'Watchlist item not found');
    return data;
};

const isInWatchlist = async (userId, gemId) => {
    const { data } = await supabaseAdmin
        .from('watchlist')
        .select('id, folder_id')
        .eq('user_id', userId)
        .eq('gem_id', gemId)
        .maybeSingle();
    return {
        inWatchlist: !!data,
        folderId: data?.folder_id || null,
        watchlistId: data?.id || null,
    };
};

const countByFolder = async (userId, folderId) => {
    let query = supabaseAdmin
        .from('watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (folderId === null) {
        query = query.is('folder_id', null);
    } else {
        query = query.eq('folder_id', folderId);
    }

    const { count, error } = await query;
    if (error) throw new ApiError(500, error.message);
    return count || 0;
};

const countAll = async (userId) => {
    const { count, error } = await supabaseAdmin
        .from('watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    if (error) throw new ApiError(500, error.message);
    return count || 0;
};

module.exports = {
    getFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    getWatchlistByFolder,
    getAll,
    addToWatchlist,
    removeFromWatchlist,
    moveToFolder,
    isInWatchlist,
    countByFolder,
    countAll,
};
