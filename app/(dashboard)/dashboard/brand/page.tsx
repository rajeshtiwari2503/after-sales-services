 "use client";

// app/(dashboard)/dashboard/brand/page.tsx  — REPLACE existing (was likely empty/placeholder)
// Super Admin brand management page
// Creates brand + brand manager user in one form via POST /api/brands

import { useState, useEffect } from "react";
import {
  Building2, Plus, Search, X, RefreshCw, Users,
  Mail, Phone, Globe, Check, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface Brand {
  _id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  categories: string[];
  managerId: { _id: string; name: string; email: string } | null;
  isActive: boolean;
  createdAt: string;
  tenantId?: string;
}

const inputCls =
  "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

const emptyForm = {
  // Brand
  name: "", contactEmail: "", contactPhone: "", address: "", categories: "",
  // Manager
  managerName: "", managerEmail: "", managerPassword: "",
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [createdBrand, setCreatedBrand] = useState<null | { name: string; slug: string; managerEmail: string; managerPassword: string }>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brands", { credentials: "include" });
      const data = await res.json();
      setBrands(data.data ?? []);
    } catch {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.contactEmail || !form.managerName || !form.managerEmail || !form.managerPassword) {
      toast.error("All required fields must be filled");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone || undefined,
          address: form.address || undefined,
          categories: form.categories.split(",").map((s) => s.trim()).filter(Boolean),
          managerName: form.managerName,
          managerEmail: form.managerEmail,
          managerPassword: form.managerPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed");

      // Show credentials to admin
      setCreatedBrand({
        name: form.name,
        slug: data.data?.tenant?.slug ?? "",
        managerEmail: form.managerEmail,
        managerPassword: form.managerPassword,
      });

      toast.success("Brand created successfully");
      setShowAdd(false);
      setForm(emptyForm);
      fetchBrands();
    } catch (e: any) {
      toast.error(e.message || "Failed to create brand");
    } finally {
      setSaving(false);
    }
  };

  const filtered = brands.filter(
    (b) =>
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Brands</h1>
          <p className="text-xs text-slate-400 mt-0.5">{brands.length} registered brands · Super Admin view</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New brand
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total brands", value: brands.length, color: "text-slate-800" },
          { label: "Active", value: brands.filter((b) => b.isActive !== false).length, color: "text-green-600" },
          { label: "With managers", value: brands.filter((b) => b.managerId).length, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
        <button
          onClick={fetchBrands}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Credentials flash */}
      {createdBrand && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-green-800">
              ✅ Brand "{createdBrand.name}" created — save these credentials:
            </p>
            <button onClick={() => setCreatedBrand(null)} className="text-green-600 hover:text-green-800 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded-lg border border-green-100 p-3 font-mono text-xs space-y-1">
            <p><span className="text-slate-500">Tenant ID :</span> <strong>{createdBrand.slug}</strong></p>
            <p><span className="text-slate-500">Manager   :</span> <strong>{createdBrand.managerEmail}</strong></p>
            <p><span className="text-slate-500">Password  :</span> <strong>{createdBrand.managerPassword}</strong></p>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 my-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Create new brand</h2>
                <p className="text-xs text-slate-400 mt-0.5">Creates brand + tenant + brand manager account</p>
              </div>
              <button
                onClick={() => { setShowAdd(false); setForm(emptyForm); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brand info */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Brand Information
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Brand name *</label>
                  <input className={inputCls} placeholder="e.g. Samsung India"
                    value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Contact email *</label>
                  <input type="email" className={inputCls} placeholder="support@brand.com"
                    value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                    <input className={inputCls} placeholder="+91 98765 43210"
                      value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Categories</label>
                    <input className={inputCls} placeholder="Electronics, HVAC"
                      value={form.categories} onChange={(e) => setForm((p) => ({ ...p, categories: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Address</label>
                  <input className={inputCls} placeholder="HQ address"
                    value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Brand Manager Account
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Manager name *</label>
                  <input className={inputCls} placeholder="John Doe"
                    value={form.managerName} onChange={(e) => setForm((p) => ({ ...p, managerName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Manager email *</label>
                  <input type="email" className={inputCls} placeholder="manager@brand.com"
                    value={form.managerEmail} onChange={(e) => setForm((p) => ({ ...p, managerEmail: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Manager password *</label>
                  <input type="password" className={inputCls} placeholder="Min 8 characters"
                    value={form.managerPassword} onChange={(e) => setForm((p) => ({ ...p, managerPassword: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowAdd(false); setForm(emptyForm); }}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Check className="w-4 h-4" />}
                {saving ? "Creating..." : "Create brand"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-full" />
              </div>
            ))
          : filtered.length === 0
          ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
              <Building2 className="w-10 h-10 text-slate-300" />
              <p className="text-slate-500 font-medium text-sm">No brands yet</p>
              <button
                onClick={() => setShowAdd(true)}
                className="text-xs text-indigo-600 hover:underline cursor-pointer"
              >
                Create your first brand
              </button>
            </div>
          )
          : filtered.map((brand) => (
            <div key={brand._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-indigo-200 transition group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {initials(brand.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 truncate">{brand.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {brand.tenantId ?? brand._id}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${
                    brand.isActive !== false
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {brand.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 mb-3">
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
              </div>

              {/* Manager */}
              {brand.managerId && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {initials(brand.managerId.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-700 truncate">{brand.managerId.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{brand.managerId.email}</p>
                  </div>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">Manager</span>
                </div>
              )}

              {brand.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {brand.categories.slice(0, 3).map((c) => (
                    <span key={c} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Created {fmtDate(brand.createdAt)}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}