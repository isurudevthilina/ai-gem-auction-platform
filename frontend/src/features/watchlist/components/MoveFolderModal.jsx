import { useEffect } from 'react';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', text: '#1A1A2E', muted: '#6B6B7B',
    faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const FolderIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const CheckSvg = ({ size = 16, color = C.gold }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const MoveFolderModal = ({ isOpen, onClose, item, folders, onMove }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen || !item) return null;

    const gem = item.gem || {};
    const currentFolderId = item.folder_id || 'uncategorized';
    const pickableFolders = [
        { id: 'uncategorized', name: 'Uncategorized', gem_count: '' },
        ...(folders || []).filter((f) => f.id !== 'all' && f.id !== 'uncategorized'),
    ];

    const handlePick = (folderId) => {
        if (folderId === currentFolderId) return;
        onMove({ id: item.id, folderId: folderId === 'uncategorized' ? null : folderId });
        onClose();
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <div onClick={(e) => e.stopPropagation()} style={{
                background: C.white, borderRadius: 16, padding: '28px 32px 32px',
                width: '100%', maxWidth: 400,
                boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            }}>
                <h2 style={{ margin: '0 0 4px', fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 700, color: C.text }}>
                    Move to Folder
                </h2>
                {gem.title && (
                    <p style={{
                        margin: '0 0 4px', fontFamily: BODY, fontSize: '0.82rem', color: C.sapphire,
                        fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {gem.title}
                    </p>
                )}
                <p style={{ margin: '0 0 18px', fontFamily: BODY, fontSize: '0.82rem', color: C.muted }}>
                    Select a destination folder
                </p>

                <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {pickableFolders.map((f) => {
                        const isCurrent = f.id === currentFolderId;
                        return (
                            <div key={f.id} onClick={() => handlePick(f.id)} style={{
                                padding: '11px 16px', cursor: isCurrent ? 'default' : 'pointer', borderRadius: 10,
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: isCurrent ? C.goldLight : 'transparent',
                                border: isCurrent ? `1px solid ${C.gold}30` : '1px solid transparent',
                                transition: 'background 0.15s, border-color 0.15s',
                                opacity: isCurrent ? 0.7 : 1,
                            }} onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = C.bg; }}
                               onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}>
                                <FolderIcon size={16} />
                                <span style={{ flex: 1, fontFamily: BODY, fontSize: '0.88rem', color: C.text }}>
                                    {f.name}
                                </span>
                                {f.gem_count !== '' && (
                                    <span style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
                                        {f.gem_count}
                                    </span>
                                )}
                                {isCurrent && (
                                    <span style={{ fontFamily: BODY, fontSize: '0.68rem', color: C.gold, fontWeight: 600 }}>
                                        Current
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MoveFolderModal;
