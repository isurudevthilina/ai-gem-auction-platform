import React from "react";
import { FolderIcon } from "lucide-react";

// Simple helper to join Tailwind classes
const classNames = (...classes) => classes.filter(Boolean).join(" ");

const FolderSidebar = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  folderCounts,
}) => {
  return (
    <aside className="space-y-4">
      {/* Sidebar container with glassmorphism */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 mb-3">
          Folders
        </p>

        <div className="space-y-1">
          {folders.map((folder) => {
            const isActive = folder.id === selectedFolderId;
            const count = folderCounts[folder.id] || 0;

            return (
              <button
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                className={classNames(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                  "hover:bg-white/10 hover:text-white",
                  isActive
                    ? "bg-gradient-to-r from-[#FF8A00]/20 via-[#FF3CAC]/20 to-[#7B61FF]/25 text-white border border-white/20"
                    : "text-slate-300 border border-transparent"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={classNames(
                      "flex h-7 w-7 items-center justify-center rounded-lg border text-xs shadow-inner",
                      isActive
                        ? "border-white/30 bg-black/30"
                        : "border-white/10 bg-black/20"
                    )}
                  >
                    <FolderIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>{folder.name}</span>
                </span>

                {/* Count pill */}
                <span
                  className={classNames(
                    "ml-2 inline-flex min-w-[2.2rem] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    isActive
                      ? "bg-white/90 text-slate-900"
                      : "bg-slate-800/80 text-slate-200"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tiny helper text for beginners / users */}
      <p className="text-[11px] text-slate-400 leading-relaxed">
        These folders are curated for you. Use them to quickly group gems by
        value, rarity, and origin. You can freely move items between them.
      </p>
    </aside>
  );
};

export default FolderSidebar;

