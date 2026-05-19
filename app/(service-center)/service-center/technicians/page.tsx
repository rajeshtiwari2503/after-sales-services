 "use client";

// app/(service-center)/service-center/technicians/page.tsx  — REPLACE existing
// Changes:
//   1. Fetches /api/technicians — backend auto-scopes to this SC (via JWT serviceCenterId)
//   2. POST /api/technicians now sends serviceCenterId (fetched from /api/service-centers)
//   3. Shows which SC each technician belongs to

import { useState, useEffect } from "react";
import { Users, Plus, Star, Search, X, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Technician {
  _id: string;
  userId: { _id: string; name: string; email: string; phone?: string };
  employeeId: string;
  specializations: string[];
  serviceCenterId: { _id: string; name: string; code: string } | null;
  rating: number;
  totalTickets: number;
  completedTickets: number;
  availability: { isAvailable: boolean };
  isActive: boolean;
}

interface ServiceCenter {
  _id: string;
  name: string;
  code: string;
}

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const inputCls =
  "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10 transition";

export default function SCTechniciansPage() {
  const [techs, setTechs] = useState<Technician[]>([]);
  const [mySC, setMySC] = useState<ServiceCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", employeeId: "", specializations: "", password: "",
  });

  // Fetch SC operator's own SC + technicians
  const fetchData = async () => {
    setLoading(true);
    try {
      const [techRes, scRes] = await Promise.all([
        fetch("/api/technicians", { credentials: "include" }),
        fetch("/api/service-centers", { credentials: "include" }),
      ]);
      const [techData, scData] = await Promise.all([techRes.json(), scRes.json()]);
      setTechs(techData.data ?? []);
      // SC operator gets only their own SC
      const scs = scData.data ?? [];
      if (scs.length > 0) setMySC(scs[0]);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    if (!mySC) { toast.error("Could not determine your service center"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/technicians", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          employeeId: form.employeeId || undefined,
          password: form.password || undefined,
          specializations: form.specializations.split(",").map((s) => s.trim()).filter(Boolean),
          serviceCenterId: mySC._id,   // ← SC operator's own SC
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed");
      toast.success("Technician added");
      setShowAdd(false);
      setForm({ name: "", email: "", phone: "", employeeId: "", specializations: "", password: "" });
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to add technician");
    } finally {
      setSaving(false);
    }
  };

  const filtered = techs.filter(
    (t) =>
      !search ||
      t.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Technicians</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {mySC ? `${mySC.name} (${mySC.code})` : "Your service center"} · {techs.length} technicians
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add technician
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <p className="text-xs text-slate-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-800">{techs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <p className="text-xs text-slate-500 mb-1">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {techs.filter((t) => t.availability?.isAvailable).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <p className="text-xs text-slate-500 mb-1">Avg rating</p>
          <p className="text-2xl font-bold text-amber-600">
            {techs.length > 0
              ? (techs.reduce((s, t) => s + (t.rating ?? 0), 0) / techs.length).toFixed(1)
              : "—"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or employee ID..."
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
          onClick={fetchData}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Add technician</h2>
                {mySC && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Will be added to {mySC.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: "Full name *", key: "name", placeholder: "Amit Kumar", type: "text" },
                { label: "Email *", key: "email", placeholder: "amit@example.com", type: "email" },
                { label: "Password (optional)", key: "password", placeholder: "Default: TechPass123!", type: "password" },
                { label: "Phone", key: "phone", placeholder: "+91 98765 43210", type: "tel" },
                { label: "Employee ID", key: "employeeId", placeholder: "EMP-001", type: "text" },
                { label: "Specializations (comma separated)", key: "specializations", placeholder: "AC, Refrigerator", type: "text" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                    {label}
                  </label>
                  <input
                    className={inputCls}
                    type={type}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            {mySC && (
              <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-100 text-xs text-teal-700">
                <Users className="w-3.5 h-3.5 shrink-0" />
                {/* Will be assigned to <strong>{mySC.name} ({myNC?.code ?? myNC?.code})</strong> */}
                Will be assigned to <strong>{mySC.name} ({mySC?.code ?? mySC?.code})</strong>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-lg text-sm font-medium cursor-pointer"
              >
                {saving ? "Saving..." : "Add technician"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technician cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          : filtered.length === 0
          ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
              <Users className="w-10 h-10 text-slate-300" />
              <p className="text-slate-500 font-medium text-sm">No technicians found</p>
              <button
                onClick={() => setShowAdd(true)}
                className="text-xs text-teal-600 hover:underline cursor-pointer"
              >
                Add your first technician
              </button>
            </div>
          )
          : filtered.map((tech) => (
            <div
              key={tech._id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-teal-200 transition"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {initials(tech.userId?.name ?? "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {tech.userId?.name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-slate-400">{tech.employeeId}</p>
                  {tech.userId?.email && (
                    <p className="text-[10px] text-slate-400 truncate">{tech.userId.email}</p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${
                    tech.availability?.isAvailable
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {tech.availability?.isAvailable ? "Available" : "Busy"}
                </span>
              </div>

              {tech.specializations?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tech.specializations.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                  {tech.specializations.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{tech.specializations.length - 3}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-medium text-slate-700">{tech.rating?.toFixed(1) ?? "—"}</span>
                </div>
                <span>{tech.completedTickets ?? 0}/{tech.totalTickets ?? 0} completed</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}