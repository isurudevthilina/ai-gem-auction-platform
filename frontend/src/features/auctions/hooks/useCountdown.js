import { useState, useEffect, useRef } from 'react';

/**
 * useCountdown(endTime)
 * Counts down to endTime using setInterval.
 * Returns: { days, hours, minutes, seconds, expired, totalSeconds }
 * Cleans up on unmount.
 */
const useCountdown = (endTime) => {
    const calcTimeLeft = () => {
        const diff = Math.max(0, Math.floor((new Date(endTime) - Date.now()) / 1000));
        return {
            totalSeconds: diff,
            expired:      diff <= 0,
            days:         Math.floor(diff / 86400),
            hours:        Math.floor((diff % 86400) / 3600),
            minutes:      Math.floor((diff % 3600) / 60),
            seconds:      diff % 60,
        };
    };

    const [timeLeft, setTimeLeft] = useState(calcTimeLeft);
    const intervalRef             = useRef(null);

    useEffect(() => {
        if (!endTime) return;

        intervalRef.current = setInterval(() => {
            const next = calcTimeLeft();
            setTimeLeft(next);
            if (next.expired) clearInterval(intervalRef.current);
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [endTime]); // eslint-disable-line

    return timeLeft;
};

export default useCountdown;
