"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase, MessageSquare, Camera, CheckSquare,
  Bell, User, LogOut, LayoutDashboard, Check, CheckCheck, X,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/useUser";

const BOTTOM_NAV = [
  { label: "Dashboard", href: "/technician/dashboard", icon: LayoutDashboard },
  { label: "Jobs",      href: "/technician/jobs",      icon: Briefcase },
  { label: "Chat",      href: "/technician/chat",      icon: MessageSquare },
  { label: "Photos",    href: "/technician/photos",    icon: Camera },
  { label: "Summary",   href: "/technician/summary",   icon: CheckSquare },
];

interface Notif {
  _id: string; title: string; message: string;
  type: string; isRead: boolean; link?: string; createdAt: string;
}

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, initials } = useUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs,   setNotifs]   = useState<Notif[]>([]);
  const [unread,   setUnread]   = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const res  = await fetch("/api/notifications?limit=10", { credentials: "include" });
      const data = await res.json();
      setNotifs(data.data?.notifications ?? []);
      setUnread(data.data?.unreadCount ?? 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    }).catch(() => null);
    setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
    setUnread(c => Math.max(0, c - 1));
  };

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    }).catch(() => null);
    setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    setUnread(0);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/technician/dashboard" && pathname.startsWith(href));

  const fmtTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="pe-4 ps-2 h-16 flex items-center justify-between">
          <Link href="/technician/dashboard" className="flex items-center gap-2">
            <div className="w-24 h-10 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Technician</span>
          </Link>

          <div className="flex items-center gap-1.5">
            {/* ── Bell ── */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => { setBellOpen(p => !p); }}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                    <div className="flex gap-1">
                      {unread > 0 && (
                        <button onClick={markAll} className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 cursor-pointer transition">
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => setBellOpen(false)} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifs.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">
                        <Bell className="w-7 h-7 mx-auto mb-2 opacity-30" />No notifications
                      </div>
                    ) : notifs.map(n => (
                      <div key={n._id}
                        className={`flex gap-3 px-4 py-3 group hover:bg-slate-50 cursor-pointer transition ${!n.isRead ? "bg-amber-50/50" : ""}`}
                        onClick={() => {
                          if (!n.isRead) markRead(n._id);
                          if (n.link) { router.push(n.link); setBellOpen(false); }
                        }}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? "bg-amber-500" : "bg-slate-200"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-snug ${!n.isRead ? "text-slate-800" : "text-slate-600"}`}>{n.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-slate-300 mt-1">{fmtTime(n.createdAt)}</p>
                        </div>
                        {!n.isRead && (
                          <button onClick={e => { e.stopPropagation(); markRead(n._id); }}
                            className="w-6 h-6 rounded-lg bg-green-50 text-green-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shrink-0">
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Profile ── */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(p => !p)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-transparent hover:ring-amber-300 transition">
                {initials}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-800">{user?.name ?? "Technician"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
                  </div>
                  <Link href="/technician/profile" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                    <User className="w-3.5 h-3.5" /> Profile settings
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition cursor-pointer w-full">
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 pb-20">{children}</main>

      <nav className="bg-white border-t border-slate-200/80 fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto">
        <div className="flex">
          {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active ? "text-amber-600" : "text-slate-400 hover:text-slate-600"}`}>
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}