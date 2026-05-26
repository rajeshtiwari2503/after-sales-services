"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package, Plus, Search, RefreshCw, AlertTriangle, Truck, X, Save,
} from "lucide-react";
import toast from "react-hot-toast";
import InventoryTransfersPanel from "@/components/inventory/InventoryTransfersPanel";

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
}

const inputCls =
  "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 text-slate-800";

function BrandInventoryContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "transfers" ? "transfers" : "stock";

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Spare Parts",
    quantity: 0,
    minQuantity: 5,
    unitPrice: 0,
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ warehouse: "central", limit: "100" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/inventory?${params}`, { credentials: "include" });
      const data = await res.json();
      setItems(data.data?.inventory ?? []);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (tab === "stock") fetchItems();
  }, [tab, fetchItems]);

  const handleAdd = async () => {
    if (!form.name || !form.sku) {
      toast.error("Name and SKU required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          minQuantity: Number(form.minQuantity),
          unitPrice: Number(form.unitPrice),
          costPrice: Number(form.unitPrice) * 0.7,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Item added to brand warehouse");
      setShowAdd(false);
      setForm({ name: "", sku: "", category: "Spare Parts", quantity: 0, minQuantity: 5, unitPrice: 0 });
      fetchItems();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Brand inventory</h1>
          <p className="text-xs text-slate-400 mt-0.5">Central warehouse & spare part transfers</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <a
          href="/brand/inventory"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "stock"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Package className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Warehouse stock
        </a>
        <a
          href="/brand/inventory?tab=transfers"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "transfers"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Truck className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Transfers
        </a>
      </div>

      {tab === "transfers" ? (
        <InventoryTransfersPanel role="manager" />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 h-10 bg-white border border-slate-200 rounded-lg px-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                className="flex-1 text-sm bg-transparent outline-none"
                placeholder="Search SKU or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={fetchItems}
              className="h-10 w-10 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="h-10 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add item
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 py-8 text-center">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center border border-dashed rounded-xl">
              No central stock yet. Add items before dispatching to service centers.
            </p>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">Item</th>
                    <th className="text-left px-4 py-3">SKU</th>
                    <th className="text-right px-4 py-3">Qty</th>
                    <th className="text-right px-4 py-3">Min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.sku}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={item.quantity <= item.minQuantity ? "text-red-600 font-semibold" : ""}>
                          {item.quantity}
                        </span>
                        {item.quantity <= item.minQuantity && (
                          <AlertTriangle className="w-3.5 h-3.5 inline ml-1 text-amber-500" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{item.minQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-3">
            <div className="flex justify-between">
              <h2 className="font-semibold text-slate-800">Add warehouse item</h2>
              <button type="button" onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <input className={inputCls} placeholder="Name *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <input className={inputCls} placeholder="SKU *" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value.toUpperCase() }))} />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" className={inputCls} placeholder="Qty" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: +e.target.value }))} />
              <input type="number" className={inputCls} placeholder="Min" value={form.minQuantity} onChange={(e) => setForm((p) => ({ ...p, minQuantity: +e.target.value }))} />
              <input type="number" className={inputCls} placeholder="₹ Price" value={form.unitPrice} onChange={(e) => setForm((p) => ({ ...p, unitPrice: +e.target.value }))} />
            </div>
            <button type="button" disabled={saving} onClick={handleAdd} className="w-full h-10 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrandInventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Loading…</div>}>
      <BrandInventoryContent />
    </Suspense>
  );
}
