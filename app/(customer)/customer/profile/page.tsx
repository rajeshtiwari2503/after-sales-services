"use client";
import { useState, useEffect } from "react";
import { User, Mail, Phone, Save, RefreshCw, Shield, Key, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const inputCls = "w-full h-11 border border-slate-200 rounded-xl px-3.5 text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [tab, setTab] = useState<"profile" | "security">("profile");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setForm({ name: u.name ?? "", email: u.email ?? "", phone: u.phone ?? "" });
    }
    // Fetch fresh user data
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json()).then(d => {
        const u = d.data ?? d.user ?? d;
        if (u?.name) {
          setUser(u);
          setForm({ name: u.name ?? "", email: u.email ?? "", phone: u.phone ?? "" });
          localStorage.setItem("user", JSON.stringify(u));
        }
      }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      if (!res.ok) throw new Error();
      const updated = { ...user, ...form };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      toast.success("Profile updated");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass) { toast.error("All password fields required"); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error("Passwords don't match"); return; }
    if (passwords.newPass.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setChangingPass(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      toast.success("Password changed successfully");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (e: any) { toast.error(e.message || "Failed to change password"); }
    finally { setChangingPass(false); }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("user");
    router.push("/login");
  };

  const initials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold text-slate-800">My Profile</h1>

      {/* Avatar + name */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials(user?.name ?? "?")}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">{user?.name ?? "Loading..."}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full mt-1 inline-block capitalize">
            {user?.role ?? "customer"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl w-fit">
        {[
          { key: "profile", label: "Profile", icon: User },
          { key: "security", label: "Security", icon: Shield },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition cursor-pointer
              ${tab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-4">
          <p className="text-sm font-semibold text-slate-800">Personal information</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Full name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                placeholder="Your full name" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Email address</label>
              <input type="email" value={form.email} disabled
                className={`${inputCls} opacity-60 cursor-not-allowed`} />
              <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Phone number</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                placeholder="+91 98765 43210" className={inputCls} />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 h-11 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-medium cursor-pointer transition">
            {saving
              ? <><RefreshCw className="w-4 h-4 animate-spin" />Saving...</>
              : <><Save className="w-4 h-4" />Save changes</>
            }
          </button>
        </div>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-800">Change password</p>
            <div className="space-y-3">
              {[
                { label: "Current password", key: "current" },
                { label: "New password", key: "newPass" },
                { label: "Confirm new password", key: "confirm" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
                  <input type="password" value={(passwords as any)[key]}
                    onChange={e => setPasswords(p => ({...p, [key]: e.target.value}))}
                    placeholder="••••••••" className={inputCls} />
                </div>
              ))}
            </div>
            <button onClick={handleChangePassword} disabled={changingPass}
              className="flex items-center gap-2 h-11 px-6 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white rounded-xl text-sm font-medium cursor-pointer transition">
              {changingPass
                ? <><RefreshCw className="w-4 h-4 animate-spin" />Changing...</>
                : <><Key className="w-4 h-4" />Change password</>
              }
            </button>
          </div>

          {/* Sign out */}
          <div className="bg-white rounded-xl border border-red-200 p-5">
            <p className="text-sm font-semibold text-slate-800 mb-1">Sign out</p>
            <p className="text-xs text-slate-500 mb-4">You'll need to sign in again to access your account.</p>
            <button onClick={handleLogout}
              className="flex items-center gap-2 h-10 px-4 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium cursor-pointer transition">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}