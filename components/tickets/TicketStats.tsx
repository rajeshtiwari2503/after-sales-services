"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Ticket,
} from "lucide-react";

interface Props {
  total?: number;
  open?: number;
  inProgress?: number;
  resolved?: number;
}

export default function TicketStats({
  total = 0,
  open = 0,
  inProgress = 0,
  resolved = 0,
}: Props) {
  const stats = [
    {
      title: "Total Tickets",
      value: total,
      icon: Ticket,
      gradient:
        "from-blue-500 to-cyan-500",
    },

    {
      title: "Open Tickets",
      value: open,
      icon: AlertCircle,
      gradient:
        "from-orange-500 to-yellow-500",
    },

    {
      title: "In Progress",
      value: inProgress,
      icon: Clock3,
      gradient:
        "from-purple-500 to-pink-500",
    },

    {
      title: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      gradient:
        "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map(
        (item, index) => {
          const Icon =
            item.icon;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-[28px] bg-white border border-sky-100 p-6 shadow-sm"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 bg-gradient-to-r ${item.gradient}`}
              />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    {item.title}
                  </p>

                  <h2 className="text-4xl font-black mt-3 text-slate-900">
                    {item.value}
                  </h2>
                </div>

                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white bg-gradient-to-r ${item.gradient}`}
                >
                  <Icon size={30} />
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}