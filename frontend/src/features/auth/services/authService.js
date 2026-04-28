import api, { TOKEN_KEY, REFRESH_KEY } from '../../../api/client';

const authService = {
    async register(payload) {
        const { data } = await api.post('/v1/auth/register', payload);
        return data;
    },

    async login(payload) {
        const { data } = await api.post('/v1/auth/login', payload);
        if (data.data?.access_token) {
            localStorage.setItem(TOKEN_KEY, data.data.access_token);
            localStorage.setItem(REFRESH_KEY, data.data.refresh_token);
        }
        return data;
    },

    async logout() {
        try {
            await api.post('/v1/auth/logout');
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_KEY);
        }
    },

    async getMe() {
        const { data } = await api.get('/v1/auth/me');
        return data.data;
    },

    async resendVerification(email) {
        const { data } = await api.post('/v1/auth/resend-verification', { email });
        return data;
    },

    async verifyEmail(email, otp) {
        const { data } = await api.post('/v1/auth/verify-email', { email, otp });
        return data;
    },

    async forgotPassword(email) {
        const { data } = await api.post('/v1/auth/forgot-password', { email });
        return data;
    },

    async verifyOTP(email, otp) {
        const { data } = await api.post('/v1/auth/verify-otp', { email, otp });
        return data;
    },

    async resetPassword(email, otp, new_password) {
        const { data } = await api.post('/v1/auth/reset-password', { email, otp, new_password });
        return data;
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    isAuthenticated() {
        return !!localStorage.getItem(TOKEN_KEY);
    },
};

export default authService;
