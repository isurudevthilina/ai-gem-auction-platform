import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Countdown from './Countdown';

// ── Color tokens matching existing theme ─────────────────────────────────────
const C = {
    bg:       '#0a0d14',
    panel:    '#0f1220',
    gold:     '#f59e0b',
    goldDim:  'rgba(245,158,11,0.12)',
    green:    '#10b981',
    text:     '#f1f5f9',
    muted:    '#94a3b8',
    dim:      '#475569',
    border:   'rgba(255,255,255,0.08)',
};

/**
 * AuctionCard
 * Props: { auction }  — shape from GET /api/auctions
 */
const AuctionCard = ({ auction }) => {
    const navigate = useNavigate();
    const gem = auction?.gem || {};
    const isLive = auction?.status === 'active';
    const noBids = (auction?.bid_count || 0) === 0;

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(245,158,11,0.18)' }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate(`/auctions/${auction.id}`)}
            style={{
                background:    'rgba(13,17,28,0.85)',
                border:        `1px solid ${C.border}`,
                borderRadius:  14,
                backdropFilter:'blur(18px)',
                overflow:      'hidden',
                cursor:        'pointer',
                transition:    'all 0.2s',
                display:       'flex',
                flexDirection: 'column',
            }}
        >
            {/* Image */}
            <div style={{ position: 'relative', height: 200, background: '#070a12', overflow: 'hidden' }}>
                {gem.image_url ? (
                    <img
                        src={gem.image_url}
                        alt={gem.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '3rem',
                    }}>💎</div>
                )}

                {/* LIVE badge */}
                {isLive && (
                    <div style={{
                        position: 'absolute', top: 10, left: 10,
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                        borderRadius: 20, padding: '4px 10px',
                    }}>
                        <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: C.green,
                            boxShadow: `0 0 6px ${C.green}`,
                            animation: 'pulse 1.5s infinite',
                        }} />
                        <span style={{ color: C.green, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE</span>
                    </div>
                )}

                {/* Category badge */}
                {gem.category?.name && (
                    <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: C.goldDim, border: `1px solid rgba(245,158,11,0.3)`,
                        borderRadius: 20, padding: '3px 10px',
                        color: C.gold, fontSize: '0.7rem', fontWeight: 600,
                    }}>{gem.category.name}</div>
                )}

                {/* Countdown overlay */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                    padding: '20px 12px 10px',
                }}>
                    <Countdown endTime={auction.end_time} compact />
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                    <h3 style={{ color: C.text, fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                        {gem.title || 'Untitled Gem'}
                    </h3>
                    <p style={{ color: C.muted, fontSize: '0.75rem', margin: '4px 0 0' }}>
                        {[gem.carat_weight && `${gem.carat_weight}ct`, gem.cut, gem.origin].filter(Boolean).join(' · ')}
                    </p>
                </div>

                {/* Price row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                    <div>
                        <div style={{ color: C.dim, fontSize: '0.68rem', fontWeight: 500, marginBottom: 2 }}>
                            {noBids ? 'STARTING BID' : 'CURRENT BID'}
                        </div>
                        <div style={{ color: C.gold, fontSize: '1.2rem', fontWeight: 800 }}>
                            ${Number(auction.current_price).toLocaleString()}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: C.dim, fontSize: '0.68rem', fontWeight: 500, marginBottom: 2 }}>BIDS</div>
                        <div style={{ color: C.text, fontSize: '1rem', fontWeight: 700 }}>
                            {auction.bid_count || 0}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <button
                    style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#0a0d14',
                        border: 'none',
                        borderRadius: 8,
                        padding: '9px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.03em',
                    }}
                >
                    {isLive ? 'Place Bid →' : 'View Auction'}
                </button>
            </div>
        </motion.div>
    );
};

export default AuctionCard;
