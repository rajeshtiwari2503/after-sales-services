"use client";

import {
  AlertTriangle,
  Clock3,
} from "lucide-react";

export default function TicketSLA({
  sla,
}: any) {
  const breached =
    sla?.status ===
    "BREACHED";

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black">
          SLA Tracking
        </h2>

        <div
          className={`px-4 py-2 rounded-full text-sm font-bold ${
            breached
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {sla?.status}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Clock3
            className="text-blue-600"
            size={22}
          />

          <div>
            <p className="text-sm text-slate-500">
              Deadline
            </p>

            <p className="font-bold mt-1">
              {new Date(
                sla?.deadline
              ).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AlertTriangle
            className={`${
              breached
                ? "text-red-600"
                : "text-green-600"
            }`}
            size={22}
          />

          <div>
            <p className="text-sm text-slate-500">
              Remaining Time
            </p>

            <p className="font-bold mt-1">
              {sla?.remainingTime ||
                "2h 20m"}
            </p>
          </div>
        </div>

        <div className="pt-4">
          <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden">
            <div
              style={{
                width: `${
                  sla?.progress ||
                  70
                }%`,
              }}
              className={`h-full ${
                breached
                  ? "bg-red-500"
                  : "bg-blue-600"
              }`}
            />
          </div>

          <p className="mt-3 text-sm text-slate-500">
            SLA Progress:{" "}
            {sla?.progress ||
              70}
            %
          </p>
        </div>
      </div>
    </div>
  );
}