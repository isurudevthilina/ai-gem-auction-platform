import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useGetUnreadCount } from '../hooks/useNotifications';

const C = {
  sapphire: '#1A4D8C',
  gold: '#C4892A',
  bg: '#F0EDE8',
};
const DISPLAY = "'Cinzel', serif";

const pulseKeyframes = `
@keyframes bellPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
`;

export default function NotificationBell({ onClick, isOpen }) {
  const { data: count = 0 } = useGetUnreadCount();
  const [pulse, setPulse] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <>
      <style>{pulseKeyframes}</style>
      <button
        onClick={onClick}
        aria-label={`Notifications, ${count} unread`}
        style={{
          position: 'relative',
          background: isOpen ? 'rgba(26,77,140,0.08)' : 'transparent',
          borderRadius: 8,
          padding: 6,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'rgba(26,77,140,0.06)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'transparent';
        }}
      >
        <Bell size={18} color={C.sapphire} />
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: '50%',
              background: C.gold,
              color: C.bg,
              fontFamily: DISPLAY,
              fontSize: '0.6rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              animation: pulse ? 'bellPulse 0.4s ease' : 'none',
            }}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
    </>
  );
}
