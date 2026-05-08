"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  {
    name: "On Time",
    value: 82,
  },

  {
    name: "Breached",
    value: 18,
  },
];

export default function SLAChart() {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 p-6 h-[420px]">
      <h2 className="text-2xl font-black mb-6">
        SLA Performance
      </h2>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {data.map(
              (_, index) => (
                <Cell key={index} />
              )
            )}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}