import { useTheme } from '../context/ThemeContext';

const testimonials = [
    { name: 'Sarah Chen', role: 'CTO at Orbit Labs', avatar: 'SC', color: '#6366f1', stars: 5, text: 'GemBid completely transformed how we handle operations. The automation features saved our team 20+ hours per week. Absolutely incredible.' },
    { name: 'Marcus Thompson', role: 'Founder, DevFlow', avatar: 'MT', color: '#a855f7', stars: 5, text: "Nothing comes close to GemBid's feature depth combined with its stunning UI. Our team adopted it in a single day." },
    { name: 'Priya Patel', role: 'Head of Product, Nexus', avatar: 'PP', color: '#ec4899', stars: 5, text: 'The invoicing module alone is worth the subscription price. Smart, fast, and beautiful. Our clients are always impressed.' },
    { name: 'Lucas Reyes', role: 'Engineering Lead, Vanta', avatar: 'LR', color: '#6366f1', stars: 5, text: "GemBid's RBAC system is so well thought out — we onboarded 500 users in an afternoon with zero issues." },
    { name: 'Amara Osei', role: 'CEO at Stackflow', avatar: 'AO', color: '#a855f7', stars: 5, text: 'Our SaaS revenue grew 40% in the quarter after switching to GemBid. The analytics gave us insights we never had before.' },
    { name: 'David Kim', role: 'Product Designer, Relay', avatar: 'DK', color: '#6366f1', stars: 5, text: "Finally a GemBid platform that's as beautiful as it is functional. The design quality is exceptional — clearly built by people who care." },
];

const Stars = () => (
    <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
            <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ))}
    </div>
);

const Testimonials = () => {
    const { isDark } = useTheme();
    const t = {
        heading: isDark ? '#f1f5f9' : '#111827',
        muted: isDark ? '#94a3b8' : '#6b7280',
        sectionBg: isDark ? 'transparent' : '#fafafa',
        glowTop: isDark ? 'linear-gradient(90deg, transparent, rgba(168,85,247,0.35), transparent)' : 'none',
        radial: isDark ? 'radial-gradient(ellipse 50% 35% at 80% 50%, rgba(168,85,247,0.07) 0%, transparent 70%)' : 'none',
        cardText: isDark ? '#94a3b8' : '#4b5563',
        personName: isDark ? '#e2e8f0' : '#111827',
        personRole: isDark ? '#64748b' : '#9ca3af',
    };

    return (
        <section id="testimonials" style={{ padding: '100px 24px', position: 'relative', background: t.sectionBg }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '1px', background: t.glowTop, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: t.radial, pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="section-pill" style={{ marginBottom: '16px' }}>Testimonials</div>
                    <h2 style={{ fontSize: 'clamp(1.9rem,3.5vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: t.heading, marginBottom: '14px' }}>
                        Our Social Proof
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: t.muted, maxWidth: '440px', margin: '0 auto', lineHeight: 1.75 }}>
                        A visual collection of our most recent works — each piece crafted with intention, emotion and style.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '18px' }}>
                    {testimonials.map((testimonial, i) => (
                        <div key={i} className="card" style={{ padding: '24px' }}>
                            <Stars />
                            <p style={{ fontSize: '0.875rem', color: t.cardText, lineHeight: 1.8, margin: '14px 0 20px', fontStyle: 'italic' }}>
                                "{testimonial.text}"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: `${testimonial.color}22`,
                                    border: `1.5px solid ${testimonial.color}50`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.65rem', fontWeight: 700, color: testimonial.color, flexShrink: 0,
                                    boxShadow: isDark ? `0 0 12px ${testimonial.color}30` : 'none',
                                }}>
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: t.personName }}>{testimonial.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: t.personRole, marginTop: '1px' }}>{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
