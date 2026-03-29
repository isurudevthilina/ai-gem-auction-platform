import CertificateStatusBadge from './CertificateStatusBadge';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B',
    faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const LAB_COLORS = {
    GIA:     { bg: C.sapphire, color: C.bg },
    GRS:     { bg: '#0d9488', color: C.bg },
    IGI:     { bg: '#534AB7', color: C.bg },
    AGS:     { bg: '#047857', color: C.bg },
};

const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const CheckSvg = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XSvg = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const PdfIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.sapphire} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const GemPlaceholder = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="6 3 18 3 22 9 12 22 2 9" />
    </svg>
);

const CertificateCard = ({ cert, onVerify, onReject, onViewDetail }) => {
    const lab = LAB_COLORS[cert.issued_by] || { bg: C.faint, color: C.white };
    const gemImg = cert.gem?.images?.find(u => typeof u === 'string' && !u.startsWith('model:'));

    return (
        <div
            style={{
                background: C.white,
                border: `0.5px solid ${C.border}`,
                borderRadius: 14,
                padding: 20,
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            onClick={() => onViewDetail(cert)}
        >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{
                    padding: '3px 10px', borderRadius: 20, background: lab.bg, color: lab.color,
                    fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{cert.issued_by}</span>
                <span style={{ fontFamily: DISPLAY, fontSize: '0.72rem', color: cert.certificate_number ? C.text : C.faint, fontStyle: cert.certificate_number ? 'normal' : 'italic' }}>
                    {cert.certificate_number ? `#${cert.certificate_number}` : 'No cert number'}
                </span>
                <CertificateStatusBadge status={cert.status} />
            </div>

            {/* Gem info */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{
                    width: 60, height: 60, borderRadius: 8, overflow: 'hidden',
                    background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    {gemImg
                        ? <img src={gemImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <GemPlaceholder />}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: SERIF, fontSize: '0.95rem', fontWeight: 700, color: C.sapphire, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cert.gem?.title || 'Gem'}
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted }}>
                        {cert.gem?.category?.name || ''}{cert.gem?.carat_weight ? ` · ${cert.gem.carat_weight} ct` : ''}
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted }}>
                        {[cert.gem?.cut, cert.gem?.origin].filter(Boolean).join(' · ')}
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.text, marginTop: 2 }}>
                        {cert.seller?.full_name || ''}
                        {cert.seller?.is_verified && <span style={{ color: C.green, marginLeft: 4 }}>✓</span>}
                    </div>
                    {cert.seller?.business_name && (
                        <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint }}>{cert.seller.business_name}</div>
                    )}
                </div>
            </div>

            {/* Issue info */}
            <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted, marginBottom: 8 }}>
                Issued by {cert.issued_by}{cert.issued_date ? ` · ${formatDate(cert.issued_date)}` : ''}
            </div>

            {/* Document */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <PdfIcon />
                <button onClick={(e) => { e.stopPropagation(); onViewDetail(cert); }} style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontFamily: BODY, fontSize: '0.72rem', fontWeight: 700, color: C.sapphire,
                }}>View Certificate</button>
            </div>

            {/* Submitted time */}
            <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint, marginBottom: 10 }}>
                Submitted {relativeTime(cert.created_at)}
            </div>

            {/* Action buttons (pending only) */}
            {cert.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={(e) => { e.stopPropagation(); onVerify(cert); }} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: '#1D9E75', color: C.bg,
                        fontFamily: BODY, fontSize: '0.78rem', fontWeight: 700,
                    }}>
                        <CheckSvg /> Verify
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onReject(cert); }} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', borderRadius: 10, cursor: 'pointer',
                        background: 'transparent', border: `1px solid ${C.red}`, color: C.red,
                        fontFamily: BODY, fontSize: '0.78rem', fontWeight: 700,
                    }}>
                        <XSvg /> Reject
                    </button>
                </div>
            )}

            {/* Verified banner */}
            {cert.status === 'verified' && (
                <div style={{
                    background: 'rgba(22,163,74,0.06)', borderRadius: 10, padding: '10px 14px', marginTop: 4,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.green, fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600 }}>
                        <CheckSvg /> Verified{cert.verifier?.full_name ? ` by ${cert.verifier.full_name}` : ''}
                    </div>
                    {cert.verified_at && (
                        <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint, marginTop: 2 }}>
                            {new Date(cert.verified_at).toLocaleDateString()}
                        </div>
                    )}
                    {cert.notes && (
                        <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.muted, fontStyle: 'italic', marginTop: 4 }}>
                            {cert.notes}
                        </div>
                    )}
                </div>
            )}

            {/* Rejected banner */}
            {cert.status === 'rejected' && (
                <div style={{
                    background: 'rgba(185,28,28,0.05)', borderRadius: 10, padding: '10px 14px', marginTop: 4,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.red, fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600 }}>
                        <XSvg /> Rejected
                        {cert.verified_at && (
                            <span style={{ fontWeight: 400, color: C.faint, marginLeft: 4 }}>
                                {new Date(cert.verified_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    {cert.notes && (
                        <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.muted, fontStyle: 'italic', marginTop: 4 }}>
                            "{cert.notes}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CertificateCard;
