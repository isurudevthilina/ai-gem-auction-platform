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

export const getMyWallet = () => apiFetch('/api/wallet/me');

export const topUpWallet = (payload) => apiFetch('/api/wallet/top-up', {
    method: 'POST',
    body: JSON.stringify(payload),
});

export const buyGems = (payload) => apiFetch('/api/wallet/buy-gems', {
    method: 'POST',
    body: JSON.stringify(payload),
});

export const withdrawToBank = (payload) => apiFetch('/api/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify(payload),
});
