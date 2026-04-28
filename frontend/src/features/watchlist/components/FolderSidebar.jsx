import FolderCard from './FolderCard';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C',
    muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const FolderSidebar = ({ folders, activeFolder, onSelectFolder, onCreateClick, isLoading, onRename, onDelete }) => {
    const realFolderCount = (folders || []).filter((f) =>
        f.id !== 'all' && f.id !== 'uncategorized' && !f.is_system
    ).length;

    return (
        <div style={{
            background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14,
            padding: '20px 0',
        }}>
            {/* Header */}
            <div style={{ padding: '0 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                    fontFamily: DISPLAY, fontSize: '0.65rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted,
                }}>
                    Folders
                </span>
                <button onClick={onCreateClick} style={{
                    width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.sapphire, fontSize: '1.1rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                }} onMouseEnter={(e) => e.currentTarget.style.background = C.bg}
                   onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    +
                </button>
            </div>

            {/* Folder list */}
            {isLoading ? (
                [0, 1, 2].map((i) => (
                    <div key={i} style={{
                        height: 36, background: '#E8E5E0', borderRadius: 8,
                        margin: '4px 18px', animation: 'wl-pulse 1.5s ease-in-out infinite',
                    }} />
                ))
            ) : (
                (folders || []).map((folder) => (
                    <div key={folder.id}>
                        <FolderCard
                            folder={folder}
                            isActive={folder.id === activeFolder}
                            isVirtual={folder.id === 'all' || folder.id === 'uncategorized' || folder.is_system}
                            onClick={() => onSelectFolder(folder.id)}
                            onRename={onRename}
                            onDelete={onDelete}
                        />
                        {/* Divider before the "Ended" system folder */}
                        {folder.is_system && folder.name === 'Ended' && (
                            <div style={{ height: 1, background: C.border, margin: '6px 18px' }} />
                        )}
                    </div>
                ))
            )}

            {/* Footer */}
            <div style={{ padding: '14px 18px 0', fontFamily: BODY, fontSize: '0.75rem', color: C.faint }}>
                {realFolderCount} / 20 folders used
            </div>

            <style>{`
                @keyframes wl-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </div>
    );
};

export default FolderSidebar;
