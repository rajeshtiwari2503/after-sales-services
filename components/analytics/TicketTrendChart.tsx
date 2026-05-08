"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    month: "Jan",
    tickets: 30,
  },

  {
    month: "Feb",
    tickets: 55,
  },

  {
    month: "Mar",
    tickets: 70,
  },

  {
    month: "Apr",
    tickets: 90,
  },

  {
    month: "May",
    tickets: 120,
  },
];

export default function TicketTrendChart() {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 p-6 h-[420px]">
      <h2 className="text-2xl font-black mb-6">
        Ticket Trends
      </h2>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart data={data}>
          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="tickets"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}