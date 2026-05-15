 "use client";
import { useState } from "react";
import { Settings, Bell, Shield, Globe, Database, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

export default function SystemSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platformName: "SaaS Techify",
    supportEmail: "support@saastechify.com",
    maxTicketsPerDay: "100",
    slaResponseHours: "4",
    slaResolutionHours: "24",
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    autoAssign: true,
    requirePhotos: false,
  });

  const set = (k: string, v: string | boolean) => setSettings(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // mock save
      toast.success("Settings saved successfully");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  const sections = [
    {
      title: "General", icon: Globe,
      fields: [
        { label: "Platform name", key: "platformName", type: "text" },
        { label: "Support email", key: "supportEmail", type: "email" },
        { label: "Max tickets per day", key: "maxTicketsPerDay", type: "number" },
      ],
    },
    {
      title: "SLA defaults", icon: Shield,
      fields: [
        { label: "Response time (hours)", key: "slaResponseHours", type: "number" },
        { label: "Resolution time (hours)", key: "slaResolutionHours", type: "number" },
      ],
    },
  ];

  const toggles = [
    { label: "Email notifications", desc: "Send email alerts for ticket updates", key: "emailNotifications" },
    { label: "SMS notifications", desc: "Send SMS for critical updates", key: "smsNotifications" },
    { label: "Auto-assign tickets", desc: "Automatically assign to available technicians", key: "autoAssign" },
    { label: "Require job photos", desc: "Technicians must upload photos to close tickets", key: "requirePhotos" },
    { label: "Maintenance mode", desc: "Temporarily disable new ticket creation", key: "maintenanceMode", danger: true },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">System settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Platform-wide configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium cursor-pointer">
          {saving ? <><RefreshCw className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save changes</>}
        </button>
      </div>

      {sections.map(({ title, icon: Icon, fields }) => (
        <div key={title} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Icon className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
                <input type={type} className={inputCls}
                  value={(settings as any)[key]}
                  onChange={e => set(key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Toggles */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Features & notifications</p>
        </div>
        <div className="divide-y divide-slate-100">
          {toggles.map(({ label, desc, key, danger }) => (
            <div key={key} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className={`text-sm font-medium ${danger ? "text-red-600" : "text-slate-800"}`}>{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => set(key, !(settings as any)[key])}
                className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                  (settings as any)[key]
                    ? danger ? "bg-red-500" : "bg-indigo-600"
                    : "bg-slate-200"
                }`}
                style={{ height: 22, width: 40 }}
                role="switch"
                aria-checked={(settings as any)[key]}
              >
                <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                  (settings as any)[key] ? "translate-x-5" : "translate-x-0.5"
                }`} style={{ width: 18, height: 18, transform: (settings as any)[key] ? "translateX(20px)" : "translateX(2px)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-red-100 bg-red-50">
          <Shield className="w-4 h-4 text-red-500" />
          <p className="text-sm font-semibold text-red-700">Danger zone</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Clear all tickets</p>
              <p className="text-xs text-slate-400">Permanently delete all ticket data</p>
            </div>
            <button className="h-8 px-3 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 cursor-pointer transition">
              Clear data
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Reset platform</p>
              <p className="text-xs text-slate-400">Reset all settings to defaults</p>
            </div>
            <button className="h-8 px-3 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 cursor-pointer transition">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}