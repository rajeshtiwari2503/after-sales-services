"use client";

import { useEffect, useState, useCallback } from "react";
import InvoicesTable from "@/components/billing/InvoicesTable";
import { RefreshCw } from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/invoices?limit=100", { credentials: "include" });
      const data = await res.json();
      setInvoices(data.data?.invoices ?? []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">All invoices</h1>
          <p className="text-xs text-slate-400 mt-0.5">Tenant billing records</p>
        </div>
        <button onClick={fetchInvoices}
          className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <InvoicesTable invoices={invoices} loading={loading} />
    </div>
  );
}
