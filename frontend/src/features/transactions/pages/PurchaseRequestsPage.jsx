import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useGetMyPurchases, useMarkComplete, useOfferNextBidder } from '../hooks/useTransactions';
import PurchaseRequestCard from '../components/PurchaseRequestCard';
import SimulatedPaymentModal from '../components/SimulatedPaymentModal';
import OfflineArrangeModal from '../components/OfflineArrangeModal';
import { useCurrency } from '../../../context/CurrencyContext';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const pillBase = {
  borderRadius: 10, padding: '8px 18px', fontFamily: BODY, fontSize: '0.82rem',
  fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
};

const PurchaseRequestsPage = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [role, setRole] = useState('buyer');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [confirmCompleteItem, setConfirmCompleteItem] = useState(null);
  const markCompleteMutation = useMarkComplete();
  const offerNextMutation = useOfferNextBidder();

  const filters = { status: statusFilter, role, page: 0, limit: 20 };
  const { data, isLoading } = useGetMyPurchases(filters);

  const roleTabs = [{ key: 'buyer', label: 'As Buyer' }];
  if (user?.role === 'seller' || user?.role === 'admin') {
    roleTabs.push({ key: 'seller', label: 'As Seller' });
  }

  const statusOptions = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'disputed', label: 'Disputed' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: BODY }}>
      <style>{`@keyframes bhp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px 80px' }}>

        {/* Header */}
        <h1 style={{ fontFamily: DISPLAY, fontSize: '1.8rem', fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
          Purchase Requests
        </h1>
        <p style={{ fontFamily: BODY, fontSize: '0.92rem', color: C.muted, margin: '0 0 24px' }}>
          Your buying and selling activity on GemBid LK
        </p>

        {/* Role tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {roleTabs.map(t => (
            <button key={t.key} onClick={() => { setRole(t.key); setStatusFilter('all'); }}
              style={{
                ...pillBase,
                background: role === t.key ? C.sapphire : 'transparent',
                color: role === t.key ? '#fff' : C.muted,
                border: role === t.key ? 'none' : `1px solid ${C.border}`,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {statusOptions.map(s => (
            <button key={s.key} onClick={() => setStatusFilter(s.key)}
              style={{
                ...pillBase,
                background: statusFilter === s.key ? C.sapphire : 'transparent',
                color: statusFilter === s.key ? '#fff' : C.muted,
                border: statusFilter === s.key ? 'none' : `1px solid ${C.border}`,
              }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Cards area */}
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: 120, background: '#E8E5E0', borderRadius: 16, marginBottom: 16,
              animation: 'bhp-pulse 1.5s ease-in-out infinite',
            }} />
          ))
        ) : !data?.data?.length ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.sapphire} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h3 style={{ fontFamily: SERIF, fontSize: '1.1rem', fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
              No purchase requests
            </h3>
            <p style={{ fontFamily: BODY, fontSize: '0.88rem', color: C.muted, margin: '0 0 16px' }}>
              {role === 'buyer'
                ? 'Browse our gem catalog to find your first purchase.'
                : 'No purchase requests on your listings yet.'}
            </p>
            {role === 'buyer' && (
              <button onClick={() => navigate('/gems')} style={{
                background: C.sapphire, color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 24px',
                fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              }}>Browse Gems</button>
            )}
          </div>
        ) : (
          <div style={{ opacity: 1, transition: 'opacity 0.3s' }}>
            {data.data.map(item => (
              <PurchaseRequestCard key={item.id} item={item} role={role}
                onOpenPayment={(txn) => { setActiveTransaction(txn); setShowPaymentModal(true); }}
                onOpenOffline={(txn) => { setActiveTransaction(txn); setShowOfflineModal(true); }}
                onMarkComplete={(txn) => setConfirmCompleteItem(txn)}
                onOfferNextBidder={(txn) => offerNextMutation.mutate(txn.id)}
              />
            ))}
          </div>
        )}

        {/* Confirm complete modal */}
        {confirmCompleteItem && (
          <div onClick={() => setConfirmCompleteItem(null)} style={{
            position: 'fixed', inset: 0, zIndex: 1001,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: C.white, borderRadius: 16, padding: 28,
              width: '100%', maxWidth: 420,
              boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            }}>
              <h3 style={{ fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>
                Confirm Transaction Complete
              </h3>
              <p style={{ fontFamily: BODY, fontSize: '0.85rem', color: C.muted, margin: '12px 0' }}>
                Confirm that payment and delivery have been arranged offline with the buyer.
              </p>
              <div style={{ fontFamily: BODY, fontSize: '0.88rem', color: C.text, margin: '12px 0' }}>
                {confirmCompleteItem.buyer?.full_name || 'Buyer'} — {formatPrice(confirmCompleteItem.amount)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button onClick={() => setConfirmCompleteItem(null)} style={{
                  background: 'transparent', border: `1px solid ${C.border}`, color: C.muted,
                  borderRadius: 10, padding: '10px 24px',
                  fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
                <button onClick={() => markCompleteMutation.mutate(confirmCompleteItem.id, { onSuccess: () => setConfirmCompleteItem(null) })} style={{
                  background: C.gold, color: '#fff', border: 'none',
                  borderRadius: 10, padding: '10px 24px',
                  fontFamily: BODY, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  opacity: markCompleteMutation.isPending ? 0.6 : 1,
                }}>Confirm Complete</button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <SimulatedPaymentModal transaction={activeTransaction}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)} />
        <OfflineArrangeModal transaction={activeTransaction}
          isOpen={showOfflineModal}
          onClose={() => setShowOfflineModal(false)} />
      </main>
    </div>
  );
};

export default PurchaseRequestsPage;
