"use client";

import { useState, useEffect } from "react";
import { CreditCard, Receipt, TrendingUp, Calendar, Download, ChevronDown, ChevronUp, Loader2, RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerId?: { name: string; email: string } | string;
  ticketId?: { ticketNumber: string } | string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string; icon: any }> = {
  paid:      { label: "Paid",      cls: "bg-green-50 text-green-700 border-green-100", icon: CheckCircle },
  pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock },
  overdue:   { label: "Overdue",   cls: "bg-red-50 text-red-600 border-red-100",       icon: AlertCircle },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500 border-slate-200", icon: AlertCircle },
};

export default function BillingDashboard() {
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [stats,    setStats]      = useState({ total: 0, paid: 0, pending: 0, overdue: 0, totalRevenue: 0, pendingAmount: 0 });
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [status,   setStatus]     = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (status) params.set("status", status);
      const res  = await fetch(`/api/billing/invoices?${params}`, { credentials: "include" });
      const data = await res.json();
      const list: Invoice[] = data.data?.invoices ?? [];
      setInvoices(list);
      setStats({
        total:         list.length,
        paid:          list.filter(i => i.status === "paid").length,
        pending:       list.filter(i => i.status === "pending").length,
        overdue:       list.filter(i => i.status === "overdue").length,
        totalRevenue:  list.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0),
        pendingAmount: list.filter(i => ["pending", "overdue"].includes(i.status)).reduce((s, i) => s + i.total, 0),
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [status]);

  const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Billing Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage invoices and payment tracking</p>
        </div>
        <button onClick={fetchData} className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue",    value: fmtINR(stats.totalRevenue),  icon: TrendingUp, color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Pending Amount",   value: fmtINR(stats.pendingAmount), icon: Clock,      color: "text-amber-600", bg: "bg-amber-50"  },
          { label: "Paid Invoices",    value: `${stats.paid}`,             icon: CheckCircle,color: "text-green-600", bg: "bg-green-50"  },
          { label: "Pending Invoices", value: `${stats.pending}`,          icon: Clock,      color: "text-amber-600", bg: "bg-amber-50"  },
          { label: "Overdue",          value: `${stats.overdue}`,          icon: AlertCircle,color: "text-red-600",   bg: "bg-red-50"    },
          { label: "Total Invoices",   value: `${stats.total}`,            icon: Receipt,    color: "text-indigo-600",bg: "bg-indigo-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-lg font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "paid", "pending", "overdue", "cancelled"].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`h-8 px-4 rounded-xl text-xs font-medium border cursor-pointer transition capitalize ${status === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
            {s === "" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Invoices table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                {["Invoice #", "Customer", "Ticket", "Total", "Status", "Due Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              )) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-20" />No invoices found
                </td></tr>
              ) : invoices.map(inv => {
                const st   = STATUS_MAP[inv.status] ?? STATUS_MAP.pending;
                const Icon = st.icon;
                const customer = typeof inv.customerId === "object" ? inv.customerId?.name : "—";
                const ticket   = typeof inv.ticketId   === "object" ? inv.ticketId?.ticketNumber : "—";
                return (
                  <>
                    <tr key={inv._id} className="hover:bg-slate-50 cursor-pointer transition" onClick={() => setExpanded(expanded === inv._id ? null : inv._id)}>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-medium">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{customer}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{ticket}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{fmtINR(inv.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border flex items-center gap-1 w-fit ${st.cls}`}>
                          <Icon className="w-3 h-3" />{st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(inv.dueDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={e => { e.stopPropagation(); setExpanded(expanded === inv._id ? null : inv._id); }}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                            {expanded === inv._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded === inv._id && (
                      <tr key={`${inv._id}-exp`} className="bg-indigo-50/30">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-600 mb-2">Line Items</p>
                            {inv.items?.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs text-slate-700 py-1 border-b border-slate-100">
                                <span>{item.description}</span>
                                <span>{item.quantity} × {fmtINR(item.unitPrice)} = <strong>{fmtINR(item.total)}</strong></span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs font-medium text-slate-600 pt-1">
                              <span>Subtotal</span><span>{fmtINR(inv.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Tax (18% GST)</span><span>{fmtINR(inv.tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-800">
                              <span>Total</span><span>{fmtINR(inv.total)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}