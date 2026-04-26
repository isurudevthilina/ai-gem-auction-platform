import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
    white:  '#FFFFFF',
    gold:   '#C4892A',
    green:  '#16a34a',
    text:   '#1A1A2E',
    muted:  '#6B6B7B',
    faint:  '#9A9AAB',
    border: '#E0DCD6',
    bg:     '#F0EDE8',
};
const DISPLAY = "'Cinzel', serif";
const BODY    = "'Jost', 'Inter', sans-serif";

const timeAgo = (isoStr) => {
    const secs = Math.floor((Date.now() - new Date(isoStr)) / 1000);
    if (secs < 60)  return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
};

const getInitial = (name) => (name || '?')[0].toUpperCase();

const avatarColor = (name) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const idx    = (name || '').charCodeAt(0) % colors.length;
    return colors[idx];
};

/**
 * LiveBidFeed
 * Props:
 *   bids        — array of bid objects (from useLiveBids)
 *   isConnected — bool (Realtime status)
 */
const LiveBidFeed = ({ bids = [], isConnected }) => {
    const { formatPrice } = useCurrency();
    return (
        <div style={{
            background:    C.white,
            border:        `1px solid ${C.border}`,
            borderRadius:  14,
            boxShadow:     '0 2px 12px rgba(0,0,0,0.04)',
            overflow:      'hidden',
            display:       'flex',
            flexDirection: 'column',
            maxHeight:     380,
        }}>
            {/* Header */}
            <div style={{
                padding:       '14px 18px',
                borderBottom:  `1px solid ${C.border}`,
                display:       'flex',
                alignItems:    'center',
                justifyContent:'space-between',
                background:    C.bg,
                flexShrink:    0,
            }}>
                <div style={{ color: C.text, fontFamily: BODY, fontWeight: 700, fontSize: '0.9rem' }}>
                    Live Bid Feed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="7" height="7" viewBox="0 0 7 7">
                        <circle cx="3.5" cy="3.5" r="3.5" fill={isConnected ? C.green : C.faint} />
                    </svg>
                    <span style={{ color: isConnected ? C.green : C.faint, fontSize: '0.7rem', fontFamily: BODY, fontWeight: 600 }}>
                        {isConnected ? 'Connected' : 'Connecting…'}
                    </span>
                </div>
            </div>

            {/* Bid list */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                {bids.length === 0 ? (
                    <div style={{
                        padding:    '30px 18px',
                        textAlign:  'center',
                        color:      C.faint,
                        fontFamily: BODY,
                        fontSize:   '0.83rem',
                    }}>
                        No bids yet. Be the first!
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {bids.map((bid, index) => (
                            <motion.div
                                key={bid.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    display:       'flex',
                                    alignItems:    'center',
                                    gap:           12,
                                    padding:       '10px 18px',
                                    background:    index === 0 ? 'rgba(196,137,42,0.06)' : 'transparent',
                                    borderLeft:    index === 0 ? `2px solid ${C.gold}` : '2px solid transparent',
                                    transition:    'background 0.3s',
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width:         34,
                                    height:        34,
                                    borderRadius:  '50%',
                                    background:    avatarColor(bid.bidder?.full_name),
                                    display:       'flex',
                                    alignItems:    'center',
                                    justifyContent:'center',
                                    flexShrink:    0,
                                    fontSize:      '0.85rem',
                                    fontFamily:    BODY,
                                    fontWeight:    800,
                                    color:         '#FFFFFF',
                                }}>
                                    {getInitial(bid.bidder?.full_name)}
                                </div>

                                {/* Name + time */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: C.text, fontSize: '0.82rem', fontFamily: BODY, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {bid.bidder?.full_name
                                            ? bid.bidder.full_name.split(' ')[0] + (bid.bidder.full_name.split(' ')[1] ? ' ' + bid.bidder.full_name.split(' ')[1][0] + '.' : '')
                                            : 'Anonymous'}
                                    </div>
                                    <div style={{ color: C.faint, fontSize: '0.68rem', fontFamily: BODY }}>
                                        {timeAgo(bid.created_at)}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{
                                        color:      index === 0 ? C.gold : C.text,
                                        fontSize:   '0.9rem',
                                        fontFamily: BODY,
                                        fontWeight: index === 0 ? 800 : 600,
                                    }}>
                                        {formatPrice(bid.amount)}
                                    </div>
                                    {index === 0 && bid.is_winning && (
                                        <div style={{ color: C.gold, fontSize: '0.62rem', fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.04em' }}>
                                            TOP
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default LiveBidFeed;
