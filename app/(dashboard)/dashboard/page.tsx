"use client";

import Link from "next/link";
import {
  Ticket, BarChart2, Clock, Users, TrendingUp, TrendingDown,
  ArrowRight, RefreshCw, AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useDashboard } from "@/hooks/useDashboard";
import { useEffect, useState } from "react";
export const dynamic = 'force-dynamic';
const statusStyle: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-100",
  "in-progress": "bg-amber-50 text-amber-700 border-amber-100",
  resolved: "bg-green-50 text-green-700 border-green-100",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
};

const statusLabel: Record<string, string> = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const priorityStyle: Record<string, string> = {
  urgent: "bg-red-50 text-red-600 border-red-100",
  high: "bg-orange-50 text-orange-600 border-orange-100",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
  low: "bg-slate-50 text-slate-500 border-slate-200",
};

const activityDot: Record<string, string> = {
  ticket: "bg-indigo-400",
  customer: "bg-emerald-400",
  technician: "bg-amber-400",
  system: "bg-red-400",
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-3 bg-slate-200 rounded w-24" />
        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-20" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3 animate-pulse">
      <div className="w-12 h-3 bg-slate-200 rounded" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
      </div>
      <div className="w-14 h-5 bg-slate-200 rounded-full" />
      <div className="w-16 h-5 bg-slate-200 rounded-full" />
    </div>
  );
}

