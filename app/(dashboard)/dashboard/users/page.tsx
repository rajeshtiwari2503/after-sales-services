//  "use client";
// import { useState, useEffect } from "react";
// import { Users, Plus, Search, Edit, Trash2, Shield, RefreshCw, X } from "lucide-react";
// import toast from "react-hot-toast";

// interface UserItem {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   tenantId: string;
//   isActive: boolean;
//   lastLogin?: string;
//   createdAt: string;
// }

// const ROLE_CONFIG: Record<string, { label: string; badge: string }> = {
//   admin: { label: "Super Admin", badge: "bg-purple-50 text-purple-700 border-purple-100" },
//   manager: { label: "Brand Manager", badge: "bg-blue-50 text-blue-700 border-blue-100" },
//   service_center: { label: "Service Center", badge: "bg-teal-50 text-teal-700 border-teal-100" },
//   technician: { label: "Technician", badge: "bg-amber-50 text-amber-700 border-amber-100" },
//   customer: { label: "Customer", badge: "bg-slate-100 text-slate-600 border-slate-200" },
//   support: { label: "Support", badge: "bg-indigo-50 text-indigo-700 border-indigo-100" },
// };

// const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
// const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// export default function UsersPage() {
//   const [users, setUsers] = useState<UserItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [showAdd, setShowAdd] = useState(false);
//   const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
//   const [saving, setSaving] = useState(false);

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (search) params.set("search", search);
//       if (roleFilter) params.set("role", roleFilter);
//       const res = await fetch(`/api/users?${params}`, { credentials: "include" });
//       const data = await res.json();
//       setUsers(data?.data?.users ?? []);
//     } catch { toast.error("Failed to load users"); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { fetchUsers(); }, [search, roleFilter]);

//   const handleAdd = async () => {
//     if (!form.name || !form.email || !form.password) { toast.error("All fields required"); return; }
//     setSaving(true);
//     try {
//       const res = await fetch("/api/auth/register", {
//         method: "POST", credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) throw new Error((await res.json()).message);
//       toast.success("User created");
//       setShowAdd(false);
//       setForm({ name: "", email: "", password: "", role: "customer" });
//       fetchUsers();
//     } catch (e: any) { toast.error(e.message || "Failed to create user"); }
//     finally { setSaving(false); }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Delete this user?")) return;
//     try {
//       await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
//       toast.success("User deleted");
//       fetchUsers();
//     } catch { toast.error("Failed to delete user"); }
//   };

//   const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

//   return (
//     <div className="max-w-7xl mx-auto space-y-5">
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Users & Roles</h1>
//           <p className="text-xs text-slate-400 mt-0.5">{users.length} total users</p>
//         </div>
//         <button onClick={() => setShowAdd(true)}
//           className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer">
//           <Plus className="w-4 h-4" /> Add user
//         </button>
//       </div>

//       {/* Role stats */}
//       <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
//         {Object.entries(ROLE_CONFIG).map(([key, { label, badge }]) => {
//           const count = users.filter(u => u.role === key).length;
//           return (
//             <button key={key} onClick={() => setRoleFilter(roleFilter === key ? "" : key)}
//               className={`p-3 bg-white rounded-xl border text-center cursor-pointer transition ${roleFilter === key ? "border-indigo-300 ring-2 ring-indigo-400/20" : "border-slate-200/80 hover:border-slate-300"}`}>
//               <p className="text-xl font-bold text-slate-800">{count}</p>
//               <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
//             </button>
//           );
//         })}
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
//         <div className="flex items-center gap-2 flex-1 min-w-[180px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
//           <Search className="w-3.5 h-3.5 text-slate-400" />
//           <input type="text" placeholder="Search users..." value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
//           {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
//         </div>
//         {roleFilter && (
//           <button onClick={() => setRoleFilter("")}
//             className="flex items-center gap-1 h-9 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium cursor-pointer">
//             {ROLE_CONFIG[roleFilter]?.label} <X className="w-3 h-3" />
//           </button>
//         )}
//         <button onClick={fetchUsers} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
//           <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
//         </button>
//       </div>

