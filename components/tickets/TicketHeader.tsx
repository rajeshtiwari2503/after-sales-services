"use client";

import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Printer, RefreshCw } from "lucide-react";
import { TicketStatus, TicketPriority } from "@/types/ticket";

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  open: { label: "Open", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-800 border-blue-100" },
  in_progress: { label: "In Progress", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800 border-amber-100" },
  pending_parts: { label: "Pending Parts", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-800 border-violet-100" },
  pending_customer: { label: "Pending Customer", dot: "bg-violet-400", badge: "bg-violet-50 text-violet-700 border-violet-100" },
  resolved: { label: "Resolved", dot: "bg-green-500", badge: "bg-green-50 text-green-800 border-green-100" },
  closed: { label: "Closed", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" },
  cancelled: { label: "Cancelled", dot: "bg-red-400", badge: "bg-red-50 text-red-700 border-red-100" },
};

const PRIORITY_CONFIG: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

interface Props {
  ticketId: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  deleting: boolean;
  onDelete: () => void;
  onRefresh: () => void;
}

export default function TicketHeader({ ticketId, ticketNumber, title, status, priority, deleting, onDelete, onRefresh }: Props) {
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard/tickets"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {ticketNumber}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusCfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${PRIORITY_CONFIG[priority] ?? ""}`}>
            {priority}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <Link
            href={`/dashboard/tickets/${ticketId}/edit`}
            className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </Link>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 h-8 px-3 border border-red-200 bg-red-50 rounded-lg text-xs text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-60"
          >
            {deleting
              ? <span className="w-3.5 h-3.5 border border-red-300 border-t-red-600 rounded-full animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
            Delete
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-slate-800 leading-snug pl-11">{title}</h1>
    </div>
  );
}