"use client";

import { useEffect, useState } from "react";

export default function AnalyticsOverview() {
  const [data, setData] =
    useState<any>({});

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview =
    async () => {
      const res = await fetch(
        "/api/analytics/overview"
      );

      const result =
        await res.json();

      setData(result);
    };

  const cards = [
    {
      title:
        "Total Tickets",
      value:
        data.totalTickets ||
        0,
    },
    {
      title:
        "Resolved",
      value:
        data.resolvedTickets ||
        0,
    },
    {
      title: "Users",
      value:
        data.users || 0,
    },
    {
      title:
        "SLA Success",
      value: "98%",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map(
        (card) => (
          <div
            key={card.title}
            className="bg-white rounded-[30px] border border-slate-200 p-6"
          >
            <p className="text-slate-500">
              {card.title}
            </p>

            <h2 className="text-5xl font-black mt-4">
              {card.value}
            </h2>
          </div>
        )
      )}
    </div>
  );
}