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

// "use client";

// export default function TechnicianPerformance() {
//   const technicians = [
//     {
//       name:
//         "Rahul Sharma",

//       resolved: 120,
//     },
//     {
//       name:
//         "Amit Singh",

//       resolved: 98,
//     },
//     {
//       name:
//         "Vikash Kumar",

//       resolved: 87,
//     },
//   ];

//   return (
//     <div className="bg-white rounded-[30px] border border-slate-200 p-6">
//       <h2 className="text-2xl font-black mb-8">
//         Technician Performance
//       </h2>

//       <div className="space-y-5">
//         {technicians.map(
//           (tech) => (
//             <div
//               key={tech.name}
//               className="flex items-center justify-between border border-slate-200 rounded-2xl p-5"
//             >
//               <div>
//                 <h3 className="font-bold">
//                   {tech.name}
//                 </h3>

//                 <p className="text-slate-500 mt-1">
//                   Resolved Tickets
//                 </p>
//               </div>

//               <div className="text-3xl font-black">
//                 {
//                   tech.resolved
//                 }
//               </div>
//             </div>
//           )
//         )}
//       </div>
//     </div>
//   );
// }