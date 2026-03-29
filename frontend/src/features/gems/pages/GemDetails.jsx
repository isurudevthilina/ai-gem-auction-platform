/**
 * GemDetails.jsx — Gem detail page (/gems/:id)
 * Fetches real data from API, supports model: prefix images, cream theme.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Shield, Share2, MapPin, Gem, Loader2 } from 'lucide-react';
import AddToWatchlistButton from '../../watchlist/components/AddToWatchlistButton';
import GemImageGallery from '../components/GemImageGallery';
import BuyNowButton from '../../transactions/components/BuyNowButton';
import RatingSummary from '../../reviews/components/RatingSummary';
import apiClient from '../../../api/client';

/* ─── Design tokens (cream theme) ─── */
const T = {
    bg:       '#F0EDE8',
    white:    '#FFFFFF',
    sapphire: '#1A4D8C',
    sapphireBg: 'rgba(26,77,140,0.06)',
    gold:     '#C4892A',
    goldSoft: 'rgba(196,137,42,0.10)',
    text:     '#1A1A2E',
    muted:    '#6B6B7B',
    faint:    '#9A9AAB',
    border:   '#E0DCD6',
    green:    '#16a34a',
};
const SERIF   = "'Cormorant Garamond', 'Georgia', serif";
const DISPLAY = "'Cinzel', serif";
const BODY    = "'Jost', 'Inter', sans-serif";

const specCard = {
    background: T.white,
    border: `0.5px solid ${T.border}`,
    borderRadius: 14,
    padding: '28px 32px',
};

const GemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [gem, setGem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        apiClient.get(`/gems/${id}`)
            .then(res => setGem(res.data?.data || res.data))
            .catch(err => setError(err.response?.data?.message || 'Gem not found'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} color={T.sapphire} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }
    if (error || !gem) {
        return (
            <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <Gem size={40} color={T.faint} />
                <p style={{ fontFamily: BODY, fontSize: '1rem', color: T.muted }}>{error || 'Gem not found'}</p>
                <button onClick={() => navigate('/gems')} style={{ fontFamily: BODY, fontSize: '0.85rem', color: T.sapphire, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Browse all gems
                </button>
            </div>
        );
    }

    const specs = [
        { label: 'Carat', value: gem.carat_weight ? `${gem.carat_weight} ct` : '—' },
        { label: 'Color', value: gem.color || '—' },
        { label: 'Clarity', value: gem.clarity || '—' },
        { label: 'Cut / Shape', value: gem.cut || '—' },
        { label: 'Treatment', value: gem.treatment || '—' },
        { label: 'Origin', value: gem.origin || '—' },
    ];

    const categoryName = gem.category?.name || gem.gem_type || '';
    const sellerName = gem.seller?.full_name || gem.seller?.email || 'Unknown seller';

    return (
        <div style={{ minHeight: '100vh', background: T.bg, fontFamily: BODY, color: T.text }}>
            <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px 80px' }}>

                {/* Back button */}
                <button onClick={() => navigate(-1)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'transparent', border: 'none', color: T.muted,
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginBottom: 24,
                    fontFamily: BODY, transition: 'color 0.2s',
                }}>
                    <ChevronLeft size={16} /> Back
                </button>

                {/* Two-column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 36, alignItems: 'start' }}>

                    {/* LEFT: Gallery */}
                    <div>
                        <GemImageGallery images={gem.images || []} />
                    </div>

                    {/* RIGHT: Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Title + Category + Actions */}
                        <div style={specCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ flex: 1 }}>
                                    {categoryName && (
                                        <span style={{ fontFamily: DISPLAY, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.gold, marginBottom: 6, display: 'block' }}>
                                            {categoryName}
                                        </span>
                                    )}
                                    <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: '1.75rem', fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
                                        {gem.title}
                                    </h1>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                                    <AddToWatchlistButton gemId={gem.id} auctionId={gem.auction?.id} size="sm" />
                                    <button style={{
                                        width: 36, height: 36, borderRadius: 8,
                                        background: 'transparent', border: `0.5px solid ${T.border}`,
                                        color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}>
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Specs grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                                {specs.map(s => (
                                    <div key={s.label} style={{ textAlign: 'center', padding: '10px 0', background: T.bg, borderRadius: 8 }}>
                                        <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.faint, marginBottom: 4 }}>
                                            {s.label}
                                        </div>
                                        <div style={{ fontFamily: BODY, fontSize: '0.85rem', fontWeight: 700, color: T.text }}>
                                            {s.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certification */}
                        {(() => {
                            const certsArr = gem.certificates ? (Array.isArray(gem.certificates) ? gem.certificates : [gem.certificates]) : [];
                            const verified = certsArr.find(c => c.status === 'verified');
                            const pending = !verified && certsArr.find(c => c.status === 'pending');
                            const certInfo = verified || pending;
                            if (!certInfo && !gem.certification) return null;
                            const isVerified = !!verified;
                            return (
                                <div style={{ ...specCard, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px' }}>
                                    <Shield size={18} color={isVerified ? T.green : '#92400e'} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.faint }}>Certification</div>
                                        <div style={{ fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: T.text }}>
                                            {certInfo?.issued_by || gem.certification || 'Certificate'}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, fontFamily: BODY,
                                        background: isVerified ? 'rgba(22,163,74,0.08)' : 'rgba(180,83,9,0.08)',
                                        color: isVerified ? T.green : '#92400e',
                                        border: `1px solid ${isVerified ? 'rgba(22,163,74,0.15)' : 'rgba(180,83,9,0.15)'}`,
                                    }}>
                                        {isVerified ? 'Verified' : 'Pending Review'}
                                    </span>
                                </div>
                            );
                        })()}

                        {/* Pricing / Listing */}
                        <div style={specCard}>
                            {gem.listing_type === 'direct_sell' && gem.buy_now_price && (
                                <div>
                                    <div style={{ fontFamily: DISPLAY, fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.faint, marginBottom: 8 }}>Buy Now Price</div>
                                    <div style={{ fontFamily: SERIF, fontSize: '2rem', fontWeight: 700, color: T.gold }}>
                                        ${parseFloat(gem.buy_now_price).toLocaleString()}
                                    </div>
                                    <BuyNowButton gem={gem} />
                                </div>
                            )}
                            {gem.listing_type === 'auction' && (
                                <div>
                                    <div style={{ fontFamily: DISPLAY, fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.faint, marginBottom: 8 }}>Listing Type</div>
                                    <div style={{ fontFamily: BODY, fontSize: '1rem', fontWeight: 700, color: T.text }}>Auction</div>
                                    <p style={{ margin: '10px 0 0', fontFamily: BODY, fontSize: '0.82rem', color: T.muted, lineHeight: 1.6 }}>
                                        This gem is listed for auction. Check the auction page for bidding details.
                                    </p>
                                </div>
                            )}
                            {gem.predicted_price && (
                                <div style={{ marginTop: 16, padding: '10px 14px', background: T.goldSoft, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontFamily: BODY, fontSize: '0.78rem', color: T.gold, fontWeight: 600 }}>
                                        AI Estimated Value: ${parseFloat(gem.predicted_price).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Seller */}
                        <div style={{ ...specCard, padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                {gem.seller?.avatar_url ? (
                                    <img src={gem.seller.avatar_url} alt={sellerName} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.border}` }} />
                                ) : (
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.sapphireBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: T.sapphire }}>
                                            {sellerName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700, color: T.text }}>{sellerName}</div>
                                    <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: T.muted }}>Seller</div>
                                </div>
                            </div>
                            <div style={{ borderTop: `1px solid ${T.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <RatingSummary sellerId={gem.seller?.id} compact />
                                <Link
                                    to={`/sellers/${gem.seller?.id}/reviews`}
                                    style={{
                                        fontFamily: BODY, fontSize: '0.75rem', fontWeight: 600,
                                        color: T.gold, textDecoration: 'none',
                                        padding: '6px 14px', borderRadius: 8,
                                        background: T.goldSoft,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    All Reviews →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {gem.description && (
                    <div style={{ ...specCard, marginTop: 32, maxWidth: 720 }}>
                        <h3 style={{ margin: '0 0 12px', fontFamily: SERIF, fontSize: '1.2rem', fontWeight: 700, color: T.text }}>Description</h3>
                        <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.88rem', color: T.muted, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                            {gem.description}
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default GemDetails;
