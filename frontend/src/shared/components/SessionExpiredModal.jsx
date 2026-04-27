import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    text: '#1A1A2E', muted: '#6B6B7B', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel', serif";
const BODY = "'Jost', 'Inter', sans-serif";

/**
 * SessionExpiredModal — shown when idle timeout or max session age is reached.
 * Auto-redirects to login after 5 seconds if not dismissed.
 */
const SessionExpiredModal = ({ reason = 'idle', onDismiss }) => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    const message = reason === 'idle'
        ? 'You were signed out due to inactivity.'
        : 'Your session has expired for security reasons.';

    useEffect(() => {
        if (countdown <= 0) {
            onDismiss?.();
            navigate('/login');
            return;
        }
        const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(id);
    }, [countdown, navigate, onDismiss]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                background: C.white, borderRadius: 16, padding: 36,
                width: '100%', maxWidth: 400, textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>

                <h2 style={{ fontFamily: DISPLAY, fontSize: '1.1rem', color: C.text, margin: '0 0 8px' }}>
                    Session Expired
                </h2>
                <p style={{ fontFamily: BODY, fontSize: '0.9rem', color: C.muted, margin: '0 0 24px', lineHeight: 1.5 }}>
                    {message}
                    <br />
                    Redirecting to sign in in <strong style={{ color: C.sapphire }}>{countdown}s</strong>.
                </p>

                <button
                    onClick={() => { onDismiss?.(); navigate('/login'); }}
                    style={{
                        width: '100%', padding: '12px',
                        background: C.sapphire, color: '#fff',
                        border: 'none', borderRadius: 10,
                        fontFamily: DISPLAY, fontSize: '0.72rem',
                        fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', cursor: 'pointer',
                    }}
                >
                    Sign In Now
                </button>
            </div>
        </div>
    );
};

export default SessionExpiredModal;
