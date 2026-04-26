/**
 * CurrencySelector — Compact dropdown to switch display currency.
 * Renders in the navbar next to profile avatar.
 */
import { useState, useRef, useEffect } from 'react';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../context/CurrencyContext';

const BODY = "'Jost', 'Inter', sans-serif";

const C = {
    bg: '#F0EDE8',
    white: '#FDFCF8',
    text: '#1A1A2E',
    muted: '#6B6B7B',
    faint: '#9A9AAB',
    border: '#E0DCD6',
    gold: '#C4892A',
    goldSoft: 'rgba(196,137,42,0.10)',
    sapphire: '#1A4D8C',
};

export default function CurrencySelector() {
    const { currency, setCurrency, ratesLoading } = useCurrency();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const currencies = Object.values(SUPPORTED_CURRENCIES);
    const current = SUPPORTED_CURRENCIES[currency];

    useEffect(() => {
        const handler = (e) => {
            if (!ref.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: open ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                    background: open ? C.goldSoft : 'transparent',
                    cursor: 'pointer',
                    fontFamily: BODY,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: open ? C.gold : C.text,
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!open) e.currentTarget.style.borderColor = C.gold; }}
                onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = C.border; }}
            >
                <span style={{ fontSize: '0.85rem' }}>{current.flag}</span>
                <span>{current.code}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 220,
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    zIndex: 300,
                    overflow: 'hidden',
                    maxHeight: 340,
                    overflowY: 'auto',
                }}>
                    <div style={{
                        padding: '10px 14px 8px',
                        borderBottom: `1px solid ${C.border}`,
                        fontFamily: BODY,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: C.faint,
                    }}>
                        Display Currency
                        {ratesLoading && <span style={{ marginLeft: 6, opacity: 0.6 }}>updating…</span>}
                    </div>
                    {currencies.map(c => {
                        const isActive = c.code === currency;
                        return (
                            <button
                                key={c.code}
                                onClick={() => { setCurrency(c.code); setOpen(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: 'none',
                                    background: isActive ? C.goldSoft : 'transparent',
                                    cursor: 'pointer',
                                    fontFamily: BODY,
                                    fontSize: '0.82rem',
                                    color: isActive ? C.gold : C.text,
                                    fontWeight: isActive ? 700 : 500,
                                    textAlign: 'left',
                                    transition: 'background 0.1s',
                                    borderLeft: isActive ? `2px solid ${C.gold}` : '2px solid transparent',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <span style={{ fontSize: '1rem', width: 22, textAlign: 'center' }}>{c.flag}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: isActive ? 700 : 600, fontSize: '0.82rem' }}>{c.code}</div>
                                    <div style={{ fontSize: '0.68rem', color: C.muted, fontWeight: 400 }}>{c.name}</div>
                                </div>
                                {isActive && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
