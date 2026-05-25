"use client";

import { useState } from "react";
import ChatSidebar, { type ChatTicketItem } from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useUser } from "@/hooks/useUser";

export default function ChatPage() {
  const { user } = useUser();
  const [selected, setSelected] = useState<ChatTicketItem | null>(null);

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 p-6">
      <div className="grid grid-cols-12 gap-6 h-full">
        <div className="col-span-12 lg:col-span-3 h-full min-h-0">
          <ChatSidebar selectedId={selected?._id ?? null} onSelect={setSelected} />
        </div>
        <div className="col-span-12 lg:col-span-9 h-full min-h-0">
          <ChatWindow ticket={selected} currentUserId={user?.id ?? user?._id} />
        </div>
      </div>
    </div>
  );
}
