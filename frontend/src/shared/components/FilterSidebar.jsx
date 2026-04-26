import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const C = {
    parchment: '#F0EDE8',
    navy: '#1A4D8C',
    gold: '#C4892A',
    white: '#FFFFFF',
    text: '#1A1A2E',
    muted: '#6B6B7B',
    faint: '#9A9AAB',
    border: 'rgba(26,77,140,0.12)',
    borderLight: 'rgba(26,77,140,0.08)',
    green: '#16a34a',
};
const BRAND = "'Cinzel', serif";
const DISPLAY = "'Cormorant Garamond', serif";

/* ── Chevron SVG ── */
const Chevron = ({ open }) => (
    <svg
        width="12" height="12" viewBox="0 0 12 12" fill="none"
        style={{ transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
    >
        <path d="M2.5 4.5L6 8L9.5 4.5" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
    </svg>
);

/* ── Custom Checkbox ── */
const Checkbox = ({ checked, onChange, label, swatch, dot }) => (
    <button
        onClick={onChange}
        style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', textAlign: 'left',
        }}
    >
        <span style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0,
            border: checked ? `1.5px solid ${C.navy}` : `0.5px solid ${C.navy}`,
            background: checked ? C.navy : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            opacity: checked ? 1 : 0.5,
        }}>
            {checked && (
                <svg width="8" height="8" viewBox="0 0 10 10">
                    <polyline points="1.5,5 4,7.5 8.5,2" stroke={C.parchment} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </span>
        {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
        {swatch && <span style={{ width: 11, height: 11, borderRadius: '50%', background: swatch, flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />}
        <span style={{
            fontFamily: DISPLAY, fontSize: 14, color: checked ? C.navy : C.text,
            fontWeight: checked ? 500 : 400, transition: 'color 0.15s',
        }}>{label}</span>
    </button>
);

/* ── Custom Radio ── */
const Radio = ({ checked, onChange, label, sub }) => (
    <button
        onClick={onChange}
        style={{
            width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', textAlign: 'left',
        }}
    >
        <span style={{
            width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginTop: 2,
            border: checked ? `1.5px solid ${C.navy}` : `0.5px solid ${C.navy}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: checked ? 1 : 0.5,
        }}>
            {checked && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.navy }} />}
        </span>
        <span>
            <span style={{ fontFamily: DISPLAY, fontSize: 14, color: checked ? C.navy : C.text, fontWeight: checked ? 500 : 400 }}>{label}</span>
            {sub && <span style={{ display: 'block', fontFamily: DISPLAY, fontSize: 10, color: C.muted, marginTop: 1 }}>{sub}</span>}
        </span>
    </button>
);

/* ── Range Inputs ── */
const RangeInputs = ({ min, max, onMin, onMax, prefix = '', suffix = '', step = 1 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, position: 'relative' }}>
            {prefix && <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontFamily: BRAND, fontSize: 10, color: C.faint }}>{prefix}</span>}
            <input type="number" min="0" step={step} value={min} placeholder="Min" onChange={e => onMin(e.target.value)}
                style={{
                    width: '100%', background: C.parchment, border: `0.5px solid ${C.border}`, borderRadius: 6,
                    padding: `6px ${suffix ? 28 : 10}px 6px ${prefix ? 18 : 10}px`, fontFamily: BRAND, fontSize: 11,
                    color: C.text, outline: 'none', boxSizing: 'border-box',
                }}
            />
            {suffix && <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontFamily: BRAND, fontSize: 10, color: C.faint }}>{suffix}</span>}
        </div>
        <span style={{ color: C.faint, fontSize: 12 }}>—</span>
        <div style={{ flex: 1, position: 'relative' }}>
            {prefix && <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontFamily: BRAND, fontSize: 10, color: C.faint }}>{prefix}</span>}
            <input type="number" min="0" step={step} value={max} placeholder="Max" onChange={e => onMax(e.target.value)}
                style={{
                    width: '100%', background: C.parchment, border: `0.5px solid ${C.border}`, borderRadius: 6,
                    padding: `6px ${suffix ? 28 : 10}px 6px ${prefix ? 18 : 10}px`, fontFamily: BRAND, fontSize: 11,
                    color: C.text, outline: 'none', boxSizing: 'border-box',
                }}
            />
            {suffix && <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontFamily: BRAND, fontSize: 10, color: C.faint }}>{suffix}</span>}
        </div>
    </div>
);

/* ── Preset Pills ── */
const PresetPills = ({ presets, activeIdx, onSelect }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
        {presets.map((p, i) => (
            <button key={i} onClick={() => onSelect(i)}
                style={{
                    padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: activeIdx === i ? C.navy : C.parchment,
                    color: activeIdx === i ? C.parchment : C.text,
                    fontFamily: BRAND, fontSize: 9, letterSpacing: '0.03em',
                    transition: 'all 0.15s',
                }}
            >{p.label}</button>
        ))}
    </div>
);

/* ── Color Swatches ── */
const ColorSwatches = ({ colors, active, onSelect }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {colors.map(c => (
            <button key={c.value} onClick={() => onSelect(active === c.value ? '' : c.value)}
                style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                }}
            >
                <span style={{
                    width: 20, height: 20, borderRadius: '50%', background: c.swatch,
                    border: active === c.value ? `2px solid ${C.gold}` : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: active === c.value ? `0 0 0 2px ${C.parchment}, 0 0 0 4px ${C.gold}` : 'none',
                    transition: 'all 0.15s',
                }} />
                <span style={{ fontFamily: BRAND, fontSize: 9, color: active === c.value ? C.navy : C.muted, textAlign: 'center', lineHeight: 1.1 }}>{c.label}</span>
            </button>
        ))}
    </div>
);

/* ── Toggle Switch ── */
const Toggle = ({ checked, onChange, label, sub }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0' }}>
        <button onClick={onChange}
            style={{
                width: 36, height: 20, borderRadius: 20, border: 'none', cursor: 'pointer',
                background: checked ? C.navy : '#d1d5db', position: 'relative', flexShrink: 0,
                transition: 'background 0.2s', marginTop: 1,
            }}
        >
            <span style={{
                position: 'absolute', top: 2, left: checked ? 18 : 2,
                width: 16, height: 16, borderRadius: '50%', background: C.white,
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
        </button>
        <span>
            <span style={{ fontFamily: DISPLAY, fontSize: 14, color: C.text, display: 'block' }}>{label}</span>
            {sub && <span style={{ fontFamily: DISPLAY, fontSize: 10, color: C.muted }}>{sub}</span>}
        </span>
    </div>
);

/* ── Collapsible Section ── */
const Section = ({ id, label, defaultOpen = true, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    const contentRef = useRef(null);
    const [height, setHeight] = useState(defaultOpen ? 'auto' : 0);

    useEffect(() => {
        if (open && contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
            const t = setTimeout(() => setHeight('auto'), 250);
            return () => clearTimeout(t);
        } else {
            if (contentRef.current) setHeight(contentRef.current.scrollHeight);
            requestAnimationFrame(() => setHeight(0));
        }
    }, [open]);

    return (
        <div style={{ borderTop: `0.5px solid ${C.borderLight}` }}>
            <button onClick={() => setOpen(v => !v)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
                }}
            >
                <span style={{ fontFamily: BRAND, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.navy, opacity: 0.7 }}>
                    {label}
                </span>
                <Chevron open={open} />
            </button>
            <div ref={contentRef} style={{
                overflow: 'hidden', maxHeight: typeof height === 'number' ? height : 'none',
                transition: 'max-height 0.25s ease', padding: open ? '0 20px 16px' : '0 20px 0',
            }}>
                {children}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════
   FilterSidebar
   Reusable sidebar shell for gems and auctions pages
═══════════════════════════════════════════════ */
const FilterSidebar = ({ sections, activeCount = 0, onClear, children }) => (
    <div style={{
        background: C.white,
        border: `0.5px solid ${C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
    }}>
        {/* Top bar */}
        <div style={{
            padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: BRAND, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.navy }}>
                    Filters
                </span>
                {activeCount > 0 && (
                    <span style={{
                        width: 18, height: 18, borderRadius: '50%', background: C.navy,
                        color: C.parchment, fontSize: 10, fontFamily: BRAND,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{activeCount}</span>
                )}
            </div>
            {activeCount > 0 && (
                <button onClick={onClear}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: BRAND, fontSize: 11, color: C.gold, letterSpacing: '0.02em',
                    }}
                >Clear All</button>
            )}
        </div>
        {children}
    </div>
);

/* Exports */
FilterSidebar.Section = Section;
FilterSidebar.Checkbox = Checkbox;
FilterSidebar.Radio = Radio;
FilterSidebar.RangeInputs = RangeInputs;
FilterSidebar.PresetPills = PresetPills;
FilterSidebar.ColorSwatches = ColorSwatches;
FilterSidebar.Toggle = Toggle;

export default FilterSidebar;
