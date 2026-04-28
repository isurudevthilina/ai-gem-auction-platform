/**
 * EditGemPage.jsx — /gems/:id/edit
 * Protected: seller & admin only.
 * Loads existing gem data, wraps GemForm in edit mode, calls updateGemViaAPI.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getGem, getGemCategories, updateGemViaAPI, uploadGemImage, uploadGemModel } from '../services/gemsService';
import GemForm from '../components/GemForm';
import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { T, SERIF, DISPLAY, BODY } from '../components/formTokens';

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

const EditGemPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [gem, setGem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        Promise.all([
            getGem(id),
            getGemCategories(),
        ]).then(([gemRes, catRes]) => {
            const g = gemRes.data || gemRes;
            // Ownership check
            if (g.seller?.id !== user?.id && user?.role !== 'admin') {
                navigate('/unauthorized');
                return;
            }
            setGem(g);
            setCategories(catRes.data || []);
        }).catch(() => {
            setToast({ message: 'Failed to load gem.', type: 'error' });
        }).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            // Upload new images if provided
            const newUrls = [];
            if (formData.imageFiles?.length) {
                for (const file of formData.imageFiles) {
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    const is3D = ['glb', 'gltf'].includes(ext);
                    const url = is3D ? await uploadGemModel(file) : await uploadGemImage(file);
                    newUrls.push(url);
                }
            }

            // Merge existing images with new uploads
            const images = [...(formData.existingImages || []), ...newUrls];

            const payload = {
                title: formData.title,
                category_id: formData.category_id,
                carat_weight: parseFloat(formData.carat_weight),
                color: formData.color || undefined,
                clarity: formData.clarity || undefined,
                cut: formData.cut || undefined,
                treatment: formData.treatment || undefined,
                certification_body: formData.certification_body || undefined,
                certification: formData.certification || undefined,
                description: formData.description || undefined,
                listing_type: formData.listing_type,
                buy_now_price: formData.listing_type === 'direct_sell'
                    ? parseFloat(formData.buy_now_price) : null,
            };
            if (images.length) payload.images = images;

            await updateGemViaAPI(id, payload);
            setToast({ message: 'Gem updated successfully!', type: 'success' });
            setTimeout(() => navigate(`/gem/${id}`), 1200);
        } catch (err) {
            setToast({ message: err.message || 'Update failed. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} color={T.sapphire} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!gem) {
        return (
            <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: BODY, color: T.muted }}>Gem not found</p>
            </div>
        );
    }

    // Map gem data to form field names
    const initialValues = {
        gem_type: gem.category?.name || '',
        title: gem.title || '',
        carat_weight: gem.carat_weight ? String(gem.carat_weight) : '',
        color: gem.color || '',
        clarity: gem.clarity || '',
        cut: gem.cut || '',
        treatment: gem.treatment || '',
        certification_body: gem.certification_body || '',
        certification: gem.certification || '',
        description: gem.description || '',
        listing_type: gem.listing_type || 'direct_sell',
        buy_now_price: gem.buy_now_price ? String(gem.buy_now_price) : '',
        images: gem.images || [],
    };

    return (
        <div style={{ minHeight: '100vh', background: T.bg }}>
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: '2.2rem', fontWeight: 700, color: T.text }}>
                        Edit <span style={{ color: T.gold }}>Gemstone</span>
                    </h1>
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: '0.9rem', color: T.muted }}>
                        Update the details of your gem listing.
                    </p>
                </div>

                <GemForm
                    categories={categories}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                    initialValues={initialValues}
                    isEditing
                />
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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

export default EditGemPage;
