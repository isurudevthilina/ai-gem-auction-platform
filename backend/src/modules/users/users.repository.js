const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const findById = async (id) => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;
    return data;
};

const update = async (id, fields) => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

const updateAvatar = async (id, avatarUrl) => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

const findByEmail = async (email, excludeId) => {
    const { data } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .neq('id', excludeId)
        .maybeSingle();
    return data;
};

const hasActiveAuctions = async (userId) => {
    const { data } = await supabaseAdmin
        .from('auctions')
        .select('id')
        .eq('seller_id', userId)
        .in('status', ['active', 'scheduled'])
        .limit(1);
    return (data || []).length > 0;
};

const hasPendingTransactions = async (userId) => {
    const { data } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('buyer_id', userId)
        .eq('status', 'pending')
        .limit(1);
    return (data || []).length > 0;
};

const hasAnyTransactions = async (userId) => {
    const { data } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .limit(1);
    return (data || []).length > 0;
};

/**
 * Clean up user data via stored procedure (bypasses no_delete_bids rule),
 * then delete from auth.users.
 * Requires delete_user_data() function — see migration 004.
 */
const purgeUserAndDelete = async (userId) => {
    const { error: rpcErr } = await supabaseAdmin.rpc('delete_user_data', {
        target_user_id: userId,
    });
    if (rpcErr) {
        console.error('purgeUserAndDelete rpc error:', rpcErr);
        throw new ApiError(500, 'Failed to clean up user data');
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
        console.error('purgeUserAndDelete auth delete error:', error);
        throw new ApiError(500, 'Failed to delete user from auth');
    }
};

module.exports = {
    findById,
    update,
    updateAvatar,
    findByEmail,
    hasActiveAuctions,
    hasPendingTransactions,
    hasAnyTransactions,
    purgeUserAndDelete,
    adminFindAll,
    adminFindById,
    adminUpdateUser,
    adminDeactivateUser,
    getUserStats,
    getPublicProfile,
    searchSellers,
};

// ─── Public seller profile (sanitized) ──────────────────────────────────────
async function getPublicProfile(sellerId) {
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url, is_verified, business_name, district, province, role, created_at')
        .eq('id', sellerId)
        .eq('role', 'seller')
        .single();
    if (error || !profile) return null;

    const [activeGems, soldGems, activeAuctions, rating] = await Promise.all([
        supabaseAdmin.from('gems').select('id', { count: 'exact', head: true })
            .eq('seller_id', sellerId).in('status', ['listed', 'in_auction']),
        supabaseAdmin.from('gems').select('id', { count: 'exact', head: true })
            .eq('seller_id', sellerId).eq('status', 'sold'),
        supabaseAdmin.from('auctions').select('id', { count: 'exact', head: true })
            .eq('seller_id', sellerId).eq('status', 'active'),
        supabaseAdmin.from('seller_ratings').select('*')
            .eq('seller_id', sellerId).maybeSingle(),
    ]);

    return {
        ...profile,
        active_gem_count: activeGems.count || 0,
        sold_count: soldGems.count || 0,
        active_auction_count: activeAuctions.count || 0,
        avg_rating: rating.data?.avg_rating || null,
        review_count: rating.data?.review_count || 0,
    };
}

// ─── Search sellers by name ──────────────────────────────────────────────────
async function searchSellers(query, limit = 3) {
    const q = `%${query}%`;
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url, is_verified, business_name')
        .eq('role', 'seller')
        .or(`full_name.ilike.${q},business_name.ilike.${q}`)
        .limit(limit);
    if (error) throw error;
    return data || [];
}

/* ── Admin: list users with filters ── */
async function adminFindAll(filters) {
    const limit = filters.limit || 25;
    const page = filters.page || 0;
    const q = filters.query;

    let query = supabaseAdmin.from('profiles').select('*', { count: 'exact' });

    if (q) {
        query = query.or(
            `full_name.ilike.%${q}%,email.ilike.%${q}%,business_name.ilike.%${q}%`,
        );
    }
    if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
    }
    if (filters.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
    }

    switch (filters.sort) {
        case 'oldest':      query = query.order('created_at', { ascending: true }); break;
        case 'last_active': query = query.order('last_login_at', { ascending: false, nullsFirst: false }); break;
        case 'name_asc':    query = query.order('full_name', { ascending: true }); break;
        case 'name_desc':   query = query.order('full_name', { ascending: false }); break;
        default:            query = query.order('created_at', { ascending: false });
    }

    query = query.range(page * limit, page * limit + limit - 1);

    const { data: users, count, error } = await query;
    if (error) throw error;

    const ids = (users || []).map((u) => u.id);
    if (ids.length === 0) return { data: [], count: count || 0 };

    const withCounts = await Promise.all(
        ids.map(async (uid) => {
            const [gems, activeAuctions, bids, purchases, certs] = await Promise.all([
                supabaseAdmin.from('gems').select('id', { count: 'exact', head: true }).eq('seller_id', uid).neq('status', 'draft'),
                supabaseAdmin.from('auctions').select('id', { count: 'exact', head: true }).eq('seller_id', uid).eq('status', 'active'),
                supabaseAdmin.from('bids').select('id', { count: 'exact', head: true }).eq('bidder_id', uid),
                supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('buyer_id', uid),
                supabaseAdmin.from('certificates').select('id', { count: 'exact', head: true }).eq('seller_id', uid).eq('status', 'verified'),
            ]);
            const user = users.find((u) => u.id === uid);
            return {
                ...user,
                listing_count: gems.count || 0,
                active_auction_count: activeAuctions.count || 0,
                total_bid_count: bids.count || 0,
                purchase_count: purchases.count || 0,
                verified_cert_count: certs.count || 0,
            };
        }),
    );

    return { data: withCounts, count: count || 0 };
}

