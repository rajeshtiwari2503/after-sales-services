 "use client";

// app/(dashboard)/dashboard/service-centers/page.tsx  — REPLACE existing
// Changes:
//   1. tenantId removed from form — backend derives it from JWT (manager = own brand, admin can pass it)
//   2. Admin gets a tenantId field to create SC under any brand
//   3. Loads brands list for admin dropdown
//   4. Shows brand/tenantId in card footer
//   5. Edit modal added

import { useState, useEffect } from "react";
import {
  Building2, Plus, Search, Edit, Trash2, MapPin, Phone,
  Mail, Users, X, RefreshCw, Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface ServiceCenter {
  _id: string;
  name: string;
  code: string;
  tenantId: string;
  address: { street: string; city: string; state: string; postalCode: string; country: string };
  contact: { phone: string; email: string };
  capacity: number;
  services: string[];
  isActive: boolean;
  createdAt: string;
}

interface Brand {
  _id: string;
  name: string;
  tenantId?: string;
}

const inputCls =
  "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

const emptyForm = {
  name: "", code: "", tenantId: "",
  street: "", city: "", state: "", postalCode: "", country: "India",
  phone: "", email: "", capacity: 10, services: "",
};

export default function ServiceCentersPage() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [userRole, setUserRole] = useState<string>("manager");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceCenter | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Detect role from /api/auth/me (or read from a context/cookie)
  useEffect(() => {
    const detectRole = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        const role = data?.data?.role ?? data?.user?.role ?? "manager";
        setUserRole(role);
        // Admin: load brands for the dropdown
        if (role === "admin") {
          const bRes = await fetch("/api/brand", { credentials: "include" });
          const bData = await bRes.json();
          setBrands(bData.data ?? []);
        }
      } catch {}
    };
    detectRole();
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/service-centers?${params}`, { credentials: "include" });
      const data = await res.json();
      setCenters(data.data ?? []);
    } catch {
      toast.error("Failed to load service centers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCenters(); }, []);

  const filtered = centers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.city?.toLowerCase().includes(search.toLowerCase())
  );

  const buildBody = (f: typeof form) => ({
    name: f.name,
    code: f.code.toUpperCase(),
    ...(userRole === "admin" && f.tenantId ? { tenantId: f.tenantId } : {}),
    address: { street: f.street, city: f.city, state: f.state, postalCode: f.postalCode, country: f.country },
    contact: { phone: f.phone, email: f.email },
    capacity: Number(f.capacity),
    services: f.services.split(",").map((s) => s.trim()).filter(Boolean),
  });

  const handleAdd = async () => {
    if (!form.name || !form.code || !form.city) {
      toast.error("Name, code and city are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/service-centers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed");
      toast.success("Service center created");
      setShowAdd(false);
      setForm(emptyForm);
      fetchCenters();
    } catch (e: any) {
      toast.error(e.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget || !form.name || !form.city) {
      toast.error("Name and city are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/service-centers/${editTarget._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed");
      toast.success("Service center updated");
      setEditTarget(null);
      setForm(emptyForm);
      fetchCenters();
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (c: ServiceCenter) => {
    setEditTarget(c);
    setForm({
      name: c.name, code: c.code, tenantId: c.tenantId,
      street: c.address?.street ?? "", city: c.address?.city ?? "",
      state: c.address?.state ?? "", postalCode: c.address?.postalCode ?? "",
      country: c.address?.country ?? "India",
      phone: c.contact?.phone ?? "", email: c.contact?.email ?? "",
      capacity: c.capacity ?? 10,
      services: c.services?.join(", ") ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service center?")) return;
    try {
      const res = await fetch(`/api/service-centers/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      fetchCenters();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const FormModal = ({ title, onSave }: { title: string; onSave: () => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button
            onClick={() => { setShowAdd(false); setEditTarget(null); setForm(emptyForm); }}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Center name *</label>
            <input className={inputCls} placeholder="e.g. Delhi North Service Center"
              value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Code *</label>
            <input className={inputCls} placeholder="e.g. SC-001"
              value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Capacity</label>
            <input type="number" className={inputCls} value={form.capacity}
              onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))} />
          </div>

          {/* Admin only: brand picker */}
          {userRole === "admin" && (
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                Brand (admin only)
              </label>
              <select
                className={inputCls}
                value={form.tenantId}
                onChange={(e) => setForm((p) => ({ ...p, tenantId: e.target.value }))}
              >
                <option value="">— Select brand —</option>
                {brands.map((b) => (
                  <option key={b._id} value={b.tenantId ?? b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Street address</label>
            <input className={inputCls} placeholder="123, Main Street"
              value={form.street} onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">City *</label>
            <input className={inputCls} placeholder="Delhi"
              value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">State</label>
            <input className={inputCls} placeholder="Delhi"
              value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Pincode</label>
            <input className={inputCls} placeholder="110001"
              value={form.postalCode} onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
            <input className={inputCls} placeholder="+91 98765 43210"
              value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
            <input type="email" className={inputCls} placeholder="center@example.com"
              value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              Services (comma separated)
            </label>
            <input className={inputCls} placeholder="AC, Refrigerator, Washing Machine"
              value={form.services} onChange={(e) => setForm((p) => ({ ...p, services: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => { setShowAdd(false); setEditTarget(null); setForm(emptyForm); }}
            className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {saving ? "Saving..." : title}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Service Centers</h1>
          <p className="text-xs text-slate-400 mt-0.5">{centers.length} registered centers</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add center
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: centers.length, color: "text-slate-800" },
          { label: "Active", value: centers.filter((c) => c.isActive).length, color: "text-green-600" },
          { label: "Inactive", value: centers.filter((c) => !c.isActive).length, color: "text-red-500" },
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
            placeholder="Search by name, code, city..."
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
          onClick={fetchCenters}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Modals */}
      {showAdd && <FormModal title="Create center" onSave={handleAdd} />}
      {editTarget && <FormModal title="Update center" onSave={handleEdit} />}

      {/* Cards grid */}
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
              <p className="text-slate-500 font-medium text-sm">No service centers found</p>
            </div>
          )
          : filtered.map((center) => (
            <div key={center._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-indigo-200 transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {center.code}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                        center.isActive
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {center.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 truncate">{center.name}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEdit(center)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(center._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500">
                {center.address?.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{center.address.city}, {center.address.state}</span>
                  </div>
                )}
                {center.contact?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{center.contact.phone}</span>
                  </div>
                )}
                {center.contact?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{center.contact.email}</span>
                  </div>
                )}
              </div>

              {center.services?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100">
                  {center.services.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{s}</span>
                  ))}
                  {center.services.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{center.services.length - 3}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Capacity: {center.capacity}</span>
                </div>
                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                  {center.tenantId}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}