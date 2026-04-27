import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../features/auth/services/authService';
import { useIdleTimeout } from '../shared/hooks/useIdleTimeout';
import SessionExpiredModal from '../shared/components/SessionExpiredModal';

const AuthContext = createContext(null);

const SESSION_START_KEY = 'gembid_session_start';
const MAX_SESSION_HOURS = 8; // hard max session lifetime

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [expireReason, setExpireReason] = useState('idle');

    // ── Max session age check ──
    const checkMaxSessionAge = useCallback(() => {
        const start = localStorage.getItem(SESSION_START_KEY);
        if (!start) return true;
        const elapsedMs = Date.now() - parseInt(start, 10);
        const maxMs = MAX_SESSION_HOURS * 60 * 60 * 1000;
        return elapsedMs < maxMs;
    }, []);

    const doLogout = useCallback(async (reason = 'idle') => {
        try { await authService.logout(); } catch { /* ignore */ }
        localStorage.removeItem(SESSION_START_KEY);
        setUser(null);
        setExpireReason(reason);
        setSessionExpired(true);
    }, []);

    const refreshUser = useCallback(async () => {
        if (!authService.getToken()) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        // Enforce max session age on app load / refresh
        if (!checkMaxSessionAge()) {
            await doLogout('max_age');
            setIsLoading(false);
            return;
        }
        try {
            const profile = await authService.getMe();
            setUser(profile);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [checkMaxSessionAge, doLogout]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = useCallback(async (credentials) => {
        const result = await authService.login(credentials);
        const profile = result.data?.profile || result.data?.user;
        localStorage.setItem(SESSION_START_KEY, String(Date.now()));
        setUser(profile);
        setSessionExpired(false);
        return profile;
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        localStorage.removeItem(SESSION_START_KEY);
        setUser(null);
        setSessionExpired(false);
    }, []);

    // ── Idle timeout: 15 minutes of inactivity → auto-logout ──
    useIdleTimeout({
        timeoutMs: 15 * 60 * 1000,
        onTimeout: () => doLogout('idle'),
        enabled: !!user,
    });

    const value = {
        user,
        profile: user,
        token: authService.getToken(),
        isLoading,
        loading: isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        signOut: logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {sessionExpired && (
                <SessionExpiredModal
                    reason={expireReason}
                    onDismiss={() => setSessionExpired(false)}
                />
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
