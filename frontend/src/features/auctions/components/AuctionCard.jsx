import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import Countdown from './Countdown';

const C = {
    bg:         '#F0EDE8',
    white:      '#FFFFFF',
    sapphire:   '#1A4D8C',
    gold:       '#C4892A',
    goldSoft:   'rgba(196,137,42,0.10)',
    text:       '#1A1A2E',
    muted:      '#6B6B7B',
    faint:      '#9A9AAB',
    border:     '#E0DCD6',
    green:      '#16a34a',
    red:        '#b91c1c',
};
const SERIF = "'Cormorant Garamond', 'Georgia', serif";
const DISPLAY = "'Cinzel', serif";
const BODY  = "'Jost', 'Inter', sans-serif";

const GemIconSvg = ({ size = 44, color = C.sapphire }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" />
        <path d="M11 3l1 10" />
        <path d="M2 9h20" />
        <path d="M6.5 3L12 13" />
        <path d="M17.5 3L12 13" />
    </svg>
);

const getStatusInfo = (auction) => {
    const now = Date.now();
    const start = new Date(auction.start_time).getTime();
    if (auction.status === 'cancelled') return { label: 'CANCELLED', bg: 'rgba(185,28,28,0.08)', color: C.red };
    if (auction.status === 'completed') return { label: 'ENDED', bg: 'rgba(107,107,123,0.10)', color: C.muted };
    if (auction.status === 'active' && start > now) return { label: 'UPCOMING', bg: 'rgba(26,77,140,0.08)', color: C.sapphire };
    return { label: 'LIVE', bg: 'rgba(22,163,74,0.08)', color: C.green };
};

const AuctionCard = ({ auction }) => {
    const navigate = useNavigate();
    const gem = auction?.gem || {};
    const cover = gem.images?.find(u => !u.startsWith('model:'));
    const noBids = (auction?.bid_count || 0) === 0;
    const statusInfo = getStatusInfo(auction);
    const showCountdown = statusInfo.label === 'LIVE' || statusInfo.label === 'UPCOMING';
    const certsArr = gem.certificates ? (Array.isArray(gem.certificates) ? gem.certificates : [gem.certificates]) : [];
    const certVerified = certsArr.some(c => c.status === 'verified');
    const certPending = !certVerified && certsArr.some(c => c.status === 'pending');

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,77,140,0.12)' }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate(`/auctions/${auction.id}`)}
            style={{
                background:    C.white,
                border:        `1px solid ${C.border}`,
                borderRadius:  14,
                overflow:      'hidden',
                cursor:        'pointer',
                transition:    'all 0.2s',
                display:       'flex',
                flexDirection: 'column',
            }}
        >
            {/* Cover image */}
            <div style={{ position: 'relative', height: 200, background: C.bg, overflow: 'hidden' }}>
                {cover ? (
                    <img src={cover} alt={gem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GemIconSvg size={44} color={C.faint} />
                    </div>
                )}

                {/* Status badge */}
                <div style={{
                    position: 'absolute', top: 10, left: 10,
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: statusInfo.bg, backdropFilter: 'blur(6px)',
                    borderRadius: 20, padding: '4px 10px',
                }}>
                    {statusInfo.label === 'LIVE' && (
                        <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: C.green,
                            boxShadow: `0 0 6px ${C.green}`,
                            animation: 'liveDot 1.5s infinite',
                        }} />
                    )}
                    <span style={{ color: statusInfo.color, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', fontFamily: DISPLAY }}>
                        {statusInfo.label}
                    </span>
                </div>

                {/* Category badge */}
                {gem.category?.name && (
                    <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: C.goldSoft, borderRadius: 20, padding: '3px 10px',
                        color: C.gold, fontSize: '0.7rem', fontWeight: 600, fontFamily: BODY,
                    }}>{gem.category.name}</div>
                )}

                {/* Countdown overlay */}
                {showCountdown && (
                    <div style={{
                        position: 'absolute', bottom: 8, left: 10,
                    }}>
                        <Countdown endTime={auction.end_time} compact darkMode={false} />
                    </div>
                )}

                {/* Certificate badge */}
                {certVerified && (
                    <div style={{
                        position: 'absolute', bottom: 8, right: 10,
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '3px 8px', borderRadius: 6,
                        background: 'rgba(255,255,255,0.92)',
                        border: '1px solid rgba(22,163,74,0.22)',
                        color: C.green, fontSize: '0.52rem', fontWeight: 700,
                        fontFamily: DISPLAY, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                        <Award size={9} /> Certified
                    </div>
                )}
                {certPending && (
                    <div style={{
                        position: 'absolute', bottom: 8, right: 10,
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '3px 8px', borderRadius: 6,
                        background: 'rgba(255,255,255,0.92)',
                        border: '1px solid rgba(180,83,9,0.22)',
                        color: '#92400e', fontSize: '0.52rem', fontWeight: 700,
                        fontFamily: DISPLAY, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                        <Award size={9} /> Cert Pending
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '14px 16px 0' }}>
                <h3 style={{
                    fontFamily: SERIF, fontSize: '1.05rem', fontWeight: 600,
                    color: C.sapphire, margin: 0, lineHeight: 1.35,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {gem.title || 'Untitled Gem'}
                </h3>
                <p style={{ fontFamily: BODY, color: C.muted, fontSize: '0.75rem', margin: '4px 0 0' }}>
                    {[gem.carat_weight && `${gem.carat_weight}ct`, gem.cut, gem.color].filter(Boolean).join(' · ')}
                </p>
            </div>

            {/* Price */}
            <div style={{
                padding: '12px 16px 16px', marginTop: 'auto',
                borderTop: `1px solid ${C.border}`, display: 'flex',
                justifyContent: 'space-between', alignItems: 'flex-end',
            }}>
                <div>
                    <div style={{ fontFamily: DISPLAY, color: C.faint, fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: 2 }}>
                        Current Bid
                    </div>
                    {noBids ? (
                        <div style={{ fontFamily: BODY, color: C.faint, fontSize: '0.78rem' }}>
                            No bids · Starting at ${Number(auction.starting_price).toLocaleString()}
                        </div>
                    ) : (
                        <div style={{ fontFamily: BODY, color: C.sapphire, fontSize: '1.15rem', fontWeight: 700 }}>
                            ${Number(auction.current_price).toLocaleString()}
                        </div>
                    )}
                </div>
                <div style={{ fontFamily: BODY, color: C.muted, fontSize: '0.78rem' }}>
                    {auction.bid_count || 0} bid{(auction.bid_count || 0) !== 1 ? 's' : ''}
                </div>
            </div>
        </motion.div>
    );
};

export default AuctionCard;
