"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isMe?: boolean;
}

export function useChat(ticketId: string, userId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchMessages = useCallback(async () => {
    if (!ticketId) return;
    try {
      const res = await fetch(`/api/chat/${ticketId}`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const msgs = data.data?.messages ?? [];
      setMessages(msgs.map((m: any) => ({ ...m, isMe: m.senderId === userId })));
    } catch {} finally {
      setLoading(false);
    }
  }, [ticketId, userId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !ticketId) return false;
    setSending(true);

    // Optimistic update
    const temp: Message = {
      _id: `temp-${Date.now()}`,
      senderId: userId ?? "", senderName: "You",
      content, createdAt: new Date().toISOString(), isMe: true,
    };
    setMessages(prev => [...prev, temp]);

    try {
      const res = await fetch(`/api/chat/${ticketId}`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, ticketId }),
      });
      if (!res.ok) throw new Error();
      await fetchMessages(); // refresh with server data
      return true;
    } catch {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== temp._id));
      return false;
    } finally {
      setSending(false);
    }
  }, [ticketId, userId, fetchMessages]);

  useEffect(() => {
    fetchMessages();
    // Poll every 8 seconds
    pollRef.current = setInterval(fetchMessages, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  return { messages, loading, sending, sendMessage, refetch: fetchMessages };
}