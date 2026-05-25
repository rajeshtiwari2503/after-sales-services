"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import type { ChatTicketItem } from "./ChatSidebar";

interface ApiMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  content: string;
  createdAt: string;
}

interface Props {
  ticket: ChatTicketItem | null;
  currentUserId?: string;
}

export default function ChatWindow({ ticket, currentUserId }: Props) {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!ticket?._id) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/chat/${ticket._id}`, { credentials: "include" });
      const data = await res.json();
      const list = data.data?.messages ?? data.messages ?? [];
      setMessages(list);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [ticket?._id]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!ticket?._id || !text.trim()) return;
    const res = await fetch(`/api/chat/${ticket._id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      const msg = data.data ?? data;
      setMessages((prev) => [
        ...prev,
        {
          _id: msg._id ?? String(Date.now()),
          senderId: msg.senderId ?? currentUserId ?? "",
          senderName: msg.senderName ?? "You",
          content: msg.content ?? text,
          createdAt: msg.createdAt ?? new Date().toISOString(),
        },
      ]);
    }
    await fetchMessages();
  };

  if (!ticket) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 h-full flex items-center justify-center text-slate-400 text-sm">
        Select a ticket to view chat
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <p className="text-xs font-mono text-slate-400">{ticket.ticketNumber}</p>
        <h2 className="text-base font-bold text-slate-800">{ticket.title}</h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {loading && messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center animate-pulse">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message._id}
              message={{
                id: message._id,
                sender: message.senderName,
                message: message.content,
                isOwn: currentUserId ? message.senderId === currentUserId : false,
              }}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-slate-200">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
