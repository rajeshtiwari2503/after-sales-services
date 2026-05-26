"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/notifications?limit=50", { credentials: "include" });
      const data = await res.json();
      setNotifications(data.data?.notifications ?? []);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: n._id }),
      });
    }
    if (n.link) router.push(n.link);
  };

  const timeAgo = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" /> Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{notifications.filter(n => !n.isRead).length} unread</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchNotifications} className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={markAllRead} className="flex items-center gap-1.5 h-9 px-3 border border-slate-200 rounded-xl text-xs font-medium text-indigo-600 hover:bg-indigo-50 cursor-pointer">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No notifications yet</div>
        ) : notifications.map(n => (
          <button
            key={n._id}
            type="button"
            onClick={() => handleClick(n)}
            className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition cursor-pointer ${!n.isRead ? "bg-blue-50/40" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
