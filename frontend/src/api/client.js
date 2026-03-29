import axios from 'axios';

const TOKEN_KEY = 'gembid_token';
const REFRESH_KEY = 'gembid_refresh_token';

const resolveBaseURL = () => {
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    if (import.meta.env.VITE_API_URL) return `${import.meta.env.VITE_API_URL}/api`;
    return 'http://localhost:5001/api';
};

const api = axios.create({
    baseURL: resolveBaseURL(),
    headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 — attempt token refresh once, then force logout
let refreshPromise = null;

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        // Only retry once and skip refresh endpoint itself
        if (
            error.response?.status === 401 &&
            !original._retry &&
            !original.url?.includes('/auth/refresh')
        ) {
            original._retry = true;

            // Deduplicate concurrent refresh attempts
            if (!refreshPromise) {
                const refreshToken = localStorage.getItem(REFRESH_KEY);
                if (refreshToken) {
                    refreshPromise = api
                        .post('/v1/auth/refresh', { refresh_token: refreshToken })
                        .then(({ data }) => {
                            localStorage.setItem(TOKEN_KEY, data.data.access_token);
                            localStorage.setItem(REFRESH_KEY, data.data.refresh_token);
                            return data.data.access_token;
                        })
                        .catch(() => {
                            localStorage.removeItem(TOKEN_KEY);
                            localStorage.removeItem(REFRESH_KEY);
                            window.location.href = '/login';
                            return null;
                        })
                        .finally(() => {
                            refreshPromise = null;
                        });
                } else {
                    localStorage.removeItem(TOKEN_KEY);
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
            }

            const newToken = await refreshPromise;
            if (newToken) {
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            }
        }

        return Promise.reject(error);
    }
);

export { TOKEN_KEY, REFRESH_KEY };
export default api;
