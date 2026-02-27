import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Clock, CheckCircle, ChevronDown, LogOut,
    Home, Heart, Activity, Filter, Eye
} from 'lucide-react';
import GemCard from '../components/GemCard';

/* ─── colour tokens — mirrors landing page ─── */
const C = {
    bg: '#0a0d14',
    panel: '#0f1220',
    card: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    gold: '#f59e0b',
    goldDim: 'rgba(245,158,11,0.15)',
    green: '#10b981',
    red: '#ef4444',
    indigo: '#6366f1',
    text: '#f1f5f9',
    muted: '#94a3b8',
    dim: '#475569',
};

const glassCard = {
    background: 'rgba(13,17,28,0.85)',
    border: `1px solid ${C.border}`,
    borderRadius: '14px',
    backdropFilter: 'blur(18px)',
};

/* ════════════════════════════════════════════════════
   TOP NAVBAR
════════════════════════════════════════════════════ */
const Navbar = ({ active, setActive }) => {
    const navigate = useNavigate();

    const navLinks = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'auctions', label: 'Live Auctions', icon: Activity },
        { id: 'mybids', label: 'My Bids', icon: Clock },
        { id: 'watchlist', label: 'Watchlist', icon: Heart },
    ];

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 40,
            background: `${C.panel}ee`,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center',
            padding: '0 32px', height: 64, gap: 32,
        }}>
            {/* Logo */}
            <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}
                onClick={() => navigate('/')}
            >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.6))' }}>
                    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                    <path d="m16 16 6-6" />
                    <path d="m8 8 6-6" />
                    <path d="m9 7 8 8" />
                    <path d="m21 11-8-8" />
                </svg>
                <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.03em' }}>
                    <span style={{ color: C.text }}>Gem</span>
                    <span style={{ color: C.gold }}>Bid</span>
                </span>
            </div>

            {/* Nav links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                {navLinks.map(({ id, label, icon: Icon }) => {
                    const isActive = active === id;
                    return (
                        <button key={id} onClick={() => setActive(id)} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 16px', borderRadius: 8, border: 'none',
                            background: isActive ? C.goldDim : 'transparent',
                            color: isActive ? C.gold : C.muted,
                            fontWeight: isActive ? 700 : 500, fontSize: '0.875rem',
                            cursor: 'pointer', transition: 'all 0.2s',
                            borderBottom: isActive ? `2px solid ${C.gold}` : '2px solid transparent',
                        }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = C.text; } }}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = C.muted; } }}
                        >
                            <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {/* Right side: Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                {/* Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '0.82rem', color: '#fff', flexShrink: 0,
                    }}>JD</div>
                    <div style={{ lineHeight: 1.25 }}>
                        <div style={{ color: C.text, fontWeight: 700, fontSize: '0.8rem' }}>John Doe</div>
                        <div style={{ color: C.indigo, fontSize: '0.65rem', fontWeight: 600 }}>🌟 Premium Buyer</div>
                    </div>
                    <ChevronDown size={14} style={{ color: C.dim }} />
                </div>
            </div>
        </header>
    );
};

/* ════════════════════════════════════════════════════
   GEM DATA
════════════════════════════════════════════════════ */
const gems = [
    { id: 1, name: 'Royal Blue Sapphire', carat: 2.5, bid: 12500, buyNow: 15000, status: 'Active', ends: '12h 30m', category: 'Sapphire', color: '#3b82f6', emoji: '💎', bids: 14 },
    { id: 2, name: 'Pigeon Blood Ruby', carat: 1.8, bid: 28000, buyNow: 32000, status: 'Active', ends: '04h 15m', category: 'Ruby', color: '#ef4444', emoji: '🔴', bids: 32 },
    { id: 3, name: 'Colombian Emerald', carat: 3.2, bid: 18500, buyNow: 22000, status: 'Active', ends: '1d 08h', category: 'Emerald', color: '#10b981', emoji: '💚', bids: 8 },
    { id: 4, name: 'Fancy Pink Diamond', carat: 0.9, bid: 45000, buyNow: 55000, status: 'Ending', ends: '00h 45m', category: 'Diamond', color: '#ec4899', emoji: '💠', bids: 54 },
    { id: 5, name: 'Kashmir Sapphire', carat: 1.5, bid: 35000, buyNow: 40000, status: 'Upcoming', ends: '2d 04h', category: 'Sapphire', color: '#6366f1', emoji: '🔵', bids: 0 },
    { id: 6, name: 'Paraiba Tourmaline', carat: 4.1, bid: 18000, buyNow: 21000, status: 'Active', ends: '18h 20m', category: 'Tourmaline', color: '#14b8a6', emoji: '🟢', bids: 21 },
];



/* ════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
════════════════════════════════════════════════════ */
const BuyerDashboard = () => {
    const [activePage, setActivePage] = useState('auctions');
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const categories = ['All', 'Sapphire', 'Ruby', 'Emerald', 'Diamond', 'Tourmaline'];

    const filtered = gems.filter(g => {
        const matchCat = filter === 'All' || g.category === filter;
        const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text }}>
            {/* ── Navbar ── */}
            <Navbar active={activePage} setActive={setActivePage} />

            {/* ── Page content ── */}
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
                    <div>
                        <div style={{ color: C.gold, fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Buyer Dashboard</div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', color: C.text, margin: 0, lineHeight: 1.1 }}>
                            Discover Exceptional Gems
                        </h1>
                    </div>
                </div>

                {/* ── Filter bar with search ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16, marginBottom: 30,
                    padding: '12px 18px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                }}>
                    {/* Filter by label + pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.gold, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                            <Filter size={14} /> Categories
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {categories.map(c => (
                                <button key={c} onClick={() => setFilter(c)} style={{
                                    padding: '5px 16px', borderRadius: '999px', cursor: 'pointer',
                                    border: filter === c ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                                    background: filter === c ? C.goldDim : 'transparent',
                                    color: filter === c ? C.gold : C.muted,
                                    fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.2s',
                                }}>{c}</button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search gemstones…"
                            style={{
                                background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
                                borderRadius: 9, padding: '8px 14px 8px 32px',
                                color: C.text, fontSize: '0.85rem', outline: 'none', width: 220,
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => { e.target.style.borderColor = `${C.gold}60`; }}
                            onBlur={e => { e.target.style.borderColor = C.border; }}
                        />
                    </div>
                </div>

                {/* ── Trending Section Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Live Auctions</h2>
                </div>

                {/* ── Gem auction cards grid ── */}
                {filtered.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 24,
                    }}>
                        {filtered.map(gem => (
                            <GemCard
                                key={gem.id}
                                gem={{
                                    id: gem.id,
                                    name: gem.name,
                                    carat: gem.carat,
                                    timeLeft: gem.ends,
                                    currentBid: gem.bid,
                                    buyNow: gem.buyNow,
                                    gemType: gem.category.toLowerCase(),
                                    isVerified: gem.status === 'Active'
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: C.dim }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: C.muted }}>No gems found</div>
                        <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Try changing your search or filter.</div>
                    </div>
                )}
            </main>

            {/* ══ FOOTER ══ */}
            <footer style={{
                borderTop: `1px solid ${C.border}`,
                background: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(12px)',
                padding: '60px 32px 32px',
                marginTop: 40,
            }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap', marginBottom: 48 }}>

                        {/* Brand */}
                        <div style={{ flex: '1.5', minWidth: 220 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.55))' }}>
                                    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                                    <path d="m16 16 6-6" />
                                    <path d="m8 8 6-6" />
                                    <path d="m9 7 8 8" />
                                    <path d="m21 11-8-8" />
                                </svg>
                                <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                                    <span style={{ color: C.text }}>Gem</span>
                                    <span style={{ color: C.gold }}>Bid</span>
                                </span>
                            </div>
                            <p style={{ color: C.dim, fontSize: '0.88rem', lineHeight: 1.8, maxWidth: 280 }}>
                                The world's premier marketplace for rare and precious gemstones. Bid with confidence, win with pride.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div style={{ flex: 1, minWidth: 140 }}>
                            <h4 style={{ color: C.dim, fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Quick Links</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[['Live Auctions', '#'], ['List a Gem', '#'], ['Valuation Services', '#'], ['Sell with Us', '#']].map(([label, href]) => (
                                    <li key={label}>
                                        <a href={href} style={{ color: C.muted, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.2s', display: 'inline-block' }}
                                            onMouseEnter={e => { e.target.style.color = C.gold; e.target.style.transform = 'translateX(4px)'; }}
                                            onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.transform = 'translateX(0)'; }}
                                        >{label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div style={{ flex: 1.2, minWidth: 200 }}>
                            <h4 style={{ color: C.dim, fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Contact Us</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6', label: 'support@gembid.com', href: 'mailto:support@gembid.com' },
                                    { icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z', label: '1-800-GEM-BID1', href: 'tel:+18004362431' },
                                ].map(({ icon, label, href }) => (
                                    <a key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.muted, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.transform = 'translateX(0)'; }}
                                    >
                                        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d={icon} />
                                            </svg>
                                        </div>
                                        {label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div style={{ flex: 1.2, minWidth: 200 }}>
                            <h4 style={{ color: C.dim, fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Trusted By</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { emoji: '🛡️', title: 'GIA / IGI Certified', sub: 'Internationally verified gemstones' },
                                    { emoji: '🔒', title: 'Blockchain Secured', sub: 'Tamper-proof transaction records' },
                                    { emoji: '💎', title: 'SLJGA Certified', sub: 'Sri Lanka Gem & Jewellery Authority' },
                                ].map(b => (
                                    <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 10, background: C.goldDim, border: `1px solid rgba(245,158,11,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{b.emoji}</div>
                                        <div>
                                            <div style={{ color: C.text, fontWeight: 700, fontSize: '0.8rem' }}>{b.title}</div>
                                            <div style={{ color: C.dim, fontSize: '0.68rem', marginTop: 1 }}>{b.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom copyright bar */}
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: C.dim, fontSize: '0.78rem', textAlign: 'center' }}>
                            © 2026 <span style={{ color: C.text, fontWeight: 800 }}>Gem<span style={{ color: C.gold }}>Bid</span></span> Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BuyerDashboard;
