"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Bell, Shield, Globe, Save, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

type SettingsData = {
  platformName: string;
  supportEmail: string;
  maxTicketsPerDay: number;
  slaResponseHours: number;
  slaResolutionHours: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  autoAssign: boolean;
  requirePhotos: boolean;
};

export default function SystemSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    platformName: "",
    supportEmail: "",
    maxTicketsPerDay: 100,
    slaResponseHours: 4,
    slaResolutionHours: 24,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    autoAssign: true,
    requirePhotos: false,
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const s = data.data;
      setSettings({
        platformName: s.platformName ?? "",
        supportEmail: s.supportEmail ?? "",
        maxTicketsPerDay: Number(s.maxTicketsPerDay ?? 100),
        slaResponseHours: Number(s.slaResponseHours ?? 4),
        slaResolutionHours: Number(s.slaResolutionHours ?? 24),
        emailNotifications: Boolean(s.emailNotifications),
        smsNotifications: Boolean(s.smsNotifications),
        maintenanceMode: Boolean(s.maintenanceMode),
        autoAssign: Boolean(s.autoAssign),
        requirePhotos: Boolean(s.requirePhotos),
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set = (k: keyof SettingsData, v: string | boolean | number) =>
    setSettings(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          maxTicketsPerDay: Number(settings.maxTicketsPerDay),
          slaResponseHours: Number(settings.slaResponseHours),
          slaResolutionHours: Number(settings.slaResolutionHours),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Settings saved successfully");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all settings to defaults? This cannot be undone.")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/settings?action=reset", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Settings reset to defaults");
      fetchSettings();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const sections = [
    {
      title: "General", icon: Globe,
      fields: [
        { label: "Platform name", key: "platformName" as const, type: "text" },
        { label: "Support email", key: "supportEmail" as const, type: "email" },
        { label: "Max tickets per day", key: "maxTicketsPerDay" as const, type: "number" },
      ],
    },
    {
      title: "SLA defaults", icon: Shield,
      fields: [
        { label: "Response time (hours)", key: "slaResponseHours" as const, type: "number" },
        { label: "Resolution time (hours)", key: "slaResolutionHours" as const, type: "number" },
      ],
    },
  ];

  const toggles = [
    { label: "Email notifications", desc: "Send email alerts for ticket updates", key: "emailNotifications" as const },
    { label: "SMS notifications", desc: "Send SMS for critical updates", key: "smsNotifications" as const },
    { label: "Auto-assign tickets", desc: "Automatically assign to available technicians", key: "autoAssign" as const },
    { label: "Require job photos", desc: "Technicians must upload photos to close tickets", key: "requirePhotos" as const },
    { label: "Maintenance mode", desc: "Block new customer ticket creation", key: "maintenanceMode" as const, danger: true },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">System settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Platform-wide configuration (saved per tenant)</p>
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
                  value={String(settings[key])}
                  onChange={e => set(key, type === "number" ? Number(e.target.value) : e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      ))}

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
                onClick={() => set(key, !settings[key])}
                className={`relative rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                  settings[key] ? (danger ? "bg-red-500" : "bg-indigo-600") : "bg-slate-200"
                }`}
                style={{ height: 22, width: 40 }}
                role="switch"
                aria-checked={settings[key]}
              >
                <span className="absolute top-0.5 bg-white rounded-full shadow transition-transform"
                  style={{ width: 18, height: 18, transform: settings[key] ? "translateX(20px)" : "translateX(2px)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-red-100 bg-red-50">
          <Shield className="w-4 h-4 text-red-500" />
          <p className="text-sm font-semibold text-red-700">Danger zone</p>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Reset platform settings</p>
              <p className="text-xs text-slate-400">Restore all settings to factory defaults</p>
            </div>
            <button onClick={handleReset} disabled={resetting}
              className="h-8 px-3 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 cursor-pointer transition disabled:opacity-50">
              {resetting ? "Resetting..." : "Reset defaults"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
