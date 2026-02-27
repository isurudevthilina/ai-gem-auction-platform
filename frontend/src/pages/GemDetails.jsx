import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Heart, Share2, Clock } from 'lucide-react';
import GemScene from '../components/GemScene';

/* ─── colour tokens — mirrors landing page ─── */
const C = {
    bg: '#0a0d14',
    panel: '#0f1220',
    card: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    gold: '#f59e0b',
    goldDim: 'rgba(245,158,11,0.15)',
    green: '#10b981',
    text: '#f1f5f9',
    muted: '#94a3b8',
    dim: '#475569',
};

const glassCard = {
    background: 'rgba(13,17,28,0.85)',
    border: `1px solid ${C.border}`,
    borderRadius: '14px',
    backdropFilter: 'blur(18px)',
    padding: '30px'
};

/* ════════════════════════════════════════════════════
   MOCK DATA STORE
════════════════════════════════════════════════════ */
// Usually, you would fetch this from an API based on the ID.
const gems = [
    { id: '1', name: 'Royal Blue Sapphire', carat: 2.5, bid: 12500, buyNow: 15000, status: 'Active', ends: '12h 30m', category: 'Sapphire', color: '#3b82f6', colorDesc: 'Royal Blue', clarity: 'VVS1', cut: 'Cushion', bids: 24 },
    { id: '2', name: 'Pigeon Blood Ruby', carat: 1.8, bid: 28000, buyNow: 32000, status: 'Active', ends: '04h 15m', category: 'Ruby', color: '#ef4444', colorDesc: 'Pigeon Blood', clarity: 'IF', cut: 'Oval', bids: 32 },
    { id: '3', name: 'Colombian Emerald', carat: 3.2, bid: 18500, buyNow: 22000, status: 'Active', ends: '1d 08h', category: 'Emerald', color: '#10b981', colorDesc: 'Muzo Green', clarity: 'VS2', cut: 'Emerald', bids: 8 },
];

const GemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find the requested gem. If not found, default to sapphire.
    const gem = gems.find(g => g.id === id) || gems[0];

    const [activeImage, setActiveImage] = useState(0);

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text, padding: '40px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* ── Navbar Replace / Back Button ── */}
                <div style={{ marginBottom: 30 }}>
                    <button onClick={() => navigate(-1)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'transparent', border: 'none', color: C.muted,
                        fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'color 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = C.text}
                        onMouseLeave={e => e.currentTarget.style.color = C.muted}
                    >
                        <ChevronLeft size={16} /> Back to Dashboard
                    </button>
                </div>

                {/* ── Main Layout (Two Columns) ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 450px', gap: 40, alignItems: 'start' }}>

                    {/* LEFT COLUMN: Visuals */}
                    <div>
                        {/* Main Image Area */}
                        <div style={{
                            ...glassCard,
                            padding: 0, overflow: 'hidden', height: 450, position: 'relative',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, ${C.panel} 100%)`
                        }}>
                            {/* Certificate Badge overlay */}
                            <div style={{
                                position: 'absolute', top: 20, right: 20, zIndex: 10,
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: C.green, color: '#fff',
                                borderRadius: '8px', padding: '8px 14px',
                                fontSize: '0.75rem', fontWeight: 700,
                                boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                            }}>
                                <Shield size={14} /> GIA Certified
                            </div>

                            {/* Render actual 3D Scene or static image depending on viewer implementation */}
                            {activeImage === 0 ? (
                                <GemScene gemType={gem.category.toLowerCase()} />
                            ) : (
                                <div style={{ fontSize: '1.2rem', color: C.dim }}>
                                    Static Image View
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
                            {[1, 2, 3].map((_, idx) => (
                                <button key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    style={{
                                        width: 80, height: 80, borderRadius: 12,
                                        background: C.panel, padding: 0,
                                        border: activeImage === idx ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                                        opacity: activeImage === idx ? 1 : 0.6,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: C.dim, fontSize: '0.75rem', fontWeight: 600
                                    }}
                                    onMouseEnter={e => {
                                        if (activeImage !== idx) e.currentTarget.style.opacity = 0.8;
                                    }}
                                    onMouseLeave={e => {
                                        if (activeImage !== idx) e.currentTarget.style.opacity = 0.6;
                                    }}
                                >
                                    {idx === 0 ? '3D View' : `Thumbnail ${idx}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Title & Actions Block */}
                        <div style={{ ...glassCard }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                    {/* The user's screenshot highlights "Sapphire" in gold. Assuming last word gets highlighted. */}
                                    {gem.name.split(' ').map((word, i, arr) => (
                                        <span key={i} style={{ color: i === arr.length - 1 ? C.gold : '#ffffff', marginRight: 8 }}>
                                            {word}
                                        </span>
                                    ))}
                                </h1>
                                {/* Top right buttons */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {[Heart, Share2].map((Icon, idx) => (
                                        <button key={idx} style={{
                                            width: 36, height: 36, borderRadius: 8,
                                            background: 'transparent', border: `1px solid ${C.border}`,
                                            color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.muted; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                                        >
                                            <Icon size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Specifications Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                {[
                                    { label: 'CARAT', value: `${gem.carat} ct` },
                                    { label: 'COLOR', value: gem.colorDesc },
                                    { label: 'CLARITY', value: gem.clarity },
                                    { label: 'CUT', value: gem.cut }
                                ].map(spec => (
                                    <div key={spec.label} style={{ textAlign: 'center' }}>
                                        <div style={{ color: C.dim, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6 }}>
                                            {spec.label}
                                        </div>
                                        <div style={{ color: C.text, fontSize: '0.9rem', fontWeight: 800 }}>
                                            {spec.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bidding Block */}
                        <div style={{ ...glassCard, padding: '30px' }}>
                            {/* Timer */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.gold, fontWeight: 700, fontSize: '0.9rem', marginBottom: 24 }}>
                                <Clock size={16} /> Ends in {gem.ends}
                            </div>

                            {/* Prices */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
                                <div>
                                    <div style={{ color: C.dim, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                                        CURRENT BID
                                    </div>
                                    <div style={{ color: C.gold, fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                                        ${gem.bid?.toLocaleString()}
                                    </div>
                                    <div style={{ color: C.dim, fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>
                                        {gem.bids} bids
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: C.dim, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                                        BUY NOW PRICE
                                    </div>
                                    <div style={{ color: C.text, fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', marginTop: 4 }}>
                                        ${gem.buyNow?.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <hr style={{ border: `0.5px solid ${C.border}`, margin: '0 0 24px 0' }} />

                            {/* Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <button style={{
                                    width: '100%', padding: '16px', borderRadius: 10,
                                    background: `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)`,
                                    border: `1px solid ${C.gold}40`, color: C.text,
                                    fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                                    boxShadow: `0 8px 25px rgba(245,158,11,0.15)`,
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${C.gold}`; e.currentTarget.style.boxShadow = `0 10px 30px rgba(245,158,11,0.25)`; }}
                                    onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${C.gold}40`; e.currentTarget.style.boxShadow = `0 8px 25px rgba(245,158,11,0.15)`; }}
                                >
                                    Place Bid
                                </button>

                                <button style={{
                                    width: '100%', padding: '16px', borderRadius: 10,
                                    background: 'transparent',
                                    border: `1px solid ${C.border}`, color: C.muted,
                                    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = C.text; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
                                >
                                    Buy Now
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GemDetails;
