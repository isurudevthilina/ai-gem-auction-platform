const COLOR_MAP = {
  navy: '#1A4D8C',
  gold: '#C4892A',
  green: '#16a34a',
  amber: '#B45309',
  red: '#B91C1C',
};
const DISPLAY = "'Cinzel',serif";
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const BODY    = "'Jost','Inter',sans-serif";

const AdminStatCard = ({ label, value, subValue, icon, color = 'navy', trend, loading }) => {
  const accent = COLOR_MAP[color] || COLOR_MAP.navy;

  if (loading) {
    return (
      <div style={{
        background: '#FFFFFF', border: '0.5px solid #E0DCD6', borderRadius: 14,
        padding: '16px 20px', minHeight: 100,
      }}>
        <div style={{ height: 10, width: '50%', background: '#E0DCD6', borderRadius: 6, marginBottom: 14, opacity: 0.6, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 28, width: '40%', background: '#E0DCD6', borderRadius: 6, marginBottom: 8, opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 10, width: '60%', background: '#E0DCD6', borderRadius: 6, opacity: 0.4, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: '#FFFFFF', border: '0.5px solid #E0DCD6', borderRadius: 14,
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6B7B' }}>
          {label}
        </span>
        <span style={{ color: accent, opacity: 0.8 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: '1.8rem', fontWeight: 700, color: accent, lineHeight: 1.1 }}>
        {value ?? '--'}
      </div>
      {subValue && (
        <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: '#6B6B7B', marginTop: 4 }}>
          {subValue}
        </div>
      )}
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            {trend.direction === 'up' && <path d="M6 2L10 7H2L6 2Z" fill="#16a34a" />}
            {trend.direction === 'down' && <path d="M6 10L2 5H10L6 10Z" fill="#B91C1C" />}
            {trend.direction === 'neutral' && <rect x="2" y="5" width="8" height="2" rx="1" fill="#9A9AAB" />}
          </svg>
          <span style={{ fontFamily: BODY, fontSize: '0.68rem', color: trend.direction === 'up' ? '#16a34a' : trend.direction === 'down' ? '#B91C1C' : '#9A9AAB' }}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminStatCard;
