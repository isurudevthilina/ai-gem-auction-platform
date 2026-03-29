import React from 'react';
import { useGetUserStats } from '../../hooks/useUserManagement';

const C = { bg: '#F0EDE8', sapphire: '#1A4D8C', gold: '#C4892A', green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6' };
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const shimmer = {
  animation: 'userStatShimmer 1.5s ease-in-out infinite',
};

const cards = [
  { key: 'total', label: 'TOTAL USERS', color: C.sapphire },
  { key: 'buyers', label: 'BUYERS', color: C.sapphire },
  { key: 'sellers', label: 'SELLERS', color: C.gold },
  { key: 'admins', label: 'ADMINS', color: C.sapphire },
  { key: 'verified', label: 'VERIFIED', color: C.green, sub: 'seller accounts' },
  { key: 'new_this_week', label: 'NEW THIS WEEK', color: '#0d9488' },
  { key: 'active_monthly', label: 'ACTIVE MONTHLY', color: C.sapphire, sub: 'last 30 days' },
];

export default function UserStatsBanner() {
  const { data, isLoading } = useGetUserStats();
  const stats = data?.data || {};

  return (
    <>
      <style>{`@keyframes userStatShimmer { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 14 }}>
        {cards.map((c) => (
          <div key={c.key} style={{
            background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 14,
            padding: 16, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {c.label}
            </span>
            {isLoading ? (
              <div style={{ ...shimmer, width: 48, height: 24, borderRadius: 6, background: C.border }} />
            ) : (
              <span style={{ fontFamily: DISPLAY, fontSize: '1.3rem', fontWeight: 700, color: c.color }}>
                {stats[c.key] ?? 0}
              </span>
            )}
            {c.sub && (
              <span style={{ fontFamily: BODY, fontSize: '0.6rem', color: C.faint }}>{c.sub}</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
