"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Search, RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface WarrantyItem {
  _id: string;
  name?: string;
  productName?: string;
  modelNumber?: string;
  status?: string;
  warrantyEndDate?: string;
  customerId?: { name: string; email: string } | string;
}

export default function WarrantyPage() {
  const [items, setItems]     = useState<WarrantyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");

  const fetchWarranty = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res  = await fetch(`/api/warranty?${params}`, { credentials: "include" });
      const data = await res.json();
      setItems(data.data?.items ?? []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { fetchWarranty(); }, [fetchWarranty]);

  const active   = items.filter(i => i.status === "active").length;
  const expiring = items.filter(i => {
    if (!i.warrantyEndDate) return false;
    const days = (new Date(i.warrantyEndDate).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 30;
  }).length;
  const expired  = items.filter(i => i.status === "expired").length;

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const customerName = (c: WarrantyItem["customerId"]) =>
    typeof c === "object" && c?.name ? c.name : "—";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> Warranty Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Registered warranties and coverage status</p>
        </div>
        <button onClick={fetchWarranty} className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: items.length, icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Active", value: active, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Expiring (30d)", value: expiring, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Expired", value: expired, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search product or model..."
            className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="h-9 px-3 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="voided">Voided</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Product", "Model", "Customer", "Expiry", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">No warranty records found</td>
                </tr>
              ) : items.map(item => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.productName ?? item.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-mono">{item.modelNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{customerName(item.customerId)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{fmtDate(item.warrantyEndDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border capitalize
                      ${item.status === "active" ? "bg-green-50 text-green-700 border-green-100" :
                        item.status === "expired" ? "bg-red-50 text-red-600 border-red-100" :
                        "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {item.status ?? "unknown"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
