import { useMemo, useState } from 'react';
import { useGetReviewReports, useResolveReviewReport } from '../hooks/useReviews';
import AdminSidebar from '../../users/components/admin/AdminSidebar';
import { SIDEBAR_W } from '../../../shared/components/DashboardSidebar';

const C = {
  bg: '#F0EDE8',
  white: '#FFFFFF',
  sapphire: '#1A4D8C',
  gold: '#C4892A',
  text: '#1A1A2E',
  muted: '#6B6B7B',
  faint: '#9A9AAB',
  border: '#E0DCD6',
  red: '#B91C1C',
  green: '#16a34a',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const statusOptions = [
  { value: 'open', label: 'Open Reports' },
  { value: 'resolved', label: 'Resolved Reports' },
];

const AdminReviewModerationPage = () => {
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(0);
  const limit = 20;

  const reportsQuery = useGetReviewReports({ status, page, limit });
  const resolveMutation = useResolveReviewReport();

  const reports = reportsQuery.data?.data || [];
  const total = reportsQuery.data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const summary = useMemo(() => {
    const openCount = status === 'open' ? total : reports.filter((r) => r.status === 'open').length;
    return { openCount, total };
  }, [reports, status, total]);

  const handleDismiss = (reportId) => {
    if (!window.confirm('Dismiss this report?')) return;
    resolveMutation.mutate({ reportId, action: 'dismissed' });
  };

  const handleRemoveAndWarn = (reportId) => {
    const warning = window.prompt(
      'Warning message to send reviewer:',
      'Your review was removed because it violated community guidelines. Please keep reviews respectful and appropriate.'
    );
    if (!warning || warning.trim().length < 10) {
      window.alert('Please provide a warning message (at least 10 characters).');
      return;
    }

    resolveMutation.mutate({
      reportId,
      action: 'removed_and_warned',
      warning_message: warning.trim(),
      admin_note: 'Review removed and user warned by admin moderation.',
    });
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 88px)', background: C.bg }}>
      <AdminSidebar />

      <main style={{ marginLeft: SIDEBAR_W, padding: '32px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: '1.5rem', margin: 0, color: C.sapphire }}>
              Review Moderation
            </h1>
            <div style={{ fontFamily: BODY, color: C.muted, fontSize: '0.82rem', marginTop: 6 }}>
              Manage seller-reported inappropriate reviews and issue warnings.
            </div>
          </div>
          <button
            onClick={() => reportsQuery.refetch()}
            style={{
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.sapphire,
              borderRadius: 10,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: '0.78rem',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {statusOptions.map((opt) => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setStatus(opt.value);
                  setPage(0);
                }}
                style={{
                  border: `1px solid ${active ? C.gold : C.border}`,
                  background: active ? 'rgba(196,137,42,0.12)' : C.white,
                  color: active ? C.gold : C.muted,
                  borderRadius: 20,
                  fontFamily: BODY,
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  padding: '7px 14px',
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.faint, marginBottom: 16 }}>
          Open: {summary.openCount} · Total matching: {summary.total}
        </div>

        {reportsQuery.isLoading ? (
          <div style={{ fontFamily: BODY, color: C.muted }}>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 28,
            fontFamily: BODY,
            color: C.muted,
          }}>
            No reports found for this filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reports.map((report) => {
              const reviewText = report.review?.comment || report.review_comment_snapshot || 'Review text unavailable';
              return (
                <div key={report.id} style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: 18,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
                        Reported {new Date(report.created_at).toLocaleString()}
                      </div>
                      <div style={{ fontFamily: DISPLAY, fontSize: '1rem', color: C.sapphire, marginTop: 4 }}>
                        {report.status === 'open' ? 'Open Moderation Case' : 'Resolved Moderation Case'}
                      </div>
                    </div>
                    <span style={{
                      borderRadius: 16,
                      padding: '4px 10px',
                      fontFamily: BODY,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: report.status === 'open' ? '#92400e' : C.green,
                      background: report.status === 'open' ? 'rgba(217,119,6,0.12)' : 'rgba(22,163,74,0.12)',
                    }}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ marginTop: 12, fontFamily: BODY, fontSize: '0.82rem', color: C.text, lineHeight: 1.7 }}>
                    <div><strong>Seller (Reporter):</strong> {report.seller?.full_name || 'Unknown'}</div>
                    <div><strong>Reviewer:</strong> {report.reviewer?.full_name || 'Unknown'}</div>
                    <div><strong>Seller Reason:</strong> {report.reason}</div>
                    <div><strong>Review Content:</strong> {reviewText}</div>
                  </div>

                  {report.status === 'open' ? (
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <button
                        onClick={() => handleRemoveAndWarn(report.id)}
                        disabled={resolveMutation.isPending}
                        style={{
                          border: 'none',
                          background: C.red,
                          color: '#fff',
                          borderRadius: 10,
                          fontFamily: BODY,
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          padding: '9px 14px',
                          cursor: 'pointer',
                          opacity: resolveMutation.isPending ? 0.7 : 1,
                        }}
                      >
                        Remove Review + Warn User
                      </button>
                      <button
                        onClick={() => handleDismiss(report.id)}
                        disabled={resolveMutation.isPending}
                        style={{
                          border: `1px solid ${C.border}`,
                          background: C.white,
                          color: C.sapphire,
                          borderRadius: 10,
                          fontFamily: BODY,
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          padding: '9px 14px',
                          cursor: 'pointer',
                          opacity: resolveMutation.isPending ? 0.7 : 1,
                        }}
                      >
                        Dismiss Report
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>
                      <div><strong>Action:</strong> {report.action_taken || 'N/A'}</div>
                      <div><strong>Admin Note:</strong> {report.admin_note || 'None'}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
              style={{
                border: `1px solid ${C.border}`,
                background: C.white,
                color: C.sapphire,
                borderRadius: 8,
                fontFamily: BODY,
                fontSize: '0.78rem',
                padding: '6px 12px',
                cursor: 'pointer',
                opacity: page <= 0 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <span style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                border: `1px solid ${C.border}`,
                background: C.white,
                color: C.sapphire,
                borderRadius: 8,
                fontFamily: BODY,
                fontSize: '0.78rem',
                padding: '6px 12px',
                cursor: 'pointer',
                opacity: page >= totalPages - 1 ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReviewModerationPage;
