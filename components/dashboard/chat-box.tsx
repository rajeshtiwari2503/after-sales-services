"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function ChatBox() {
  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<string[]>([]);

  useEffect(() => {
    socket.on(
      "receive-message",
      (data: string) => {
        setMessages((prev) => [
          ...prev,
          data,
        ]);
      }
    );
  }, []);

  const sendMessage = () => {
    socket.emit("send-message", message);

    setMessage("");
  };

  return (
    <div className="bg-white rounded-2xl border p-6">
      <div className="space-y-3 mb-6 h-[300px] overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="bg-slate-100 p-3 rounded-xl"
          >
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          className="flex-1 border rounded-xl px-4"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}