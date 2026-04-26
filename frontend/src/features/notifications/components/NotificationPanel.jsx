import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useGetRecent, useGetUnreadCount, useMarkAllAsRead, useMarkAsRead } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';

const DISPLAY = "'Cinzel', serif";
const BODY = "'Jost', sans-serif";
const C = {
  sapphire: '#1A4D8C',
  gold: '#C4892A',
  border: 'rgba(30,42,80,0.14)',
  muted: '#64748B',
  green: '#16a34a',
};

export default function NotificationPanel({ isOpen, onClose }) {
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { data: recentRes, isLoading } = useGetRecent();
  const { data: unreadCount = 0 } = useGetUnreadCount();
  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();

  const recent = recentRes?.data || [];

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Don't close if clicking the bell button itself
        const bellBtn = panelRef.current.previousElementSibling;
        if (bellBtn && bellBtn.contains(e.target)) return;
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // Auto-read after 2 seconds
  useEffect(() => {
    if (!isOpen || !recent.length) return;
    const unreadIds = recent.filter((n) => !n.is_read).map((n) => n.id);
    if (!unreadIds.length) return;
    const timer = setTimeout(() => {
      markAsRead.mutate(unreadIds);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isOpen, recent]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: 380,
        maxHeight: 520,
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        zIndex: 200,
        background: '#fff',
        border: `0.5px solid ${C.border}`,
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(30,42,80,0.12)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: DISPLAY, fontSize: '0.85rem', color: '#1A4D8C', fontWeight: 600 }}>
            Notifications
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => markAllAsRead.mutate()}
              disabled={unreadCount === 0}
              style={{
                background: 'none',
                border: 'none',
                cursor: unreadCount === 0 ? 'default' : 'pointer',
                padding: 0,
                fontFamily: BODY,
                fontSize: '0.68rem',
                color: unreadCount === 0 ? '#ccc' : C.muted,
              }}
            >
              Mark all read
            </button>
            <span style={{ color: C.border }}>|</span>
            <button
              onClick={() => handleNavigate('/notifications')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: BODY,
                fontSize: '0.68rem',
                color: C.sapphire,
              }}
            >
              View all
            </button>
          </div>
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontSize: '0.68rem',
            color: unreadCount > 0 ? C.gold : C.green,
            marginTop: 4,
          }}
        >
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 380, overflowY: 'auto', flex: 1 }}>
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: '70%', background: '#e5e7eb', borderRadius: 4, marginBottom: 6 }} />
                <div style={{ height: 10, width: '90%', background: '#e5e7eb', borderRadius: 4 }} />
              </div>
            </div>
          ))
        ) : recent.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Bell size={36} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontFamily: DISPLAY, fontSize: '0.82rem', color: '#64748B' }}>
              No notifications yet
            </div>
            <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>
              You are all caught up!
            </div>
          </div>
        ) : (
          recent.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              compact
              onMarkRead={(id) => markAsRead.mutate([id])}
              onNavigate={handleNavigate}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px', borderTop: `0.5px solid ${C.border}` }}>
        <button
          onClick={() => handleNavigate('/notifications')}
          style={{
            width: '100%',
            fontFamily: BODY,
            fontSize: '0.75rem',
            color: C.sapphire,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            background: 'transparent',
            padding: '8px 0',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,77,140,0.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          View all notifications
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
