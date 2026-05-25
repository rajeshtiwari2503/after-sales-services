"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, X, ExternalLink } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const TYPE_COLOR: Record<string, string> = {
  info:    "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
  error:   "bg-red-500",
};

interface NotificationBellProps {
  viewAllHref?: string;
}

export default function NotificationBell({ viewAllHref = "/dashboard/notifications" }: NotificationBellProps) {
  const [open,         setOpen]         = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [loading,      setLoading]      = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/notifications?limit=10", { credentials: "include" });
      const data = await res.json();
      setNotifications(data.data?.notifications ?? []);
      setUnreadCount(data.data?.unreadCount ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const markRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const deleteNotif = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE", credentials: "include" });
      const removed = notifications.find(n => n._id === id);
      setNotifications(n => n.filter(x => x._id !== id));
      if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const fmtDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60_000)    return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 cursor-pointer transition"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">{unreadCount} unread</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} title="Mark all as read"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer transition">
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3 p-4 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No notifications yet
              </div>
            ) : notifications.map(notif => (
              <div key={notif._id}
                className={`flex gap-3 p-4 hover:bg-slate-50 transition group ${!notif.isRead ? "bg-indigo-50/50" : ""}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.isRead ? TYPE_COLOR[notif.type] ?? "bg-blue-500" : "bg-slate-200"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-snug ${!notif.isRead ? "text-slate-800" : "text-slate-600"}`}>{notif.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{fmtDate(notif.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                  {notif.link && (
                    <Link href={notif.link} onClick={() => { markRead(notif._id); setOpen(false); }}
                      className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 cursor-pointer transition">
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {!notif.isRead && (
                    <button onClick={() => markRead(notif._id)}
                      className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 cursor-pointer transition">
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(notif._id)}
                    className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 cursor-pointer transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 text-center">
            <Link href={viewAllHref} onClick={() => setOpen(false)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
