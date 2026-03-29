import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    text: '#1A1A2E', muted: '#6B6B7B', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const ContactSellerModal = ({ isOpen, onClose, item }) => {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen || !item) return null;

    const auction = item.auction;
    const gem = auction?.gem;
    const seller = auction?.seller;
    const images = gem?.images || [];
    const thumbSrc = images.find(i => typeof i === 'string' && !i.startsWith('model:'));

    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div onClick={(e) => e.stopPropagation()} style={{
                background: C.white, borderRadius: 16, padding: 32,
                width: '100%', maxWidth: 480,
                boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            }}>
                {/* Title */}
                <h2 style={{
                    fontFamily: DISPLAY, fontSize: '1.2rem', fontWeight: 700,
                    color: C.text, margin: '0 0 16px',
                }}>Congratulations — You Won!</h2>

                {/* Gem summary */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '16px 0' }}>
                    {thumbSrc ? (
                        <img src={thumbSrc} alt={gem?.title} style={{
                            width: 50, height: 50, borderRadius: 8, objectFit: 'cover',
                        }} />
                    ) : (
                        <div style={{
                            width: 50, height: 50, borderRadius: 8, background: '#1A1A2E',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6B7B" strokeWidth="1.5">
                                <polygon points="12 2 2 7 2 17 12 22 22 17 22 7" />
                            </svg>
                        </div>
                    )}
                    <div>
                        <div style={{
                            fontFamily: SERIF, fontSize: '1rem', fontWeight: 700, color: C.sapphire,
                        }}>{gem?.title}</div>
                        <div style={{
                            fontFamily: BODY, fontSize: '0.85rem', color: C.gold, fontWeight: 600,
                        }}>Winning bid: {formatPrice(item.amount)}</div>
                    </div>
                </div>

                {/* Seller card */}
                <div style={{
                    background: C.bg, borderRadius: 12, padding: '14px 18px', margin: '12px 0',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: BODY, fontWeight: 700, color: C.text }}>
                            {seller?.full_name || 'Seller'}
                        </span>
                        {seller?.is_verified && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a" stroke="#16a34a" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" stroke="#fff" />
                            </svg>
                        )}
                    </div>
                    <p style={{
                        fontFamily: BODY, fontSize: '0.82rem', color: C.muted,
                        lineHeight: 1.6, margin: '8px 0 0',
                    }}>
                        The seller has been notified of your win. Please arrange payment and delivery directly with the seller.
                    </p>
                </div>

                {/* Disclaimer */}
                <div style={{
                    background: 'rgba(196,137,42,0.08)',
                    border: `1px solid rgba(196,137,42,0.19)`,
                    borderRadius: 10, padding: '12px 16px', margin: '16px 0',
                }}>
                    <p style={{
                        fontFamily: BODY, fontSize: '0.78rem', color: C.muted,
                        lineHeight: 1.7, margin: 0,
                    }}>
                        GemBid LK facilitates introductions between buyers and sellers. We do not process payments or guarantee gem authenticity. We strongly recommend physical inspection and independent gemological certification before completing any transaction.
                    </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: `1px solid ${C.border}`,
                        color: C.muted, borderRadius: 10, padding: '10px 24px',
                        fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    }}>Close</button>
                    <button onClick={() => { navigate(`/gem/${gem?.id}`); onClose(); }} style={{
                        background: C.sapphire, color: '#fff', border: 'none',
                        borderRadius: 10, padding: '10px 24px',
                        fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    }}>View Gem Listing</button>
                </div>
            </div>
        </div>
    );
};

export default ContactSellerModal;
