// "use client";
// import { useState, useEffect } from "react";
// import { MapPin, Building2, Phone, Mail, Users, CheckCircle, XCircle, Plus, Search, X } from "lucide-react";
// import toast from "react-hot-toast";

// interface SC {
//   _id: string;
//   name: string;
//   code: string;
//   address: { city: string; state: string };
//   contact: { phone: string; email: string };
//   capacity: number;
//   services: string[];
//   isActive: boolean;
// }

// export default function BrandServiceCentersPage() {
//   const [centers, setCenters] = useState<SC[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [filterActive, setFilterActive] = useState<boolean | null>(null);

//   useEffect(() => {
//     fetch("/api/service-centers", { credentials: "include" })
//       .then(r => r.json()).then(d => setCenters(d.data ?? []))
//       .catch(() => toast.error("Failed to load service centers"))
//       .finally(() => setLoading(false));
//   }, []);

//   const filtered = centers.filter(c => {
//     const matchSearch = !search ||
//       c.name.toLowerCase().includes(search.toLowerCase()) ||
//       c.address?.city?.toLowerCase().includes(search.toLowerCase());
//     const matchActive = filterActive === null || c.isActive === filterActive;
//     return matchSearch && matchActive;
//   });

//   return (
//     <div className="max-w-6xl mx-auto space-y-5">
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Assigned Service Centers</h1>
//           <p className="text-xs text-slate-400 mt-0.5">{centers.length} service centers</p>
//         </div>
//         <button className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer">
//           <Plus className="w-4 h-4" /> Assign center
//         </button>
//       </div>

//       {/* Stats row */}
//       <div className="grid grid-cols-3 gap-4">
//         {[
//           { label: "Total assigned", value: centers.length, color: "text-slate-800" },
//           { label: "Active", value: centers.filter(c => c.isActive).length, color: "text-green-600" },
//           { label: "Inactive", value: centers.filter(c => !c.isActive).length, color: "text-red-500" },
//         ].map(({ label, value, color }) => (
//           <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4">
//             <p className="text-xs text-slate-500 mb-1">{label}</p>
//             <p className={`text-2xl font-bold ${color}`}>{value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
//         <div className="flex items-center gap-2 flex-1 min-w-[180px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
//           <Search className="w-3.5 h-3.5 text-slate-400" />
//           <input type="text" placeholder="Search by name, city..." value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
//           {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
//         </div>
//         {[
//           { label: "All", val: null },
//           { label: "Active", val: true },
//           { label: "Inactive", val: false },
//         ].map(({ label, val }) => (
//           <button key={label} onClick={() => setFilterActive(val)}
//             className={`h-9 px-3 rounded-lg border text-xs font-medium cursor-pointer transition
//               ${filterActive === val ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
//             {label}
//           </button>
//         ))}
//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {loading ? Array(6).fill(0).map((_, i) => (
//           <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
//             <div className="h-4 bg-slate-200 rounded w-3/4" />
//             <div className="h-3 bg-slate-100 rounded w-full" />
//             <div className="h-3 bg-slate-100 rounded w-2/3" />
//           </div>
//         )) : filtered.length === 0 ? (
//           <div className="col-span-full py-16 text-center">
//             <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
//             <p className="text-slate-500 text-sm">No service centers found</p>
//           </div>
//         ) : filtered.map(center => (
//           <div key={center._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-200 transition">
//             <div className="flex items-start justify-between mb-3">
//               <div className="min-w-0 flex-1">
//                 <div className="flex items-center gap-2 mb-1">
//                   <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{center.code}</span>
//                   {center.isActive
//                     ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
//                     : <XCircle className="w-3.5 h-3.5 text-red-400" />
//                   }
//                 </div>
//                 <h3 className="text-sm font-semibold text-slate-800 truncate">{center.name}</h3>
//               </div>
//             </div>
//             <div className="space-y-1.5 text-xs text-slate-500">
//               {center.address && (
//                 <div className="flex items-center gap-1.5">
//                   <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
//                   <span>{center.address.city}, {center.address.state}</span>
//                 </div>
//               )}
//               {center.contact?.phone && (
//                 <div className="flex items-center gap-1.5">
//                   <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
//                   <span>{center.contact.phone}</span>
//                 </div>
//               )}
//               {center.contact?.email && (
//                 <div className="flex items-center gap-1.5">
//                   <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
//                   <span className="truncate">{center.contact.email}</span>
//                 </div>
//               )}
//               <div className="flex items-center gap-1.5">
//                 <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
//                 <span>Capacity: {center.capacity} tickets/day</span>
//               </div>
//             </div>
//             {center.services?.length > 0 && (
//               <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100">
//                 {center.services.slice(0, 3).map(s => (
//                   <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{s}</span>
//                 ))}
//                 {center.services.length > 3 && (
//                   <span className="text-[10px] text-slate-400">+{center.services.length - 3} more</span>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";
// app/(brand)/brand/service-centers/page.tsx  — REPLACE existing
// Brand manager can: view their SCs, create new SC, and assign ticket to SC

