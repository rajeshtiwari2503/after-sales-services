"use client";
import { useState, useEffect } from "react";
import { Package2, Plus, Search, Edit, Trash2, X, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface ProductModel {
  _id: string;
  name: string;
  modelNumber: string;
  productName: string;
  category: string;
  specifications: { key: string; value: string }[];
  warrantyPeriod: number;
  isActive: boolean;
  createdAt: string;
}

const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition";

export default function ModelsPage() {
  const [models, setModels] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", modelNumber: "", productName: "",
    category: "", warrantyPeriod: "12",
    spec1Key: "", spec1Val: "", spec2Key: "", spec2Val: "",
  });

  const fetchModels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/warranty?${params}`, { credentials: "include" });
      const data = await res.json();
      setModels(data.data?.items ?? data.data ?? []);
    } catch { toast.error("Failed to load models"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchModels(); }, [search]);

  const handleAdd = async () => {
    if (!form.name || !form.modelNumber) { toast.error("Name and model number required"); return; }
    setSaving(true);
    try {
      const specs = [];
      if (form.spec1Key && form.spec1Val) specs.push({ key: form.spec1Key, value: form.spec1Val });
      if (form.spec2Key && form.spec2Val) specs.push({ key: form.spec2Key, value: form.spec2Val });
      const res = await fetch("/api/warranty", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, modelNumber: form.modelNumber,
          productName: form.productName, category: form.category,
          warrantyPeriod: Number(form.warrantyPeriod),
          specifications: specs,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Model added");
      setShowAdd(false);
      setForm({ name: "", modelNumber: "", productName: "", category: "", warrantyPeriod: "12", spec1Key: "", spec1Val: "", spec2Key: "", spec2Val: "" });
      fetchModels();
    } catch { toast.error("Failed to add model"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this model?")) return;
    try {
      await fetch(`/api/warranty/${id}`, { method: "DELETE", credentials: "include" });
      toast.success("Deleted");
      fetchModels();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Product Models</h1>
          <p className="text-xs text-slate-400 mt-0.5">{models.length} models registered</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer">
          <Plus className="w-4 h-4" /> Add model
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search models..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>
        <button onClick={fetchModels}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Add product model</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Model name *</label>
                <input className={inputCls} placeholder="Split AC 1.5T" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Model number *</label>
                <input className={inputCls} placeholder="AC-1500-PRO" value={form.modelNumber} onChange={e => setForm(p => ({...p, modelNumber: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Product name</label>
                <input className={inputCls} placeholder="AirCool Pro" value={form.productName} onChange={e => setForm(p => ({...p, productName: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                <select className={`${inputCls} cursor-pointer`} value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  <option value="">Select</option>
                  {["AC", "Refrigerator", "Washing Machine", "TV", "Microwave", "Other"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Warranty (months)</label>
                <input type="number" className={inputCls} value={form.warrantyPeriod} onChange={e => setForm(p => ({...p, warrantyPeriod: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Specifications</label>
              <div className="space-y-2">
                {[["spec1Key", "spec1Val"], ["spec2Key", "spec2Val"]].map(([keyField, valField], i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <input className={inputCls} placeholder="e.g. Capacity"
                      value={(form as any)[keyField]} onChange={e => setForm(p => ({...p, [keyField]: e.target.value}))} />
                    <input className={inputCls} placeholder="e.g. 1.5 Ton"
                      value={(form as any)[valField]} onChange={e => setForm(p => ({...p, [valField]: e.target.value}))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer">Cancel</button>
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium cursor-pointer">
                {saving ? "Saving..." : "Add model"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Models grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-full" />
          </div>
        )) : models.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200/80 py-16 text-center">
            <Package2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No models registered yet</p>
          </div>
        ) : models.map(model => (
          <div key={model._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-200 transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{model.modelNumber}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${model.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {model.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 truncate">{model.name}</h3>
                {model.productName && <p className="text-xs text-slate-500 mt-0.5">{model.productName}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(model._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="capitalize">{model.category || "—"}</span>
              <span>{model.warrantyPeriod} months warranty</span>
            </div>
            {model.specifications?.length > 0 && (
              <div className="mt-2 space-y-1">
                {model.specifications.slice(0, 2).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{s.key}</span>
                    <span className="text-slate-600 font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}