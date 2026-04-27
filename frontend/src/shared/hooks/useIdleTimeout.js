import { useEffect, useRef, useCallback } from 'react';

/**
 * useIdleTimeout — logs the user out after a period of inactivity.
 *
 * @param {Object} options
 * @param {number} options.timeoutMs      — idle time before logout (default: 15 min)
 * @param {function} options.onTimeout    — callback fired when idle timeout reached
 * @param {boolean} options.enabled       — whether the timer is active
 *
 * Usage:
 *   useIdleTimeout({ timeoutMs: 15 * 60 * 1000, onTimeout: logout, enabled: isAuthenticated });
 */
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];

export const useIdleTimeout = ({ timeoutMs = 15 * 60 * 1000, onTimeout, enabled = true }) => {
    const timerRef = useRef(null);
    const callbackRef = useRef(onTimeout);
    callbackRef.current = onTimeout;

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!enabled) return;
        timerRef.current = setTimeout(() => {
            callbackRef.current?.();
        }, timeoutMs);
    }, [enabled, timeoutMs]);

    useEffect(() => {
        if (!enabled) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        resetTimer();

        const handler = () => resetTimer();
        ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handler, { passive: true }));

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handler));
        };
    }, [enabled, resetTimer]);
};

export default useIdleTimeout;
