 

"use client";
// app/(dashboard)/dashboard/users/page.tsx  — REPLACE existing
// Manage ALL users: brand managers, SC operators, technicians, customers
// Full CRUD: create, edit, activate/deactivate, reset password, filter by role/tenant

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, X, RefreshCw, Plus, Edit2, Check,
  ChevronLeft, ChevronRight, Users, Filter,
  Building2, Wrench, UserCheck, Shield, Eye,
  EyeOff, Lock, ToggleLeft, ToggleRight, Download,
  Mail, Phone, Calendar, Tag,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface UserRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  tenantId: string;
  serviceCenterId?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

/* ─── Config ─────────────────────────────────────────────────────────────── */
const ROLE_CFG: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  admin:          { label: "Super Admin",    badge: "bg-violet-100 text-violet-700", icon: <Shield  className="w-3 h-3" /> },
  manager:        { label: "Brand Manager",  badge: "bg-blue-100 text-blue-700",     icon: <Building2 className="w-3 h-3" /> },
  service_center: { label: "SC Operator",    badge: "bg-teal-100 text-teal-700",     icon: <Building2 className="w-3 h-3" /> },
  technician:     { label: "Technician",     badge: "bg-amber-100 text-amber-700",   icon: <Wrench  className="w-3 h-3" /> },
  customer:       { label: "Customer",       badge: "bg-pink-100 text-pink-700",     icon: <UserCheck className="w-3 h-3" /> },
  support:        { label: "Support",        badge: "bg-indigo-100 text-indigo-700", icon: <Users   className="w-3 h-3" /> },
};