/* ── Admin: single user detail with full stats ── */
async function adminFindById(userId) {
    const { data: profile, error } = await supabaseAdmin
        .from('profiles').select('*').eq('id', userId).single();
    if (error || !profile) return null;

    const [
        totalListings, soldListings, activeListings,
        totalAuctions, activeAuctions,
        totalBids, bidRows,
        purchasesMade, salesMade, earnedRows,
        reviewsGiven, ratingRows,
        totalCerts, verifiedCerts,
    ] = await Promise.all([
        supabaseAdmin.from('gems').select('id', { count: 'exact', head: true }).eq('seller_id', userId).neq('status', 'draft'),
        supabaseAdmin.from('gems').select('id', { count: 'exact', head: true }).eq('seller_id', userId).eq('status', 'sold'),
        supabaseAdmin.from('gems').select('id', { count: 'exact', head: true }).eq('seller_id', userId).in('status', ['listed', 'in_auction']),
        supabaseAdmin.from('auctions').select('id', { count: 'exact', head: true }).eq('seller_id', userId),
        supabaseAdmin.from('auctions').select('id', { count: 'exact', head: true }).eq('seller_id', userId).eq('status', 'active'),
        supabaseAdmin.from('bids').select('id', { count: 'exact', head: true }).eq('bidder_id', userId),
        supabaseAdmin.from('bids').select('amount').eq('bidder_id', userId),
        supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('buyer_id', userId),
        supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('seller_id', userId),
        supabaseAdmin.from('transactions').select('amount').eq('seller_id', userId).eq('status', 'completed'),
        supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).eq('reviewer_id', userId),
        supabaseAdmin.from('reviews').select('rating').eq('reviewer_id', userId),
        supabaseAdmin.from('certificates').select('id', { count: 'exact', head: true }).eq('seller_id', userId),
        supabaseAdmin.from('certificates').select('id', { count: 'exact', head: true }).eq('seller_id', userId).eq('status', 'verified'),
    ]);

    const totalBidValue = (bidRows.data || []).reduce((s, r) => s + Number(r.amount || 0), 0);
    const totalEarned = (earnedRows.data || []).reduce((s, r) => s + Number(r.amount || 0), 0);
    const ratings = (ratingRows.data || []).map((r) => r.rating);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;

    return {
        ...profile,
        total_listings: totalListings.count || 0,
        sold_listings: soldListings.count || 0,
        active_listings: activeListings.count || 0,
        total_auctions: totalAuctions.count || 0,
        active_auctions: activeAuctions.count || 0,
        total_bids: totalBids.count || 0,
        total_bid_value: totalBidValue,
        purchases_made: purchasesMade.count || 0,
        sales_made: salesMade.count || 0,
        total_earned: totalEarned,
        reviews_given: reviewsGiven.count || 0,
        avg_rating_given: avgRating,
        total_certs: totalCerts.count || 0,
        verified_certs: verifiedCerts.count || 0,
    };
}

/* ── Admin: update user role / verification ── */
async function adminUpdateUser(userId, adminId, data) {
    if (userId === adminId) {
        throw new ApiError(400, 'Admins cannot modify their own role');
    }

    const { data: current, error: fetchErr } = await supabaseAdmin
        .from('profiles').select('role').eq('id', userId).single();
    if (fetchErr || !current) throw new ApiError(404, 'User not found');

    if (current.role === 'admin' && data.role && data.role !== 'admin') {
        throw new ApiError(403, 'Cannot demote another admin account');
    }

    const updateObj = {};
    if (data.role !== undefined) updateObj.role = data.role;
    if (data.is_verified !== undefined) updateObj.is_verified = data.is_verified;
    updateObj.updated_at = new Date().toISOString();

    const { data: updated, error: updateErr } = await supabaseAdmin
        .from('profiles').update(updateObj).eq('id', userId).select().single();
    if (updateErr) throw new ApiError(400, updateErr.message);

    return { updated, oldRole: current.role };
}

/* ── Admin: deactivate (delete) user ── */
async function adminDeactivateUser(userId, adminId) {
    if (userId === adminId) {
        throw new ApiError(400, 'Cannot deactivate your own account');
    }

    const { data: user, error: fetchErr } = await supabaseAdmin
        .from('profiles').select('role').eq('id', userId).single();
    if (fetchErr || !user) throw new ApiError(404, 'User not found');

    if (user.role === 'admin') {
        throw new ApiError(403, 'Cannot deactivate an admin account');
    }

    const activeAuctions = await hasActiveAuctions(userId);
    if (activeAuctions) {
        throw new ApiError(400, 'User has active auctions. Cancel them first.');
    }

    const { count } = await supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .eq('status', 'pending');
    if (count > 0) {
        throw new ApiError(400, 'User has pending transactions.');
    }

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (delErr) {
        console.error('adminDeactivateUser deleteUser error:', delErr);
        // Fallback: manually purge data then delete
        await purgeUserAndDelete(userId);
    }

    return { deleted: true, userId };
}

/* ── Admin: user stats overview ── */
async function getUserStats() {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [total, buyers, sellers, admins, verified, newWeek, activeMonth] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('last_login_at', monthAgo),
    ]);

    return {
        total: total.count || 0,
        buyers: buyers.count || 0,
        sellers: sellers.count || 0,
        admins: admins.count || 0,
        verified: verified.count || 0,
        new_this_week: newWeek.count || 0,
        active_monthly: activeMonth.count || 0,
    };
}
