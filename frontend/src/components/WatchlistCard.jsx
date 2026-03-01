import React from "react";
import { motion } from "framer-motion";
import { MoveRight, Gem } from "lucide-react";
import FavoriteButton from "./FavoriteButton";

const WatchlistCard = ({ gem, onRemove, onMove, formatPrice }) => {
  return (
    <motion.article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.8)]"
      whileHover={{
        y: -6,
        boxShadow: "0 26px 55px rgba(0,0,0,0.95)",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {/* Top image area */}
      <div className="relative">
        {/* Placeholder gem image or gradient if real image is missing */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#FF8A00]/40 via-[#FF3CAC]/25 to-[#7B61FF]/40 flex items-center justify-center">
          {gem.image ? (
            <img
              src={gem.image}
              alt={gem.name}
              className="h-full w-full object-cover object-center opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-transform duration-300"
            />
          ) : (
            <Gem className="h-12 w-12 text-white/80" />
          )}
        </div>

        {/* Glow border accent */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10/50 group-hover:border-[#FF8A00]/60 group-hover:opacity-100 opacity-0 transition-opacity duration-300" />

        {/* Heart (remove) button */}
        <FavoriteButton
          isActive
          onClick={onRemove}
          className="absolute right-3 top-3"
        />
      </div>

      {/* Content section */}
      <div className="flex flex-1 flex-col justify-between px-3.5 py-3.5 sm:px-4 sm:py-4">
        <div className="mb-3 space-y-1.5">
          <h3 className="text-sm sm:text-[15px] font-semibold text-white line-clamp-1">
            {gem.name}
          </h3>
          <p className="text-xs text-slate-400">
            {gem.carat.toFixed(2)} ct • {gem.clarity} clarity
          </p>
          <p className="text-sm font-semibold text-[#FFCF7F]">
            {formatPrice(gem.price)}
          </p>
        </div>

        {/* Bottom row with move button */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Live Auction • Watchlist
          </p>

          <button
            onClick={onMove}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-100 transition-colors hover:border-[#FF8A00]/70 hover:bg-[#FF8A00]/20 focus:outline-none focus:ring-2 focus:ring-[#FF8A00]/70 focus:ring-offset-2 focus:ring-offset-black"
          >
            <span>Move</span>
            <MoveRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default WatchlistCard;

