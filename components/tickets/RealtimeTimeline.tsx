"use client";

import useSocket from "@/hooks/useSocket";

import { useState } from "react";

export default function RealtimeTimeline() {
  const [activities, setActivities] =
    useState<any[]>([]);

  useSocket(
    "STATUS_UPDATED",
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
      <h2 className="text-2xl font-black mb-6">
        Live Timeline
      </h2>

      <div className="space-y-5">
        {activities.map(
          (
            item,
            index
          ) => (
            <div
              key={index}
              className="border-l-2 border-blue-500 pl-4"
            >
              <p className="font-semibold">
                {item.message}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}