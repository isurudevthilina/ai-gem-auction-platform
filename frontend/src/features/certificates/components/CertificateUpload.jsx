import { useState, useEffect, useRef } from 'react';
import { getMyGems } from '../../gems/services/gemsService';
import {
    getCertificates, getUploadUrl,
    uploadCertificateFile, createCertificate,
    deleteCertificate,
} from '../services/certificatesService';

/* ─── Design tokens ─── */
const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const CERT_BODIES = ['GIA', 'GRS', 'IGI', 'AGS', 'GIT', 'GGTL', 'Gübelin', 'Other'];

const STATUS_STYLES = {
    pending:  { bg: 'rgba(180,83,9,0.08)', color: '#92400e', border: 'rgba(180,83,9,0.15)', label: 'Pending Review' },
    verified: { bg: 'rgba(22,163,74,0.08)', color: C.green, border: 'rgba(22,163,74,0.15)', label: 'Verified' },
    rejected: { bg: 'rgba(185,28,28,0.06)', color: C.red, border: 'rgba(185,28,28,0.12)', label: 'Rejected' },
};

/* PDF icon SVG */
const PdfIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.sapphire}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

/* Gem SVG placeholder */
const GemPlaceholderSmall = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.faint}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
        <path d="m16 16 6-6" /><path d="m8 8 6-6" />
        <path d="m9 7 8 8" /><path d="m21 11-8-8" />
    </svg>
);

