import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../../../shared/hooks/useDebounce';

const C = { bg: '#F0EDE8', sapphire: '#1A4D8C', gold: '#C4892A', green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6' };
const BODY = "'Jost','Inter',sans-serif";

const roleTabs = [
  { value: 'all', label: 'All' },
  { value: 'buyer', label: 'Buyers' },
  { value: 'seller', label: 'Sellers' },
  { value: 'admin', label: 'Admins' },
];

const verifyTabs = [
  { value: undefined, label: 'All' },
  { value: true, label: 'Verified' },
  { value: false, label: 'Unverified' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'last_active', label: 'Last Active' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
];

function exportUsersCSV(users) {
  if (!users?.length) return;
  const headers = ['Name', 'Email', 'Role', 'Verified', 'Business Name', 'District', 'City', 'Joined Date', 'Last Active', 'Total Listings', 'Total Bids', 'Purchases'];
  const rows = users.map((u) => [
    u.full_name || '', u.email || '', u.role || '', u.is_verified ? 'Yes' : 'No',
    u.business_name || '', u.district || '', u.city || '',
    u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
    u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never',
    u.listing_count ?? '', u.total_bid_count ?? '', u.purchase_count ?? '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const pill = (active) => ({
  fontFamily: BODY, fontSize: '0.75rem', borderRadius: 8, padding: '6px 14px',
  border: active ? 'none' : `1px solid ${C.border}`, cursor: 'pointer',
  background: active ? C.sapphire : 'transparent',
  color: active ? '#fff' : C.muted, transition: 'all 0.15s',
});

export default function UserFilters({ filters, onChange, stats, users }) {
  const [search, setSearch] = useState(filters.query || '');
  const debounced = useDebounce(search, 400);

  useEffect(() => {
    if (debounced !== filters.query) onChange({ ...filters, query: debounced, page: 0 });
  }, [debounced]);

  const set = (patch) => onChange({ ...filters, ...patch, page: 0 });
  const isDefault = filters.role === 'all' && filters.is_verified === undefined && filters.sort === 'newest' && !filters.query;
  const activeCount = [filters.role !== 'all', filters.is_verified !== undefined, filters.sort !== 'newest', !!filters.query].filter(Boolean).length;

  return (
    <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 14, padding: '16px 20px' }}>
      {/* Row 1 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or business name..."
            style={{ width: '100%', padding: '9px 36px 9px 36px', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: BODY, fontSize: '0.82rem', outline: 'none', background: 'transparent' }}
          />
          {search && (
            <button onClick={() => { setSearch(''); set({ query: '' }); }}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.faint, fontSize: '1rem' }}>
              ×
            </button>
          )}
        </div>
        <button onClick={() => exportUsersCSV(users)}
          style={{ fontFamily: BODY, fontSize: '0.75rem', padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: 'transparent', color: C.text, cursor: 'pointer' }}>
          Export CSV
        </button>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {roleTabs.map((t) => (
            <button key={t.value} onClick={() => set({ role: t.value })} style={pill(filters.role === t.value)}>
              {t.label}{stats && stats[t.value === 'all' ? 'total' : `${t.value}s`] !== undefined ? ` (${stats[t.value === 'all' ? 'total' : `${t.value}s`]})` : ''}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: C.border }} />

        <div style={{ display: 'flex', gap: 6 }}>
          {verifyTabs.map((t, i) => (
            <button key={i} onClick={() => set({ is_verified: t.value })} style={pill(filters.is_verified === t.value)}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => set({ sort: e.target.value })}
            style={{ fontFamily: BODY, fontSize: '0.78rem', padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: 8, background: 'transparent', color: C.text, cursor: 'pointer' }}
          >
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Active filters indicator */}
      {!isDefault && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted }}>
            {activeCount} active filter{activeCount !== 1 ? 's' : ''}
          </span>
          <button onClick={() => { setSearch(''); onChange({ query: '', role: 'all', is_verified: undefined, sort: 'newest', page: 0, limit: filters.limit }); }}
            style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.sapphire, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
