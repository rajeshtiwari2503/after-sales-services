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
  { month: "Jan", tickets: 30 },
  { month: "Feb", tickets: 45 },
  { month: "Mar", tickets: 60 },
  { month: "Apr", tickets: 90 },
];

export default function TicketsChart() {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <h2 className="text-2xl font-bold mb-6">
        Ticket Analytics
      </h2>

      <div className="h-[350px]">
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
    </div>
  );
}