//       {/* Add user modal */}
//       {showAdd && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-base font-semibold text-slate-800">Create user</h2>
//               <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
//             </div>
//             <div className="space-y-3">
//               {[
//                 { label: "Full name *", key: "name", type: "text", placeholder: "Rahul Sharma" },
//                 { label: "Email *", key: "email", type: "email", placeholder: "rahul@example.com" },
//                 { label: "Password *", key: "password", type: "password", placeholder: "Min. 8 characters" },
//               ].map(({ label, key, type, placeholder }) => (
//                 <div key={key}>
//                   <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
//                   <input type={type} className={inputCls} placeholder={placeholder}
//                     value={(form as any)[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} />
//                 </div>
//               ))}
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Role *</label>
//                 <select className={`${inputCls} cursor-pointer`} value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}>
//                   {Object.entries(ROLE_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="flex gap-2 pt-2">
//               <button onClick={() => setShowAdd(false)} className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer">Cancel</button>
//               <button onClick={handleAdd} disabled={saving} className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium cursor-pointer">
//                 {saving ? "Creating..." : "Create user"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Users table */}
//       <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-100">
//                 {["User", "Role", "Tenant", "Last login", "Status", "Actions"].map(h => (
//                   <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {loading ? Array(6).fill(0).map((_, i) => (
//                 <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>)}</tr>
//               )) : users.length === 0 ? (
//                 <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">No users found</td></tr>
//               ) : users.map(user => {
//                 const roleCfg = ROLE_CONFIG[user.role] ?? { label: user.role, badge: "bg-slate-100 text-slate-600 border-slate-200" };
//                 return (
//                   <tr key={user._id} className="hover:bg-slate-50 transition">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2.5">
//                         <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
//                           {initials(user.name)}
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-slate-800">{user.name}</p>
//                           <p className="text-xs text-slate-400">{user.email}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${roleCfg.badge}`}>{roleCfg.label}</span>
//                     </td>
//                     <td className="px-4 py-3 text-xs text-slate-500">{user.tenantId}</td>
//                     <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(user.lastLogin)}</td>
//                     <td className="px-4 py-3">
//                       <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${user.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
//                         {user.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-1">
//                         <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
//                         <button onClick={() => handleDelete(user._id)}
//                           className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Search, Edit, Trash2,
  RefreshCw, X, Check, ToggleLeft, ToggleRight,
  ChevronDown, Save, Eye, EyeOff
} from "lucide-react";
import toast from "react-hot-toast";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
}

const ROLE_CONFIG: Record<string, { label: string; badge: string }> = {
  admin:          { label: "Super Admin",    badge: "bg-purple-50 text-purple-700 border-purple-100" },
  manager:        { label: "Brand Manager",  badge: "bg-blue-50 text-blue-700 border-blue-100" },
  service_center: { label: "Service Center", badge: "bg-teal-50 text-teal-700 border-teal-100" },
  technician:     { label: "Technician",     badge: "bg-amber-50 text-amber-700 border-amber-100" },
  customer:       { label: "Customer",       badge: "bg-slate-100 text-slate-600 border-slate-200" },
  support:        { label: "Support",        badge: "bg-indigo-50 text-indigo-700 border-indigo-100" },
};

