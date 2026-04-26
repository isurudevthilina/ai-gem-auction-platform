import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TrendingUp, Gavel, Heart, ShoppingBag, Clock, Eye, ArrowRight,
    Star,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { useCurrency } from '../../../context/CurrencyContext';

/* ─── Design tokens ─── */
const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const SERIF = "'Cormorant Garamond','Georgia',serif";
const BODY = "'Jost','Inter',sans-serif";

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon: Icon, color, to, loading }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
        <motion.div
            whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(26,77,140,0.10)' }}
            style={{
                background: C.white, borderRadius: 14,
                border: `1px solid ${C.border}`, padding: '24px 22px',
                transition: 'box-shadow 0.2s',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${color}14`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={18} style={{ color }} />
                </div>
                <span style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, fontWeight: 600 }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: '1.8rem', fontWeight: 700, color: C.text }}>
                    {loading ? '—' : value}
                </div>
                <ArrowRight size={14} style={{ color: C.faint }} />
            </div>
        </motion.div>
    </Link>
);

/* ─── Recent Bid Row ─── */
const BidRow = ({ bid }) => {
    const { formatPrice } = useCurrency();
    const a = bid.auction || bid.auctions;
    const gem = a?.gem || a?.gems;
    const imgUrl = Array.isArray(gem?.images) ? gem.images.find(u => !u.startsWith('model:')) : null;

    const getStatus = () => {
        if (!a) return { label: 'Unknown', color: C.faint };
        if (a.status === 'completed') {
            return bid.is_winning ? { label: 'Won', color: C.green } : { label: 'Lost', color: C.red };
        }
        if (a.status === 'active') {
            return bid.is_winning ? { label: 'Winning', color: C.green } : { label: 'Outbid', color: C.red };
        }
        return { label: a.status, color: C.faint };
    };
    const status = getStatus();

    return (
        <Link
            to={a ? `/auctions/${a.id}` : '#'}
            style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px', background: C.white,
                border: `1px solid ${C.border}`, borderRadius: 12,
                textDecoration: 'none', transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,77,140,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
            <div style={{
                width: 46, height: 46, borderRadius: 10, background: C.bg,
                border: `1px solid ${C.border}`, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                {imgUrl
                    ? <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '1.3rem' }}>💎</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: BODY, fontWeight: 700, color: C.text, fontSize: '0.88rem' }}>
                    {gem?.title || 'Gem Auction'}
                </div>
                <div style={{ color: C.muted, fontSize: '0.72rem', marginTop: 2 }}>
                    {new Date(bid.created_at).toLocaleDateString()}
                </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: C.gold, fontWeight: 800, fontSize: '0.95rem', fontFamily: BODY }}>
                    {formatPrice(bid.amount)}
                </div>
            </div>
            <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                border: `1px solid ${status.color}40`, background: `${status.color}12`,
                color: status.color, fontWeight: 700, fontSize: '0.70rem', flexShrink: 0,
            }}>
                {status.label}
            </span>
            {a && <Eye size={14} style={{ color: C.faint, flexShrink: 0 }} />}
        </Link>
    );
};

/* ════════════════════════════════════════════════════
   BUYER OVERVIEW PAGE
════════════════════════════════════════════════════ */
export default function BuyerOverviewPage() {
    const { user } = useAuth();
    const { formatPrice } = useCurrency();

    const [stats, setStats] = useState({
        activeBids: 0,
        auctionsWon: 0,
        watchlistCount: 0,
        purchaseCount: 0,
        reviewsCount: 0,
        walletBalance: 0,
    });
    const [recentBids, setRecentBids] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        setLoading(true);
        Promise.allSettled([
            api.get('/bids/my-history', { params: { limit: 100 } }).then(r => r.data),
            api.get('/watchlist').then(r => r.data),
            api.get('/transactions', { params: { role: 'buyer', limit: 100 } }).then(r => r.data),
            api.get('/reviews/my-reviews').then(r => r.data),
            api.get('/wallet/me').then(r => r.data),
        ]).then(([bidsR, watchR, txR, reviewsR, walletR]) => {
            const bidsBody = bidsR.status === 'fulfilled' ? bidsR.value : null;
            const watchBody = watchR.status === 'fulfilled' ? watchR.value : null;
            const txBody = txR.status === 'fulfilled' ? txR.value : null;
            const reviewsBody = reviewsR.status === 'fulfilled' ? reviewsR.value : null;
            const walletBody = walletR?.status === 'fulfilled' ? walletR.value : null;

            const bidsRaw = bidsBody?.data || [];
            const watchRaw = watchBody?.data || [];
            const txRaw = txBody?.data || [];
            const reviewsRaw = reviewsBody?.data || [];
            const walletRaw = walletBody?.data || null;

            // Handle both paginated { data: [], total } and plain array responses
            const bids = Array.isArray(bidsRaw) ? bidsRaw : (bidsRaw.data || []);
            const watchItems = Array.isArray(watchRaw) ? watchRaw : (watchRaw.data || []);
            const txns = Array.isArray(txRaw) ? txRaw : (txRaw.data || []);
            const myReviews = Array.isArray(reviewsRaw) ? reviewsRaw : (reviewsRaw.data || []);

            const activeBids = bids.filter(b => {
                const a = b.auction || b.auctions;
                return a?.status === 'active' && b.is_winning;
            }).length;
            const auctionsWon = bids.filter(b => {
                const a = b.auction || b.auctions;
                return a?.status === 'completed' && b.is_winning;
            }).length;

            setStats({
                activeBids,
                auctionsWon,
                watchlistCount: watchItems.length,
                purchaseCount: txns.length,
                reviewsCount: myReviews.length,
                walletBalance: Number(walletRaw?.available_balance || 0),
            });
            setRecentBids(bids.slice(0, 5));
        }).finally(() => setLoading(false));
    }, [user?.id]);

    const displayName = user?.full_name || 'there';

    return (
        <div style={{ minHeight: 'calc(100vh - 88px)', background: C.bg, fontFamily: BODY }}>
            <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 64px' }}>

                {/* ── Greeting ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 style={{
                        fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.5rem',
                        color: C.sapphire, margin: 0, letterSpacing: '0.03em',
                    }}>
                        Welcome back, {displayName.split(' ')[0]}
                    </h1>
                    <p style={{ fontFamily: SERIF, fontSize: '1.05rem', color: C.muted, margin: '6px 0 32px' }}>
                        Here's a snapshot of your activity.
                    </p>
                </motion.div>

                {/* ── Stats Grid ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}
                >
                    <StatCard label="Active Bids" value={stats.activeBids} icon={TrendingUp} color={C.sapphire} to="/bid-history" loading={loading} />
                    <StatCard label="Auctions Won" value={stats.auctionsWon} icon={Gavel} color={C.green} to="/transactions" loading={loading} />
                    <StatCard label="Watchlist" value={stats.watchlistCount} icon={Heart} color={C.gold} to="/watchlist" loading={loading} />
                    <StatCard label="Purchases" value={stats.purchaseCount} icon={ShoppingBag} color={C.sapphire} to="/transactions" loading={loading} />
                    <StatCard label="Ratings & Reviews" value={stats.reviewsCount} icon={Star} color={C.gold} to="/transactions" loading={loading} />
                    <StatCard label="Wallet Balance" value={loading ? '—' : formatPrice(stats.walletBalance)} icon={TrendingUp} color={C.gold} to="/wallet/top-up" loading={loading} />
                </motion.div>

                {/* ── Recent Bids ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    style={{ marginTop: 40 }}
                >
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 16,
                    }}>
                        <h2 style={{
                            margin: 0, fontFamily: DISPLAY, fontWeight: 700,
                            fontSize: '1.1rem', color: C.text, letterSpacing: '0.02em',
                        }}>
                            Recent Bids
                        </h2>
                        <Link to="/bid-history" style={{
                            fontFamily: BODY, fontSize: '0.8rem', fontWeight: 600,
                            color: C.gold, textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            View All <ArrowRight size={13} />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted, fontSize: '0.9rem' }}>
                            Loading…
                        </div>
                    ) : recentBids.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '48px 0',
                            background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
                        }}>
                            <Clock size={40} style={{ color: C.faint, marginBottom: 10 }} />
                            <div style={{ fontFamily: SERIF, fontSize: '1rem', color: C.text }}>No bids yet</div>
                            <div style={{ color: C.muted, fontSize: '0.82rem', marginTop: 4 }}>
                                Head to <Link to="/auctions" style={{ color: C.gold, fontWeight: 600 }}>Live Auctions</Link> and place your first bid!
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {recentBids.map(bid => <BidRow key={bid.id} bid={bid} />)}
                        </div>
                    )}
                </motion.div>

                {/* ── Quick Links ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    style={{
                        marginTop: 36, display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14,
                    }}
                >
                    {[
                        { to: '/auctions', label: 'Browse Auctions', icon: Gavel },
                        { to: '/gems', label: 'Discover Gems', icon: Heart },
                        { to: '/watchlist', label: 'My Watchlist', icon: Eye },
                        { to: '/transactions', label: 'Reviews & Ratings', icon: Star },
                    ].map(({ to, label, icon: Icon }) => (
                        <Link key={to} to={to} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '14px 18px', background: C.white,
                            border: `1px solid ${C.border}`, borderRadius: 12,
                            textDecoration: 'none', transition: 'border-color 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                        >
                            <Icon size={16} style={{ color: C.sapphire }} />
                            <span style={{ fontFamily: BODY, fontSize: '0.84rem', fontWeight: 600, color: C.text }}>{label}</span>
                            <ArrowRight size={13} style={{ color: C.faint, marginLeft: 'auto' }} />
                        </Link>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
