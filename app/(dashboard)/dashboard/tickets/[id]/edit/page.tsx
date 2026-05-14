"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

const CATEGORIES = ["hardware","software","installation","maintenance","warranty","consultation","other"];
const PRIORITIES = ["low","medium","high","critical"];

const inputClass = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";
const labelClass = "block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5";

export default function EditTicketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    title: "", description: "", category: "", priority: "medium",
    customerId: "", technicianId: "", estimatedCompletionDate: "",
  });

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ticketRes, cusRes, techRes] = await Promise.all([
          fetch(`/api/tickets/${id}`, { credentials: "include" }),
          fetch("/api/users?role=customer", { credentials: "include" }),
          fetch("/api/users?role=technician", { credentials: "include" }),
        ]);

        if (!ticketRes.ok) throw new Error("Ticket not found");

        const [ticketData, cusData, techData] = await Promise.all([
          ticketRes.json(), cusRes.json(), techRes.json(),
        ]);

        const t = ticketData.data ?? ticketData;
        setForm({
          title: t.title ?? "",
          description: t.description ?? "",
          category: t.category ?? "",
          priority: t.priority ?? "medium",
          customerId: t.customerId?._id ?? "",
          technicianId: t.technicianId?._id ?? "",
          estimatedCompletionDate: t.estimatedCompletionDate
            ? new Date(t.estimatedCompletionDate).toISOString().split("T")[0]
            : "",
        });

        setCustomers((cusData.data ?? cusData.users ?? []).map((u: any) => ({ id: u._id, name: u.name })));
        setTechnicians([
          { id: "", name: "Unassigned" },
          ...(techData.data ?? techData.users ?? []).map((u: any) => ({ id: u._id, name: u.name })),
        ]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.description.trim()) { toast.error("Description is required"); return; }
    if (!form.category) { toast.error("Category is required"); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Ticket updated successfully");
      router.push(`/dashboard/tickets/${id}`);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-5">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="bg-white rounded-xl border border-slate-200 h-64" />
        <div className="bg-white rounded-xl border border-slate-200 h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-slate-700 font-semibold">{error}</p>
        <Link href="/dashboard/tickets" className="text-indigo-600 hover:underline text-sm">Back to tickets</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/tickets/${id}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Edit Ticket</h1>
            <p className="text-xs text-slate-400">Update service request details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/tickets/${id}`}
            className="h-9 px-4 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center transition cursor-pointer">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium transition cursor-pointer">
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save className="w-4 h-4" />
            }
            Save changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Left */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-2">Ticket information</h2>
            <div>
              <label className={labelClass}>Title <span className="text-red-400">*</span></label>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="Ticket title" maxLength={200} className={inputClass} />
              <div className="text-right text-xs text-slate-400 mt-1">{form.title.length}/200</div>
            </div>
            <div>
              <label className={labelClass}>Description <span className="text-red-400">*</span></label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the issue in detail..." maxLength={5000} rows={6}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition resize-none leading-relaxed" />
              <div className="text-right text-xs text-slate-400 mt-1">{form.description.length}/5000</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category <span className="text-red-400">*</span></label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)}
                  className={`${inputClass} cursor-pointer capitalize`}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Est. completion</label>
                <input type="date" value={form.estimatedCompletionDate}
                  onChange={(e) => set("estimatedCompletionDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800">Priority</h2>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITIES.map((p) => (
                <button key={p} type="button" onClick={() => set("priority", p)}
                  className={`py-2.5 rounded-lg border text-xs font-medium capitalize transition cursor-pointer
                    ${form.priority === p
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50 bg-slate-50"
                    }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800">Assignment</h2>
            <div>
              <label className={labelClass}>Customer</label>
              <select value={form.customerId} onChange={(e) => set("customerId", e.target.value)}
                className={`${inputClass} cursor-pointer`}>
                <option value="">Select customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Technician</label>
              <select value={form.technicianId} onChange={(e) => set("technicianId", e.target.value)}
                className={`${inputClass} cursor-pointer`}>
                {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}