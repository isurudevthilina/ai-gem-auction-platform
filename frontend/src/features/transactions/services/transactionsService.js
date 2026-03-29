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

export const initiateBuyNow = (gemId) =>
  apiFetch('/api/transactions/buy-now', {
    method: 'POST', body: JSON.stringify({ gem_id: gemId }),
  });

export const confirmPayment = (id, paymentReference) =>
  apiFetch(`/api/transactions/${id}/confirm-payment`, {
    method: 'POST', body: JSON.stringify({ payment_reference: paymentReference }),
  });

export const markComplete = (id) =>
  apiFetch(`/api/transactions/${id}/mark-complete`, { method: 'PATCH' });

export const getMyPurchases = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) =>
    v !== undefined && v !== '' && params.set(k, v));
  return apiFetch(`/api/transactions?${params.toString()}`);
};

export const getById = (id) => apiFetch(`/api/transactions/${id}`);
