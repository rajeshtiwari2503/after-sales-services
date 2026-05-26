"use client";

interface InvoiceRow {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt?: string;
  customerId?: { name?: string; email?: string } | string;
  ticketId?: { ticketNumber?: string } | string;
}

interface Props {
  invoices: InvoiceRow[];
  loading?: boolean;
}

const STATUS_CLS: Record<string, string> = {
  paid: "bg-green-50 text-green-700 border-green-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  overdue: "bg-red-50 text-red-600 border-red-100",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function InvoicesTable({ invoices, loading }: Props) {
  const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const customerName = (c: InvoiceRow["customerId"]) =>
    typeof c === "object" && c?.name ? c.name : "—";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Invoices</h2>
        <p className="text-xs text-slate-400 mt-0.5">{invoices.length} records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Invoice", "Customer", "Amount", "Status", "Due", "Paid"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
                  ))}
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No invoices found</td>
              </tr>
            ) : invoices.map(inv => (
              <tr key={inv._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-sm font-medium text-slate-800">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{customerName(inv.customerId)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-800">{fmtINR(inv.total)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border capitalize ${STATUS_CLS[inv.status] ?? STATUS_CLS.draft}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(inv.dueDate)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(inv.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
