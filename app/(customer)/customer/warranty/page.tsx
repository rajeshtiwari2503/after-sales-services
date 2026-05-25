"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Plus, Calendar, Package, CheckCircle, XCircle, Clock, QrCode } from "lucide-react";

interface Warranty {
  _id: string;
  productName: string;
  serialNumber?: string;
  warrantyType: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  status: "active" | "expired" | "claimed";
  notes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  active:  { label: "Active",   cls: "bg-green-50 text-green-700 border-green-100",  icon: CheckCircle },
  expired: { label: "Expired",  cls: "bg-slate-100 text-slate-500 border-slate-200", icon: XCircle },
  claimed: { label: "Claimed",  cls: "bg-violet-50 text-violet-600 border-violet-100", icon: Clock },
};

function daysLeft(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

export default function CustomerWarrantyPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [qrToken,    setQrToken]    = useState("");
  const [showQr,     setShowQr]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/warranty?limit=50", { credentials: "include" });
        const data = await res.json();
        setWarranties(data.data?.warranties ?? data.data ?? []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> My Warranties
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Track all your product warranties</p>
        </div>
        <button onClick={() => setShowQr(true)}
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition">
          <QrCode className="w-4 h-4" /> Activate QR
        </button>
      </div>

      {/* QR Activate mini-form */}
      {showQr && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-800 mb-3">Enter Warranty Token (from QR code)</p>
          <div className="flex gap-3">
            <input value={qrToken} onChange={e => setQrToken(e.target.value)}
              placeholder="Warranty token from sticker..."
              className="flex-1 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
            <Link href={`/customer/warranty/activate/${qrToken}`}
              className={`h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition cursor-pointer ${qrToken ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-400 pointer-events-none"}`}>
              <Plus className="w-4 h-4" /> Activate
            </Link>
            <button onClick={() => setShowQr(false)} className="h-10 px-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Or scan the QR code with your phone camera to open the activation link directly.</p>
        </div>
      )}

      {/* Warranty cards */}
      {loading ? (
        Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse h-28" />
        ))
      ) : warranties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-semibold">No warranties registered</p>
          <p className="text-xs text-slate-400 mt-1">Scan your product's warranty QR code to activate</p>
          <button onClick={() => setShowQr(true)}
            className="mt-4 flex items-center gap-2 h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition mx-auto">
            <QrCode className="w-4 h-4" /> Activate Warranty
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {warranties.map(w => {
            const st  = STATUS_CONFIG[w.status] ?? STATUS_CONFIG.expired;
            const Icon = st.icon;
            const dl  = daysLeft(w.warrantyEndDate);
            return (
              <div key={w._id} className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{w.productName}</p>
                      {w.serialNumber && <p className="text-xs text-slate-400 font-mono mt-0.5">{w.serialNumber}</p>}
                      <p className="text-xs text-slate-400 mt-1 capitalize">{w.warrantyType} warranty</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${st.cls}`}>
                    <Icon className="w-3 h-3" /> {st.label}
                  </span>
                </div>
                <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>From: <strong className="text-slate-700">{fmtDate(w.warrantyStartDate)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Until: <strong className="text-slate-700">{fmtDate(w.warrantyEndDate)}</strong></span>
                  </div>
                  {w.status === "active" && (
                    <span className={`font-medium ${dl < 30 ? "text-amber-600" : "text-green-600"}`}>
                      {dl > 0 ? `${dl} days left` : "Expiring today"}
                    </span>
                  )}
                </div>
                {dl < 30 && w.status === "active" && dl > 0 && (
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "90%" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
