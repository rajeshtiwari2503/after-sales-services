"use client";
import { useState, useEffect } from "react";
import { Shield, Plus, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface WarrantyItem {
  _id: string;
  productName: string;
  modelNumber: string;
  customerId?: { name: string; email: string };
  purchaseDate: string;
  expiryDate: string;
  status: "active" | "expired" | "pending";
  tenantId: string;
}

const STATUS_CONFIG = {
  active: { label: "Active", badge: "bg-green-50 text-green-700 border-green-100", icon: <CheckCircle className="w-3 h-3" /> },
  expired: { label: "Expired", badge: "bg-red-50 text-red-700 border-red-100", icon: <XCircle className="w-3 h-3" /> },
  pending: { label: "Pending", badge: "bg-amber-50 text-amber-700 border-amber-100", icon: <Clock className="w-3 h-3" /> },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function WarrantyPage() {
  const [items, setItems] = useState<WarrantyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/warranty", { credentials: "include" })
      .then(r => r.json()).then(d => setItems(d.data?.items ?? d.data ?? []))
      .catch(() => toast.error("Failed to load warranty data"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i =>
    !filter || i.status === filter ||
    i.productName?.toLowerCase().includes(filter) ||
    i.modelNumber?.toLowerCase().includes(filter)
  );

  const stats = {
    active: items.filter(i => i.status === "active").length,
    expired: items.filter(i => i.status === "expired").length,
    pending: items.filter(i => i.status === "pending").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Warranty Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure and track warranty terms</p>
        </div>
        <button className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
          <Plus className="w-4 h-4" /> Add warranty
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: stats.active, color: "text-green-600", bg: "bg-green-50" },
          { label: "Expired", value: stats.expired, color: "text-red-600", bg: "bg-red-50" },
          { label: "Pending", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Shield className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500">{label} warranties</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search by product, model..." value={filter}
            onChange={e => setFilter(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
        </div>
        {["active","expired","pending"].map(s => (
          <button key={s} onClick={() => setFilter(filter === s ? "" : s)}
            className={`h-9 px-3 rounded-lg border text-xs font-medium capitalize cursor-pointer transition
              ${filter === s ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Product", "Model", "Customer", "Purchase date", "Expiry date", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>)}</tr>
            )) : filtered.map(item => {
              const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
              return (
                <tr key={item._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.productName}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.modelNumber}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{item.customerId?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(item.purchaseDate)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(item.expiryDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.badge}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}