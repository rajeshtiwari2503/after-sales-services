// "use client";
// import { useState, useEffect } from "react";
// import { Shield, Plus, Search, CheckCircle, XCircle, Clock } from "lucide-react";
// import toast from "react-hot-toast";

// interface WarrantyItem {
//   _id: string;
//   productName: string;
//   modelNumber: string;
//   customerId?: { name: string; email: string };
//   purchaseDate: string;
//   expiryDate: string;
//   status: "active" | "expired" | "pending";
//   tenantId: string;
// }

// const STATUS_CONFIG = {
//   active: { label: "Active", badge: "bg-green-50 text-green-700 border-green-100", icon: <CheckCircle className="w-3 h-3" /> },
//   expired: { label: "Expired", badge: "bg-red-50 text-red-700 border-red-100", icon: <XCircle className="w-3 h-3" /> },
//   pending: { label: "Pending", badge: "bg-amber-50 text-amber-700 border-amber-100", icon: <Clock className="w-3 h-3" /> },
// };

// const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// export default function WarrantyPage() {
//   const [items, setItems] = useState<WarrantyItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("");

//   useEffect(() => {
//     fetch("/api/warranty", { credentials: "include" })
//       .then(r => r.json()).then(d => setItems(d.data?.items ?? d.data ?? []))
//       .catch(() => toast.error("Failed to load warranty data"))
//       .finally(() => setLoading(false));
//   }, []);

//   const filtered = items.filter(i =>
//     !filter || i.status === filter ||
//     i.productName?.toLowerCase().includes(filter) ||
//     i.modelNumber?.toLowerCase().includes(filter)
//   );

//   const stats = {
//     active: items.filter(i => i.status === "active").length,
//     expired: items.filter(i => i.status === "expired").length,
//     pending: items.filter(i => i.status === "pending").length,
//   };

//   return (
//     <div className="max-w-6xl mx-auto space-y-5">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Warranty Management</h1>
//           <p className="text-xs text-slate-400 mt-0.5">Configure and track warranty terms</p>
//         </div>
//         <button className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
//           <Plus className="w-4 h-4" /> Add warranty
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4">
//         {[
//           { label: "Active", value: stats.active, color: "text-green-600", bg: "bg-green-50" },
//           { label: "Expired", value: stats.expired, color: "text-red-600", bg: "bg-red-50" },
//           { label: "Pending", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
//         ].map(({ label, value, color, bg }) => (
//           <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
//             <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
//               <Shield className={`w-5 h-5 ${color}`} />
//             </div>
//             <div>
//               <p className={`text-2xl font-bold ${color}`}>{value}</p>
//               <p className="text-xs text-slate-500">{label} warranties</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Filter */}
//       <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3">
//         <div className="flex items-center gap-2 flex-1 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
//           <Search className="w-3.5 h-3.5 text-slate-400" />
//           <input type="text" placeholder="Search by product, model..." value={filter}
//             onChange={e => setFilter(e.target.value)}
//             className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
//         </div>
//         {["active","expired","pending"].map(s => (
//           <button key={s} onClick={() => setFilter(filter === s ? "" : s)}
//             className={`h-9 px-3 rounded-lg border text-xs font-medium capitalize cursor-pointer transition
//               ${filter === s ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//             {s}
//           </button>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className="bg-slate-50 border-b border-slate-100">
//               {["Product", "Model", "Customer", "Purchase date", "Expiry date", "Status"].map(h => (
//                 <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? Array(5).fill(0).map((_, i) => (
//               <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>)}</tr>
//             )) : filtered.map(item => {
//               const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
//               return (
//                 <tr key={item._id} className="hover:bg-slate-50 transition">
//                   <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.productName}</td>
//                   <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.modelNumber}</td>
//                   <td className="px-4 py-3 text-xs text-slate-600">{item.customerId?.name ?? "—"}</td>
//                   <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(item.purchaseDate)}</td>
//                   <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(item.expiryDate)}</td>
//                   <td className="px-4 py-3">
//                     <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.badge}`}>
//                       {cfg.icon} {cfg.label}
//                     </span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }



"use client";
// ═══════════════════════════════════════════════════════════════
// app/(brand)/brand/warranty-stickers/page.tsx
// Brand generates QR stickers for products
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode, Plus, Download, Printer, Package, RefreshCw,
  CheckCircle, Clock, X, Search, Eye, BarChart2,
  Shield, Trash2, AlertTriangle, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import QrCodeImage from "@/components/warranty/QrCodeImage";

interface Product { _id: string; name: string; modelNumber: string; warrantyPeriod: number; categoryId?: { name: string }; }
interface Sticker {
  _id: string; token: string; activationUrl: string;
  productName: string; modelNumber: string; warrantyPeriod: number;
  status: "unactivated" | "activated" | "voided";
  batchId: string; batchIndex: number;
  activatedAt?: string;
  activatedBy?: { name: string };
  createdAt: string;
}
interface Batch {
  _id: string; total: number; activated: number; unactivated: number;
  productName: string; createdAt: string;
}

const STATUS_CFG = {
  unactivated: { label: "Unused",    badge: "bg-slate-100 text-slate-600 border-slate-200",  dot: "bg-slate-400" },
  activated:   { label: "Activated", badge: "bg-green-50 text-green-700 border-green-100",   dot: "bg-green-500" },
  voided:      { label: "Voided",    badge: "bg-red-50 text-red-600 border-red-100",          dot: "bg-red-500"   },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ─── Print-ready QR sticker card ────────────────────────────────
function StickerCard({ sticker, productName }: { sticker: { token: string; activationUrl: string }; productName: string; brandName?: string }) {
  return (
    <div className="w-[200px] border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-white">
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-md flex items-center justify-center">
          <span className="text-white text-[8px] font-black">ST</span>
        </div>
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">SaaS Techify</span>
      </div>

      <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
        <QrCodeImage value={sticker.activationUrl} size={80} />
      </div>

      <p className="text-[9px] font-bold text-slate-700 leading-tight">{productName}</p>
      <p className="text-[8px] text-indigo-600 font-semibold mt-0.5">Scan to activate warranty</p>
      <p className="text-[7px] text-slate-400 mt-1 font-mono">{sticker.token}</p>

      <div className="mt-2 pt-2 border-t border-slate-200">
        <p className="text-[7px] text-slate-400">Powered by SaaS Techify</p>
      </div>
    </div>
  );
}

// ─── Print modal ─────────────────────────────────────────────────
function PrintModal({ stickers, productName, onClose }: {
  stickers: { token: string; activationUrl: string }[];
  productName: string;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win || !printRef.current) return;
    win.document.write(`
      <html><head><title>Warranty Stickers — ${productName}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: white; }
        .grid { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px; }
        .sticker { width: 190px; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 12px;
          text-align: center; page-break-inside: avoid; background: white; }
        .brand-row { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 10px; }
        .brand-icon { width: 18px; height: 18px; background: linear-gradient(135deg,#6366f1,#8b5cf6);
          border-radius: 4px; display: flex; align-items: center; justify-content: center; }
        .brand-icon span { color: white; font-size: 7px; font-weight: 900; }
        .brand-name { font-size: 9px; font-weight: 900; color: #1e293b; letter-spacing: 1.5px; text-transform: uppercase; }
        .qr-box { width: 72px; height: 72px; margin: 0 auto 8px; background: #f8fafc;
          border: 1.5px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center;
          justify-content: center; flex-direction: column; }
        .qr-placeholder { font-size: 20px; }
        .token { font-family: monospace; font-size: 6.5px; color: #64748b; margin-top: 2px;
          word-break: break-all; padding: 0 2px; line-height: 1.3; }
        .product-name { font-size: 8.5px; font-weight: 700; color: #1e293b; line-height: 1.3; }
        .scan-text { font-size: 7.5px; color: #6366f1; font-weight: 600; margin-top: 2px; }
        .footer { margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0;
          font-size: 6.5px; color: #94a3b8; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .grid { gap: 6px; padding: 8px; }
        }
      </style></head>
      <body>
        <div class="grid">
          ${stickers.map(s => `
            <div class="sticker">
              <div class="brand-row">
                <div class="brand-icon"><span>ST</span></div>
                <span class="brand-name">SaaS Techify</span>
              </div>
              <div class="qr-box">
                <div class="qr-placeholder">⬛</div>
                <div class="token">${s.token}</div>
              </div>
              <div class="product-name">${productName}</div>
              <div class="scan-text">Scan to activate warranty</div>
              <div class="token">${s.token}</div>
              <div class="footer">Powered by SaaS Techify</div>
            </div>
          `).join("")}
        </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">Print stickers</h2>
            <p className="text-xs text-slate-400 mt-0.5">{stickers.length} stickers · {productName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer">
              <Printer className="w-4 h-4" /> Print all
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div ref={printRef} className="flex flex-wrap gap-4 justify-center">
            {stickers.map(s => (
              <StickerCard key={s.token} sticker={s} productName={productName} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Brand Stickers Page ────────────────────────────────────
export default function BrandStickerPage() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [stickers, setStickers]       = useState<Sticker[]>([]);
  const [batches, setBatches]         = useState<Batch[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showGen, setShowGen]         = useState(false);
  const [printData, setPrintData]     = useState<{ stickers: any[]; productName: string } | null>(null);
  const [tab, setTab]                 = useState<"batches" | "all">("batches");
  const [batchFilter, setBatchFilter] = useState("");
  const [saving, setSaving]           = useState(false);
  const [genForm, setGenForm]         = useState({ productId: "", quantity: "10" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, stickerRes] = await Promise.all([
        fetch("/api/products", { credentials: "include" }),
        fetch(`/api/warranty-stickers?limit=100${batchFilter ? `&batchId=${batchFilter}` : ""}`, { credentials: "include" }),
      ]);
      const [prodData, stickerData] = await Promise.all([prodRes.json(), stickerRes.json()]);
      setProducts(prodData.data ?? []);
      setStickers(stickerData.data?.stickers ?? []);
      setBatches(stickerData.data?.batchStats ?? []);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, [batchFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerate = async () => {
    if (!genForm.productId) { toast.error("Select a product"); return; }
    const qty = parseInt(genForm.quantity);
    if (!qty || qty < 1 || qty > 500) { toast.error("Quantity must be 1–500"); return; }

    setSaving(true);
    try {
      const product = products.find(p => p._id === genForm.productId)!;
      const res = await fetch("/api/warranty-stickers", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId:      product._id,
          productName:    product.name,
          modelNumber:    product.modelNumber,
          categoryName:   product.categoryId?.name,
          warrantyPeriod: product.warrantyPeriod,
          quantity:       qty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(`${data.data.count} stickers generated!`);
      setShowGen(false);

      // Auto open print
      setPrintData({ stickers: data.data.stickers, productName: product.name });
      fetchData();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSaving(false); }
  };

  const printBatch = (batchId: string) => {
    const batchStickers = stickers.filter(s => s.batchId === batchId);
    const batch = batches.find(b => b._id === batchId);
    if (!batchStickers.length) { toast.error("No stickers found"); return; }
    setPrintData({ stickers: batchStickers, productName: batch?.productName ?? "Product" });
  };

  const totalStats = {
    total:       stickers.length,
    activated:   stickers.filter(s => s.status === "activated").length,
    unactivated: stickers.filter(s => s.status === "unactivated").length,
    voided:      stickers.filter(s => s.status === "voided").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Warranty Stickers</h1>
          <p className="text-xs text-slate-400 mt-0.5">Generate QR stickers for products — customers scan to activate</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData}
            className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowGen(true)}
            className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer">
            <Plus className="w-4 h-4" /> Generate stickers
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total generated", value: totalStats.total,       color: "text-slate-800",  bg: "bg-slate-50",  icon: QrCode        },
          { label: "Activated",        value: totalStats.activated,   color: "text-green-600",  bg: "bg-green-50",  icon: CheckCircle   },
          { label: "Unused",           value: totalStats.unactivated, color: "text-blue-600",   bg: "bg-blue-50",   icon: Clock         },
          { label: "Voided",           value: totalStats.voided,      color: "text-red-500",    bg: "bg-red-50",    icon: AlertTriangle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activation rate bar */}
      {totalStats.total > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-700">Overall activation rate</p>
            <p className="text-sm font-black text-indigo-600">
              {Math.round((totalStats.activated / totalStats.total) * 100)}%
            </p>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-1000"
              style={{ width: `${(totalStats.activated / totalStats.total) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-400">
            <span>{totalStats.activated} activated</span>
            <span>{totalStats.unactivated} unused</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl w-fit">
        {[{ key: "batches", label: `Batches (${batches.length})` }, { key: "all", label: `All stickers (${stickers.length})` }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`h-9 px-4 rounded-lg text-sm font-medium cursor-pointer transition
              ${tab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Batches tab */}
      {tab === "batches" && (
        <div className="space-y-3">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse flex gap-4">
              <div className="flex-1 space-y-2"><div className="h-4 bg-slate-200 rounded w-1/3" /><div className="h-3 bg-slate-100 rounded w-1/2" /></div>
              <div className="w-24 h-9 bg-slate-200 rounded-xl" />
            </div>
          )) : batches.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 py-14 text-center">
              <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No sticker batches yet</p>
              <button onClick={() => setShowGen(true)} className="text-indigo-600 text-xs hover:underline mt-1 cursor-pointer">
                Generate first batch →
              </button>
            </div>
          ) : batches.map(batch => {
            const rate = batch.total > 0 ? Math.round((batch.activated / batch.total) * 100) : 0;
            return (
              <div key={batch._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-indigo-200 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-slate-800">{batch.productName}</p>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{batch._id}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{batch.total} stickers · {fmtDate(batch.createdAt)}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[200px]">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{rate}% activated</span>
                      <span className="text-xs text-slate-400">{batch.activated}/{batch.total}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setBatchFilter(batch._id); setTab("all"); }}
                      className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button onClick={() => printBatch(batch._id)}
                      className="flex items-center gap-1.5 h-8 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium cursor-pointer">
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All stickers tab */}
      {tab === "all" && (
        <div className="space-y-3">
          {batchFilter && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filtered by batch:</span>
              <span className="font-mono text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">{batchFilter}</span>
              <button onClick={() => setBatchFilter("")} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Token","Product","Status","Activated by","Activated at","Actions"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? Array(8).fill(0).map((_, i) => (
                    <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>)}</tr>
                  )) : stickers.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-sm">No stickers</td></tr>
                  ) : stickers.map(s => {
                    const cfg = STATUS_CFG[s.status];
                    return (
                      <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span className="font-mono text-xs text-slate-700">{s.token}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-slate-800">{s.productName}</p>
                          <p className="text-[10px] text-slate-400">{s.modelNumber}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{s.activatedBy?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{s.activatedAt ? fmtDate(s.activatedAt) : "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setPrintData({ stickers: [s], productName: s.productName })}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer">
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generate modal */}
      {showGen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Generate warranty stickers</h2>
                <p className="text-xs text-slate-400 mt-0.5">QR codes will be generated for activation</p>
              </div>
              <button onClick={() => setShowGen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Select product *</label>
                <select value={genForm.productId} onChange={e => setGenForm(p => ({...p, productId: e.target.value}))}
                  className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 cursor-pointer">
                  <option value="">Choose product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} — {p.modelNumber} ({p.warrantyPeriod}m)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Quantity (1–500) *</label>
                <input type="number" min="1" max="500" value={genForm.quantity}
                  onChange={e => setGenForm(p => ({...p, quantity: e.target.value}))}
                  className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400" />
              </div>

              {genForm.productId && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5">
                  {(() => {
                    const p = products.find(pr => pr._id === genForm.productId);
                    return p ? (
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.modelNumber} · {p.warrantyPeriod} months warranty</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowGen(false)} className="flex-1 h-11 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-pointer hover:bg-slate-50">Cancel</button>
              <button onClick={handleGenerate} disabled={saving || !genForm.productId}
                className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                  : <><QrCode className="w-4 h-4" />Generate & print</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print modal */}
      {printData && (
        <PrintModal stickers={printData.stickers} productName={printData.productName} onClose={() => setPrintData(null)} />
      )}
    </div>
  );
}