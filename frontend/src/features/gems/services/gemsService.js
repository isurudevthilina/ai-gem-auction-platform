/**
 * gemsService.js
 * Direct Supabase calls for gem CRUD (browser client).
 * Used by SellerDashboard to list / create gems before auctioning them.
 */
import { supabase } from '../../../config/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// READ — all gems owned by a seller (excludes sold)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyGems = async (sellerId) => {
    const { data, error } = await supabase
        .from('gems')
        .select('id, title, carat_weight, status, buy_now_price, image_url, category:categories(id, name)')
        .eq('seller_id', sellerId)
        .neq('status', 'sold')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
};

// ─────────────────────────────────────────────────────────────────────────────
// READ — all categories (for dropdown)
// ─────────────────────────────────────────────────────────────────────────────
export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
    if (error) throw error;
    return data ?? [];
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE — insert a gem with status = 'draft'
// payload: { title, carat_weight, category_id, seller_id, buy_now_price?, description? }
// ─────────────────────────────────────────────────────────────────────────────
export const createGem = async (payload) => {
    const { data, error } = await supabase
        .from('gems')
        .insert([{ ...payload, status: 'draft' }])
        .select('id, title, carat_weight, status, buy_now_price, category:categories(id, name)')
        .single();
    if (error) throw error;
    return data;
};
