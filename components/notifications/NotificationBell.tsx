"use client";

import { Bell } from "lucide-react";

export default function NotificationBell() {
  return (
    <button className="relative w-12 h-12 rounded-2xl border border-sky-100 bg-white flex items-center justify-center">
      <Bell size={20} />

      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500" />
    </button>
  );
}