export default function DashboardPage() {
  const { stats, tickets, activity, loading, error } = useDashboard();
  const { user, greeting } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  console.log(stats, tickets, activity);

  // const statCards = [
  //   {
  //     label: "Open Tickets",
  //     value: (stats as any)?.openTickets ?? "—",
  //     change: "+3 today",
  //     up: true,
  //     icon: Ticket,
  //     color: "bg-blue-50 text-blue-600",
  //   },
  //   {
  //     label: "Resolved",
  //     value: (stats as any)?.resolvedTickets ?? "—",
  //     change: "+18 this week",
  //     up: true,
  //     icon: BarChart2,
  //     color: "bg-green-50 text-green-600",
  //   },
  //   {
  //     label: "Avg. Response",
  //     value: stats?.avgResponseTime ?? "—",
  //     change: "-0.3h better",
  //     up: true,
  //     icon: Clock,
  //     color: "bg-violet-50 text-violet-600",
  //   },
  //   {
  //     label: "Satisfaction",
  //     value: stats?.satisfaction ? `${stats.satisfaction}%` : "—",
  //     change: "+2% this month",
  //     up: true,
  //     icon: Users,
  //     color: "bg-amber-50 text-amber-600",
  //   },
  // ];
  const statCards = [
    {
      label: "Open Tickets",
      value: (stats as any)?.openTickets ?? "—",
      change: "+3 today",
      up: true,
      icon: Ticket,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "In Progress",
      value: (stats as any)?.inProgressTickets ?? "—",
      change: "Active tickets",
      up: true,
      icon: RefreshCw,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Pending",
      value: (stats as any)?.pendingTickets ?? "—",
      change: "Awaiting action",
      up: false,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Resolved",
      value: (stats as any)?.resolvedTickets ?? "—",
      change: "+18 this week",
      up: true,
      icon: BarChart2,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Tickets",
      value: (stats as any)?.totalTickets ?? "—",
      change: "All requests",
      up: true,
      icon: Ticket,
      color: "bg-sky-50 text-sky-600",
    },
    {
      label: "Avg Resolution",
      value: `${(stats as any)?.avgResolutionHours ?? 0}h`,
      change: "Resolution time",
      up: true,
      icon: Clock,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Resolution Rate",
      value: `${(stats as any)?.resolutionRate ?? 0}%`,
      change: "Success rate",
      up: true,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "SLA Compliance",
      value: `${(stats as any)?.slaComplianceRate ?? 0}%`,
      change: "Within SLA",
      up: true,
      icon: ShieldCheck,
      color: "bg-cyan-50 text-cyan-600",
    },
  ];
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-slate-700 font-semibold">Failed to load dashboard</p>
          <p className="text-slate-400 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Heading */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here&apos;s what&apos;s happening with your service operations today.
          </p>
        </div>
        <Link
          href="/dashboard/tickets/create"
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          <Ticket className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(({ label, value, change, up, icon: Icon, color }) => (
            // <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 lg:p-5 hover:shadow-sm transition-shadow">
            //   <div className="flex items-start justify-between mb-3">
            //     <p className="text-xs font-medium text-slate-500 uppercase tracking-wide leading-none">{label}</p>
            //     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
            //       <Icon className="w-4 h-4" />
            //     </div>
            //   </div>
            //   <p className="text-2xl lg:text-3xl font-bold text-slate-800 tabular-nums">{value}</p>
            //   <p className={`text-xs mt-1.5 flex items-center gap-1 ${up ? "text-emerald-600" : "text-red-500"}`}>
            //     {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            //     {change}
            //   </p>
            // </div>
            <div
              key={label}
              className="
    relative overflow-hidden
    bg-white/90 backdrop-blur
    rounded-2xl
    border border-slate-200/70
    px-4 py-3
    hover:border-indigo-200
    hover:shadow-lg hover:shadow-indigo-100/40
    transition-all duration-300
    group
  "
            >
              {/* top glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-transparent to-slate-50 pointer-events-none" />

              <div className="relative flex items-center justify-between gap-3">

                {/* left */}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
                    {label}
                  </p>

                  <div className="flex items-end gap-2 mt-1">
                    <h3 className="text-2xl lg:text-[28px] font-black text-slate-800 leading-none tracking-tight tabular-nums">
                      {value}
                    </h3>

                    <div
                      className={`mb-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold
          ${up
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                        }`}
                    >
                      {up ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}

                      <span className="leading-none">
                        {change}
                      </span>
                    </div>
                  </div>
                </div>

                {/* icon */}
                <div
                  className={`
        relative
        w-10 h-10 rounded-xl
        flex items-center justify-center
        shrink-0
        shadow-sm
        ring-1 ring-black/5
        group-hover:scale-105
        transition-transform duration-300
        ${color}
      `}
                >
                  <Icon className="w-4 h-4" />

                  <div className="absolute inset-0 rounded-xl bg-white/10" />
                </div>
              </div>

              {/* bottom subtle line */}
              <div className="mt-3 h-[2px] w-full rounded-full bg-gradient-to-r from-slate-100 via-slate-200 to-transparent overflow-hidden">
                <div className="h-full w-1/3 bg-indigo-400/40 rounded-full" />
              </div>
            </div>
          ))
        }
      </div>

      {/* Tickets + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Tickets table */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Recent Tickets</h2>
              {!loading && (
                <p className="text-xs text-slate-400 mt-0.5">{tickets.length} latest requests</p>
              )}
            </div>
            <Link
              href="/dashboard/tickets"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {loading
              ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              : tickets.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <Ticket className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No tickets yet</p>
                    <p className="text-slate-400 text-xs mt-1">Create your first service ticket</p>
                  </div>
                )
                : tickets?.map((ticket) => (
                  <Link
                    key={ticket._id}
                    href={`/dashboard/tickets/${ticket._id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
                  >
                    <span className="text-xs font-mono font-semibold text-slate-400 w-12 shrink-0">
                      {ticket.ticketId || ticket._id.slice(-5).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate font-medium group-hover:text-indigo-600 transition-colors">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ticket.customerName} · {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className={`hidden sm:inline-flex text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${priorityStyle[ticket.priority] ?? priorityStyle.low}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${statusStyle[ticket.status] ?? statusStyle.open}`}>
                      {statusLabel[ticket.status] ?? ticket.status}
                    </span>
                  </Link>
                ))
            }
          </div>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Live service feed</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-2.5 bg-slate-100 rounded w-16" />
                  </div>
                </div>
              ))
              :
              // activity.map((item, i) => (
              //     <div key={i} className="flex items-start gap-3">
              //       <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${activityDot[item.type] ?? "bg-slate-400"}`} />
              //       <div className="flex-1">
              //         <p className="text-xs text-slate-600 leading-relaxed">{item.text}</p>
              //         <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
              //       </div>
              //     </div>
              //   ))
              <div>
                {activity.map((item: any, i) => (
                  <div key={i} className="flex items-start gap-3">

                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.status === "resolved"
                        ? "bg-green-500"
                        : item.status === "pending_parts"
                          ? "bg-amber-500"
                          : item.status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-slate-400"
                        }`}
                    />

                    <div className="flex-1">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-semibold">
                          {item.customerId?.name ?? "Customer"}
                        </span>{" "}
                        updated ticket{" "}
                        <span className="font-medium">
                          {item.ticketNumber}
                        </span>{" "}
                        with status{" "}
                        <span className="capitalize font-medium">
                          {item.status.replaceAll("_", " ")}
                        </span>
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(item.updatedAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}