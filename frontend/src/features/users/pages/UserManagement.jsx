import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import { SIDEBAR_W } from '../../../shared/components/DashboardSidebar';
import UserStatsBanner from '../components/admin/UserStatsBanner';
import UserFilters from '../components/admin/UserFilters';
import UserTable from '../components/admin/UserTable';
import UserDetailModal from '../components/admin/UserDetailModal';
import ChangeRoleModal from '../components/admin/ChangeRoleModal';
import DeactivateUserModal from '../components/admin/DeactivateUserModal';
import { useGetAllUsers, useGetUserStats } from '../hooks/useUserManagement';

const C = { bg: '#F0EDE8', sapphire: '#1A4D8C', gold: '#C4892A', green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6' };
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

export default function UserManagement() {
  const { user: authUser } = useAuth();
  const [filters, setFilters] = useState({
    query: '', role: 'all', is_verified: undefined,
    sort: 'newest', page: 0, limit: 25,
  });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [roleModal, setRoleModal] = useState(null);
  const [deactivateModal, setDeactivateModal] = useState(null);
  const [toast, setToast] = useState(null);

  const { data: usersData, isLoading } = useGetAllUsers(filters);
  const { data: statsData } = useGetUserStats();
  const users = usersData?.data?.data || [];
  const totalCount = usersData?.data?.count ?? 0;
  const stats = statsData?.data || {};

  const totalPages = Math.ceil(totalCount / filters.limit) || 1;
  const from = totalCount === 0 ? 0 : filters.page * filters.limit + 1;
  const to = Math.min((filters.page + 1) * filters.limit, totalCount);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 88px)', background: C.bg }}>
      <AdminSidebar />
      <main style={{ marginLeft: SIDEBAR_W, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: DISPLAY, fontSize: '1.5rem', color: C.sapphire, margin: 0 }}>User Management</h1>
          <p style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, margin: '4px 0 0' }}>
            Manage all registered users on GemBid LK
          </p>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 20 }}>
          <UserStatsBanner />
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 16 }}>
          <UserFilters filters={filters} onChange={handleFilterChange} stats={stats} users={users} />
        </div>

        {/* Table */}
        <UserTable
          users={users}
          isLoading={isLoading}
          onView={(u) => setSelectedUserId(u.id)}
          onEdit={(u) => setRoleModal(u)}
          onDeactivate={(u) => setDeactivateModal(u)}
          currentAdminId={authUser?.id}
        />

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.muted }}>
            {totalCount > 0 ? `Showing ${from}–${to} of ${totalCount} users` : 'No users'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={filters.limit}
              onChange={(e) => setFilters((f) => ({ ...f, limit: Number(e.target.value), page: 0 }))}
              style={{ fontFamily: BODY, fontSize: '0.72rem', padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: 6, background: 'transparent' }}
            >
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}/page</option>)}
            </select>
            <button
              disabled={filters.page === 0}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              style={{ fontFamily: BODY, fontSize: '0.75rem', padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: filters.page === 0 ? C.border : C.text, cursor: filters.page === 0 ? 'not-allowed' : 'pointer' }}
            >Prev</button>
            <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.text }}>
              {filters.page + 1} / {totalPages}
            </span>
            <button
              disabled={filters.page + 1 >= totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              style={{ fontFamily: BODY, fontSize: '0.75rem', padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: filters.page + 1 >= totalPages ? C.border : C.text, cursor: filters.page + 1 >= totalPages ? 'not-allowed' : 'pointer' }}
            >Next</button>
          </div>
        </div>

        {/* Modals */}
        {selectedUserId && (
          <UserDetailModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onChangeRole={(u) => { setSelectedUserId(null); setRoleModal(u); }}
            onDeactivate={(u) => { setSelectedUserId(null); setDeactivateModal(u); }}
          />
        )}
        {roleModal && (
          <ChangeRoleModal
            user={roleModal}
            onClose={() => setRoleModal(null)}
            onSuccess={(msg) => { setRoleModal(null); showToast(msg); }}
          />
        )}
        {deactivateModal && (
          <DeactivateUserModal
            user={deactivateModal}
            onClose={() => setDeactivateModal(null)}
            onSuccess={(msg) => { setDeactivateModal(null); showToast(msg); }}
          />
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 32, right: 32, zIndex: 2000,
            padding: '12px 22px', borderRadius: 10,
            background: toast.type === 'success' ? C.green : C.red,
            color: '#fff', fontFamily: BODY, fontSize: '0.82rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}>
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}
