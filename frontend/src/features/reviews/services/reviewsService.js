import { supabase } from '../../../config/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const UUID_V4_LIKE_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assertUuid = (id, label) => {
  if (!UUID_V4_LIKE_REGEX.test(String(id || ''))) {
    throw { success: false, status: 400, message: `Invalid ${label}.` };
  }
};

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

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov']);
const FALLBACK_CONTENT_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

const getFileExtension = (file) =>
  String(file?.name || '').split('.').pop()?.toLowerCase() || '';

export const getReviewMediaInfo = (file) => {
  const ext = getFileExtension(file);
  const mime = String(file?.type || '').toLowerCase();

  if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(ext)) {
    return { ext, mediaType: 'image', contentType: mime || FALLBACK_CONTENT_TYPES[ext] || 'image/jpeg' };
  }

  if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(ext)) {
    return { ext, mediaType: 'video', contentType: mime || FALLBACK_CONTENT_TYPES[ext] || 'video/mp4' };
  }

  return null;
};

export const validateReviewMediaFile = (file) => {
  const media = getReviewMediaInfo(file);
  if (!media || !media.ext) {
    throw new Error('Only JPG, PNG, WebP, GIF, MP4, WebM, or MOV files are allowed.');
  }

  if (media.mediaType === 'image' && !IMAGE_EXTENSIONS.has(media.ext)) {
    throw new Error('Only JPG, PNG, WebP, or GIF images are allowed.');
  }

  if (media.mediaType === 'video' && !VIDEO_EXTENSIONS.has(media.ext)) {
    throw new Error('Only MP4, WebM, or MOV videos are allowed.');
  }

  return media;
};

export const createReview = (data) =>
  apiFetch('/api/reviews', {
    method: 'POST', body: JSON.stringify(data),
  });

export const getSellerReviews = (sellerId, filters = {}) => {
  assertUuid(sellerId, 'seller id');
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) =>
    v !== undefined && v !== '' && params.set(k, v));
  return apiFetch(`/api/reviews/seller/${sellerId}?${params.toString()}`);
};

export const getSellerRating = (sellerId) =>
  (assertUuid(sellerId, 'seller id'), apiFetch(`/api/reviews/seller/${sellerId}/summary`));

export const getMyReviews = () =>
  apiFetch('/api/reviews/my-reviews');

export const checkCanReview = (transactionId) =>
  (assertUuid(transactionId, 'transaction id'), apiFetch(`/api/reviews/check/${transactionId}`));

export const updateReview = (id, data) =>
  apiFetch(`/api/reviews/${id}`, {
    method: 'PATCH', body: JSON.stringify(data),
  });

export const deleteReview = (id) =>
  apiFetch(`/api/reviews/${id}`, { method: 'DELETE' });

export const reportReview = (id, reason) =>
  apiFetch(`/api/reviews/${id}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

export const getReviewReports = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return apiFetch(`/api/reviews/reports${qs ? `?${qs}` : ''}`);
};

export const resolveReviewReport = (reportId, data) =>
  apiFetch(`/api/reviews/reports/${reportId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getMyReviewReports = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return apiFetch(`/api/reviews/my-reports${qs ? `?${qs}` : ''}`);
};

export const uploadReviewMedia = async (file) => {
  const { ext, mediaType, contentType } = validateReviewMediaFile(file);

  const res = await apiFetch('/api/reviews/upload-url', {
    method: 'POST',
    body: JSON.stringify({ ext, media_type: mediaType }),
  });

  const { path, token } = res.data;
  const { error } = await supabase.storage
    .from('review-media')
    .uploadToSignedUrl(path, token, file, { contentType });

  if (error) throw error;

  const { data } = supabase.storage.from('review-media').getPublicUrl(path);
  return data.publicUrl;
};
