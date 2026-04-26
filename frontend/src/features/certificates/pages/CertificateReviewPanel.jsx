import { useState } from 'react';
import AdminSidebar from '../../users/components/admin/AdminSidebar';
import { SIDEBAR_W } from '../../../shared/components/DashboardSidebar';
import { useGetAdminCertificates, useGetCertStats } from '../hooks/useCertificates';
import CertificateFilters from '../components/CertificateFilters';
import CertificateCard from '../components/CertificateCard';
import CertificateDetailModal from '../components/CertificateDetailModal';
import VerifyRejectModal from '../components/VerifyRejectModal';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B',
    faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const ShieldSvg = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const CheckCircleSvg = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
    </svg>
);

const STAT_CARDS = [
    { key: 'pending', label: 'Pending', colorFn: (v) => v > 0 ? '#B45309' : C.green },
    { key: 'verified', label: 'Verified', colorFn: () => C.green },
    { key: 'rejected', label: 'Rejected', colorFn: () => C.red },
    { key: 'total', label: 'Total', colorFn: () => C.sapphire },
];

const CertificateReviewPanel = () => {
    const [filters, setFilters] = useState({
        status: 'pending', issued_by: null, sort: 'oldest', page: 0, limit: 12,
    });
    const [selectedCert, setSelectedCert] = useState(null);
    const [actionModal, setActionModal] = useState(null);
    const [toast, setToast] = useState(null);

    const { data: certsData, isLoading } = useGetAdminCertificates(filters);
    const { data: statsRes } = useGetCertStats();
    const stats = statsRes?.data || null;
    const certs = certsData?.data?.data || [];
    const totalCount = certsData?.data?.count ?? 0;
    const totalPages = Math.ceil(totalCount / filters.limit);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const rangeStart = filters.page * filters.limit + 1;
    const rangeEnd = Math.min((filters.page + 1) * filters.limit, totalCount);

    return (
        <div style={{ minHeight: 'calc(100vh - 88px)', background: C.bg }}>
            <AdminSidebar pendingCount={stats?.pending || 0} />

            <main style={{ marginLeft: SIDEBAR_W, padding: '32px 40px', overflowY: 'auto' }}>
                {/* Toast */}
                {toast && (
                    <div style={{
                        position: 'fixed', top: 24, right: 24, zIndex: 1200,
                        padding: '10px 18px', borderRadius: 10,
                        background: toast.type === 'error' ? 'rgba(185,28,28,0.1)' : 'rgba(22,163,74,0.1)',
                        color: toast.type === 'error' ? C.red : C.green,
                        fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600,
                        border: `1px solid ${toast.type === 'error' ? 'rgba(185,28,28,0.2)' : 'rgba(22,163,74,0.2)'}`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}>{toast.msg}</div>
                )}

                {/* Header */}
                <h1 style={{ fontFamily: DISPLAY, fontSize: '1.5rem', color: C.sapphire, margin: '0 0 4px' }}>
                    Certificate Review
                </h1>
                <p style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, margin: '0 0 24px' }}>
                    Review and verify gem certification documents
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    {STAT_CARDS.map(sc => {
                        const val = stats ? stats[sc.key] : '—';
                        return (
                            <div key={sc.key} style={{
                                flex: 1, background: C.white, border: `0.5px solid ${C.border}`,
                                borderRadius: 14, padding: '16px 20px',
                            }}>
                                <div style={{ fontFamily: BODY, fontSize: '0.68rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                                    {sc.label}
                                </div>
                                <div style={{
                                    fontFamily: DISPLAY, fontSize: '1.4rem', fontWeight: 700,
                                    color: stats ? sc.colorFn(stats[sc.key]) : C.faint,
                                }}>
                                    {val}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div style={{ marginBottom: 20 }}>
                    <CertificateFilters filters={filters} onChange={setFilters} stats={stats} />
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                                background: C.white, borderRadius: 14, height: 260,
                                border: `0.5px solid ${C.border}`,
                                animation: 'certShimmer 1.5s infinite',
                            }} />
                        ))}
                        <style>{`@keyframes certShimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
                    </div>
                ) : certs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                        {filters.status === 'pending' ? <CheckCircleSvg /> : <ShieldSvg />}
                        <h3 style={{ fontFamily: DISPLAY, fontSize: '1.1rem', color: C.sapphire, margin: '16px 0 6px' }}>
                            {filters.status === 'pending' ? 'All caught up!' : `No ${filters.status === 'all' ? '' : filters.status} certificates`}
                        </h3>
                        <p style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted, margin: 0 }}>
                            {filters.status === 'pending' ? 'No certificates awaiting review.' : 'Nothing to show here yet.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {certs.map(cert => (
                                <CertificateCard
                                    key={cert.id}
                                    cert={cert}
                                    onVerify={(c) => setActionModal({ mode: 'verify', cert: c })}
                                    onReject={(c) => setActionModal({ mode: 'reject', cert: c })}
                                    onViewDetail={(c) => setSelectedCert(c)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalCount > 0 && (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginTop: 24, padding: '12px 0',
                            }}>
                                <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.muted }}>
                                    Showing {rangeStart}–{rangeEnd} of {totalCount} certificates
                                </span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        disabled={filters.page === 0}
                                        onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                                        style={{
                                            padding: '6px 14px', borderRadius: 8, cursor: filters.page === 0 ? 'not-allowed' : 'pointer',
                                            border: `1px solid ${C.border}`, background: C.white,
                                            fontFamily: BODY, fontSize: '0.75rem', color: filters.page === 0 ? C.faint : C.text,
                                            opacity: filters.page === 0 ? 0.5 : 1,
                                        }}
                                    >Prev</button>
                                    <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.muted, padding: '6px 8px' }}>
                                        {filters.page + 1} / {totalPages}
                                    </span>
                                    <button
                                        disabled={filters.page >= totalPages - 1}
                                        onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                                        style={{
                                            padding: '6px 14px', borderRadius: 8, cursor: filters.page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                                            border: `1px solid ${C.border}`, background: C.white,
                                            fontFamily: BODY, fontSize: '0.75rem', color: filters.page >= totalPages - 1 ? C.faint : C.text,
                                            opacity: filters.page >= totalPages - 1 ? 0.5 : 1,
                                        }}
                                    >Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Detail modal */}
                {selectedCert && (
                    <CertificateDetailModal
                        cert={selectedCert}
                        onClose={() => setSelectedCert(null)}
                        onVerify={(c) => setActionModal({ mode: 'verify', cert: c })}
                        onReject={(c) => setActionModal({ mode: 'reject', cert: c })}
                    />
                )}

                {/* Verify/Reject modal */}
                {actionModal && (
                    <VerifyRejectModal
                        mode={actionModal.mode}
                        cert={actionModal.cert}
                        onClose={() => setActionModal(null)}
                        onSuccess={() => {
                            setActionModal(null);
                            setSelectedCert(null);
                            showToast(
                                actionModal.mode === 'verify'
                                    ? 'Certificate verified successfully'
                                    : 'Certificate rejected'
                            );
                        }}
                    />
                )}
            </main>
        </div>
    );
};

export default CertificateReviewPanel;
