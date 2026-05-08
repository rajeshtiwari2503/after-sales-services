"use client";

import ChatSidebar from "@/components/chat/ChatSidebar";

import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 p-6">
      <div className="grid grid-cols-12 gap-6 h-full">
        <div className="col-span-3">
          <ChatSidebar />
        </div>

        <div className="col-span-9">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}