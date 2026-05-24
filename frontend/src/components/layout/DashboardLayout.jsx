import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
  eyebrow = "Research Dashboard",
  title = "Discover your next viral video",
  onNewScan,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-12rem] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl sm:h-[34rem] sm:w-[34rem]" />
        <div className="absolute right-[-12rem] top-32 h-[20rem] w-[20rem] rounded-full bg-violet-500/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute bottom-[-16rem] left-[-8rem] h-[22rem] w-[22rem] rounded-full bg-blue-500/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="relative z-10 min-w-0 lg:pl-72">
        <Header
          setSidebarOpen={setSidebarOpen}
          eyebrow={eyebrow}
          title={title}
          onNewScan={onNewScan}
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}