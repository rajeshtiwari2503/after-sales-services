"use client";

import { useEffect, useState } from "react";

export default function DashboardKPIs() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(
        "/api/analytics/overview"
      );

      const result =
        await res.json();

      setData(result);
    } catch (error) {
      console.log(error);
    }
  };

  const cards = [
    {
      title: "Total Tickets",
      value:
        data.totalTickets || 0,
    },

    {
      title: "Resolved",
      value:
        data.resolvedTickets ||
        0,
    },

    {
      title: "Open Tickets",
      value:
        data.openTickets || 0,
    },

    {
      title: "SLA Breached",
      value:
        data.breached || 0,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-[30px] border border-sky-100 p-6 shadow-sm"
        >
          <p className="text-slate-500">
            {card.title}
          </p>

          <h2 className="text-4xl font-black mt-4">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}