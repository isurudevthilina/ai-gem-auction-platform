import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const t = {
        sectionBg: isDark ? 'transparent' : 'white',
        glowTop: isDark ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)' : 'none',
        footerBg: isDark ? 'rgba(0,0,0,0.3)' : '#ffffff',
        footerBorder: isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
        footerBlur: isDark ? 'blur(10px)' : 'none',
        brandText: isDark ? '#f1f5f9' : '#1e1b4b',
        brandDesc: isDark ? '#64748b' : '#9ca3af',
        headingColor: isDark ? '#475569' : '#374151',
        linkColor: isDark ? '#64748b' : '#6b7280',
        linkHover: isDark ? '#a5b4fc' : '#4f46e5',
        copyright: isDark ? '#475569' : '#9ca3af',
        copyrightLink: isDark ? '#6366f1' : '#4f46e5',
        bottomBorder: isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
        ctaShadow: isDark ? '0 24px 80px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.2)' : '0 20px 60px rgba(79,70,229,0.3)',
        logoGlow: isDark ? '0 0 14px rgba(245,158,11,0.45)' : '0 4px 12px rgba(245,158,11,0.3)',
    };

    return (
        <>
            {/* CTA Banner */}
            <section style={{ padding: '80px 24px', position: 'relative', background: t.sectionBg }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '1px', background: t.glowTop, pointerEvents: 'none' }} />
                <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <div style={{
                        borderRadius: '24px', padding: '60px 44px', textAlign: 'center',
                        background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 60%, #a855f7 100%)',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: t.ctaShadow,
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Get Started Today</p>
                            <h2 style={{ fontSize: 'clamp(1.7rem,3.5vw,2.6rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'white', marginBottom: '14px', lineHeight: 1.18 }}>
                                Join thousands of collectors bidding on verified Sri Lankan Gems.
                            </h2>
                            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.75 }}>
                                Eliminate middlemen and secure fair prices with our AI-driven marketplace. Authenticity guaranteed.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <button onClick={() => navigate('/signup')} style={{ padding: '13px 28px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, background: 'white', color: '#4338ca', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                                    Create Account
                                </button>
                                <button onClick={() => navigate('/login')} style={{ padding: '13px 24px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: t.footerBg, borderTop: `1px solid ${t.footerBorder}`, padding: '80px 24px 40px', backdropFilter: t.footerBlur }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '60px', flexWrap: 'wrap', marginBottom: '64px' }}>

                        {/* Brand Column */}
                        <div style={{ flex: '1.5', minWidth: '240px' }}>
                            <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' : 'drop-shadow(0 2px 5px rgba(245,158,11,0.3))' }}>
                                    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                                    <path d="m16 16 6-6" />
                                    <path d="m8 8 6-6" />
                                    <path d="m9 7 8 8" />
                                    <path d="m21 11-8-8" />
                                </svg>
                                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: t.brandText, letterSpacing: '-0.02em' }}>
                                    Gem<span style={{ color: '#f59e0b' }}>Bid</span>
                                </span>
                            </a>
                            <p style={{ fontSize: '0.9rem', color: t.brandDesc, lineHeight: 1.8, maxWidth: '300px', opacity: 0.9 }}>
                                The world's premier marketplace for rare and precious gemstones. Bid with confidence, win with pride.
                            </p>
                        </div>

                        {/* Navigation Column */}
                        <div style={{ flex: '1', minWidth: '140px' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: t.headingColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '24px', opacity: 0.6 }}>Navigation</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', padding: 0, margin: 0 }}>
                                {[['Home', '#'], ['About', '#about'], ['Features', '#features'], ['Pricing', '#valuation-ai']].map(([l, h]) => (
                                    <li key={l}>
                                        <a href={h} style={{ color: t.linkColor, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s ease', display: 'inline-block' }}
                                            onMouseEnter={e => { e.target.style.color = t.linkHover; e.target.style.transform = 'translateX(4px)'; }}
                                            onMouseLeave={e => { e.target.style.color = t.linkColor; e.target.style.transform = 'translateX(0)'; }}
                                        >{l}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Get in touch Column */}
                        <div style={{ flex: '1.2', minWidth: '200px' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: t.headingColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '24px', opacity: 0.6 }}>Connect</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <a href="tel:+12124567890" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: t.linkColor, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = t.linkHover; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = t.linkColor; e.currentTarget.style.transform = 'translateX(0)'; }}
                                >
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    </div>
                                    +1 (212) 456-7890
                                </a>
                                <a href="mailto:contact@gembid.com" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: t.linkColor, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = t.linkHover; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = t.linkColor; e.currentTarget.style.transform = 'translateX(0)'; }}
                                >
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                    </div>
                                    contact@gembid.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div style={{ borderTop: `1px solid ${t.bottomBorder}`, paddingTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: t.copyright, opacity: 0.8, letterSpacing: '0.01em' }}>
                            Copyright 2025 © <span style={{ fontWeight: 800, color: t.brandText }}>
                                Gem<span style={{ color: '#f59e0b' }}>Bid</span>
                            </span>. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
