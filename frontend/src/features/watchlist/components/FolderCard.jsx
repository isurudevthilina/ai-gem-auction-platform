import { useState } from 'react';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
    red: '#B91C1C',
};
const BODY = "'Jost','Inter',sans-serif";

const FolderSvg = ({ size = 16, color = C.muted }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const PencilSvg = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
);

const TrashSvg = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const FolderCard = ({ folder, isActive, isVirtual, onClick, onRename, onDelete }) => {
    const [hover, setHover] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const showActions = hover || showDeleteConfirm;

    return (
        <div>
            <div
                onClick={onClick}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    padding: '9px 18px', cursor: 'pointer', transition: 'background 0.15s',
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderLeft: isActive ? `3px solid ${C.sapphire}` : '3px solid transparent',
                    background: isActive ? 'rgba(26,77,140,0.05)' : hover ? 'rgba(26,77,140,0.02)' : 'transparent',
                }}
            >
                <FolderSvg size={16} color={isActive ? C.sapphire : C.muted} />
                <span style={{
                    flex: 1, fontFamily: BODY, fontSize: '0.88rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? C.sapphire : C.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140,
                }}>
                    {folder.name}
                </span>
                {!isVirtual && (
                    <div style={{
                        display: 'flex', gap: 4, alignItems: 'center',
                        opacity: showActions ? 1 : 0,
                        pointerEvents: showActions ? 'auto' : 'none',
                        transition: 'opacity 0.15s',
                    }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRename(folder); }}
                            style={{
                                width: 26, height: 26, borderRadius: 6, border: 'none',
                                background: 'transparent', color: C.muted, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.sapphire; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
                        >
                            <PencilSvg />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm((v) => !v); }}
                            style={{
                                width: 26, height: 26, borderRadius: 6, border: 'none',
                                background: showDeleteConfirm ? 'rgba(185,28,28,0.08)' : 'transparent',
                                color: showDeleteConfirm ? C.red : C.muted, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(185,28,28,0.08)'; e.currentTarget.style.color = C.red; }}
                            onMouseLeave={(e) => { if (!showDeleteConfirm) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; } }}
                        >
                            <TrashSvg />
                        </button>
                    </div>
                )}
                <span style={{
                    fontSize: '0.72rem', fontWeight: 600, color: C.faint,
                    background: C.bg, padding: '2px 8px', borderRadius: 10,
                    fontFamily: BODY, flexShrink: 0,
                }}>
                    {folder.gem_count}
                </span>
            </div>

            {showDeleteConfirm && (
                <div style={{
                    background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    margin: '4px 18px 4px 18px',
                }}>
                    <p style={{ margin: '0 0 8px', fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>
                        Delete this folder? Items will move to Uncategorized.
                    </p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                            style={{
                                background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6,
                                fontFamily: BODY, fontSize: '0.78rem', color: C.muted,
                                cursor: 'pointer', padding: '5px 12px', transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = C.bg}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(folder.id);
                                setShowDeleteConfirm(false);
                            }}
                            style={{
                                background: C.red, color: '#fff', border: 'none', borderRadius: 6,
                                fontFamily: BODY, fontSize: '0.78rem', fontWeight: 600,
                                cursor: 'pointer', padding: '5px 12px', transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FolderCard;
