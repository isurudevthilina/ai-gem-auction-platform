/**
 * CreateGemPage.jsx — /gems/new
 * Protected: seller & admin only.
 * Wraps GemForm, provides TanStack Query mutation, handles redirects & toasts.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCreateGem } from '../hooks/useCreateGem';
import { getGemCategories } from '../services/gemsService';
import { formatLKR } from '../../../shared/utils/currency';
import GemForm from '../components/GemForm';
import { CheckCircle, AlertCircle, X, FileText, Shield, Sparkles } from 'lucide-react';
import { T, SERIF, DISPLAY, BODY } from '../components/formTokens';
const DRAFT_KEY = 'gembid_gem_draft';

/* ─── Toast ─── */
const Toast = ({ message, type = 'success', onClose }) => (
    <div style={{
        position: 'fixed', top: 24, right: 24, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 22px', borderRadius: 10,
        background: T.white, border: `0.5px solid ${T.border}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        animation: 'slideIn 0.3s ease-out',
    }}>
        {type === 'success'
            ? <CheckCircle size={18} color={T.gold} />
            : <AlertCircle size={18} color={T.error} />}
        <span style={{ fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, color: T.text }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}>
            <X size={14} color={T.muted} />
        </button>
    </div>
);

/* ─── Inner page ─── */
const CreateGemPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [toast, setToast] = useState(null);
    const [submitMode, setSubmitMode] = useState('draft');
    const [hasDraft, setHasDraft] = useState(false);
    const [certPrompt, setCertPrompt] = useState(false);
    const [aiPrefillBanner, setAiPrefillBanner] = useState(null);
    const [aiPrefillData, setAiPrefillData] = useState(null);

    // Handle AI predictor prefill
    useEffect(() => {
        const prefill = location.state?.aiPrefill;
        if (prefill) {
            const draft = { ...prefill };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            setHasDraft(true);
            setAiPrefillData(prefill);
            setAiPrefillBanner({
                gemType: prefill.gem_type,
                predictedPrice: prefill.predicted_price,
                listingType: prefill.listing_type,
            });
            // Clear state so refresh doesn't re-apply
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, []);

    useEffect(() => {
        try {
            const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
            if (d && (d.gem_type || d.title || d.description)) setHasDraft(true);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        getGemCategories()
            .then(res => setCategories(res.data || []))
            .catch(() => {});
    }, []);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const mutation = useCreateGem({
        onSuccess: (res) => {
            localStorage.removeItem(DRAFT_KEY);
            const gemId = res.data?.id;

            if (submitMode === 'auction_create' && gemId) {
                navigate(`/auctions/new?gemId=${gemId}`);
            } else {
                setToast({ message: 'Gem saved successfully!', type: 'success' });
                setCertPrompt(true);
            }
        },
        onError: (err) => {
            setToast({ message: err.message || 'Failed to create gem. Please try again.', type: 'error' });
        },
    });

    const handleSubmit = (formData, mode = 'draft') => {
        console.log('[CreateGemPage] handleSubmit called, mode:', mode, 'imageFiles:', formData.imageFiles?.length);
        setSubmitMode(mode);
        mutation.mutate({ formData });
    };

    return (
        <div style={{ minHeight: '100vh', background: T.bg }}>
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
                {/* Page title */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: '2.2rem', fontWeight: 700, color: T.text }}>
                        List a <span style={{ color: T.gold }}>Gemstone</span>
                    </h1>
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.9rem', color: T.muted }}>
                        Complete the steps below to create your gem listing.
                    </p>
                </div>

                {/* AI Prefill banner */}
                {aiPrefillBanner && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 18px', marginBottom: 20, borderRadius: 10,
                        background: 'rgba(196,137,42,0.08)', border: `0.5px solid ${T.gold}40`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Sparkles size={16} color={T.gold} />
                            <span style={{ fontFamily: BODY, fontSize: '0.84rem', color: T.gold, fontWeight: 600 }}>
                                Auto-filled from AI Price Prediction
                                {aiPrefillBanner.predictedPrice && (
                                    <span style={{ marginLeft: 6, fontWeight: 700 }}>
                                        · Est. {formatLKR(aiPrefillBanner.predictedPrice)}
                                    </span>
                                )}
                            </span>
                        </div>
                        <button onClick={() => {
                            localStorage.removeItem(DRAFT_KEY);
                            setAiPrefillBanner(null);
                            setHasDraft(false);
                            window.location.reload();
                        }} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: BODY, fontSize: '0.78rem', color: T.muted, textDecoration: 'underline',
                        }}>
                            Clear
                        </button>
                    </div>
                )}

                {/* Draft restoration banner */}
                {hasDraft && !aiPrefillBanner && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 18px', marginBottom: 20, borderRadius: 10,
                        background: 'rgba(26,77,140,0.06)', border: `0.5px solid ${T.border}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FileText size={16} color={T.sapphire} />
                            <span style={{ fontFamily: BODY, fontSize: '0.84rem', color: T.sapphire, fontWeight: 600 }}>
                                Draft restored from your last session
                            </span>
                        </div>
                        <button onClick={() => {
                            localStorage.removeItem(DRAFT_KEY);
                            setHasDraft(false);
                            window.location.reload();
                        }} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: BODY, fontSize: '0.78rem', color: T.muted, textDecoration: 'underline',
                        }}>
                            Discard draft
                        </button>
                    </div>
                )}

                <GemForm
                    categories={categories}
                    onSubmit={handleSubmit}
                    isSubmitting={mutation.isPending}
                    aiQuickList={!!aiPrefillBanner}
                    initialValues={aiPrefillData}
                />
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Certificate upload prompt after gem creation */}
            {certPrompt && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(4px)',
                }}>
                    <div style={{
                        background: T.white, borderRadius: 16, padding: '40px 36px 32px',
                        maxWidth: 420, width: '90%', textAlign: 'center',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                        animation: 'slideIn 0.3s ease-out',
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 18px',
                            background: 'rgba(26,77,140,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Shield size={28} color={T.sapphire} />
                        </div>
                        <h2 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 700, color: T.text }}>
                            Gem Saved!
                        </h2>
                        <p style={{ margin: '0 0 28px', fontFamily: BODY, fontSize: '0.88rem', color: T.muted, lineHeight: 1.5 }}>
                            Would you like to upload an authenticity certificate for this gem? Certified gems attract more buyers.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                onClick={() => navigate('/seller-dashboard', { state: { tab: 'certificates' } })}
                                style={{
                                    padding: '11px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: T.sapphire, color: T.white,
                                    fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600,
                                }}
                            >
                                Upload Certificate
                            </button>
                            <button
                                onClick={() => navigate('/seller-dashboard')}
                                style={{
                                    padding: '11px 24px', borderRadius: 8, cursor: 'pointer',
                                    background: 'none', border: `1.5px solid ${T.border}`, color: T.text,
                                    fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600,
                                }}
                            >
                                Skip for Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(40px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CreateGemPage;
