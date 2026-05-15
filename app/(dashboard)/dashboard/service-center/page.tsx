 "use client";
import { useState, useEffect } from "react";
import { Building2, Plus, Search, Edit, Trash2, MapPin, Phone, Mail, Users, X, RefreshCw } from "lucide-react";
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

const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

export default function ServiceCentersPage() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", code: "", tenantId: "default",
    street: "", city: "", state: "", postalCode: "", country: "India",
    phone: "", email: "", capacity: 10, services: "",
  });

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/service-centers", { credentials: "include" });
      const data = await res.json();
      setCenters(data.data ?? []);
    } catch { toast.error("Failed to load service centers"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCenters(); }, []);

  const filtered = centers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.code || !form.city) { toast.error("Name, code and city required"); return; }
    setSaving(true);
    try {
      const body = {
        name: form.name, code: form.code.toUpperCase(), tenantId: form.tenantId,
        address: { street: form.street, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country },
        contact: { phone: form.phone, email: form.email },
        capacity: Number(form.capacity),
        services: form.services.split(",").map(s => s.trim()).filter(Boolean),
      };
      const res = await fetch("/api/service-centers", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Service center created");
      setShowAdd(false);
      fetchCenters();
    } catch (e: any) { toast.error(e.message || "Failed to create"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service center?")) return;
    try {
      await fetch(`/api/service-centers/${id}`, { method: "DELETE", credentials: "include" });
      toast.success("Deleted");
      fetchCenters();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Service Centers</h1>
          <p className="text-xs text-slate-400 mt-0.5">{centers.length} registered centers</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer">
          <Plus className="w-4 h-4" /> Add center
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: centers.length, color: "text-slate-800" },
          { label: "Active", value: centers.filter(c => c.isActive).length, color: "text-green-600" },
          { label: "Inactive", value: centers.filter(c => !c.isActive).length, color: "text-red-500" },
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
          <input type="text" placeholder="Search by name, code, city..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>
        <button onClick={fetchCenters} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Add service center</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Center name *</label>
                <input className={inputCls} placeholder="e.g. Delhi North Service Center" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Code *</label>
                <input className={inputCls} placeholder="e.g. DEL-N-01" value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Capacity</label>
                <input type="number" className={inputCls} value={form.capacity} onChange={e => setForm(p => ({...p, capacity: Number(e.target.value)}))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Street address</label>
                <input className={inputCls} placeholder="123, Main Street" value={form.street} onChange={e => setForm(p => ({...p, street: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">City *</label>
                <input className={inputCls} placeholder="Delhi" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">State</label>
                <input className={inputCls} placeholder="Delhi" value={form.state} onChange={e => setForm(p => ({...p, state: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Pincode</label>
                <input className={inputCls} placeholder="110001" value={form.postalCode} onChange={e => setForm(p => ({...p, postalCode: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                <input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" className={inputCls} placeholder="center@example.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Services (comma separated)</label>
                <input className={inputCls} placeholder="AC, Refrigerator, Washing Machine" value={form.services} onChange={e => setForm(p => ({...p, services: e.target.value}))} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium cursor-pointer">
                {saving ? "Creating..." : "Create center"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-full" />
          </div>
        )) : filtered.map(center => (
          <div key={center._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-indigo-200 transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{center.code}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${center.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {center.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 truncate">{center.name}</h3>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(center._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500">
              {center.address && (
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
                {center.services.slice(0, 3).map(s => (
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
              <span>Tenant: {center.tenantId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}