import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Gavel, DollarSign, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getMyGems } from '../../gems/services/gemsService';
import { getAuctions, getBids } from '../../auctions/services/auctionsService';
import { useCurrency } from '../../../context/CurrencyContext';
import { isAuctionLive } from '../../auctions/utils/auctionState';

/* ─── Design tokens ─── */
const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

/* ─────────────────────────────────────────────────── */
const SellerStatus = ({ profile }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    const [gems, setGems] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [recentBids, setRecentBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [gemsRes, auctionsRes] = await Promise.all([
                    getMyGems(),
                    getAuctions({ seller_id: user?.id }),
                ]);
                const g = gemsRes?.data || [];
                const a = auctionsRes?.data || [];
                setGems(g);
                setAuctions(a);

                // Fetch recent bids from active auctions
                const active = a.filter(au => isAuctionLive(au)).slice(0, 5);
                if (active.length > 0) {
                    const bidResults = await Promise.all(
                        active.map(au => getBids(au.id, 1, 5).catch(() => ({ data: [] })))
                    );
                    const allBids = bidResults
                        .flatMap((r, i) => (r.data || []).map(b => ({ ...b, auction: active[i] })))
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .slice(0, 10);
                    setRecentBids(allBids);
                }
            } catch (err) {
                console.error('SellerStatus load error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) load();
    }, [user?.id]);

    const activeAuctions = auctions.filter(a => isAuctionLive(a));
    const completedWithWinner = auctions.filter(a => a.status === 'completed' && a.winner_id);
    const revenue = completedWithWinner.reduce((sum, a) => sum + Number(a.current_price || 0), 0);
    const soldGems = gems.filter(g => g.status === 'sold');

    const stats = [
        { label: 'Total Listings', value: gems.length, sub: 'gems listed', Icon: Package, color: C.sapphire },
        { label: 'Active Auctions', value: activeAuctions.length, sub: 'live right now', Icon: Gavel, color: C.gold, pulse: activeAuctions.length > 0 },
        { label: 'Revenue Earned', value: formatPrice(revenue), sub: 'from completed auctions', Icon: DollarSign, color: C.green },
        { label: 'Sold Gems', value: soldGems.length, sub: 'gems sold', Icon: CheckCircle, color: C.sapphire },
    ];

    const timeAgo = (d) => {
        const ms = Date.now() - new Date(d).getTime();
        const mins = Math.floor(ms / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {[1,2,3,4].map(i => (
                    <div key={i} style={{
                        background: C.white, borderRadius: 14, padding: 24,
                        border: `1px solid ${C.border}`, height: 120,
                        animation: 'shimmer 1.5s infinite',
                    }} />
                ))}
                <style>{`@keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
            </div>
        );
    }

    return (
        <div>
            {/* ── Stats row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
                {stats.map(({ label, value, sub, Icon, color, pulse }) => (
                    <div key={label} style={{
                        background: C.white, borderRadius: 14, padding: 24,
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Icon circle (top-right) */}
                        <div style={{
                            position: 'absolute', top: 16, right: 16,
                            width: 40, height: 40, borderRadius: '50%',
                            background: C.goldLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Icon size={18} color={color} strokeWidth={2} />
                        </div>
                        <div style={{ fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                            {label}
                        </div>
                        <div style={{ fontFamily: DISPLAY, fontSize: '2rem', fontWeight: 700, color: C.sapphire, lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {value}
                            {pulse && (
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%', background: C.green,
                                    display: 'inline-block', animation: 'pulse 1.5s infinite',
                                }} />
                            )}
                        </div>
                        <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, marginTop: 4 }}>{sub}</div>
                    </div>
                ))}
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }`}</style>

            {/* ── Recent Bids panel ── */}
            <div style={{
                background: C.white, borderRadius: 14, padding: 28,
                border: `1px solid ${C.border}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                marginBottom: 32,
            }}>
                <h3 style={{ fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 700, color: C.text, margin: '0 0 18px' }}>
                    Recent Bid Activity
                </h3>
                {recentBids.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: C.faint, fontFamily: BODY, fontSize: '0.88rem' }}>
                        No active auction bids yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {recentBids.map((bid, i) => {
                            const bidderName = bid.bidder?.full_name || 'Anonymous';
                            const bidderInitials = bidderName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            const gemTitle = bid.auction?.gem?.title || 'Gem';
                            return (
                                <div key={bid.id || i} style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '10px 14px', borderRadius: 10,
                                    background: i === 0 ? C.goldLight : 'transparent',
                                    border: `1px solid ${i === 0 ? 'rgba(196,137,42,0.15)' : C.border}`,
                                }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 34, height: 34, borderRadius: '50%',
                                        background: C.sapphire, color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.68rem', fontWeight: 700, fontFamily: BODY, flexShrink: 0,
                                    }}>
                                        {bidderInitials}
                                    </div>
                                    {/* Bidder + gem */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {bidderName}
                                        </div>
                                        <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {gemTitle}
                                        </div>
                                    </div>
                                    {/* Amount + time */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontFamily: DISPLAY, fontSize: '0.9rem', fontWeight: 700, color: C.gold }}>
                                            {formatPrice(bid.amount)}
                                        </div>
                                        <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint }}>
                                            {timeAgo(bid.created_at)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Quick Actions ── */}
            <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => navigate('/gems/new')} style={{
                    padding: '12px 28px', borderRadius: 10, border: 'none',
                    background: C.gold, color: '#fff', fontFamily: BODY,
                    fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'opacity 0.15s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >List a New Gem</button>
                <button onClick={() => navigate('/auctions/new')} style={{
                    padding: '12px 28px', borderRadius: 10,
                    border: `2px solid ${C.sapphire}`, background: 'transparent',
                    color: C.sapphire, fontFamily: BODY,
                    fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.sapphire; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.sapphire; }}
                >Create an Auction</button>
            </div>
        </div>
    );
};

export default SellerStatus;
