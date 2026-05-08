"use client";

export default function ChatSidebar() {
  const chats = [
    {
      id: 1,
      name:
        "Customer Support",
    },
    {
      id: 2,
      name:
        "Technician Team",
    },
  ];

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 h-full p-5">
      <h2 className="text-2xl font-black mb-6">
        Chats
      </h2>

      <div className="space-y-4">
        {chats.map(
          (chat) => (
            <div
              key={chat.id}
              className="p-4 rounded-2xl bg-slate-100 cursor-pointer hover:bg-blue-50"
            >
              <h3 className="font-bold">
                {chat.name}
              </h3>
            </div>
          )
        )}
      </div>
    </div>
  );
}