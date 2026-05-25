"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2, Package } from "lucide-react";

interface StickerInfo {
  token: string;
  status: "unactivated" | "activated" | "expired";
  productName?: string;
  brandName?: string;
  warrantyYears?: number;
  warrantyType?: string;
  activatedAt?: string;
}

export default function WarrantyActivatePage() {
  const { token } = useParams<{ token: string }>();
  const router    = useRouter();

  const [info,      setInfo]      = useState<StickerInfo | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [activating, setActivating] = useState(false);

  const [form, setForm] = useState({
    serialNumber: "", purchaseDate: "",
    customerName: "", customerPhone: "",
  });

  useEffect(() => {
    const fetchSticker = async () => {
      try {
        const res  = await fetch(`/api/warranty-stickers/${token}/activate`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setInfo(data.data);
      } catch (e: any) {
        setError(e.message ?? "Invalid warranty token");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSticker();
  }, [token]);

  const handleActivate = async () => {
    setActivating(true);
    try {
      const res  = await fetch(`/api/warranty-stickers/${token}/activate`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? "Activation failed");
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Verifying warranty token…</p>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-10 max-w-md w-full text-center">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Invalid Warranty</h1>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Warranty Activated!</h1>
          <p className="text-slate-500 text-sm mb-6">
            Your {info?.warrantyYears ?? 1}-year {info?.warrantyType ?? "standard"} warranty for{" "}
            <strong>{info?.productName ?? "your product"}</strong> is now active.
          </p>
          <div className="bg-green-50 rounded-2xl border border-green-100 p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Product</span>
              <span className="font-semibold text-slate-800">{info?.productName ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Warranty</span>
              <span className="font-semibold text-slate-800 capitalize">{info?.warrantyType ?? "Standard"} — {info?.warrantyYears ?? 1} Year{(info?.warrantyYears ?? 1) > 1 ? "s" : ""}</span>
            </div>
          </div>
          <button onClick={() => router.push("/customer/tickets")}
            className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold cursor-pointer transition">
            Go to My Tickets
          </button>
        </div>
      </div>
    );
  }

  if (info?.status === "activated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-10 max-w-md w-full text-center">
          <AlertTriangle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Already Activated</h1>
          <p className="text-slate-500 text-sm">This warranty was activated on {info.activatedAt ? new Date(info.activatedAt).toLocaleDateString("en-IN") : "a previous date"}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 w-full max-w-md">
        <div className="p-8 text-center border-b border-slate-100">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Activate Warranty</h1>
          {info && (
            <div className="mt-3 flex items-center gap-2 justify-center text-sm text-slate-600">
              <Package className="w-4 h-4 text-indigo-400" />
              <strong>{info.productName ?? "Product"}</strong>
              {info.brandName && <span className="text-slate-400">by {info.brandName}</span>}
            </div>
          )}
          {info && (
            <p className="mt-2 text-xs text-slate-400">
              {info.warrantyYears ?? 1}-year {info.warrantyType ?? "standard"} warranty
            </p>
          )}
        </div>

        <div className="p-8 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Serial Number</label>
            <input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))}
              placeholder="e.g. SN123456789"
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Purchase Date</label>
            <input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))}
              max={new Date().toISOString().split("T")[0]}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Your Name</label>
            <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              placeholder="Full name"
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Phone Number</label>
            <input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
              placeholder="+91 9876543210" type="tel"
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-red-600 text-sm">
              <XCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleActivate} disabled={activating}
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-60">
            {activating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {activating ? "Activating…" : "Activate Warranty"}
          </button>

          <p className="text-center text-xs text-slate-400 pt-1">
            By activating, you agree to the warranty terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
