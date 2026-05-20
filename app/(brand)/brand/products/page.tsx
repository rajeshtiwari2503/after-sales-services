// "use client";
// import { useState, useEffect } from "react";
// import { Plus, Search, Edit, Trash2, Package, RefreshCw, X } from "lucide-react";
// import toast from "react-hot-toast";

// interface Product {
//   _id: string;
//   name: string;
//   modelNumber: string;
//   category: string;
//   warrantyPeriod: number;
//   isActive: boolean;
//   createdAt: string;
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [showAdd, setShowAdd] = useState(false);
//   const [form, setForm] = useState({ name: "", modelNumber: "", category: "", warrantyPeriod: 12 });
//   const [saving, setSaving] = useState(false);

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/warranty?search=${search}`, { credentials: "include" });
//       const data = await res.json();
//       setProducts(data.data?.items ?? data.data ?? []);
//     } catch { toast.error("Failed to load products"); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { fetchProducts(); }, [search]);

//   const handleAdd = async () => {
//     if (!form.name || !form.modelNumber) { toast.error("Name and model number required"); return; }
//     setSaving(true);
//     try {
//       const res = await fetch("/api/warranty", {
//         method: "POST", credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) throw new Error();
//       toast.success("Product added");
//       setShowAdd(false);
//       setForm({ name: "", modelNumber: "", category: "", warrantyPeriod: 12 });
//       fetchProducts();
//     } catch { toast.error("Failed to add product"); }
//     finally { setSaving(false); }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Delete this product?")) return;
//     try {
//       await fetch(`/api/warranty/${id}`, { method: "DELETE", credentials: "include" });
//       toast.success("Product deleted");
//       fetchProducts();
//     } catch { toast.error("Failed to delete"); }
//   };

//   const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition";

//   return (
//     <div className="max-w-6xl mx-auto space-y-5">
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Products & Models</h1>
//           <p className="text-xs text-slate-400 mt-0.5">{products.length} products registered</p>
//         </div>
//         <button onClick={() => setShowAdd(true)}
//           className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
//           <Plus className="w-4 h-4" /> Add product
//         </button>
//       </div>

//       {/* Search + filters */}
//       <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3">
//         <div className="flex items-center gap-2 flex-1 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
//           <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
//           <input type="text" placeholder="Search products..." value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
//           {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
//         </div>
//         <button onClick={fetchProducts}
//           className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
//           <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
//         </button>
//       </div>

//       {/* Add product modal */}
//       {showAdd && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-base font-semibold text-slate-800">Add product</h2>
//               <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Product name *</label>
//                 <input className={inputCls} placeholder="e.g. Split AC 1.5 Ton" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Model number *</label>
//                 <input className={inputCls} placeholder="e.g. AC-1500-PRO" value={form.modelNumber} onChange={e => setForm(p => ({...p, modelNumber: e.target.value}))} />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
//                   <select className={inputCls} value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
//                     <option value="">Select</option>
//                     {["AC", "Refrigerator", "Washing Machine", "TV", "Microwave", "Other"].map(c => <option key={c}>{c}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Warranty (months)</label>
//                   <input type="number" className={inputCls} value={form.warrantyPeriod} onChange={e => setForm(p => ({...p, warrantyPeriod: Number(e.target.value)}))} />
//                 </div>
//               </div>
//             </div>
//             <div className="flex gap-2 pt-2">
//               <button onClick={() => setShowAdd(false)}
//                 className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer">
//                 Cancel
//               </button>
//               <button onClick={handleAdd} disabled={saving}
//                 className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition cursor-pointer">
//                 {saving ? "Saving..." : "Add product"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className="bg-slate-50 border-b border-slate-100">
//               {["Product name", "Model", "Category", "Warranty", "Status", "Actions"].map(h => (
//                 <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? Array(5).fill(0).map((_, i) => (
//               <tr key={i}>
//                 {Array(6).fill(0).map((_, j) => (
//                   <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" /></td>
//                 ))}
//               </tr>
//             )) : products.length === 0 ? (
//               <tr><td colSpan={6}>
//                 <div className="flex flex-col items-center justify-center py-16 gap-3">
//                   <Package className="w-10 h-10 text-slate-300" />
//                   <p className="text-slate-500 text-sm">No products found</p>
//                 </div>
//               </td></tr>
//             ) : products.map(p => (
//               <tr key={p._id} className="hover:bg-slate-50 transition">
//                 <td className="px-4 py-3 text-sm font-medium text-slate-800">{p.name}</td>
//                 <td className="px-4 py-3 text-xs font-mono text-slate-500">{p.modelNumber}</td>
//                 <td className="px-4 py-3 text-xs text-slate-500 capitalize">{p.category || "—"}</td>
//                 <td className="px-4 py-3 text-xs text-slate-500">{p.warrantyPeriod} months</td>
//                 <td className="px-4 py-3">
//                   <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${p.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
//                     {p.isActive ? "Active" : "Inactive"}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-1">
//                     <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer">
//                       <Edit className="w-3.5 h-3.5" />
//                     </button>
//                     <button onClick={() => handleDelete(p._id)}
//                       className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer">
//                       <Trash2 className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";
// app/(brand)/brand/products/page.tsx  — REPLACE existing
// Tabs: Categories (with fault management) | Products
// Categories tab: create categories, add/remove faults per category
// Products tab: create products linked to a category

import { useState, useEffect } from "react";
import {
  Plus, Search, Edit, Trash2, Package, RefreshCw, X,
  Tag, Zap, ChevronDown, ChevronRight, Check, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Fault {
  _id: string;
  name: string;
  description?: string;
  severity: "low" | "medium" | "high" | "critical";
}
interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  faults: Fault[];
  isActive: boolean;
}
interface Product {
  _id: string;
  name: string;
  modelNumber: string;
  categoryId: { _id: string; name: string; slug: string; faults: Fault[] } | null;
  description?: string;
  warrantyPeriod: number;
  isActive: boolean;
  createdAt: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const SEVERITY_CFG: Record<string, { label: string; cls: string }> = {
  low:      { label: "Low",      cls: "bg-green-50 text-green-700 border-green-100" },
  medium:   { label: "Medium",   cls: "bg-amber-50 text-amber-700 border-amber-100" },
  high:     { label: "High",     cls: "bg-orange-50 text-orange-700 border-orange-100" },
  critical: { label: "Critical", cls: "bg-red-50 text-red-700 border-red-100" },
};

const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition text-slate-800";

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const [tab, setTab] = useState<"categories" | "products">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingProd, setLoadingProd] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  // Category form
  const [showAddCat, setShowAddCat] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [catFaults, setCatFaults] = useState<{ name: string; description: string; severity: string }[]>([]);
  const [savingCat, setSavingCat] = useState(false);

  // Edit category (fault management)
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editFaults, setEditFaults] = useState<Fault[]>([]);
  const [newFault, setNewFault] = useState({ name: "", description: "", severity: "medium" });
  const [savingEditCat, setSavingEditCat] = useState(false);

  // Product form
  const [showAddProd, setShowAddProd] = useState(false);
  const [prodForm, setProdForm] = useState({ name: "", modelNumber: "", categoryId: "", description: "", warrantyPeriod: 12 });
  const [savingProd, setSavingProd] = useState(false);

  /* ─── Fetchers ──────────────────────────────────────────────────────────── */
  const fetchCategories = async () => {
    setLoadingCat(true);
    try {
      const res = await fetch("/api/categories", { credentials: "include" });
      const data = await res.json();
      setCategories(data.data ?? []);
    } catch { toast.error("Failed to load categories"); }
    finally { setLoadingCat(false); }
  };

  const fetchProducts = async () => {
    setLoadingProd(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/products?${params}`, { credentials: "include" });
      const data = await res.json();
      setProducts(data.data ?? []);
    } catch { toast.error("Failed to load products"); }
    finally { setLoadingProd(false); }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { if (tab === "products") fetchProducts(); }, [tab, search]);

  /* ─── Category handlers ─────────────────────────────────────────────────── */
  const handleAddFaultRow = () =>
    setCatFaults(p => [...p, { name: "", description: "", severity: "medium" }]);

  const handleRemoveFaultRow = (i: number) =>
    setCatFaults(p => p.filter((_, idx) => idx !== i));

  const handleCreateCategory = async () => {
    if (!catForm.name) { toast.error("Category name is required"); return; }
    const validFaults = catFaults.filter(f => f.name.trim());
    setSavingCat(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...catForm, faults: validFaults }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed");
      toast.success("Category created");
      setShowAddCat(false);
      setCatForm({ name: "", description: "" });
      setCatFaults([]);
      fetchCategories();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSavingCat(false); }
  };

  const openEditCat = (cat: Category) => {
    setEditCat(cat);
    setEditFaults([...cat.faults]);
    setNewFault({ name: "", description: "", severity: "medium" });
  };

  const handleAddFaultToEdit = () => {
    if (!newFault.name.trim()) { toast.error("Fault name required"); return; }
    setEditFaults(p => [...p, { _id: `temp-${Date.now()}`, ...newFault } as Fault]);
    setNewFault({ name: "", description: "", severity: "medium" });
  };

  const handleSaveEditCat = async () => {
    if (!editCat) return;
    setSavingEditCat(true);
    try {
      const res = await fetch(`/api/categories/${editCat._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editCat.name,
          description: editCat.description,
          faults: editFaults.map(f => ({ name: f.name, description: f.description, severity: f.severity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed");
      toast.success("Category updated");
      setEditCat(null);
      fetchCategories();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSavingEditCat(false); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Category deleted");
      fetchCategories();
    } catch { toast.error("Failed to delete"); }
  };

  /* ─── Product handlers ──────────────────────────────────────────────────── */
  const handleCreateProduct = async () => {
    if (!prodForm.name || !prodForm.modelNumber || !prodForm.categoryId) {
      toast.error("Name, model number, and category are required");
      return;
    }
    setSavingProd(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prodForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed");
      toast.success("Product added");
      setShowAddProd(false);
      setProdForm({ name: "", modelNumber: "", categoryId: "", description: "", warrantyPeriod: 12 });
      fetchProducts();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSavingProd(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" });
      toast.success("Product deleted");
      fetchProducts();
    } catch { toast.error("Failed to delete"); }
  };

  /* ─── Filtered lists ────────────────────────────────────────────────────── */
  const filteredCats = categories.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ─── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Products & Categories</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {categories.length} categories · {products.length} products
          </p>
        </div>
        <button
          onClick={() => tab === "categories" ? setShowAddCat(true) : setShowAddProd(true)}
          className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          {tab === "categories" ? "Add category" : "Add product"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        {(["categories", "products"] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(""); }}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition cursor-pointer ${
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "categories" ? "Categories & Faults" : "Products"}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input type="text" placeholder={`Search ${tab}...`} value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>
        <button onClick={tab === "categories" ? fetchCategories : fetchProducts}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${(loadingCat || loadingProd) ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ══════ CATEGORIES TAB ══════ */}
      {tab === "categories" && (
        <>
          {/* Add category modal */}
          {showAddCat && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-800">Add category</h2>
                  <button onClick={() => { setShowAddCat(false); setCatFaults([]); setCatForm({ name: "", description: "" }); }}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Category name *</label>
                    <input className={inputCls} placeholder="e.g. Air Conditioner"
                      value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                    <input className={inputCls} placeholder="Short description"
                      value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} />
                  </div>

                  {/* Faults */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Fault types <span className="text-slate-400 normal-case">(optional)</span>
                      </label>
                      <button onClick={handleAddFaultRow}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                        <Plus className="w-3 h-3" /> Add fault
                      </button>
                    </div>
                    {catFaults.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No faults added yet. Click "Add fault" to define common issues.</p>
                    )}
                    <div className="space-y-2">
                      {catFaults.map((f, i) => (
                        <div key={i} className="flex gap-2 items-start p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input className={inputCls} placeholder="Fault name *" value={f.name}
                              onChange={e => setCatFaults(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                            <select className={inputCls} value={f.severity}
                              onChange={e => setCatFaults(p => p.map((x, j) => j === i ? { ...x, severity: e.target.value } : x))}>
                              {["low", "medium", "high", "critical"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                            </select>
                            <input className={`${inputCls} col-span-2`} placeholder="Description (optional)" value={f.description}
                              onChange={e => setCatFaults(p => p.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} />
                          </div>
                          <button onClick={() => handleRemoveFaultRow(i)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer mt-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setShowAddCat(false); setCatFaults([]); setCatForm({ name: "", description: "" }); }}
                    className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button onClick={handleCreateCategory} disabled={savingCat}
                    className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
                    {savingCat ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    {savingCat ? "Creating..." : "Create category"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit category / faults modal */}
          {editCat && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-800">Edit: {editCat.name}</h2>
                  <button onClick={() => setEditCat(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Category name</label>
                    <input className={inputCls} value={editCat.name}
                      onChange={e => setEditCat(p => p ? { ...p, name: e.target.value } : p)} />
                  </div>

                  {/* Existing faults */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Fault types</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {editFaults.map((f, i) => (
                        <div key={f._id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 group">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input className={inputCls} value={f.name}
                              onChange={e => setEditFaults(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                            <select className={inputCls} value={f.severity}
                              onChange={e => setEditFaults(p => p.map((x, j) => j === i ? { ...x, severity: e.target.value as any } : x))}>
                              {["low", "medium", "high", "critical"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                            </select>
                          </div>
                          <button onClick={() => setEditFaults(p => p.filter((_, j) => j !== i))}
                            className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer opacity-0 group-hover:opacity-100 transition">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add new fault row */}
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100 grid grid-cols-2 gap-2">
                      <input className={inputCls} placeholder="New fault name" value={newFault.name}
                        onChange={e => setNewFault(p => ({ ...p, name: e.target.value }))} />
                      <select className={inputCls} value={newFault.severity}
                        onChange={e => setNewFault(p => ({ ...p, severity: e.target.value }))}>
                        {["low", "medium", "high", "critical"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                      <input className={`${inputCls} col-span-2`} placeholder="Description (optional)" value={newFault.description}
                        onChange={e => setNewFault(p => ({ ...p, description: e.target.value }))} />
                      <button onClick={handleAddFaultToEdit}
                        className="col-span-2 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer flex items-center justify-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add fault
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditCat(null)}
                    className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button onClick={handleSaveEditCat} disabled={savingEditCat}
                    className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
                    {savingEditCat ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Category list */}
          <div className="space-y-3">
            {loadingCat ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse h-16" />
            )) : filteredCats.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/80 py-16 text-center">
                <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No categories yet</p>
                <button onClick={() => setShowAddCat(true)} className="mt-2 text-xs text-blue-600 hover:underline cursor-pointer">
                  Create your first category
                </button>
              </div>
            ) : filteredCats.map(cat => (
              <div key={cat._id} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                {/* Category header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => setExpandedCat(expandedCat === cat._id ? null : cat._id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                    <p className="text-xs text-slate-400">{cat.faults.length} fault types defined</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); openEditCat(cat); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteCategory(cat._id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {expandedCat === cat._id
                      ? <ChevronDown className="w-4 h-4 text-slate-400" />
                      : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded: faults list */}
                {expandedCat === cat._id && (
                  <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                    {cat.faults.length === 0 ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        No faults defined. Click Edit to add fault types.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.faults.map(f => (
                          <div key={f._id} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200">
                            <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-700">{f.name}</p>
                              {f.description && <p className="text-[10px] text-slate-400 truncate">{f.description}</p>}
                            </div>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${SEVERITY_CFG[f.severity]?.cls}`}>
                              {SEVERITY_CFG[f.severity]?.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══════ PRODUCTS TAB ══════ */}
      {tab === "products" && (
        <>
          {/* Add product modal */}
          {showAddProd && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 my-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-800">Add product</h2>
                  <button onClick={() => setShowAddProd(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Category *</label>
                    <select className={inputCls} value={prodForm.categoryId}
                      onChange={e => setProdForm(p => ({ ...p, categoryId: e.target.value }))}>
                      <option value="">— Select category —</option>
                      {categories.filter(c => c.isActive).map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  {[
                    { label: "Product name *", key: "name", placeholder: "e.g. Split AC 1.5 Ton" },
                    { label: "Model number *", key: "modelNumber", placeholder: "e.g. AC-1500-PRO" },
                    { label: "Description", key: "description", placeholder: "Short description" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
                      <input className={inputCls} placeholder={placeholder}
                        value={(prodForm as any)[key]}
                        onChange={e => setProdForm(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Warranty (months)</label>
                    <input type="number" className={inputCls} value={prodForm.warrantyPeriod}
                      onChange={e => setProdForm(p => ({ ...p, warrantyPeriod: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowAddProd(false)}
                    className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button onClick={handleCreateProduct} disabled={savingProd}
                    className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
                    {savingProd ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    {savingProd ? "Saving..." : "Add product"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products table */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Product", "Model", "Category", "Faults", "Warranty", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingProd ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>{Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" /></td>
                    ))}</tr>
                  )) : products.length === 0 ? (
                    <tr><td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Package className="w-10 h-10 text-slate-300" />
                        <p className="text-slate-500 text-sm">No products found</p>
                        <button onClick={() => setShowAddProd(true)} className="text-xs text-blue-600 hover:underline cursor-pointer">Add your first product</button>
                      </div>
                    </td></tr>
                  ) : products.map(p => {
                    const faults = p.categoryId?.faults ?? [];
                    return (
                      <tr key={p._id} className="hover:bg-slate-50 transition group">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{p.name}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">{p.modelNumber}</td>
                        <td className="px-4 py-3">
                          {p.categoryId ? (
                            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{p.categoryId.name}</span>
                          ) : <span className="text-xs text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {faults.length > 0
                            ? <span className="text-amber-600 font-medium">{faults.length} faults</span>
                            : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{p.warrantyPeriod}m</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${p.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteProduct(p._id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer opacity-0 group-hover:opacity-100 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}