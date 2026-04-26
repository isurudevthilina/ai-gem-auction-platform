import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Periodically refreshes user data to keep the session alive.
 * Default interval: 5 minutes.
 */
export function useSession(intervalMs = 5 * 60 * 1000) {
    const { isAuthenticated, refreshUser } = useAuth();
    const timerRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        timerRef.current = setInterval(refreshUser, intervalMs);
        return () => clearInterval(timerRef.current);
    }, [isAuthenticated, refreshUser, intervalMs]);
}
