"use client";
import { useState, useEffect } from "react";
import { Building2, Plus, Search, Edit, Trash2, X, Globe, Mail, Phone, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Brand {
  _id: string;
  name: string;
  code: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
}

const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", code: "", description: "",
    contactEmail: "", contactPhone: "", website: "", tenantId: "",
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      // No brand API exists yet — use users with manager role as proxy
      const res = await fetch("/api/users?role=manager", { credentials: "include" });
      const data = await res.json();
      // Transform users to brand-like objects for display
      const brandList = (data.data ?? []).map((u: any) => ({
        _id: u._id, name: u.name, code: u.tenantId?.toUpperCase() ?? "—",
        contactEmail: u.email, tenantId: u.tenantId, isActive: u.isActive, createdAt: u.createdAt,
      }));
      setBrands(brandList);
    } catch { toast.error("Failed to load brands"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBrands(); }, []);

  const filtered = brands.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.contactEmail) { toast.error("Name and email required"); return; }
    setSaving(true);
    try {
      // Create brand manager user
      const res = await fetch("/api/auth/register", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.contactEmail,
          password: "TempPass123!", role: "manager",
          tenantId: form.tenantId || form.code.toLowerCase(),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Brand manager created");
      setShowAdd(false);
      setForm({ name: "", code: "", description: "", contactEmail: "", contactPhone: "", website: "", tenantId: "" });
      fetchBrands();
    } catch (e: any) { toast.error(e.message || "Failed to create brand"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Brands</h1>
          <p className="text-xs text-slate-400 mt-0.5">{brands.length} registered brands</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer">
          <Plus className="w-4 h-4" /> Add brand
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total brands", value: brands.length, color: "text-slate-800" },
          { label: "Active", value: brands.filter(b => b.isActive).length, color: "text-green-600" },
          { label: "Inactive", value: brands.filter(b => !b.isActive).length, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search brands..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>
        <button onClick={fetchBrands}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Add new brand</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Brand name *</label>
                <input className={inputCls} placeholder="e.g. CoolAir Technologies" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Brand code</label>
                <input className={inputCls} placeholder="e.g. COOLAIR" value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value.toUpperCase()}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Tenant ID</label>
                <input className={inputCls} placeholder="e.g. coolair-tenant" value={form.tenantId} onChange={e => setForm(p => ({...p, tenantId: e.target.value}))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Contact email * (manager login)</label>
                <input type="email" className={inputCls} placeholder="manager@brand.com" value={form.contactEmail} onChange={e => setForm(p => ({...p, contactEmail: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                <input className={inputCls} placeholder="+91 98765 43210" value={form.contactPhone} onChange={e => setForm(p => ({...p, contactPhone: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Website</label>
                <input className={inputCls} placeholder="https://brand.com" value={form.website} onChange={e => setForm(p => ({...p, website: e.target.value}))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                <input className={inputCls} placeholder="Brief description" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
              </div>
            </div>
            <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
              A brand manager account will be created with a temporary password: <code className="font-mono">TempPass123!</code>
            </p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer">Cancel</button>
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium cursor-pointer">
                {saving ? "Creating..." : "Create brand"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        )) : filtered.map(brand => (
          <div key={brand._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-indigo-200 transition group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials(brand.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-slate-800 truncate">{brand.name}</h3>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${brand.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {brand.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{brand.code}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer">
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500">
              {brand.contactEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{brand.contactEmail}</span>
                </div>
              )}
              {brand.contactPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{brand.contactPhone}</span>
                </div>
              )}
              {brand.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={brand.website} target="_blank" rel="noopener noreferrer"
                    className="truncate text-indigo-600 hover:underline">{brand.website}</a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
              <span>Tenant: {brand.tenantId}</span>
              <span>{fmtDate(brand.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}