import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCurrency } from '../../../context/CurrencyContext';
import { useInitiateBuyNow } from '../hooks/useTransactions';
import BuyNowModal from './BuyNowModal';
import SimulatedPaymentModal from './SimulatedPaymentModal';
import OfflineArrangeModal from './OfflineArrangeModal';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const BODY = "'Jost','Inter',sans-serif";

const BuyNowButton = ({ gem }) => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showOffline, setShowOffline] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const mutation = useInitiateBuyNow();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (gem.listing_type !== 'direct_sell') return null;
  if (gem.status !== 'listed') return null;

  if (!isAuthenticated) {
    return (
      <button onClick={() => navigate('/login')} style={{
        width: '100%', marginTop: 20, padding: '14px', borderRadius: 10,
        background: C.gold, border: 'none', color: '#fff',
        fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer',
        transition: 'opacity 0.2s',
      }}>
        Sign In to Purchase
      </button>
    );
  }

  if (user.id === gem.seller_id) return null;

  const price = parseFloat(gem.buy_now_price);

  const handleConfirm = () => {
    mutation.mutate(gem.id, {
      onSuccess: (res) => {
        setActiveTransaction(res.data.transaction);
        setShowBuyModal(false);
        if (res.data.requiresOfflineArrangement) setShowOffline(true);
        else setShowPayment(true);
      },
    });
  };

  return (
    <>
      <button onClick={() => setShowBuyModal(true)} style={{
        width: '100%', marginTop: 20, padding: '14px', borderRadius: 10,
        background: C.gold, border: 'none', color: '#fff',
        fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700,
        cursor: mutation.isPending ? 'not-allowed' : 'pointer',
        opacity: mutation.isPending ? 0.6 : 1, transition: 'opacity 0.2s',
      }}>
        {mutation.isPending ? 'Processing...' : `Buy Now — ${formatPrice(price)}`}
      </button>
      <p style={{
        fontFamily: BODY, fontSize: '0.78rem', color: C.muted, marginTop: 8,
        textAlign: 'center',
      }}>
        {price < 1000
          ? 'Instant checkout available'
          : 'High-value gem — offline arrangement required'}
      </p>

      <BuyNowModal gem={gem} isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onConfirm={handleConfirm}
        isLoading={mutation.isPending} />
      <SimulatedPaymentModal transaction={activeTransaction}
        isOpen={showPayment} onClose={() => setShowPayment(false)} />
      <OfflineArrangeModal transaction={activeTransaction}
        isOpen={showOffline} onClose={() => setShowOffline(false)} />
    </>
  );
};

export default BuyNowButton;
