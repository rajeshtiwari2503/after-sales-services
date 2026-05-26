"use client";

import { useState, useEffect, useCallback } from "react";
import { QrCode, Plus, Copy, Download, CheckCircle, XCircle, Clock, Search, Filter, RefreshCw, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface Sticker {
  _id: string;
  token: string;
  productName?: string;
  status: "unactivated" | "activated" | "expired";
  warrantyPeriod?: number;
  warrantyYears?: number;
  warrantyType?: string;
  activatedAt?: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  unactivated: { label: "Unactivated", cls: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock },
  activated:   { label: "Activated",   cls: "bg-green-50 text-green-700 border-green-100", icon: CheckCircle },
  expired:     { label: "Expired",     cls: "bg-red-50 text-red-500 border-red-100",       icon: XCircle },
};

const inputCls = "h-10 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

export default function BrandStickersPage() {
  const [stickers, setStickers]   = useState<Sticker[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState("");
  const [status,   setStatus]     = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]   = useState(false);
  const [form, setForm] = useState({ productName: "", warrantyYears: "1", warrantyType: "standard", count: "1" });

  const fetchStickers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res  = await fetch(`/api/warranty-stickers?${params}`, { credentials: "include" });
      const data = await res.json();
      setStickers(data.data?.stickers ?? data.data ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { fetchStickers(); }, [fetchStickers]);

  const createStickers = async () => {
    setCreating(true);
    try {
      const res  = await fetch("/api/warranty-stickers", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName:   form.productName,
          warrantyYears: Number(form.warrantyYears),
          warrantyType:  form.warrantyType,
          count:         Number(form.count),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${data.data?.created ?? form.count} sticker(s) generated!`);
      setShowCreate(false);
      fetchStickers();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setCreating(false); }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copied!");
  };

  const downloadQR = async (token: string) => {
    try {
      const { downloadQrPng } = await import("@/lib/download-qr");
      const url = `${window.location.origin}/customer/warranty/activate/${token}`;
      await downloadQrPng(url, `warranty-${token.slice(0, 8)}.png`);
      toast.success("QR code downloaded");
    } catch {
      toast.error("Failed to generate QR code");
    }
  };

  const deleteSticker = async (id: string) => {
    if (!confirm("Delete this sticker?")) return;
    try {
      await fetch(`/api/warranty-stickers?id=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
      setStickers(s => s.filter(x => x._id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" /> Warranty Stickers
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Generate QR-based warranty stickers for your products</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition">
          <Plus className="w-4 h-4" /> Generate Stickers
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Generate Warranty Stickers</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Product Name</label>
                <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                  placeholder="e.g. AirCool 2.0 Ton AC" className={`${inputCls} w-full`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Warranty Years</label>
                  <select value={form.warrantyYears} onChange={e => setForm(f => ({ ...f, warrantyYears: e.target.value }))}
                    className={`${inputCls} w-full`}>
                    {[1,2,3,5].map(y => <option key={y} value={y}>{y} Year{y > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Warranty Type</label>
                  <select value={form.warrantyType} onChange={e => setForm(f => ({ ...f, warrantyType: e.target.value }))}
                    className={`${inputCls} w-full`}>
                    <option value="standard">Standard</option>
                    <option value="extended">Extended</option>
                    <option value="comprehensive">Comprehensive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Quantity to Generate</label>
                <input type="number" min="1" max="500" value={form.count}
                  onChange={e => setForm(f => ({ ...f, count: e.target.value }))}
                  className={`${inputCls} w-full`} />
              </div>
              <button onClick={createStickers} disabled={creating || !form.productName}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition disabled:opacity-60 flex items-center justify-center gap-2">
                {creating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</> : <><QrCode className="w-4 h-4" />Generate</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by product or token..." className={`${inputCls} w-full pl-9`} />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className={`${inputCls} min-w-[150px]`}>
          <option value="">All Status</option>
          <option value="unactivated">Unactivated</option>
          <option value="activated">Activated</option>
          <option value="expired">Expired</option>
        </select>
        <button onClick={fetchStickers} className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stickers table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80">
              <tr>
                {["Token", "Product", "Type", "Years", "Status", "Customer", "Created", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              )) : stickers.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                  <QrCode className="w-8 h-8 mx-auto mb-2 opacity-20" />No stickers found
                </td></tr>
              ) : stickers.map(s => {
                const st   = STATUS_CONFIG[s.status];
                const Icon = st.icon;
                return (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-indigo-600">{s.token.slice(0, 12)}...</code>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{s.productName ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-slate-600 text-xs">{s.warrantyType}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{s.warrantyYears ?? Math.round((s.warrantyPeriod ?? 12) / 12)}Y</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border flex items-center gap-1 w-fit ${st.cls}`}>
                        <Icon className="w-3 h-3" />{st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{s.customerName ?? s.customerEmail ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(s.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => copyToken(s.token)} title="Copy token"
                          className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 cursor-pointer transition">
                          <Copy className="w-3 h-3" />
                        </button>
                        <button onClick={() => downloadQR(s.token)} title="Download QR"
                          className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 cursor-pointer transition">
                          <Download className="w-3 h-3" />
                        </button>
                        {s.status === "unactivated" && (
                          <button onClick={() => deleteSticker(s._id)} title="Delete"
                            className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 cursor-pointer transition">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
