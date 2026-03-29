import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const GavelIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.sapphire} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 3l-1 1 7 7 1-1a2.12 2.12 0 0 0 0-3L18 3.5a2.12 2.12 0 0 0-3 0z"/>
        <path d="M3 21l3.5-3.5"/>
        <path d="M6.5 12.5L3 16l3 3 3.5-3.5"/>
        <path d="m8 10 5.5 5.5"/>
    </svg>
);

const TrophyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);

const CurrencyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.sapphire} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
);

const ArrowUpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.sapphire} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
);

const CARDS = [
    { key: 'total_auctions',    label: 'Total Auctions',    Icon: GavelIcon,      color: C.text },
    { key: 'currently_winning',  label: 'Currently Winning', Icon: TrophyIcon,     color: C.gold },
    { key: 'auctions_won',      label: 'Auctions Won',      Icon: CheckCircleIcon, color: '#16a34a' },
    { key: 'total_spent',       label: 'Total Spent',       Icon: CurrencyIcon,   color: C.text,  isCurrency: true },
    { key: 'highest_bid_ever',  label: 'Highest Bid',       Icon: ArrowUpIcon,    color: C.text,  isCurrency: true },
];

const BidHistoryStats = ({ stats, isLoading }) => {
    const { formatPrice } = useCurrency();
    const [cols, setCols] = useState(window.innerWidth > 700 ? 5 : 2);

    useEffect(() => {
        const onResize = () => setCols(window.innerWidth > 700 ? 5 : 2);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{
                        height: 88, background: '#E8E5E0', borderRadius: 12,
                        animation: 'bhp-pulse 1.5s ease-in-out infinite',
                    }} />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>
            {CARDS.map(({ key, label, Icon, color, isCurrency }) => {
                const raw = stats[key];
                const value = isCurrency
                    ? (raw != null ? formatPrice(raw) : '\u2014')
                    : (raw ?? 0);

                const isWinning = key === 'currently_winning' && raw > 0;

                return (
                    <div key={key} style={{
                        background: C.white,
                        border: isWinning ? `0.5px solid ${C.gold}40` : `0.5px solid ${C.border}`,
                        borderRadius: 12,
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon />
                            <span style={{
                                fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700,
                                letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint,
                            }}>{label}</span>
                        </div>
                        <span style={{
                            fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 700, color,
                        }}>{value}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default BidHistoryStats;
