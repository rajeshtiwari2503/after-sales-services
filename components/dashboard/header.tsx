 "use client";

// components/layout/DashboardHeader.tsx  — REPLACE existing
// Changes vs original:
//   1. Search calls /api/search?q=  — real tickets + users, keyboard shortcut ⌘K / Ctrl+K
//   2. Notifications calls /api/notifications — real data, mark-all-read
//   3. User data from useUser (already fetches /api/auth/me on mount)
//   4. Role-aware result links (brand tickets go to /brand/tickets/...)
//   5. Click outside closes search overlay

import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Search, ChevronRight, LogOut, Settings, User, X,
  Ticket, Users, Zap, AlertTriangle, CheckCircle, Info,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────── */
interface SearchResult {
  _id: string;
  type: "ticket" | "user";
  title: string;
  subtitle: string;
  href: string;
  status?: string;
  priority?: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
  link?: string | null;
}

/* ─── Breadcrumb map ─────────────────────────────────────────── */
const BREADCRUMBS: Record<string, string> = {
  dashboard: "Dashboard", analytics: "Analytics",
  tickets: "Tickets", customers: "Customers",
  technicians: "Technicians", assets: "Assets",
  vendors: "Vendors", reports: "Reports",
  settings: "Settings", users: "Users",
  brands: "Brands", "service-centers": "Service Centers",
  "audit-logs": "Audit Logs", roles: "Roles",
  brand: "Brand", warranty: "Warranty",
  products: "Products", models: "Models",
  inventory: "Inventory", wallet: "Wallet",
  sla: "SLA", jobs: "My Jobs",
  chat: "Chat", photos: "Photos",
  summary: "Summary", track: "Track",
  reviews: "Reviews", profile: "Profile",
  new: "New", create: "Create", edit: "Edit",
  "service-center": "Service Center",
};

/* ─── Helpers ────────────────────────────────────────────────── */
const STATUS_DOT: Record<string, string> = {
  open: "bg-blue-500", in_progress: "bg-amber-500",
  resolved: "bg-green-500", closed: "bg-slate-400",
};

