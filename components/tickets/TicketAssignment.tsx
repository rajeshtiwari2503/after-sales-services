"use client";

import { useState, useEffect } from "react";
import { Wrench, Building2, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Person { id: string; name: string; email?: string }
interface Center { id: string; name: string; address?: string }

interface Props {
  ticketId: string;
  currentTechnicianId?: string;
  currentServiceCenterId?: string;
  onUpdate: () => void;
}

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export default function TicketAssignment({ ticketId, currentTechnicianId, currentServiceCenterId, onUpdate }: Props) {
  const [technicians, setTechnicians] = useState<Person[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedTech, setSelectedTech] = useState(currentTechnicianId ?? "");
  const [selectedCenter, setSelectedCenter] = useState(currentServiceCenterId ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [techRes, centerRes] = await Promise.all([
          fetch("/api/users?role=technician", { credentials: "include" }),
          fetch("/api/service-centers", { credentials: "include" }),
        ]);
        const [techData, centerData] = await Promise.all([techRes.json(), centerRes.json()]);
        setTechnicians((techData.data ?? techData.users ?? []).map((u: any) => ({ id: u._id, name: u.name, email: u.email })));
        setCenters((centerData.data ?? centerData.centers ?? []).map((c: any) => ({ id: c._id, name: c.name, address: c.address })));
      } catch {}
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(selectedTech ? { technicianId: selectedTech } : {}),
          ...(selectedCenter ? { serviceCenterId: selectedCenter } : {}),
        }),
      });
      if (!res.ok) throw new Error("Assignment failed");
      toast.success("Assignment updated");
      onUpdate();
    } catch {
      toast.error("Failed to update assignment");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = selectedTech !== (currentTechnicianId ?? "") || selectedCenter !== (currentServiceCenterId ?? "");
  const selectedTechObj = technicians.find((t) => t.id === selectedTech);
  const selectedCenterObj = centers.find((c) => c.id === selectedCenter);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Wrench className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Assignment</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Technician */}
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
                {selectedTechObj.email && <p className="text-[10px] text-blue-500 truncate">{selectedTechObj.email}</p>}
              </div>
              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            </div>
          )}
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Service Center */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            <Building2 className="w-3 h-3 inline mr-1" />
            Service Center
          </label>
          {selectedCenterObj && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded-lg border border-green-100">
              <Building2 className="w-4 h-4 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-800">{selectedCenterObj.name}</p>
                {selectedCenterObj.address && <p className="text-[10px] text-green-600 truncate">{selectedCenterObj.address}</p>}
              </div>
              <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
            </div>
          )}
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="">No service center</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Save */}
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving
              ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Check className="w-3.5 h-3.5" />
            }
            Save assignment
          </button>
        )}
      </div>
    </div>
  );
}