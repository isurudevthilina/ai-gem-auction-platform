import React, { useState } from 'react';
import { useAdminUpdateUser } from '../../hooks/useUserManagement';

const C = { bg: '#F0EDE8', sapphire: '#1A4D8C', gold: '#C4892A', green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6' };
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const roles = [
  {
    value: 'buyer', label: 'Buyer',
    desc: 'Can browse gems, place bids, and make purchases.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
  },
  {
    value: 'seller', label: 'Seller',
    desc: 'Can list gems, create auctions, and manage certificates.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><rect x="2" y="7" width="20" height="5" rx="1" /></svg>
    ),
  },
  {
    value: 'admin', label: 'Administrator',
    desc: 'Full platform access including user management.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    ),
  },
];

export default function ChangeRoleModal({ user, onClose, onSuccess }) {
  const [selected, setSelected] = useState(user.role);
  const mutation = useAdminUpdateUser();

  const save = () => {
    if (selected === user.role) return;
    mutation.mutate(
      { id: user.id, data: { role: selected } },
      { onSuccess: () => onSuccess(`Role updated to ${selected}`) },
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, maxWidth: 440, width: '95%', padding: 28 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ fontFamily: DISPLAY, fontSize: '1rem', color: C.sapphire, marginBottom: 4 }}>Change User Role</div>
        <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, marginBottom: 20 }}>
          For: {user.full_name || '—'} ({user.email})
        </div>

        {/* Current */}
        <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint, textTransform: 'uppercase', marginBottom: 8 }}>Current Role</div>
        <span style={{ fontFamily: BODY, fontSize: '0.78rem', padding: '5px 14px', borderRadius: 8, background: 'rgba(26,77,140,0.06)', color: C.sapphire, fontWeight: 600, textTransform: 'capitalize', display: 'inline-block', marginBottom: 16 }}>
          {user.role}
        </span>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {roles.map((r) => {
            const active = selected === r.value;
            const isCurrent = user.role === r.value;
            return (
              <button key={r.value} onClick={() => setSelected(r.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: 16,
                  border: active ? `2px solid ${C.sapphire}` : `0.5px solid ${C.border}`,
                  borderRadius: 12, background: active ? 'rgba(26,77,140,0.03)' : '#fff',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                <div style={{ color: active ? C.sapphire : C.muted }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {r.label}
                    {isCurrent && <span style={{ fontFamily: BODY, fontSize: '0.6rem', color: C.green }}>✓ current</span>}
                  </div>
                  <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted }}>{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Warnings */}
        {selected === 'admin' && selected !== user.role && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(185,28,28,0.06)', border: `1px solid rgba(185,28,28,0.15)`, marginBottom: 14 }}>
            <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.red }}>⚠ Only grant admin to trusted team members.</span>
          </div>
        )}
        {user.role === 'seller' && selected === 'buyer' && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(180,83,9,0.06)', border: `1px solid rgba(180,83,9,0.15)`, marginBottom: 14 }}>
            <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: '#B45309' }}>Existing listings will remain but the user cannot create new ones.</span>
          </div>
        )}

        {/* Error */}
        {mutation.isError && (
          <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.red, marginBottom: 10 }}>
            {mutation.error?.message || 'Failed to update role'}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button onClick={onClose}
            style={{ fontFamily: BODY, fontSize: '0.78rem', padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={save} disabled={selected === user.role || mutation.isPending}
            style={{ fontFamily: BODY, fontSize: '0.78rem', padding: '8px 18px', borderRadius: 8, border: 'none', background: selected === user.role ? C.border : C.sapphire, color: '#fff', cursor: selected === user.role ? 'not-allowed' : 'pointer', opacity: mutation.isPending ? 0.7 : 1 }}>
            {mutation.isPending ? 'Saving...' : 'Save Role Change'}
          </button>
        </div>
      </div>
    </div>
  );
}
