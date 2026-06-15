import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Clock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Settings,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";

import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";

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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const accountMenuRef = useRef(null);
  const navigate = useNavigate();

  const navItems = user ? privateNavItems : publicNavItems;

  useEffect(() => {
    if (!user?.uid) {
      setUserProfile(null);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      doc(db, "app_users", user.uid),
      (snapshot) => {
        setUserProfile(snapshot.exists() ? snapshot.data() : null);
      },
      () => {
        setUserProfile(null);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountMenuOpen]);

  const displayName =
    userProfile?.name ||
    userProfile?.fullName ||
    userProfile?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Creator";

  const displayEmail = userProfile?.email || user?.email || "";

  const displayPhoto =
    userProfile?.photoURL ||
    userProfile?.photoUrl ||
    userProfile?.image ||
    userProfile?.avatar ||
    user?.photoURL ||
    "";

  const displayPlan =
    userProfile?.plan ||
    userProfile?.subscription_plan ||
    userProfile?.subscriptionPlan ||
    "free";

  const handleConfirmLogout = async () => {
    await signOut();
    setLogoutModalOpen(false);
    setAccountMenuOpen(false);
  };

  const handleUpgradeClick = () => {
    setAccountMenuOpen(false);
    setSidebarOpen(false);
    navigate("/payment");
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[82vw] max-w-72 flex-col border-r border-white/10 bg-[#0b0c11]/95 p-4 backdrop-blur-2xl transition-transform duration-300 sm:p-5 lg:w-72 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="mb-7 flex items-center justify-between sm:mb-9">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:h-11 sm:w-11">
              <img
                src="/favicon.png"
                alt="Viralo AI"
                className="h-[82%] w-[82%] object-contain"
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-white">
                Viralo AI
              </h1>
              <p className="truncate text-xs text-zinc-500">
                AI Social Media Research
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
              onClick={() => {
                setSidebarOpen(false);
                setAccountMenuOpen(false);
              }}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${isActive
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
          {!user ? (
            <>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10">
                <Sparkles className="h-5 w-5 text-cyan-300" />
              </div>

              <p className="text-sm font-medium text-white">
                Create your account
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Sign up to scan viral ideas, save research, and access your
                history.
              </p>

              <Button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="mt-4 h-9 w-full rounded-2xl bg-white text-sm font-medium text-black hover:bg-zinc-200"
              >
                Sign up
              </Button>
            </>
          ) : (
            <div className="relative" ref={accountMenuRef}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                  {displayPhoto ? (
                    <img
                      src={displayPhoto}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-5 w-5 text-zinc-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>

                  <p className="truncate text-xs text-zinc-500">
                    {displayEmail}
                  </p>

                  <span className="mt-1 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                    {displayPlan} plan
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((current) => !current)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                  aria-label="Account menu"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {accountMenuOpen && (
                <div className="absolute bottom-[calc(100%+0.6rem)] right-0 z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#11131b]/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-2xl">
                  <button
                    type="button"
                    onClick={handleUpgradeClick}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-white/[0.07] hover:text-white"
                    role="menuitem"
                  >
                    <CreditCard className="h-4 w-4 text-cyan-300" />
                    <span>Upgrade Plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-200 transition hover:bg-red-500/10 hover:text-red-100"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
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