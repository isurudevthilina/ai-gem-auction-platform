import { motion, AnimatePresence } from 'framer-motion';

const C = {
    panel:  '#0f1220',
    gold:   '#f59e0b',
    green:  '#10b981',
    text:   '#f1f5f9',
    muted:  '#94a3b8',
    dim:    '#475569',
    border: 'rgba(255,255,255,0.08)',
};

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
    return (
        <div style={{
            background:    'rgba(13,17,28,0.9)',
            border:        `1px solid ${C.border}`,
            borderRadius:  14,
            backdropFilter:'blur(18px)',
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
                background:    C.panel,
                flexShrink:    0,
            }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '0.9rem' }}>
                    Live Bid Feed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: isConnected ? C.green : C.dim,
                        boxShadow:  isConnected ? `0 0 6px ${C.green}` : 'none',
                        transition: 'all 0.3s',
                    }} />
                    <span style={{ color: isConnected ? C.green : C.dim, fontSize: '0.7rem', fontWeight: 600 }}>
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
                        color:      C.dim,
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
                                    background:    index === 0 ? 'rgba(245,158,11,0.06)' : 'transparent',
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
                                    fontWeight:    800,
                                    color:         '#0a0d14',
                                }}>
                                    {getInitial(bid.bidder?.full_name)}
                                </div>

                                {/* Name + time */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: C.text, fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {bid.bidder?.full_name
                                            ? bid.bidder.full_name.split(' ')[0] + (bid.bidder.full_name.split(' ')[1] ? ' ' + bid.bidder.full_name.split(' ')[1][0] + '.' : '')
                                            : 'Anonymous'}
                                    </div>
                                    <div style={{ color: C.dim, fontSize: '0.68rem' }}>
                                        {timeAgo(bid.created_at)}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{
                                        color:      index === 0 ? C.gold : C.text,
                                        fontSize:   '0.9rem',
                                        fontWeight: index === 0 ? 800 : 600,
                                    }}>
                                        ${Number(bid.amount).toLocaleString()}
                                    </div>
                                    {index === 0 && bid.is_winning && (
                                        <div style={{ color: C.green, fontSize: '0.62rem', fontWeight: 700 }}>
                                            ● WINNING
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
