"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    month: "Jan",
    revenue: 12000,
  },

  {
    month: "Feb",
    revenue: 18000,
  },

  {
    month: "Mar",
    revenue: 24000,
  },

  {
    month: "Apr",
    revenue: 31000,
  },
];

export default function BIAnalytics() {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <h2 className="text-2xl font-bold mb-6">
        Revenue Analytics
      </h2>

      <div className="h-[400px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={data}>
            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}