"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    month: "Jan",
    revenue: 10000,
  },

  {
    month: "Feb",
    revenue: 18000,
  },

  {
    month: "Mar",
    revenue: 25000,
  },

  {
    month: "Apr",
    revenue: 32000,
  },
];

export default function RevenueChart() {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 p-6 h-[420px]">
      <h2 className="text-2xl font-black mb-6">
        Revenue Analytics
      </h2>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart data={data}>
          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}