const initials = (name: string) =>
  (name ?? "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

// ─── Add/Edit Modal ──────────────────────────────────────────
function UserModal({
  mode,
  user,
  onClose,
  onSaved,
}: {
  mode: "add" | "edit";
  user?: UserItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name:     user?.name     ?? "",
    email:    user?.email    ?? "",
    phone:    user?.phone    ?? "",
    role:     user?.role     ?? "customer",
    password: "",
    isActive: user?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim())  { toast.error("Name is required");  return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (mode === "add" && !form.password) { toast.error("Password is required"); return; }

    setSaving(true);
    try {
      if (mode === "add") {
        // Use register endpoint for new users
        const res = await fetch("/api/auth/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:     form.name,
            email:    form.email,
            phone:    form.phone,
            role:     form.role,
            password: form.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create user");
        toast.success("User created successfully");
      } else {
        // Use PUT endpoint for updates
        const body: Record<string, any> = {
          name:     form.name,
          phone:    form.phone,
          role:     form.role,
          isActive: form.isActive,
        };
        if (form.password) body.password = form.password;

        const res = await fetch(`/api/users/${user!._id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update user");
        toast.success("User updated successfully");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {mode === "add" ? "Create new user" : "Edit user"}
            </h2>
            {mode === "edit" && (
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Full name *</label>
            <input type="text" className={inputCls} placeholder="Rahul Sharma"
              value={form.name} onChange={e => set("name", e.target.value)} />
          </div>

          {/* Email — readonly in edit mode */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Email *</label>
            <input type="email" className={`${inputCls} ${mode === "edit" ? "opacity-60 cursor-not-allowed" : ""}`}
              placeholder="rahul@example.com" value={form.email}
              onChange={e => set("email", e.target.value)}
              readOnly={mode === "edit"} />
            {mode === "edit" && <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
            <input type="tel" className={inputCls} placeholder="+91 98765 43210"
              value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Role *</label>
            <select className={`${inputCls} cursor-pointer`} value={form.role} onChange={e => set("role", e.target.value)}>
              {Object.entries(ROLE_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              {mode === "add" ? "Password *" : "New password (leave blank to keep)"}
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className={`${inputCls} pr-10`}
                placeholder={mode === "add" ? "Min. 8 characters" : "Leave blank to keep current"}
                value={form.password}
                onChange={e => set("password", e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active toggle — only in edit mode */}
          {mode === "edit" && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">Account status</p>
                <p className="text-xs text-slate-400">Enable or disable this user's access</p>
              </div>
              <button onClick={() => set("isActive", !form.isActive)} className="cursor-pointer">
                {form.isActive
                  ? <ToggleRight className="w-8 h-8 text-indigo-600" />
                  : <ToggleLeft className="w-8 h-8 text-slate-400" />
                }
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-2">
          <button onClick={onClose}
            className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium cursor-pointer transition flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              : <><Save className="w-3.5 h-3.5" />{mode === "add" ? "Create user" : "Save changes"}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers]           = useState<UserItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal]           = useState<{ mode: "add" | "edit"; user?: UserItem } | null>(null);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res  = await fetch(`/api/users?${params}`, { credentials: "include" });
      const data = await res.json();
      // Handle both response shapes: data.users or data (array)
      const list = data?.data?.users ?? data?.data ?? data?.users ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      toast.success("User deleted");
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  // ── Toggle active ──────────────────────────────────────────
  const handleToggleActive = async (user: UserItem) => {
    setToggling(user._id);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      toast.success(`User ${!user.isActive ? "activated" : "deactivated"}`);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  // ── Role stats ─────────────────────────────────────────────
  const roleCounts = Object.keys(ROLE_CONFIG).reduce((acc, key) => {
    acc[key] = users.filter(u => u.role === key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Users & Roles</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {loading ? "Loading..." : `${users.length} users`}
            {roleFilter && ` · filtered by ${ROLE_CONFIG[roleFilter]?.label}`}
          </p>
        </div>
        <button onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer transition">
          <Plus className="w-4 h-4" /> Add user
        </button>
      </div>

      {/* Role stat cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(ROLE_CONFIG).map(([key, { label }]) => (
          <button key={key}
            onClick={() => setRoleFilter(roleFilter === key ? "" : key)}
            className={`p-3 bg-white rounded-xl border text-center cursor-pointer transition
              ${roleFilter === key
                ? "border-indigo-400 ring-2 ring-indigo-400/20 bg-indigo-50"
                : "border-slate-200/80 hover:border-slate-300"
              }`}>
            <p className={`text-xl font-bold ${roleFilter === key ? "text-indigo-700" : "text-slate-800"}`}>
              {roleCounts[key] ?? 0}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Active role filter badge */}
        {roleFilter && (
          <button onClick={() => setRoleFilter("")}
            className="flex items-center gap-1.5 h-9 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium cursor-pointer hover:bg-indigo-100 transition">
            {ROLE_CONFIG[roleFilter]?.label}
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Refresh */}
        <button onClick={fetchUsers}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer transition"
          title="Refresh">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["User", "Role", "Tenant", "Last login", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Skeleton rows
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-slate-200 rounded w-3/4" />
                          <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                    </td>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3 animate-pulse">
                        <div className="h-3 bg-slate-200 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No users found</p>
                    {(search || roleFilter) && (
                      <button onClick={() => { setSearch(""); setRoleFilter(""); }}
                        className="text-indigo-600 text-xs hover:underline mt-1 cursor-pointer">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const roleCfg = ROLE_CONFIG[user.role] ?? {
                    label: user.role,
                    badge: "bg-slate-100 text-slate-600 border-slate-200",
                  };
                  const isDeleting = deleting === user._id;
                  const isToggling = toggling === user._id;

                  return (
                    <tr key={user._id} className={`hover:bg-slate-50 transition ${!user.isActive ? "opacity-60" : ""}`}>
                      {/* User info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                            ${user.isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>
                            {initials(user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${roleCfg.badge}`}>
                          {roleCfg.label}
                        </span>
                      </td>

                      {/* Tenant */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 font-mono">
                          {user.tenantId || "—"}
                        </span>
                      </td>

                      {/* Last login */}
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {fmtDate(user.lastLogin)}
                      </td>

                      {/* Active status + toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={isToggling}
                          className="flex items-center gap-1.5 cursor-pointer group"
                          title={user.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          {isToggling ? (
                            <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                          ) : user.isActive ? (
                            <ToggleRight className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700 transition" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition" />
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border
                            ${user.isActive
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}>
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => setModal({ mode: "edit", user })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer transition"
                            title="Edit user"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            disabled={isDeleting}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer transition disabled:opacity-50"
                            title="Delete user"
                          >
                            {isDeleting
                              ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!loading && users.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{users.length}</span> user{users.length !== 1 ? "s" : ""}
              {roleFilter && ` in ${ROLE_CONFIG[roleFilter]?.label}`}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                {users.filter(u => u.isActive).length} active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                {users.filter(u => !u.isActive).length} inactive
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
}