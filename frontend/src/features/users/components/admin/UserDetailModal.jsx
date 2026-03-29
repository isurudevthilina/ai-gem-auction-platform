import React from 'react';
import { useGetUserById, useAdminUpdateUser } from '../../hooks/useUserManagement';

const C = { bg: '#F0EDE8', sapphire: '#1A4D8C', gold: '#C4892A', green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6' };
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

function fmt(v) { return v != null && v !== 0 ? Number(v).toLocaleString() : '—'; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
function timeAgo(d) {
  if (!d) return 'Never';
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const roleBadge = (role) => {
  const map = { buyer: { bg: 'rgba(154,154,171,0.12)', color: C.faint }, seller: { bg: 'rgba(196,137,42,0.10)', color: C.gold }, admin: { bg: C.sapphire, color: C.bg } };
  const s = map[role] || map.buyer;
  return <span style={{ fontFamily: BODY, fontSize: '0.72rem', padding: '4px 12px', borderRadius: 8, background: s.bg, color: s.color, fontWeight: 600, textTransform: 'capitalize' }}>{role}</span>;
};
const verifyBadge = (v) => v
  ? <span style={{ fontFamily: BODY, fontSize: '0.68rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(22,163,74,0.08)', color: C.green }}>Verified</span>
  : <span style={{ fontFamily: BODY, fontSize: '0.68rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(180,83,9,0.08)', color: '#B45309' }}>Unverified</span>;

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `0.5px solid ${C.border}` }}>
    <span style={{ fontFamily: BODY, fontSize: '0.62rem', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    <span style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</span>
  </div>
);

const StatRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
    <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted }}>{label}</span>
    <span style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, fontWeight: 600 }}>{value}</span>
  </div>
);

export default function UserDetailModal({ userId, onClose, onChangeRole, onDeactivate }) {
  const { data, isLoading } = useGetUserById(userId);
  const user = data?.data || null;
  const updateMut = useAdminUpdateUser();

  const toggleVerify = () => {
    if (!user) return;
    updateMut.mutate({ id: userId, data: { is_verified: !user.is_verified } });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 18, maxWidth: 700, width: '95%', maxHeight: '90vh', overflow: 'auto', padding: 32 }} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: C.muted }}>×</button>

        {isLoading || !user ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} style={{ height: 16, borderRadius: 6, background: C.border, opacity: 0.5 }} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.sapphire, color: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 700 }}>
                  {(user.full_name || user.email || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: '1.1rem', color: C.sapphire }}>{user.full_name || '—'}</span>
                  {roleBadge(user.role)}
                  {verifyBadge(user.is_verified)}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: C.faint }}>User ID: {user.id?.slice(0, 8)}</div>
              </div>
            </div>

            {/* Two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* LEFT — Account Details */}
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: '0.72rem', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Account Details</div>
                <Row label="Email" value={user.email} />
                <Row label="Phone" value={user.phone_number} />
                <Row label="Location" value={[user.city, user.district, user.province].filter(Boolean).join(', ') || null} />
                {(user.role === 'seller' || user.nic_number) && <Row label="NIC" value={user.nic_number} />}
                {user.business_name && <Row label="Business Name" value={user.business_name} />}
                {user.business_registration_number && <Row label="Business Reg" value={user.business_registration_number} />}
                <Row label="Member Since" value={fmtDate(user.created_at)} />
                <Row label="Last Login" value={timeAgo(user.last_login_at)} />
                <Row label="Updated" value={timeAgo(user.updated_at)} />
              </div>

              {/* RIGHT — Platform Activity */}
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: '0.72rem', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Platform Activity</div>
                {(user.role === 'seller' || (user.total_listings || 0) > 0) && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.gold, textTransform: 'uppercase', marginBottom: 4 }}>Seller</div>
                    <StatRow label="Total Listings" value={user.total_listings ?? 0} />
                    <StatRow label="Active Listings" value={user.active_listings ?? 0} />
                    <StatRow label="Sold Listings" value={user.sold_listings ?? 0} />
                    <StatRow label="Total Auctions" value={user.total_auctions ?? 0} />
                    <StatRow label="Active Auctions" value={user.active_auctions ?? 0} />
                    <StatRow label="Total Earned" value={fmt(user.total_earned)} />
                    <StatRow label="Verified Certs" value={user.verified_certs ?? 0} />
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.sapphire, textTransform: 'uppercase', marginBottom: 4 }}>Buyer</div>
                  <StatRow label="Total Bids" value={user.total_bids ?? 0} />
                  <StatRow label="Total Bid Value" value={fmt(user.total_bid_value)} />
                  <StatRow label="Purchases Made" value={user.purchases_made ?? 0} />
                </div>
                <div>
                  <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>Reviews</div>
                  <StatRow label="Reviews Written" value={user.reviews_given ?? 0} />
                  <StatRow label="Avg Rating Given" value={user.avg_rating_given ?? '—'} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: `0.5px solid ${C.border}` }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => onChangeRole(user)}
                  style={{ fontFamily: BODY, fontSize: '0.78rem', padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.sapphire}`, background: 'transparent', color: C.sapphire, cursor: 'pointer' }}>
                  Change Role
                </button>
                <button onClick={() => onDeactivate(user)} disabled={user.role === 'admin'}
                  title={user.role === 'admin' ? 'Cannot deactivate admin accounts' : ''}
                  style={{ fontFamily: BODY, fontSize: '0.78rem', padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.red}`, background: 'transparent', color: C.red, cursor: user.role === 'admin' ? 'not-allowed' : 'pointer', opacity: user.role === 'admin' ? 0.4 : 1 }}>
                  Deactivate Account
                </button>
              </div>
              {user.role === 'seller' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.muted }}>Seller Verified</span>
                  <button onClick={toggleVerify} disabled={updateMut.isPending}
                    style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative', background: user.is_verified ? C.green : C.border, transition: 'background 0.2s' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: user.is_verified ? 21 : 3, transition: 'left 0.2s' }} />
                  </button>
                  {updateMut.isPending && <span style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint }}>Saving...</span>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
