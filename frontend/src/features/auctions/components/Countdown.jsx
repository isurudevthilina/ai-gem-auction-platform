import useCountdown from '../hooks/useCountdown';

const C = {
    gold:  '#f59e0b',
    green: '#10b981',
    red:   '#ef4444',
    text:  '#f1f5f9',
    muted: '#94a3b8',
    dim:   '#475569',
};

/**
 * Countdown
 * Props:
 *   endTime  — ISO string
 *   compact  — true → one-line "2d 04:12:09"
 *              false → large block display (default)
 */
const Countdown = ({ endTime, compact = false }) => {
    const { days, hours, minutes, seconds, expired, totalSeconds } = useCountdown(endTime);

    const isUrgent = !expired && totalSeconds < 3600; // < 1 hour

    if (expired) {
        if (compact) {
            return (
                <span style={{ color: C.muted, fontSize: '0.72rem', fontWeight: 600 }}>ENDED</span>
            );
        }
        return (
            <div style={{ textAlign: 'center', color: C.muted, fontWeight: 700, fontSize: '1.1rem', padding: 12 }}>
                AUCTION ENDED
            </div>
        );
    }

    // ── Compact (used inside AuctionCard overlay) ─────────────────────────
    if (compact) {
        const color = isUrgent ? C.red : C.text;
        const timeStr = days > 0
            ? `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isUrgent ? C.red : C.gold} strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ color, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                    {timeStr}
                </span>
            </div>
        );
    }

    // ── Full block (used in LiveAuctionPage) ──────────────────────────────
    const blockColor = isUrgent ? C.red : C.gold;
    const segments   = days > 0
        ? [{ label: 'DAYS', value: days }, { label: 'HRS', value: hours }, { label: 'MIN', value: minutes }, { label: 'SEC', value: seconds }]
        : [{ label: 'HRS', value: hours }, { label: 'MIN', value: minutes }, { label: 'SEC', value: seconds }];

    return (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {segments.map(({ label, value }, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: i < segments.length - 1 ? 10 : 0 }}>
                    <div style={{
                        background: isUrgent ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)',
                        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)'}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                        textAlign: 'center',
                        minWidth: 52,
                    }}>
                        <div style={{ color: blockColor, fontSize: '1.35rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                            {String(value).padStart(2, '0')}
                        </div>
                        <div style={{ color: C.dim, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', marginTop: 2 }}>
                            {label}
                        </div>
                    </div>
                    {i < segments.length - 1 && (
                        <span style={{ color: blockColor, fontSize: '1.2rem', fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>:</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Countdown;
