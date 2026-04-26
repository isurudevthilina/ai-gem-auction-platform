const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const TRANSACTION_SELECT = `
  *,
  gem:gems!transactions_gem_id_fkey(
    id, title, images, carat_weight, color, clarity, cut, origin,
    status, buy_now_price, predicted_price, certification,
    category:categories!gems_category_id_fkey(id, name)
  ),
  buyer:profiles!transactions_buyer_id_fkey(
    id, full_name, email, phone_number, avatar_url, is_verified,
    business_name, district, city
  ),
  seller:profiles!transactions_seller_id_fkey(
    id, full_name, email, phone_number, avatar_url, is_verified,
    business_name, district, city
  )
`;

const create = async (data) => {
  const { data: txn, error } = await supabaseAdmin
    .from('transactions').insert(data).select().single();
  if (error) throw new ApiError(500, 'Failed to create transaction', error.message);
  return txn;
};

const findById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('transactions').select(TRANSACTION_SELECT).eq('id', id).single();
  if (error || !data) throw new ApiError(404, 'Transaction not found');
  return data;
};

const findByBuyer = async (buyerId, { status, page, limit }) => {
  let query = supabaseAdmin
    .from('transactions')
    .select(TRANSACTION_SELECT, { count: 'exact' })
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  if (status && status !== 'all') query = query.eq('status', status);
  const pageNum = parseInt(page) || 0;
  const pageSize = Math.min(parseInt(limit) || 12, 50);
  query = query.range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);
  const { data, count, error } = await query;
  if (error) throw new ApiError(500, 'Failed to fetch transactions', error.message);
  return { data, count, page: pageNum, limit: pageSize };
};

const findBySeller = async (sellerId, { status, page, limit }) => {
  let query = supabaseAdmin
    .from('transactions')
    .select(TRANSACTION_SELECT, { count: 'exact' })
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (status && status !== 'all') query = query.eq('status', status);
  const pageNum = parseInt(page) || 0;
  const pageSize = Math.min(parseInt(limit) || 12, 50);
  query = query.range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);
  const { data, count, error } = await query;
  if (error) throw new ApiError(500, 'Failed to fetch transactions', error.message);
  return { data, count, page: pageNum, limit: pageSize };
};

const updateStatus = async (id, userId, status, paymentReference = null) => {
  const update = { status, updated_at: new Date().toISOString() };
  if (paymentReference) update.payment_reference = paymentReference;
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update(update)
    .eq('id', id)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .select()
    .single();
  if (error || !data) throw new ApiError(404, 'Transaction not found or access denied');
  return data;
};

const markGemSold = async (gemId) => {
  const { data, error } = await supabaseAdmin
    .from('gems')
    .update({ status: 'sold', updated_at: new Date().toISOString() })
    .eq('id', gemId)
    .select('id, status')
    .single();
  if (error) throw new ApiError(500, 'Failed to update gem status', error.message);
  return data;
};

const notifyUser = async (userId, type, title, message, data = {}) => {
  await supabaseAdmin.from('notifications')
    .insert({ user_id: userId, type, title, message, data });
};

module.exports = {
  create, findById, findByBuyer, findBySeller,
  updateStatus, markGemSold, notifyUser,
};
