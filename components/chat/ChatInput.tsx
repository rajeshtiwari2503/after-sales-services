"use client";

import { useState } from "react";

import { Send } from "lucide-react";

export default function ChatInput() {
  const [message, setMessage] =
    useState("");

  const sendMessage = () => {
    if (!message.trim()) return;

    console.log("Send:", message);

    setMessage("");
  };

  return (
    <div className="border-t border-slate-200 p-5">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          className="flex-1 h-14 rounded-2xl border border-slate-200 px-5 outline-none focus:border-blue-500"
        />

        <button
          onClick={
            sendMessage
          }
          className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}