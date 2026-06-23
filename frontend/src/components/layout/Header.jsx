import React from "react";
import { Menu, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";



export default function Header({

  setSidebarOpen,
  eyebrow = "Research Dashboard",
  title = "Discover your next viral video",
  onNewScan,
}) {

  const navigate = useNavigate();
  const handleNewScanClick = () => {
    if (onNewScan) {
      onNewScan();
      return;
    }

    navigate("/dashboard", {
      state: {
        forceNewScan: true,
      },
    });
  };
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-[#08090d]/75 px-4 py-3 backdrop-blur-2xl sm:min-h-20 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] p-2 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-[10px] uppercase tracking-[0.2em] text-cyan-300/80 sm:text-xs sm:tracking-[0.24em]">
            {eyebrow}
          </p>

          <h2 className="truncate text-sm font-semibold tracking-tight text-white sm:text-xl">
            {title}
          </h2>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleNewScanClick}
      >
        New Scan
      </Button>
    </header>
  );
}