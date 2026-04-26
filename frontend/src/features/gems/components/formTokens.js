/* Shared design tokens for the gem form */
export const T = {
    bg:         '#F0EDE8',
    white:      '#FFFFFF',
    sapphire:   '#1A4D8C',
    sapphireBg: 'rgba(26,77,140,0.06)',
    gold:       '#C4892A',
    goldSoft:   'rgba(196,137,42,0.10)',
    text:       '#1A1A2E',
    muted:      '#6B6B7B',
    faint:      '#9A9AAB',
    border:     '#E0DCD6',
    borderFocus:'#1A4D8C',
    error:      '#B91C1C',
    errorBg:    'rgba(185,28,28,0.06)',
};

export const SERIF   = "'Cormorant Garamond', 'Georgia', serif";
export const DISPLAY = "'Cinzel', serif";
export const BODY    = "'Jost', 'Inter', sans-serif";

export const inputBase = {
    width: '100%', boxSizing: 'border-box',
    background: T.bg, border: `0.5px solid ${T.border}`, borderRadius: 8,
    padding: '11px 14px', fontSize: '0.88rem', fontFamily: BODY,
    color: T.text, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export const labelStyle = {
    display: 'block', marginBottom: 6,
    fontFamily: DISPLAY, fontSize: '0.7rem', fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted,
};

export const focusRing = { boxShadow: `0 0 0 2.5px ${T.sapphire}22` };
