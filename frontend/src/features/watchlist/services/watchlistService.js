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

export const getFolders = () => apiFetch('/api/watchlist/folders');

export const createFolder = (name) =>
    apiFetch('/api/watchlist/folders', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });

export const renameFolder = (id, name) =>
    apiFetch(`/api/watchlist/folders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
    });

export const deleteFolder = (id) =>
    apiFetch(`/api/watchlist/folders/${id}`, { method: 'DELETE' });

export const getWatchlist = (folderId) => {
    const params = folderId && folderId !== 'all' ? `?folder=${folderId}` : '';
    return apiFetch(`/api/watchlist${params}`);
};

export const addToWatchlist = (data) =>
    apiFetch('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const removeFromWatchlist = (gemId) =>
    apiFetch(`/api/watchlist/${gemId}`, { method: 'DELETE' });

export const moveToFolder = (id, folderId) =>
    apiFetch(`/api/watchlist/${id}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ folder_id: folderId }),
    });

export const checkWatchlist = (gemId) =>
    apiFetch(`/api/watchlist/check/${gemId}`);