const ROLES = ["admin","manager","service_center","technician","customer","support"];
const inputCls = "w-full h-10 border border-slate-200 rounded-xl px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition text-slate-800";
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";
const timeAgo = (d?: string) => {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const LIMIT = 15;

/* ─── User Form Modal ────────────────────────────────────────────────────── */
function UserFormModal({
  editUser,
  onClose,
  onSaved,
}: {
  editUser: UserRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editUser;
  const [form, setForm] = useState({
    name:            editUser?.name            ?? "",
    email:           editUser?.email           ?? "",
    phone:           editUser?.phone           ?? "",
    role:            editUser?.role            ?? "customer",
    tenantId:        editUser?.tenantId        ?? "",
    serviceCenterId: editUser?.serviceCenterId ?? "",
    password:        "",
    isActive:        editUser?.isActive        ?? true,
  });
  const [showPw,  setShowPw]  = useState(false);
  const [saving,  setSaving]  = useState(false);

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim())    { toast.error("Name is required");    return; }
    if (!form.email.trim())   { toast.error("Email is required");   return; }
    if (!form.tenantId.trim()){ toast.error("Tenant ID is required"); return; }
    if (!isEdit && !form.password) { toast.error("Password is required for new users"); return; }

    setSaving(true);
    try {
      const body: any = {
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        phone:    form.phone.trim() || undefined,
        role:     form.role,
        tenantId: form.tenantId.trim(),
        isActive: form.isActive,
      };
      if (form.serviceCenterId) body.serviceCenterId = form.serviceCenterId;
      if (form.password)        body.password        = form.password;

      const res = await fetch(isEdit ? `/api/users/${editUser!._id}` : "/api/users", {
        method:  isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "Failed");
      toast.success(isEdit ? "User updated" : "User created");
      onSaved();
      onClose();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">{isEdit ? "Edit user" : "Create user"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Full name *</label>
              <input className={inputCls} placeholder="John Doe" value={form.name} onChange={f("name")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Role *</label>
              <select className={inputCls} value={form.role} onChange={f("role")}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_CFG[r]?.label ?? r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Email *</label>
            <input type="email" className={inputCls} placeholder="john@brand.com" value={form.email} onChange={f("email")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
              <input className={inputCls} placeholder="+91 98765..." value={form.phone} onChange={f("phone")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Tenant ID *</label>
              <input className={inputCls} placeholder="brand-a" value={form.tenantId} onChange={f("tenantId")} />
            </div>
          </div>
          {(form.role === "service_center" || form.role === "technician") && (
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Service Center ID</label>
              <input className={inputCls} placeholder="SC ObjectId" value={form.serviceCenterId} onChange={f("serviceCenterId")} />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              {isEdit ? "New password (leave blank to keep)" : "Password *"}
            </label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} className={`${inputCls} pr-10`}
                placeholder={isEdit ? "Leave blank to keep current" : "Min 8 characters"}
                value={form.password} onChange={f("password")} />
              <button onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))} className="cursor-pointer">
              {form.isActive
                ? <ToggleRight className="w-8 h-8 text-green-500" />
                : <ToggleLeft className="w-8 h-8 text-slate-300" />}
            </button>
            <span className="text-sm text-slate-700">{form.isActive ? "Active account" : "Inactive account"}</span>
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose}
            className="flex-1 h-10 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-100 cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function UsersPage() {
  const [users,        setUsers]        = useState<UserRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [showForm,     setShowForm]     = useState(false);
  const [editUser,     setEditUser]     = useState<UserRow | null>(null);
  const [stats,        setStats]        = useState<Record<string,number>>({});
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  /* ── Fetch ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page",  String(page));
      params.set("limit", String(LIMIT));
      if (roleFilter)   params.set("role",     roleFilter);
      if (search)       params.set("search",   search);
      if (statusFilter) params.set("isActive", statusFilter);

      const res  = await fetch(`/api/users?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed");

      const userList: UserRow[] = data.data?.users ?? [];
      setUsers(userList);
      setTotal(data.data?.total ?? 0);
      setTotalPages(Math.ceil((data.data?.total ?? 0) / LIMIT));

      // Compute role stats from current result (or from a separate endpoint if available)
      const s: Record<string, number> = {};
      userList.forEach(u => { s[u.role] = (s[u.role] ?? 0) + 1; });
      setStats(s);
    } catch (e: any) {
      toast.error(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Toggle active ── */
  const toggleActive = async (u: UserRow) => {
    try {
      const res = await fetch(`/api/users/${u._id}`, {
        method:  "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !u.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(u.isActive ? "User deactivated" : "User activated");
      fetchUsers();
    } catch { toast.error("Failed to update"); }
  };

  /* ── Reset password ── */
  const resetPassword = async (u: UserRow) => {
    const newPw = prompt(`Enter new password for ${u.name}:`);
    if (!newPw || newPw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    try {
      const res = await fetch(`/api/users/${u._id}`, {
        method:  "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password: newPw }),
      });
      if (!res.ok) throw new Error();
      toast.success("Password reset successfully");
    } catch { toast.error("Failed to reset password"); }
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [
      ["Name","Email","Phone","Role","Tenant","SC ID","Active","Last Login","Created"],
      ...users.map(u => [
        u.name, u.email, u.phone ?? "", u.role, u.tenantId,
        u.serviceCenterId ?? "", u.isActive ? "Yes" : "No",
        fmtDate(u.lastLogin), fmtDate(u.createdAt),
      ]),
    ];
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `users-${new Date().toISOString().slice(0,10)}.csv`,
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">User Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">{total} total users across all brands and roles</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 h-9 px-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer bg-white">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={fetchUsers}
            className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { setEditUser(null); setShowForm(true); }}
            className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition">
            <Plus className="w-4 h-4" /> Add user
          </button>
        </div>
      </div>

      {/* ── Role stat pills ── */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setRoleFilter(""); setPage(1); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
            !roleFilter ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}>
          <Users className="w-3 h-3" /> All users <span className="opacity-70">{total}</span>
        </button>
        {ROLES.filter(r => r !== "admin").map(r => {
          const cfg = ROLE_CFG[r];
          return (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                roleFilter === r
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : `${cfg.badge} border-transparent hover:opacity-80`
              }`}>
              {cfg.icon} {cfg.label}
            </button>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 focus-within:border-indigo-400 transition">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input type="text" placeholder="Search by name, email..."
            onChange={e => {
              const v = e.target.value;
              if (searchTimer.current) clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(() => { setSearch(v); setPage(1); }, 350);
            }}
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-white focus:outline-none cursor-pointer">
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["User","Role","Tenant","SC","Status","Last Login","Joined","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array(8).fill(0).map((_,i) => (
                    <tr key={i}>{Array(8).fill(0).map((_,j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>
                    ))}</tr>
                  ))
                : users.length === 0
                ? (
                  <tr><td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Users className="w-10 h-10 text-slate-300" />
                      <p className="text-slate-500 text-sm">No users found</p>
                    </div>
                  </td></tr>
                )
                : users.map(u => {
                    const roleCfg = ROLE_CFG[u.role] ?? ROLE_CFG.customer;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50 transition group">
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {u.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Mail className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[150px]">{u.email}</span>
                              </div>
                              {u.phone && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <Phone className="w-2.5 h-2.5" />{u.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Role */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${roleCfg.badge}`}>
                            {roleCfg.icon} {roleCfg.label}
                          </span>
                        </td>
                        {/* Tenant */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{u.tenantId}</span>
                        </td>
                        {/* SC */}
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {u.serviceCenterId
                            ? <span className="font-mono text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">{u.serviceCenterId.slice(-6)}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => toggleActive(u)} className="cursor-pointer group/toggle">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border transition ${
                              u.isActive
                                ? "bg-green-50 text-green-700 border-green-100 group-hover/toggle:bg-red-50 group-hover/toggle:text-red-600 group-hover/toggle:border-red-100"
                                : "bg-red-50 text-red-600 border-red-100 group-hover/toggle:bg-green-50 group-hover/toggle:text-green-700"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-green-500" : "bg-red-400"}`} />
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </button>
                        </td>
                        {/* Last login */}
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {u.lastLogin ? timeAgo(u.lastLogin) : <span className="text-slate-300">Never</span>}
                        </td>
                        {/* Joined */}
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => { setEditUser(u); setShowForm(true); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer transition"
                              title="Edit user">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => resetPassword(u)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 cursor-pointer transition"
                              title="Reset password">
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            <a href={`mailto:${u.email}`}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer transition"
                              title="Send email">
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center border rounded-lg text-xs font-medium cursor-pointer transition ${
                    p===page?"bg-indigo-600 border-indigo-600 text-white":"border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>{p}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <UserFormModal
          editUser={editUser}
          onClose={() => { setShowForm(false); setEditUser(null); }}
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
}


// "use client";
// // ═══════════════════════════════════════════════════════════════
// // SUPER ADMIN — Complete Management Page
// // app/(dashboard)/dashboard/management/page.tsx
// // Manages: Brands → Service Centers → Technicians (full hierarchy)
// // ═══════════════════════════════════════════════════════════════

// import { useState, useEffect, useCallback } from "react";
// import {
//   Building2, MapPin, Wrench, Plus, Edit, Trash2,
//   Search, X, RefreshCw, ChevronRight, ChevronDown,
//   Users, Phone, Mail, Globe, Shield, CheckCircle,
//   AlertCircle, Eye, Link2, Unlink, Save, ArrowLeft,
//   Star, Package, ToggleLeft, ToggleRight
// } from "lucide-react";
// import toast from "react-hot-toast";

// // ─── Types ──────────────────────────────────────────────────────
// interface Brand {
//   _id: string;
//   name: string;
//   code: string;
//   tenantId: string;
//   contactEmail: string;
//   contactPhone?: string;
//   website?: string;
//   isActive: boolean;
//   serviceCenters: string[];
//   managerId?: { _id: string; name: string; email: string };
//   createdAt: string;
// }

// interface ServiceCenter {
//   _id: string;
//   name: string;
//   code: string;
//   brandId?: string | { _id: string; name: string };
//   tenantId: string;
//   address: { street?: string; city: string; state: string; postalCode?: string; country?: string };
//   contact: { phone: string; email: string };
//   capacity: number;
//   services: string[];
//   technicians: string[] | { _id: string; name: string }[];
//   isActive: boolean;
//   createdAt: string;
// }

// interface Technician {
//   _id: string;
//   userId: { _id: string; name: string; email: string; phone?: string };
//   employeeId: string;
//   serviceCenterId?: string | { _id: string; name: string };
//   tenantId: string;
//   specializations: string[];
//   rating: number;
//   totalTickets: number;
//   completedTickets: number;
//   availability: { isAvailable: boolean };
//   isActive: boolean;
//   createdAt: string;
// }

// // ─── Constants ──────────────────────────────────────────────────
// const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";
// const labelCls = "block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5";

// const fmtDate = (d: string) =>
//   new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// const initials = (name: string) =>
//   (name ?? "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

// // ─── Skeleton ───────────────────────────────────────────────────
// const Sk = ({ className = "" }: { className?: string }) => (
//   <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
// );

// // ─── Status badge ────────────────────────────────────────────────
// function StatusBadge({ active }: { active: boolean }) {
//   return (
//     <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
//       active ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"
//     }`}>
//       {active ? "Active" : "Inactive"}
//     </span>
//   );
// }

// // ─── Modal wrapper ───────────────────────────────────────────────
// function Modal({ title, subtitle, onClose, children }: {
//   title: string; subtitle?: string;
//   onClose: () => void; children: React.ReactNode;
// }) {
//   return (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 my-4">
//         <div className="flex items-start justify-between">
//           <div>
//             <h2 className="text-base font-bold text-slate-800">{title}</h2>
//             {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
//           </div>
//           <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // BRAND MODAL
// // ═══════════════════════════════════════════════════════════════
// function BrandModal({ brand, onClose, onSaved }: {
//   brand?: Brand; onClose: () => void; onSaved: () => void;
// }) {
//   const [form, setForm] = useState({
//     name:         brand?.name         ?? "",
//     code:         brand?.code         ?? "",
//     tenantId:     brand?.tenantId     ?? "",
//     contactEmail: brand?.contactEmail ?? "",
//     contactPhone: brand?.contactPhone ?? "",
//     website:      brand?.website      ?? "",
//     isActive:     brand?.isActive     ?? true,
//     // Manager account (only for create)
//     managerName:  "",
//     managerEmail: "",
//     managerPass:  "",
//   });
//   const [saving, setSaving] = useState(false);
//   const isEdit = !!brand;

//   const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

//   const handleSave = async () => {
//     if (!form.name || !form.contactEmail) { toast.error("Name and email required"); return; }
//     if (!isEdit && (!form.managerName || !form.managerEmail || !form.managerPass)) {
//       toast.error("Manager details required for new brand"); return;
//     }

//     setSaving(true);
//     try {
//       let brandId = brand?._id;

//       if (isEdit) {
//         // Update brand via users API (brand stored as manager user tenantId)
//         const res = await fetch(`/api/brands/${brandId}`, {
//           method: "PUT", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name: form.name, contactEmail: form.contactEmail,
//             contactPhone: form.contactPhone, website: form.website,
//             isActive: form.isActive,
//           }),
//         });
//         if (!res.ok) throw new Error((await res.json()).message);
//       } else {
//         // 1. Create manager user with tenantId = brand code
//         const tenantId = form.tenantId || form.code.toLowerCase().replace(/\s+/g, "-");
//         const userRes = await fetch("/api/auth/register", {
//           method: "POST", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name:     form.managerName,
//             email:    form.managerEmail,
//             password: form.managerPass,
//             role:     "manager",
//             tenantId,
//           }),
//         });
//         if (!userRes.ok) throw new Error((await userRes.json()).message);
//         const userData = await userRes.json();
//         const managerId = userData.data?.user?._id ?? userData.data?._id;

//         // 2. Create brand record
//         const brandRes = await fetch("/api/brands", {
//           method: "POST", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name: form.name, code: form.code.toUpperCase(),
//             tenantId, managerId,
//             contactEmail: form.contactEmail,
//             contactPhone: form.contactPhone,
//             website: form.website,
//           }),
//         });
//         if (!brandRes.ok) throw new Error((await brandRes.json()).message);
//       }

//       toast.success(isEdit ? "Brand updated" : "Brand created with manager account");
//       onSaved(); onClose();
//     } catch (e: any) { toast.error(e.message || "Failed"); }
//     finally { setSaving(false); }
//   };

//   return (
//     <Modal
//       title={isEdit ? "Edit brand" : "Create new brand"}
//       subtitle={isEdit ? undefined : "A brand manager account will be created automatically"}
//       onClose={onClose}
//     >
//       <div className="space-y-3">
//         <div className="grid grid-cols-2 gap-3">
//           <div className="col-span-2">
//             <label className={labelCls}>Brand name *</label>
//             <input className={inputCls} placeholder="e.g. CoolAir Technologies" value={form.name} onChange={e => set("name", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Brand code *</label>
//             <input className={inputCls} placeholder="COOLAIR" value={form.code}
//               onChange={e => set("code", e.target.value.toUpperCase())}
//               disabled={isEdit} />
//           </div>
//           <div>
//             <label className={labelCls}>Tenant ID</label>
//             <input className={inputCls} placeholder="auto from code" value={form.tenantId}
//               onChange={e => set("tenantId", e.target.value)}
//               disabled={isEdit} />
//           </div>
//           <div className="col-span-2">
//             <label className={labelCls}>Contact email *</label>
//             <input type="email" className={inputCls} placeholder="brand@example.com" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Phone</label>
//             <input className={inputCls} placeholder="+91 98765 43210" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Website</label>
//             <input className={inputCls} placeholder="https://brand.com" value={form.website} onChange={e => set("website", e.target.value)} />
//           </div>
//         </div>

//         {/* Manager section — only for create */}
//         {!isEdit && (
//           <div className="border-t border-slate-100 pt-4 space-y-3">
//             <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
//               <Shield className="w-3.5 h-3.5 text-indigo-500" /> Brand Manager Account
//             </p>
//             <div>
//               <label className={labelCls}>Manager name *</label>
//               <input className={inputCls} placeholder="Rahul Sharma" value={form.managerName} onChange={e => set("managerName", e.target.value)} />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className={labelCls}>Manager email *</label>
//                 <input type="email" className={inputCls} placeholder="manager@brand.com" value={form.managerEmail} onChange={e => set("managerEmail", e.target.value)} />
//               </div>
//               <div>
//                 <label className={labelCls}>Password *</label>
//                 <input type="password" className={inputCls} placeholder="Min 8 chars" value={form.managerPass} onChange={e => set("managerPass", e.target.value)} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Active toggle — edit only */}
//         {isEdit && (
//           <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200">
//             <div>
//               <p className="text-sm font-medium text-slate-700">Brand status</p>
//               <p className="text-xs text-slate-400">Enable or disable this brand</p>
//             </div>
//             <button onClick={() => set("isActive", !form.isActive)} className="cursor-pointer">
//               {form.isActive
//                 ? <ToggleRight className="w-8 h-8 text-indigo-600" />
//                 : <ToggleLeft className="w-8 h-8 text-slate-400" />
//               }
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="flex gap-2 pt-2">
//         <button onClick={onClose} className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-slate-50">Cancel</button>
//         <button onClick={handleSave} disabled={saving}
//           className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
//           {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Save className="w-3.5 h-3.5" />{isEdit ? "Update" : "Create brand"}</>}
//         </button>
//       </div>
//     </Modal>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // SERVICE CENTER MODAL
// // ═══════════════════════════════════════════════════════════════
// function SCModal({ sc, brands, onClose, onSaved }: {
//   sc?: ServiceCenter; brands: Brand[];
//   onClose: () => void; onSaved: () => void;
// }) {
//   const [form, setForm] = useState({
//     name:        sc?.name              ?? "",
//     code:        sc?.code              ?? "",
//     brandId:     typeof sc?.brandId === "object" ? sc?.brandId?._id : sc?.brandId ?? "",
//     city:        sc?.address?.city     ?? "",
//     state:       sc?.address?.state    ?? "",
//     street:      sc?.address?.street   ?? "",
//     postalCode:  sc?.address?.postalCode ?? "",
//     phone:       sc?.contact?.phone    ?? "",
//     email:       sc?.contact?.email    ?? "",
//     capacity:    String(sc?.capacity   ?? 10),
//     services:    sc?.services?.join(", ") ?? "",
//     isActive:    sc?.isActive          ?? true,
//     // SC manager account (create only)
//     managerName:  "",
//     managerEmail: "",
//     managerPass:  "",
//   });
//   const [saving, setSaving] = useState(false);
//   const isEdit = !!sc;
//   const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

//   const handleSave = async () => {
//     if (!form.name || !form.code || !form.city) { toast.error("Name, code and city required"); return; }
//     if (!form.brandId) { toast.error("Select a brand"); return; }
//     if (!isEdit && (!form.managerName || !form.managerEmail || !form.managerPass)) {
//       toast.error("SC manager details required"); return;
//     }

//     setSaving(true);
//     try {
//       const selectedBrand = brands.find(b => b._id === form.brandId);

//       const body = {
//         name:     form.name,
//         code:     form.code.toUpperCase(),
//         brandId:  form.brandId,
//         tenantId: selectedBrand?.tenantId ?? "",
//         address:  { street: form.street, city: form.city, state: form.state, postalCode: form.postalCode, country: "India" },
//         contact:  { phone: form.phone, email: form.email },
//         capacity: Number(form.capacity),
//         services: form.services.split(",").map(s => s.trim()).filter(Boolean),
//         isActive: form.isActive,
//       };

//       if (isEdit) {
//         const res = await fetch(`/api/service-centers/${sc._id}`, {
//           method: "PUT", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(body),
//         });
//         if (!res.ok) throw new Error((await res.json()).message);
//       } else {
//         // 1. Create SC manager user
//         const userRes = await fetch("/api/auth/register", {
//           method: "POST", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name: form.managerName, email: form.managerEmail,
//             password: form.managerPass, role: "service_center",
//             tenantId: selectedBrand?.tenantId ?? "",
//           }),
//         });
//         if (!userRes.ok) throw new Error((await userRes.json()).message);
//         const userData = await userRes.json();
//         const managerId = userData.data?.user?._id ?? userData.data?._id;

//         // 2. Create SC
//         const scRes = await fetch("/api/service-centers", {
//           method: "POST", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ ...body, managerId }),
//         });
//         if (!scRes.ok) throw new Error((await scRes.json()).message);
//         const scData = await scRes.json();

//         // 3. Auto-assign SC to brand
//         await fetch(`/api/brands/${form.brandId}/assign-sc`, {
//           method: "POST", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ serviceCenterId: scData.data._id }),
//         });
//       }

//       toast.success(isEdit ? "Service center updated" : "Service center created & assigned to brand");
//       onSaved(); onClose();
//     } catch (e: any) { toast.error(e.message || "Failed"); }
//     finally { setSaving(false); }
//   };

//   return (
//     <Modal
//       title={isEdit ? "Edit service center" : "Create service center"}
//       subtitle={isEdit ? undefined : "Will be auto-assigned to selected brand"}
//       onClose={onClose}
//     >
//       <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
//         <div>
//           <label className={labelCls}>Parent brand *</label>
//           <select value={form.brandId} onChange={e => set("brandId", e.target.value)}
//             className={`${inputCls} cursor-pointer`} disabled={isEdit}>
//             <option value="">Select brand...</option>
//             {brands.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
//           </select>
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className={labelCls}>Center name *</label>
//             <input className={inputCls} placeholder="Delhi North Center" value={form.name} onChange={e => set("name", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Center code *</label>
//             <input className={inputCls} placeholder="DEL-N-01" value={form.code}
//               onChange={e => set("code", e.target.value.toUpperCase())} disabled={isEdit} />
//           </div>
//           <div className="col-span-2">
//             <label className={labelCls}>Street address</label>
//             <input className={inputCls} placeholder="123 Main Street" value={form.street} onChange={e => set("street", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>City *</label>
//             <input className={inputCls} placeholder="Delhi" value={form.city} onChange={e => set("city", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>State</label>
//             <input className={inputCls} placeholder="Delhi" value={form.state} onChange={e => set("state", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Pincode</label>
//             <input className={inputCls} placeholder="110001" value={form.postalCode} onChange={e => set("postalCode", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Capacity/day</label>
//             <input type="number" className={inputCls} value={form.capacity} onChange={e => set("capacity", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Phone</label>
//             <input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Email</label>
//             <input type="email" className={inputCls} placeholder="center@brand.com" value={form.email} onChange={e => set("email", e.target.value)} />
//           </div>
//           <div className="col-span-2">
//             <label className={labelCls}>Services (comma separated)</label>
//             <input className={inputCls} placeholder="AC, Refrigerator, Washing Machine" value={form.services} onChange={e => set("services", e.target.value)} />
//           </div>
//         </div>

//         {/* SC manager — create only */}
//         {!isEdit && (
//           <div className="border-t border-slate-100 pt-4 space-y-3">
//             <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
//               <Shield className="w-3.5 h-3.5 text-teal-500" /> Service Center Manager Account
//             </p>
//             <div>
//               <label className={labelCls}>Manager name *</label>
//               <input className={inputCls} placeholder="Amit Kumar" value={form.managerName} onChange={e => set("managerName", e.target.value)} />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className={labelCls}>Manager email *</label>
//                 <input type="email" className={inputCls} placeholder="manager@center.com" value={form.managerEmail} onChange={e => set("managerEmail", e.target.value)} />
//               </div>
//               <div>
//                 <label className={labelCls}>Password *</label>
//                 <input type="password" className={inputCls} placeholder="Min 8 chars" value={form.managerPass} onChange={e => set("managerPass", e.target.value)} />
//               </div>
//             </div>
//           </div>
//         )}

//         {isEdit && (
//           <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200">
//             <div>
//               <p className="text-sm font-medium text-slate-700">SC status</p>
//               <p className="text-xs text-slate-400">Enable or disable this service center</p>
//             </div>
//             <button onClick={() => set("isActive", !form.isActive)} className="cursor-pointer">
//               {form.isActive ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="flex gap-2 pt-2">
//         <button onClick={onClose} className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-slate-50">Cancel</button>
//         <button onClick={handleSave} disabled={saving}
//           className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
//           {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Save className="w-3.5 h-3.5" />{isEdit ? "Update" : "Create SC"}</>}
//         </button>
//       </div>
//     </Modal>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // TECHNICIAN MODAL
// // ═══════════════════════════════════════════════════════════════
// function TechModal({ tech, serviceCenters, onClose, onSaved }: {
//   tech?: Technician; serviceCenters: ServiceCenter[];
//   onClose: () => void; onSaved: () => void;
// }) {
//   const [form, setForm] = useState({
//     name:            tech?.userId?.name    ?? "",
//     email:           tech?.userId?.email   ?? "",
//     phone:           tech?.userId?.phone   ?? "",
//     password:        "",
//     employeeId:      tech?.employeeId      ?? "",
//     serviceCenterId: typeof tech?.serviceCenterId === "object"
//       ? (tech?.serviceCenterId as any)?._id : tech?.serviceCenterId ?? "",
//     specializations: tech?.specializations?.join(", ") ?? "",
//     isAvailable:     tech?.availability?.isAvailable ?? true,
//     isActive:        tech?.isActive ?? true,
//   });
//   const [saving, setSaving] = useState(false);
//   const isEdit = !!tech;
//   const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

//   const handleSave = async () => {
//     if (!form.name || !form.email) { toast.error("Name and email required"); return; }
//     if (!form.serviceCenterId) { toast.error("Select a service center"); return; }
//     if (!isEdit && !form.password) { toast.error("Password required for new technician"); return; }

//     setSaving(true);
//     try {
//       const selectedSC = serviceCenters.find(s => s._id === form.serviceCenterId);

//       if (isEdit) {
//         // Update user
//         await fetch(`/api/users/${tech!.userId._id}`, {
//           method: "PUT", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name: form.name, phone: form.phone,
//             ...(form.password ? { password: form.password } : {}),
//             isActive: form.isActive,
//           }),
//         });
//         // Update technician record
//         await fetch(`/api/technicians/${tech!._id}`, {
//           method: "PUT", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             serviceCenterId:  form.serviceCenterId,
//             specializations:  form.specializations.split(",").map(s => s.trim()).filter(Boolean),
//             availability:     { isAvailable: form.isAvailable },
//           }),
//         });
//       } else {
//         // 1. Create User with technician role
//         const userRes = await fetch("/api/auth/register", {
//           method: "POST", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name:     form.name,
//             email:    form.email,
//             phone:    form.phone,
//             password: form.password,
//             role:     "technician",
//             tenantId: selectedSC?.tenantId ?? "",
//           }),
//         });
//         if (!userRes.ok) throw new Error((await userRes.json()).message);
//         const userData = await userRes.json();
//         const userId = userData.data?.user?._id ?? userData.data?._id;

//         // 2. Create Technician profile
//         const techRes = await fetch("/api/technicians", {
//           method: "POST", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId,
//             employeeId:      form.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
//             serviceCenterId: form.serviceCenterId,
//             tenantId:        selectedSC?.tenantId ?? "",
//             specializations: form.specializations.split(",").map(s => s.trim()).filter(Boolean),
//           }),
//         });
//         if (!techRes.ok) throw new Error((await techRes.json()).message);
//         const techData = await techRes.json();

//         // 3. Add technician to SC's technicians array
//         await fetch(`/api/service-centers/${form.serviceCenterId}/assign-technician`, {
//           method: "POST", credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ technicianId: userId }),
//         });
//       }

//       toast.success(isEdit ? "Technician updated" : "Technician created & assigned to service center");
//       onSaved(); onClose();
//     } catch (e: any) { toast.error(e.message || "Failed"); }
//     finally { setSaving(false); }
//   };

//   return (
//     <Modal
//       title={isEdit ? "Edit technician" : "Add technician"}
//       subtitle={isEdit ? undefined : "Will be assigned to selected service center"}
//       onClose={onClose}
//     >
//       <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
//         <div>
//           <label className={labelCls}>Service center *</label>
//           <select value={form.serviceCenterId} onChange={e => set("serviceCenterId", e.target.value)}
//             className={`${inputCls} cursor-pointer`}>
//             <option value="">Select service center...</option>
//             {serviceCenters.map(sc => (
//               <option key={sc._id} value={sc._id}>
//                 {sc.name} — {sc.address?.city}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <div className="col-span-2">
//             <label className={labelCls}>Full name *</label>
//             <input className={inputCls} placeholder="Ravi Kumar" value={form.name} onChange={e => set("name", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Email *</label>
//             <input type="email" className={`${inputCls} ${isEdit ? "opacity-60" : ""}`}
//               placeholder="tech@example.com" value={form.email}
//               onChange={e => set("email", e.target.value)} readOnly={isEdit} />
//           </div>
//           <div>
//             <label className={labelCls}>Phone</label>
//             <input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>{isEdit ? "New password (optional)" : "Password *"}</label>
//             <input type="password" className={inputCls}
//               placeholder={isEdit ? "Leave blank to keep" : "Min 8 characters"}
//               value={form.password} onChange={e => set("password", e.target.value)} />
//           </div>
//           <div>
//             <label className={labelCls}>Employee ID</label>
//             <input className={inputCls} placeholder="EMP-001" value={form.employeeId} onChange={e => set("employeeId", e.target.value)} disabled={isEdit} />
//           </div>
//           <div className="col-span-2">
//             <label className={labelCls}>Specializations (comma separated)</label>
//             <input className={inputCls} placeholder="AC, Refrigerator, Washing Machine" value={form.specializations} onChange={e => set("specializations", e.target.value)} />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200">
//             <div>
//               <p className="text-xs font-medium text-slate-700">Availability</p>
//               <p className="text-[10px] text-slate-400">Available for jobs</p>
//             </div>
//             <button onClick={() => set("isAvailable", !form.isAvailable)} className="cursor-pointer">
//               {form.isAvailable ? <ToggleRight className="w-7 h-7 text-green-600" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
//             </button>
//           </div>
//           {isEdit && (
//             <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200">
//               <div>
//                 <p className="text-xs font-medium text-slate-700">Active</p>
//                 <p className="text-[10px] text-slate-400">Account status</p>
//               </div>
//               <button onClick={() => set("isActive", !form.isActive)} className="cursor-pointer">
//                 {form.isActive ? <ToggleRight className="w-7 h-7 text-indigo-600" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex gap-2 pt-2">
//         <button onClick={onClose} className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-slate-50">Cancel</button>
//         <button onClick={handleSave} disabled={saving}
//           className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
//           {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Save className="w-3.5 h-3.5" />{isEdit ? "Update" : "Add technician"}</>}
//         </button>
//       </div>
//     </Modal>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // MAIN MANAGEMENT PAGE
// // ═══════════════════════════════════════════════════════════════
// export default function ManagementPage() {
//   const [tab, setTab]           = useState<"brands" | "sc" | "tech">("brands");
//   const [brands, setBrands]     = useState<Brand[]>([]);
//   const [scs, setSCs]           = useState<ServiceCenter[]>([]);
//   const [techs, setTechs]       = useState<Technician[]>([]);
//   const [loading, setLoading]   = useState(true);
//   const [search, setSearch]     = useState("");
//   const [brandFilter, setBrand] = useState("");
//   const [scFilter, setSCFilter] = useState("");

//   // Modals
//   const [brandModal,  setBrandModal]  = useState<{ open: boolean; data?: Brand }>({ open: false });
//   const [scModal,     setSCModal]     = useState<{ open: boolean; data?: ServiceCenter }>({ open: false });
//   const [techModal,   setTechModal]   = useState<{ open: boolean; data?: Technician }>({ open: false });

//   const fetchAll = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [brandRes, scRes, techRes] = await Promise.all([
//         fetch("/api/brands",       { credentials: "include" }),
//         fetch("/api/service-centers", { credentials: "include" }),
//         fetch("/api/technicians",  { credentials: "include" }),
//       ]);
//       const [brandData, scData, techData] = await Promise.all([
//         brandRes.json(), scRes.json(), techRes.json(),
//       ]);
//       setBrands(brandData.data ?? []);
//       setSCs(scData.data ?? []);
//       setTechs(techData.data ?? []);
//     } catch { toast.error("Failed to load data"); }
//     finally { setLoading(false); }
//   }, []);

//   useEffect(() => { fetchAll(); }, [fetchAll]);

//   const handleDelete = async (type: "brand" | "sc" | "tech", id: string, name: string) => {
//     if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
//     try {
//       const url = type === "brand" ? `/api/brands/${id}` : type === "sc" ? `/api/service-centers/${id}` : `/api/technicians/${id}`;
//       const res = await fetch(url, { method: "DELETE", credentials: "include" });
//       if (!res.ok) throw new Error((await res.json()).message);
//       toast.success("Deleted successfully");
//       fetchAll();
//     } catch (e: any) { toast.error(e.message || "Failed to delete"); }
//   };

//   // Filtered lists
//   const filtBrands = brands.filter(b =>
//     (!search || b.name.toLowerCase().includes(search.toLowerCase()) || b.code.includes(search.toUpperCase()))
//   );

//   const filtSCs = scs.filter(sc => {
//     const scBrandId = typeof sc.brandId === "object" ? sc.brandId?._id : sc.brandId;
//     return (!search || sc.name.toLowerCase().includes(search.toLowerCase())) &&
//            (!brandFilter || scBrandId === brandFilter);
//   });

//   const filtTechs = techs.filter(t => {
//     const techSCId = typeof t.serviceCenterId === "object" ? (t.serviceCenterId as any)?._id : t.serviceCenterId;
//     return (!search || t.userId?.name?.toLowerCase().includes(search.toLowerCase())) &&
//            (!scFilter || techSCId === scFilter);
//   });

//   // Stats
//   const stats = {
//     brands:   brands.length,
//     activeBrands: brands.filter(b => b.isActive).length,
//     scs:      scs.length,
//     activeSCs: scs.filter(s => s.isActive).length,
//     techs:    techs.length,
//     availTechs: techs.filter(t => t.availability?.isAvailable).length,
//   };

//   return (
//     <div className="max-w-7xl mx-auto space-y-5 pb-10">
//       {/* Header */}
//       <div className="flex items-start justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-black text-slate-900">Platform Management</h1>
//           <p className="text-xs text-slate-400 mt-1">Manage brands → service centers → technicians hierarchy</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <button onClick={fetchAll}
//             className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer">
//             <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
//           </button>
//           {tab === "brands" && (
//             <button onClick={() => setBrandModal({ open: true })}
//               className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer">
//               <Plus className="w-4 h-4" /> Add brand
//             </button>
//           )}
//           {tab === "sc" && (
//             <button onClick={() => setSCModal({ open: true })}
//               className="flex items-center gap-2 h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium cursor-pointer">
//               <Plus className="w-4 h-4" /> Add service center
//             </button>
//           )}
//           {tab === "tech" && (
//             <button onClick={() => setTechModal({ open: true })}
//               className="flex items-center gap-2 h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium cursor-pointer">
//               <Plus className="w-4 h-4" /> Add technician
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Stats strip */}
//       <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
//         {[
//           { label: "Total brands",    value: stats.brands,      color: "text-indigo-600",  bg: "bg-indigo-50",  icon: Building2 },
//           { label: "Active brands",   value: stats.activeBrands,color: "text-green-600",   bg: "bg-green-50",   icon: CheckCircle },
//           { label: "Service centers", value: stats.scs,         color: "text-teal-600",    bg: "bg-teal-50",    icon: MapPin },
//           { label: "Active SCs",      value: stats.activeSCs,   color: "text-green-600",   bg: "bg-green-50",   icon: CheckCircle },
//           { label: "Technicians",     value: stats.techs,       color: "text-amber-600",   bg: "bg-amber-50",   icon: Wrench },
//           { label: "Available now",   value: stats.availTechs,  color: "text-green-600",   bg: "bg-green-50",   icon: Users },
//         ].map(({ label, value, color, bg, icon: Icon }) => (
//           <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-3.5 flex items-center gap-2.5">
//             <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
//               <Icon className={`w-4 h-4 ${color}`} />
//             </div>
//             <div>
//               <p className={`text-xl font-black ${color}`}>{value}</p>
//               <p className="text-[10px] text-slate-400 leading-tight">{label}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Hierarchy visual */}
//       <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-3.5 flex items-center gap-3 text-sm text-slate-600 overflow-x-auto">
//         <div className="flex items-center gap-1.5 shrink-0">
//           <Building2 className="w-4 h-4 text-indigo-500" />
//           <span className="font-semibold text-indigo-700">{stats.brands} brands</span>
//         </div>
//         <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
//         <div className="flex items-center gap-1.5 shrink-0">
//           <MapPin className="w-4 h-4 text-teal-500" />
//           <span className="font-semibold text-teal-700">{stats.scs} service centers</span>
//         </div>
//         <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
//         <div className="flex items-center gap-1.5 shrink-0">
//           <Wrench className="w-4 h-4 text-amber-500" />
//           <span className="font-semibold text-amber-700">{stats.techs} technicians</span>
//         </div>
//         <div className="ml-auto shrink-0 text-xs text-slate-400">
//           Each brand owns its SCs · Each SC owns its technicians
//         </div>
//       </div>

//       {/* Tabs + search */}
//       <div className="flex items-center gap-3 flex-wrap">
//         <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
//           {[
//             { key: "brands", label: `Brands (${filtBrands.length})`, icon: Building2 },
//             { key: "sc",     label: `Service Centers (${filtSCs.length})`, icon: MapPin },
//             { key: "tech",   label: `Technicians (${filtTechs.length})`, icon: Wrench },
//           ].map(({ key, label, icon: Icon }) => (
//             <button key={key} onClick={() => { setTab(key as any); setSearch(""); setBrand(""); setSCFilter(""); }}
//               className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium cursor-pointer transition
//                 ${tab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
//               <Icon className="w-3.5 h-3.5" /> {label}
//             </button>
//           ))}
//         </div>

//         {/* Search */}
//         <div className="flex items-center gap-2 flex-1 min-w-[200px] h-9 bg-white border border-slate-200 rounded-xl px-3">
//           <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
//           <input type="text" placeholder={`Search ${tab}...`} value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
//           {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
//         </div>

//         {/* Brand filter for SC tab */}
//         {tab === "sc" && (
//           <select value={brandFilter} onChange={e => setBrand(e.target.value)}
//             className="h-9 border border-slate-200 rounded-xl px-2.5 text-xs text-slate-700 bg-white focus:outline-none cursor-pointer">
//             <option value="">All brands</option>
//             {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
//           </select>
//         )}

//         {/* SC filter for tech tab */}
//         {tab === "tech" && (
//           <select value={scFilter} onChange={e => setSCFilter(e.target.value)}
//             className="h-9 border border-slate-200 rounded-xl px-2.5 text-xs text-slate-700 bg-white focus:outline-none cursor-pointer">
//             <option value="">All service centers</option>
//             {scs.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
//           </select>
//         )}
//       </div>

//       {/* ── BRANDS TABLE ── */}
//       {tab === "brands" && (
//         <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-100">
//                   {["Brand", "Code", "Tenant", "Contact", "Service Centers", "Status", "Created", "Actions"].map(h => (
//                     <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {loading ? Array(4).fill(0).map((_, i) => (
//                   <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><Sk className="h-3 w-20" /></td>)}</tr>
//                 )) : filtBrands.length === 0 ? (
//                   <tr><td colSpan={8} className="py-14 text-center">
//                     <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
//                     <p className="text-slate-400 text-sm">No brands found</p>
//                   </td></tr>
//                 ) : filtBrands.map(brand => {
//                   const scCount = scs.filter(sc => {
//                     const scBrandId = typeof sc.brandId === "object" ? sc.brandId?._id : sc.brandId;
//                     return scBrandId === brand._id;
//                   }).length;
//                   return (
//                     <tr key={brand._id} className="hover:bg-slate-50 transition-colors">
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2.5">
//                           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
//                             {initials(brand.name)}
//                           </div>
//                           <div>
//                             <p className="text-sm font-semibold text-slate-800">{brand.name}</p>
//                             {brand.managerId && <p className="text-[10px] text-slate-400">{brand.managerId.name}</p>}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3"><span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{brand.code}</span></td>
//                       <td className="px-4 py-3 text-xs font-mono text-slate-500">{brand.tenantId}</td>
//                       <td className="px-4 py-3">
//                         <p className="text-xs text-slate-600">{brand.contactEmail}</p>
//                         {brand.contactPhone && <p className="text-[10px] text-slate-400">{brand.contactPhone}</p>}
//                       </td>
//                       <td className="px-4 py-3">
//                         <button onClick={() => { setTab("sc"); setBrand(brand._id); }}
//                           className="flex items-center gap-1 text-xs text-teal-600 hover:underline cursor-pointer">
//                           <MapPin className="w-3 h-3" /> {scCount} centers
//                         </button>
//                       </td>
//                       <td className="px-4 py-3"><StatusBadge active={brand.isActive} /></td>
//                       <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(brand.createdAt)}</td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-1">
//                           <button onClick={() => setBrandModal({ open: true, data: brand })}
//                             className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer">
//                             <Edit className="w-3.5 h-3.5" />
//                           </button>
//                           <button onClick={() => handleDelete("brand", brand._id, brand.name)}
//                             className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer">
//                             <Trash2 className="w-3.5 h-3.5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ── SERVICE CENTERS TABLE ── */}
//       {tab === "sc" && (
//         <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-100">
//                   {["Service Center", "Code", "Brand", "Location", "Contact", "Technicians", "Capacity", "Status", "Actions"].map(h => (
//                     <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {loading ? Array(4).fill(0).map((_, i) => (
//                   <tr key={i}>{Array(9).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><Sk className="h-3 w-16" /></td>)}</tr>
//                 )) : filtSCs.length === 0 ? (
//                   <tr><td colSpan={9} className="py-14 text-center">
//                     <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
//                     <p className="text-slate-400 text-sm">No service centers found</p>
//                   </td></tr>
//                 ) : filtSCs.map(sc => {
//                   const scBrandId = typeof sc.brandId === "object" ? sc.brandId?._id : sc.brandId;
//                   const brand = brands.find(b => b._id === scBrandId);
//                   const techCount = techs.filter(t => {
//                     const tSCId = typeof t.serviceCenterId === "object" ? (t.serviceCenterId as any)?._id : t.serviceCenterId;
//                     return tSCId === sc._id;
//                   }).length;
//                   return (
//                     <tr key={sc._id} className="hover:bg-slate-50 transition-colors">
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2.5">
//                           <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
//                             {initials(sc.name)}
//                           </div>
//                           <p className="text-sm font-semibold text-slate-800">{sc.name}</p>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3"><span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{sc.code}</span></td>
//                       <td className="px-4 py-3">
//                         {brand
//                           ? <span className="text-xs text-indigo-600 font-medium">{brand.name}</span>
//                           : <span className="text-xs text-slate-400">Unassigned</span>
//                         }
//                       </td>
//                       <td className="px-4 py-3 text-xs text-slate-600">{sc.address?.city}, {sc.address?.state}</td>
//                       <td className="px-4 py-3">
//                         <p className="text-xs text-slate-600">{sc.contact?.email}</p>
//                         <p className="text-[10px] text-slate-400">{sc.contact?.phone}</p>
//                       </td>
//                       <td className="px-4 py-3">
//                         <button onClick={() => { setTab("tech"); setSCFilter(sc._id); }}
//                           className="flex items-center gap-1 text-xs text-amber-600 hover:underline cursor-pointer">
//                           <Wrench className="w-3 h-3" /> {techCount} techs
//                         </button>
//                       </td>
//                       <td className="px-4 py-3 text-xs text-slate-600">{sc.capacity}/day</td>
//                       <td className="px-4 py-3"><StatusBadge active={sc.isActive} /></td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-1">
//                           <button onClick={() => setSCModal({ open: true, data: sc })}
//                             className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer">
//                             <Edit className="w-3.5 h-3.5" />
//                           </button>
//                           <button onClick={() => handleDelete("sc", sc._id, sc.name)}
//                             className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer">
//                             <Trash2 className="w-3.5 h-3.5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ── TECHNICIANS TABLE ── */}
//       {tab === "tech" && (
//         <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-100">
//                   {["Technician", "Employee ID", "Service Center", "Specializations", "Rating", "Tickets", "Availability", "Status", "Actions"].map(h => (
//                     <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {loading ? Array(4).fill(0).map((_, i) => (
//                   <tr key={i}>{Array(9).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><Sk className="h-3 w-16" /></td>)}</tr>
//                 )) : filtTechs.length === 0 ? (
//                   <tr><td colSpan={9} className="py-14 text-center">
//                     <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
//                     <p className="text-slate-400 text-sm">No technicians found</p>
//                   </td></tr>
//                 ) : filtTechs.map(tech => {
//                   const techSCId = typeof tech.serviceCenterId === "object" ? (tech.serviceCenterId as any)?._id : tech.serviceCenterId;
//                   const sc = scs.find(s => s._id === techSCId);
//                   const rate = tech.totalTickets > 0 ? Math.round((tech.completedTickets / tech.totalTickets) * 100) : 0;
//                   return (
//                     <tr key={tech._id} className="hover:bg-slate-50 transition-colors">
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2.5">
//                           <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
//                             {initials(tech.userId?.name ?? "?")}
//                           </div>
//                           <div>
//                             <p className="text-sm font-semibold text-slate-800">{tech.userId?.name}</p>
//                             <p className="text-[10px] text-slate-400">{tech.userId?.email}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3"><span className="font-mono text-xs text-slate-600">{tech.employeeId}</span></td>
//                       <td className="px-4 py-3">
//                         {sc
//                           ? <span className="text-xs text-teal-600 font-medium">{sc.name}</span>
//                           : <span className="text-xs text-slate-400">Unassigned</span>
//                         }
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex flex-wrap gap-1">
//                           {tech.specializations?.slice(0, 2).map(s => (
//                             <span key={s} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{s}</span>
//                           ))}
//                           {(tech.specializations?.length ?? 0) > 2 && (
//                             <span className="text-[9px] text-slate-400">+{tech.specializations.length - 2}</span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-1">
//                           <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
//                           <span className="text-xs font-semibold text-slate-700">{tech.rating?.toFixed(1) ?? "—"}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-1">
//                           <span className="text-xs text-green-600 font-semibold">{tech.completedTickets}</span>
//                           <span className="text-[10px] text-slate-400">/ {tech.totalTickets}</span>
//                         </div>
//                         <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
//                           <div className="h-full bg-green-400 rounded-full" style={{ width: `${rate}%` }} />
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
//                           tech.availability?.isAvailable
//                             ? "bg-green-50 text-green-700 border-green-100"
//                             : "bg-red-50 text-red-600 border-red-100"
//                         }`}>
//                           {tech.availability?.isAvailable ? "Available" : "Busy"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3"><StatusBadge active={tech.isActive} /></td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-1">
//                           <button onClick={() => setTechModal({ open: true, data: tech })}
//                             className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer">
//                             <Edit className="w-3.5 h-3.5" />
//                           </button>
//                           <button onClick={() => handleDelete("tech", tech._id, tech.userId?.name)}
//                             className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer">
//                             <Trash2 className="w-3.5 h-3.5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       {brandModal.open && (
//         <BrandModal brand={brandModal.data} onClose={() => setBrandModal({ open: false })} onSaved={fetchAll} />
//       )}
//       {scModal.open && (
//         <SCModal sc={scModal.data} brands={brands} onClose={() => setSCModal({ open: false })} onSaved={fetchAll} />
//       )}
//       {techModal.open && (
//         <TechModal tech={techModal.data} serviceCenters={scs} onClose={() => setTechModal({ open: false })} onSaved={fetchAll} />
//       )}
//     </div>
//   );
// }