import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import BidPanel from '../components/BidPanel';
import LiveBidFeed from '../components/LiveBidFeed';
import Countdown from '../components/Countdown';
import useAuction from '../hooks/useAuction';
import useLiveBids from '../hooks/useLiveBids';
import useCountdown from '../hooks/useCountdown';
import RatingSummary from '../../reviews/components/RatingSummary';

const C = {
    bg:        '#F0EDE8',
    white:     '#FFFFFF',
    sapphire:  '#1A4D8C',
    gold:      '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)',
    green:     '#16a34a',
    red:       '#B91C1C',
    indigo:    '#6366f1',
    text:      '#1A1A2E',
    muted:     '#6B6B7B',
    faint:     '#9A9AAB',
    border:    '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond', serif";
const DISPLAY = "'Cinzel', serif";
const BODY    = "'Jost', 'Inter', sans-serif";

/* Gem SVG fallback (no emoji) */
const GemSvgFallback = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
        <path d="M6 3h12l4 6-10 13L2 9z" />
        <path d="M11 3l1 10" /><path d="M2 9h20" />
        <path d="M6 3l5 6" /><path d="M18 3l-5 6" />
    </svg>
);

const Detail = ({ label, value }) => (
    value ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: C.faint, fontSize: '0.67rem', fontFamily: DISPLAY, fontWeight: 600, letterSpacing: '0.08em' }}>{label}</span>
            <span style={{ color: C.text, fontSize: '0.88rem', fontFamily: BODY, fontWeight: 600 }}>{value}</span>
        </div>
    ) : null
);

/* Outbid toast */
const OutbidToast = ({ visible, onClose }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                style={{
                    position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 24px', borderRadius: 10,
                    background: C.white, border: `1px solid rgba(185,28,28,0.25)`,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: C.red }}>You've been outbid!</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </motion.div>
        )}
    </AnimatePresence>
);

