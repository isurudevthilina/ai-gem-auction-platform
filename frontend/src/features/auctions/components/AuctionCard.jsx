import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Gavel } from 'lucide-react';
import Countdown from './Countdown';
import { useCurrency } from '../../../context/CurrencyContext';
import { getAuctionStatusLabel } from '../utils/auctionState';

/* ── Design tokens (matching GemListPage) ── */
const C = {
    parchment: '#F0EDE8',
    white:     '#FFFFFF',
    navy:      '#1A4D8C',
    navyDark:  '#1A2B5C',
    gold:      '#C4892A',
    text:      '#1A1A2E',
    muted:     '#6B6B7B',
    faint:     '#9A9AAB',
    border:    'rgba(26,77,140,0.12)',
    green:     '#16a34a',
    red:       '#b91c1c',
};
const DISPLAY = "'Cormorant Garamond', 'Georgia', serif";
const BRAND   = "'Cinzel', serif";

/* status → colour mapping */
const STATUS_MAP = {
    LIVE:      { color: C.green,  bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.22)',  accent: C.green },
    UPCOMING:  { color: C.navy,   bg: 'rgba(26,77,140,0.06)',  border: 'rgba(26,77,140,0.15)',  accent: C.navy  },
    ENDED:     { color: C.muted,  bg: 'rgba(107,107,123,0.06)',border: 'rgba(107,107,123,0.15)',accent: C.muted },
    CANCELLED: { color: C.red,    bg: 'rgba(185,28,28,0.06)',  border: 'rgba(185,28,28,0.15)',  accent: C.red   },
};

/* ══════════════════════════════════════════════
   AuctionCard — Vostok-inspired portrait card
══════════════════════════════════════════════ */
const AuctionCard = ({ auction }) => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const [hovered, setHovered] = useState(false);
    const gem = auction?.gem || {};
    const imgs = gem.images?.filter(u => !u.startsWith('model:')) || [];
    const cover = imgs[0];
    const alt   = imgs[1] || cover;
    const noBids = (auction?.bid_count || 0) === 0;
    const statusLabel = getAuctionStatusLabel(auction);
    const st = STATUS_MAP[statusLabel];
    const showCountdown = statusLabel === 'LIVE' || statusLabel === 'UPCOMING';
    const certsArr = gem.certificates ? (Array.isArray(gem.certificates) ? gem.certificates : [gem.certificates]) : [];
    const certVerified = certsArr.some(c => c.status === 'verified');

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(`/auctions/${auction.id}`)}
            style={{
                position: 'relative', cursor: 'pointer',
                background: C.white, overflow: 'hidden',
                borderBottom: `3px solid ${st.accent}`,
                transition: 'transform 0.25s, box-shadow 0.25s',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered
                    ? '0 12px 40px rgba(26,77,140,0.12)'
                    : '0 1px 4px rgba(26,77,140,0.06)',
            }}
        >
            {/* ── Image area (portrait 4:5) ── */}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '110%', background: C.parchment, overflow: 'hidden' }}>
                {cover ? (
                    <>
                        <img src={cover} alt={gem.title}
                            style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                                opacity: hovered && alt !== cover ? 0 : 1,
                                transition: 'opacity 0.35s',
                            }}
                        />
                        {alt !== cover && (
                            <img src={alt} alt=""
                                style={{
                                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                                    opacity: hovered ? 1 : 0,
                                    transition: 'opacity 0.35s',
                                }}
                            />
                        )}
                    </>
                ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.22 }}>
                            <path d="M16 22 24 12h16l8 10-16 30-16-30Z" stroke={C.navy} strokeWidth="2" />
                            <path d="M16 22h32M24 12l8 10 8-10M32 22v30" stroke={C.navy} strokeWidth="1.5" />
                        </svg>
                    </div>
                )}

                {/* Top-left: Status badge */}
                <div style={{
                    position: 'absolute', top: 10, left: 10,
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                    border: `0.5px solid ${st.border}`,
                    padding: '4px 10px',
                }}>
                    {statusLabel === 'LIVE' && (
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%', background: C.green,
                            boxShadow: `0 0 6px ${C.green}`,
                            animation: 'auctionLiveDot 1.5s infinite',
                        }} />
                    )}
                    <span style={{
                        fontFamily: BRAND, fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.06em', color: st.color,
                    }}>
                        {statusLabel}
                    </span>
                </div>

                {/* Top-right badges */}
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {certVerified && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                            border: '0.5px solid rgba(22,163,74,0.22)',
                            padding: '3px 8px', color: C.green,
                            fontFamily: BRAND, fontSize: 9, fontWeight: 700,
                            letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>
                            <Award size={9} /> GIA
                        </span>
                    )}
                    {gem.category?.name && (
                        <span style={{
                            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                            border: `0.5px solid ${C.border}`, padding: '3px 8px',
                            fontFamily: BRAND, fontSize: 9, fontWeight: 500,
                            color: C.gold, letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>
                            {gem.category.name}
                        </span>
                    )}
                </div>

                {/* Bottom: Countdown */}
                {showCountdown && (
                    <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
                        <Countdown endTime={auction.end_time} compact darkMode={false} />
                    </div>
                )}

                {/* Slide-up action row */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    display: 'flex', gap: 1,
                    transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.25s ease',
                }}>
                    <button
                        onClick={e => { e.stopPropagation(); navigate(`/auctions/${auction.id}`); }}
                        style={{
                            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                            background: C.navy, color: C.parchment,
                            fontFamily: BRAND, fontSize: 10, fontWeight: 700,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        }}
                    >
                        <Gavel size={12} /> {statusLabel === 'LIVE' ? 'Place Bid' : 'View Auction'}
                    </button>
                </div>
            </div>

            {/* ── Info area ── */}
            <div style={{ padding: '14px 16px 16px' }}>
                {/* Title */}
                <h3 style={{
                    margin: 0, fontFamily: DISPLAY, fontSize: 16, fontWeight: 600,
                    color: C.navy, lineHeight: 1.25,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {gem.title || 'Untitled Gem'}
                </h3>

                {/* Meta chips */}
                <p style={{
                    margin: '5px 0 0', fontFamily: DISPLAY, fontSize: 13, color: C.muted, lineHeight: 1.4,
                }}>
                    {[gem.carat_weight && `${gem.carat_weight}ct`, gem.cut, gem.color].filter(Boolean).join(' · ')}
                </p>

                {/* Divider */}
                <div style={{ height: 0.5, background: C.border, margin: '12px 0' }} />

                {/* Bid info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{
                            fontFamily: BRAND, fontSize: 9, fontWeight: 700, color: C.faint,
                            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2,
                        }}>
                            {noBids ? 'Starting Price' : 'Current Bid'}
                        </div>
                        <div style={{
                            fontFamily: DISPLAY, fontSize: noBids ? 18 : 22, fontWeight: 600,
                            color: noBids ? C.muted : C.gold, lineHeight: 1,
                        }}>
                            {formatPrice(noBids ? auction.starting_price : auction.current_price)}
                        </div>
                        {!noBids && auction.starting_price && (
                            <div style={{
                                fontFamily: DISPLAY, fontSize: 12, color: C.faint, marginTop: 2,
                            }}>
                                Started at {formatPrice(auction.starting_price)}
                            </div>
                        )}
                    </div>
                    <div style={{
                        fontFamily: BRAND, fontSize: 10, color: C.muted,
                        letterSpacing: '0.02em', textAlign: 'right',
                    }}>
                        {auction.bid_count || 0} bid{(auction.bid_count || 0) !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes auctionLiveDot {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default AuctionCard;
