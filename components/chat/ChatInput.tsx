"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface Props {
  onSend?: (message: string) => void | Promise<void>;
}

export default function ChatInput({ onSend }: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending]   = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await onSend?.(message.trim());
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder="Type message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="flex-1 h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"
      />
      <button
        onClick={sendMessage}
        disabled={sending || !message.trim()}
        className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
