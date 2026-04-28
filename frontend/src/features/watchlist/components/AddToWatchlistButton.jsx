import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCheckWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from '../hooks/useWatchlist';
import { useGetFolders, useCreateFolder } from '../hooks/useFolders';
import CreateFolderModal from './CreateFolderModal';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', text: '#1A1A2E', muted: '#6B6B7B',
    faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const HeartOutline = ({ size = 16, color = C.muted }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const HeartFilled = ({ size = 16, color = C.gold }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const FolderIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const Spinner = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'watchlist-spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const AddToWatchlistButton = ({ gemId, auctionId, size = 'md' }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: checkData } = useCheckWatchlist(gemId);
    const addMutation = useAddToWatchlist();
    const removeMutation = useRemoveFromWatchlist();
    const { data: folders } = useGetFolders();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const dropdownRef = useRef(null);
    const createFolderMutation = useCreateFolder();

    const inWatchlist = checkData?.inWatchlist || false;
    const isLoading = addMutation.isPending || removeMutation.isPending;

    useEffect(() => {
        if (!showDropdown) return;
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showDropdown]);

    const handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        if (inWatchlist) {
            removeMutation.mutate(gemId);
        } else {
            setShowDropdown(true);
        }
    };

    const handleAddToFolder = (folderId) => {
        addMutation.mutate({
            gem_id: gemId,
            auction_id: auctionId || undefined,
            folder_id: folderId === 'uncategorized' ? undefined : folderId,
        });
        setShowDropdown(false);
    };

    const isSm = size === 'sm';
    // Hide "All Saved" and system folders like "Ended" from the save dropdown
    const availableFolders = (folders || []).filter((f) => f.id !== 'all' && !f.is_system);

    const btnStyle = inWatchlist
        ? {
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: C.goldLight, border: `0.5px solid ${C.gold}40`,
            borderRadius: 8, padding: isSm ? 6 : '8px 14px',
            color: C.gold, cursor: 'pointer', fontFamily: BODY,
            fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
            position: 'relative',
        }
        : {
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: `0.5px solid ${C.border}`,
            borderRadius: 8, padding: isSm ? 6 : '8px 14px',
            color: C.muted, cursor: 'pointer', fontFamily: BODY,
            fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
            position: 'relative',
        };

    return (
        <>
            <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
                <button onClick={handleClick} style={btnStyle}>
                    {isLoading ? (
                        <Spinner size={16} />
                    ) : inWatchlist ? (
                        <HeartFilled size={16} />
                    ) : (
                        <HeartOutline size={16} />
                    )}
                    {!isSm && (inWatchlist ? 'Saved' : 'Save')}
                </button>

                {showDropdown && (
                    <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 6,
                        background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.10)', width: 220, zIndex: 100,
                        padding: '8px 0',
                    }}>
                        <div style={{ padding: '6px 14px', fontFamily: DISPLAY, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>
                            Save to Folder
                        </div>
                        {availableFolders.map((f) => (
                            <div key={f.id} onClick={() => handleAddToFolder(f.id)} style={{
                                padding: '8px 14px', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: 8, transition: 'background 0.15s',
                                fontFamily: BODY, fontSize: '0.85rem', color: C.text,
                            }} onMouseEnter={(e) => e.currentTarget.style.background = C.bg}
                               onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <FolderIcon size={14} />
                                <span style={{ flex: 1 }}>{f.name}</span>
                                <span style={{ fontSize: '0.72rem', color: C.faint }}>{f.gem_count}</span>
                            </div>
                        ))}
                        <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
                        <div onClick={() => { setShowDropdown(false); setShowCreateModal(true); }} style={{
                            padding: '8px 14px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', gap: 8, fontFamily: BODY, fontSize: '0.85rem',
                            color: C.sapphire, fontWeight: 600, transition: 'background 0.15s',
                        }} onMouseEnter={(e) => e.currentTarget.style.background = C.bg}
                           onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> New Folder
                        </div>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateFolderModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    mode="create"
                    existingFolders={(folders || []).filter(f => f.id !== 'all' && f.id !== 'uncategorized' && !f.is_system)}
                    onSubmit={async (name) => {
                        await createFolderMutation.mutateAsync(name);
                        setShowCreateModal(false);
                    }}
                />
            )}

            <style>{`
                @keyframes watchlist-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default AddToWatchlistButton;
