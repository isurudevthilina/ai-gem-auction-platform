const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";

const TransactionStatusBadge = ({ status, amount }) => {
  const amt = parseFloat(amount) || 0;
  let bg, color, label;

  if (status === 'pending' && amt < 1000) {
    bg = '#d97706'; color = '#fff'; label = 'Awaiting Payment';
  } else if (status === 'pending' && amt >= 1000) {
    bg = C.sapphire; color = '#fff'; label = 'Arrangement Pending';
  } else if (status === 'completed') {
    bg = '#16a34a'; color = '#fff'; label = 'Completed';
  } else if (status === 'disputed') {
    bg = C.red; color = '#fff'; label = 'Disputed';
  } else if (status === 'refunded') {
    bg = '#6B6B7B'; color = '#fff'; label = 'Refunded';
  } else {
    bg = C.muted; color = '#fff'; label = status || 'Unknown';
  }

  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: 6,
      fontFamily: DISPLAY, fontSize: '0.62rem', fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      background: bg, color,
    }}>
      {label}
    </span>
  );
};

export default TransactionStatusBadge;
