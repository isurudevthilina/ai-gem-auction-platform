import useCountdown from '../hooks/useCountdown';

/* Dark theme (default — LiveAuctionPage) */
const DARK = {
    gold:  '#f59e0b',
    green: '#10b981',
    red:   '#ef4444',
    text:  '#f1f5f9',
    muted: '#94a3b8',
    dim:   '#475569',
    clock: '#f59e0b',
    urgentBg:  'rgba(239,68,68,0.12)',
    urgentBdr: 'rgba(239,68,68,0.3)',
    normalBg:  'rgba(245,158,11,0.1)',
    normalBdr: 'rgba(245,158,11,0.2)',
};

/* Cream theme (AuctionCard on browse pages) */
const CREAM = {
    gold:  '#C4892A',
    green: '#16a34a',
    red:   '#b91c1c',
    text:  '#1A1A2E',
    muted: '#6B6B7B',
    dim:   '#9A9AAB',
    clock: '#C4892A',
    urgentBg:  'rgba(185,28,28,0.08)',
    urgentBdr: 'rgba(185,28,28,0.2)',
    normalBg:  'rgba(196,137,42,0.08)',
    normalBdr: 'rgba(196,137,42,0.2)',
};

const BODY = "'Jost', 'Inter', sans-serif";
const DISPLAY = "'Cinzel', serif";

/**
 * Countdown
 * Props:
 *   endTime  — ISO string
 *   compact  — true → one-line "2d 04:12:09"
 *              false → large block display (default)
 *   darkMode — true (default) → dark theme, false → cream-safe colors
 */
const Countdown = ({ endTime, compact = false, darkMode = true }) => {
    const { days, hours, minutes, seconds, expired, totalSeconds } = useCountdown(endTime);
    const T = darkMode ? DARK : CREAM;

    const isUrgent = !expired && totalSeconds < 3600; // < 1 hour

    if (expired) {
        if (compact) {
            return (
                <span style={{ color: T.muted, fontSize: '0.72rem', fontFamily: BODY, fontWeight: 600 }}>ENDED</span>
            );
        }
        return (
            <div style={{ textAlign: 'center', color: T.muted, fontFamily: BODY, fontWeight: 700, fontSize: '1.1rem', padding: 12 }}>
                AUCTION ENDED
            </div>
        );
    }

    // ── Compact (used inside AuctionCard overlay) ─────────────────────────
    if (compact) {
        const color = isUrgent ? T.red : T.text;
        const timeStr = days > 0
            ? `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isUrgent ? T.red : T.clock} strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ color, fontSize: '0.78rem', fontFamily: BODY, fontWeight: 700, letterSpacing: '0.04em' }}>
                    {timeStr}
                </span>
            </div>
        );
    }

    // ── Full block (used in LiveAuctionPage) ──────────────────────────────
    const blockColor = isUrgent ? T.red : T.gold;
    const segments   = days > 0
        ? [{ label: 'DAYS', value: days }, { label: 'HRS', value: hours }, { label: 'MIN', value: minutes }, { label: 'SEC', value: seconds }]
        : [{ label: 'HRS', value: hours }, { label: 'MIN', value: minutes }, { label: 'SEC', value: seconds }];

    return (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {segments.map(({ label, value }, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: i < segments.length - 1 ? 10 : 0 }}>
                    <div style={{
                        background: isUrgent ? T.urgentBg : T.normalBg,
                        border: `1px solid ${isUrgent ? T.urgentBdr : T.normalBdr}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                        textAlign: 'center',
                        minWidth: 52,
                    }}>
                        <div style={{ color: blockColor, fontSize: '1.35rem', fontFamily: BODY, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                            {String(value).padStart(2, '0')}
                        </div>
                        <div style={{ color: T.dim, fontSize: '0.6rem', fontFamily: DISPLAY, fontWeight: 600, letterSpacing: '0.08em', marginTop: 2 }}>
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
