import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllRead,
} from '../hooks/useNotifications';
import NotificationFilters, { getTypeFilterValues } from '../components/NotificationFilters';
import NotificationItem from '../components/NotificationItem';

const DISPLAY = "'Cinzel', serif";
const BODY = "'Jost', sans-serif";
const C = {
  sapphire: '#1A4D8C',
  gold: '#C4892A',
  bg: '#F0EDE8',
  border: 'rgba(30,42,80,0.14)',
  muted: '#64748B',
  red: '#B91C1C',
  faint: '#94a3b8',
};

const groupByDate = (items) => {
  const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);

  items.forEach((item) => {
    const d = new Date(item.created_at);
    if (d >= today) groups.Today.push(item);
    else if (d >= yesterday) groups.Yesterday.push(item);
    else if (d >= weekAgo) groups['This Week'].push(item);
    else groups.Earlier.push(item);
  });
  return groups;
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ _group: undefined, is_read: 'all', page: 0, limit: 20 });
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [prevPage, setPrevPage] = useState(-1);

  // Build query filters: expand group into individual type queries
  const queryFilters = {
    is_read: filters.is_read,
    page: filters.page,
    limit: filters.limit,
  };
  const typeValues = getTypeFilterValues(filters._group);
  if (typeValues && typeValues.length === 1) {
    queryFilters.type = typeValues[0];
  }
  // For multi-type groups, we fetch all and filter client-side
  // For single type or undefined, pass to API

  const { data: notifRes, isLoading } = useGetNotifications(queryFilters);
  const { data: unreadCount = 0 } = useGetUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();
  const deleteAllRead = useDeleteAllRead();

  // Accumulate items for pagination
  const rawItems = notifRes?.data?.data || [];
  const totalCount = notifRes?.data?.count || 0;

  // Filter client-side for multi-type groups
  let items = rawItems;
  if (typeValues && typeValues.length > 1) {
    items = rawItems.filter((n) => typeValues.includes(n.type));
  }

  // Accumulate pages
  if (filters.page !== prevPage) {
    if (filters.page === 0) {
      if (rawItems.length > 0 || !isLoading) {
        setAllItems(items);
        setPrevPage(0);
      }
    } else if (filters.page > prevPage) {
      setAllItems((prev) => [...prev, ...items]);
      setPrevPage(filters.page);
    }
  }

  const displayItems = filters.page === 0 ? items : allItems;
  const grouped = groupByDate(displayItems);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => showToast('All notifications marked as read'),
    });
  };

  const handleClearRead = () => {
    deleteAllRead.mutate(undefined, {
      onSuccess: (res) => {
        setConfirmClear(false);
        showToast(`${res?.data?.deleted || 0} read notifications cleared`);
        setFilters((f) => ({ ...f, page: 0 }));
        setAllItems([]);
        setPrevPage(-1);
      },
    });
  };

  const handleMarkRead = (id) => {
    markAsRead.mutate([id]);
  };

  const handleDelete = (id) => {
    deleteNotif.mutate(id, {
      onSuccess: () => showToast('Notification deleted'),
    });
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const hasMore = displayItems.length < totalCount;

  return (
    <div style={{ background: C.bg, minHeight: '60vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: '1.5rem', color: C.sapphire, margin: 0, fontWeight: 700 }}>
              Notifications
            </h1>
            <p style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, margin: '6px 0 0' }}>
              {totalCount} notification{totalCount !== 1 ? 's' : ''} · {unreadCount} unread
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || markAllAsRead.isPending}
              style={{
                fontFamily: BODY,
                fontSize: '0.72rem',
                fontWeight: 500,
                padding: '7px 16px',
                borderRadius: 8,
                border: `1px solid ${C.sapphire}`,
                background: 'transparent',
                color: unreadCount === 0 ? '#ccc' : C.sapphire,
                cursor: unreadCount === 0 ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Mark all as read
            </button>
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                style={{
                  fontFamily: BODY,
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: `1px solid ${C.red}`,
                  background: 'transparent',
                  color: C.red,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Clear read
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.red }}>Delete all read?</span>
                <button
                  onClick={() => setConfirmClear(false)}
                  style={{
                    fontFamily: BODY, fontSize: '0.68rem', padding: '4px 10px', borderRadius: 6,
                    border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearRead}
                  disabled={deleteAllRead.isPending}
                  style={{
                    fontFamily: BODY, fontSize: '0.68rem', padding: '4px 10px', borderRadius: 6,
                    border: 'none', background: C.red, color: '#fff', cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 20 }}>
          <NotificationFilters
            filters={filters}
            onChange={(f) => { setFilters(f); setAllItems([]); setPrevPage(-1); }}
            unreadCount={unreadCount}
          />
        </div>

        {/* Toast */}
        {toast && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              background: toast.type === 'success' ? '#E1F5EE' : '#FCEBEB',
              color: toast.type === 'success' ? '#085041' : '#A32D2D',
              fontFamily: BODY,
              fontSize: '0.75rem',
              marginBottom: 16,
            }}
          >
            {toast.msg}
          </div>
        )}

        {/* Content */}
        {isLoading && filters.page === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.muted }}>Loading...</div>
          </div>
        ) : displayItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Bell size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontFamily: DISPLAY, fontSize: '0.95rem', color: C.muted }}>
              {filters._group || filters.is_read !== 'all' ? 'No matching notifications' : 'No notifications yet'}
            </div>
            <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.faint, marginTop: 6 }}>
              {filters._group || filters.is_read !== 'all' ? (
                <button
                  onClick={() => { setFilters({ _group: undefined, is_read: 'all', page: 0, limit: 20 }); setAllItems([]); setPrevPage(-1); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sapphire, fontFamily: BODY, fontSize: '0.78rem' }}
                >
                  Clear filters
                </button>
              ) : (
                'Activity on your account will appear here.'
              )}
            </div>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([label, groupItems]) => {
              if (!groupItems.length) return null;
              return (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: '0.62rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: C.faint,
                      padding: '8px 0 6px',
                      position: 'sticky',
                      top: 0,
                      background: C.bg,
                      zIndex: 1,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {groupItems.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        compact={false}
                        onMarkRead={handleMarkRead}
                        onDelete={handleDelete}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {hasMore && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint, marginBottom: 8 }}>
                  Showing {displayItems.length} of {totalCount}
                </div>
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                  disabled={isLoading}
                  style={{
                    fontFamily: BODY,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '8px 24px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: 'transparent',
                    color: C.sapphire,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
