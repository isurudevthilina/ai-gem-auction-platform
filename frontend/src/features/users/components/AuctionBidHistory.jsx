import { useState, useEffect } from 'react';
import { getBids } from '../../auctions/services/auctionsService';

/* ─── Design tokens ─── */
const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const AuctionBidHistory = ({ auctionId, auction }) => {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getBids(auctionId, 1, 50);
                setBids(res?.data || []);
            } catch (err) {
                console.error('Bid history load error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [auctionId]);

    const timeAgo = (d) => {
        const ms = Date.now() - new Date(d).getTime();
        const mins = Math.floor(ms / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const formatBidderName = (b) => {
        const name = b.bidder?.full_name || 'Anonymous';
        const parts = name.split(' ');
        if (parts.length > 1) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
        return name;
    };

    const visibleBids = showAll ? bids : bids.slice(0, 20);
    const winnerId = auction?.winner_id;
    const winnerBid = auction?.status === 'completed' && winnerId
        ? bids.find(b => b.bidder?.id === winnerId)
        : null;

    if (loading) {
        return (
            <div style={{
                padding: 20, margin: '4px 0 0', borderRadius: '0 0 10px 10px',
                background: C.white, border: `1px solid ${C.border}`, borderTop: 'none',
            }}>
                <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.faint, textAlign: 'center' }}>Loading bids...</div>
            </div>
        );
    }

    return (
        <div style={{
            padding: 20, margin: '0', borderRadius: '0 0 10px 10px',
            background: C.white, border: `1px solid ${C.border}`, borderTop: 'none',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h4 style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 700, color: C.text, margin: 0 }}>
                    Bid History {auction?.gem?.title ? `\u2014 ${auction.gem.title}` : ''}
                </h4>
                <span style={{
                    padding: '2px 10px', borderRadius: 20,
                    background: 'rgba(26,77,140,0.10)', color: C.sapphire,
                    fontFamily: BODY, fontSize: '0.7rem', fontWeight: 700,
                }}>{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Winner banner */}
            {winnerBid && (
                <div style={{
                    padding: '10px 16px', borderRadius: 8, marginBottom: 14,
                    background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)',
                    fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: C.green,
                }}>
                    Auction won by {winnerBid.bidder?.full_name || 'Winner'} at ${Number(winnerBid.amount).toLocaleString()}
                </div>
            )}

            {bids.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: C.faint, fontFamily: BODY, fontSize: '0.85rem' }}>
                    No bids placed on this auction.
                </div>
            ) : (
                <>
                    {/* Column headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 110px 100px', gap: 10, padding: '6px 8px', marginBottom: 4 }}>
                        {['Rank', 'Bidder', 'Amount', 'Time'].map(h => (
                            <div key={h} style={{ fontFamily: BODY, fontSize: '0.65rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
                        ))}
                    </div>

                    {/* Bid rows */}
                    {visibleBids.map((bid, i) => {
                        const rank = i + 1;
                        const isTop = rank === 1;
                        const initials = (bid.bidder?.full_name || 'A')
                            .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                        return (
                            <div key={bid.id || i} style={{
                                display: 'grid', gridTemplateColumns: '40px 1fr 110px 100px',
                                gap: 10, padding: '8px 8px', borderRadius: 8, alignItems: 'center',
                                borderLeft: isTop ? `3px solid ${C.gold}` : '3px solid transparent',
                                background: isTop ? C.goldLight : (i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)'),
                            }}>
                                {/* Rank */}
                                <div style={{ fontFamily: BODY, fontSize: '0.78rem', fontWeight: 700, color: isTop ? C.gold : C.faint }}>
                                    #{rank}
                                </div>

                                {/* Bidder */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: isTop ? C.sapphire : C.bg, color: isTop ? '#fff' : C.faint,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.6rem', fontWeight: 700, fontFamily: BODY, flexShrink: 0,
                                    }}>
                                        {initials}
                                    </div>
                                    <span style={{ fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: C.text }}>
                                        {formatBidderName(bid)}
                                    </span>
                                    {bid.is_winning && (
                                        <span style={{
                                            padding: '1px 6px', borderRadius: 4,
                                            background: C.goldLight, color: C.gold,
                                            fontFamily: DISPLAY, fontSize: '0.56rem', fontWeight: 700,
                                            letterSpacing: '0.06em',
                                        }}>TOP</span>
                                    )}
                                </div>

                                {/* Amount */}
                                <div style={{
                                    fontFamily: DISPLAY, fontSize: '0.88rem',
                                    fontWeight: 700, color: isTop ? C.gold : C.text,
                                }}>
                                    ${Number(bid.amount).toLocaleString()}
                                </div>

                                {/* Time */}
                                <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
                                    {timeAgo(bid.created_at)}
                                </div>
                            </div>
                        );
                    })}

                    {/* Show more */}
                    {bids.length > 20 && !showAll && (
                        <button onClick={() => setShowAll(true)} style={{
                            display: 'block', margin: '12px auto 0', padding: '6px 16px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600, color: C.sapphire,
                        }}>
                            Show more ({bids.length - 20} remaining)
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default AuctionBidHistory;
