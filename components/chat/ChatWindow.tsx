"use client";

import ChatInput from "./ChatInput";

import ChatMessage from "./ChatMessage";

export default function ChatWindow() {
  const messages = [
    {
      id: 1,
      sender: "Admin",
      message:
        "Ticket assigned",
    },

    {
      id: 2,
      sender: "Technician",
      message:
        "Working on issue",
    },
  ];

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 h-full flex flex-col">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-2xl font-black">
          Live Support Chat
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        {messages.map(
          (message) => (
            <ChatMessage
              key={
                message.id
              }
              message={
                message
              }
            />
          )
        )}
      </div>

      <ChatInput />
    </div>
  );
}