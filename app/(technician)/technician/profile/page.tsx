"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Wrench, Save, Camera, Shield, Key, Eye, EyeOff, Loader2, Star } from "lucide-react";
import toast from "react-hot-toast";

const inputCls = "w-full h-10 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition";

export default function TechnicianProfilePage() {
  const [profile,  setProfile]  = useState({ name: "", email: "", phone: "", address: "", skills: "", specialization: "", experience: "" });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState<"profile" | "security">("profile");
  const [showPw,   setShowPw]   = useState(false);
  const [pwForm,   setPwForm]   = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const u = d.data?.user ?? d.data ?? {};
        setProfile({
          name:           u.name ?? "",
          email:          u.email ?? "",
          phone:          u.phone ?? "",
          address:        u.address ?? "",
          skills:         (u.skills ?? []).join(", "),
          specialization: u.specialization ?? "",
          experience:     u.experience ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          skills: profile.skills.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Profile updated!");
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Passwords do not match"); return; }
    if (pwForm.newPw.length < 8) { toast.error("At least 8 characters required"); return; }
    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Password changed!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setPwSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>;

  const initials = profile.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "T";

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage your technician account</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold">{initials}</div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border border-slate-200 flex items-center justify-center cursor-pointer">
            <Camera className="w-2.5 h-2.5 text-slate-500" />
          </div>
        </div>
        <div>
          <p className="font-bold text-slate-800">{profile.name || "Technician"}</p>
          <p className="text-xs text-slate-400">{profile.email}</p>
          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
          </div>
        </div>
      </div>

      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {(["profile", "security"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 h-8 rounded-lg text-sm font-medium cursor-pointer transition capitalize ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Full Name</label>
            <div className="relative"><User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className={`${inputCls} pl-9`} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email (read-only)</label>
            <div className="relative"><Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={profile.email} disabled className={`${inputCls} pl-9 bg-slate-50 text-slate-400`} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Phone</label>
            <div className="relative"><Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className={`${inputCls} pl-9`} placeholder="+91 9876543210" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Specialization</label>
            <div className="relative"><Wrench className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={profile.specialization} onChange={e => setProfile(p => ({ ...p, specialization: e.target.value }))} className={`${inputCls} pl-9`} placeholder="e.g. AC Repair, HVAC" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Skills (comma-separated)</label>
            <input value={profile.skills} onChange={e => setProfile(p => ({ ...p, skills: e.target.value }))} className={inputCls} placeholder="e.g. Plumbing, Electrical, AC" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Experience</label>
            <input value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))} className={inputCls} placeholder="e.g. 5 years" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Address</label>
            <div className="relative"><MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                rows={2} className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 h-10 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
          </button>
        </div>
      )}

      {tab === "security" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2"><Key className="w-5 h-5 text-amber-600" /><h2 className="text-sm font-bold text-slate-800">Change Password</h2></div>
          {["current", "newPw", "confirm"].map((field, i) => (
            <div key={field}>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">{["Current Password", "New Password", "Confirm Password"][i]}</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"}
                  value={pwForm[field as keyof typeof pwForm]}
                  onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                  className={`${inputCls} pr-9`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={changePassword} disabled={pwSaving}
            className="flex items-center gap-2 h-10 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition disabled:opacity-60">
            {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Update Password
          </button>
        </div>
      )}
    </div>
  );
}
