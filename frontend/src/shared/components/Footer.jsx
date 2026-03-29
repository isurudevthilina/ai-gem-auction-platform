import { Link } from 'react-router-dom';

const columnHeadingStyle = {
    fontFamily: "'Cinzel', serif",
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#C9A84C',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 18,
};

const footerLinkStyle = {
    fontFamily: "'Jost', sans-serif",
    fontSize: '0.85rem',
    color: '#6B6B7B',
    textDecoration: 'none',
    transition: 'color 0.2s',
    display: 'block',
    lineHeight: 1.4,
};

const columns = [
    {
        heading: 'Platform',
        links: [
            { label: 'Live Auctions', to: '/auctions' },
            { label: 'Gem Vault', to: '/gems' },
            { label: 'AI Valuation', to: '/ai-predictor' },
        ],
    },
    {
        heading: 'For Sellers',
        links: [
            { label: 'List Your Gems', to: '/gems/new' },
            { label: 'Seller Dashboard', to: '/seller-dashboard' },
        ],
    },
    {
        heading: 'For Buyers',
        links: [
            { label: 'Watchlist', to: '/watchlist' },
            { label: 'Bid History', to: '/bid-history' },
            { label: 'Purchases', to: '/transactions' },
        ],
    },
    {
        heading: 'Company',
        links: [
            { label: 'About', to: '#' },
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Disclaimer', to: '/disclaimer' },
            { label: 'Contact', to: '#' },
        ],
    },
];

export default function Footer() {
    return (
        <footer style={{
            background: '#F5EFE6',
            borderTop: '1px solid rgba(201,168,76,0.15)',
        }}>
            <div className="footer-grid-wrapper" style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '64px 40px 32px',
            }}>
                {/* Grid */}
                <div className="footer-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr',
                    gap: 40,
                }}>
                    {/* Brand column */}
                    <div>
                        <span style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#1E293B',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        }}>
                            GemBid LK
                        </span>
                        <p style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.95rem',
                            color: '#6B6B7B',
                            lineHeight: 1.65,
                            marginTop: 14,
                            maxWidth: 260,
                        }}>
                            Sri Lanka's premier gem auction platform — connecting
                            the island's finest gemstones with collectors worldwide.
                        </p>

                        {/* Social row */}
                        <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
                            {/* Twitter/X */}
                            <a href="#" aria-label="Twitter" style={{ color: '#6B6B7B', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B7B'; }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a href="#" aria-label="Instagram" style={{ color: '#6B6B7B', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B7B'; }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                                </svg>
                            </a>
                            {/* LinkedIn */}
                            <a href="#" aria-label="LinkedIn" style={{ color: '#6B6B7B', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B7B'; }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {columns.map(({ heading, links }) => (
                        <div key={heading}>
                            <h4 style={columnHeadingStyle}>{heading}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {links.map(({ label, to }) => (
                                    <Link
                                        key={label}
                                        to={to}
                                        style={footerLinkStyle}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B7B'; }}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    marginTop: 48,
                    paddingTop: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                }}>
                    <span style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '0.8rem',
                        color: '#6B6B7B',
                    }}>
                        &copy; {new Date().getFullYear()} GemBid LK. All rights reserved.
                    </span>
                    <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        color: '#94a3b8',
                    }}>
                        Crafted in Sri Lanka
                    </span>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr !important;
                        gap: 32px !important;
                    }
                    .footer-grid-wrapper {
                        padding: 40px 20px 24px !important;
                    }
                }
            `}</style>
        </footer>
    );
}
