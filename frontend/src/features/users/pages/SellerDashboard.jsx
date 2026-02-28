import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Clock, CheckCircle, ChevronDown, LogOut,
    Home, List, Sparkles, Filter
} from 'lucide-react';
import GemCard from '../../../shared/components/GemCard';

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

const goldGlow = '0 0 20px rgba(245,158,11,0.28)';
const glassCard = {
    background: 'rgba(13,17,28,0.85)',
    border: `1px solid ${C.border}`,
    borderRadius: '14px',
    backdropFilter: 'blur(18px)',
};

/* ════════════════════════════════════════════════════
   TOP NAVBAR (replaces sidebar)
════════════════════════════════════════════════════ */
const Navbar = ({ active, setActive, onListGem }) => {
    const navigate = useNavigate();

    const navLinks = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'predict', label: 'Predict Price', icon: Sparkles },
        { id: 'listings', label: 'My Listings', icon: List },
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

            {/* Right side: List Gem CTA + Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <button onClick={onListGem} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 18px',
                    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                    border: 'none', borderRadius: 9,
                    color: '#0a0d14', fontWeight: 800, fontSize: '0.82rem',
                    cursor: 'pointer', boxShadow: goldGlow, transition: 'all 0.2s', letterSpacing: '0.01em',
                }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(245,158,11,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = goldGlow; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    <Plus size={15} strokeWidth={3} /> List Gem
                </button>

                {/* Divider */}
                <div style={{ width: 1, height: 28, background: C.border }} />

                {/* Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#f59e0b,#ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '0.82rem', color: '#fff', flexShrink: 0,
                    }}>AS</div>
                    <div style={{ lineHeight: 1.25 }}>
                        <div style={{ color: C.text, fontWeight: 700, fontSize: '0.8rem' }}>Amara Silva</div>
                        <div style={{ color: C.green, fontSize: '0.65rem', fontWeight: 600 }}>✓ Verified Seller</div>
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
    { id: 1, name: 'Royal Blue Sapphire', carat: 2.5, bid: 12500, buyNow: 15000, status: 'Active', ends: '12h 30m', category: 'Sapphire', color: '#3b82f6', emoji: '💎' },
    { id: 2, name: 'Pigeon Blood Ruby', carat: 1.8, bid: 28000, buyNow: 32000, status: 'Active', ends: '04h 15m', category: 'Ruby', color: '#ef4444', emoji: '🔴' },
    { id: 3, name: 'Colombian Emerald', carat: 3.2, bid: 18500, buyNow: 22000, status: 'Active', ends: '1d 08h', category: 'Emerald', color: '#10b981', emoji: '💚' },
    { id: 4, name: 'Fancy Pink Diamond', carat: 0.9, bid: 45000, buyNow: 55000, status: 'Active', ends: '06h 45m', category: 'Diamond', color: '#ec4899', emoji: '💠' },
    { id: 5, name: 'Kashmir Sapphire', carat: 1.5, bid: 35000, buyNow: 40000, status: 'Upcoming', ends: '2d 04h', category: 'Sapphire', color: '#6366f1', emoji: '🔵' },
    { id: 6, name: 'Paraiba Tourmaline', carat: 4.1, bid: 18000, buyNow: 21000, status: 'Active', ends: '18h 20m', category: 'Tourmaline', color: '#14b8a6', emoji: '🟢' },
];



/* ════════════════════════════════════════════════════
   ADD GEM MODAL
════════════════════════════════════════════════════ */
const AddGemModal = ({ onClose }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
    }} onClick={onClose}>
        <div style={{
            width: '100%', maxWidth: 580,
            background: '#0f1220',
            border: `1px solid rgba(245,158,11,0.25)`,
            borderRadius: 20, padding: 32,
            boxShadow: `0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(245,158,11,0.08)`,
            position: 'relative', overflow: 'hidden',
        }} onClick={e => e.stopPropagation()}>
            {/* Glow */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(245,158,11,0.05)', filter: 'blur(40px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                <div>
                    <div style={{ color: C.text, fontWeight: 900, fontSize: '1.2rem' }}>List a New Gem</div>
                    <div style={{ color: C.muted, fontSize: '0.75rem', marginTop: 2 }}>Enter your gemstone details to create a listing</div>
                </div>
                <button onClick={onClose} style={{
                    width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.muted, cursor: 'pointer',
                    fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                    { label: 'GEM NAME', placeholder: 'e.g. Royal Blue Sapphire', type: 'text' },
                    { label: 'CARAT WEIGHT', placeholder: '0.00 ct', type: 'number' },
                    { label: 'STARTING BID ($)', placeholder: '0', type: 'number' },
                    { label: 'BUY NOW ($)', placeholder: '0', type: 'number' },
                ].map(f => (
                    <div key={f.label}>
                        <label style={{ display: 'block', color: C.dim, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
                        <input type={f.type} placeholder={f.placeholder} style={{
                            width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                            borderRadius: 9, padding: '10px 13px', color: C.text, fontSize: '0.85rem',
                            outline: 'none', boxSizing: 'border-box',
                        }}
                            onFocus={e => { e.target.style.borderColor = `${C.gold}70`; e.target.style.boxShadow = `0 0 0 3px rgba(245,158,11,0.08)`; }}
                            onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                ))}
                <div>
                    <label style={{ display: 'block', color: C.dim, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>CATEGORY</label>
                    <select style={{ width: '100%', background: '#0a0d14', border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', color: C.text, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                        {['Sapphire', 'Ruby', 'Emerald', 'Diamond', 'Tourmaline'].map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', color: C.dim, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>AUCTION DURATION</label>
                    <select style={{ width: '100%', background: '#0a0d14', border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', color: C.text, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                        {['24 Hours', '48 Hours', '72 Hours', '1 Week'].map(d => <option key={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            {/* Dropzone */}
            <div style={{
                marginTop: 16, border: `2px dashed rgba(245,158,11,0.25)`, borderRadius: 12,
                padding: '26px', textAlign: 'center', cursor: 'pointer', background: 'rgba(245,158,11,0.03)',
                transition: 'all 0.2s',
            }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.gold}50`; e.currentTarget.style.background = 'rgba(245,158,11,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)'; e.currentTarget.style.background = 'rgba(245,158,11,0.03)'; }}
            >
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📁</div>
                <div style={{ color: C.muted, fontSize: '0.8rem', fontWeight: 600 }}>
                    Drop gem images here or <span style={{ color: C.gold }}>click to browse</span>
                </div>
                <div style={{ color: C.dim, fontSize: '0.68rem', marginTop: 4 }}>High-resolution PNG or JPG · max 10 MB each</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                <button onClick={onClose} style={{
                    padding: '10px 22px', borderRadius: 9, border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.muted, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                }}>Cancel</button>
                <button style={{
                    padding: '10px 26px', borderRadius: 9, border: 'none',
                    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                    color: '#0a0d14', fontSize: '0.82rem', fontWeight: 900,
                    cursor: 'pointer', boxShadow: goldGlow, letterSpacing: '0.03em',
                    transition: 'all 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(245,158,11,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = goldGlow; e.currentTarget.style.transform = 'translateY(0)'; }}
                >LIST GEM ✦</button>
            </div>
        </div>
    </div>
);

/* ════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
════════════════════════════════════════════════════ */
const SellerDashboard = () => {
    const [activePage, setActivePage] = useState('listings');
    const [showModal, setShowModal] = useState(false);
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
            <Navbar active={activePage} setActive={setActivePage} onListGem={() => setShowModal(true)} />

            {/* ── Page content ── */}
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 32px' }}>

                {/* Page title */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', color: C.text, margin: 0 }}>
                        My Gem Listings
                    </h1>
                    <p style={{ color: C.muted, fontSize: '0.85rem', marginTop: 6 }}>
                        {filtered.length} gems · track bids &amp; manage your active auctions
                    </p>
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
                            <Filter size={14} /> Filter by
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

                    {/* Search — right side of filter bar (picture 3 position) */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search gems…"
                            style={{
                                background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
                                borderRadius: 9, padding: '7px 14px 7px 32px',
                                color: C.text, fontSize: '0.82rem', outline: 'none', width: 200,
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => { e.target.style.borderColor = `${C.gold}60`; }}
                            onBlur={e => { e.target.style.borderColor = C.border; }}
                        />
                    </div>
                </div>

                {/* ── Gem auction cards grid ── */}
                {filtered.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                                    isVerified: gem.status === 'Active' || gem.status === 'Ending'
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
                marginTop: 20,
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

            {/* Modal */}
            {showModal && <AddGemModal onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default SellerDashboard;
