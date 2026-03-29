import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BidStatusBadge from './BidStatusBadge';
import AddToWatchlistButton from '../../watchlist/components/AddToWatchlistButton';
import { useGetAuctionBids } from '../hooks/useBidHistory';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const formatTime = (ms) => {
    if (ms <= 0) return 'Ended';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0)  return `${d}d ${h % 24}h`;
    if (h > 0)  return `${h}h ${m % 60}m`;
    return `${m % 60}m ${s % 60}s`;
};

const timeColor = (ms) => {
    if (ms > 86400000) return C.green;
    if (ms > 3600000)  return '#d97706';
    return C.red;
};

const ChevronDown = ({ flipped }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'transform 0.2s', transform: flipped ? 'rotate(180deg)' : 'none' }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const BidHistoryCard = ({ item, onContactSeller }) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [timeLeft, setTimeLeft] = useState(item.time_remaining_ms);
    const [hovered, setHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

    const { data: myBids, isLoading: bidsLoading } = useGetAuctionBids(
        expanded ? item.auction_id : null
    );

    const auction = item.auction;
    const gem = auction?.gem;
    const outcome = item.bid_outcome;

    // Countdown
    useEffect(() => {
        if (outcome !== 'winning' && outcome !== 'outbid') return;
        if (!timeLeft || timeLeft <= 0) return;
        const id = setInterval(() => setTimeLeft(prev => prev - 1000), 1000);
        return () => clearInterval(id);
    }, [outcome, timeLeft]);

    // Responsive
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 600);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Image
    const images = gem?.images || [];
    const thumbSrc = images.find(i => typeof i === 'string' && !i.startsWith('model:'));

    const priceColor = outcome === 'winning' ? C.gold : outcome === 'outbid' ? C.red : C.text;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: C.white,
                border: `0.5px solid ${C.border}`,
                borderRadius: 16,
                overflow: 'hidden',
                marginBottom: 16,
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: hovered ? 'translateY(-1px)' : 'none',
                boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.07)' : 'none',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
            }}
        >
            {/* LEFT — Image */}
            <div style={{
                position: 'relative',
                width: isMobile ? '100%' : 120,
                height: isMobile ? 160 : 'auto',
                minHeight: isMobile ? 160 : 120,
                background: thumbSrc ? 'transparent' : '#1A1A2E',
                flexShrink: 0,
            }}>
                {thumbSrc ? (
                    <img src={thumbSrc} alt={gem?.title || 'Gem'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6B6B7B" strokeWidth="1.5">
                            <polygon points="12 2 2 7 2 17 12 22 22 17 22 7" />
                        </svg>
                    </div>
                )}
                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    <BidStatusBadge outcome={outcome} />
                </div>
            </div>

            {/* CENTER — Content */}
            <div style={{ flex: 1, padding: '16px 20px' }}>
                <div style={{
                    fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint,
                }}>{gem?.category?.name || 'Gem'}</div>

                <div style={{
                    fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 700, color: C.sapphire,
                    cursor: 'pointer',
                }} onClick={() => navigate(`/auctions/${item.auction_id}`)}>
                    {gem?.title || 'Untitled'}
                </div>

                <div style={{
                    fontFamily: BODY, fontSize: '0.8rem', color: C.muted, margin: '4px 0 14px',
                }}>
                    {gem?.carat_weight}ct &middot; {gem?.cut} &middot; {gem?.origin}
                </div>

                {/* 2x2 info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* My Bid */}
                    <div>
                        <div style={{
                            fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint,
                        }}>My Bid</div>
                        <div style={{
                            fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 600, color: C.sapphire,
                        }}>${parseFloat(item.amount).toLocaleString()}</div>
                    </div>

                    {/* Current Price */}
                    <div>
                        <div style={{
                            fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint,
                        }}>Current Price</div>
                        <div style={{
                            fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 600, color: priceColor,
                        }}>${parseFloat(auction?.current_price || 0).toLocaleString()}</div>
                        {item.outbid_by_amount != null && item.outbid_by_amount > 0 && (
                            <div style={{
                                fontFamily: BODY, fontSize: '0.72rem', color: C.red,
                            }}>+${parseFloat(item.outbid_by_amount).toLocaleString()} above your bid</div>
                        )}
                    </div>

                    {/* Ends In / Ended */}
                    <div>
                        {(outcome === 'winning' || outcome === 'outbid') ? (
                            <>
                                <div style={{
                                    fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700,
                                    letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint,
                                }}>Ends In</div>
                                <div style={{
                                    fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 600,
                                    color: timeColor(timeLeft),
                                }}>{formatTime(timeLeft)}</div>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700,
                                    letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint,
                                }}>Ended</div>
                                <div style={{
                                    fontFamily: BODY, fontSize: '0.88rem', color: C.muted,
                                }}>{new Date(auction?.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </>
                        )}
                    </div>

                    {/* Total Bids */}
                    <div>
                        <div style={{
                            fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint,
                        }}>Total Bids</div>
                        <div style={{
                            fontFamily: BODY, fontSize: '0.88rem', fontWeight: 600, color: C.text,
                        }}>{auction?.bid_count || 0} bids</div>
                    </div>
                </div>

                {/* Expand toggle */}
                <button onClick={() => setExpanded(!expanded)} style={{
                    fontFamily: BODY, fontSize: '0.82rem', color: C.sapphire,
                    fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
                    padding: '8px 0', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    View my {myBids?.length ?? '...'} bids on this auction
                    <ChevronDown flipped={expanded} />
                </button>

                {/* Expanded timeline */}
                <div style={{
                    maxHeight: expanded ? 600 : 0, overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                }}>
                    <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 0 4px' }}>
                        {bidsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} style={{
                                    height: 28, background: '#E8E5E0', borderRadius: 6, marginBottom: 8,
                                    animation: 'bhp-pulse 1.5s ease-in-out infinite',
                                }} />
                            ))
                        ) : (
                            (myBids || []).map((bid, idx) => (
                                <div key={bid.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '6px 0',
                                    borderBottom: idx < (myBids.length - 1) ? `0.5px solid ${C.border}` : 'none',
                                }}>
                                    <span style={{
                                        fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: C.text,
                                    }}>${parseFloat(bid.amount).toLocaleString()}</span>
                                    <span style={{
                                        fontFamily: BODY, fontSize: '0.78rem', color: C.muted,
                                    }}>{new Date(bid.created_at).toLocaleString()}</span>
                                    <BidStatusBadge outcome={bid.is_winning ? 'winning' : 'outbid'} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT — Actions */}
            <div style={{
                padding: 16, display: 'flex', flexDirection: 'column',
                gap: 10, alignItems: isMobile ? 'stretch' : 'flex-end',
                justifyContent: 'center',
                borderLeft: isMobile ? 'none' : `0.5px solid ${C.border}`,
                borderTop: isMobile ? `0.5px solid ${C.border}` : 'none',
                minWidth: isMobile ? 'auto' : 160,
            }}>
                {outcome === 'winning' && (
                    <>
                        <span style={{
                            background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.25)',
                            color: C.green, borderRadius: 10, padding: '10px 16px',
                            fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600,
                            textAlign: 'center', pointerEvents: 'none',
                        }}>Currently Winning</span>
                        <span onClick={() => navigate(`/auctions/${item.auction_id}`)} style={{
                            fontFamily: BODY, fontSize: '0.78rem', color: C.sapphire,
                            cursor: 'pointer', textDecoration: 'underline', textAlign: 'center',
                        }}>View Auction</span>
                    </>
                )}

                {outcome === 'outbid' && (
                    <>
                        <button onClick={() => navigate(`/auctions/${item.auction_id}`)} style={{
                            background: C.red, color: '#fff', border: 'none', borderRadius: 10,
                            padding: '10px 16px', fontFamily: BODY, fontSize: '0.82rem',
                            fontWeight: 600, cursor: 'pointer',
                        }}>Bid Again</button>
                        {item.outbid_by_amount != null && (
                            <span style={{
                                fontFamily: BODY, fontSize: '0.78rem', color: C.red, textAlign: 'center',
                            }}>Outbid by ${parseFloat(item.outbid_by_amount).toLocaleString()}</span>
                        )}
                    </>
                )}

                {outcome === 'won' && (
                    <>
                        <button onClick={() => onContactSeller(item)} style={{
                            background: C.gold, color: '#fff', border: 'none', borderRadius: 10,
                            padding: '10px 16px', fontFamily: BODY, fontSize: '0.82rem',
                            fontWeight: 600, cursor: 'pointer',
                        }}>Contact Seller</button>
                        <span onClick={() => navigate(`/auctions/${item.auction_id}`)} style={{
                            fontFamily: BODY, fontSize: '0.78rem', color: C.muted,
                            cursor: 'pointer', textDecoration: 'underline', textAlign: 'center',
                        }}>View Auction</span>
                    </>
                )}

                {outcome === 'lost' && (
                    <>
                        <button onClick={() => navigate(`/auctions/${item.auction_id}`)} style={{
                            background: 'transparent', border: `1px solid ${C.border}`,
                            color: C.muted, borderRadius: 10, padding: '10px 16px',
                            fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                        }}>View Auction</button>
                        <span style={{
                            fontFamily: BODY, fontSize: '0.78rem', color: C.faint, textAlign: 'center',
                        }}>Sold for ${parseFloat(auction?.current_price || 0).toLocaleString()}</span>
                    </>
                )}

                {(outcome === 'cancelled' || outcome === 'reserve_not_met' || outcome === 'ended') && (
                    <button onClick={() => navigate(`/auctions/${item.auction_id}`)} style={{
                        background: 'transparent', border: `1px solid ${C.border}`,
                        color: C.muted, borderRadius: 10, padding: '10px 16px',
                        fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    }}>View Details</button>
                )}

                <AddToWatchlistButton gemId={gem?.id} size="sm" />
            </div>
        </div>
    );
};

export default BidHistoryCard;
