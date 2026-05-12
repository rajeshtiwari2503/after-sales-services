"use client";

import NotificationBell from "@/components/notifications/NotificationBell";

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-black">
          SaaS Techify CRM
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell userId="123456" />

        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </header>
  );
}