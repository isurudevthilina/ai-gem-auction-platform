const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const findByUser = async (userId, filters) => {
  let query = supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.is_read === 'unread') {
    query = query.eq('is_read', false);
  } else if (filters.is_read === 'read') {
    query = query.eq('is_read', true);
  }

  query = query.order('created_at', { ascending: false });

  const limit = filters.limit || 20;
  const page = filters.page || 0;
  query = query.range(page * limit, page * limit + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data || [], count: count || 0 };
};

const getUnreadCount = async (userId) => {
  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count || 0;
};

const markAsRead = async (userId, ids) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .in('id', ids)
    .select('id');
  if (error) throw error;
  return { updated: (data || []).length };
};

const markAllAsRead = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select('id');
  if (error) throw error;
  return { updated: (data || []).length };
};

const deleteOne = async (userId, notificationId) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select('id')
    .single();
  if (error) throw new ApiError(404, 'Notification not found');
  return { deleted: true };
};

const deleteAllRead = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .eq('is_read', true)
    .select('id');
  if (error) throw error;
  return { deleted: (data || []).length };
};

const getRecent = async (userId, limit = 5) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
};

module.exports = {
  findByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteOne,
  deleteAllRead,
  getRecent,
};
