import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Clock, ChevronDown, LogOut,
    Heart, Activity, Filter, Eye,
} from 'lucide-react';
import { supabase } from '../../../config/supabase';
import { getAuctions } from '../../auctions/services/auctionsService';
import AuctionCard from '../../auctions/components/AuctionCard';

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
const Navbar = ({ active, setActive, profile, onSignOut }) => {
    const navigate = useNavigate();

    const navLinks = [
        { id: 'auctions', label: 'Live Auctions', icon: Activity },
        { id: 'mybids',   label: 'My Bids',       icon: Clock },
        { id: 'watchlist',label: 'Watchlist',      icon: Heart },
    ];

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

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

            {/* Right side: Profile + Sign Out */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '0.82rem', color: '#fff', flexShrink: 0,
                    }}>{initials}</div>
                    <div style={{ lineHeight: 1.25 }}>
                        <div style={{ color: C.text, fontWeight: 700, fontSize: '0.8rem' }}>{profile?.full_name || 'My Account'}</div>
                        <div style={{ color: C.indigo, fontSize: '0.65rem', fontWeight: 600 }}>🌟 Buyer</div>
                    </div>
                    <ChevronDown size={14} style={{ color: C.dim }} />
                </div>
                <button
                    onClick={onSignOut}
                    title="Sign out"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8,
                        border: `1px solid ${C.border}`, background: 'transparent',
                        color: C.dim, fontSize: '0.8rem', cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = `${C.red}50`; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.dim; e.currentTarget.style.borderColor = C.border; }}
                >
                    <LogOut size={14} />
                </button>
            </div>
        </header>
    );
};



