const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const CERT_SELECT_WITH_GEM = `
    id, gem_id, seller_id, document_url,
    issued_by, certificate_number, issued_date,
    status, notes, verified_by, verified_at,
    created_at, updated_at,
    gem:gems ( id, title, carat_weight, images, color, cut, clarity, origin, treatment, listing_type, status, category:categories ( id, name ) ),
    seller:profiles!seller_id ( id, full_name, email, avatar_url, business_name, phone_number, is_verified ),
    verifier:profiles!verified_by ( full_name )
`;

const findBySeller = async (sellerId) => {
    const { data, error } = await supabaseAdmin
        .from('certificates')
        .select(CERT_SELECT_WITH_GEM)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

const findByGem = async (gemId) => {
    const { data, error } = await supabaseAdmin
        .from('certificates')
        .select(CERT_SELECT_WITH_GEM)
        .eq('gem_id', gemId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

const create = async (record) => {
    const { data, error } = await supabaseAdmin
        .from('certificates')
        .insert(record)
        .select(CERT_SELECT_WITH_GEM)
        .single();

    if (error) throw error;
    return data;
};

const updateStatus = async (id, { status, notes, verified_by }) => {
    const updates = {
        status,
        updated_at: new Date().toISOString(),
        verified_by: verified_by || null,
        verified_at: new Date().toISOString(),
    };
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
        .from('certificates')
        .update(updates)
        .eq('id', id)
        .select(CERT_SELECT_WITH_GEM)
        .single();

    if (error) throw error;
    return data;
};

const findAll = async (filters = {}) => {
    let query = supabaseAdmin
        .from('certificates')
        .select(CERT_SELECT_WITH_GEM, { count: 'exact' });

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters.issued_by) {
        query = query.eq('issued_by', filters.issued_by);
    }
    if (filters.seller_id) {
        query = query.eq('seller_id', filters.seller_id);
    }

    const sort = filters.sort || 'oldest';
    if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
    } else if (sort === 'updated') {
        query = query.order('updated_at', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: true });
    }

    const limit = filters.limit || 12;
    const page = filters.page || 0;
    const offset = page * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], count };
};

const findById = async (id) => {
    const { data, error } = await supabaseAdmin
        .from('certificates')
        .select(CERT_SELECT_WITH_GEM)
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
};

const deleteCert = async (id, sellerId) => {
    const { data, error } = await supabaseAdmin
        .from('certificates')
        .delete()
        .eq('id', id)
        .eq('seller_id', sellerId)
        .select('id')
        .single();

    if (error || !data) {
        throw new ApiError(404, 'Certificate not found or cannot be deleted');
    }
    return { deleted: true };
};

const getCertStats = async () => {
    const { data, error } = await supabaseAdmin
        .from('certificates')
        .select('status');

    if (error) throw error;
    const rows = data || [];
    return {
        pending: rows.filter(r => r.status === 'pending').length,
        verified: rows.filter(r => r.status === 'verified').length,
        rejected: rows.filter(r => r.status === 'rejected').length,
        total: rows.length,
    };
};

const getUploadUrl = async (ext, sellerId) => {
    const path = `${sellerId}/${Date.now()}.${ext}`;
    const { data, error } = await supabaseAdmin.storage
        .from('certificates')
        .createSignedUploadUrl(path);

    if (error) throw error;
    return { path: data.path, token: data.token };
};

const getSignedDownloadUrl = async (storagePath, expiresIn = 3600) => {
    const { data, error } = await supabaseAdmin.storage
        .from('certificates')
        .createSignedUrl(storagePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
};

module.exports = { findBySeller, findByGem, create, updateStatus, findAll, findById, delete: deleteCert, getCertStats, getUploadUrl, getSignedDownloadUrl };
