"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Calendar, Receipt, CheckCircle, Clock, ExternalLink } from "lucide-react";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  ticketId?: { ticketNumber?: string; title?: string };
  total: number;
  status: "draft" | "sent" | "paid" | "cancelled";
  issueDate?: string;
  dueDate?: string;
  createdAt: string;
  items?: { description: string; quantity: number; unitPrice: number; amount: number }[];
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  draft:     { label: "Draft",     cls: "bg-slate-100 text-slate-500 border-slate-200",  icon: Clock },
  sent:      { label: "Sent",      cls: "bg-blue-50 text-blue-600 border-blue-100",      icon: ExternalLink },
  paid:      { label: "Paid",      cls: "bg-green-50 text-green-700 border-green-100",   icon: CheckCircle },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-500 border-red-100",         icon: Clock },
};

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Invoice | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/billing/invoices?limit=50", { credentials: "include" });
        const data = await res.json();
        setInvoices(data.data?.invoices ?? data.data ?? []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const fmtINR  = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const printInvoice = (inv: Invoice) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Invoice ${inv.invoiceNumber}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto}h1{color:#4f46e5}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px;border:1px solid #e2e8f0;text-align:left}th{background:#f8fafc}tfoot td{font-weight:bold}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px}.badge{padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;background:#d1fae5;color:#065f46}</style>
      </head><body>
      <div class="header"><div><h1>INVOICE</h1><p style="color:#64748b;font-size:14px">${inv.invoiceNumber}</p></div>
      <div class="badge">${(inv.status ?? "").toUpperCase()}</div></div>
      <p style="font-size:14px;color:#475569"><strong>Issue Date:</strong> ${fmtDate(inv.issueDate ?? inv.createdAt)}</p>
      ${inv.ticketId?.ticketNumber ? `<p style="font-size:14px;color:#475569"><strong>Ticket:</strong> ${inv.ticketId.ticketNumber} — ${inv.ticketId.title ?? ""}</p>` : ""}
      ${(inv.items ?? []).length > 0 ? `
      <table><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
      <tbody>${(inv.items ?? []).map(item => `<tr><td>${item.description}</td><td>${item.quantity}</td><td>${fmtINR(item.unitPrice)}</td><td>${fmtINR(item.amount)}</td></tr>`).join("")}</tbody>
      <tfoot><tr><td colspan="3">Total</td><td>${fmtINR(inv.total)}</td></tr></tfoot></table>` : `<p style="margin-top:20px;font-weight:bold">Total: ${fmtINR(inv.total)}</p>`}
      </body></html>
    `);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600" /> My Invoices
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Download and view your service invoices</p>
      </div>

      {loading ? (
        Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse h-20" />
        ))
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-semibold">No invoices yet</p>
          <p className="text-xs text-slate-400 mt-1">Invoices will appear here after your service tickets are resolved</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => {
            const st   = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft;
            const Icon = st.icon;
            return (
              <div key={inv._id} className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 font-mono">{inv.invoiceNumber}</p>
                      {inv.ticketId?.ticketNumber && (
                        <p className="text-xs text-slate-400 mt-0.5">Ticket: {inv.ticketId.ticketNumber}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(inv.issueDate ?? inv.createdAt)}</span>
                        <span className="font-bold text-slate-700">{fmtINR(inv.total)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${st.cls}`}>
                      <Icon className="w-3 h-3" /> {st.label}
                    </span>
                    <button onClick={() => printInvoice(inv)}
                      className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 cursor-pointer transition" title="Download / Print">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expandable line items */}
                {selected?._id === inv._id && (inv.items ?? []).length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400">
                          <th className="text-left py-1">Description</th>
                          <th className="text-right py-1">Qty</th>
                          <th className="text-right py-1">Unit</th>
                          <th className="text-right py-1">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inv.items?.map((item, i) => (
                          <tr key={i}>
                            <td className="py-1.5 text-slate-700">{item.description}</td>
                            <td className="py-1.5 text-right text-slate-600">{item.quantity}</td>
                            <td className="py-1.5 text-right text-slate-600">{fmtINR(item.unitPrice)}</td>
                            <td className="py-1.5 text-right font-semibold text-slate-800">{fmtINR(item.amount)}</td>
                          </tr>
                        ))}
                        <tr className="font-bold text-slate-800">
                          <td colSpan={3} className="py-2 text-right">Total</td>
                          <td className="py-2 text-right">{fmtINR(inv.total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <button onClick={() => setSelected(selected?._id === inv._id ? null : inv)}
                  className="mt-3 text-xs text-indigo-600 hover:underline cursor-pointer">
                  {selected?._id === inv._id ? "Hide details" : "View line items"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
