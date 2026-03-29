import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, ArrowUpCircle, Gavel } from 'lucide-react';
import { deleteGem, publishGem } from '../../gems/services/gemsService';

/* ─── Design tokens ─── */
const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const STATUS_STYLES = {
    draft:      { bg: 'rgba(154,154,171,0.10)', color: C.faint, label: 'Draft' },
    listed:     { bg: 'rgba(26,77,140,0.10)', color: C.sapphire, label: 'Listed' },
    in_auction: { bg: C.goldLight, color: C.gold, label: 'In Auction' },
    sold:       { bg: 'rgba(22,163,74,0.10)', color: C.green, label: 'Sold' },
};

/* Gem SVG placeholder */
const GemPlaceholder = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.faint}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
        <path d="m16 16 6-6" /><path d="m8 8 6-6" />
        <path d="m9 7 8 8" /><path d="m21 11-8-8" />
    </svg>
);

const gridCols = '60px 1fr 110px 100px 110px 130px';

const ListingRow = ({ gem, onRefresh }) => {
    const navigate = useNavigate();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [toast, setToast] = useState(null);
    const [busy, setBusy] = useState(false);

    const coverUrl = gem.images?.find(u => !u.startsWith('model:'));
    const sts = STATUS_STYLES[gem.status] || STATUS_STYLES.draft;

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async () => {
        setBusy(true);
        try {
            await deleteGem(gem.id);
            showToast('Gem deleted');
            onRefresh?.();
        } catch (err) {
            showToast(err?.message || 'Delete failed', 'error');
        } finally {
            setBusy(false);
            setConfirmDelete(false);
        }
    };

    const handlePublish = async () => {
        setBusy(true);
        try {
            await publishGem(gem.id);
            showToast('Gem published');
            onRefresh?.();
        } catch (err) {
            showToast(err?.message || 'Publish failed', 'error');
        } finally {
            setBusy(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return '--';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const iconBtn = (onClick, title, children, color = C.muted) => (
        <button onClick={onClick} title={title} style={{
            width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`,
            background: C.white, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color,
            transition: 'all 0.15s', position: 'relative',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
        >
            {children}
        </button>
    );

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                display: 'grid', gridTemplateColumns: gridCols, gap: 12,
                padding: '12px 16px', alignItems: 'center',
                background: C.white, borderRadius: 10,
                border: `1px solid ${C.border}`,
                transition: 'box-shadow 0.15s',
            }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
                {/* Col 1: Cover */}
                <div style={{
                    width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
                    background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {coverUrl
                        ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <GemPlaceholder />
                    }
                </div>

                {/* Col 2: Title & details */}
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: SERIF, fontSize: '0.9rem', fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {gem.title}
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint, marginTop: 2 }}>
                        {[gem.carat_weight ? `${gem.carat_weight} ct` : null, gem.color, gem.cut].filter(Boolean).join(' \u00B7 ')}
                    </div>
                </div>

                {/* Col 3: Status badge */}
                <div>
                    <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                        background: sts.bg, color: sts.color,
                        fontFamily: DISPLAY, fontSize: '0.62rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>{sts.label}</span>
                </div>

                {/* Col 4: Price */}
                <div style={{ fontFamily: BODY, fontSize: '0.88rem', fontWeight: 700, color: C.text }}>
                    {gem.buy_now_price ? `$${Number(gem.buy_now_price).toLocaleString()}` : '\u2014'}
                </div>

                {/* Col 5: Date */}
                <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.faint }}>
                    {formatDate(gem.created_at)}
                </div>

                {/* Col 6: Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {iconBtn(() => navigate(`/gems/${gem.id}/edit`), 'Edit', <Pencil size={14} />, C.sapphire)}

                    {gem.status === 'draft' && (
                        <>
                            {iconBtn(() => setConfirmDelete(true), 'Delete', <Trash2 size={14} />, C.red)}
                            {iconBtn(handlePublish, 'Publish', <ArrowUpCircle size={14} />, C.green)}
                        </>
                    )}

                    {gem.status === 'listed' && (
                        iconBtn(() => navigate(`/auctions/new?gemId=${gem.id}`), 'Launch Auction', <Gavel size={14} />, C.gold)
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'absolute', top: -36, right: 16,
                    padding: '6px 14px', borderRadius: 8,
                    background: toast.type === 'error' ? 'rgba(185,28,28,0.1)' : 'rgba(22,163,74,0.1)',
                    color: toast.type === 'error' ? C.red : C.green,
                    fontFamily: BODY, fontSize: '0.76rem', fontWeight: 600,
                    border: `1px solid ${toast.type === 'error' ? 'rgba(185,28,28,0.2)' : 'rgba(22,163,74,0.2)'}`,
                    zIndex: 10,
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Delete confirm popover */}
            {confirmDelete && (
                <div style={{
                    position: 'absolute', top: '100%', right: 16, marginTop: 4,
                    background: C.white, borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    padding: 16, zIndex: 20, width: 240,
                }}>
                    <div style={{ fontFamily: BODY, fontSize: '0.82rem', color: C.text, fontWeight: 600, marginBottom: 12 }}>
                        Delete this gem? This cannot be undone.
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => setConfirmDelete(false)} style={{
                            padding: '6px 14px', borderRadius: 6,
                            border: `1px solid ${C.border}`, background: 'transparent',
                            color: C.muted, fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        }}>Cancel</button>
                        <button onClick={handleDelete} disabled={busy} style={{
                            padding: '6px 14px', borderRadius: 6,
                            border: 'none', background: C.red, color: '#fff',
                            fontFamily: BODY, fontSize: '0.78rem', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                            opacity: busy ? 0.7 : 1,
                        }}>Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingRow;
