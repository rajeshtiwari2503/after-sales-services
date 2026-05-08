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
    technician: "Rahul",
    resolved: 34,
  },

  {
    technician: "Amit",
    resolved: 28,
  },

  {
    technician: "Vikas",
    resolved: 42,
  },
];

export default function TechnicianPerformance() {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 p-6 h-[420px]">
      <h2 className="text-2xl font-black mb-6">
        Technician Performance
      </h2>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart data={data}>
          <XAxis dataKey="technician" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="resolved"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}