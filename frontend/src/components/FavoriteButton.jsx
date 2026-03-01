import React from "react";
import { Heart } from "lucide-react";

// A tiny reusable heart button used for removing from watchlist
const FavoriteButton = ({ isActive, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      aria-label={isActive ? "Remove from watchlist" : "Add to watchlist"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#FF3CAC] focus:ring-offset-1 focus:ring-offset-black ${
        isActive
          ? "border-[#FF3CAC]/60 bg-black/40 text-[#FFB4E0]"
          : "border-white/20 bg-black/30 text-slate-200"
      } hover:scale-105 hover:border-[#FF8A00]/80 hover:text-[#FFD1A0] ${className}`}
    >
      <Heart
        className="h-4 w-4"
        // When active we fill the heart slightly
        fill={isActive ? "currentColor" : "transparent"}
      />
    </button>
  );
};

export default FavoriteButton;

