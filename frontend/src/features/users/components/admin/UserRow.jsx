import React from 'react';

const C = { bg: '#F0EDE8', sapphire: '#1A4D8C', gold: '#C4892A', green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6' };
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function lastActiveColor(dateStr) {
  if (!dateStr) return C.red;
  const days = (Date.now() - new Date(dateStr).getTime()) / 86400000;
  if (days < 7) return C.green;
  if (days < 30) return '#B45309';
  return C.red;
}

const roleBadge = (role) => {
  const map = {
    buyer: { bg: 'rgba(154,154,171,0.12)', color: C.faint },
    seller: { bg: 'rgba(196,137,42,0.10)', color: C.gold },
    admin: { bg: C.sapphire, color: C.bg },
  };
  const s = map[role] || map.buyer;
  return (
    <span style={{ fontFamily: BODY, fontSize: '0.68rem', padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.color, fontWeight: 600, textTransform: 'capitalize' }}>
      {role}
    </span>
  );
};

const verifyBadge = (verified) => {
  const s = verified
    ? { bg: 'rgba(22,163,74,0.08)', color: C.green, label: 'Verified' }
    : { bg: 'rgba(180,83,9,0.08)', color: '#B45309', label: 'Unverified' };
  return (
    <span style={{ fontFamily: BODY, fontSize: '0.68rem', padding: '3px 10px', borderRadius: 6, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

export default function UserRow({ user, onView, onEdit, onDeactivate, isOwnRow }) {
  const initials = (user.full_name || user.email || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const joinedAgo = timeAgo(user.created_at);
  const lastActive = user.last_login_at ? timeAgo(user.last_login_at) : 'Never';
  const laColor = lastActiveColor(user.last_login_at);

  return (
    <tr style={{ transition: 'background 0.15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(26,77,140,0.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      {/* User */}
      <td style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.sapphire, color: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name || '—'}</div>
          <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          {user.business_name && <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.gold, fontStyle: 'italic' }}>{user.business_name}</div>}
        </div>
      </td>
      {/* Role */}
      <td style={{ padding: '12px 10px' }}>{roleBadge(user.role)}</td>
      {/* Status */}
      <td style={{ padding: '12px 10px' }}>{verifyBadge(user.is_verified)}</td>
      {/* Activity */}
      <td style={{ padding: '12px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', fontFamily: BODY, fontSize: '0.65rem', color: C.muted }}>
          <span>Listings: {user.listing_count ?? 0}</span>
          <span>Auctions: {user.active_auction_count ?? 0}</span>
          <span>Bids: {user.total_bid_count ?? 0}</span>
          <span>Purchases: {user.purchase_count ?? 0}</span>
        </div>
      </td>
      {/* Joined */}
      <td style={{ padding: '12px 10px' }}>
        <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.text }}>{joined}</div>
        {joinedAgo && <div style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint }}>{joinedAgo}</div>}
      </td>
      {/* Last Active */}
      <td style={{ padding: '12px 10px' }}>
        <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: laColor, opacity: lastActive === 'Never' ? 0.6 : 1 }}>{lastActive}</span>
      </td>
      {/* Actions */}
      <td style={{ padding: '12px 10px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onView(user)} title="View Profile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.muted, borderRadius: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
          <button onClick={() => !isOwnRow && onEdit(user)} title={isOwnRow ? 'Cannot edit your own role' : 'Change Role'}
            style={{ background: 'none', border: 'none', cursor: isOwnRow ? 'not-allowed' : 'pointer', padding: 4, color: isOwnRow ? C.border : C.muted, borderRadius: 6, opacity: isOwnRow ? 0.5 : 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
          </button>
          {user.role !== 'admin' && !isOwnRow ? (
            <button onClick={() => onDeactivate(user)} title="Deactivate"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.red, borderRadius: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </button>
          ) : (
            <button disabled title={isOwnRow ? 'Cannot deactivate yourself' : 'Cannot deactivate admin accounts'}
              style={{ background: 'none', border: 'none', cursor: 'not-allowed', padding: 4, color: C.border, borderRadius: 6, opacity: 0.4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
