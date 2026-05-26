"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Package, TrendingDown, AlertTriangle, DollarSign,
  Plus, Search, Filter, RefreshCw, MoreVertical,
  Pencil, Trash2, ChevronLeft, ChevronRight, X, Save, AlertCircle,
} from "lucide-react";

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  costPrice: number;
  supplier?: { name: string; contact: string; email: string };
  location?: string;
  isActive: boolean;
  lastRestockedAt?: string;
}

interface Stats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
}

const CATEGORIES = ["Spare Parts", "Tools", "Consumables", "Electronics", "Accessories", "Other"];

const LOW_STOCK_BADGE = "bg-amber-50 text-amber-700 border-amber-100";
const OUT_STOCK_BADGE  = "bg-red-50 text-red-600 border-red-100";
const OK_BADGE         = "bg-green-50 text-green-700 border-green-100";

function stockStatus(item: InventoryItem) {
  if (item.quantity === 0) return { label: "Out of Stock", cls: OUT_STOCK_BADGE };
  if (item.quantity <= item.minQuantity) return { label: "Low Stock", cls: LOW_STOCK_BADGE };
  return { label: "In Stock", cls: OK_BADGE };
}

function StatsCard({ icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function InventoryPage() {
  const [items,   setItems]   = useState<InventoryItem[]>([]);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [category, setCategory] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterProductId, setFilterProductId] = useState("");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ _id: string; name: string; modelNumber?: string }[]>([]);
  const [filterProducts, setFilterProducts] = useState<{ _id: string; name: string }[]>([]);
  const [filter,   setFilter]   = useState<"all" | "low" | "out">("all");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 15;

  // Modal state
  const [showAdd,   setShowAdd]   = useState(false);
  const [editItem,  setEditItem]  = useState<InventoryItem | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", category: "Spare Parts", description: "",
    quantity: 0, minQuantity: 5, maxQuantity: 100,
    unitPrice: 0, costPrice: 0, location: "",
    supplierName: "", supplierContact: "", supplierEmail: "",
    categoryId: "", productId: "",
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(LIMIT),
        ...(search   ? { search }           : {}),
        ...(category ? { category }         : {}),
        ...(filterCategoryId ? { categoryId: filterCategoryId } : {}),
        ...(filterProductId ? { productId: filterProductId } : {}),
        ...(filter === "low"  ? { lowStock: "true" }   : {}),
        ...(filter === "out"  ? { outOfStock: "true" } : {}),
      });
      const res  = await window.fetch(`/api/inventory?${params}`, { credentials: "include" });
      const data = await res.json();
      setItems(data.data?.inventory ?? []);
      setStats(data.data?.stats ?? null);
      setTotal(data.data?.pagination?.total ?? 0);
    } catch {
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, filter, filterCategoryId, filterProductId]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    window.fetch("/api/categories", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : [];
        setCategories(list.map((c: { _id: string; name: string }) => ({ _id: c._id, name: c.name })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.categoryId) { setProducts([]); return; }
    window.fetch(`/api/products?categoryId=${form.categoryId}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : [];
        setProducts(list.map((p: { _id: string; name: string; modelNumber?: string }) => ({ _id: p._id, name: p.name, modelNumber: p.modelNumber })));
      })
      .catch(() => setProducts([]));
  }, [form.categoryId]);

  useEffect(() => {
    if (!filterCategoryId) { setFilterProducts([]); return; }
    window.fetch(`/api/products?categoryId=${filterCategoryId}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d.data) ? d.data : [];
        setFilterProducts(list.map((p: { _id: string; name: string }) => ({ _id: p._id, name: p.name })));
      })
      .catch(() => setFilterProducts([]));
  }, [filterCategoryId]);

  const openAdd = () => {
    setForm({ name: "", sku: "", category: "Spare Parts", description: "", quantity: 0, minQuantity: 5, maxQuantity: 100, unitPrice: 0, costPrice: 0, location: "", supplierName: "", supplierContact: "", supplierEmail: "", categoryId: "", productId: "" });
    setEditItem(null);
    setShowAdd(true);
  };

  const openEdit = (item: InventoryItem) => {
    setForm({
      name: item.name, sku: item.sku, category: item.category, description: "",
      quantity: item.quantity, minQuantity: item.minQuantity, maxQuantity: item.maxQuantity,
      unitPrice: item.unitPrice, costPrice: item.costPrice, location: item.location ?? "",
      supplierName: item.supplier?.name ?? "", supplierContact: item.supplier?.contact ?? "", supplierEmail: item.supplier?.email ?? "",
      categoryId: "", productId: "",
    });
    setEditItem(item);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name, sku: form.sku, category: form.category,
        quantity: Number(form.quantity), minQuantity: Number(form.minQuantity), maxQuantity: Number(form.maxQuantity),
        unitPrice: Number(form.unitPrice), costPrice: Number(form.costPrice),
        location: form.location,
        supplier: form.supplierName ? { name: form.supplierName, contact: form.supplierContact, email: form.supplierEmail } : undefined,
        ...(form.categoryId ? { categoryId: form.categoryId } : {}),
        ...(form.productId ? { productId: form.productId } : {}),
      };
      const url    = editItem ? `/api/inventory/${editItem._id}` : "/api/inventory";
      const method = editItem ? "PATCH" : "POST";
      const res  = await window.fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowAdd(false);
      fetch();
    } catch (e: any) {
      alert(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this inventory item?")) return;
    await window.fetch(`/api/inventory/${id}`, { method: "DELETE", credentials: "include" });
    fetch();
  };

  const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Inventory</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage spare parts & service items</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetch} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard icon={<Package className="w-5 h-5" />}       color="bg-indigo-50 text-indigo-600" label="Total Items"     value={stats.totalItems}                         />
          <StatsCard icon={<TrendingDown className="w-5 h-5" />}  color="bg-amber-50 text-amber-600"  label="Low Stock"      value={stats.lowStockItems}  sub="Below min level" />
          <StatsCard icon={<AlertTriangle className="w-5 h-5" />} color="bg-red-50 text-red-500"      label="Out of Stock"   value={stats.outOfStockItems}                     />
          <StatsCard icon={<DollarSign className="w-5 h-5" />}    color="bg-green-50 text-green-600"  label="Inventory Value" value={fmtINR(stats.totalValue)}                 />
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or SKU..."
            className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="h-9 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white cursor-pointer">
          <option value="">All Types</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterCategoryId} onChange={e => { setFilterCategoryId(e.target.value); setFilterProductId(""); setPage(1); }}
          className="h-9 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white cursor-pointer">
          <option value="">All Brand Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {filterCategoryId && (
          <select value={filterProductId} onChange={e => { setFilterProductId(e.target.value); setPage(1); }}
            className="h-9 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white cursor-pointer">
            <option value="">All Products</option>
            {filterProducts.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        )}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(["all", "low", "out"] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer capitalize ${filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
              {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 p-4 text-red-600 text-sm border-b border-red-100 bg-red-50">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Item", "SKU", "Category", "Stock", "Unit Price", "Cost Price", "Location", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(9).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-slate-400 text-sm">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  No inventory items found.
                  <button onClick={openAdd} className="block mx-auto mt-2 text-indigo-600 hover:underline cursor-pointer text-xs">Add your first item</button>
                </td></tr>
              ) : items.map(item => {
                const st = stockStatus(item);
                return (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      {item.supplier?.name && <p className="text-[10px] text-slate-400">{item.supplier.name}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.sku}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.category}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-800">{item.quantity}</span>
                      <span className="text-[10px] text-slate-400 ml-1">/ min {item.minQuantity}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{fmtINR(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{fmtINR(item.costPrice)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.location ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 cursor-pointer transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 cursor-pointer transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Showing {(page-1)*LIMIT+1}–{Math.min(page*LIMIT, total)} of {total}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-40 cursor-pointer hover:bg-slate-50 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-slate-600">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-40 cursor-pointer hover:bg-slate-50 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">{editItem ? "Edit Item" : "Add Inventory Item"}</h2>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {categories.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Brand Category</label>
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value, productId: "" }))}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer">
                      <option value="">— Optional —</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Product</label>
                    <select value={form.productId} disabled={!form.categoryId}
                      onChange={e => {
                        const p = products.find(x => x._id === e.target.value);
                        setForm(f => ({
                          ...f,
                          productId: e.target.value,
                          name: p?.name ?? f.name,
                          sku: p?.modelNumber ? `SP-${p.modelNumber}` : f.sku,
                          category: "Spare Parts",
                        }));
                      }}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer disabled:opacity-50">
                      <option value="">— Select product —</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Item Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Display Panel"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">SKU *</label>
                  <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))}
                    placeholder="e.g. DSP-001"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white cursor-pointer">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Location / Shelf</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Rack A-3"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Quantity</label>
                  <input type="number" min={0} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Min Qty (alert)</label>
                  <input type="number" min={0} value={form.minQuantity} onChange={e => setForm(f => ({ ...f, minQuantity: +e.target.value }))}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Max Qty</label>
                  <input type="number" min={0} value={form.maxQuantity} onChange={e => setForm(f => ({ ...f, maxQuantity: +e.target.value }))}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Selling Price (₹)</label>
                  <input type="number" min={0} value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: +e.target.value }))}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Cost Price (₹)</label>
                  <input type="number" min={0} value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: +e.target.value }))}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              {/* Supplier */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Supplier (optional)</p>
                <div className="grid grid-cols-3 gap-4">
                  <input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))}
                    placeholder="Supplier name"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                  <input value={form.supplierContact} onChange={e => setForm(f => ({ ...f, supplierContact: e.target.value }))}
                    placeholder="Contact / phone"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                  <input value={form.supplierEmail} onChange={e => setForm(f => ({ ...f, supplierEmail: e.target.value }))}
                    placeholder="Email"
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setShowAdd(false)} className="h-9 px-4 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.sku}
                className="flex items-center gap-2 h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition disabled:opacity-60">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editItem ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
