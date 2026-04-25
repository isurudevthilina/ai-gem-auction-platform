import {
  Bell, Trophy, Clock, ShieldCheck, ShieldX, Gavel, XCircle, Info, AlertTriangle,
} from 'lucide-react';

export const getNotificationLink = (notification) => {
  const d = notification.data || {};
  switch (notification.type) {
    case 'outbid':               return `/auctions/${d.auction_id}`;
    case 'auction_won':          return '/transactions';
    case 'auction_ending':       return `/auctions/${d.auction_id}`;
    case 'new_bid':
      // Backward compatibility: some historical review notifications were stored as new_bid
      // without auction_id; route those to seller reviews instead of /auctions/undefined.
      if (d.review_id && d.seller_id) return `/sellers/${d.seller_id}/reviews`;
      return d.auction_id ? `/auctions/${d.auction_id}` : '/notifications';
    case 'new_review':
      return d.seller_id ? `/sellers/${d.seller_id}/reviews` : '/notifications';
    case 'auction_cancelled':    return '/auctions';
    case 'auction_started':      return '/seller-dashboard';
    case 'certificate_verified': return '/seller-dashboard';
    case 'certificate_rejected': return '/seller-dashboard';
    case 'review_reported':      return d.report_id ? '/admin-dashboard/reviews' : '/notifications';
    case 'admin_warning':        return '/notifications';
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
    new_review:           { icon: Bell,       bg: '#E6F1FB', color: '#0C447C' },
    auction_cancelled:    { icon: XCircle,    bg: '#F1EFE8', color: '#444441' },
    auction_started:      { icon: Info,       bg: '#E6F1FB', color: '#0C447C' },
    review_reported:      { icon: AlertTriangle, bg: '#FFF4E5', color: '#9A5A00' },
    admin_warning:        { icon: AlertTriangle, bg: '#FCEBEB', color: '#A32D2D' },
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
