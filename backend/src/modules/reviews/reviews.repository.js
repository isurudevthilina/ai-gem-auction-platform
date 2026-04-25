const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const REVIEW_SELECT = `*,
  reviewer:profiles!reviews_reviewer_id_fkey(
    id, full_name, avatar_url),
  transaction:transactions!reviews_transaction_id_fkey(
    id, amount, type, gem_id,
    gem:gems!transactions_gem_id_fkey(
      id, title, images, carat_weight,
      category:categories!gems_category_id_fkey(id, name)
    )
  )`;

const create = async (data) => {
  const { data: review, error } = await supabaseAdmin
    .from('reviews')
    .insert(data)
    .select(`*, reviewer:profiles!reviews_reviewer_id_fkey(
      id, full_name, avatar_url)`)
    .single();
  if (error) throw new ApiError(500, 'Failed to create review', error.message);
  return review;
};

const findById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('id', id)
    .single();
  if (error || !data) throw new ApiError(404, 'Review not found');
  return data;
};

const findBySeller = async (sellerId, filters) => {
  const { rating, sort, page, limit } = filters;
  const pageNum = parseInt(page) || 0;
  const pageSize = Math.min(parseInt(limit) || 10, 50);
  const offset = pageNum * pageSize;

  let query = supabaseAdmin
    .from('reviews')
    .select(REVIEW_SELECT, { count: 'exact' })
    .eq('seller_id', sellerId);

  if (rating) query = query.eq('rating', rating);

  if (sort === 'highest') {
    query = query.order('rating', { ascending: false });
  } else if (sort === 'lowest') {
    query = query.order('rating', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw new ApiError(500, 'Failed to fetch reviews', error.message);
  return { data, count, page: pageNum, limit: pageSize };
};

const findByReviewer = async (reviewerId) => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('reviewer_id', reviewerId)
    .order('created_at', { ascending: false });
  if (error) throw new ApiError(500, 'Failed to fetch reviews', error.message);
  return data;
};

const findByTransaction = async (transactionId) => {
  const { data } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('transaction_id', transactionId)
    .maybeSingle();
  return data;
};

const getReviewPostCount = async (reviewerId, transactionId) => {
  const { data } = await supabaseAdmin
    .from('review_post_counters')
    .select('post_count')
    .eq('reviewer_id', reviewerId)
    .eq('transaction_id', transactionId)
    .maybeSingle();
  return Number(data?.post_count || 0);
};

const getSellerRating = async (sellerId) => {
  const { data } = await supabaseAdmin
    .from('seller_ratings')
    .select('*')
    .eq('seller_id', sellerId)
    .maybeSingle();
  return data;
};

const createReport = async (data) => {
  const { data: report, error } = await supabaseAdmin
    .from('review_reports')
    .insert(data)
    .select('*')
    .single();
  if (error) throw new ApiError(500, 'Failed to create review report', error.message);
  return report;
};

const findOpenReportByReviewAndReporter = async (reviewId, reporterId) => {
  const { data } = await supabaseAdmin
    .from('review_reports')
    .select('id, status')
    .eq('review_id', reviewId)
    .eq('reporter_id', reporterId)
    .eq('status', 'open')
    .maybeSingle();
  return data;
};

const REPORT_SELECT = `
  *,
  review:reviews(id, rating, comment, created_at, transaction_id, reviewer_id, seller_id),
  reporter:profiles!review_reports_reporter_id_fkey(id, full_name, email),
  reviewer:profiles!review_reports_reviewer_id_fkey(id, full_name, email),
  seller:profiles!review_reports_seller_id_fkey(id, full_name, email, business_name),
  resolver:profiles!review_reports_resolved_by_fkey(id, full_name, email)
`;

const findReports = async (filters) => {
  const page = Number(filters.page || 0);
  const limit = Math.min(Number(filters.limit || 20), 100);
  const offset = page * limit;

  let query = supabaseAdmin
    .from('review_reports')
    .select(REPORT_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) throw new ApiError(500, 'Failed to fetch review reports', error.message);
  return { data: data || [], count: count || 0, page, limit };
};

const findReportsByReporter = async (reporterId, filters) => {
  const page = Number(filters.page || 0);
  const limit = Math.min(Number(filters.limit || 20), 100);
  const offset = page * limit;

  let query = supabaseAdmin
    .from('review_reports')
    .select(REPORT_SELECT, { count: 'exact' })
    .eq('reporter_id', reporterId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) throw new ApiError(500, 'Failed to fetch your review reports', error.message);
  return { data: data || [], count: count || 0, page, limit };
};

const findReportById = async (reportId) => {
  const { data, error } = await supabaseAdmin
    .from('review_reports')
    .select(REPORT_SELECT)
    .eq('id', reportId)
    .single();
  if (error || !data) throw new ApiError(404, 'Review report not found');
  return data;
};

const resolveReport = async (reportId, payload) => {
  const { data, error } = await supabaseAdmin
    .from('review_reports')
    .update(payload)
    .eq('id', reportId)
    .select(REPORT_SELECT)
    .single();

  if (error || !data) throw new ApiError(500, 'Failed to resolve review report', error?.message);
  return data;
};

const findAdminIds = async () => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('role', 'admin');

  if (error) return [];
  return (data || []).map((r) => r.id);
};

const createNotifications = async (rows) => {
  if (!rows || rows.length === 0) return;
  const { error } = await supabaseAdmin
    .from('notifications')
    .insert(rows);
  if (error) throw new ApiError(500, 'Failed to create notification', error.message);
};

const createSignedUploadUrl = async (bucket, path) => {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error) throw new ApiError(500, 'Failed to create signed upload URL', error.message);
  return data;
};

const update = async (id, reviewerId, data) => {
  const updateObj = { updated_at: new Date().toISOString() };
  if (data.rating !== undefined) updateObj.rating = data.rating;
  if (data.comment !== undefined) updateObj.comment = data.comment;
  if (data.media_urls !== undefined) updateObj.media_urls = data.media_urls;
  if (data.edit_count !== undefined) updateObj.edit_count = data.edit_count;

  const { data: updated, error } = await supabaseAdmin
    .from('reviews')
    .update(updateObj)
    .eq('id', id)
    .eq('reviewer_id', reviewerId)
    .select()
    .single();
  if (error || !updated) throw new ApiError(404, 'Review not found');
  return updated;
};

const deleteReview = async (id, userId, isAdmin) => {
  let query = supabaseAdmin.from('reviews').delete().eq('id', id);
  if (!isAdmin) query = query.eq('reviewer_id', userId);

  const { data, error } = await query.select();
  if (error || !data || data.length === 0)
    throw new ApiError(404, 'Review not found');
  return { deleted: true };
};

module.exports = {
  create, findById, findBySeller, findByReviewer,
  findByTransaction, getSellerRating, update, delete: deleteReview,
  getReviewPostCount,
  createReport,
  findOpenReportByReviewAndReporter,
  findReports,
  findReportsByReporter,
  findReportById,
  resolveReport,
  findAdminIds,
  createNotifications,
  createSignedUploadUrl,
};
