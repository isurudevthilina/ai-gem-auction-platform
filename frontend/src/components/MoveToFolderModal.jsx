import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, FolderIcon } from "lucide-react";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.97 },
};

const MoveToFolderModal = ({
  isOpen,
  folders,
  activeGem,
  onClose,
  onConfirm,
}) => {
  const [selectedFolderId, setSelectedFolderId] = React.useState(
    activeGem?.folderId || 1
  );

  // Keep the selection in sync if the user opens the modal for a different gem
  React.useEffect(() => {
    if (activeGem) {
      setSelectedFolderId(activeGem.folderId);
    }
  }, [activeGem]);

  if (!isOpen) return null;

  // We do not allow moving directly "into" the "All Favorites" pseudo folder
  const selectableFolders = folders.filter((folder) => folder.id !== 1);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.18 }}
      >
        {/* Dimmed background */}
        <button
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal card */}
        <motion.div
          className="relative z-50 w-full max-w-md rounded-2xl border border-white/15 bg-gradient-to-b from-[#141829] via-[#050816] to-black/95 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.95)]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
                Move Gem
              </p>
              <h3 className="text-lg font-semibold text-white">
                {activeGem?.name || "Selected Gem"}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Choose a destination folder to keep your watchlist organized.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-slate-300 hover:text-white hover:border-white/40 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Folder options */}
          <div className="space-y-2 mb-5 max-h-60 overflow-y-auto pr-1">
            {selectableFolders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "border-[#FF8A00]/80 bg-[#FF8A00]/15 text-white"
                      : "border-white/12 bg-white/5 text-slate-200 hover:border-[#7B61FF]/60 hover:bg-[#7B61FF]/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 border border-white/10">
                      <FolderIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{folder.name}</span>
                  </span>

                  {isSelected && (
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#FF8A00] via-[#FF3CAC] to-[#7B61FF] shadow-[0_0_10px_rgba(255,138,0,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-black/60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selectedFolderId)}
              className="rounded-full bg-gradient-to-r from-[#FF8A00] via-[#FF3CAC] to-[#7B61FF] px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_0_25px_rgba(255,138,0,0.6)] hover:shadow-[0_0_40px_rgba(255,138,0,0.8)] transition-shadow"
            >
              Move Gem
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MoveToFolderModal;

