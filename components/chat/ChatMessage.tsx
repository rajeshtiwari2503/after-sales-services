"use client";

interface MessageShape {
  id?: string | number;
  sender: string;
  message: string;
  isOwn?: boolean;
}

export default function ChatMessage({ message }: { message: MessageShape }) {
  const isOwn = message.isOwn ?? message.sender === "Admin";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isOwn ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"
        }`}
      >
        <p className={`text-xs font-semibold mb-1 ${isOwn ? "text-indigo-100" : "text-slate-500"}`}>
          {message.sender}
        </p>
        <p className="text-sm leading-relaxed">{message.message}</p>
      </div>
    </div>
  );
}
