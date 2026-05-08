"use client";

import { useState } from "react";

import useSocket from "@/hooks/useSocket";

export default function RealtimeActivity() {
  const [activities, setActivities] =
    useState<any[]>([]);

  useSocket(
    "status_changed",
    (data: any) => {
      setActivities(
        (prev) => [
          data,
          ...prev,
        ]
      );
    }
  );

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <h2 className="text-2xl font-black mb-8">
        Live Activities
      </h2>

      <div className="space-y-5">
        {activities.map(
          (
            item,
            index
          ) => (
            <div
              key={index}
              className="border-l-4 border-blue-600 pl-5 py-2"
            >
              <h3 className="font-bold">
                {item.message}
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}