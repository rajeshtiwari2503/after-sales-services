"use client";

import { useState } from "react";

const statuses = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "ON_HOLD",
  "RESOLVED",
  "CLOSED",
];

export default function TicketStatusWorkflow({
  ticketId,
  currentStatus,
}: any) {
  const [status, setStatus] =
    useState(
      currentStatus
    );

  const [loading, setLoading] =
    useState(false);

  const updateStatus =
    async (
      value: string
    ) => {
      try {
        setLoading(true);

        setStatus(value);

        await fetch(
          `/api/tickets/${ticketId}/status`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status: value,
            }),
          }
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black">
          Status Workflow
        </h2>

        <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold">
          {status}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {statuses.map(
          (item) => (
            <button
              key={item}
              disabled={
                loading
              }
              onClick={() =>
                updateStatus(
                  item
                )
              }
              className={`h-14 rounded-2xl border font-semibold transition ${
                status === item
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-200 hover:border-blue-500"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>
    </div>
  );
}