"use client";

import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { SLAInfo } from "@/types/ticket";

interface Props { sla?: SLAInfo }

const fmtDateTime = (d?: Date | string) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const timeRemaining = (deadline?: Date | string) => {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Overdue";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h remaining` : `${h}h ${m}m remaining`;
};

const pct = (deadline?: Date | string) => {
  if (!deadline) return 0;
  const now = Date.now();
  const end = new Date(deadline).getTime();
  const total = 24 * 60 * 60 * 1000;
  return Math.min(100, Math.max(0, Math.round(((total - (end - now)) / total) * 100)));
};

export default function TicketSLA({ sla }: Props) {
  if (!sla) return null;

  const resPct = pct(sla.resolutionDeadline);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <p className="text-sm font-semibold text-slate-800">SLA</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Response */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Response</span>
          <span className={`text-xs font-medium flex items-center gap-1 ${sla.isResponseBreached ? "text-red-600" : "text-green-600"}`}>
            {sla.isResponseBreached
              ? <><AlertCircle className="w-3 h-3" />Breached</>
              : <><CheckCircle className="w-3 h-3" />Met</>
            }
          </span>
        </div>

        {/* Resolution deadline */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Resolution deadline</span>
          <span className="text-xs font-medium text-slate-700">{fmtDateTime(sla.resolutionDeadline)}</span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Time elapsed</span>
            <span>{resPct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                resPct < 60 ? "bg-blue-500" : resPct < 85 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${resPct}%` }}
            />
          </div>
          <p className={`text-[10px] mt-1.5 ${sla.isResolutionBreached ? "text-red-500" : "text-slate-400"}`}>
            {sla.isResolutionBreached
              ? "⚠ Resolution SLA breached"
              : timeRemaining(sla.resolutionDeadline)
            }
          </p>
        </div>
      </div>
    </div>
  );
}