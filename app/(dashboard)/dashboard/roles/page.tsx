"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Save, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ROLES = [
  { key: "admin", label: "Super Admin", color: "bg-purple-50 text-purple-700 border-purple-100" },
  { key: "manager", label: "Brand Manager", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { key: "service_center", label: "Service Center", color: "bg-teal-50 text-teal-700 border-teal-100" },
  { key: "technician", label: "Technician", color: "bg-amber-50 text-amber-700 border-amber-100" },
  { key: "customer", label: "Customer", color: "bg-slate-100 text-slate-600 border-slate-200" },
];

const PERMISSIONS = [
  { section: "Tickets", perms: [
    { key: "CREATE_TICKET", label: "Create tickets" },
    { key: "VIEW_TICKETS", label: "View all tickets" },
    { key: "EDIT_TICKET", label: "Edit ticket details" },
    { key: "DELETE_TICKET", label: "Delete tickets" },
    { key: "ASSIGN_TICKETS", label: "Assign tickets" },
    { key: "UPDATE_STATUS", label: "Update ticket status" },
  ]},
  { section: "Users", perms: [
    { key: "VIEW_USERS", label: "View users" },
    { key: "CREATE_USER", label: "Create users" },
    { key: "EDIT_USER", label: "Edit users" },
    { key: "DELETE_USER", label: "Delete users" },
    { key: "MANAGE_ROLES", label: "Manage roles" },
  ]},
  { section: "Service Center", perms: [
    { key: "VIEW_SC", label: "View service centers" },
    { key: "MANAGE_SC", label: "Manage service centers" },
    { key: "VIEW_INVENTORY", label: "View inventory" },
    { key: "MANAGE_INVENTORY", label: "Manage inventory" },
    { key: "VIEW_WALLET", label: "View wallet" },
  ]},
  { section: "Analytics", perms: [
    { key: "VIEW_ANALYTICS", label: "View analytics" },
    { key: "EXPORT_REPORTS", label: "Export reports" },
    { key: "VIEW_AUDIT_LOGS", label: "View audit logs" },
  ]},
  { section: "Platform", perms: [
    { key: "MANAGE_BRANDS", label: "Manage brands" },
    { key: "SYSTEM_CONFIG", label: "System configuration" },
    { key: "MANAGE_WARRANTY", label: "Manage warranties" },
    { key: "MANAGE_SLA", label: "Configure SLA" },
  ]},
];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState("manager");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roles/permissions", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPermissions(data.data?.permissions ?? {});
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const isAdmin = selectedRole === "admin";
  const currentPerms = permissions[selectedRole] ?? [];
  const hasPerm = (key: string) => isAdmin || currentPerms.includes(key) || currentPerms.includes("ALL");

  const togglePerm = (key: string) => {
    if (isAdmin) return;
    setPermissions(prev => {
      const curr = prev[selectedRole] ?? [];
      const updated = curr.includes(key) ? curr.filter(p => p !== key) : [...curr, key];
      return { ...prev, [selectedRole]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/roles/permissions", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, permissions: permissions[selectedRole] ?? [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Permissions saved for ${ROLES.find(r => r.key === selectedRole)?.label}`);
      if (data.data?.permissions) {
        setPermissions(prev => ({ ...prev, [selectedRole]: data.data.permissions }));
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const allPerms = PERMISSIONS.flatMap(s => s.perms.map(p => p.key));
  const enabledCount = isAdmin ? allPerms.length : currentPerms.filter(p => p !== "ALL").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading roles...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Role & Permission Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Persisted to database — applies on next login</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPermissions}
            className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleSave} disabled={saving || isAdmin}
            className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium cursor-pointer transition">
            {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save permissions</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">Roles</p>
          </div>
          <div className="p-2 space-y-0.5">
            {ROLES.map(({ key, label, color }) => (
              <button key={key} onClick={() => setSelectedRole(key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                  ${selectedRole === key ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${color}`}>
                  {key === "admin" ? "All" : `${(permissions[key] ?? []).filter(p => p !== "ALL").length}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-xl border ${ROLES.find(r => r.key === selectedRole)?.color ?? "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">{ROLES.find(r => r.key === selectedRole)?.label}</p>
                <p className="text-xs opacity-70">
                  {isAdmin ? "Has all permissions" : `${enabledCount} of ${allPerms.length} permissions enabled`}
                </p>
              </div>
            </div>
          </div>

          {PERMISSIONS.map(({ section, perms }) => (
            <div key={section} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{section}</p>
              </div>
              <div className="divide-y divide-slate-100">
                {perms.map(({ key, label }) => {
                  const enabled = hasPerm(key);
                  return (
                    <div key={key} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition">
                      <div>
                        <p className="text-sm text-slate-700">{label}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{key}</p>
                      </div>
                      <button
                        onClick={() => togglePerm(key)}
                        disabled={isAdmin}
                        className={`w-10 h-6 rounded-full flex items-center transition-colors cursor-pointer relative
                          ${enabled ? "bg-indigo-600" : "bg-slate-200"}
                          ${isAdmin ? "cursor-not-allowed opacity-75" : ""}`}
                        role="switch"
                        aria-checked={enabled}
                      >
                        <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