const CertificateUpload = () => {
    const fileRef = useRef(null);
    const [gems, setGems] = useState([]);
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [gemId, setGemId] = useState('');
    const [certBody, setCertBody] = useState('');
    const [certNumber, setCertNumber] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStep, setUploadStep] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [gemsRes, certsRes] = await Promise.all([
                getMyGems(),
                getCertificates(),
            ]);
            setGems((gemsRes?.data || []).filter(g => g.status !== 'sold'));
            setCerts(certsRes?.data || []);
        } catch (err) {
            console.error('CertificateUpload load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleFileSelect = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.type !== 'application/pdf') {
            showToast('Only PDF files are accepted.', 'error');
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            showToast('File must be under 10MB.', 'error');
            return;
        }
        setFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer?.files?.[0];
        if (f) {
            if (f.type !== 'application/pdf') {
                showToast('Only PDF files are accepted.', 'error');
                return;
            }
            if (f.size > 10 * 1024 * 1024) {
                showToast('File must be under 10MB.', 'error');
                return;
            }
            setFile(f);
        }
    };

    const clearForm = () => {
        setGemId('');
        setCertBody('');
        setCertNumber('');
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!gemId || !certBody || !file) return;

        setUploading(true);
        try {
            // Step 1: get signed upload URL
            setUploadStep('Uploading file...');
            const urlRes = await getUploadUrl('pdf');
            const { path, token } = urlRes.data;

            // Step 2: upload to storage
            const documentUrl = await uploadCertificateFile(path, token, file);

            // Step 3: create record
            setUploadStep('Saving record...');
            const newCert = await createCertificate({
                gem_id: gemId,
                document_url: documentUrl,
                issued_by: certBody,
                certificate_number: certNumber || undefined,
            });

            showToast('Certificate submitted for verification');
            if (newCert?.data) setCerts(prev => [newCert.data, ...prev]);
            clearForm();
        } catch (err) {
            showToast(err?.message || 'Upload failed', 'error');
        } finally {
            setUploading(false);
            setUploadStep('');
        }
    };

    const handleReupload = (cert) => {
        setGemId(cert.gem_id);
        setCertBody(cert.issued_by || '');
        setCertNumber(cert.certificate_number || '');
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (cert) => {
        if (!confirm('Delete this certificate? This cannot be undone.')) return;
        try {
            await deleteCertificate(cert.id);
            setCerts(prev => prev.filter(c => c.id !== cert.id));
            showToast('Certificate deleted');
        } catch (err) {
            showToast(err?.message || 'Delete failed', 'error');
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    if (loading) {
        return (
            <div>
                {[1, 2].map(i => (
                    <div key={i} style={{
                        background: C.white, borderRadius: 14, height: 120, marginBottom: 16,
                        border: `1px solid ${C.border}`, animation: 'shimmer 1.5s infinite',
                    }} />
                ))}
                <style>{`@keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
            </div>
        );
    }

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24,
                    padding: '10px 18px', borderRadius: 10,
                    background: toast.type === 'error' ? 'rgba(185,28,28,0.1)' : 'rgba(22,163,74,0.1)',
                    color: toast.type === 'error' ? C.red : C.green,
                    fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600,
                    border: `1px solid ${toast.type === 'error' ? 'rgba(185,28,28,0.2)' : 'rgba(22,163,74,0.2)'}`,
                    zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                    {toast.msg}
                </div>
            )}

            {/* ═══ SECTION 1: Upload form ═══ */}
            <div style={{
                background: C.white, borderRadius: 14, padding: 28,
                border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                marginBottom: 32,
            }}>
                <h3 style={{ fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 700, color: C.text, margin: '0 0 4px' }}>
                    Upload Certificate
                </h3>
                <p style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted, margin: '0 0 22px' }}>
                    Upload your GIA, GRS, or other certification PDF
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        {/* Select Gem */}
                        <div>
                            <label style={{ display: 'block', fontFamily: BODY, fontSize: '0.7rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                Select Gem *
                            </label>
                            <select value={gemId} onChange={e => setGemId(e.target.value)} required style={{
                                width: '100%', padding: '10px 13px', borderRadius: 8,
                                border: `1px solid ${C.border}`, background: C.white,
                                fontFamily: BODY, fontSize: '0.85rem', color: gemId ? C.text : C.faint,
                                outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
                            }}>
                                <option value="">Choose a gem...</option>
                                {gems.map(g => (
                                    <option key={g.id} value={g.id}>
                                        {g.title} {g.carat_weight ? `\u2014 ${g.carat_weight}ct` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Certification Body */}
                        <div>
                            <label style={{ display: 'block', fontFamily: BODY, fontSize: '0.7rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                Certification Body *
                            </label>
                            <select value={certBody} onChange={e => setCertBody(e.target.value)} required style={{
                                width: '100%', padding: '10px 13px', borderRadius: 8,
                                border: `1px solid ${C.border}`, background: C.white,
                                fontFamily: BODY, fontSize: '0.85rem', color: certBody ? C.text : C.faint,
                                outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
                            }}>
                                <option value="">Select body...</option>
                                {CERT_BODIES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        {/* Certificate Number */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontFamily: BODY, fontSize: '0.7rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                Certificate Number
                            </label>
                            <input
                                type="text" value={certNumber} maxLength={80}
                                onChange={e => setCertNumber(e.target.value)}
                                placeholder="e.g. GIA 2141438071"
                                style={{
                                    width: '100%', padding: '10px 13px', borderRadius: 8,
                                    border: `1px solid ${C.border}`, background: C.white,
                                    fontFamily: BODY, fontSize: '0.85rem', color: C.text,
                                    outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {/* File upload zone */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontFamily: BODY, fontSize: '0.7rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                Upload PDF *
                            </label>
                            {!file ? (
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={e => e.preventDefault()}
                                    style={{
                                        border: `2px dashed rgba(26,77,140,0.30)`,
                                        borderRadius: 10, padding: '32px 20px',
                                        textAlign: 'center', cursor: 'pointer',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.sapphire; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,77,140,0.30)'; }}
                                >
                                    <PdfIcon />
                                    <div style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.muted, fontWeight: 600, marginTop: 10 }}>
                                        Click to upload or drag PDF here
                                    </div>
                                    <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, marginTop: 4 }}>
                                        PDF only &mdash; max 10MB
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 16px', borderRadius: 8,
                                    border: `1px solid ${C.border}`, background: C.bg,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <PdfIcon />
                                        <div>
                                            <div style={{ fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: C.text }}>{file.name}</div>
                                            <div style={{ fontFamily: BODY, fontSize: '0.7rem', color: C.faint }}>{formatSize(file.size)}</div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: C.red, fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600,
                                    }}>Remove</button>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileSelect} />
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={uploading || !gemId || !certBody || !file} style={{
                        marginTop: 22, width: '100%', padding: '13px 0', borderRadius: 10,
                        border: 'none', background: (uploading || !gemId || !certBody || !file) ? C.faint : C.gold,
                        color: '#fff', fontFamily: BODY, fontSize: '0.9rem', fontWeight: 700,
                        cursor: (uploading || !gemId || !certBody || !file) ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.15s',
                    }}>
                        {uploading ? uploadStep || 'Uploading...' : 'Upload Certificate'}
                    </button>
                </form>
            </div>

            {/* ═══ SECTION 2: My Certificates ═══ */}
            <div style={{
                background: C.white, borderRadius: 14, padding: 28,
                border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
                <h3 style={{ fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 700, color: C.text, margin: '0 0 18px' }}>
                    My Certificates
                </h3>

                {certs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: C.faint, fontFamily: BODY, fontSize: '0.88rem' }}>
                        No certificates uploaded yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {certs.map(cert => {
                            const sts = STATUS_STYLES[cert.status] || STATUS_STYLES.pending;
                            const gemCover = cert.gem?.images?.find(u => !u.startsWith('model:'));

                            return (
                                <div key={cert.id}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '12px 16px', borderRadius: 10,
                                        border: `1px solid ${C.border}`,
                                        transition: 'box-shadow 0.15s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        {/* Gem cover */}
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 8, overflow: 'hidden',
                                            background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            {gemCover
                                                ? <img src={gemCover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <GemPlaceholderSmall />
                                            }
                                        </div>

                                        {/* Gem info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontFamily: SERIF, fontSize: '0.88rem', fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {cert.gem?.title || 'Gem'}
                                            </div>
                                            <div style={{ fontFamily: BODY, fontSize: '0.7rem', color: C.faint }}>
                                                {cert.gem?.carat_weight ? `${cert.gem.carat_weight} ct` : ''}
                                            </div>
                                        </div>

                                        {/* Cert body pill + number */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: 20,
                                                background: C.goldLight, color: C.gold,
                                                fontFamily: DISPLAY, fontSize: '0.62rem', fontWeight: 700,
                                                letterSpacing: '0.06em',
                                            }}>{cert.issued_by}</span>
                                            {cert.certificate_number && (
                                                <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.faint }}>
                                                    {cert.certificate_number}
                                                </span>
                                            )}
                                        </div>

                                        {/* Status badge */}
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 20,
                                            background: sts.bg, color: sts.color,
                                            border: `1px solid ${sts.border}`,
                                            fontFamily: BODY, fontSize: '0.68rem', fontWeight: 700,
                                            flexShrink: 0,
                                        }}>{sts.label}</span>

                                        {/* View PDF link */}
                                        {cert.document_url && (
                                            <a href={cert.document_url} target="_blank" rel="noopener noreferrer" style={{
                                                fontFamily: BODY, fontSize: '0.75rem', fontWeight: 600,
                                                color: C.sapphire, textDecoration: 'none', flexShrink: 0,
                                            }}>View PDF</a>
                                        )}

                                        {/* Re-upload button (rejected or pending) */}
                                        {(cert.status === 'rejected' || cert.status === 'pending') && (
                                            <button onClick={() => handleReupload(cert)} style={{
                                                padding: '5px 12px', borderRadius: 6,
                                                border: `1px solid ${C.sapphire}`, background: 'transparent',
                                                color: C.sapphire, fontFamily: BODY, fontSize: '0.72rem',
                                                fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                                            }}>Re-upload</button>
                                        )}

                                        {/* Delete button (all statuses) */}
                                        <button onClick={() => handleDelete(cert)} style={{
                                            padding: '5px 12px', borderRadius: 6,
                                            border: `1px solid ${C.red}`, background: 'transparent',
                                            color: C.red, fontFamily: BODY, fontSize: '0.72rem',
                                            fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                                        }}>Delete</button>
                                    </div>

                                    {/* Rejection reason */}
                                    {cert.status === 'rejected' && cert.notes && (
                                        <div style={{
                                            padding: '6px 16px 6px 70px', fontFamily: BODY,
                                            fontSize: '0.75rem', color: C.red, marginTop: 2,
                                        }}>
                                            {cert.notes}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateUpload;
