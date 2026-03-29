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

export const getDashboardData = () => apiFetch('/api/admin/dashboard');
export const getPlatformStats = () => apiFetch('/api/admin/stats');
export const getRecentActivity = () => apiFetch('/api/admin/activity');

/* ── User Management endpoints ── */
export const getAllUsers = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.query) params.set('query', filters.query);
  if (filters.role && filters.role !== 'all') params.set('role', filters.role);
  if (filters.is_verified !== undefined) params.set('is_verified', String(filters.is_verified));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return apiFetch(`/api/users/admin/all${qs ? `?${qs}` : ''}`);
};

export const getUserStats = () => apiFetch('/api/users/admin/stats');

export const getUserById = (id) => apiFetch(`/api/users/admin/${id}`);

export const updateUser = (id, data) =>
  apiFetch(`/api/users/admin/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deactivateUser = (id) =>
  apiFetch(`/api/users/admin/${id}`, { method: 'DELETE' });
