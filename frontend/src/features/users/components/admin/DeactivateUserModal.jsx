import React, { useState } from 'react';
import { useAdminDeactivateUser } from '../../hooks/useUserManagement';

const C = { bg: '#F0EDE8', sapphire: '#1A4D8C', gold: '#C4892A', green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6' };
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

export default function DeactivateUserModal({ user, onClose, onSuccess }) {
  const [confirm, setConfirm] = useState('');
  const mutation = useAdminDeactivateUser();
  const emailMatch = confirm.trim().toLowerCase() === (user.email || '').toLowerCase();

  const submit = () => {
    if (!emailMatch) return;
    mutation.mutate(user.id, {
      onSuccess: () => onSuccess('Account deactivated'),
    });
  };

  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, maxWidth: 480, width: '95%', padding: 28 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(185,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
          </div>
          <span style={{ fontFamily: DISPLAY, fontSize: '1rem', color: C.sapphire }}>Deactivate Account</span>
        </div>

        {/* User info card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, border: `0.5px solid ${C.border}`, borderRadius: 10, marginBottom: 16 }}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.sapphire, color: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: '0.75rem', fontWeight: 700 }}>
              {(user.full_name || user.email || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, fontWeight: 600 }}>{user.full_name || '—'}</div>
            <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint }}>{user.email} · {user.role} · Joined {joined}</div>
          </div>
        </div>

        {/* Warning */}
        <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.red, fontWeight: 600, marginBottom: 10 }}>
          This action is permanent.
        </div>
        <ul style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, paddingLeft: 20, margin: '0 0 16px', lineHeight: 1.7 }}>
          <li>User signed out immediately</li>
          <li>All sessions invalidated</li>
          <li>Account data permanently deleted</li>
          <li>Active listings remain but cannot be edited</li>
          <li>Completed transactions preserved</li>
          <li>Cannot be undone</li>
        </ul>

        {/* Error from backend */}
        {mutation.isError && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(185,28,28,0.06)', border: `1px solid rgba(185,28,28,0.15)`, marginBottom: 14 }}>
            <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.red }}>
              {mutation.error?.message || 'Failed to deactivate account'}
            </span>
          </div>
        )}

        {/* Confirmation */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted, display: 'block', marginBottom: 6 }}>
            Type the user's email to confirm:
          </label>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={user.email}
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: BODY, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose}
            style={{ fontFamily: BODY, fontSize: '0.78rem', padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={submit} disabled={!emailMatch || mutation.isPending}
            style={{ fontFamily: BODY, fontSize: '0.78rem', padding: '8px 18px', borderRadius: 8, border: 'none', background: emailMatch ? C.red : C.border, color: '#fff', cursor: emailMatch ? 'pointer' : 'not-allowed', opacity: mutation.isPending ? 0.7 : 1 }}>
            {mutation.isPending ? 'Deactivating...' : 'Deactivate Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
