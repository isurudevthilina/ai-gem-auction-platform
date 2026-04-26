import {
  Bell, Trophy, Clock, ShieldCheck, ShieldX, Gavel, XCircle, Info,
} from 'lucide-react';

export const getNotificationLink = (notification) => {
  const d = notification.data || {};
  switch (notification.type) {
    case 'outbid':               return `/auctions/${d.auction_id}`;
    case 'auction_won':          return '/transactions';
    case 'auction_ending':       return `/auctions/${d.auction_id}`;
    case 'new_bid':              return `/auctions/${d.auction_id}`;
    case 'auction_cancelled':    return '/auctions';
    case 'auction_started':      return '/seller-dashboard';
    case 'certificate_verified': return '/seller-dashboard';
    case 'certificate_rejected': return '/seller-dashboard';
    default:                     return '/notifications';
  }
};

export const getNotificationIcon = (type) => {
  const map = {
    outbid:               { icon: Bell,       bg: '#FCEBEB', color: '#A32D2D' },
    auction_won:          { icon: Trophy,     bg: '#FAEEDA', color: '#633806' },
    auction_ending:       { icon: Clock,      bg: '#FAEEDA', color: '#633806' },
    certificate_verified: { icon: ShieldCheck, bg: '#E1F5EE', color: '#085041' },
    certificate_rejected: { icon: ShieldX,    bg: '#FCEBEB', color: '#A32D2D' },
    new_bid:              { icon: Gavel,      bg: '#E6F1FB', color: '#0C447C' },
    auction_cancelled:    { icon: XCircle,    bg: '#F1EFE8', color: '#444441' },
    auction_started:      { icon: Info,       bg: '#E6F1FB', color: '#0C447C' },
  };
  return map[type] || { icon: Bell, bg: '#F1EFE8', color: '#444441' };
};

export const getRelativeTime = (dateStr, full = false) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  let compact;
  if (diffMin < 1) compact = 'now';
  else if (diffMin < 60) compact = `${diffMin}m`;
  else if (diffHr < 24) compact = `${diffHr}h`;
  else if (diffDay < 7) compact = `${diffDay}d`;
  else if (diffWeek < 5) compact = `${diffWeek}w`;
  else compact = `${diffMonth}mo`;

  if (!full) return compact;

  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${formatted} (${compact === 'now' ? 'just now' : compact + ' ago'})`;
};
