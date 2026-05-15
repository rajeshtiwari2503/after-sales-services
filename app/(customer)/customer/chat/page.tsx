"use client";
import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Ticket } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  isMe?: boolean;
}

interface ChatTicket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  technicianId?: { name: string };
}

export default function CustomerChatPage() {
  const [tickets, setTickets] = useState<ChatTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ChatTicket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  useEffect(() => {
    fetch("/api/tickets?status=open,in_progress&limit=10", { credentials: "include" })
      .then(r => r.json()).then(d => setTickets(d.data?.tickets ?? []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTicket) return;
    fetch(`/api/chat/${selectedTicket._id}`, { credentials: "include" })
      .then(r => r.json()).then(d => {
        const msgs = d.data?.messages ?? [];
        setMessages(msgs.map((m: any) => ({ ...m, isMe: m.senderId === user._id })));
      }).catch(() => {});
  }, [selectedTicket]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedTicket) return;
    setSending(true);
    const optimistic: Message = {
      _id: Date.now().toString(), content: input, senderId: user._id,
      senderName: user.name ?? "You", createdAt: new Date().toISOString(), isMe: true,
    };
    setMessages(p => [...p, optimistic]);
    setInput("");
    try {
      await fetch(`/api/chat/${selectedTicket._id}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="h-[calc(100vh-160px)] flex gap-4 min-h-0">
      {/* Ticket list */}
      <div className="w-full sm:w-64 bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Active tickets</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="px-4 py-3 animate-pulse space-y-1.5">
              <div className="h-3 bg-slate-200 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2" />
            </div>
          )) : tickets.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">No active tickets</div>
          ) : tickets.map(ticket => (
            <button key={ticket._id} onClick={() => setSelectedTicket(ticket)}
              className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition ${selectedTicket?._id === ticket._id ? "bg-indigo-50 border-r-2 border-indigo-600" : ""}`}>
              <p className="text-sm font-medium text-slate-800 truncate">{ticket.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{ticket.ticketNumber}</p>
              {ticket.technicianId && <p className="text-[10px] text-indigo-600 mt-0.5">Tech: {ticket.technicianId.name}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      {selectedTicket ? (
        <div className="flex-1 bg-white rounded-xl border border-slate-200/80 flex flex-col min-w-0">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">{selectedTicket.title}</p>
            <p className="text-xs text-slate-400">{selectedTicket.ticketNumber} · {selectedTicket.technicianId?.name ?? "Awaiting technician"}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg._id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${msg.isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}>
                  {!msg.isMe && <p className="text-[10px] font-semibold text-indigo-600 mb-1">{msg.senderName}</p>}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.isMe ? "text-indigo-200" : "text-slate-400"}`}>{fmtTime(msg.createdAt)}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <MessageSquare className="w-8 h-8 opacity-30" />
                <p className="text-sm">No messages yet. Say hello!</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2">
            <input type="text" placeholder="Type a message..." value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="flex-1 h-10 border border-slate-200 rounded-xl px-3.5 text-sm focus:outline-none focus:border-indigo-400 bg-slate-50" />
            <button onClick={sendMessage} disabled={sending || !input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl cursor-pointer transition">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 gap-3">
          <MessageSquare className="w-12 h-12 opacity-20" />
          <p className="text-sm">Select a ticket to start chatting</p>
        </div>
      )}
    </div>
  );
}