import { useState, useEffect } from "react";
import { MapPin, Building2, Phone, Mail, Users, CheckCircle, XCircle, Plus, Search, X, RefreshCw, Check } from "lucide-react";
import toast from "react-hot-toast";

interface SC {
  _id: string;
  name: string;
  code: string;
  tenantId: string;
  address: { street?: string; city: string; state: string; postalCode?: string };
  contact: { phone: string; email: string };
  capacity: number;
  services: string[];
  isActive: boolean;
}

const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition text-slate-800";

const emptyForm = {
  name: "", code: "",
  street: "", city: "", state: "", postalCode: "", country: "India",
  phone: "", email: "",
  capacity: 10, services: "", servicePincodes: "",
};

export default function BrandServiceCentersPage() {
  const [centers, setCenters] = useState<SC[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

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

  const handleCreate = async () => {
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
        body: JSON.stringify({
          name: form.name,
          code: form.code.toUpperCase(),
          address: { street: form.street, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country },
          contact: { phone: form.phone, email: form.email },
          capacity: Number(form.capacity),
          services: form.services.split(",").map(s => s.trim()).filter(Boolean),
          servicePincodes: form.servicePincodes
            .split(",")
            .map((p) => p.trim().replace(/\D/g, "").slice(0, 6))
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed");
      toast.success("Service center created");
      setShowAdd(false);
      setForm(emptyForm);
      fetchCenters();
    } catch (e: any) { toast.error(e.message || "Failed to create"); }
    finally { setSaving(false); }
  };

  const filtered = centers.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.city?.toLowerCase().includes(search.toLowerCase());
    const matchActive = filterActive === null || c.isActive === filterActive;
    return matchSearch && matchActive;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Service Centers</h1>
          <p className="text-xs text-slate-400 mt-0.5">{centers.length} service centers in your brand</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer transition"
        >
          <Plus className="w-4 h-4" /> Add service center
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: centers.length, color: "text-slate-800" },
          { label: "Active", value: centers.filter(c => c.isActive).length, color: "text-green-600" },
          { label: "Inactive", value: centers.filter(c => !c.isActive).length, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search by name, code, city..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>
        {[{ label: "All", val: null }, { label: "Active", val: true }, { label: "Inactive", val: false }].map(({ label, val }) => (
          <button key={label} onClick={() => setFilterActive(val as any)}
            className={`h-9 px-3 rounded-lg border text-xs font-medium cursor-pointer transition ${filterActive === val ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {label}
          </button>
        ))}
        <button onClick={fetchCenters}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Add service center</h2>
              <button onClick={() => { setShowAdd(false); setForm(emptyForm); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Center name *</label>
                <input className={inputCls} placeholder="e.g. Delhi North Service Center"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Code *</label>
                <input className={inputCls} placeholder="e.g. SC-001"
                  value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Capacity/day</label>
                <input type="number" className={inputCls} value={form.capacity}
                  onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Street address</label>
                <input className={inputCls} placeholder="123, Main Street"
                  value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">City *</label>
                <input className={inputCls} placeholder="Delhi"
                  value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">State</label>
                <input className={inputCls} placeholder="Delhi"
                  value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Pincode</label>
                <input className={inputCls} placeholder="110001"
                  value={form.postalCode} onChange={e => setForm(p => ({ ...p, postalCode: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                <input className={inputCls} placeholder="+91 98765 43210"
                  value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" className={inputCls} placeholder="sc@brand.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Services (comma separated)</label>
                <input className={inputCls} placeholder="AC, Refrigerator, Washing Machine"
                  value={form.services} onChange={e => setForm(p => ({ ...p, services: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Service pincodes (comma separated)</label>
                <input className={inputCls} placeholder="110001, 110002, 1100"
                  value={form.servicePincodes} onChange={e => setForm(p => ({ ...p, servicePincodes: e.target.value }))} />
                <p className="text-[10px] text-slate-400 mt-1">Tickets with matching pincode auto-route to this center.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowAdd(false); setForm(emptyForm); }}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
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
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        )) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No service centers found</p>
            <button onClick={() => setShowAdd(true)} className="mt-2 text-xs text-blue-600 hover:underline cursor-pointer">
              Create your first service center
            </button>
          </div>
        ) : filtered.map(center => (
          <div key={center._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-200 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{center.code}</span>
                  {center.isActive
                    ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 truncate">{center.name}</h3>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-500">
              {center.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{center.address.city}, {center.address.state}</span>
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
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Capacity: {center.capacity} tickets/day</span>
              </div>
            </div>
            {center.services?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100">
                {center.services.slice(0, 3).map(s => (
                  <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{s}</span>
                ))}
                {center.services.length > 3 && <span className="text-[10px] text-slate-400">+{center.services.length - 3} more</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}