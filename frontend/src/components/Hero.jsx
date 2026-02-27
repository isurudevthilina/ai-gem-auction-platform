import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ─────────────────────────────────────────────
   Reusable tilt hook
───────────────────────────────────────────── */
const useTilt = (strength = 12) => {
    const ref = useRef(null);
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rotateX = useSpring(useTransform(rawY, v => -v * strength), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(rawX, v => v * strength), { stiffness: 200, damping: 20 });

    const onMouseMove = (e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        rawX.set((e.clientX - r.left) / r.width - 0.5);
        rawY.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onMouseLeave = () => { rawX.set(0); rawY.set(0); };
    return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
};

/* ─────────────────────────────────────────────
   Auction Card
───────────────────────────────────────────── */
const AuctionCard = ({ isDark, timeLeft, pad }) => {
    const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(10);

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
                width: '215px', borderRadius: '22px', padding: '20px',
                background: isDark ? 'rgba(9,9,15,0.82)' : 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(139,92,246,0.35)',
                boxShadow: isDark
                    ? '0 28px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.09)'
                    : '0 24px 56px rgba(124,58,237,0.2)',
                position: 'relative', zIndex: 2,
                alignSelf: 'flex-start', marginTop: '16px',
                perspective: 800,
                rotateX, rotateY,
                transformStyle: 'preserve-3d',
            }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
            {/* LIVE badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Auction</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(239,68,68,0.13)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '999px', padding: '2px 9px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.4s ease-in-out infinite', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.07em' }}>LIVE</span>
                </span>
            </div>

            {/* Gem */}
            <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2.4rem' }}>💎</div>

            {/* Price */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#6b7280', marginBottom: '4px' }}>Royal Blue Sapphire</div>
                <div style={{
                    fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>LKR 334,850</div>
                <div style={{ fontSize: '0.6rem', color: isDark ? '#64748b' : '#9ca3af', marginTop: '2px' }}>Current Bid</div>
            </div>

            {/* Timer — recessed inner-shadow box */}
            <div style={{
                borderRadius: '12px', padding: '10px 8px', textAlign: 'center',
                background: isDark ? 'rgba(10,6,30,0.6)' : 'rgba(230,220,255,0.6)',
                boxShadow: isDark
                    ? 'inset 0 2px 8px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(139,92,246,0.2)'
                    : 'inset 0 2px 8px rgba(100,60,200,0.15), inset 0 0 0 1px rgba(139,92,246,0.15)',
            }}>
                <div style={{ fontSize: '0.55rem', color: isDark ? '#7c3aed' : '#6d28d9', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '5px' }}>ENDS IN</div>
                <div style={{ fontFamily: '"Courier New", monospace', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.08em', color: isDark ? '#c4b5fd' : '#5b21b6' }}>
                    {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
                </div>
            </div>

            {/* Shimmer "Place Bid" button */}
            <button style={{
                width: '100%', marginTop: '13px', padding: '9px 0',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
                border: 'none', borderRadius: '12px', color: 'white',
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(124,58,237,0.45)',
                position: 'relative', overflow: 'hidden',
            }}>
                Place Bid →
                <span style={{
                    position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                    animation: 'shimmer 3s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />
            </button>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────
   Certificate Card
───────────────────────────────────────────── */
const CertCard = ({ isDark }) => {
    const { ref, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(10);

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
                width: '198px', borderRadius: '22px', padding: '18px',
                background: isDark ? 'rgba(9,9,15,0.80)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(236,72,153,0.28)',
                boxShadow: isDark
                    ? '0 28px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)'
                    : '0 24px 56px rgba(236,72,153,0.18)',
                position: 'relative', zIndex: 2,
                alignSelf: 'flex-end', marginBottom: '16px',
                perspective: 800,
                rotateX, rotateY,
                transformStyle: 'preserve-3d',
            }}
            animate={{ y: [-10, 8, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.63rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Certificate</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '999px', padding: '2px 7px' }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#10b981' }}>VERIFIED</span>
                </span>
            </div>

            {/* Gem */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🔮</div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e1b4b' }}>Royal Blue Sapphire</div>
                <div style={{ fontSize: '0.6rem', color: isDark ? '#64748b' : '#9ca3af', marginTop: '1px' }}>Grade A — Certified</div>
            </div>

            {/* Specs */}
            {[['Carat', '3.42 ct'], ['Clarity', 'VVS1'], ['Cut', 'Excellent']].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}` }}>
                    <span style={{ fontSize: '0.67rem', color: isDark ? '#64748b' : '#9ca3af' }}>{label}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#c4b5fd' : '#7c3aed' }}>{val}</span>
                </div>
            ))}

            {/* Cert ID */}
            <div style={{
                marginTop: '12px', borderRadius: '10px', padding: '7px 10px', textAlign: 'center',
                background: isDark ? 'rgba(236,72,153,0.08)' : '#fdf2f8',
                border: `1px solid ${isDark ? 'rgba(236,72,153,0.2)' : '#fbcfe8'}`,
            }}>
                <div style={{ fontSize: '0.52rem', color: isDark ? '#f472b6' : '#db2777', letterSpacing: '0.1em', fontWeight: 700 }}>CERT ID</div>
                <div style={{ fontSize: '0.65rem', fontFamily: '"Courier New", monospace', color: isDark ? '#cbd5e1' : '#374151', marginTop: '2px' }}>GEM-2025-4471</div>
            </div>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────
   Hero
───────────────────────────────────────────── */
const Hero = () => {
    const { isDark } = useTheme();
    const brands = ['GIA', 'GRS', 'IGI', 'SSEF', 'NGJA'];

    const [timeLeft, setTimeLeft] = useState({ h: 2, m: 47, s: 33 });
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { h, m, s } = prev;
                if (s > 0) return { h, m, s: s - 1 };
                if (m > 0) return { h, m: m - 1, s: 59 };
                if (h > 0) return { h: h - 1, m: 59, s: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const pad = n => String(n).padStart(2, '0');

    const t = {
        heading: isDark ? '#f1f5f9' : '#111827',
        muted: isDark ? '#94a3b8' : '#6b7280',
        accent: isDark ? '#a5b4fc' : '#4f46e5',
        pillBg: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff',
        pillBorder: isDark ? 'rgba(99,102,241,0.25)' : 'transparent',
        pillText: isDark ? '#cbd5e1' : '#374151',
        pillBadgeBg: isDark ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#4f46e5',
        pillArrow: isDark ? 'rgba(99,102,241,0.25)' : '#c7d2fe',
        pillArrowStroke: isDark ? '#a5b4fc' : '#4f46e5',
        cardBg: isDark ? 'rgba(255,255,255,0.05)' : 'white',
        cardBorder: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
        cardShadow: isDark ? '0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(99,102,241,0.15)' : '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(79,70,229,0.08)',
        invoiceLabel: isDark ? '#94a3b8' : '#9ca3af',
        invoiceAmount: isDark ? '#f1f5f9' : '#111827',
        barInactive: isDark ? 'rgba(99,102,241,0.2)' : '#e0e7ff',
        barActive: isDark ? '#6366f1' : '#4f46e5',
        barNum: isDark ? '#475569' : '#d1d5db',
        badgeBg: isDark ? 'rgba(16,185,129,0.12)' : '#f0fdf4',
        badgeBorder: isDark ? 'rgba(16,185,129,0.3)' : '#bbf7d0',
        badgeText: isDark ? '#34d399' : '#16a34a',
        badgeSub: isDark ? '#64748b' : '#9ca3af',
        trustedText: isDark ? '#475569' : '#9ca3af',
        brandColor: isDark ? '#334155' : '#d1d5db',
        brandHover: isDark ? '#6366f1' : '#9ca3af',
        borderTop: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
        trustedBg: isDark ? 'rgba(0,0,0,0.15)' : 'transparent',
        heroGlow: isDark ? 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' : 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,70,229,0.04) 0%, transparent 70%)',
    };

    return (
        <section style={{ position: 'relative', paddingTop: '64px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: t.heroGlow, pointerEvents: 'none' }} />

            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>


                {/* Headline */}
                <div className="animate-fade-up delay-100" style={{ marginBottom: '20px' }}>
                    {/* Line 1 — normal weight intro */}
                    <p style={{
                        fontSize: 'clamp(1.2rem, 2.8vw, 1.8rem)', fontWeight: 700,
                        color: t.heading, opacity: 0.88, letterSpacing: '-0.02em',
                        marginBottom: '2px', lineHeight: 1.2,
                    }}>
                        Win and Own the World's
                    </p>

                    {/* Line 2 — huge gradient "Rarest Gems" */}
                    <h1 style={{
                        fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900,
                        lineHeight: 1, letterSpacing: '-0.045em', margin: '0 0 10px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 45%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        filter: isDark ? 'drop-shadow(0 0 30px rgba(245,158,11,0.25))' : 'none',
                    }}>
                        Rarest Gems
                    </h1>

                    {/* Line 3 — tagline */}
                    <p style={{
                        fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', fontWeight: 600,
                        color: t.accent, letterSpacing: '0.01em', lineHeight: 1.4,
                    }}>
                        Just One Bid Away
                    </p>
                </div>

                {/* Subtitle */}
                <p className="animate-fade-up delay-200" style={{ fontSize: '1rem', color: t.muted, lineHeight: 1.75, maxWidth: '480px', margin: '0 auto 36px' }}>
                    Bid on exclusive, certified gemstones from around the globe.{' '}
                    <span style={{ color: t.accent }}>Secure, transparent,</span> and premium auctions for the discerning collector.
                </p>

                {/* CTA buttons */}
                <div className="animate-fade-up delay-300" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '60px' }}>
                    <button onClick={() => navigate('/signup')} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '0.9rem' }}>
                        Get Started
                    </button>
                    <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '12px 22px', borderRadius: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Sign In
                    </button>
                </div>

                {/* ══ Premium GemBid Cards ══ */}
                <div className="animate-fade-up delay-400" style={{
                    position: 'relative', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', height: '400px', gap: '24px',
                }}>



                    {/* ─── Card 1: Live Auction ─── */}
                    <AuctionCard isDark={isDark} timeLeft={timeLeft} pad={pad} />

                    {/* ─── Card 2: Certificate ─── */}
                    <CertCard isDark={isDark} />

                    {/* Keyframes */}
                    <style>{`
                        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
                        @keyframes shimmer {
                            0%   { transform: translateX(-120%) skewX(-20deg); }
                            100% { transform: translateX(300%) skewX(-20deg); }
                        }
                    `}</style>
                </div>
            </div>

            {/* Trusted by */}
            <div style={{ borderTop: `1px solid ${t.borderTop}`, padding: '36px 24px', background: t.trustedBg, backdropFilter: isDark ? 'blur(8px)' : 'none' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.78rem', color: t.trustedText, letterSpacing: '0.04em', marginBottom: '28px' }}>
                        Ensuring Authenticity through World-Class Partners —
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
                        {brands.map(b => (
                            <span key={b} style={{ color: t.brandColor, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.01em', transition: 'color 0.2s', cursor: 'default' }}
                                onMouseEnter={e => e.target.style.color = t.brandHover}
                                onMouseLeave={e => e.target.style.color = t.brandColor}
                            >{b}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
