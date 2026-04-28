import { useMemo, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useSendAuthorityVerification } from '../hooks/useCertificates';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B',
    faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const DEMO_AUTHORITY_EMAILS = {
    GIA: 'demo-gia@example.com',
    AGS: 'demo-ags@example.com',
    IGI: 'demo-igi@example.com',
    GRS: 'demo-grs@example.com',
    GIT: 'demo-git@example.com',
    GGTL: 'demo-ggtl@example.com',
    Gübelin: 'demo-gubelin@example.com',
    Other: 'demo-authority@example.com',
};

const AuthorityEmailModal = ({ cert, onClose, onSuccess }) => {
    const defaultEmail = useMemo(
        () => DEMO_AUTHORITY_EMAILS[cert?.issued_by] || DEMO_AUTHORITY_EMAILS.Other,
        [cert?.issued_by]
    );
    const [authorityEmail, setAuthorityEmail] = useState(defaultEmail);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const sendMut = useSendAuthorityVerification();

    if (!cert) return null;

    const handleConfirm = async () => {
        setError('');
        try {
            await sendMut.mutateAsync({
                id: cert.id,
                payload: {
                    authority_email: authorityEmail.trim() || undefined,
                    notes: notes.trim() || undefined,
                },
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err?.message || 'Failed to send authority email');
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1120,
                background: 'rgba(0,0,0,0.38)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: C.white, borderRadius: 16, width: '100%', maxWidth: 500,
                    maxHeight: '85vh', overflow: 'auto',
                }}
            >
                <div style={{ textAlign: 'center', padding: '28px 28px 0' }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: '50%', margin: '0 auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(26,77,140,0.08)', color: C.sapphire,
                    }}>
                        <MailCheck size={24} />
                    </div>
                    <h2 style={{ fontFamily: DISPLAY, fontSize: '1.08rem', color: C.sapphire, margin: '12px 0 0' }}>
                        Send to Authority
                    </h2>
                </div>

                <div style={{ padding: '20px 28px' }}>
                    <p style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, margin: '0 0 16px', lineHeight: 1.5 }}>
                        Send the <strong>{cert.issued_by}</strong> certificate
                        {cert.certificate_number ? <strong> #{cert.certificate_number}</strong> : null}
                        {' '}to the authority email. This will mark authority approval for demo review, but admin verification is still required.
                    </p>

                    <label style={{ display: 'block', fontFamily: BODY, fontSize: '0.68rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        Authority Email
                    </label>
                    <input
                        type="email"
                        value={authorityEmail}
                        onChange={(e) => { setAuthorityEmail(e.target.value); setError(''); }}
                        style={{
                            width: '100%', padding: '10px 12px', borderRadius: 8,
                            border: `1px solid ${C.border}`, fontFamily: BODY,
                            fontSize: '0.82rem', color: C.text, boxSizing: 'border-box',
                            outline: 'none',
                        }}
                    />

                    <label style={{ display: 'block', fontFamily: BODY, fontSize: '0.68rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 6px' }}>
                        Admin Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={500}
                        placeholder="Optional message to include in the authority email..."
                        style={{
                            width: '100%', minHeight: 90, padding: '10px 12px',
                            borderRadius: 8, border: `1px solid ${C.border}`,
                            fontFamily: BODY, fontSize: '0.82rem', color: C.text,
                            resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                    <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint, textAlign: 'right', marginTop: 4 }}>
                        {notes.length} / 500
                    </div>

                    <div style={{
                        marginTop: 14, background: 'rgba(196,137,42,0.08)', borderRadius: 10,
                        padding: '12px 14px', fontFamily: BODY, fontSize: '0.76rem',
                        color: C.muted, lineHeight: 1.45,
                    }}>
                        This demo sends a secure signed certificate link by email and records authority approval. The certificate remains pending until an admin verifies it.
                    </div>

                    {error && (
                        <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.red, marginTop: 10 }}>{error}</div>
                    )}
                </div>

                <div style={{
                    display: 'flex', gap: 10, padding: '0 28px 24px',
                    justifyContent: 'flex-end',
                }}>
                    <button onClick={onClose} style={{
                        padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                        background: 'transparent', border: `1px solid ${C.border}`,
                        fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: C.muted,
                    }}>Cancel</button>
                    <button disabled={sendMut.isPending} onClick={handleConfirm} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 10, border: 'none',
                        cursor: sendMut.isPending ? 'not-allowed' : 'pointer',
                        background: C.sapphire, color: C.white,
                        fontFamily: BODY, fontSize: '0.82rem', fontWeight: 700,
                        opacity: sendMut.isPending ? 0.6 : 1,
                    }}>
                        <MailCheck size={16} />
                        {sendMut.isPending ? 'Sending...' : 'Send Email'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthorityEmailModal;
