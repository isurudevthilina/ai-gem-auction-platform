import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, ChevronDown, Home, List, Sparkles, Filter
} from 'lucide-react';
import Countdown from '../../auctions/components/Countdown';
import CreateAuctionModal from '../../auctions/components/CreateAuctionModal';
import { supabase } from '../../../config/supabase';
import { getMyGems, getCategories, createGem } from '../../gems/services/gemsService';

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
const Navbar = ({ active, setActive, onListGem, profile }) => {
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
                    }}>
                        {profile?.full_name
                            ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                            : '?'}
                    </div>
                    <div style={{ lineHeight: 1.25 }}>
                        <div style={{ color: C.text, fontWeight: 700, fontSize: '0.8rem' }}>{profile?.full_name ?? 'Seller'}</div>
                        <div style={{ color: C.green, fontSize: '0.65rem', fontWeight: 600 }}>✓ Verified Seller</div>
                    </div>
                    <ChevronDown size={14} style={{ color: C.dim }} />
                </div>


            </div>
        </header>
    );
};

/* ════════════════════════════════════════════════════
   ADD GEM MODAL  (saves to Supabase `gems` table)
════════════════════════════════════════════════════ */
const AddGemModal = ({ onClose, user, categories = [], onCreated }) => {
    const [form, setForm] = useState({
        title: '', carat_weight: '', buy_now_price: '', description: '', category_id: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!form.title.trim())                                  return setError('Gem name is required.');
        if (!form.carat_weight || parseFloat(form.carat_weight) <= 0) return setError('Valid carat weight required.');
        if (!form.category_id)                                   return setError('Please select a category.');
        if (!user?.id)                                           return setError('You must be logged in to add a gem.');

        setLoading(true);
        try {
            const gem = await createGem({
                title:         form.title.trim(),
                carat_weight:  parseFloat(form.carat_weight),
                buy_now_price: form.buy_now_price ? parseFloat(form.buy_now_price) : null,
                description:   form.description.trim() || null,
                category_id:   form.category_id,
                seller_id:     user.id,
            });
            onCreated?.(gem);
        } catch (err) {
            setError(err?.message ?? 'Failed to add gem. Ensure SQL migrations have been run in Supabase.');
        } finally {
            setLoading(false);
        }
    };

    return (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
    }} onClick={onClose}>
        <form onSubmit={handleSubmit} style={{
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
                <button type="button" onClick={onClose} style={{
                    width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.muted, cursor: 'pointer',
                    fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Gem Name — full width */}
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', color: C.dim, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>GEM NAME *</label>
                    <input
                        type="text" value={form.title} placeholder="e.g. Royal Blue Sapphire"
                        onChange={e => set('title', e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', color: C.text, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => { e.target.style.borderColor = `${C.gold}70`; e.target.style.boxShadow = `0 0 0 3px rgba(245,158,11,0.08)`; }}
                        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                    />
                </div>
                {/* Carat Weight */}
                <div>
                    <label style={{ display: 'block', color: C.dim, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>CARAT WEIGHT *</label>
                    <input
                        type="number" step="0.01" min="0.01" value={form.carat_weight} placeholder="0.00 ct"
                        onChange={e => set('carat_weight', e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', color: C.text, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => { e.target.style.borderColor = `${C.gold}70`; e.target.style.boxShadow = `0 0 0 3px rgba(245,158,11,0.08)`; }}
                        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                    />
                </div>
                {/* Buy Now Price */}
                <div>
                    <label style={{ display: 'block', color: C.dim, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>BUY NOW PRICE ($)</label>
                    <input
                        type="number" step="0.01" min="0" value={form.buy_now_price} placeholder="Optional"
                        onChange={e => set('buy_now_price', e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', color: C.text, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => { e.target.style.borderColor = `${C.gold}70`; e.target.style.boxShadow = `0 0 0 3px rgba(245,158,11,0.08)`; }}
                        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                    />
                </div>
                {/* Category — full width */}
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', color: C.dim, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>CATEGORY *</label>
                    <select
                        value={form.category_id} onChange={e => set('category_id', e.target.value)}
                        style={{ width: '100%', background: '#0a0d14', border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', color: form.category_id ? C.text : C.dim, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                    >
                        <option value="">Select a category…</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                {/* Description — full width */}
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', color: C.dim, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>DESCRIPTION</label>
                    <textarea
                        value={form.description} placeholder="Brief description of the gem (optional)"
                        onChange={e => set('description', e.target.value)} rows={3}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 13px', color: C.text, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
                        onFocus={e => { e.target.style.borderColor = `${C.gold}70`; }}
                        onBlur={e => { e.target.style.borderColor = C.border; }}
                    />
                </div>
            </div>
            {/* Error */}
            {error && (
                <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.8rem' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                <button type="button" onClick={onClose} style={{
                    padding: '10px 22px', borderRadius: 9, border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.muted, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                }}>Cancel</button>
                <button type="submit" disabled={loading} style={{
                    padding: '10px 26px', borderRadius: 9, border: 'none',
                    background: loading ? C.dim : 'linear-gradient(135deg,#f59e0b,#d97706)',
                    color: '#0a0d14', fontSize: '0.82rem', fontWeight: 900,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : goldGlow,
                    letterSpacing: '0.03em', transition: 'all 0.2s',
                }}>{loading ? 'Saving…' : 'LIST GEM ✦'}</button>
            </div>
        </form>
    </div>
    );
};

/* ════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
════════════════════════════════════════════════════ */
const SellerDashboard = () => {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState('listings');
    const [showModal, setShowModal] = useState(false);
    const [showAuctionModal, setShowAuctionModal] = useState(false);
    const [selectedGemForAuction, setSelectedGemForAuction] = useState('');
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    // ── Real data state ──────────────────────────────────────────────────────
    const [user, setUser]             = useState(null);
    const [profile, setProfile]       = useState(null);
    const [gems, setGems]             = useState([]);
    const [categories, setCategories] = useState([]);
    const [gemsLoading, setGemsLoading] = useState(true);

    // ── Load session + gems on mount ─────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                // Not logged in — redirect to login
                navigate('/login');
                return;
            }
            setUser(session.user);

            // Fetch profile for display name
            const { data: prof } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .eq('id', session.user.id)
                .single();
            setProfile(prof);

            // Gems + categories in parallel
            try {
                const [myGems, cats] = await Promise.all([
                    getMyGems(session.user.id),
                    getCategories(),
                ]);
                setGems(myGems);
                setCategories(cats);
            } catch (err) {
                console.error('Failed to load gems/categories:', err);
            } finally {
                setGemsLoading(false);
            }
        };
        init();
    }, [navigate]);

    const categoryNames = ['All', ...categories.map(c => c.name)];

    const filtered = gems.filter(g => {
        const matchCat   = filter === 'All' || g.category?.name === filter;
        const matchSearch = (g.title ?? '').toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text }}>
            {/* ── Navbar ── */}
            <Navbar active={activePage} setActive={setActivePage} onListGem={() => setShowModal(true)} profile={profile} />

            {/* ── Page content ── */}
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 32px' }}>

                {/* Page title */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', color: C.text, margin: 0 }}>
                        My Gem Listings
                    </h1>
                    <p style={{ color: C.muted, fontSize: '0.85rem', marginTop: 6 }}>
                        {gemsLoading ? 'Loading…' : `${filtered.length} gems · track bids & manage your active auctions`}
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
                            {categoryNames.map(c => (
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
                {gemsLoading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: C.dim }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'spin 1.2s linear infinite' }}>⟳</div>
                        <div style={{ fontSize: '0.9rem', color: C.muted }}>Loading your gems…</div>
                    </div>
                ) : filtered.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 24,
                    }}>
                        {filtered.map(gem => {
                            const statusColor = gem.status === 'listed' ? C.green : gem.status === 'sold' ? C.indigo : C.dim;
                            const statusLabel = gem.status === 'listed' ? '● Listed' : gem.status === 'sold' ? '✓ Sold' : '○ Draft';
                            return (
                                <div key={gem.id} style={{
                                    background: 'rgba(13,17,28,0.85)',
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 14,
                                    backdropFilter: 'blur(18px)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'box-shadow 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,158,11,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    {/* Image */}
                                    <div style={{ height: 160, background: '#070a12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', position: 'relative', overflow: 'hidden' }}>
                                        {gem.image_url
                                            ? <img src={gem.image_url} alt={gem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : '💎'
                                        }
                                        {/* Status badge */}
                                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.75)', border: `1px solid ${statusColor}50`, borderRadius: 20, padding: '3px 10px', color: statusColor, fontSize: '0.65rem', fontWeight: 700 }}>
                                            {statusLabel}
                                        </div>
                                        {/* Category badge */}
                                        {gem.category?.name && (
                                            <div style={{ position: 'absolute', top: 10, right: 10, background: C.goldDim, border: '1px solid rgba(245,158,11,0.25)', borderRadius: 20, padding: '3px 10px', color: C.gold, fontSize: '0.65rem', fontWeight: 700 }}>
                                                {gem.category.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div>
                                            <div style={{ color: C.text, fontWeight: 800, fontSize: '1rem', marginBottom: 3 }}>{gem.title}</div>
                                            <div style={{ color: C.dim, fontSize: '0.75rem' }}>
                                                {[gem.carat_weight ? `${gem.carat_weight} ct` : null, gem.color, gem.clarity].filter(Boolean).join(' · ')}
                                            </div>
                                        </div>

                                        {gem.buy_now_price && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(245,158,11,0.05)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.12)' }}>
                                                <span style={{ color: C.dim, fontSize: '0.72rem', fontWeight: 600 }}>BUY NOW</span>
                                                <span style={{ color: C.gold, fontWeight: 800, fontSize: '0.95rem' }}>${Number(gem.buy_now_price).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {/* Countdown if auction_end_time present */}
                                        {gem.auction_end_time && (
                                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                                                <div style={{ color: C.dim, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>AUCTION ENDS</div>
                                                <Countdown endTime={gem.auction_end_time} compact />
                                            </div>
                                        )}

                                        {/* Action */}
                                        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                                            {gem.auction_id ? (
                                                <button
                                                    onClick={() => navigate(`/auctions/${gem.auction_id}`)}
                                                    style={{ width: '100%', padding: '10px 0', borderRadius: 9, border: `1px solid rgba(99,102,241,0.4)`, background: 'rgba(99,102,241,0.1)', color: C.indigo, fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.18)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                                >
                                                    👁 View Live Auction
                                                </button>
                                            ) : gem.status !== 'sold' ? (
                                                <button
                                                    onClick={() => { setSelectedGemForAuction(gem.id); setShowAuctionModal(true); }}
                                                    style={{ width: '100%', padding: '10px 0', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0a0d14', fontSize: '0.82rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 18px rgba(245,158,11,0.28)', letterSpacing: '0.02em', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(245,158,11,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(245,158,11,0.28)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                >
                                                    🔨 Start Auction
                                                </button>
                                            ) : (
                                                <div style={{ width: '100%', textAlign: 'center', color: C.dim, fontSize: '0.82rem', fontWeight: 600, padding: '10px 0' }}>● Sold</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: C.dim }}>
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>{search || filter !== 'All' ? '🔍' : '💎'}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: C.muted }}>
                            {search || filter !== 'All' ? 'No gems match your filter' : 'No gems listed yet'}
                        </div>
                        <div style={{ fontSize: '0.82rem', marginTop: 4 }}>
                            {search || filter !== 'All' ? 'Try changing your search or filter.' : 'Click "List Gem" above to add your first gemstone.'}
                        </div>
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

            {/* Modals */}
            {showModal && (
                <AddGemModal
                    onClose={() => setShowModal(false)}
                    user={user}
                    categories={categories}
                    onCreated={(gem) => {
                        setGems(prev => [gem, ...prev]);
                        setShowModal(false);
                    }}
                />
            )}
            {showAuctionModal && (
                <CreateAuctionModal
                    sellerGems={gems.map(g => ({ id: g.id, title: g.title }))}
                    preSelectedGemId={selectedGemForAuction}
                    onClose={() => { setShowAuctionModal(false); setSelectedGemForAuction(''); }}
                    onCreated={(auction) => {
                        setShowAuctionModal(false);
                        setSelectedGemForAuction('');
                        navigate(`/auctions/${auction.id}`);
                    }}
                />
            )}

            {/* Quick-access Create Auction FAB */}
            <button
                onClick={() => setShowAuctionModal(true)}
                title="Start Live Auction"
                style={{
                    position:   'fixed',
                    bottom:     28,
                    right:      28,
                    zIndex:     80,
                    width:      54,
                    height:     54,
                    borderRadius:'50%',
                    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                    border:     'none',
                    boxShadow:  '0 6px 24px rgba(245,158,11,0.5)',
                    cursor:     'pointer',
                    display:    'flex',
                    alignItems: 'center',
                    justifyContent:'center',
                    transition: 'all 0.2s',
                    color:      '#0a0d14',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.12)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(245,158,11,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(245,158,11,0.5)'; }}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                    <path d="m16 16 6-6" />
                    <path d="m8 8 6-6" />
                    <path d="m9 7 8 8" />
                    <path d="m21 11-8-8" />
                </svg>
            </button>
        </div>
    );
};

export default SellerDashboard;
