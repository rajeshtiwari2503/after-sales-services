"use client";

import {
  Clock3,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function TicketHeader({
  ticket,
}: any) {
  const getStatusColor =
    (
      status: string
    ) => {
      switch (status) {
        case "OPEN":
          return "bg-yellow-100 text-yellow-700";

        case "IN_PROGRESS":
          return "bg-blue-100 text-blue-700";

        case "RESOLVED":
          return "bg-green-100 text-green-700";

        case "CLOSED":
          return "bg-slate-200 text-slate-700";

        default:
          return "bg-red-100 text-red-700";
      }
    };

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl font-black text-slate-900">
              {ticket.title}
            </h1>

            <div
              className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                ticket.status
              )}`}
            >
              {ticket.status}
            </div>
          </div>

          <p className="mt-4 text-slate-500 text-lg leading-8 max-w-4xl">
            {ticket.description}
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 rounded-2xl bg-slate-100 text-sm font-semibold">
              Ticket ID: #
              {ticket.ticketNumber ||
                ticket._id?.slice(
                  -6
                )}
            </div>

            <div className="px-4 py-2 rounded-2xl bg-blue-100 text-blue-700 text-sm font-semibold">
              Priority:{" "}
              {ticket.priority}
            </div>

            <div className="px-4 py-2 rounded-2xl bg-purple-100 text-purple-700 text-sm font-semibold">
              Category:{" "}
              {ticket.category}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4 min-w-[260px]">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Clock3
                className="text-blue-600"
                size={22}
              />

              <div>
                <p className="text-sm text-slate-500">
                  Created
                </p>

                <p className="font-bold mt-1">
                  {new Date(
                    ticket.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle
                className="text-orange-500"
                size={22}
              />

              <div>
                <p className="text-sm text-slate-500">
                  SLA Status
                </p>

                <p className="font-bold mt-1">
                  {ticket.slaStatus ||
                    "ACTIVE"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2
                className="text-green-600"
                size={22}
              />

              <div>
                <p className="text-sm text-slate-500">
                  Assigned To
                </p>

                <p className="font-bold mt-1">
                  {ticket.assignedTechnician
                    ?.name ||
                    "Not Assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}