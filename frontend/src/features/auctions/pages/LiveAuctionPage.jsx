import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../../shared/components/Navbar';
import BidPanel from '../components/BidPanel';
import LiveBidFeed from '../components/LiveBidFeed';
import Countdown from '../components/Countdown';
import useAuction from '../hooks/useAuction';
import useLiveBids from '../hooks/useLiveBids';
import useCountdown from '../hooks/useCountdown';

const C = {
    bg:      '#0a0d14',
    panel:   '#0f1220',
    gold:    '#f59e0b',
    goldDim: 'rgba(245,158,11,0.12)',
    green:   '#10b981',
    red:     '#ef4444',
    indigo:  '#6366f1',
    text:    '#f1f5f9',
    muted:   '#94a3b8',
    dim:     '#475569',
    border:  'rgba(255,255,255,0.08)',
};

const Detail = ({ label, value }) => (
    value ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: C.dim, fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.08em' }}>{label}</span>
            <span style={{ color: C.text, fontSize: '0.88rem', fontWeight: 600 }}>{value}</span>
        </div>
    ) : null
);

const LiveAuctionPage = () => {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const { auction, loading, error } = useAuction(id);
    const { bids, isConnected }       = useLiveBids(id, auction?.recent_bids);
    const countdown = useCountdown(auction?.end_time);

    const gem    = auction?.gem    || {};
    const seller = auction?.seller || {};

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Navbar />
                <div style={{ color: C.muted, fontSize: '1rem' }}>Loading auction…</div>
            </div>
        );
    }

    if (error || !auction) {
        return (
            <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <Navbar />
                <div style={{ color: '#ef4444', fontSize: '1rem' }}>⚠ {error || 'Auction not found.'}</div>
                <button
                    onClick={() => navigate('/auctions')}
                    style={{ background: C.goldDim, border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 8, color: C.gold, padding: '8px 20px', cursor: 'pointer' }}
                >← Back to Auctions</button>
            </div>
        );
    }

    const noBids    = (auction.bid_count || 0) === 0;
    const isActive  = auction.status === 'active' && !countdown.expired;

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
            {/* Aurora */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                {[
                    { color: 'rgba(99,102,241,0.1)',   top: '5%',   left: '0%',  w: 600, h: 400 },
                    { color: 'rgba(245,158,11,0.07)',  bottom: '0%',right: '0%', w: 500, h: 400 },
                ].map((orb, i) => (
                    <div key={i} style={{
                        position: 'absolute', ...orb,
                        width: orb.w, height: orb.h,
                        background: orb.color,
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                    }} />
                ))}
            </div>

            <Navbar />

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '90px 24px 60px', position: 'relative', zIndex: 1 }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: '0.8rem', color: C.dim }}>
                    <span style={{ cursor: 'pointer', color: C.muted }} onClick={() => navigate('/auctions')}>Auctions</span>
                    <span>›</span>
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
                                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                                        borderRadius: 20, padding: '4px 12px',
                                    }}>
                                        <span style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: C.green, boxShadow: `0 0 6px ${C.green}`,
                                            animation: 'pulse 1.5s infinite',
                                        }} />
                                        <span style={{ color: C.green, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
                                    </div>
                                )}
                                {auction.status === 'completed' && (
                                    <span style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '4px 12px', color: C.indigo, fontSize: '0.72rem', fontWeight: 700 }}>COMPLETED</span>
                                )}
                                {auction.status === 'cancelled' && (
                                    <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '4px 12px', color: C.red, fontSize: '0.72rem', fontWeight: 700 }}>CANCELLED</span>
                                )}
                                {gem.category?.name && (
                                    <span style={{ background: C.goldDim, border: '1px solid rgba(245,158,11,0.25)', borderRadius: 20, padding: '4px 12px', color: C.gold, fontSize: '0.72rem', fontWeight: 600 }}>{gem.category.name}</span>
                                )}
                            </div>

                            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                {gem.title || 'Gem Auction'}
                            </h1>
                            <div style={{ color: C.muted, fontSize: '0.85rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <span>By {seller.full_name || 'Seller'}</span>
                                <span>·</span>
                                <span>{auction.bid_count || 0} bid{auction.bid_count !== 1 ? 's' : ''}</span>
                                {!noBids && <><span>·</span><span>Current: <strong style={{ color: C.gold }}>${Number(auction.current_price).toLocaleString()}</strong></span></>}
                            </div>
                        </motion.div>

                        {/* Gem image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                borderRadius:  14,
                                overflow:      'hidden',
                                border:        `1px solid ${C.border}`,
                                background:    '#070a12',
                                aspectRatio:   '16/9',
                                display:       'flex',
                                alignItems:    'center',
                                justifyContent:'center',
                                fontSize:      '6rem',
                            }}
                        >
                            {gem.image_url
                                ? <img src={gem.image_url} alt={gem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '💎'
                            }
                        </motion.div>

                        {/* Gem details grid */}
                        <div style={{
                            background:    'rgba(13,17,28,0.85)',
                            border:        `1px solid ${C.border}`,
                            borderRadius:  14,
                            backdropFilter:'blur(18px)',
                            padding:       20,
                            display:       'grid',
                            gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))',
                            gap:           16,
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
                                background:    'rgba(13,17,28,0.85)',
                                border:        `1px solid ${C.border}`,
                                borderRadius:  14,
                                backdropFilter:'blur(18px)',
                                padding:       20,
                            }}>
                                <h3 style={{ color: C.muted, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 10px' }}>DESCRIPTION</h3>
                                <p style={{ color: C.text, fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{gem.description}</p>
                            </div>
                        )}

                        {/* Countdown (full block) */}
                        <div style={{
                            background:    'rgba(13,17,28,0.85)',
                            border:        `1px solid ${C.border}`,
                            borderRadius:  14,
                            backdropFilter:'blur(18px)',
                            padding:       '18px 20px',
                        }}>
                            <div style={{ color: C.dim, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>
                                {countdown.expired ? 'AUCTION ENDED' : 'TIME REMAINING'}
                            </div>
                            <Countdown endTime={auction.end_time} />
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