const NOTIF_ICON = {
  info:    <Info    className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
  success: <CheckCircle  className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />,
  error:   <Zap     className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ─── Main Component ─────────────────────────────────────────── */
export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initials } = useUser();

  /* ── Dropdown state ── */
  const [dropOpen, setDropOpen]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* ── Search state ── */
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState<{ tickets: SearchResult[]; users: SearchResult[] }>({ tickets: [], users: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  /* ── Notification state ── */
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [notifLoading, setNotifLoading]   = useState(false);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current   && !dropRef.current.contains(e.target as Node))   setDropOpen(false);
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Keyboard shortcut ⌘K / Ctrl+K ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
        setResults({ tickets: [], users: [] });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* ── Focus input when search opens ── */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  /* ── Search API call (debounced 300ms) ── */
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults({ tickets: [], users: [] });
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      const data = await res.json();
      setResults({
        tickets: data.data?.tickets ?? [],
        users:   data.data?.users   ?? [],
      });
    } catch {
      setResults({ tickets: [], users: [] });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(val), 300);
  };

  /* ── Fetch notifications ── */
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=20", { credentials: "include" });
      const data = await res.json();
      setNotifications(data.data?.notifications ?? []);
      setUnreadCount(data.data?.unreadCount ?? 0);
    } catch {} finally { setNotifLoading(false); }
  }, []);

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif._id }),
        });
        setNotifications(p => p.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch {}
    }
    setNotifOpen(false);
    if (notif.link) router.push(notif.link);
  };

  const handleNotifOpen = () => {
    setNotifOpen(p => {
      if (!p) fetchNotifications();
      return !p;
    });
  };

  /* ── Mark all read ── */
  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  /* ── Logout ── */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("user");
    router.push("/login");
  };

  /* ── Profile link by role ── */
  const profileLink = () => {
    if (user?.role === "customer")        return "/customer/profile";
    if (user?.role === "technician")      return "/technician/profile";
    if (user?.role === "manager")         return "/brand/profile";
    if (user?.role === "service_center")  return "/service-center/profile";
    return "/dashboard/settings";
  };

  /* ── Breadcrumbs ── */
  const segments = pathname.split("/").filter(Boolean);

  /* ── Derived ── */
  const hasResults    = results.tickets.length > 0 || results.users.length > 0;
  const showDropdown  = searchOpen && query.length >= 2;

  /* ─────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Search overlay backdrop */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/20  z-40" onClick={() => { setSearchOpen(false); setQuery(""); }} />
      )}

      <header className="h-16   bg-gradient-to-r from-blue-200  via-blue-150 to-pink-200  border-b border-slate-200/80 px-5 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">

        {/* ── Left: Breadcrumb ── */}
        <div className="flex flex-col justify-center pl-10 lg:pl-0">
          <nav className="hidden sm:flex items-center gap-1 text-sm" aria-label="Breadcrumb">
            {segments.map((seg, i) => {
              const isLast = i === segments.length - 1;
              const isId   = seg.length === 24 || /^[0-9a-f]{24}$/i.test(seg);
              if (isId && !isLast) return null;
              return (
                <span key={`${seg}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                  <span className={`capitalize ${isLast ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
                    {isId ? "Detail" : (BREADCRUMBS[seg] ?? seg)}
                  </span>
                </span>
              );
            })}
          </nav>
          <h1 className="sm:hidden text-base font-bold text-slate-800 truncate">
            {BREADCRUMBS[segments[segments.length - 1]] ?? "Dashboard"}
          </h1>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-2">

          {/* ── Search bar (desktop) ── */}
          <div className="relative z-50" ref={searchRef}>
            <button
              onClick={() => { setSearchOpen(true); }}
              className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs hover:border-indigo-300 hover:text-slate-600 transition cursor-pointer group min-w-[180px]"
            >
              <Search className="w-3.5 h-3.5 group-hover:text-indigo-500 transition shrink-0" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="ml-2 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Search dropdown panel */}
            {searchOpen && (
              <div className="absolute right-0 top-0 w-[420px] bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-200/80 z-50 overflow-hidden">
                {/* Input row */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={e => handleQueryChange(e.target.value)}
                    placeholder="Search tickets, users..."
                    className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                  />
                  {searchLoading && (
                    <span className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin shrink-0" />
                  )}
                  {query && !searchLoading && (
                    <button onClick={() => { setQuery(""); setResults({ tickets: [], users: [] }); }}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Results */}
                {showDropdown && (
                  <div className="max-h-[360px] overflow-y-auto">
                    {!hasResults && !searchLoading && (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Search className="w-7 h-7 text-slate-300" />
                        <p className="text-sm text-slate-400">No results for "{query}"</p>
                      </div>
                    )}

                    {/* Tickets */}
                    {results.tickets.length > 0 && (
                      <div>
                        <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Ticket className="w-3 h-3" /> Tickets
                        </p>
                        {results.tickets.map(r => (
                          <Link
                            key={r._id}
                            href={r.href}
                            onClick={() => { setSearchOpen(false); setQuery(""); setResults({ tickets: [], users: [] }); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition group cursor-pointer"
                          >
                            <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[r.status ?? ""] ?? "bg-slate-300"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition">{r.title}</p>
                              <p className="text-[10px] text-slate-400">{r.subtitle}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Users */}
                    {results.users.length > 0 && (
                      <div>
                        <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3 h-3" /> Users
                        </p>
                        {results.users.map(r => (
                          <Link
                            key={r._id}
                            href={r.href}
                            onClick={() => { setSearchOpen(false); setQuery(""); setResults({ tickets: [], users: [] }); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {r.title?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition">{r.title}</p>
                              <p className="text-[10px] text-slate-400">{r.subtitle}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="h-2" />
                  </div>
                )}

                {/* Empty state — no query yet */}
                {!showDropdown && query.length === 0 && (
                  <div className="px-4 py-4 space-y-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quick tips</p>
                    <p className="text-xs text-slate-500">Search by ticket title, number, or customer name.</p>
                    <p className="text-xs text-slate-400">Press <kbd className="bg-slate-100 px-1 rounded font-mono text-[10px]">ESC</kbd> to close.</p>
                  </div>
                )}

                {query.length === 1 && (
                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-400">Type at least 2 characters to search...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search icon — mobile */}
          <button
            onClick={() => { setSearchOpen(p => !p); }}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* ── Notifications ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotifOpen}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">Notifications</p>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-semibold border border-red-100">
                        {unreadCount} new
                      </span>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="px-4 py-3 animate-pulse flex gap-2.5">
                        <div className="w-4 h-4 bg-slate-200 rounded-full mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-slate-200 rounded w-3/4" />
                          <div className="h-2.5 bg-slate-100 rounded w-full" />
                        </div>
                      </div>
                    ))
                  ) : notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No notifications</p>
                    </div>
                  ) : notifications.map(notif => (
                    <div
                      key={notif._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNotifClick(notif)}
                      onKeyDown={e => { if (e.key === "Enter") handleNotifClick(notif); }}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition ${!notif.isRead ? "bg-blue-50/30" : ""}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {NOTIF_ICON[notif.type] ?? NOTIF_ICON.info}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-800 leading-snug">{notif.title}</p>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-slate-100">
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 hover:underline cursor-pointer w-full text-center disabled:text-slate-400"
                      disabled={unreadCount === 0}
                    >
                      {unreadCount > 0 ? "Mark all as read" : "All caught up ✓"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 mx-0.5" />

          {/* ── User dropdown ── */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen(p => !p)}
              className="flex items-center gap-2 cursor-pointer group"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-indigo-300 transition">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-700 leading-none">{user?.name ?? "User"}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{user?.role ?? "member"}</p>
              </div>
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/60 py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.name ?? "User"}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email ?? ""}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1 inline-block capitalize
                    ${user?.role === "admin"      ? "bg-purple-50 text-purple-700" :
                      user?.role === "manager"    ? "bg-blue-50 text-blue-700"    :
                      user?.role === "technician" ? "bg-amber-50 text-amber-700"  :
                      user?.role === "service_center" ? "bg-teal-50 text-teal-700" :
                      "bg-slate-100 text-slate-600"}`}>
                    {user?.role === "service_center" ? "SC Operator" : (user?.role ?? "member")}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href={profileLink()}
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </div>

                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition w-full cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}