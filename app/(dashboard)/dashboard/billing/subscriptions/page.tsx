"use client";

import { useEffect, useState, useCallback } from "react";
import PaymentHistory from "@/components/billing/PaymentHistory";
import { RefreshCw } from "lucide-react";

export default function SubscriptionPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter) params.set("status", filter);
      const res = await fetch(`/api/billing/subscriptions?${params}`, { credentials: "include" });
      const data = await res.json();
      setPayments(data.data?.payments ?? data.data?.subscriptions ?? []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Payment history</h1>
          <p className="text-xs text-slate-400 mt-0.5">Invoice payments for your tenant</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer">
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <button onClick={fetchPayments}
            className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      <PaymentHistory payments={payments} loading={loading} />
    </div>
  );
}
