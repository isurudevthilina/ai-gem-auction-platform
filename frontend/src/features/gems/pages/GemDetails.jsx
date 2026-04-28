/**
 * GemDetails.jsx — Gem detail page (/gem/:id)
 * Premium layout with immersive gallery, specs, pricing, seller panel.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Shield, Share2, Gem, Loader2, Pencil, Trash2, MapPin, Sparkles, Eye, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import AddToWatchlistButton from '../../watchlist/components/AddToWatchlistButton';
import GemImageGallery from '../components/GemImageGallery';
import BuyNowButton from '../../transactions/components/BuyNowButton';
import RatingSummary from '../../reviews/components/RatingSummary';
import { deleteGem } from '../services/gemsService';
import apiClient from '../../../api/client';
import { useCurrency } from '../../../context/CurrencyContext';

const T = {
    bg: '#F0EDE8',
    white: '#FFFFFF',
    sapphire: '#1A4D8C',
    sapphireBg: 'rgba(26,77,140,0.06)',
    gold: '#C4892A',
    goldSoft: 'rgba(196,137,42,0.10)',
    text: '#1A1A2E',
    muted: '#6B6B7B',
    faint: '#9A9AAB',
    border: '#E0DCD6',
    green: '#16a34a',
    red: '#B91C1C',
};
const SERIF = "'Cormorant Garamond', 'Georgia', serif";
const DISPLAY = "'Cinzel', serif";
const BODY = "'Jost', 'Inter', sans-serif";

const card = {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
};

const STATUS_MAP = {
    draft: { bg: 'rgba(107,107,123,0.08)', color: T.muted, label: 'Draft' },
    listed: { bg: 'rgba(26,77,140,0.08)', color: T.sapphire, label: 'Listed' },
    in_auction: { bg: 'rgba(196,137,42,0.10)', color: T.gold, label: 'In Auction' },
    sold: { bg: 'rgba(22,163,74,0.08)', color: T.green, label: 'Sold' },
};

const GemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    const [gem, setGem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

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
                <button onClick={() => navigate('/gems')} style={{ fontFamily: BODY, fontSize: '0.85rem', color: T.sapphire, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Browse all gems</button>
            </div>
        );
    }

    const categoryName = gem.category?.name || gem.gem_type || '';
    const sellerName = gem.seller?.full_name || gem.seller?.email || 'Unknown seller';
    const isOwner = (user?.id === gem.seller?.id || user?.role === 'admin') && gem.status !== 'sold';
    const statusStyle = STATUS_MAP[gem.status] || STATUS_MAP.listed;

    const certDisplay = gem.certification_body
        ? `${gem.certification_body}${gem.certification ? ' · ' + gem.certification : ''}`
        : gem.certification;

    const specs = [
        { label: 'Carat Weight', value: gem.carat_weight ? `${gem.carat_weight} ct` : null },
        { label: 'Color', value: gem.color },
        { label: 'Clarity', value: gem.clarity },
        { label: 'Cut / Shape', value: gem.cut },
        { label: 'Treatment', value: gem.treatment },
        { label: 'Certification', value: certDisplay },
    ].filter(s => s.value);

    const certsArr = gem.certificates ? (Array.isArray(gem.certificates) ? gem.certificates : [gem.certificates]) : [];
    const verified = certsArr.find(c => c.status === 'verified');
    const pending = !verified && certsArr.find(c => c.status === 'pending');
    const certInfo = verified || pending;
    const hasCert = !!(certInfo || gem.certification);
    const isVerified = !!verified;

    return (
        <div style={{ minHeight: '100vh', background: T.bg, fontFamily: BODY, color: T.text }}>
            <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600 }}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <span style={{ color: T.border, margin: '0 4px' }}>|</span>
                        <span onClick={() => navigate('/gems')} style={{ color: T.faint, fontSize: '0.78rem', fontFamily: BODY, cursor: 'pointer' }}>Gems</span>
                        <span style={{ color: T.faint, fontSize: '0.78rem' }}>›</span>
                        <span style={{ color: T.text, fontSize: '0.78rem', fontFamily: BODY, fontWeight: 600 }}>{gem.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AddToWatchlistButton gemId={gem.id} auctionId={gem.auction?.id} size="sm" />
                        <button title="Share" style={{ width: 36, height: 36, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Share2 size={15} />
                        </button>
                        {isOwner && (
                            <>
                                <button onClick={() => navigate(`/gems/${gem.id}/edit`)} title="Edit" style={{ width: 36, height: 36, borderRadius: 10, background: T.sapphireBg, border: '1px solid rgba(26,77,140,0.15)', color: T.sapphire, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => setConfirmDelete(true)} title="Delete" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.18)', color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Trash2 size={15} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 32px 80px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 36, alignItems: 'start' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <GemImageGallery images={gem.images || []} />

                        {specs.length > 0 && (
                            <div style={{ ...card, padding: '28px 32px' }}>
                                <h3 style={{ margin: '0 0 20px', fontFamily: DISPLAY, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.faint }}>Gemstone Specifications</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                                    {specs.map((s, i) => (
                                        <div key={s.label} style={{ padding: '16px 18px', borderRight: (i + 1) % 3 !== 0 ? `1px solid ${T.border}` : 'none', borderBottom: i < specs.length - 3 ? `1px solid ${T.border}` : 'none' }}>
                                            <div style={{ fontFamily: BODY, fontSize: '0.68rem', fontWeight: 600, color: T.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
                                            <div style={{ fontFamily: BODY, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {gem.description && (
                            <div style={{ ...card, padding: '28px 32px' }}>
                                <h3 style={{ margin: '0 0 16px', fontFamily: DISPLAY, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.faint }}>Description</h3>
                                <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.9rem', color: T.muted, lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{gem.description}</p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 80 }}>
                        <div style={{ ...card, padding: '28px 28px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                {categoryName && (
                                    <span style={{ fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.gold, background: T.goldSoft, padding: '4px 12px', borderRadius: 20 }}>{categoryName}</span>
                                )}
                                <span style={{ fontFamily: BODY, fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: statusStyle.color, background: statusStyle.bg, padding: '4px 10px', borderRadius: 20 }}>{statusStyle.label}</span>
                            </div>
                            <h1 style={{ margin: '0 0 4px', fontFamily: SERIF, fontSize: '1.65rem', fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{gem.title}</h1>
                            {gem.origin && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                                    <MapPin size={13} color={T.faint} />
                                    <span style={{ fontFamily: BODY, fontSize: '0.8rem', color: T.muted }}>{gem.origin}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ ...card, padding: '24px 28px' }}>
                            {gem.listing_type === 'direct_sell' && gem.buy_now_price && (
                                <div>
                                    <div style={{ fontFamily: DISPLAY, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.faint, marginBottom: 8 }}>Buy Now Price</div>
                                    <div style={{ fontFamily: SERIF, fontSize: '2.2rem', fontWeight: 700, color: T.gold, lineHeight: 1.1, marginBottom: 20 }}>{formatPrice(gem.buy_now_price)}</div>
                                    <BuyNowButton gem={gem} />
                                </div>
                            )}
                            {gem.listing_type === 'auction' && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Sparkles size={16} color={T.gold} />
                                        </div>
                                        <div style={{ fontFamily: BODY, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Listed for Auction</div>
                                    </div>
                                    <p style={{ margin: '0 0 18px', fontFamily: BODY, fontSize: '0.84rem', color: T.muted, lineHeight: 1.6 }}>This gem is available through auction bidding. Visit the auction page to place your bid.</p>
                                    {gem.auction?.id && (
                                        <button onClick={() => navigate(`/auctions/${gem.auction.id}`)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 24px', borderRadius: 10, background: T.sapphire, border: 'none', color: '#fff', fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                                            <Eye size={16} /> View Auction <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            )}
                            {gem.predicted_price && (
                                <div style={{ marginTop: gem.listing_type ? 18 : 0, padding: '12px 16px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(196,137,42,0.08) 0%, rgba(26,77,140,0.06) 100%)', border: '1px solid rgba(196,137,42,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Sparkles size={15} color={T.gold} />
                                    <div>
                                        <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: T.faint, fontWeight: 600, marginBottom: 2 }}>AI Estimated Value</div>
                                        <div style={{ fontFamily: BODY, fontSize: '1.05rem', color: T.gold, fontWeight: 800 }}>{formatPrice(gem.predicted_price)}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {hasCert && (
                            <div style={{ ...card, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `3px solid ${isVerified ? T.green : '#d97706'}` }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: isVerified ? 'rgba(22,163,74,0.08)' : 'rgba(217,119,6,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {isVerified ? <Shield size={20} color={T.green} /> : <Award size={20} color="#d97706" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: BODY, fontSize: '0.82rem', fontWeight: 700, color: T.text }}>{certInfo?.issued_by || gem.certification_body || gem.certification || 'Certificate'}</div>
                                    <div style={{ fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600, color: isVerified ? T.green : '#d97706' }}>{isVerified ? '\u2713 Verified Certificate' : 'Pending Review'}</div>
                                </div>
                            </div>
                        )}

                        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                {gem.seller?.avatar_url ? (
                                    <img src={gem.seller.avatar_url} alt={sellerName} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${T.border}` }} />
                                ) : (
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${T.sapphire}, #0F3460)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{sellerName.charAt(0).toUpperCase()}</span>
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700, color: T.text }}>{sellerName}</div>
                                    <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: T.gold, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.gold, display: 'inline-block' }} />
                                        Verified Seller
                                    </div>
                                </div>
                            </div>
                            <div style={{ borderTop: `1px solid ${T.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(240,237,232,0.4)' }}>
                                <RatingSummary sellerId={gem.seller?.id} compact />
                                <Link to={`/sellers/${gem.seller?.id}/reviews`} style={{ fontFamily: BODY, fontSize: '0.75rem', fontWeight: 600, color: T.gold, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, background: T.goldSoft }}>All Reviews \u2192</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {confirmDelete && (
                <div onClick={() => { setConfirmDelete(false); setDeleteError(null); }} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(4px)' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: T.white, borderRadius: 18, padding: '36px 32px 28px', maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 18px', background: 'rgba(185,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={26} color={T.red} />
                        </div>
                        <h2 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: '1.4rem', fontWeight: 700, color: T.text }}>Delete This Gem?</h2>
                        <p style={{ margin: '0 0 22px', fontFamily: BODY, fontSize: '0.85rem', color: T.muted, lineHeight: 1.6 }}>This action cannot be undone. The gem listing and all associated data will be permanently removed.</p>
                        {deleteError && (
                            <div style={{ margin: '0 0 18px', padding: '10px 16px', borderRadius: 10, background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)', fontFamily: BODY, fontSize: '0.82rem', color: T.red, fontWeight: 600 }}>{deleteError}</div>
                        )}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button onClick={() => { setConfirmDelete(false); setDeleteError(null); }} style={{ padding: '11px 24px', borderRadius: 10, cursor: 'pointer', background: 'none', border: `1.5px solid ${T.border}`, color: T.text, fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600 }}>Cancel</button>
                            <button disabled={deleting} onClick={async () => {
                                setDeleting(true);
                                setDeleteError(null);
                                try { await deleteGem(gem.id); navigate('/gems', { replace: true }); }
                                catch (err) {
                                    const msg = err?.message || '';
                                    if (msg.toLowerCase().includes('auction') || msg.toLowerCase().includes('active')) { setDeleteError('Cannot delete \u2014 this gem has an active auction. Cancel the auction first.'); }
                                    else { setDeleteError(msg || 'Delete failed. Please try again.'); }
                                }
                                finally { setDeleting(false); }
                            }} style={{ padding: '11px 24px', borderRadius: 10, border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', background: T.red, color: '#fff', fontFamily: BODY, fontSize: '0.85rem', fontWeight: 700, opacity: deleting ? 0.7 : 1 }}>
                                {deleting ? 'Deleting\u2026' : 'Delete Gem'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default GemDetails;