import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfileAvatar from './ProfileAvatar';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import NotificationPanel from '../../features/notifications/components/NotificationPanel';
import GlobalSearchModal from './GlobalSearchModal';
import CurrencySelector from './CurrencySelector';

const navLinkStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '0.88rem',
    color: '#475569',
    textDecoration: 'none',
    letterSpacing: '0.04em',
    fontWeight: 500,
    transition: 'color 0.2s',
};

const registerBtnStyle = {
    fontFamily: "'Cinzel', serif",
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#1B3A6B',
    textDecoration: 'none',
    padding: '7px 18px',
    border: '1.5px solid #D4AF37',
    borderRadius: 8,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
};

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => setIsNotifOpen(false), [location.pathname]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen((v) => !v);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    /* ── Nav links (shared across desktop + mobile) ── */
    const baseLinks = [
        { to: '/auctions', label: 'Live Auctions' },
        { to: '/gems', label: 'Discover Gems' },
        { to: '/ai-predictor', label: 'AI Valuation' },
    ];

    if (isAuthenticated && user?.role === 'seller') {
        baseLinks.push({ to: '/gems/new', label: 'List a Gem' });
    }

    /* ── Dashboard path helper ── */
    const dashboardPath =
        user?.role === 'admin'  ? '/admin-dashboard' :
        user?.role === 'seller' ? '/seller-dashboard' :
                                   '/overview';

    const handleMobileSignOut = async () => {
        setIsMobileMenuOpen(false);
        await logout();
        // Replace history entry so account switching cannot bounce back to prior protected pages.
        navigate('/login', { replace: true, state: null });
    };

    return (
        <>
        <header
            className="base-navbar"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 200,
                padding: '20px 40px',
                background: 'rgba(240, 237, 232, 0.78)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            }}
        >
            <div
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                }}
            >
                <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <span
                        style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#1E293B',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        }}
                    >
                        GemBid LK
                    </span>
                </Link>

                {/* ── Desktop nav ── */}
                <nav className="navbar-desktop" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                    {baseLinks.map(({ to, label }) => (
                        <Link
                            key={label}
                            to={to}
                            style={navLinkStyle}
                            onMouseEnter={(event) => {
                                event.currentTarget.style.color = '#D4AF37';
                            }}
                            onMouseLeave={(event) => {
                                event.currentTarget.style.color = '#475569';
                            }}
                        >
                            {label}
                        </Link>
                    ))}

                    {/* Search bar trigger */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        title="Search (⌘K)"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '7px 14px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.55)',
                            border: '1px solid #E0DCD6',
                            cursor: 'pointer', minWidth: 180,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#C4892A';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.85)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E0DCD6';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.55)';
                        }}
                    >
                        <Search size={15} color="#6B6B7B" />
                        <span style={{ flex: 1, fontFamily: "'Jost','Inter',sans-serif", fontSize: '0.8rem', color: '#9A9AAB', textAlign: 'left' }}>
                            Search...
                        </span>
                        <kbd style={{
                            fontFamily: "'Jost',sans-serif", fontSize: '0.6rem', fontWeight: 600,
                            padding: '2px 6px', borderRadius: 4,
                            background: '#F0EDE8', color: '#6B6B7B',
                            border: '1px solid #E0DCD6', lineHeight: 1.3,
                        }}>⌘K</kbd>
                    </button>

                    {/* Currency + Auth section */}
                    <CurrencySelector />
                    {!isLoading && (
                        isAuthenticated ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ position: 'relative', marginRight: 8 }}>
                                    <NotificationBell
                                        onClick={() => setIsNotifOpen((v) => !v)}
                                        isOpen={isNotifOpen}
                                    />
                                    <NotificationPanel
                                        isOpen={isNotifOpen}
                                        onClose={() => setIsNotifOpen(false)}
                                    />
                                </div>
                                <ProfileAvatar />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 4 }}>
                                <Link
                                    to="/login"
                                    style={navLinkStyle}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    style={registerBtnStyle}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#D4AF37';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#1B3A6B';
                                    }}
                                >
                                    Register
                                </Link>
                            </div>
                        )
                    )}
                </nav>

                {/* ── Hamburger ── */}
                <button
                    className="navbar-hamburger"
                    onClick={() => setIsMobileMenuOpen((value) => !value)}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#1E293B',
                        flexShrink: 0,
                    }}
                >
                    {isMobileMenuOpen ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    )}
                </button>
            </div>

            {/* ── Mobile menu ── */}
            {isMobileMenuOpen && (
                <div className="navbar-mobile" style={{ display: 'none', maxWidth: '1200px', margin: '14px auto 0' }}>
                    <nav
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            paddingTop: '18px',
                            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        {baseLinks.map(({ to, label }) => (
                            <Link
                                key={label}
                                to={to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ ...navLinkStyle, fontSize: '1rem' }}
                            >
                                {label}
                            </Link>
                        ))}

                        {/* Mobile auth section */}
                        {!isLoading && (
                            <div style={{
                                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                                paddingTop: 14,
                                marginTop: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 14,
                            }}>
                                {isAuthenticated ? (
                                    <>
                                        {user?.role === 'buyer' ? (
                                            <>
                                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>My Profile</Link>
                                                <Link to="/overview" onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>Overview</Link>
                                                <Link to="/watchlist" onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>Watchlist</Link>
                                                <Link to="/bid-history" onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>My Bids</Link>
                                                <Link to="/transactions" onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>Purchases</Link>
                                                <Link to="/transactions" onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>Reviews & Ratings</Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link to={dashboardPath} onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>My Dashboard</Link>
                                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>My Profile</Link>
                                                {user?.role === 'seller' && user?.id && (
                                                    <>
                                                        <Link to="/transactions" onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>Purchases & Reviews</Link>
                                                        <Link to={`/sellers/${user.id}/reviews`} onClick={() => setIsMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: '1rem' }}>My Ratings</Link>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        <button
                                            onClick={handleMobileSignOut}
                                            style={{
                                                ...navLinkStyle,
                                                fontSize: '1rem',
                                                color: '#dc2626',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0,
                                                textAlign: 'left',
                                            }}
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            style={{ ...navLinkStyle, fontSize: '1rem' }}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/signup"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            style={{ ...navLinkStyle, fontSize: '1rem', color: '#D4AF37', fontWeight: 600 }}
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </nav>
                </div>
            )}

            <style>{`
                @media (max-width: 900px) {
                    .navbar-desktop {
                        display: none !important;
                    }

                    .navbar-hamburger,
                    .navbar-mobile {
                        display: block !important;
                    }
                }

                @media (max-width: 640px) {
                    .base-navbar {
                        padding: 16px 20px;
                    }
                }
            `}</style>
        </header>
        <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

export default Navbar;
