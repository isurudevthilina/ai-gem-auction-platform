import { useTheme } from '../context/ThemeContext';

const plans = [
    {
        name: 'Basic Plan', price: '$29', period: '/mo',
        desc: 'Perfect for individuals and small teams just getting started.',
        popular: false,
        features: ['Up to 5 team members', '10GB storage', 'Basic analytics', 'Email support', 'API access', '5 integrations'],
    },
    {
        name: 'Pro Plan', price: '$79', period: '/mo',
        desc: 'For growing teams that need more power and flexibility.',
        popular: true,
        features: ['Up to 50 team members', '100GB storage', 'Advanced analytics', 'Priority support 24/7', 'Full API access', 'Unlimited integrations', 'Custom workflows', 'Role-based access'],
    },
    {
        name: 'Enterprise Plan', price: '$149', period: '/mo',
        desc: 'For large organizations that need enterprise-grade solutions.',
        popular: false,
        features: ['Unlimited team members', '1TB storage', 'Enterprise analytics', 'Dedicated account manager', 'Full API + webhooks', 'Unlimited integrations', 'Custom workflows', 'SSO & security', 'SLA guarantee'],
    },
];

const Pricing = () => {
    const { isDark } = useTheme();
    const t = {
        heading: isDark ? '#f1f5f9' : '#111827',
        muted: isDark ? '#94a3b8' : '#6b7280',
        sectionBg: isDark ? 'transparent' : 'white',
        glowTop: isDark ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)' : 'none',
        radial: isDark ? 'radial-gradient(ellipse 50% 40% at 20% 60%, rgba(99,102,241,0.06) 0%, transparent 70%)' : 'none',
        cardBg: isDark ? 'rgba(255,255,255,0.04)' : 'white',
        cardBorder: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
        cardShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
        cardHoverBorder: isDark ? 'rgba(99,102,241,0.35)' : '#c7d2fe',
        cardName: isDark ? '#94a3b8' : '#6b7280',
        cardPrice: isDark ? '#f1f5f9' : '#111827',
        cardPricePeriod: isDark ? '#64748b' : '#9ca3af',
        cardDesc: isDark ? '#64748b' : '#9ca3af',
        cardFeature: isDark ? '#94a3b8' : '#6b7280',
        cardCheckmark: isDark ? '#6366f1' : '#4f46e5',
        cardBtnBg: isDark ? 'rgba(99,102,241,0.15)' : '#4f46e5',
        cardBtnColor: isDark ? '#a5b4fc' : 'white',
        cardBtnBorder: isDark ? '1px solid rgba(99,102,241,0.3)' : 'none',
        cardDivider: isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
        footerColor: isDark ? '#475569' : '#9ca3af',
    };

    return (
        <section id="pricing" style={{ padding: '100px 24px', position: 'relative', background: t.sectionBg }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '1px', background: t.glowTop, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: t.radial, pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="section-pill" style={{ marginBottom: '16px' }}>Pricing</div>
                    <h2 style={{ fontSize: 'clamp(1.9rem,3.5vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: t.heading, marginBottom: '14px' }}>
                        Our Pricing Plans
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: t.muted, maxWidth: '500px', margin: '0 auto', lineHeight: 1.75 }}>
                        Flexible pricing options designed to meet your needs — whether you're just getting started or scaling up.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px', alignItems: 'start' }}>
                    {plans.map((p, i) => (
                        <div key={i} style={{
                            borderRadius: '18px', padding: p.popular ? '32px' : '28px',
                            background: p.popular
                                ? 'linear-gradient(145deg, #4338ca 0%, #7c3aed 100%)'
                                : t.cardBg,
                            border: p.popular
                                ? `1px solid rgba(99,102,241,${isDark ? '0.5' : '0.3'})`
                                : `1px solid ${t.cardBorder}`,
                            boxShadow: p.popular
                                ? `0 24px 70px rgba(99,102,241,${isDark ? '0.4' : '0.25'}), 0 0 0 1px rgba(99,102,241,0.15)`
                                : t.cardShadow,
                            transform: p.popular ? 'scale(1.03)' : 'scale(1)',
                            transition: 'all 0.3s ease', position: 'relative',
                            backdropFilter: (!p.popular && isDark) ? 'blur(12px)' : 'none',
                        }}
                            onMouseEnter={e => { if (!p.popular) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = t.cardHoverBorder; } }}
                            onMouseLeave={e => { if (!p.popular) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = t.cardBorder; } }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: p.popular ? 'rgba(255,255,255,0.8)' : t.cardName }}>{p.name}</div>
                                {p.popular && <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.25)' }}>Most Popular</span>}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '8px' }}>
                                <span style={{ fontSize: 'clamp(2.3rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: p.popular ? 'white' : t.cardPrice, lineHeight: 1 }}>{p.price}</span>
                                <span style={{ fontSize: '0.9rem', color: p.popular ? 'rgba(255,255,255,0.6)' : t.cardPricePeriod, fontWeight: 500 }}>{p.period}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: p.popular ? 'rgba(255,255,255,0.65)' : t.cardDesc, marginBottom: '24px', lineHeight: 1.65 }}>{p.desc}</p>

                            <button style={{
                                width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginBottom: '24px',
                                background: p.popular ? 'white' : t.cardBtnBg,
                                color: p.popular ? '#4338ca' : t.cardBtnColor,
                                border: p.popular ? 'none' : t.cardBtnBorder,
                                transition: 'all 0.22s',
                            }}
                                onMouseEnter={e => { e.target.style.opacity = '0.88'; e.target.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
                            >
                                {p.popular ? 'Get Started Now' : 'Choose Plan'}
                            </button>

                            <div style={{ height: '1px', background: p.popular ? 'rgba(255,255,255,0.15)' : t.cardDivider, marginBottom: '20px' }} />

                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                                {p.features.map((f, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '0.855rem', color: p.popular ? 'rgba(255,255,255,0.8)' : t.cardFeature }}>
                                        <span style={{ flexShrink: 0 }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={p.popular ? 'rgba(255,255,255,0.9)' : t.cardCheckmark} strokeWidth="2.5" strokeLinecap="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px', color: t.footerColor, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#6366f1' : '#4f46e5'} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    30-day money back guarantee · No credit card required · Cancel anytime
                </div>
            </div>
        </section>
    );
};

export default Pricing;
