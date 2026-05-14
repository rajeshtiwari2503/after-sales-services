"use client";

import { RefreshCw } from "lucide-react";
import { TicketStatus } from "@/types/ticket";

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  open: { label: "Open", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-800 border-blue-100" },
  in_progress: { label: "In Progress", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800 border-amber-100" },
  pending_parts: { label: "Pending Parts", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-800 border-violet-100" },
  pending_customer: { label: "Pending Customer", dot: "bg-violet-400", badge: "bg-violet-50 text-violet-700 border-violet-100" },
  resolved: { label: "Resolved", dot: "bg-green-500", badge: "bg-green-50 text-green-800 border-green-100" },
  closed: { label: "Closed", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" },
  cancelled: { label: "Cancelled", dot: "bg-red-400", badge: "bg-red-50 text-red-700 border-red-100" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as TicketStatus[];

interface Props {
  currentStatus: TicketStatus;
  loading: boolean;
  onStatusChange: (status: TicketStatus) => void;
}

export default function TicketStatusWorkflow({ currentStatus, loading, onStatusChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <RefreshCw className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Status</p>
          <p className="text-xs text-slate-400">Click to change status</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2">
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const isActive = currentStatus === s;
          return (
            <button
              key={s}
              onClick={() => !loading && onStatusChange(s)}
              disabled={loading}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[11px] font-medium transition cursor-pointer
                ${isActive
                  ? `${cfg.badge}`
                  : "border-slate-200 text-slate-500 hover:bg-slate-50 bg-slate-50/50"
                }
                ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? cfg.dot : "bg-slate-300"} shrink-0`} />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}