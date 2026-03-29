/**
 * certificatesService.js — API calls for the certificates module
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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

/** Get all certificates for the authenticated seller */
export const getCertificates = () => apiFetch('/api/certificates/mine');

/** Get certificates for a specific gem */
export const getGemCertificates = (gemId) => apiFetch(`/api/certificates/gem/${gemId}`);

/** Get a signed upload URL for a certificate PDF */
export const getUploadUrl = (ext) =>
    apiFetch('/api/certificates/upload-url', {
        method: 'POST',
        body: JSON.stringify({ ext }),
    });

/** Upload a certificate file to Supabase Storage using a signed URL */
export const uploadCertificateFile = async (path, token, file) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/storage/v1/object/upload/sign/certificates/${path}?token=${encodeURIComponent(token)}`;

    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/pdf' },
        body: file,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Upload failed');
    }

    // Private bucket — build the authenticated URL via the backend instead of getPublicUrl
    return `${supabaseUrl}/storage/v1/object/certificates/${path}`;
};

/** Create a certificate record in the database */
export const createCertificate = (payload) =>
    apiFetch('/api/certificates', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

/** Admin — list all certificates with filters */
export const getAdminCertificates = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.issued_by) params.set('issued_by', filters.issued_by);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page != null) params.set('page', filters.page);
    if (filters.limit) params.set('limit', filters.limit);
    return apiFetch(`/api/certificates?${params.toString()}`);
};

/** Admin — certificate stats */
export const getCertStats = () => apiFetch('/api/certificates/stats');

/** Get a single certificate by ID */
export const getCertById = (id) => apiFetch(`/api/certificates/${id}`);

/** Admin — verify a certificate */
export const verifyCertificate = (id, notes) =>
    apiFetch(`/api/certificates/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
    });

/** Admin — reject a certificate */
export const rejectCertificate = (id, notes) =>
    apiFetch(`/api/certificates/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
    });

/** Delete a pending certificate */
export const deleteCertificate = (id) =>
    apiFetch(`/api/certificates/${id}`, { method: 'DELETE' });

/** Get a signed download URL for a certificate PDF (1-hour expiry) */
export const getDocumentUrl = (id) =>
    apiFetch(`/api/certificates/${id}/document-url`);
