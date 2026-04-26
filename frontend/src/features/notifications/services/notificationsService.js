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

export const getNotifications = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.is_read && filters.is_read !== 'all') params.set('is_read', filters.is_read);
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return apiFetch(`/api/notifications${qs ? `?${qs}` : ''}`);
};

export const getUnreadCount = () =>
  apiFetch('/api/notifications/unread-count');

export const getRecent = () =>
  apiFetch('/api/notifications/recent');

export const markAsRead = (ids) =>
  apiFetch('/api/notifications/mark-read', {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });

export const markAllAsRead = () =>
  apiFetch('/api/notifications/mark-all-read', { method: 'PATCH' });

export const deleteOne = (id) =>
  apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });

export const deleteAllRead = () =>
  apiFetch('/api/notifications/read', { method: 'DELETE' });
