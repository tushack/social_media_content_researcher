import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Bookmark,
  Clock,
  LayoutDashboard,
  LogOut,
  Play,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";

const publicNavItems = [];

const privateNavItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Trends",
    icon: TrendingUp,
    path: "/trends",
  },
  {
    label: "Competitors",
    icon: Users,
    path: "/competitors",
  },
  {
    label: "Saved Ideas",
    icon: Bookmark,
    path: "/saved-ideas",
  },
  {
    label: "History",
    icon: Clock,
    path: "/history",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, setAuthModalOpen, signOut } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const navItems = user ? privateNavItems : publicNavItems;

  const handleConfirmLogout = async () => {
    await signOut();
    setLogoutModalOpen(false);
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[82vw] max-w-72 flex-col border-r border-white/10 bg-[#0b0c11]/95 p-4 backdrop-blur-2xl transition-transform duration-300 sm:p-5 lg:w-72 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-7 flex items-center justify-between sm:mb-9">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20 sm:h-11 sm:w-11">
              <Play className="h-5 w-5 fill-white text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-white">
                ViralMind
              </h1>
              <p className="truncate text-xs text-zinc-500">
                AI YouTube Research
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-xl p-2 text-zinc-400 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-white/[0.08] text-white shadow-inner shadow-white/5"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10">
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>

          <p className="text-sm font-medium text-white">
            {user ? "Creator Pro" : "Create your account"}
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {user
              ? "Unlock deeper competitor tracking and daily viral idea alerts."
              : "Sign up to scan viral ideas, save research, and access your history."}
          </p>

          {!user ? (
            <Button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="mt-4 h-9 w-full rounded-2xl bg-white text-sm font-medium text-black hover:bg-zinc-200"
            >
              Sign up
            </Button>
          ) : (
            <div className="mt-4 space-y-2">
              <Button
                type="button"
                className="h-9 w-full rounded-2xl bg-white text-sm font-medium text-black hover:bg-zinc-200"
              >
                Upgrade
              </Button>

              <button
                type="button"
                onClick={() => setLogoutModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.08]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {logoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0b0c11] p-6 shadow-2xl shadow-black/50">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
              <LogOut className="h-5 w-5 text-red-300" />
            </div>

            <h2 className="text-xl font-semibold text-white">
              Are you sure?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Are you sure you want to logout from your account?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-200 hover:bg-white/[0.08]"
              >
                No
              </Button>

              <Button
                type="button"
                onClick={handleConfirmLogout}
                className="h-11 rounded-2xl bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-400"
              >
                Yes, Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}