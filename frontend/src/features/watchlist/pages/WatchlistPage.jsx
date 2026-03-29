import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetFolders, useCreateFolder, useRenameFolder, useDeleteFolder } from '../hooks/useFolders';
import { useGetWatchlist, useRemoveFromWatchlist, useMoveToFolder } from '../hooks/useWatchlist';
import FolderSidebar from '../components/FolderSidebar';
import WatchlistGemCard from '../components/WatchlistGemCard';
import CreateFolderModal from '../components/CreateFolderModal';
import MoveFolderModal from '../components/MoveFolderModal';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const GemOutlineSvg = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={C.sapphire} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3l1 10" /><path d="M2 9h20" /><path d="m6 3 6 6 6-6" />
    </svg>
);

const WatchlistPage = () => {
    const navigate = useNavigate();
    const [activeFolder, setActiveFolder] = useState('all');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [renameModal, setRenameModal] = useState(null);
    const [moveModal, setMoveModal] = useState(null);

    const { data: folders, isLoading: foldersLoading } = useGetFolders();
    const { data: items, isLoading: itemsLoading } = useGetWatchlist(activeFolder);
    const createFolder = useCreateFolder();
    const renameFolder = useRenameFolder();
    const deleteFolder = useDeleteFolder();
    const removeMutation = useRemoveFromWatchlist();
    const moveMutation = useMoveToFolder();

    const totalCount = (folders || []).find((f) => f.id === 'all')?.gem_count || 0;

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: BODY }}>
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 24px 80px' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h1 style={{ margin: '0 0 4px', fontFamily: DISPLAY, fontSize: '1.8rem', color: C.text }}>
                        My Watchlist
                    </h1>
                    <p style={{ margin: '0 0 32px', fontFamily: BODY, fontSize: '0.92rem', color: C.muted }}>
                        {totalCount} saved gem{totalCount !== 1 ? 's' : ''}
                    </p>
                </motion.div>

                {/* Two-column layout */}
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                    {/* Sidebar */}
                    <div style={{ width: 260, flexShrink: 0 }}>
                        <FolderSidebar
                            folders={folders || []}
                            activeFolder={activeFolder}
                            onSelectFolder={setActiveFolder}
                            onCreateClick={() => setCreateModalOpen(true)}
                            isLoading={foldersLoading}
                            onRename={(folder) => setRenameModal(folder)}
                            onDelete={(id) => {
                                deleteFolder.mutate(id);
                                if (activeFolder === id) setActiveFolder('all');
                            }}
                        />
                    </div>

                    {/* Main content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {itemsLoading ? (
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20,
                            }}>
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} style={{
                                        height: 320, background: '#E8E5E0', borderRadius: 16,
                                        animation: 'wlp-pulse 1.5s ease-in-out infinite',
                                    }} />
                                ))}
                            </div>
                        ) : items && items.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.1 }}
                                style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20,
                                }}
                            >
                                {items.map((item) => (
                                    <WatchlistGemCard
                                        key={item.id}
                                        item={item}
                                        folders={folders || []}
                                        onRemove={(gemId) => removeMutation.mutate(gemId)}
                                        onMove={(itm) => setMoveModal(itm)}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', padding: '80px 24px', textAlign: 'center',
                                }}
                            >
                                <GemOutlineSvg />
                                <h3 style={{ margin: '18px 0 6px', fontFamily: SERIF, fontSize: '1.2rem', fontWeight: 700, color: C.text }}>
                                    {activeFolder === 'all' ? 'Your watchlist is empty' : 'This folder is empty'}
                                </h3>
                                <p style={{ margin: '0 0 20px', fontFamily: BODY, fontSize: '0.88rem', color: C.muted }}>
                                    {activeFolder === 'all'
                                        ? 'Save gems you love and organize them into folders.'
                                        : 'Browse gems and save them to this folder.'}
                                </p>
                                <button onClick={() => navigate('/gems')} style={{
                                    background: C.sapphire, color: '#fff', border: 'none',
                                    borderRadius: 10, padding: '12px 28px', fontFamily: BODY,
                                    fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                                    transition: 'opacity 0.2s',
                                }}>
                                    {activeFolder === 'all' ? 'Discover Gems' : 'Browse Gems'}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>

            {/* Create folder modal */}
            <CreateFolderModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                mode="create"
                onSubmit={async (name) => {
                    await createFolder.mutateAsync(name);
                    setCreateModalOpen(false);
                }}
            />

            {/* Rename folder modal */}
            {renameModal && (
                <CreateFolderModal
                    isOpen={!!renameModal}
                    onClose={() => setRenameModal(null)}
                    mode="rename"
                    folder={renameModal}
                    onSubmit={async (name) => {
                        await renameFolder.mutateAsync({ id: renameModal.id, name });
                        setRenameModal(null);
                    }}
                />
            )}

            {/* Move modal */}
            <MoveFolderModal
                isOpen={!!moveModal}
                onClose={() => setMoveModal(null)}
                item={moveModal}
                folders={folders || []}
                onMove={({ id, folderId }) => {
                    moveMutation.mutate({ id, folderId });
                    setMoveModal(null);
                }}
            />

            <style>{`
                @keyframes wlp-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </div>
    );
};

export default WatchlistPage;
