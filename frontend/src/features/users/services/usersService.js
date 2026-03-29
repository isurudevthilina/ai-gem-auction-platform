/**
 * usersService.js — API calls for the users/profile module
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

/** Get current user's profile */
export const getMe = () => apiFetch('/api/users/me');

/** Update profile fields */
export const updateProfile = (fields) =>
    apiFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(fields) });

/** Upload avatar (multipart) */
export const updateAvatar = async (file) => {
    const token = localStorage.getItem('gembid_token');
    const form = new FormData();
    form.append('avatar', file);
    const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
    });
    const data = await res.json();
    if (!res.ok) throw { ...data, status: res.status };
    return data;
};

/** Change email */
export const changeEmail = (payload) =>
    apiFetch('/api/users/me/email', { method: 'PATCH', body: JSON.stringify(payload) });

/** Change password */
export const changePassword = (payload) =>
    apiFetch('/api/users/me/password', { method: 'PATCH', body: JSON.stringify(payload) });

/** Delete account */
export const deleteAccount = (payload) =>
    apiFetch('/api/users/me', { method: 'DELETE', body: JSON.stringify(payload) });

/** Search sellers (public) */
export const searchSellers = (q, limit = 3) =>
    apiFetch(`/api/users/search/sellers?q=${encodeURIComponent(q)}&limit=${limit}`);

/** Get public seller profile */
export const getPublicProfile = (id) =>
    apiFetch(`/api/users/${id}/public`);
