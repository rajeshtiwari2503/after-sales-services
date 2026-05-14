"use client";

import { History, Ticket, RefreshCw, StickyNote, Edit, Users, Paperclip } from "lucide-react";
import { TimelineEvent } from "@/types/ticket";

const ICON_MAP: Record<string, { icon: React.ReactNode; bg: string }> = {
  ticket_created: { icon: <Ticket className="w-3 h-3" />, bg: "bg-blue-50 border-blue-100 text-blue-600" },
  status_changed: { icon: <RefreshCw className="w-3 h-3" />, bg: "bg-amber-50 border-amber-100 text-amber-600" },
  note_added: { icon: <StickyNote className="w-3 h-3" />, bg: "bg-violet-50 border-violet-100 text-violet-600" },
  ticket_updated: { icon: <Edit className="w-3 h-3" />, bg: "bg-slate-50 border-slate-200 text-slate-500" },
  assigned: { icon: <Users className="w-3 h-3" />, bg: "bg-green-50 border-green-100 text-green-600" },
  attachment_added: { icon: <Paperclip className="w-3 h-3" />, bg: "bg-teal-50 border-teal-100 text-teal-600" },
};

const fmtDateTime = (d: Date | string) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

interface Props { timeline: TimelineEvent[] }

export default function TicketTimeline({ timeline }: Props) {
  const sorted = [...timeline].reverse();

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <History className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Timeline</p>
            <p className="text-xs text-slate-400">{timeline.length} events</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No events yet</p>
        ) : (
          <div>
            {sorted.map((event, i) => {
              const cfg = ICON_MAP[event.action] ?? ICON_MAP.ticket_updated;
              const isLast = i === sorted.length - 1;
              return (
                <div key={event._id ?? i} className="flex gap-3 pb-5 relative">
                  {!isLast && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-100" />
                  )}
                  <div className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-slate-700">{event.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {event.performedByName} · {fmtDateTime(event.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}