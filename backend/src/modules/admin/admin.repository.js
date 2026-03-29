const { supabaseAdmin } = require('../../config/supabase');

/* ── helpers ── */
const countFrom = async (table, filters = []) => {
  let q = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
  for (const [col, op, val] of filters) q = q.filter(col, op, val);
  const { count, error } = await q;
  if (error) return 0;
  return count || 0;
};

const cutoff = (hours) => new Date(Date.now() - hours * 3600_000).toISOString();

/* ── getPlatformStats ── */
const getPlatformStats = async () => {
  const [
    totalUsers,
    roleRows,
    newUsersToday,
    newUsersWeek,
    totalGems,
    statusRows,
    totalAuctions,
    activeAuctions,
    totalBidsToday,
    totalTransactions,
    completedTransactions,
    revenueResult,
    pendingCertificates,
    verifiedCertificates,
    ratingResult,
    totalReviews,
  ] = await Promise.all([
    countFrom('profiles'),
    supabaseAdmin
      .from('profiles')
      .select('role')
      .then(r => {
        const counts = { admin: 0, seller: 0, buyer: 0 };
        (r.data || []).forEach(p => { if (counts[p.role] !== undefined) counts[p.role]++; });
        return counts;
      }),
    countFrom('profiles', [['created_at', 'gte', cutoff(24)]]),
    countFrom('profiles', [['created_at', 'gte', cutoff(168)]]),
    countFrom('gems'),
    supabaseAdmin
      .from('gems')
      .select('status')
      .then(r => {
        const counts = { draft: 0, listed: 0, in_auction: 0, sold: 0 };
        (r.data || []).forEach(g => { if (counts[g.status] !== undefined) counts[g.status]++; });
        return counts;
      }),
    countFrom('auctions'),
    (async () => {
      const { count } = await supabaseAdmin
        .from('auctions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('end_time', new Date().toISOString());
      return count || 0;
    })(),
    countFrom('bids', [['created_at', 'gte', cutoff(24)]]),
    countFrom('transactions'),
    countFrom('transactions', [['status', 'eq', 'completed']]),
    supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('status', 'completed')
      .then(r => {
        const rows = r.data || [];
        return rows.reduce((s, row) => s + (parseFloat(row.amount) || 0), 0);
      }),
    countFrom('certificates', [['status', 'eq', 'pending']]),
    countFrom('certificates', [['status', 'eq', 'verified']]),
    supabaseAdmin
      .from('reviews')
      .select('rating')
      .then(r => {
        const rows = r.data || [];
        if (!rows.length) return null;
        const sum = rows.reduce((s, row) => s + row.rating, 0);
        return Math.round((sum / rows.length) * 100) / 100;
      }),
    countFrom('reviews'),
  ]);

  const users_by_role = roleRows;
  const gems_by_status = statusRows;

  return {
    total_users: totalUsers,
    users_by_role,
    new_users_today: newUsersToday,
    new_users_this_week: newUsersWeek,
    total_gems: totalGems,
    gems_by_status,
    total_auctions: totalAuctions,
    active_auctions: activeAuctions,
    total_bids_today: totalBidsToday,
    total_transactions: totalTransactions,
    completed_transactions: completedTransactions,
    total_revenue_simulated: revenueResult,
    pending_certificates: pendingCertificates,
    verified_certificates: verifiedCertificates,
    avg_rating_platform: ratingResult,
    total_reviews: totalReviews,
  };
};

/* ── getRecentUsers ── */
const getRecentUsers = async (limit = 8) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, is_verified, created_at, last_login_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data;
};

/* ── getRecentListings ── */
const getRecentListings = async (limit = 8) => {
  const { data, error } = await supabaseAdmin
    .from('gems')
    .select(`id, title, status, listing_type, created_at, images, buy_now_price,
      seller:profiles!gems_seller_id_fkey(full_name, is_verified),
      category:categories!gems_category_id_fkey(name)`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data;
};

/* ── getRecentActivity ── */
const getRecentActivity = async (limit = 20) => {
  const since = cutoff(48);

  const [users, gems, bids, certs, txns] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from('gems')
      .select('id, title, status, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from('bids')
      .select('id, amount, auction_id, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from('certificates')
      .select('id, issued_by, status, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from('transactions')
      .select('id, amount, type, created_at')
      .eq('status', 'completed')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  const items = [];

  (users.data || []).forEach(r =>
    items.push({ type: 'new_user', reference_id: r.id, label: r.full_name, sub_label: r.role, created_at: r.created_at }));
  (gems.data || []).forEach(r =>
    items.push({ type: 'new_listing', reference_id: r.id, label: r.title, sub_label: r.status, created_at: r.created_at }));
  (bids.data || []).forEach(r =>
    items.push({ type: 'new_bid', reference_id: r.id, label: String(r.amount), sub_label: String(r.auction_id), created_at: r.created_at }));
  (certs.data || []).forEach(r =>
    items.push({ type: 'cert_submitted', reference_id: r.id, label: r.issued_by || 'Certificate', sub_label: r.status, created_at: r.created_at }));
  (txns.data || []).forEach(r =>
    items.push({ type: 'txn_completed', reference_id: r.id, label: String(r.amount), sub_label: r.type, created_at: r.created_at }));

  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return items.slice(0, limit);
};

/* ── getPendingCertificates ── */
const getPendingCertificates = async () => {
  const { data, error, count } = await supabaseAdmin
    .from('certificates')
    .select(`*,
      gem:gems!certificates_gem_id_fkey(title, images, carat_weight),
      seller:profiles!certificates_seller_id_fkey(full_name, email, business_name)`,
      { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) return { data: [], count: 0 };
  return { data: data || [], count: count || 0 };
};

/* ── getAuctionsEndingSoon ── */
const getAuctionsEndingSoon = async () => {
  const now = new Date().toISOString();
  const twoHours = new Date(Date.now() + 2 * 3600_000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('auctions')
    .select(`id, end_time, current_price, bid_count, status,
      gem:gems!auctions_gem_id_fkey(title, images)`)
    .eq('status', 'active')
    .gte('end_time', now)
    .lte('end_time', twoHours)
    .order('end_time', { ascending: true });
  if (error) return [];
  return data || [];
};

module.exports = {
  getPlatformStats,
  getRecentUsers,
  getRecentListings,
  getRecentActivity,
  getPendingCertificates,
  getAuctionsEndingSoon,
};
