"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, MapPin, Ticket, BarChart2, Shield, Plus, ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";

export default function BrandDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tickets/stats", { credentials: "include" }).then(r => r.json()),
      fetch("/api/service-centers", { credentials: "include" }).then(r => r.json()),
    ]).then(([ticketData, scData]) => {
      setStats({
        openTickets: ticketData.data?.open ?? 0,
        resolvedTickets: ticketData.data?.resolved ?? 0,
        serviceCenters: scData.data?.length ?? 0,
        slaRate: ticketData.data?.slaRate ?? 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: "Open tickets", value: stats?.openTickets, icon: Ticket, color: "bg-blue-50 text-blue-600", href: "/brand/tickets" },
    { label: "Resolved", value: stats?.resolvedTickets, icon: TrendingUp, color: "bg-green-50 text-green-600", href: "/brand/tickets?status=resolved" },
    { label: "Service centers", value: stats?.serviceCenters, icon: MapPin, color: "bg-teal-50 text-teal-600", href: "/brand/service-centers" },
    { label: "SLA compliance", value: stats?.slaRate ? `${stats.slaRate}%` : "—", icon: Shield, color: "bg-violet-50 text-violet-600", href: "/brand/analytics" },
  ];

  const quickLinks = [
    { label: "Products", href: "/brand/products", icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Models", href: "/brand/models", icon: Package, color: "bg-indigo-50 text-indigo-600" },
    { label: "Warranty", href: "/brand/warranty", icon: Shield, color: "bg-violet-50 text-violet-600" },
    { label: "Service Centers", href: "/brand/service-centers", icon: MapPin, color: "bg-teal-50 text-teal-600" },
    { label: "Analytics", href: "/brand/analytics", icon: BarChart2, color: "bg-amber-50 text-amber-600" },
    { label: "Tickets", href: "/brand/tickets", icon: Ticket, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Brand Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage products, warranty & service centers</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700">Brand Manager</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-200 transition group">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
            </div>
            {loading
              ? <div className="h-8 bg-slate-200 rounded w-16 animate-pulse" />
              : <p className="text-3xl font-bold text-slate-800">{value ?? "—"}</p>
            }
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 group-hover:text-blue-600 transition">
              View <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Manage</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200/80 hover:border-blue-200 transition group text-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} group-hover:scale-105 transition`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}