const LiveAuctionPage = () => {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const { user }     = useAuth();
    const { auction, loading, error } = useAuction(id);
    const { bids, isConnected }       = useLiveBids(id, auction?.recent_bids);
    const countdown = useCountdown(auction?.end_time);

    const gem    = auction?.gem    || {};
    const seller = auction?.seller || {};

    /* ── Outbid detection ── */
    const [outbidVisible, setOutbidVisible] = useState(false);
    const wasWinningRef = useRef(false);

    useEffect(() => {
        if (!user?.id || !bids || bids.length === 0) return;
        const topBid = bids[0];
        const currentlyWinning = topBid?.bidder_id === user.id;

        // If we were winning and now we're not, show outbid toast
        if (wasWinningRef.current && !currentlyWinning) {
            setOutbidVisible(true);
            setTimeout(() => setOutbidVisible(false), 5000);
        }
        wasWinningRef.current = currentlyWinning;
    }, [bids, user?.id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: C.muted, fontFamily: BODY, fontSize: '1rem' }}>Loading auction…</div>
            </div>
        );
    }

    if (error || !auction) {
        return (
            <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div style={{ color: C.red, fontFamily: BODY, fontSize: '1rem' }}>{error || 'Auction not found.'}</div>
                <button
                    onClick={() => navigate('/auctions')}
                    style={{ background: C.goldLight, border: '1px solid rgba(196,137,42,0.25)', borderRadius: 8, color: C.gold, fontFamily: BODY, fontWeight: 600, padding: '8px 20px', cursor: 'pointer' }}
                >Back to Auctions</button>
            </div>
        );
    }

    const noBids    = (auction.bid_count || 0) === 0;
    const isActive  = auction.status === 'active' && !countdown.expired;
    const coverImage = gem.images?.find(u => !u.startsWith('model:'));

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: BODY }}>
            <OutbidToast visible={outbidVisible} onClose={() => setOutbidVisible(false)} />

            {/* Subtle decorative gradient */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                {[
                    { color: 'rgba(26,77,140,0.04)',  top: '0%',   left: '0%',  w: 600, h: 400 },
                    { color: 'rgba(196,137,42,0.04)', bottom: '0%', right: '0%', w: 500, h: 400 },
                ].map((orb, i) => (
                    <div key={i} style={{
                        position: 'absolute', ...orb,
                        width: orb.w, height: orb.h,
                        background: orb.color, borderRadius: '50%', filter: 'blur(80px)',
                    }} />
                ))}
            </div>

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 60px', position: 'relative', zIndex: 1 }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: '0.8rem', fontFamily: BODY, color: C.faint }}>
                    <span style={{ cursor: 'pointer', color: C.muted }} onClick={() => navigate('/auctions')}>Auctions</span>
                    <span style={{ color: C.faint }}>›</span>
                    <span style={{ color: C.text }}>{gem.title || 'Auction'}</span>
                </div>

                {/* Main layout: left col (gem info) + right col (bid panel) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 28, alignItems: 'start' }}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Status + title header */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                                {isActive && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)',
                                        borderRadius: 20, padding: '4px 12px',
                                    }}>
                                        <span style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: C.green, boxShadow: `0 0 6px ${C.green}`,
                                            animation: 'pulse 1.5s infinite',
                                        }} />
                                        <span style={{ color: C.green, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
                                    </div>
                                )}
                                {auction.status === 'completed' && (
                                    <span style={{ background: 'rgba(26,77,140,0.08)', border: '1px solid rgba(26,77,140,0.2)', borderRadius: 20, padding: '4px 12px', color: C.sapphire, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 700 }}>COMPLETED</span>
                                )}
                                {auction.status === 'cancelled' && (
                                    <span style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.18)', borderRadius: 20, padding: '4px 12px', color: C.red, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 700 }}>CANCELLED</span>
                                )}
                                {gem.category?.name && (
                                    <span style={{ background: C.goldLight, border: '1px solid rgba(196,137,42,0.20)', borderRadius: 20, padding: '4px 12px', color: C.gold, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 600 }}>{gem.category.name}</span>
                                )}
                            </div>

                            <h1 style={{ fontSize: '1.8rem', fontFamily: SERIF, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2, color: C.text }}>
                                {gem.title || 'Gem Auction'}
                            </h1>
                            <div style={{ color: C.muted, fontSize: '0.85rem', fontFamily: BODY, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <span>By {seller.full_name || 'Seller'}</span>
                                <span style={{ color: C.faint }}>·</span>
                                <span>{auction.bid_count || 0} bid{auction.bid_count !== 1 ? 's' : ''}</span>
                                {!noBids && <><span style={{ color: C.faint }}>·</span><span>Current: <strong style={{ color: C.gold }}>${Number(auction.current_price).toLocaleString()}</strong></span></>}
                            </div>
                        </motion.div>

                        {/* Gem image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                borderRadius: 14, overflow: 'hidden',
                                border: `1px solid ${C.border}`,
                                background: '#e8e4df',
                                aspectRatio: '16/9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            {coverImage
                                ? <img src={coverImage} alt={gem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <GemSvgFallback />
                            }
                        </motion.div>

                        {/* Gem details grid */}
                        <div style={{
                            background: C.white,
                            border: `1px solid ${C.border}`, borderRadius: 14,
                            padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16,
                        }}>
                            <Detail label="CARAT"   value={gem.carat_weight ? `${gem.carat_weight} ct` : null} />
                            <Detail label="CUT"     value={gem.cut}     />
                            <Detail label="CLARITY" value={gem.clarity} />
                            <Detail label="COLOR"   value={gem.color}   />
                            <Detail label="ORIGIN"  value={gem.origin}  />
                            <Detail label="LISTING" value={gem.listing_type} />
                            {gem.predicted_price && (
                                <Detail label="AI ESTIMATE" value={`$${Number(gem.predicted_price).toLocaleString()}`} />
                            )}
                            {gem.buy_now_price && (
                                <Detail label="BUY NOW" value={`$${Number(gem.buy_now_price).toLocaleString()}`} />
                            )}
                        </div>

                        {/* Description */}
                        {gem.description && (
                            <div style={{
                                background: C.white,
                                border: `1px solid ${C.border}`, borderRadius: 14,
                                padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                            }}>
                                <h3 style={{ color: C.faint, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 10px' }}>DESCRIPTION</h3>
                                <p style={{ color: C.text, fontSize: '0.88rem', fontFamily: BODY, lineHeight: 1.7, margin: 0 }}>{gem.description}</p>
                            </div>
                        )}

                        {/* Seller */}
                        <div style={{
                            background: C.white,
                            border: `1px solid ${C.border}`, borderRadius: 14,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden',
                        }}>
                            <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                {seller?.avatar_url ? (
                                    <img src={seller.avatar_url} alt={seller.full_name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.border}` }} />
                                ) : (
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(26,77,140,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: C.sapphire }}>
                                            {(seller?.full_name || 'S').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700, color: C.text }}>{seller?.full_name || 'Seller'}</div>
                                    <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.muted }}>Seller</div>
                                </div>
                            </div>
                            <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <RatingSummary sellerId={seller?.id} compact />
                                <Link
                                    to={`/sellers/${seller?.id}/reviews`}
                                    style={{
                                        fontFamily: BODY, fontSize: '0.75rem', fontWeight: 600,
                                        color: C.gold, textDecoration: 'none',
                                        padding: '6px 14px', borderRadius: 8,
                                        background: 'rgba(196,137,42,0.08)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    All Reviews →
                                </Link>
                            </div>
                        </div>

                        {/* Countdown (full block) */}
                        <div style={{
                            background: C.white,
                            border: `1px solid ${C.border}`, borderRadius: 14,
                            padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        }}>
                            <div style={{ color: C.faint, fontSize: '0.7rem', fontFamily: DISPLAY, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>
                                {countdown.expired ? 'AUCTION ENDED' : 'TIME REMAINING'}
                            </div>
                            <Countdown endTime={auction.end_time} darkMode={false} />
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 90 }}>
                        <BidPanel
                            auction={auction}
                            isExpired={countdown.expired}
                            onBidPlaced={(_newPrice) => { /* auction price updates via Realtime */ }}
                        />
                        <LiveBidFeed bids={bids} isConnected={isConnected} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.7; transform: scale(1);   }
                    50%       { opacity: 1;   transform: scale(1.15); }
                }
            `}</style>
        </div>
    );
};

export default LiveAuctionPage;
