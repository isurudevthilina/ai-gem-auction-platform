import { useState } from 'react';
import { useVerifyCertificate, useRejectCertificate } from '../hooks/useCertificates';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B',
    faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const QUICK_REASONS = [
    'Certificate number invalid or unverifiable',
    'Document appears altered or tampered',
    'Certificate issuer not recognized',
    'Gem details do not match certificate',
    'Document quality too poor to verify',
    'Certificate has expired',
];

const CheckCircle = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" stroke="#1D9E75" />
        <polyline points="9 12 11 14 15 10" stroke="#1D9E75" />
    </svg>
);

const XCircle = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" stroke={C.red} />
        <line x1="15" y1="9" x2="9" y2="15" stroke={C.red} />
        <line x1="9" y1="9" x2="15" y2="15" stroke={C.red} />
    </svg>
);

const VerifyRejectModal = ({ mode, cert, onClose, onSuccess }) => {
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const verifyMut = useVerifyCertificate();
    const rejectMut = useRejectCertificate();

    if (!cert) return null;
    const isVerify = mode === 'verify';
    const loading = isVerify ? verifyMut.isPending : rejectMut.isPending;

    const handleConfirm = async () => {
        setError('');
        if (!isVerify && notes.trim().length < 10) {
            setError('Rejection reason must be at least 10 characters.');
            return;
        }
        try {
            if (isVerify) {
                await verifyMut.mutateAsync({ id: cert.id, notes: notes || undefined });
            } else {
                await rejectMut.mutateAsync({ id: cert.id, notes });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err?.message || 'Something went wrong');
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1100,
                background: 'rgba(0,0,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: C.white, borderRadius: 16, width: '100%', maxWidth: 480,
                    maxHeight: '85vh', overflow: 'auto',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', padding: '28px 28px 0' }}>
                    {isVerify ? <CheckCircle /> : <XCircle />}
                    <h2 style={{ fontFamily: DISPLAY, fontSize: '1.1rem', color: C.sapphire, margin: '12px 0 0' }}>
                        {isVerify ? 'Verify Certificate' : 'Reject Certificate'}
                    </h2>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 28px' }}>
                    {isVerify ? (
                        <>
                            <p style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, margin: '0 0 16px' }}>
                                You are about to verify the <strong>{cert.issued_by}</strong> certificate
                                for <strong>{cert.gem?.title || 'this gem'}</strong>.
                            </p>
                            <ul style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, paddingLeft: 20, margin: '0 0 18px' }}>
                                <li>Certificate marked as verified</li>
                                <li>Gem listing updated with verified badge</li>
                                <li>Seller notified</li>
                                <li>First verified cert marks seller as verified</li>
                            </ul>
                            <label style={{ display: 'block', fontFamily: BODY, fontSize: '0.68rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                maxLength={500}
                                placeholder="Add any notes about this verification..."
                                style={{
                                    width: '100%', minHeight: 80, padding: '10px 12px', borderRadius: 8,
                                    border: `1px solid ${C.border}`, fontFamily: BODY, fontSize: '0.82rem',
                                    color: C.text, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </>
                    ) : (
                        <>
                            {/* Warning banner */}
                            <div style={{
                                background: 'rgba(185,28,28,0.06)', borderRadius: 10, padding: 16, marginBottom: 16,
                                fontFamily: BODY, fontSize: '0.78rem', color: C.red,
                            }}>
                                This action will notify the seller. They can resubmit with corrections.
                            </div>

                            <label style={{ display: 'block', fontFamily: BODY, fontSize: '0.68rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                Rejection Reason *
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => { setNotes(e.target.value); setError(''); }}
                                maxLength={500}
                                placeholder="Explain why this certificate is being rejected..."
                                style={{
                                    width: '100%', minHeight: 100, padding: '10px 12px', borderRadius: 8,
                                    border: `1px solid ${error && notes.trim().length < 10 ? C.red : C.border}`,
                                    fontFamily: BODY, fontSize: '0.82rem', color: C.text,
                                    resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                            <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint, textAlign: 'right', marginTop: 4 }}>
                                {notes.length} / 500
                            </div>

                            {/* Quick fill chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                                {QUICK_REASONS.map(reason => (
                                    <button key={reason} onClick={() => { setNotes(reason); setError(''); }} style={{
                                        padding: '5px 12px', borderRadius: 20,
                                        border: `1px solid ${C.border}`, background: C.white,
                                        fontFamily: BODY, fontSize: '0.68rem', color: C.muted,
                                        cursor: 'pointer', transition: 'border-color 0.15s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.sapphire; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                                    >{reason}</button>
                                ))}
                            </div>
                        </>
                    )}

                    {error && (
                        <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.red, marginTop: 10 }}>{error}</div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex', gap: 10, padding: '0 28px 24px', justifyContent: 'flex-end',
                }}>
                    <button onClick={onClose} style={{
                        padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                        background: 'transparent', border: `1px solid ${C.border}`,
                        fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: C.muted,
                    }}>Cancel</button>
                    <button disabled={loading} onClick={handleConfirm} style={{
                        padding: '10px 20px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        background: isVerify ? '#1D9E75' : C.red, color: C.white,
                        fontFamily: BODY, fontSize: '0.82rem', fontWeight: 700,
                        opacity: loading ? 0.6 : 1,
                    }}>
                        {loading ? 'Processing...' : isVerify ? 'Confirm Verification' : 'Confirm Rejection'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyRejectModal;
