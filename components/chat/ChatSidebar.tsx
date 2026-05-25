"use client";

import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";

export interface ChatTicketItem {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  customerName?: string;
}

interface Props {
  selectedId: string | null;
  onSelect: (ticket: ChatTicketItem) => void;
}

export default function ChatSidebar({ selectedId, onSelect }: Props) {
  const [tickets, setTickets] = useState<ChatTicketItem[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/tickets?limit=30", { credentials: "include" });
      const data = await res.json();
      const list = (data.data?.tickets ?? data.data ?? []).filter(
        (t: any) => !["resolved", "closed", "cancelled"].includes(t.status)
      );
      setTickets(
        list.map((t: any) => ({
          _id: t._id,
          ticketNumber: t.ticketNumber,
          title: t.title,
          status: t.status,
          customerName: t.customerId?.name ?? t.customerName,
        }))
      );
      if (!selectedId && list.length > 0) {
        onSelect({
          _id: list[0]._id,
          ticketNumber: list[0].ticketNumber,
          title: list[0].title,
          status: list[0].status,
          customerName: list[0].customerId?.name,
        });
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" /> Ticket chats
        </h2>
        <button onClick={fetchTickets} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <p className="p-4 text-sm text-slate-400 animate-pulse">Loading tickets…</p>
        ) : tickets.length === 0 ? (
          <p className="p-4 text-sm text-slate-400 text-center">No active tickets</p>
        ) : (
          tickets.map((chat) => (
            <button
              key={chat._id}
              onClick={() => onSelect(chat)}
              className={`w-full text-left p-4 hover:bg-slate-50 transition cursor-pointer ${selectedId === chat._id ? "bg-indigo-50 border-l-2 border-indigo-500" : ""}`}
            >
              <p className="text-xs font-mono text-slate-400">{chat.ticketNumber}</p>
              <h3 className="text-sm font-semibold text-slate-800 truncate mt-0.5">{chat.title}</h3>
              {chat.customerName && (
                <p className="text-[10px] text-slate-400 mt-0.5">{chat.customerName}</p>
              )}
              <span className="text-[10px] capitalize text-slate-500 mt-1 inline-block">{chat.status.replace(/_/g, " ")}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
