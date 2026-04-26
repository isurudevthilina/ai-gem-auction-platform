import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../features/auth/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        if (!authService.getToken()) {
            setUser(null);
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
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = useCallback(async (credentials) => {
        const result = await authService.login(credentials);
        const profile = result.data?.profile || result.data?.user;
        setUser(profile);
        return profile;
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
    }, []);

    const value = {
        user,
        profile: user,               // backward compat alias
        token: authService.getToken(),
        isLoading,
        loading: isLoading,           // backward compat alias
        isAuthenticated: !!user,
        login,
        logout,
        signOut: logout,              // backward compat alias
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
