 "use client";

// components/tickets/TicketAssignment.tsx  — REPLACE existing file
// Changes:
//   1. Calls /api/tickets/[id]/assign  (PATCH) instead of /api/tickets/[id] (PATCH)
//   2. Technicians fetched from /api/technicians  (already RBAC-scoped by backend)
//   3. Service centers fetched from /api/service-centers  (already RBAC-scoped)
//   4. Technician list filtered per selected SC (for manager flow)
//   5. Shows "Assign to SC" and "Assign to Technician" as two clear modes

import { useState, useEffect } from "react";
import { Wrench, Building2, Check, ChevronDown, User, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface TechOption {
  id: string;
  name: string;
  email?: string;
  serviceCenterId?: string;
  scName?: string;
}

interface SCOption {
  id: string;
  name: string;
  code: string;
}

interface Props {
  ticketId: string;
  currentTechnicianId?: string;
  currentServiceCenterId?: string;
  onUpdate: () => void;
}

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export default function TicketAssignment({
  ticketId,
  currentTechnicianId,
  currentServiceCenterId,
  onUpdate,
}: Props) {
  const [technicians, setTechnicians] = useState<TechOption[]>([]);
  const [centers, setCenters] = useState<SCOption[]>([]);
  const [selectedTech, setSelectedTech] = useState(currentTechnicianId ?? "");
  const [selectedCenter, setSelectedCenter] = useState(currentServiceCenterId ?? "");
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"sc" | "tech">("tech");

  // Fetch both lists (backend already filters by role)
  useEffect(() => {
    const load = async () => {
      try {
        const [techRes, scRes] = await Promise.all([
          fetch("/api/technicians", { credentials: "include" }),
          fetch("/api/service-centers", { credentials: "include" }),
        ]);
        const [techData, scData] = await Promise.all([techRes.json(), scRes.json()]);

        // Technician model has userId populated
        const techs = (techData.data ?? []).map((t: any) => ({
          id: t._id,
          name: t.userId?.name ?? t.name ?? "Unknown",
          email: t.userId?.email ?? t.email,
          serviceCenterId: t.serviceCenterId?._id ?? t.serviceCenterId,
          scName: t.serviceCenterId?.name,
        }));

        const scs = (scData.data ?? []).map((c: any) => ({
          id: c._id,
          name: c.name,
          code: c.code,
        }));

        setTechnicians(techs);
        setCenters(scs);
      } catch {}
    };
    load();
  }, []);

  // When SC is selected in 'sc' mode, pre-filter techs for that SC
  const techsForSelectedSC = selectedCenter
    ? technicians.filter((t) => t.serviceCenterId === selectedCenter)
    : technicians;

  const handleSave = async () => {
    const body: Record<string, string> = {};
    if (mode === "sc") {
      if (!selectedCenter) { toast.error("Select a service center"); return; }
      body.serviceCenterId = selectedCenter;
    } else {
      if (!selectedTech && !selectedCenter) { toast.error("Select a technician or service center"); return; }
      if (selectedTech) body.technicianId = selectedTech;
      if (selectedCenter) body.serviceCenterId = selectedCenter;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? err.message ?? "Assignment failed");
      }
      toast.success(
        mode === "sc" ? "Ticket assigned to service center" : "Ticket assigned to technician"
      );
      onUpdate();
    } catch (e: any) {
      toast.error(e.message || "Failed to update assignment");
    } finally {
      setSaving(false);
    }
  };

  const selectedTechObj = technicians.find((t) => t.id === selectedTech);
  const selectedCenterObj = centers.find((c) => c.id === selectedCenter);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Wrench className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Assignment</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Mode tabs */}
        {centers.length > 0 && (
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setMode("tech")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition cursor-pointer ${
                mode === "tech"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <User className="w-3.5 h-3.5" /> Technician
            </button>
            <button
              onClick={() => setMode("sc")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition cursor-pointer border-l border-slate-200 ${
                mode === "sc"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Service Center
            </button>
          </div>
        )}

        {/* ── SC only mode ── */}
        {mode === "sc" && (
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Assign to Service Center
            </label>
            {selectedCenterObj && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded-lg border border-green-100">
                <Building2 className="w-4 h-4 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-800">{selectedCenterObj.name}</p>
                  <p className="text-[10px] text-green-600">{selectedCenterObj.code}</p>
                </div>
                <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
              </div>
            )}
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="">— Select service center —</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1.5">
              SC operator will then assign to a technician.
            </p>
          </div>
        )}

        {/* ── Tech mode ── */}
        {mode === "tech" && (
          <>
            {/* Optional: filter by SC first */}
            {centers.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  <Building2 className="w-3 h-3 inline mr-1" />
                  Filter by Service Center
                </label>
                <select
                  value={selectedCenter}
                  onChange={(e) => {
                    setSelectedCenter(e.target.value);
                    setSelectedTech(""); // reset tech when SC changes
                  }}
                  className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="">All service centers</option>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Technician picker */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Technician
              </label>
              {selectedTechObj && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-7 h-7 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {initials(selectedTechObj.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-800">{selectedTechObj.name}</p>
                    {selectedTechObj.scName && (
                      <p className="text-[10px] text-blue-500">{selectedTechObj.scName}</p>
                    )}
                  </div>
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                </div>
              )}
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="">— Select technician —</option>
                {techsForSelectedSC.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.scName ? ` · ${t.scName}` : ""}
                  </option>
                ))}
              </select>
              {selectedCenter && techsForSelectedSC.length === 0 && (
                <p className="text-[10px] text-amber-600 mt-1.5">
                  No technicians in this service center.
                </p>
              )}
            </div>
          </>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5" />
          )}
          {mode === "sc" ? "Route to Service Center" : "Assign Technician"}
        </button>
      </div>
    </div>
  );
}