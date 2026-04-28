import { useState, useEffect } from 'react';
import { MailCheck } from 'lucide-react';
import CertificateStatusBadge from './CertificateStatusBadge';
import { getDocumentUrl } from '../services/certificatesService';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B',
    faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const GemPlaceholder = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="6 3 18 3 22 9 12 22 2 9" />
    </svg>
);

const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'Not provided';
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const LabelValue = ({ label, value }) => (
    <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: BODY, fontSize: '0.65rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            {label}
        </div>
        <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text }}>{value || 'Not provided'}</div>
    </div>
);

const InitialsAvatar = ({ name, url, size = 40 }) => {
    if (url) return <img src={url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: C.sapphire,
            color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: DISPLAY, fontSize: size * 0.38, fontWeight: 700,
        }}>{initials}</div>
    );
};

const CertificateDetailModal = ({ cert, onClose, onVerify, onReject, onSendAuthority }) => {
    const [docUrl, setDocUrl] = useState(null);

    useEffect(() => {
        if (!cert?.id) return;
        let cancelled = false;
        getDocumentUrl(cert.id)
            .then(res => { if (!cancelled) setDocUrl(res.data?.url || null); })
            .catch(() => { if (!cancelled) setDocUrl(null); });
        return () => { cancelled = true; };
    }, [cert?.id]);

    if (!cert) return null;

    const gemImg = cert.gem?.images?.find(u => typeof u === 'string' && !u.startsWith('model:'));

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: C.white, borderRadius: 18, width: '100%', maxWidth: 900,
                    maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 28px', borderBottom: `1px solid ${C.border}`,
                }}>
                    <div>
                        <h2 style={{ fontFamily: DISPLAY, fontSize: '1.15rem', color: C.sapphire, margin: 0 }}>
                            Certificate Review
                        </h2>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: C.faint }}>
                            ID: {cert.id?.slice(0, 8)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <CertificateStatusBadge status={cert.status} />
                        <button onClick={onClose} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '1.3rem', color: C.muted, lineHeight: 1,
                        }}>✕</button>
                    </div>
                </div>

                {/* Body — 2 column */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '55% 45%',
                    flex: 1, overflow: 'hidden',
                }}>
                    {/* Left — Document */}
                    <div style={{ padding: 24, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
                        <iframe
                            src={docUrl || ''}
                            title="Certificate Document"
                            style={{
                                width: '100%', height: 500, border: `0.5px solid ${C.border}`,
                                borderRadius: 10, flex: 1,
                            }}
                        />
                        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                            <button onClick={() => docUrl && window.open(docUrl, '_blank')} disabled={!docUrl} style={{
                                padding: '8px 16px', borderRadius: 8,
                                border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer',
                                fontFamily: BODY, fontSize: '0.75rem', fontWeight: 600, color: C.sapphire,
                            }}>Open in New Tab</button>
                            <a href={docUrl || '#'} download style={{
                                padding: '8px 16px', borderRadius: 8,
                                border: `1px solid ${C.border}`, background: C.white,
                                fontFamily: BODY, fontSize: '0.75rem', fontWeight: 600, color: C.sapphire,
                                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                            }}>Download</a>
                        </div>
                    </div>

                    {/* Right — Details */}
                    <div style={{ padding: 24, overflowY: 'auto', maxHeight: 600 }}>
                        {/* Certificate Details */}
                        <h3 style={{ fontFamily: DISPLAY, fontSize: '0.78rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                            Certificate Details
                        </h3>
                        <LabelValue label="Certificate Number" value={cert.certificate_number} />
                        <LabelValue label="Issuing Laboratory" value={cert.issued_by} />
                        <LabelValue label="Issue Date" value={cert.issued_date ? formatDate(cert.issued_date) : null} />
                        <LabelValue label="Submitted" value={`${relativeTime(cert.created_at)} · ${formatDate(cert.created_at)}`} />

                        <div style={{ height: 1, background: C.border, margin: '16px 0' }} />

                        {/* Gem Details */}
                        <h3 style={{ fontFamily: DISPLAY, fontSize: '0.78rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                            Gem Details
                        </h3>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: 10, overflow: 'hidden',
                                background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                {gemImg
                                    ? <img src={gemImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <GemPlaceholder />}
                            </div>
                            <div>
                                <div style={{ fontFamily: SERIF, fontSize: '0.95rem', fontWeight: 700, color: C.sapphire }}>
                                    {cert.gem?.title || 'Gem'}
                                </div>
                                {cert.gem?.category?.name && (
                                    <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted }}>{cert.gem.category.name}</div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            <LabelValue label="Carat" value={cert.gem?.carat_weight ? `${cert.gem.carat_weight} ct` : null} />
                            <LabelValue label="Color" value={cert.gem?.color} />
                            <LabelValue label="Clarity" value={cert.gem?.clarity} />
                            <LabelValue label="Cut" value={cert.gem?.cut} />
                            <LabelValue label="Origin" value={cert.gem?.origin} />
                            <LabelValue label="Treatment" value={cert.gem?.treatment} />
                        </div>

                        <div style={{ height: 1, background: C.border, margin: '16px 0' }} />

                        {/* Seller Details */}
                        <h3 style={{ fontFamily: DISPLAY, fontSize: '0.78rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                            Seller Details
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                            <InitialsAvatar name={cert.seller?.full_name} url={cert.seller?.avatar_url} />
                            <div>
                                <div style={{ fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, color: C.text }}>
                                    {cert.seller?.full_name || 'Unknown'}
                                    {cert.seller?.is_verified && <span style={{ color: C.green, marginLeft: 4 }}>✓</span>}
                                </div>
                                <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted }}>{cert.seller?.email}</div>
                            </div>
                        </div>
                        {cert.seller?.phone_number && <LabelValue label="Phone" value={cert.seller.phone_number} />}
                        {cert.seller?.business_name && <LabelValue label="Business" value={cert.seller.business_name} />}

                        {cert.authority_status === 'approved' && (
                            <>
                                <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
                                <h3 style={{ fontFamily: DISPLAY, fontSize: '0.78rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                                    Authority Review
                                </h3>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(26,77,140,0.07)', borderRadius: 10,
                                    padding: '8px 10px', marginBottom: 10,
                                    fontFamily: BODY, fontSize: '0.72rem', fontWeight: 700,
                                    color: C.sapphire,
                                }}>
                                    <MailCheck size={14} /> Approved by Authority
                                </div>
                                <LabelValue label="Authority Email" value={cert.authority_email} />
                                <LabelValue label="Authority Approved" value={cert.authority_approved_at ? formatDate(cert.authority_approved_at) : null} />
                                {cert.authority_notes && <LabelValue label="Authority Notes" value={cert.authority_notes} />}
                            </>
                        )}

                        {/* Review notes (if verified or rejected) */}
                        {(cert.status === 'verified' || cert.status === 'rejected') && (
                            <>
                                <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
                                <h3 style={{ fontFamily: DISPLAY, fontSize: '0.78rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                                    Review Notes
                                </h3>
                                {cert.notes ? (
                                    <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, fontStyle: 'italic' }}>
                                        {cert.notes}
                                    </div>
                                ) : (
                                    <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.faint }}>No notes</div>
                                )}
                                {cert.verifier?.full_name && (
                                    <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint, marginTop: 6 }}>
                                        Reviewed by {cert.verifier.full_name}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer (pending only) */}
                {cert.status === 'pending' && (
                    <div style={{
                        display: 'flex', gap: 12, padding: '16px 28px',
                        borderTop: `1px solid ${C.border}`, justifyContent: 'flex-end',
                    }}>
                        <button onClick={() => onSendAuthority(cert)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: C.sapphire, color: C.white,
                            fontFamily: BODY, fontSize: '0.82rem', fontWeight: 700,
                        }}>
                            <MailCheck size={16} /> Send to Authority
                        </button>
                        <button onClick={() => onReject(cert)} style={{
                            padding: '10px 24px', borderRadius: 10, cursor: 'pointer',
                            background: 'transparent', border: `1px solid ${C.red}`, color: C.red,
                            fontFamily: BODY, fontSize: '0.82rem', fontWeight: 700,
                        }}>Reject</button>
                        <button onClick={() => onVerify(cert)} style={{
                            padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: '#1D9E75', color: C.bg,
                            fontFamily: BODY, fontSize: '0.82rem', fontWeight: 700,
                        }}>Verify Certificate</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateDetailModal;
