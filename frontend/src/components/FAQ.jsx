import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const faqs = [
    {
        q: 'How does the AI price prediction work?',
        a: 'Our platform uses a Random Forest Regressor trained on over 5,000 international gem auction records. It analyzes key attributes—such as carat weight, color, clarity, and origin—to provide a valuation with a target accuracy of less than 10% error margin.'
    },
    {
        q: 'Can I trust the authenticity of the gemstones listed?',
        a: 'Yes. Every high-value listing requires a gemstone certificate from recognized authorities like the GIA or NGJA. Our Certification Management System allows buyers to verify certificate numbers and issuing dates directly on the platform before placing a bid.'
    },
    {
        q: 'Why should I use GemBid instead of a local dealer?',
        a: 'GemBid eliminates exploitative middlemen who often take 40-60% of potential revenue. By connecting Sri Lankan sellers directly to the international market, we ensure fair pricing for sellers and transparent market data for buyers.'
    },
    {
        q: 'Is the bidding truly real-time?',
        a: 'Absolutely. We utilize WebSocket (Socket.io) technology to power our real-time auction engine. This ensures that bid placements, countdown timers, and highest-bidder updates are instant and synchronized for all 100+ concurrent participants.'
    },
    {
        q: 'How does "Explainable AI" help me as a buyer?',
        a: 'We use SHAP (Shapley Additive Explanations) to break down exactly how each gem attribute contributes to its predicted price. For example, you can see exactly how much value the gem\'s origin (e.g., Ratnapura) or treatment status added to the final valuation.'
    },
];

const FAQ = () => {
    const [open, setOpen] = useState(null);
    const { isDark } = useTheme();
    const t = {
        heading: isDark ? '#f1f5f9' : '#111827',
        muted: isDark ? '#94a3b8' : '#6b7280',
        sectionBg: isDark ? 'transparent' : '#fafafa',
        glowTop: isDark ? 'linear-gradient(90deg, transparent, rgba(236,72,153,0.3), transparent)' : 'none',
        radial: isDark ? 'radial-gradient(ellipse 50% 35% at 50% 100%, rgba(99,102,241,0.07) 0%, transparent 70%)' : 'none',
        accordionBg: isDark ? 'rgba(255,255,255,0.03)' : 'white',
        accordionBorder: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
        accordionShadow: isDark ? '0 4px 40px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
        rowBorder: isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
        rowBgOpen: isDark ? 'rgba(99,102,241,0.08)' : '#fafafa',
        questionColor: (isOpen) => isDark
            ? (isOpen ? '#a5b4fc' : '#e2e8f0')
            : (isOpen ? '#4f46e5' : '#111827'),
        toggleBg: (isOpen) => isDark
            ? (isOpen ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)')
            : (isOpen ? '#eef2ff' : '#f9fafb'),
        toggleBorder: (isOpen) => isDark
            ? (isOpen ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)')
            : (isOpen ? '#c7d2fe' : '#e5e7eb'),
        toggleStroke: (isOpen) => isDark
            ? (isOpen ? '#a5b4fc' : '#64748b')
            : (isOpen ? '#4f46e5' : '#9ca3af'),
        answerColor: isDark ? '#94a3b8' : '#6b7280',
    };

    return (
        <section id="faq" style={{ padding: '100px 24px', position: 'relative', background: t.sectionBg }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '1px', background: t.glowTop, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: t.radial, pointerEvents: 'none' }} />

            <div style={{ maxWidth: '740px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <div className="section-pill" style={{ marginBottom: '16px' }}>FAQ's</div>
                    <h2 style={{ fontSize: 'clamp(1.9rem,3.5vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: t.heading, marginBottom: '14px' }}>
                        Frequently asked questions
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: t.muted, lineHeight: 1.75 }}>
                        Direct Access to the Global Gem Market — Eliminating Middlemen and Maximizing Profits for Local Sri Lankan Sellers through Real-Time Auctions.
                    </p>
                </div>

                <div style={{
                    background: t.accordionBg,
                    borderRadius: '18px',
                    border: `1px solid ${t.accordionBorder}`,
                    overflow: 'hidden',
                    boxShadow: t.accordionShadow,
                    backdropFilter: isDark ? 'blur(16px)' : 'none',
                }}>
                    {faqs.map((f, i) => (
                        <div key={i} style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${t.rowBorder}` : 'none' }}>
                            <button onClick={() => setOpen(open === i ? null : i)} style={{
                                width: '100%', padding: '22px 24px',
                                background: open === i ? t.rowBgOpen : 'transparent',
                                border: 'none', cursor: 'pointer', textAlign: 'left',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                                transition: 'background 0.2s',
                            }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: t.questionColor(open === i), transition: 'color 0.2s', lineHeight: 1.5 }}>
                                    {f.q}
                                </span>
                                <span style={{
                                    flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%',
                                    background: t.toggleBg(open === i),
                                    border: `1.5px solid ${t.toggleBorder(open === i)}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.3s', transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                                }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.toggleStroke(open === i)} strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </span>
                            </button>
                            <div style={{ maxHeight: open === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                                <p style={{ padding: '0 24px 22px', fontSize: '0.885rem', color: t.answerColor, lineHeight: 1.8 }}>{f.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
