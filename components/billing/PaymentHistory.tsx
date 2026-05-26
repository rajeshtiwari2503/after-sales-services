"use client";

import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export interface PaymentRow {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  paidAt?: string;
  createdAt?: string;
  paymentMethod?: string;
  customerId?: { name?: string } | string;
}

interface Props {
  payments: PaymentRow[];
  loading?: boolean;
}

export default function PaymentHistory({ payments, loading }: Props) {
  const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

  const icon = (status: string) => {
    if (status === "paid") return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === "overdue") return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Payment history</h2>
        <p className="text-xs text-slate-400 mt-0.5">Paid and pending invoice payments</p>
      </div>
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">No payment records</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {payments.map(p => (
            <div key={p._id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                {icon(p.status)}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {p.invoiceNumber}
                    {typeof p.customerId === "object" && p.customerId?.name && (
                      <span className="text-slate-400 font-normal"> · {p.customerId.name}</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fmtDate(p.paidAt ?? p.createdAt)}
                    {p.paymentMethod && ` · ${p.paymentMethod}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{fmtINR(p.total)}</p>
                <p className="text-[10px] capitalize text-slate-400">{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
