import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const HeartFilled = ({ size = 16, color = C.gold }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const GemSvg = ({ size = 40, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3l1 10" /><path d="M2 9h20" /><path d="m6 3 6 6 6-6" />
    </svg>
);

const StarSvg = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={C.faint} stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const FolderMoveSvg = ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <path d="M12 11v6" /><path d="m15 14-3-3-3 3" />
    </svg>
);

const ArrowRightSvg = ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);

const getTimeRemaining = (endTime) => {
    const diff = new Date(endTime) - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (d > 0) return { text: `${d}d ${h}h`, diff };
    if (h > 0) return { text: `${h}h ${m}m`, diff };
    return { text: `${m}m`, diff };
};

const getCountdownColor = (diff) => {
    if (diff > 86400000) return C.green;
    if (diff > 3600000) return '#f59e0b';
    return C.red;
};

const WatchlistGemCard = ({ item, folders, onRemove, onMove }) => {
    const [hover, setHover] = useState(false);
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();

    const gem = item.gem || {};
    const auction = item.auction;
    const images = gem.images || [];
    const displayImage = images.find((img) => !img.startsWith('model:'));
    const has3D = images.some((img) => img.startsWith('model:'));
    const countdown = auction?.status === 'active' && auction?.end_time ? getTimeRemaining(auction.end_time) : null;

    const folderName = item.folder_id
        ? (folders || []).find((f) => f.id === item.folder_id)?.name || ''
        : 'Uncategorized';

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: '100%', minHeight: 330, borderRadius: 16, overflow: 'hidden',
                background: C.white, border: `0.5px solid ${C.border}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: hover ? 'translateY(-2px)' : 'none',
                boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
                display: 'flex', flexDirection: 'column',
            }}
        >
            {/* Image area */}
            <div style={{ height: 176, position: 'relative', flexShrink: 0 }}>
                {displayImage ? (
                    <img src={displayImage} alt={gem.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: C.sapphire, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GemSvg />
                    </div>
                )}

                {/* Badges top-left */}
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6 }}>
                    {has3D && (
                        <span style={{
                            background: C.sapphire, color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                            padding: '3px 8px', borderRadius: 6, fontFamily: BODY,
                        }}>3D</span>
                    )}
                    {countdown && (
                        <span style={{
                            background: getCountdownColor(countdown.diff), color: '#fff',
                            fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                            fontFamily: BODY,
                        }}>{countdown.text}</span>
                    )}
                </div>

                {/* Heart top-right */}
                <button onClick={(e) => { e.stopPropagation(); onRemove(gem.id); }} style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.9)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'transform 0.15s',
                }}>
                    <HeartFilled size={16} />
                </button>
            </div>

            {/* Details area */}
            <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {gem.category?.name && (
                    <div style={{
                        fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faint,
                    }}>
                        {gem.category.name}
                    </div>
                )}

                <div style={{
                    fontFamily: SERIF, fontSize: '1rem', fontWeight: 700, color: C.sapphire,
                    maxHeight: '2.6em', overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: '2px 0 4px',
                }}>
                    {gem.title}
                </div>

                <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>
                    {[gem.carat_weight && `${gem.carat_weight}ct`, gem.cut, gem.origin].filter(Boolean).join(' · ')}
                </div>

                {/* Price */}
                <div style={{ marginTop: 'auto' }}>
                    {gem.listing_type === 'direct_sell' && gem.buy_now_price && (
                        <div style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.gold, fontWeight: 700 }}>
                            Buy Now: {formatPrice(gem.buy_now_price)}
                        </div>
                    )}
                    {gem.listing_type === 'auction' && auction && (
                        <div style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.sapphire, fontWeight: 700 }}>
                            Current Bid: {formatPrice(auction.current_price)}
                        </div>
                    )}
                    {gem.predicted_price && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <StarSvg />
                            <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.faint }}>
                                AI Est: {formatPrice(gem.predicted_price)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action row */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <button onClick={(e) => { e.stopPropagation(); onMove(item); }} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        background: C.bg, padding: '7px 10px', borderRadius: 8,
                        fontSize: '0.76rem', fontFamily: BODY, fontWeight: 500, color: C.muted,
                        border: `1px solid transparent`, cursor: 'pointer',
                        transition: 'border-color 0.15s, color 0.15s',
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sapphire; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = C.muted; }}
                    >
                        <FolderMoveSvg />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>
                            {folderName}
                        </span>
                    </button>
                    <button
                        onClick={() => navigate(`/gem/${gem.id}`)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600,
                            color: C.sapphire, background: 'rgba(26,77,140,0.06)',
                            border: 'none', borderRadius: 8, padding: '7px 14px',
                            cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26,77,140,0.12)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(26,77,140,0.06)'}
                    >
                        View <ArrowRightSvg />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WatchlistGemCard;
