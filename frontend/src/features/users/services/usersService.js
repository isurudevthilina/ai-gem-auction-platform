import api from '../../../api/client';

/**
 * usersService.js — API calls for the users/profile module
 */
const request = async (promise) => {
    try {
        const { data } = await promise;
        return data;
    } catch (err) {
        const body = err.response?.data || {};
        throw {
            ...body,
            status: err.response?.status,
            message: body.message || err.message || 'Request failed.',
        };
    }
};

/** Get current user's profile */
export const getMe = () => request(api.get('/users/me'));

/** Update profile fields */
export const updateProfile = (fields) =>
    request(api.patch('/users/me', fields));

/** Upload avatar (multipart) */
export const updateAvatar = async (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return request(api.patch('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }));
};

/** Change email */
export const requestEmailChangeOTP = (payload) =>
    request(api.post('/users/me/email/otp', payload));

export const changeEmail = (payload) =>
    request(api.patch('/users/me/email', payload));

/** Change password */
export const requestPasswordChangeOTP = (payload) =>
    request(api.post('/users/me/password/otp', payload));

export const changePassword = (payload) =>
    request(api.patch('/users/me/password', payload));

/** Delete account */
export const deleteAccount = (payload) =>
    request(api.delete('/users/me', { data: payload }));

/** Search sellers (public) */
export const searchSellers = (q, limit = 3) =>
    request(api.get(`/users/search/sellers?q=${encodeURIComponent(q)}&limit=${limit}`));

/** Get public seller profile */
export const getPublicProfile = (id) =>
    request(api.get(`/users/${id}/public`));
