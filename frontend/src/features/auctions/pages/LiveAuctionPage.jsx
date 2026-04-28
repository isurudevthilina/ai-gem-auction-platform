/**
 * LiveAuctionPage.jsx — Premium auction detail page (/auctions/:id)
 * Immersive hero, sticky bid panel, polished gem info + seller card.
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Pencil, XCircle, Gem, Sparkles, Share2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import BidPanel from '../components/BidPanel';
import LiveBidFeed from '../components/LiveBidFeed';
import Countdown from '../components/Countdown';
import EditAuctionModal from '../components/EditAuctionModal';
import GemImageGallery from '../../gems/components/GemImageGallery';
import AddToWatchlistButton from '../../watchlist/components/AddToWatchlistButton';
import { useCurrency } from '../../../context/CurrencyContext';
import useAuction from '../hooks/useAuction';
import useLiveBids from '../hooks/useLiveBids';
import useCountdown from '../hooks/useCountdown';
import { deleteAuction } from '../services/auctionsService';
import RatingSummary from '../../reviews/components/RatingSummary';
import { getAuctionState, isAuctionEnded } from '../utils/auctionState';

const C = {
    bg:        '#F0EDE8',
    white:     '#FFFFFF',
    sapphire:  '#1A4D8C',
    sapphireBg:'rgba(26,77,140,0.06)',
    gold:      '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)',
    green:     '#16a34a',
    red:       '#B91C1C',
    text:      '#1A1A2E',
    muted:     '#6B6B7B',
    faint:     '#9A9AAB',
    border:    '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond', serif";
const DISPLAY = "'Cinzel', serif";
const BODY    = "'Jost', 'Inter', sans-serif";

const card = {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
};

const OutbidToast = ({ visible, onClose }) => (
    <AnimatePresence>
        {visible && (
            <Motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                style={{
                    position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 24px', borderRadius: 12,
                    background: C.white, border: '1px solid rgba(185,28,28,0.25)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: C.red }}>You've been outbid!</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
            </Motion.div>
        )}
    </AnimatePresence>
);

const LiveAuctionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    const { auction, loading, error } = useAuction(id);
    const { bids, isConnected } = useLiveBids(id, auction?.recent_bids);
    const countdown = useCountdown(auction?.end_time);

    const gem = auction?.gem || {};
    const seller = auction?.seller || {};

    const [outbidVisible, setOutbidVisible] = useState(false);
    const wasWinningRef = useRef(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState(null);

    useEffect(() => {
        if (!user?.id || !bids || bids.length === 0) return;
        const topBid = bids[0];
        const currentlyWinning = topBid?.bidder_id === user.id;
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
                <Gem size={36} color={C.faint} />
                <div style={{ color: C.red, fontFamily: BODY, fontSize: '1rem' }}>{error || 'Auction not found.'}</div>
                <button onClick={() => navigate('/auctions')} style={{ background: C.goldLight, border: '1px solid rgba(196,137,42,0.25)', borderRadius: 8, color: C.gold, fontFamily: BODY, fontWeight: 600, padding: '8px 20px', cursor: 'pointer' }}>Back to Auctions</button>
            </div>
        );
    }

    const noBids = (auction.bid_count || 0) === 0;
    const auctionState = getAuctionState(auction);
    const isActive = auctionState === 'live';
    const isScheduled = auctionState === 'scheduled';
    const isEnded = isAuctionEnded(auction);
    const isCancelled = auctionState === 'cancelled';
    const isOwner = user?.id === auction.seller_id || user?.id === seller?.id || user?.role === 'admin';
    const canManageAuction = isOwner && ((isActive || isScheduled) && (noBids || user?.role === 'admin') || (isCancelled && noBids));

    const specs = [
        { label: 'Carat Weight', value: gem.carat_weight ? `${gem.carat_weight} ct` : null },
        { label: 'Color', value: gem.color },
        { label: 'Clarity', value: gem.clarity },
        { label: 'Cut / Shape', value: gem.cut },
        { label: 'Origin', value: gem.origin },
    ].filter(s => s.value);

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: BODY }}>
            <OutbidToast visible={outbidVisible} onClose={() => setOutbidVisible(false)} />

            <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600 }}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <span style={{ color: C.border, margin: '0 4px' }}>|</span>
                        <span onClick={() => navigate('/auctions')} style={{ color: C.faint, fontSize: '0.78rem', fontFamily: BODY, cursor: 'pointer' }}>Auctions</span>
                        <span style={{ color: C.faint, fontSize: '0.78rem' }}>›</span>
                        <span style={{ color: C.text, fontSize: '0.78rem', fontFamily: BODY, fontWeight: 600 }}>{gem.title || 'Auction'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AddToWatchlistButton gemId={gem.id} auctionId={auction.id} size="sm" />
                        <button title="Share" style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Share2 size={15} />
                        </button>
                        {canManageAuction && (
                            <>
                                <button onClick={() => setShowEditModal(true)} title="Edit Auction" style={{ width: 36, height: 36, borderRadius: 10, background: C.sapphireBg, border: '1px solid rgba(26,77,140,0.15)', color: C.sapphire, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => setConfirmCancel(true)} title="Cancel Auction" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.18)', color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <XCircle size={15} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 80px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 36, alignItems: 'start' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                                {isActive && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 20, padding: '4px 14px' }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: 'pulse 1.5s infinite' }} />
                                        <span style={{ color: C.green, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
                                    </div>
                                )}
                                {isScheduled && (
                                    <span style={{ background: 'rgba(26,77,140,0.08)', border: '1px solid rgba(26,77,140,0.2)', borderRadius: 20, padding: '4px 14px', color: C.sapphire, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 700 }}>UPCOMING</span>
                                )}
                                {isEnded && auction.status !== 'completed' && auction.status !== 'cancelled' && (
                                    <span style={{ background: 'rgba(26,77,140,0.08)', border: '1px solid rgba(26,77,140,0.2)', borderRadius: 20, padding: '4px 14px', color: C.sapphire, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 700 }}>ENDED</span>
                                )}
                                {auction.status === 'completed' && (
                                    <span style={{ background: 'rgba(26,77,140,0.08)', border: '1px solid rgba(26,77,140,0.2)', borderRadius: 20, padding: '4px 14px', color: C.sapphire, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 700 }}>COMPLETED</span>
                                )}
                                {auction.status === 'cancelled' && (
                                    <span style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.18)', borderRadius: 20, padding: '4px 14px', color: C.red, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 700 }}>CANCELLED</span>
                                )}
                                {gem.category?.name && (
                                    <span style={{ background: C.goldLight, border: '1px solid rgba(196,137,42,0.20)', borderRadius: 20, padding: '4px 14px', color: C.gold, fontSize: '0.72rem', fontFamily: DISPLAY, fontWeight: 600 }}>{gem.category.name}</span>
                                )}
                            </div>
                            <h1 style={{ fontSize: '1.85rem', fontFamily: SERIF, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2, color: C.text }}>
                                {gem.title || 'Gem Auction'}
                            </h1>
                            <div style={{ color: C.muted, fontSize: '0.84rem', fontFamily: BODY, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span>By <strong style={{ color: C.text, fontWeight: 600 }}>{seller.full_name || 'Seller'}</strong></span>
                                <span style={{ color: C.faint }}>·</span>
                                <span>{auction.bid_count || 0} bid{auction.bid_count !== 1 ? 's' : ''}</span>
                                {!noBids && (<><span style={{ color: C.faint }}>·</span><span>Current: <strong style={{ color: C.gold }}>{formatPrice(auction.current_price)}</strong></span></>)}
                            </div>
                        </Motion.div>

                        <Motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                            <GemImageGallery images={gem.images || []} />
                        </Motion.div>

                        {specs.length > 0 && (
                            <div style={{ ...card, padding: '28px 32px' }}>
                                <h3 style={{ margin: '0 0 20px', fontFamily: DISPLAY, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint }}>
                                    Gemstone Specifications
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                                    {specs.map((s, i) => (
                                        <div key={s.label} style={{ padding: '16px 18px', borderRight: (i + 1) % 3 !== 0 ? `1px solid ${C.border}` : 'none', borderBottom: i < specs.length - 3 ? `1px solid ${C.border}` : 'none' }}>
                                            <div style={{ fontFamily: BODY, fontSize: '0.68rem', fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
                                            <div style={{ fontFamily: BODY, fontSize: '0.95rem', fontWeight: 700, color: C.text }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {gem.description && (
                            <div style={{ ...card, padding: '28px 32px' }}>
                                <h3 style={{ margin: '0 0 16px', fontFamily: DISPLAY, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint }}>Description</h3>
                                <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.9rem', color: C.muted, lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{gem.description}</p>
                            </div>
                        )}

                        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                {seller?.avatar_url ? (
                                    <img src={seller.avatar_url} alt={seller.full_name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${C.border}` }} />
                                ) : (
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${C.sapphire}, #0F3460)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{(seller?.full_name || 'S').charAt(0).toUpperCase()}</span>
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700, color: C.text }}>{seller?.full_name || 'Seller'}</div>
                                    {seller?.is_verified && (
                                        <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.gold, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold, display: 'inline-block' }} />
                                            Verified Seller
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(240,237,232,0.4)' }}>
                                <RatingSummary sellerId={seller?.id} compact />
                                <Link to={`/sellers/${seller?.id}/reviews`} style={{ fontFamily: BODY, fontSize: '0.75rem', fontWeight: 600, color: C.gold, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, background: C.goldLight }}>All Reviews →</Link>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 80 }}>
                        <div style={{ ...card, padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div style={{ fontFamily: DISPLAY, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: countdown.expired ? C.muted : C.faint }}>
                                    {isEnded ? 'Auction Ended' : isScheduled ? 'Auction Scheduled' : 'Time Remaining'}
                                </div>
                                {isActive && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? C.green : C.faint, display: 'inline-block' }} />
                                        <span style={{ fontSize: '0.65rem', fontFamily: BODY, fontWeight: 600, color: isConnected ? C.green : C.faint }}>{isConnected ? 'Live' : 'Connecting…'}</span>
                                    </div>
                                )}
                            </div>
                            <Countdown endTime={auction.end_time} darkMode={false} />
                        </div>

                        {gem.predicted_price && (
                            <div style={{ ...card, padding: '16px 20px', background: 'linear-gradient(135deg, rgba(196,137,42,0.08) 0%, rgba(26,77,140,0.06) 100%)', border: '1px solid rgba(196,137,42,0.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Sparkles size={18} color={C.gold} />
                                <div>
                                    <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint, fontWeight: 600, marginBottom: 2 }}>AI Estimated Value</div>
                                    <div style={{ fontFamily: BODY, fontSize: '1.1rem', color: C.gold, fontWeight: 800 }}>{formatPrice(gem.predicted_price)}</div>
                                </div>
                            </div>
                        )}

                        <BidPanel auction={auction} isExpired={isEnded} onBidPlaced={() => {}} />
                        <LiveBidFeed bids={bids} isConnected={isConnected} />
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditAuctionModal auction={auction} onClose={() => setShowEditModal(false)} onUpdated={() => { setShowEditModal(false); window.location.reload(); }} />
            )}

            {confirmCancel && (
                <div onClick={() => { if (!cancelling) { setCancelError(null); setConfirmCancel(false); } }} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(4px)' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, padding: '36px 32px 28px', maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 18px', background: 'rgba(185,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <XCircle size={26} color={C.red} />
                        </div>
                        <h2 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: '1.4rem', fontWeight: 700, color: C.text }}>{isScheduled || isCancelled ? 'Delete Auction?' : 'Cancel Auction?'}</h2>
                        <p style={{ margin: '0 0 22px', fontFamily: BODY, fontSize: '0.85rem', color: C.muted, lineHeight: 1.6 }}>
                            {isScheduled || isCancelled
                                ? 'This will permanently delete the auction and return the gem to your listings.'
                                : <>This will cancel the auction and return the gem to your listings.{(auction.bid_count || 0) > 0 ? ' All existing bids will be voided.' : ''} This action cannot be undone.</>}
                        </p>
                        {cancelError && (
                            <div style={{ margin: '0 0 18px', padding: '10px 16px', borderRadius: 10, background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)', fontFamily: BODY, fontSize: '0.82rem', color: C.red, fontWeight: 600 }}>{cancelError}</div>
                        )}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button disabled={cancelling} onClick={() => { setCancelError(null); setConfirmCancel(false); }} style={{ padding: '11px 24px', borderRadius: 10, cursor: 'pointer', background: 'none', border: `1.5px solid ${C.border}`, color: C.text, fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600 }}>Keep Auction</button>
                            <button disabled={cancelling} onClick={async () => {
                                setCancelling(true);
                                setCancelError(null);
                                try {
                                    const res = await deleteAuction(auction.id);
                                    navigate(res.hard_deleted ? '/gems' : '/auctions');
                                }
                                catch (err) { setCancelError(err?.response?.data?.message || err.message || 'Failed to cancel auction'); }
                                finally { setCancelling(false); }
                            }} style={{ padding: '11px 24px', borderRadius: 10, border: 'none', cursor: cancelling ? 'not-allowed' : 'pointer', background: C.red, color: '#fff', fontFamily: BODY, fontSize: '0.85rem', fontWeight: 700, opacity: cancelling ? 0.7 : 1 }}>
                                {cancelling ? (isScheduled || isCancelled ? 'Deleting…' : 'Cancelling…') : (isScheduled || isCancelled ? 'Delete Auction' : 'Cancel Auction')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }`}</style>
        </div>
    );
};

export default LiveAuctionPage;
