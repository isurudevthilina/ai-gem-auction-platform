import { getNotificationIcon, getRelativeTime, getNotificationLink } from '../utils/notificationUtils';
import { X } from 'lucide-react';

const BODY = "'Jost', sans-serif";
const C = {
  gold: '#C4892A',
  text: '#1E293B',
  muted: '#64748B',
  faint: '#94a3b8',
  sapphire: '#1A4D8C',
  red: '#B91C1C',
};

export default function NotificationItem({ notification, compact, onMarkRead, onDelete, onNavigate }) {
  const { icon: Icon, bg: iconBg, color: iconColor } = getNotificationIcon(notification.type);
  const isUnread = !notification.is_read;
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (isUnread && onMarkRead) onMarkRead(notification.id);
    if (onNavigate && link) onNavigate(link);
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        style={{
          padding: '10px 14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          borderLeft: `3px solid ${isUnread ? C.gold : 'transparent'}`,
          background: isUnread ? '#fff' : '#FAFAF8',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,77,140,0.03)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = isUnread ? '#fff' : '#FAFAF8'; }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={16} color={iconColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: BODY,
              fontSize: '0.78rem',
              fontWeight: isUnread ? 600 : 400,
              color: isUnread ? C.text : C.muted,
              lineHeight: 1.3,
            }}
          >
            {notification.title}
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontSize: '0.68rem',
              color: C.muted,
              maxHeight: '2.6em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
              marginTop: 2,
            }}
          >
            {notification.message}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ fontFamily: BODY, fontSize: '0.65rem', color: C.faint }}>
            {getRelativeTime(notification.created_at)}
          </span>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: C.faint,
                opacity: 0,
                transition: 'opacity 0.15s',
              }}
              className="notif-item-delete"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full mode (page)
  return (
    <div
      style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        borderLeft: `3px solid ${isUnread ? C.gold : 'transparent'}`,
        background: isUnread ? '#fff' : '#FAFAF8',
        borderRadius: 8,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(26,77,140,0.03)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isUnread ? '#fff' : '#FAFAF8'; }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: BODY,
            fontSize: '0.85rem',
            fontWeight: isUnread ? 600 : 400,
            color: isUnread ? C.text : C.muted,
            lineHeight: 1.3,
          }}
        >
          {notification.title}
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontSize: '0.78rem',
            color: C.muted,
            lineHeight: 1.5,
            marginTop: 4,
          }}
        >
          {notification.message}
        </div>
        <div style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.faint, marginTop: 6 }}>
          {getRelativeTime(notification.created_at, true)}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {isUnread && onMarkRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
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
              Mark as read
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: BODY,
                fontSize: '0.68rem',
                color: C.red,
              }}
            >
              Delete
            </button>
          )}
          {link && onNavigate && (
            <button
              onClick={() => onNavigate(link)}
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
              View details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
