import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import FolderSidebar from "../components/watchlist/FolderSidebar";
import WatchlistGrid from "../components/watchlist/WatchlistGrid";
import MoveToFolderModal from "../components/watchlist/MoveToFolderModal";

// Simple mock folders (user cannot create new ones)
const INITIAL_FOLDERS = [
  { id: 1, name: "All Favorites" }, // special folder – shows everything
  { id: 2, name: "High Value" },
  { id: 3, name: "Rare Finds" },
  { id: 4, name: "Sri Lankan Gems" },
];

// Simple mock gems shown in the watchlist
const INITIAL_GEMS = [
  {
    id: 1,
    name: "Royal Blue Sapphire",
    price: 334850,
    carat: 3.42,
    clarity: "VVS1",
    image: "/placeholder-gem-1.jpg",
    folderId: 2,
  },
  {
    id: 2,
    name: "Emerald Cut Diamond",
    price: 485000,
    carat: 2.1,
    clarity: "IF",
    image: "/placeholder-gem-2.jpg",
    folderId: 2,
  },
  {
    id: 3,
    name: "Padparadscha Sapphire",
    price: 185000,
    carat: 1.8,
    clarity: "VS1",
    image: "/placeholder-gem-3.jpg",
    folderId: 3,
  },
  {
    id: 4,
    name: "Ceylon Ruby",
    price: 264000,
    carat: 2.7,
    clarity: "VVS2",
    image: "/placeholder-gem-4.jpg",
    folderId: 4,
  },
];

const Watchlist = () => {
  // Which folder is currently selected in the sidebar
  const [selectedFolderId, setSelectedFolderId] = useState(1);
  // Local state for gems in the watchlist
  const [gems, setGems] = useState(INITIAL_GEMS);

  // State for the "move to folder" modal
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [activeGem, setActiveGem] = useState(null);

  // A simple counter we use when adding new mock gems
  const [nextGemId, setNextGemId] = useState(INITIAL_GEMS.length + 1);

  // Helper to format prices nicely as LKR currency
  const formatPrice = (value) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(value);

  // Compute how many gems are in each folder for the sidebar badges
  const folderCounts = useMemo(() => {
    const counts = {};
    // First count all gems into their folders
    gems.forEach((gem) => {
      counts[gem.folderId] = (counts[gem.folderId] || 0) + 1;
    });
    // "All Favorites" (id:1) shows all gems
    counts[1] = gems.length;
    return counts;
  }, [gems]);

  // Filter the list of gems based on the currently selected folder
  const filteredGems = useMemo(() => {
    if (selectedFolderId === 1) return gems; // "All Favorites"
    return gems.filter((gem) => gem.folderId === selectedFolderId);
  }, [gems, selectedFolderId]);

  // Remove gem from watchlist (heart button)
  const handleRemoveGem = (id) => {
    setGems((prev) => prev.filter((gem) => gem.id !== id));
  };

  // Open modal to move a gem into a different folder
  const handleOpenMoveModal = (gem) => {
    setActiveGem(gem);
    setIsMoveModalOpen(true);
  };

  // Actually move the gem once the user picks a folder in the modal
  const handleMoveGemToFolder = (targetFolderId) => {
    if (!activeGem) return;
    setGems((prev) =>
      prev.map((gem) =>
        gem.id === activeGem.id ? { ...gem, folderId: targetFolderId } : gem
      )
    );
    setIsMoveModalOpen(false);
    setActiveGem(null);
  };

  // Simple "add gem" action that drops a mock gem into the selected folder
  const handleAddGemToCurrentFolder = () => {
    // Avoid adding into the "All Favorites" pseudo folder
    const targetFolderId = selectedFolderId === 1 ? 2 : selectedFolderId;
    const targetFolder = INITIAL_FOLDERS.find(
      (folder) => folder.id === targetFolderId
    );

    const newGem = {
      id: nextGemId,
      name: `New ${targetFolder?.name || "Gem"} #${nextGemId}`,
      price: 150000 + Math.round(Math.random() * 250000),
      carat: 1.5 + Math.random() * 2,
      clarity: "VS1",
      image: "/placeholder-gem-new.jpg",
      folderId: targetFolderId,
    };

    setGems((prev) => [newGem, ...prev]);
    setNextGemId((prev) => prev + 1);
    // If we were on "All Favorites" this new gem will automatically appear there
  };

  const currentFolder = INITIAL_FOLDERS.find(
    (folder) => folder.id === selectedFolderId
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-100 relative overflow-hidden">
      {/* Soft gradient/glow background layer */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[#FF3CAC] blur-3xl opacity-30" />
        <div className="absolute top-20 -right-32 h-96 w-96 rounded-full bg-[#7B61FF] blur-3xl opacity-40" />
        <div className="absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#1F2933_1px,transparent_0)] [background-size:32px_32px] opacity-[0.12]" />

      {/* Page content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 lg:py-14">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <motion.h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-to-r from-[#FF8A00] via-[#FF3CAC] to-[#7B61FF] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              My Watchlist
            </motion.h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl">
              Track the gemstones you love across live auctions. Organize them
              into premium folders and stay ready for the winning bid.
            </p>
          </div>

          {/* Simple "Add gem" button for demo purposes */}
          <button
            onClick={handleAddGemToCurrentFolder}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF8A00] via-[#FF3CAC] to-[#7B61FF] px-4 py-2 text-sm font-medium shadow-[0_0_25px_rgba(255,138,0,0.35)] hover:shadow-[0_0_40px_rgba(255,138,0,0.55)] transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] focus:ring-[#FF8A00]"
          >
            Add Gem to Folder
          </button>
        </div>

        {/* Main layout: sidebar + grid */}
        <div className="grid gap-6 lg:grid-cols-[260px,minmax(0,1fr)]">
          <FolderSidebar
            folders={INITIAL_FOLDERS}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            folderCounts={folderCounts}
          />

          <WatchlistGrid
            gems={filteredGems}
            formatPrice={formatPrice}
            onRemoveGem={handleRemoveGem}
            onMoveGem={handleOpenMoveModal}
            currentFolderName={currentFolder?.name || "Watchlist"}
          />
        </div>
      </div>

      {/* Move-to-folder modal */}
      <MoveToFolderModal
        isOpen={isMoveModalOpen}
        folders={INITIAL_FOLDERS}
        activeGem={activeGem}
        onClose={() => {
          setIsMoveModalOpen(false);
          setActiveGem(null);
        }}
        onConfirm={handleMoveGemToFolder}
      />
    </div>
  );
};

export default Watchlist;

