/**
 * gemsService.js — API calls for the gems module
 */
import { supabase } from '../../../config/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ── Helper: auth token ───────────────────────────────────────────────────
const getAuthHeaders = () => {
    const token = localStorage.getItem('gembid_token');
    return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
};

const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers },
    });
    const data = await res.json();
    if (!res.ok) throw { ...data, status: res.status };
    return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Public — gem catalog
// ─────────────────────────────────────────────────────────────────────────────

/** List gems with filtering/pagination */
export const getGems = (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) params.set(k, v);
    });
    return apiFetch(`/api/gems?${params.toString()}`);
};

/** Single gem detail */
export const getGem = (id) => apiFetch(`/api/gems/${id}`);

/** All categories (nested parent/child) */
export const getGemCategories = () => apiFetch('/api/gems/categories');

/** Quick search for typeahead */
export const searchGems = (q, limit = 5) =>
    apiFetch(`/api/gems/search?q=${encodeURIComponent(q)}&limit=${limit}`);

/** AI valuation proxy */
export const aiValuate = (payload) =>
    apiFetch('/api/gems/ai-valuate', { method: 'POST', body: JSON.stringify(payload) });

// ─────────────────────────────────────────────────────────────────────────────
// Seller — own gems
// ─────────────────────────────────────────────────────────────────────────────

/** Seller's own gems */
export const getMyGems = () => apiFetch('/api/gems/my/listings');

/** Create gem via backend (Zod-validated) */
export const createGemViaAPI = (payload) =>
    apiFetch('/api/gems', { method: 'POST', body: JSON.stringify(payload) });

/** Update gem */
export const updateGemViaAPI = (id, payload) =>
    apiFetch(`/api/gems/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

/** Publish gem (draft → listed) */
export const publishGem = (id) =>
    apiFetch(`/api/gems/${id}/publish`, { method: 'PATCH' });

/** Delete gem */
export const deleteGem = (id) =>
    apiFetch(`/api/gems/${id}`, { method: 'DELETE' });

// ─────────────────────────────────────────────────────────────────────────────
// Upload — signed URL approach (bypasses RLS)
// ─────────────────────────────────────────────────────────────────────────────

/** Upload a gem image. Returns the public URL. */
export const uploadGemImage = async (file) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';

    const res = await apiFetch('/api/gems/upload-url', {
        method: 'POST',
        body: JSON.stringify({ ext, bucket: 'gem-images' }),
    });
    const { path, token } = res.data;

    const { error } = await supabase.storage
        .from('gem-images')
        .uploadToSignedUrl(path, token, file, { contentType: file.type });
    if (error) throw error;

    const { data } = supabase.storage.from('gem-images').getPublicUrl(path);
    return data.publicUrl;
};

/** Upload a 3D model (.glb). Returns the public URL prefixed with "model:" */
export const uploadGemModel = async (file) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'glb';

    const res = await apiFetch('/api/gems/upload-url', {
        method: 'POST',
        body: JSON.stringify({ ext, bucket: 'gem-models' }),
    });
    const { path, token } = res.data;

    const { error } = await supabase.storage
        .from('gem-models')
        .uploadToSignedUrl(path, token, file, { contentType: file.type || 'model/gltf-binary' });
    if (error) throw error;

    const { data } = supabase.storage.from('gem-models').getPublicUrl(path);
    return `model:${data.publicUrl}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy direct Supabase (kept for backward compat)
// ─────────────────────────────────────────────────────────────────────────────
export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
    if (error) throw error;
    return data ?? [];
};
