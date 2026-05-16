"use client";
import { useState, useEffect } from "react";
import { MapPin, Building2, Phone, Mail, Users, CheckCircle, XCircle, Plus, Search, X } from "lucide-react";
import toast from "react-hot-toast";

interface SC {
  _id: string;
  name: string;
  code: string;
  address: { city: string; state: string };
  contact: { phone: string; email: string };
  capacity: number;
  services: string[];
  isActive: boolean;
}

export default function BrandServiceCentersPage() {
  const [centers, setCenters] = useState<SC[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/service-centers", { credentials: "include" })
      .then(r => r.json()).then(d => setCenters(d.data ?? []))
      .catch(() => toast.error("Failed to load service centers"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = centers.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.city?.toLowerCase().includes(search.toLowerCase());
    const matchActive = filterActive === null || c.isActive === filterActive;
    return matchSearch && matchActive;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Assigned Service Centers</h1>
          <p className="text-xs text-slate-400 mt-0.5">{centers.length} service centers</p>
        </div>
        <button className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer">
          <Plus className="w-4 h-4" /> Assign center
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total assigned", value: centers.length, color: "text-slate-800" },
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
          <input type="text" placeholder="Search by name, city..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>
        {[
          { label: "All", val: null },
          { label: "Active", val: true },
          { label: "Inactive", val: false },
        ].map(({ label, val }) => (
          <button key={label} onClick={() => setFilterActive(val)}
            className={`h-9 px-3 rounded-lg border text-xs font-medium cursor-pointer transition
              ${filterActive === val ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
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
          </div>
        ) : filtered.map(center => (
          <div key={center._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-200 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{center.code}</span>
                  {center.isActive
                    ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    : <XCircle className="w-3.5 h-3.5 text-red-400" />
                  }
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
                {center.services.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{center.services.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}