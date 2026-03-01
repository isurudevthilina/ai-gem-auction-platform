import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import WatchlistCard from "./WatchlistCard";

// Simple fade/scale animation for the grid items
const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.97 },
};

const WatchlistGrid = ({
  gems,
  onRemoveGem,
  onMoveGem,
  formatPrice,
  currentFolderName,
}) => {
  const hasGems = gems.length > 0;

  return (
    <section className="space-y-4">
      {/* Folder summary header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
            Folder
          </p>
          <h2 className="text-lg font-semibold text-white">
            {currentFolderName}
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          {hasGems
            ? `Showing ${gems.length} tracked ${gems.length === 1 ? "gem" : "gems"}.`
            : "No gems currently tracked in this folder."}
        </p>
      </div>

      {/* Main card container for the grid */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-[0_18px_45px_rgba(0,0,0,0.7)]">
        {hasGems ? (
          <motion.div
            layout
            className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            <AnimatePresence initial={false}>
              {gems.map((gem) => (
                <motion.div
                  key={gem.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <WatchlistCard
                    gem={gem}
                    formatPrice={formatPrice}
                    onRemove={() => onRemoveGem(gem.id)}
                    onMove={() => onMoveGem(gem)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          // Empty state when no gems are in the selected folder
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF8A00]/20 via-[#FF3CAC]/20 to-[#7B61FF]/20 flex items-center justify-center border border-white/10">
              <span className="h-9 w-9 rounded-full bg-black/40 border border-white/10" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No gems in this folder yet
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mb-4">
              Add gemstones to your watchlist from live auctions, then organize
              them into curated folders to keep your eye on the right pieces.
            </p>
            <p className="text-xs text-slate-400">
              Tip: use the{" "}
              <span className="font-semibold text-slate-200">
                “Add Gem to Folder”
              </span>{" "}
              button above to quickly simulate this flow while developing.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WatchlistGrid;

