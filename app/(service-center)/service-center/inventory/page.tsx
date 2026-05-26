"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Plus, AlertTriangle, Search, RefreshCw, TrendingDown, Truck } from "lucide-react";
import toast from "react-hot-toast";
import InventoryTransfersPanel from "@/components/inventory/InventoryTransfersPanel";

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  location?: string;
  isActive: boolean;
}

function SCInventoryContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "transfers" ? "transfers" : "stock";

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "", sku: "", category: "Spare Parts",
    quantity: 0, minQuantity: 5, maxQuantity: 100, unitPrice: 0, location: "",
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (showLowStock) params.set("lowStock", "true");
      const res = await fetch(`/api/inventory?${params}`, { credentials: "include" });
      const data = await res.json();
      setItems(data.data?.inventory ?? data.data?.items ?? []);
    } catch { toast.error("Failed to load inventory"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === "stock") fetchInventory();
  }, [search, showLowStock, tab]);

  const lowStockCount = items.filter(i => i.quantity <= i.minQuantity).length;
  const totalValue = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const handleAdd = async () => {
    if (!addForm.name || !addForm.sku) { toast.error("Name and SKU required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          quantity: Number(addForm.quantity),
          minQuantity: Number(addForm.minQuantity),
          maxQuantity: Number(addForm.maxQuantity),
          unitPrice: Number(addForm.unitPrice),
          costPrice: Number(addForm.unitPrice) * 0.7,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Item added");
      setShowAdd(false);
      setAddForm({ name: "", sku: "", category: "Spare Parts", quantity: 0, minQuantity: 5, maxQuantity: 100, unitPrice: 0, location: "" });
      fetchInventory();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add item");
    } finally { setSaving(false); }
  };

  const stockLevel = (item: InventoryItem) => {
    const pct = item.maxQuantity > 0 ? (item.quantity / item.maxQuantity) * 100 : 0;
    if (item.quantity <= item.minQuantity) return { color: "bg-red-500", label: "Low", badge: "bg-red-50 text-red-700 border-red-100" };
    if (pct < 50) return { color: "bg-amber-500", label: "Medium", badge: "bg-amber-50 text-amber-700 border-amber-100" };
    return { color: "bg-green-500", label: "Good", badge: "bg-green-50 text-green-700 border-green-100" };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Inventory & Parts</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {tab === "stock" ? `${items.length} items at your center` : "Shipments & part requests"}
          </p>
        </div>
        {tab === "stock" && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium cursor-pointer">
            <Plus className="w-4 h-4" /> Add item
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <a href="/service-center/inventory" className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "stock" ? "border-teal-600 text-teal-600" : "border-transparent text-slate-500"}`}>
          <Package className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Local stock
        </a>
        <a href="/service-center/inventory?tab=transfers" className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === "transfers" ? "border-teal-600 text-teal-600" : "border-transparent text-slate-500"}`}>
          <Truck className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Transfers
        </a>
      </div>

      {tab === "transfers" ? (
        <InventoryTransfersPanel role="service_center" />
      ) : (
        <>
      {/* Alert banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">
            <span className="font-semibold">{lowStockCount} items</span> are below minimum stock level
          </p>
          <button onClick={() => setShowLowStock(true)} className="text-xs text-red-600 font-medium hover:underline cursor-pointer">
            View →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total items", value: items.length, color: "text-slate-800" },
          { label: "Low stock", value: lowStockCount, color: "text-red-600" },
          { label: "Categories", value: [...new Set(items.map(i => i.category))].length, color: "text-blue-600" },
          { label: "Total value", value: `₹${totalValue.toLocaleString("en-IN")}`, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search by name, SKU..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
        </div>
        <button onClick={() => setShowLowStock(p => !p)}
          className={`flex items-center gap-1.5 h-9 px-3 border rounded-lg text-xs font-medium cursor-pointer transition
            ${showLowStock ? "bg-red-600 border-red-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          <TrendingDown className="w-3.5 h-3.5" /> Low stock only
        </button>
        <button onClick={fetchInventory} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Item name", "SKU", "Category", "Qty", "Min/Max", "Unit price", "Stock level", "Location"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? Array(6).fill(0).map((_, i) => (
                <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>)}</tr>
              )) : items.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400 text-sm">No inventory items found</td></tr>
              ) : items.map(item => {
                const stock = stockLevel(item);
                const pct = item.maxQuantity > 0 ? Math.min((item.quantity / item.maxQuantity) * 100, 100) : 0;
                return (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.sku}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 capitalize">{item.category}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{item.quantity}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.minQuantity}/{item.maxQuantity}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">₹{item.unitPrice?.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${stock.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${stock.badge}`}>{stock.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.location ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

        </>
      )}

      {showAdd && tab === "stock" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800">Add spare part</h2>
            <input placeholder="Item name *" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm" />
            <input placeholder="SKU *" value={addForm.sku} onChange={e => setAddForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm uppercase" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Qty" value={addForm.quantity} onChange={e => setAddForm(f => ({ ...f, quantity: +e.target.value }))}
                className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
              <input type="number" placeholder="Unit price ₹" value={addForm.unitPrice} onChange={e => setAddForm(f => ({ ...f, unitPrice: +e.target.value }))}
                className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="h-9 px-4 border border-slate-200 rounded-lg text-sm cursor-pointer">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="h-9 px-4 bg-teal-600 text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60">
                {saving ? "Saving..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SCInventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Loading…</div>}>
      <SCInventoryContent />
    </Suspense>
  );
}