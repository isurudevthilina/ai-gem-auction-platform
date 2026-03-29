import { useState } from 'react';
import { Link } from 'react-router-dom';

const C = {
  white: '#FFFFFF', sapphire: '#1A4D8C', amber: '#B45309',
  gold: '#C4892A', muted: '#6B6B7B', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const PendingCertsBanner = ({ count }) => {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('certs_banner_dismissed') === 'true'
  );

  if (!count || count <= 0 || dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem('certs_banner_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div style={{
      background: 'rgba(180,83,9,0.08)', border: `1px solid rgba(180,83,9,0.2)`,
      borderRadius: 14, padding: '16px 24px',
      display: 'flex', alignItems: 'center', gap: 16, position: 'relative',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: '0.88rem', fontWeight: 700, color: C.amber }}>
          {count} certificate{count !== 1 ? 's' : ''} awaiting review
        </div>
        <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.muted, marginTop: 2 }}>
          Sellers are waiting for verification to list their gems.
        </div>
      </div>
      <Link to="/admin-dashboard/certs" style={{
        padding: '8px 18px', borderRadius: 10, border: 'none',
        background: C.sapphire, color: '#fff',
        fontFamily: BODY, fontSize: '0.78rem', fontWeight: 700,
        textDecoration: 'none', whiteSpace: 'nowrap',
      }}>
        Review Now
      </Link>
      <button onClick={dismiss} style={{
        position: 'absolute', top: 8, right: 10,
        background: 'none', border: 'none', cursor: 'pointer',
        color: C.muted, fontSize: '1.1rem', lineHeight: 1,
      }}>
        &times;
      </button>
    </div>
  );
};

export default PendingCertsBanner;
