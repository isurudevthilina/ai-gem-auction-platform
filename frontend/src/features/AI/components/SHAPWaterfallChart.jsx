/**
 * SHAPWaterfallChart.jsx
 * Renders a horizontal SHAP feature-contribution chart using pure CSS.
 * No external chart library required.
 *
 * Props:
 *   shapValues  - Array of { feature, value, contribution, direction }
 *   maxBarWidth - Max pixel width of the bar area (default 260)
 */
import { useEffect, useState } from 'react';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
    positive: '#10b981',
    positiveGlow: 'rgba(16,185,129,0.18)',
    negative: '#ef4444',
    negativeGlow: 'rgba(239,68,68,0.18)',
    bar: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    text: '#f1f5f9',
    muted: '#94a3b8',
    dim: '#475569',
    gold: '#f59e0b',
};

const SHAPWaterfallChart = ({ shapValues = [], maxBarWidth = 260 }) => {
    const { formatPrice } = useCurrency();
    const [animated, setAnimated] = useState(false);

    // Trigger bar expansion animation on mount
    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 80);
        return () => clearTimeout(t);
    }, []);

    if (!shapValues.length) return null;

    const maxAbsContrib = Math.max(...shapValues.map((s) => Math.abs(s.contribution)));

    return (
        <div style={{ width: '100%' }}>
            {/* ── Legend ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: C.positive }} />
                    <span style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em' }}>POSITIVE IMPACT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: C.negative }} />
                    <span style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em' }}>NEGATIVE IMPACT</span>
                </div>
            </div>

            {/* ── Rows ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {shapValues.map((item, idx) => {
                    const isPositive = item.direction === 'positive';
                    const barColor = isPositive ? C.positive : C.negative;
                    const barGlow = isPositive ? C.positiveGlow : C.negativeGlow;
                    const barPct = maxAbsContrib > 0 ? (Math.abs(item.contribution) / maxAbsContrib) : 0;
                    const barW = animated ? Math.round(barPct * maxBarWidth) : 0;
                    const sign = isPositive ? '+' : '-';

                    return (
                        <div key={idx} style={{
                            display: 'grid',
                            gridTemplateColumns: '160px 1fr 90px',
                            alignItems: 'center',
                            gap: 14,
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: C.bar,
                            border: `1px solid ${C.border}`,
                            transition: 'background 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                            onMouseLeave={e => e.currentTarget.style.background = C.bar}
                        >
                            {/* Feature label */}
                            <div>
                                <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                                    {item.feature}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: C.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.value}
                                </div>
                            </div>

                            {/* Bar track */}
                            <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                                {/* Track background */}
                                <div style={{
                                    position: 'absolute', left: 0, right: 0, height: 6,
                                    background: 'rgba(255,255,255,0.05)', borderRadius: 99,
                                }} />
                                {/* Filled bar */}
                                <div style={{
                                    position: 'absolute', left: 0, height: 6,
                                    width: barW,
                                    background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                                    borderRadius: 99,
                                    boxShadow: `0 0 8px ${barGlow}`,
                                    transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                }} />
                            </div>

                            {/* Dollar value */}
                            <div style={{
                                textAlign: 'right',
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                color: barColor,
                                letterSpacing: '-0.01em',
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {sign}{formatPrice(Math.abs(item.contribution))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Baseline note ── */}
            <p style={{ marginTop: 16, fontSize: '0.72rem', color: C.dim, lineHeight: 1.6 }}>
                Each bar shows how much a feature pushes the predicted price above or below the model baseline.
                Values represent average market dollar contribution for the given attribute.
            </p>
        </div>
    );
};

export default SHAPWaterfallChart;
