"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Phone, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isMe?: boolean;
}

export default function TechnicianChatPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  useEffect(() => {
    if (!jobId) return;
    // Fetch ticket details
    fetch(`/api/tickets/${jobId}`, { credentials: "include" })
      .then(r => r.json()).then(d => setTicket(d.data ?? d)).catch(() => {});

    // Fetch messages
    fetch(`/api/chat/${jobId}`, { credentials: "include" })
      .then(r => r.json()).then(d => {
        const msgs = d.data?.messages ?? [];
        setMessages(msgs.map((m: any) => ({ ...m, isMe: m.senderId === user._id })));
      }).catch(() => {});

    // Auto refresh messages every 10s
    const interval = setInterval(() => {
      fetch(`/api/chat/${jobId}`, { credentials: "include" })
        .then(r => r.json()).then(d => {
          const msgs = d.data?.messages ?? [];
          setMessages(msgs.map((m: any) => ({ ...m, isMe: m.senderId === user._id })));
        }).catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const content = input;
    setInput("");
    setSending(true);

    // Optimistic
    const optimistic: Message = {
      _id: Date.now().toString(),
      senderId: user._id, senderName: user.name ?? "You",
      content, createdAt: new Date().toISOString(), isMe: true,
    };
    setMessages(p => [...p, optimistic]);

    try {
      await fetch(`/api/chat/${jobId}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, ticketId: jobId }),
      });
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div className="bg-white rounded-t-xl border border-b-0 border-slate-200/80 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/technician/jobs"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {ticket?.customerId?.name ?? "Customer"}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {ticket?.ticketNumber} — {ticket?.title}
          </p>
        </div>
        {ticket?.customerId?.phone && (
          <a href={`tel:${ticket.customerId.phone}`}
            className="w-9 h-9 flex items-center justify-center bg-green-50 border border-green-100 rounded-lg text-green-600 hover:bg-green-100 transition cursor-pointer">
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white border-x border-slate-200/80 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <MessageSquare className="w-10 h-10 opacity-20" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation with the customer</p>
          </div>
        ) : messages.map(msg => (
          <div key={msg._id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.isMe ? "" : "flex gap-2 items-end"}`}>
              {!msg.isMe && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                  {msg.senderName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
              )}
              <div>
                {!msg.isMe && (
                  <p className="text-[10px] text-slate-500 mb-0.5 ml-1">{msg.senderName}</p>
                )}
                <div className={`px-3.5 py-2.5 rounded-2xl ${
                  msg.isMe
                    ? "bg-amber-500 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.isMe ? "text-amber-200" : "text-slate-400"}`}>
                    {fmtTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white rounded-b-xl border border-t-0 border-slate-200/80 px-4 py-3 flex items-center gap-2 shrink-0">
        <input
          type="text" placeholder="Type a message..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          className="flex-1 h-10 border border-slate-200 rounded-xl px-3.5 text-sm focus:outline-none focus:border-amber-400 bg-slate-50"
        />
        <button onClick={sendMessage} disabled={sending || !input.trim()}
          className="w-10 h-10 flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl cursor-pointer transition">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}