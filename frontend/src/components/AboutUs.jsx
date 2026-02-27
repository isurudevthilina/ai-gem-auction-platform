import { useTheme } from '../context/ThemeContext';

const AboutUs = () => {
    const { isDark } = useTheme();

    const t = {
        heading: isDark ? '#f1f5f9' : '#1e1b4b',
        text: isDark ? '#94a3b8' : '#475569',
        accent: '#f59e0b',
        cardBg: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
        cardBorder: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
    };

    return (
        <section id="about" style={{ padding: '100px 24px', background: 'transparent' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '60px',
                    flexWrap: 'wrap'
                }}>

                    {/* Left: Content */}
                    <div style={{ flex: '1.2', minWidth: '300px' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            borderRadius: '100px',
                            background: isDark ? 'rgba(245,158,11,0.1)' : '#fef3c7',
                            color: t.accent,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            marginBottom: '20px'
                        }}>
                            Our Story
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                            fontWeight: 900,
                            color: t.heading,
                            lineHeight: 1.15,
                            marginBottom: '24px',
                            letterSpacing: '-0.02em'
                        }}>
                            Revolutionizing the World of <span style={{ color: t.accent }}>Gemstone Trading</span>.
                        </h2>
                        <p style={{
                            fontSize: '1.05rem',
                            color: t.text,
                            lineHeight: 1.8,
                            marginBottom: '24px'
                        }}>
                            Founded in the heart of Sri Lanka, GemBid was born out of a passion for transparency and excellence in the gem industry. We bridges the gap between local mines and international collectors, ensuring that every stone carries a verified story of origin and quality.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <h4 style={{ color: t.heading, marginBottom: '8px', fontWeight: 800 }}>Our Mission</h4>
                                <p style={{ fontSize: '0.875rem', color: t.text, lineHeight: 1.6 }}>
                                    To provide a secure, AI-powered platform that empowers buyers and sellers through fair market valuations.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: t.heading, marginBottom: '8px', fontWeight: 800 }}>Our Vision</h4>
                                <p style={{ fontSize: '0.875rem', color: t.text, lineHeight: 1.6 }}>
                                    To become the global gold standard for gemstone auctions, celebrated for authenticity and trust.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual Element */}
                    <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                        <div style={{
                            aspectRatio: '1/1',
                            borderRadius: '32px',
                            background: isDark
                                ? 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(236,72,153,0.05) 100%)'
                                : 'white',
                            border: `1px solid ${t.cardBorder}`,
                            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative elements */}
                            <div style={{
                                position: 'absolute', top: '-10%', right: '-10%',
                                width: '50%', height: '50%',
                                background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
                                filter: 'blur(30px)'
                            }} />

                            {/* Logo representation */}
                            <div style={{ textAlign: 'center', zIndex: 1 }}>
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.4))' }}>
                                    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                                    <path d="m16 16 6-6" />
                                    <path d="m8 8 6-6" />
                                    <path d="m9 7 8 8" />
                                    <path d="m21 11-8-8" />
                                </svg>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: t.heading }}>
                                    Gem<span style={{ color: t.accent }}>Bid</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: t.text, fontWeight: 600, marginTop: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Authenticity First
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AboutUs;
