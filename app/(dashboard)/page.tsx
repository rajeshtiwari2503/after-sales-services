import StatsCard from "@/components/dashboard/stats-card";
import TicketsChart from "@/components/dashboard/tickets-chart";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Dashboard Overview
        </h1>

        <p className="text-slate-500 mt-2">
          Welcome back to your CRM panel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="mt-10">
  <TicketsChart />
</div>
        <StatsCard
          title="Total Tickets"
          value="1,248"
        />

        <StatsCard
          title="Open Complaints"
          value="328"
        />

        <StatsCard
          title="Technicians"
          value="84"
        />

        <StatsCard
          title="Service Centers"
          value="16"
        />
      </div>
    </div>
  );
}

// import { BarChart2, Ticket, Users, Clock, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
// import Link from "next/link";

// const stats = [
//   { label: "Open Tickets", value: "24", change: "+3 today", up: true, icon: Ticket, color: "bg-blue-50 text-blue-600" },
//   { label: "Resolved", value: "142", change: "+18 this week", up: true, icon: BarChart2, color: "bg-green-50 text-green-600" },
//   { label: "Avg. Response", value: "2.4h", change: "-0.3h better", up: true, icon: Clock, color: "bg-violet-50 text-violet-600" },
//   { label: "Satisfaction", value: "94%", change: "+2% this month", up: true, icon: Users, color: "bg-amber-50 text-amber-600" },
// ];

// const recentTickets = [
//   { id: "#1042", title: "AC unit not cooling properly", customer: "Priya S.", status: "open", priority: "high", time: "2m ago" },
//   { id: "#1041", title: "Washing machine leaking water", customer: "Anil K.", status: "progress", priority: "medium", time: "45m ago" },
//   { id: "#1040", title: "TV remote not responding", customer: "Meena R.", status: "resolved", priority: "low", time: "2h ago" },
//   { id: "#1039", title: "Fridge compressor issue", customer: "Suresh P.", status: "open", priority: "high", time: "3h ago" },
//   { id: "#1038", title: "Microwave not heating", customer: "Kavya T.", status: "progress", priority: "medium", time: "5h ago" },
// ];

// const activity = [
//   { text: "Ticket #1042 assigned to Amit Kumar", time: "2m ago" },
//   { text: "Customer Priya S. submitted new ticket", time: "15m ago" },
//   { text: "Ticket #1040 marked as resolved", time: "1h ago" },
//   { text: "New technician Rohit M. onboarded", time: "3h ago" },
//   { text: "SLA breach warning for ticket #1035", time: "5h ago" },
// ];

// const statusStyle: Record<string, string> = {
//   open: "bg-blue-50 text-blue-700",
//   progress: "bg-amber-50 text-amber-700",
//   resolved: "bg-green-50 text-green-700",
// };

// const statusLabel: Record<string, string> = {
//   open: "Open",
//   progress: "In Progress",
//   resolved: "Resolved",
// };

// const priorityStyle: Record<string, string> = {
//   high: "bg-red-50 text-red-600",
//   medium: "bg-orange-50 text-orange-600",
//   low: "bg-slate-100 text-slate-500",
// };

// export default function DashboardPage() {
//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       {/* Page heading */}
//       <div>
//         <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
//           Good morning, Rahul 👋
//         </h1>
//         <p className="text-slate-500 text-sm mt-1">
//           Here&apos;s what&apos;s happening with your service operations today.
//         </p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
//         {stats.map(({ label, value, change, up, icon: Icon, color }) => (
//           <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 lg:p-5">
//             <div className="flex items-start justify-between mb-3">
//               <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
//               <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
//                 <Icon className="w-4 h-4" />
//               </div>
//             </div>
//             <p className="text-2xl lg:text-3xl font-bold text-slate-800">{value}</p>
//             <p className={`text-xs mt-1.5 flex items-center gap-1 ${up ? "text-green-600" : "text-red-500"}`}>
//               {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//               {change}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Tickets + Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
//         {/* Recent Tickets */}
//         <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 overflow-hidden">
//           <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
//             <h2 className="text-sm font-semibold text-slate-800">Recent Tickets</h2>
//             <Link href="/dashboard/tickets" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium">
//               View all <ArrowRight className="w-3 h-3" />
//             </Link>
//           </div>
//           <div className="divide-y divide-slate-100">
//             {recentTickets.map(({ id, title, customer, status, priority, time }) => (
//               <div key={id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition cursor-pointer">
//                 <span className="text-xs font-mono font-semibold text-slate-400 w-12 shrink-0">{id}</span>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm text-slate-700 truncate font-medium">{title}</p>
//                   <p className="text-xs text-slate-400 mt-0.5">{customer} · {time}</p>
//                 </div>
//                 <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${priorityStyle[priority]}`}>
//                   {priority}
//                 </span>
//                 <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${statusStyle[status]}`}>
//                   {statusLabel[status]}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Activity */}
//         <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 overflow-hidden">
//           <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
//             <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
//           </div>
//           <div className="px-5 py-3 space-y-4">
//             {activity.map(({ text, time }, i) => (
//               <div key={i} className="flex items-start gap-3">
//                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
//                 <div className="flex-1">
//                   <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
//                   <p className="text-[10px] text-slate-400 mt-0.5">{time}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }