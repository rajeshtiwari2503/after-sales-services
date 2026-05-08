"use client";

export default function ChatMessage({
  message,
}: any) {
  const isAdmin =
    message.sender ===
    "Admin";

  return (
    <div
      className={`flex ${
        isAdmin
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-3xl px-5 py-4 ${
          isAdmin
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-900"
        }`}
      >
        <p className="text-sm font-bold mb-2">
          {message.sender}
        </p>

        <p className="leading-7">
          {message.message}
        </p>
      </div>
    </div>
  );
}