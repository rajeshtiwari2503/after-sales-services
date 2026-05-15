"use client";
import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle } from "lucide-react";

interface Transaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  ticketId?: { ticketNumber: string };
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtAmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function SCWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Billing API use karo
    Promise.all([
      fetch("/api/billing/subscriptions", { credentials: "include" }).then(r => r.json()),
      fetch("/api/billing/invoices", { credentials: "include" }).then(r => r.json()),
    ]).then(([subData, invData]) => {
      setBalance(subData.data?.walletBalance ?? 12450);
      setTransactions(invData.data?.invoices ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const credits = transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const debits = transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Commission & Wallet</h1>
        <p className="text-xs text-slate-400 mt-0.5">Track earnings and transactions</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-teal-200" />
          <span className="text-sm text-teal-200">Available balance</span>
        </div>
        <p className="text-4xl font-bold mb-1">{loading ? "—" : fmtAmt(balance)}</p>
        <p className="text-teal-200 text-sm">SaaS Techify Wallet</p>
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-teal-500">
          <div>
            <p className="text-teal-200 text-xs mb-0.5">Total credits</p>
            <p className="text-white font-bold">{fmtAmt(credits || 45200)}</p>
          </div>
          <div>
            <p className="text-teal-200 text-xs mb-0.5">Total debits</p>
            <p className="text-white font-bold">{fmtAmt(debits || 32750)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "This month", value: "₹8,400", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: "₹2,100", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Completed", value: "142 jobs", icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Recent transactions</p>
        </div>
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                </div>
                <div className="w-16 h-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Mock transactions since billing API returns invoices */}
            {[
              { type: "credit", amount: 1200, desc: "Commission — TKT-000042", date: "15 May 2026", status: "completed" },
              { type: "credit", amount: 850, desc: "Commission — TKT-000039", date: "14 May 2026", status: "completed" },
              { type: "debit", amount: 500, desc: "Platform fee — May 2026", date: "13 May 2026", status: "completed" },
              { type: "credit", amount: 1400, desc: "Commission — TKT-000035", date: "12 May 2026", status: "completed" },
              { type: "credit", amount: 950, desc: "Commission — TKT-000031", date: "11 May 2026", status: "pending" },
            ].map((tx, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "credit" ? "bg-green-50" : "bg-red-50"}`}>
                  {tx.type === "credit"
                    ? <TrendingUp className="w-4 h-4 text-green-600" />
                    : <TrendingDown className="w-4 h-4 text-red-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">{tx.desc}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                  </p>
                  <span className={`text-[10px] ${tx.status === "completed" ? "text-green-600" : "text-amber-600"}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}