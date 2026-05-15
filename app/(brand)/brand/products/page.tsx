"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Package, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  modelNumber: string;
  category: string;
  warrantyPeriod: number;
  isActive: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", modelNumber: "", category: "", warrantyPeriod: 12 });
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/warranty?search=${search}`, { credentials: "include" });
      const data = await res.json();
      setProducts(data.data?.items ?? data.data ?? []);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleAdd = async () => {
    if (!form.name || !form.modelNumber) { toast.error("Name and model number required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/warranty", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Product added");
      setShowAdd(false);
      setForm({ name: "", modelNumber: "", category: "", warrantyPeriod: 12 });
      fetchProducts();
    } catch { toast.error("Failed to add product"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/warranty/${id}`, { method: "DELETE", credentials: "include" });
      toast.success("Product deleted");
      fetchProducts();
    } catch { toast.error("Failed to delete"); }
  };

  const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition";

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Products & Models</h1>
          <p className="text-xs text-slate-400 mt-0.5">{products.length} products registered</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input type="text" placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>
        <button onClick={fetchProducts}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Add product modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Add product</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Product name *</label>
                <input className={inputCls} placeholder="e.g. Split AC 1.5 Ton" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Model number *</label>
                <input className={inputCls} placeholder="e.g. AC-1500-PRO" value={form.modelNumber} onChange={e => setForm(p => ({...p, modelNumber: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                  <select className={inputCls} value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                    <option value="">Select</option>
                    {["AC", "Refrigerator", "Washing Machine", "TV", "Microwave", "Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Warranty (months)</label>
                  <input type="number" className={inputCls} value={form.warrantyPeriod} onChange={e => setForm(p => ({...p, warrantyPeriod: Number(e.target.value)}))} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition cursor-pointer">
                {saving ? "Saving..." : "Add product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Product name", "Model", "Category", "Warranty", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}>
                {Array(6).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" /></td>
                ))}
              </tr>
            )) : products.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Package className="w-10 h-10 text-slate-300" />
                  <p className="text-slate-500 text-sm">No products found</p>
                </div>
              </td></tr>
            ) : products.map(p => (
              <tr key={p._id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-500">{p.modelNumber}</td>
                <td className="px-4 py-3 text-xs text-slate-500 capitalize">{p.category || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{p.warrantyPeriod} months</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${p.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}