import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const navigate  = useNavigate();
    const location  = useLocation();
    const onAuctions = location.pathname.startsWith('/auctions');
    const onAIPredictor = location.pathname === '/ai-predictor';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            background: isScrolled
                ? isDark ? 'rgba(9,9,15,0.88)' : 'rgba(255,255,255,0.92)'
                : 'transparent',
            borderBottom: isScrolled
                ? isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #f3f4f6'
                : '1px solid transparent',
            boxShadow: isScrolled
                ? isDark ? '0 1px 30px rgba(0,0,0,0.4)' : '0 1px 20px rgba(0,0,0,0.06)'
                : 'none',
            backdropFilter: isScrolled ? 'blur(20px)' : 'none',
            transition: 'all 0.3s ease',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

                    {/* Logo */}
                    <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Gold gavel icon — GemBid style */}
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ filter: isDark ? 'drop-shadow(0 0 6px rgba(245,158,11,0.6))' : 'drop-shadow(0 2px 4px rgba(245,158,11,0.35))' }}>
                            <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                            <path d="m16 16 6-6" />
                            <path d="m8 8 6-6" />
                            <path d="m9 7 8 8" />
                            <path d="m21 11-8-8" />
                        </svg>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: isDark ? '#f1f5f9' : '#111827', letterSpacing: '-0.02em' }}>
                            Gem<span style={{ color: '#f59e0b' }}>Bid</span>
                        </span>
                    </a>

                    {/* Nav links */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="nav-desktop">
                        {['Home', 'About', 'Features', 'Pricing'].map(link => (
                            <a key={link} href={link === 'Home' ? '#' : link === 'About' ? '#about' : link === 'Pricing' ? '#valuation-ai' : `#${link.toLowerCase()}`}
                                style={{ color: isDark ? '#94a3b8' : '#374151', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, padding: '7px 14px', borderRadius: '8px', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.target.style.color = isDark ? '#a5b4fc' : '#4f46e5'; e.target.style.background = isDark ? 'rgba(99,102,241,0.1)' : '#eef2ff'; }}
                                onMouseLeave={e => { e.target.style.color = isDark ? '#94a3b8' : '#374151'; e.target.style.background = 'transparent'; }}
                            >{link}</a>
                        ))}
                        {/* ── Auctions page link ── */}
                        <Link
                            to="/auctions"
                            style={{
                                color:          onAuctions ? '#f59e0b' : (isDark ? '#94a3b8' : '#374151'),
                                textDecoration: 'none',
                                fontSize:       '0.875rem',
                                fontWeight:     onAuctions ? 700 : 500,
                                padding:        '7px 14px',
                                borderRadius:   '8px',
                                background:     onAuctions ? 'rgba(245,158,11,0.12)' : 'transparent',
                                border:         onAuctions ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                                transition:     'all 0.2s',
                                display:        'flex',
                                alignItems:     'center',
                                gap:            5,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = '#f59e0b';
                                e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = onAuctions ? '#f59e0b' : (isDark ? '#94a3b8' : '#374151');
                                e.currentTarget.style.background = onAuctions ? 'rgba(245,158,11,0.12)' : 'transparent';
                            }}
                        >
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981', flexShrink: 0 }} />
                            Auctions
                        </Link>
                        {/* ── AI Predictor link ── */}
                        <Link
                            to="/ai-predictor"
                            style={{
                                color:          onAIPredictor ? '#f59e0b' : (isDark ? '#94a3b8' : '#374151'),
                                textDecoration: 'none',
                                fontSize:       '0.875rem',
                                fontWeight:     onAIPredictor ? 700 : 500,
                                padding:        '7px 14px',
                                borderRadius:   '8px',
                                background:     onAIPredictor ? 'rgba(245,158,11,0.12)' : 'transparent',
                                border:         onAIPredictor ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                                transition:     'all 0.2s',
                                display:        'flex',
                                alignItems:     'center',
                                gap:            6,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = '#f59e0b';
                                e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = onAIPredictor ? '#f59e0b' : (isDark ? '#94a3b8' : '#374151');
                                e.currentTarget.style.background = onAIPredictor ? 'rgba(245,158,11,0.12)' : 'transparent';
                            }}
                        >
                            🧠 AI Predictor
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                        {/* ── Theme toggle button ── */}
                        <button
                            onClick={toggleTheme}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                border: isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e5e7eb',
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = isDark ? 'rgba(99,102,241,0.5)' : '#c7d2fe';
                                e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'white';
                            }}
                        >
                            {isDark ? (
                                /* Sun icon — shown in dark mode to switch to light */
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                            ) : (
                                /* Moon icon — shown in light mode to switch to dark */
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            )}
                        </button>

                        <Link to="/login" className="nav-signin"
                            style={{ color: isDark ? '#94a3b8' : '#374151', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, padding: '7px 14px', border: isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e5e7eb', borderRadius: '8px', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.target.style.borderColor = isDark ? 'rgba(99,102,241,0.4)' : '#c7d2fe'; e.target.style.color = isDark ? '#a5b4fc' : '#4f46e5'; }}
                            onMouseLeave={e => { e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'; e.target.style.color = isDark ? '#94a3b8' : '#374151'; }}
                        >Sign in</Link>
                        <button onClick={() => navigate('/signup')} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.875rem' }}>
                            Get Started
                        </button>
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="hamburger"
                            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: isDark ? '#94a3b8' : '#374151' }}>
                            {isMobileMenuOpen ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div style={{
                        padding: '20px 24px', background: isDark ? 'rgba(9,9,15,0.98)' : 'white', borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #f3f4f6',
                        display: 'none', flexDirection: 'column', gap: '8px',
                    }} className="mobile-menu-content">
                        {['Features', 'Market', 'Pricing', 'About'].map(link => (
                            <a key={link} href={`#${link.toLowerCase()}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ display: 'block', padding: '10px 0', textDecoration: 'none', color: isDark ? '#94a3b8' : '#374151', fontSize: '0.9rem', fontWeight: 600 }}>
                                {link}
                            </a>
                        ))}
                        <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', color: isDark ? '#94a3b8' : '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Sign in</button>
                        <button onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }} className="btn-primary" style={{ marginTop: '6px', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}>
                            Get Started
                        </button>
                    </div>
                )}
            </div>

            <style>{`
        @media (max-width:768px) {
          .nav-desktop { display:none !important; }
          .nav-signin  { display:none !important; }
          .hamburger   { display:flex !important; }
        }
      `}</style>
        </header>
    );
};

export default Navbar;
