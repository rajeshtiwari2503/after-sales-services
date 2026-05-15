"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, Users, Package, Wallet, Clock, AlertTriangle, TrendingUp, CheckCircle, Plus } from "lucide-react";

export default function ServiceCenterDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tickets/stats", { credentials: "include" }).then(r => r.json()),
      fetch("/api/technicians", { credentials: "include" }).then(r => r.json()),
      fetch("/api/inventory", { credentials: "include" }).then(r => r.json()),
    ]).then(([tickets, techs, inv]) => {
      setData({
        open: tickets.data?.open ?? 0,
        inProgress: tickets.data?.inProgress ?? 0,
        resolved: tickets.data?.resolved ?? 0,
        slaBreaches: tickets.data?.slaBreaches ?? 0,
        unassigned: tickets.data?.unassigned ?? 0,
        technicians: techs.data?.length ?? 0,
        lowStock: inv.data?.filter((i: any) => i.quantity < i.minStock)?.length ?? 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const alerts = [
    { label: "SLA breaches", value: data?.slaBreaches, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 border-red-100", href: "/service-center/sla" },
    { label: "Unassigned tickets", value: data?.unassigned, icon: Ticket, color: "text-amber-600", bg: "bg-amber-50 border-amber-100", href: "/service-center/tickets?status=open" },
    { label: "Low stock items", value: data?.lowStock, icon: Package, color: "text-orange-600", bg: "bg-orange-50 border-orange-100", href: "/service-center/inventory" },
  ].filter(a => (a.value ?? 0) > 0);

  const kpis = [
    { label: "Open tickets", value: data?.open, icon: Ticket, color: "bg-blue-50 text-blue-600", href: "/service-center/tickets" },
    { label: "In progress", value: data?.inProgress, icon: Clock, color: "bg-amber-50 text-amber-600", href: "/service-center/tickets?status=in_progress" },
    { label: "Resolved today", value: data?.resolved, icon: CheckCircle, color: "bg-green-50 text-green-600", href: "/service-center/tickets?status=resolved" },
    { label: "Technicians", value: data?.technicians, icon: Users, color: "bg-teal-50 text-teal-600", href: "/service-center/technicians" },
  ];

  const quickLinks = [
    { label: "New ticket", href: "/service-center/tickets/create", icon: Plus, color: "bg-indigo-600 text-white" },
    { label: "Technicians", href: "/service-center/technicians", icon: Users, color: "bg-teal-50 text-teal-600" },
    { label: "Inventory", href: "/service-center/inventory", icon: Package, color: "bg-amber-50 text-amber-600" },
    { label: "Wallet", href: "/service-center/wallet", icon: Wallet, color: "bg-green-50 text-green-600" },
    { label: "SLA Monitor", href: "/service-center/sla", icon: Clock, color: "bg-red-50 text-red-600" },
    { label: "Reports", href: "/service-center/reports", icon: TrendingUp, color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Service Center</h1>
        <p className="text-xs text-slate-400 mt-0.5">Operations & ticket management</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {alerts.map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link key={label} href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} hover:opacity-90 transition`}>
              <Icon className={`w-5 h-5 ${color} shrink-0`} />
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-600">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-teal-200 transition">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
            </div>
            {loading ? <div className="h-8 bg-slate-200 rounded w-16 animate-pulse" /> : <p className="text-3xl font-bold text-slate-800">{value ?? "—"}</p>}
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {quickLinks.map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-slate-200/80 hover:border-teal-200 transition text-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
            <span className="text-xs font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}