/* ════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
════════════════════════════════════════════════════ */
const BuyerDashboard = () => {
    const navigate = useNavigate();

    const [activePage, setActivePage] = useState('auctions');
    const [search, setSearch] = useState('');

    /* Auth */
    const [user, setUser]       = useState(null);
    const [profile, setProfile] = useState(null);

    /* Auctions data */
    const [auctions, setAuctions]       = useState([]);
    const [auctLoading, setAuctLoading] = useState(false);
    const [auctError, setAuctError]     = useState('');

    /* My bids data */
    const [myBids, setMyBids]           = useState([]);
    const [bidsLoading, setBidsLoading] = useState(false);

    /* ── Auth gate ── */
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) { navigate('/login'); return; }
            setUser(session.user);
            supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
                .then(({ data }) => { if (data) setProfile(data); });
        });
    }, [navigate]);

    /* ── Fetch live auctions ── */
    const fetchAuctions = useCallback(async () => {
        setAuctLoading(true);
        setAuctError('');
        try {
            const res = await getAuctions({ status: 'active', limit: 24 });
            setAuctions(res.data || []);
        } catch {
            setAuctError('Failed to load auctions.');
        } finally {
            setAuctLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activePage === 'auctions') fetchAuctions();
    }, [activePage, fetchAuctions]);

    /* ── Fetch my bids ── */
    const fetchMyBids = useCallback(async () => {
        if (!user) return;
        setBidsLoading(true);
        try {
            const { data, error } = await supabase
                .from('bids')
                .select(`
                    id, amount, created_at,
                    auctions (
                        id, current_price, status, end_time, bid_count,
                        gems ( title, image_url, carat_weight, categories ( name ) )
                    )
                `)
                .eq('bidder_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);
            if (!error) setMyBids(data || []);
        } finally {
            setBidsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (activePage === 'mybids' && user) fetchMyBids();
    }, [activePage, user, fetchMyBids]);

    /* ── Sign out ── */
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    /* ── Filter auctions by search ── */
    const filteredAuctions = auctions.filter(a => {
        if (!search) return true;
        const title = (a.gem?.title || a.gems?.title || '').toLowerCase();
        return title.includes(search.toLowerCase());
    });

    /* ── Bid status helper ── */
    const getBidStatus = (bid) => {
        const auction = bid.auctions;
        if (!auction) return { label: 'Unknown', color: C.dim };
        if (auction.status === 'completed') {
            return bid.amount >= auction.current_price
                ? { label: 'Won ✓',  color: C.green }
                : { label: 'Lost ✗', color: C.red   };
        }
        if (auction.status === 'active') {
            return bid.amount >= auction.current_price
                ? { label: '● Winning', color: C.green }
                : { label: '● Outbid',  color: C.red   };
        }
        return { label: auction.status, color: C.dim };
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text }}>
            <Navbar active={activePage} setActive={setActivePage} profile={profile} onSignOut={handleSignOut} />

            {/* ── Page content ── */}
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px' }}>

                {/* Page header */}
                <div style={{ marginBottom: 36 }}>
                    <div style={{ color: C.gold, fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Buyer Dashboard</div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', color: C.text, margin: 0, lineHeight: 1.1 }}>
                        {activePage === 'auctions' ? 'Live Auctions'
                            : activePage === 'mybids' ? 'My Bid History'
                            : 'My Watchlist'}
                    </h1>
                </div>

                {/* ══ LIVE AUCTIONS ══ */}
                {activePage === 'auctions' && (
                    <>
                        {/* Search bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30, padding: '12px 18px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.gold, fontSize: '0.8rem', fontWeight: 700 }}>
                                <Filter size={14} /> Filter
                            </div>
                            <div style={{ position: 'relative', marginLeft: 'auto' }}>
                                <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.dim }} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search gemstones…"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 14px 8px 32px', color: C.text, fontSize: '0.85rem', outline: 'none', width: 220 }}
                                    onFocus={e => { e.target.style.borderColor = `${C.gold}60`; }}
                                    onBlur={e => { e.target.style.borderColor = C.border; }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
                            <span style={{ fontSize: '1rem', fontWeight: 800 }}>Live Auctions</span>
                            {!auctLoading && <span style={{ fontSize: '0.78rem', color: C.dim, marginLeft: 4 }}>({filteredAuctions.length} active)</span>}
                        </div>

                        {auctLoading ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: C.dim }}>
                                <div style={{ fontSize: '2rem', marginBottom: 12 }}>⟳</div>
                                <div>Loading auctions…</div>
                            </div>
                        ) : auctError ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: C.red }}>
                                <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠</div>
                                <div>{auctError}</div>
                                <button onClick={fetchAuctions} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.gold}`, background: 'transparent', color: C.gold, cursor: 'pointer' }}>Retry</button>
                            </div>
                        ) : filteredAuctions.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                                {filteredAuctions.map(auction => (
                                    <AuctionCard key={auction.id} auction={auction} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: C.dim }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: C.muted }}>No live auctions right now</div>
                                <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Check back soon — gems are added frequently.</div>
                            </div>
                        )}
                    </>
                )}

                {/* ══ MY BIDS ══ */}
                {activePage === 'mybids' && (
                    <>
                        {bidsLoading ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: C.dim }}>
                                <div style={{ fontSize: '2rem', marginBottom: 12 }}>⟳</div>
                                <div>Loading bid history…</div>
                            </div>
                        ) : myBids.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: C.dim }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔨</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: C.muted }}>No bids yet</div>
                                <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Head to Live Auctions and place your first bid!</div>
                                <button onClick={() => setActivePage('auctions')} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0a0d14', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
                                    Browse Auctions
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {myBids.map(bid => {
                                    const auction = bid.auctions;
                                    const gem = auction?.gems;
                                    const status = getBidStatus(bid);
                                    return (
                                        <div
                                            key={bid.id}
                                            onClick={() => auction && navigate(`/auctions/${auction.id}`)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 18,
                                                padding: '18px 22px',
                                                background: 'rgba(13,17,28,0.85)',
                                                border: `1px solid ${C.border}`,
                                                borderRadius: 14,
                                                backdropFilter: 'blur(18px)',
                                                cursor: auction ? 'pointer' : 'default',
                                                transition: 'box-shadow 0.2s, border-color 0.2s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = `${C.gold}30`; }}
                                            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}
                                        >
                                            {/* Gem thumbnail */}
                                            <div style={{ width: 60, height: 60, borderRadius: 10, background: '#070a12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                                                {gem?.image_url
                                                    ? <img src={gem.image_url} alt={gem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : '💎'}
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 800, color: C.text, fontSize: '0.95rem', marginBottom: 2 }}>{gem?.title || 'Gem Auction'}</div>
                                                <div style={{ color: C.dim, fontSize: '0.75rem' }}>
                                                    {[gem?.carat_weight ? `${gem.carat_weight} ct` : null, gem?.categories?.name].filter(Boolean).join(' · ')}
                                                </div>
                                            </div>

                                            {/* My bid */}
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ color: C.dim, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 3 }}>MY BID</div>
                                                <div style={{ color: C.gold, fontWeight: 900, fontSize: '1.05rem' }}>${Number(bid.amount).toLocaleString()}</div>
                                            </div>

                                            {/* Current price */}
                                            {auction && (
                                                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
                                                    <div style={{ color: C.dim, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 3 }}>CURRENT</div>
                                                    <div style={{ color: C.text, fontWeight: 700, fontSize: '0.9rem' }}>${Number(auction.current_price).toLocaleString()}</div>
                                                </div>
                                            )}

                                            {/* Status badge */}
                                            <div style={{ flexShrink: 0, minWidth: 90 }}>
                                                <div style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${status.color}40`, background: `${status.color}12`, color: status.color, fontWeight: 800, fontSize: '0.72rem', textAlign: 'center' }}>
                                                    {status.label}
                                                </div>
                                            </div>

                                            {auction && <Eye size={16} style={{ color: C.dim, flexShrink: 0 }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ══ WATCHLIST (placeholder) ══ */}
                {activePage === 'watchlist' && (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: C.dim }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>♡</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: C.muted }}>Watchlist coming soon</div>
                        <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Save your favourite auctions to track them here.</div>
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
