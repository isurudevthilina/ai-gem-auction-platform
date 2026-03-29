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

const getSellerRating = async (sellerId) => {
  const { data } = await supabaseAdmin
    .from('seller_ratings')
    .select('*')
    .eq('seller_id', sellerId)
    .maybeSingle();
  return data;
};

const update = async (id, reviewerId, data) => {
  const updateObj = { updated_at: new Date().toISOString() };
  if (data.rating !== undefined) updateObj.rating = data.rating;
  if (data.comment !== undefined) updateObj.comment = data.comment;

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
};
