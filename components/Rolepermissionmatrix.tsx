"use client";
import { useState, useEffect } from "react";
import { ALL_PERMISSIONS } from "@/models/Role";

type Permission = (typeof ALL_PERMISSIONS)[number];

interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
}

// Group permissions by module prefix
const PERMISSION_GROUPS = ALL_PERMISSIONS.reduce<Record<string, Permission[]>>(
  (acc, p) => {
    const group = p.split(":")[0];
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  },
  {}
);

const GROUP_LABELS: Record<string, string> = {
  tickets: "Tickets", users: "Users", brands: "Brands", sc: "Service Centers",
  inventory: "Inventory", wallet: "Wallet", commission: "Commission",
  analytics: "Analytics", audit: "Audit", settings: "Settings",
  chat: "Chat", notifications: "Notifications", sla: "SLA",
};

export default function RolePermissionMatrix() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Record<string, Permission[]>>({});
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", displayName: "", description: "" });

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRoles(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const getPerms = (role: Role): Permission[] =>
    dirty[role.id] ?? role.permissions;

  const togglePerm = (role: Role, perm: Permission) => {
    if (role.isSystem && role.name === "super_admin") return; // lock super admin
    const current = getPerms(role);
    const updated = current.includes(perm)
      ? current.filter((p) => p !== perm)
      : [...current, perm];
    setDirty((d) => ({ ...d, [role.id]: updated }));
  };

  const saveRole = async (role: Role) => {
    const permissions = dirty[role.id];
    if (!permissions) return;
    setSaving(role.id);
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });
      const data = await res.json();
      if (data.success) {
        setRoles((prev) =>
          prev.map((r) => (r.id === role.id ? { ...r, permissions } : r))
        );
        setDirty((d) => { const n = { ...d }; delete n[role.id]; return n; });
      }
    } finally {
      setSaving(null);
    }
  };

  const createRole = async () => {
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newRole, permissions: [] }),
    });
    const data = await res.json();
    if (data.success) {
      setRoles((prev) => [...prev, data.data]);
      setShowNewRole(false);
      setNewRole({ name: "", displayName: "", description: "" });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading roles...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Role & Permission Matrix</h2>
        <button
          onClick={() => setShowNewRole(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Create Role
        </button>
      </div>

      {showNewRole && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-blue-800">New Custom Role</h3>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="role_name (lowercase)"
              value={newRole.name}
              onChange={(e) => setNewRole((r) => ({ ...r, name: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Display Name"
              value={newRole.displayName}
              onChange={(e) => setNewRole((r) => ({ ...r, displayName: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Description (optional)"
              value={newRole.description}
              onChange={(e) => setNewRole((r) => ({ ...r, description: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={createRole} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              Create
            </button>
            <button onClick={() => setShowNewRole(false)} className="border px-4 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <table className="text-sm min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-gray-500 font-medium min-w-[200px]">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role.id} className="px-4 py-3 text-center min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium text-gray-800">{role.displayName}</span>
                    {role.isSystem && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        system
                      </span>
                    )}
                    {dirty[role.id] && (
                      <button
                        onClick={() => saveRole(role)}
                        disabled={saving === role.id}
                        className="text-xs bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700"
                      >
                        {saving === role.id ? "Saving..." : "Save"}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
              <>
                <tr key={`group-${group}`} className="bg-gray-50">
                  <td
                    colSpan={roles.length + 1}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {GROUP_LABELS[group] || group}
                  </td>
                </tr>
                {perms.map((perm) => (
                  <tr key={perm} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">
                      {perm.split(":")[1]}
                    </td>
                    {roles.map((role) => {
                      const hasPerm = getPerms(role).includes(perm);
                      const isLocked = role.name === "super_admin";
                      return (
                        <td key={role.id} className="px-4 py-2 text-center">
                          <button
                            onClick={() => togglePerm(role, perm)}
                            disabled={isLocked}
                            className={`w-5 h-5 rounded border-2 transition-all ${
                              hasPerm
                                ? "bg-blue-600 border-blue-600"
                                : "bg-white border-gray-300"
                            } ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-blue-400"}`}
                            title={isLocked ? "Super admin always has all permissions" : "Toggle permission"}
                          >
                            {hasPerm && (
                              <svg viewBox="0 0 12 12" fill="white" className="w-full h-full p-0.5">
                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}