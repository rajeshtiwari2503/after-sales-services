"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Activity, ArrowRight, RefreshCw } from "lucide-react";

interface ActivityItem {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: string;
  customerId: { name: string } | null;
  technicianId: { name: string } | null;
}

interface Props {
  data: ActivityItem[];
  loading: boolean;
  onRefresh: () => void;
}

const STATUS_DOT: Record<string, string> = {
  open: "bg-blue-500",
  in_progress: "bg-amber-500",
  resolved: "bg-green-500",
  pending_parts: "bg-violet-500",
  pending_customer: "bg-violet-400",
  closed: "bg-slate-400",
  cancelled: "bg-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open", in_progress: "In Progress", resolved: "Resolved",
  pending_parts: "Pending Parts", pending_customer: "Pending Customer",
  closed: "Closed", cancelled: "Cancelled",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};

export default function RealtimeActivity({ data, loading, onRefresh }: Props) {
  const [now, setNow] = useState(Date.now());

  // Refresh timestamps every minute
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Recent activity</p>
            <p className="text-xs text-slate-400">Latest ticket updates</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Refresh activity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/dashboard/tickets"
            className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1"
          >
            All tickets <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="w-10 h-2.5 bg-slate-100 rounded" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <Activity className="w-8 h-8 opacity-30" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          data.map((item) => (
            <Link
              key={item._id}
              href={`/dashboard/tickets/${item._id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition group"
            >
              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[item.status] ?? "bg-slate-400"}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium truncate group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono text-[10px] text-slate-400">{item.ticketNumber}</span>
                  <span className="text-[10px] text-slate-400">·</span>
                  <span className="text-[10px] text-slate-500">{STATUS_LABEL[item.status] ?? item.status}</span>
                  {item.customerId?.name && (
                    <>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-400">{item.customerId.name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Priority + time */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${PRIORITY_BADGE[item.priority] ?? ""}`}>
                  {item.priority}
                </span>
                <span className="text-[10px] text-slate-400">{timeAgo(item.updatedAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}