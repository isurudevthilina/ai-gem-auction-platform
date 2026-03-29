import React from 'react';
import UserRow from './UserRow';

const C = { bg: '#F0EDE8', sapphire: '#1A4D8C', gold: '#C4892A', green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6' };
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const cols = ['User', 'Role', 'Status', 'Activity', 'Joined', 'Last Active', 'Actions'];

export default function UserTable({ users, isLoading, onView, onEdit, onDeactivate, currentAdminId }) {
  return (
    <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
      <style>{`@keyframes utShimmer { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `0.5px solid ${C.border}` }}>
            {cols.map((c) => (
              <th key={c} style={{
                fontFamily: DISPLAY, fontSize: '0.62rem', color: C.faint, textTransform: 'uppercase',
                letterSpacing: '0.06em', padding: '12px 14px', textAlign: 'left', fontWeight: 600,
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                {cols.map((c, j) => (
                  <td key={j} style={{ padding: '14px' }}>
                    <div style={{ height: 14, width: j === 0 ? 160 : 60, borderRadius: 6, background: C.border, animation: 'utShimmer 1.5s ease-in-out infinite' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onView={onView}
                onEdit={onEdit}
                onDeactivate={onDeactivate}
                isOwnRow={user.id === currentAdminId}
              />
            ))
          ) : (
            <tr>
              <td colSpan={cols.length} style={{ padding: '48px 20px', textAlign: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <div style={{ fontFamily: DISPLAY, fontSize: '1rem', color: C.sapphire, marginBottom: 4 }}>No users found</div>
                <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted }}>Try a different search or clear filters</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
