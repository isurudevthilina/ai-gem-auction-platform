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

export const createReview = (data) =>
  apiFetch('/api/reviews', {
    method: 'POST', body: JSON.stringify(data),
  });

export const getSellerReviews = (sellerId, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) =>
    v !== undefined && v !== '' && params.set(k, v));
  return apiFetch(`/api/reviews/seller/${sellerId}?${params.toString()}`);
};

export const getSellerRating = (sellerId) =>
  apiFetch(`/api/reviews/seller/${sellerId}/summary`);

export const getMyReviews = () =>
  apiFetch('/api/reviews/my-reviews');

export const checkCanReview = (transactionId) =>
  apiFetch(`/api/reviews/check/${transactionId}`);

export const updateReview = (id, data) =>
  apiFetch(`/api/reviews/${id}`, {
    method: 'PATCH', body: JSON.stringify(data),
  });

export const deleteReview = (id) =>
  apiFetch(`/api/reviews/${id}`, { method: 'DELETE' });
