"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CloudUpload, X, Send, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = ["hardware", "software", "installation", "maintenance", "warranty", "consultation", "other"] as const;
const PRIORITIES = ["low", "medium", "high", "critical"] as const;

const PRIORITY_DESC = {
  low: "Non-urgent, can wait a few days",
  medium: "Affects daily use, needs attention soon",
  high: "Significantly disrupting operations",
  critical: "Complete breakdown, urgent help needed",
};

const inputCls = "w-full h-11 border border-slate-200 rounded-xl px-3.5 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

export default function NewTicketPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "" as typeof CATEGORIES[number] | "",
    priority: "medium" as typeof PRIORITIES[number],
    estimatedCompletionDate: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.length < 5) e.title = "Title must be at least 5 characters";
    if (!form.description.trim()) e.description = "Description is required";
    else if (form.description.length < 10) e.description = "Description must be at least 10 characters";
    if (!form.category) e.category = "Please select a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFiles = (fl: FileList) => {
    const valid = Array.from(fl).filter(f => f.size <= 10 * 1024 * 1024);
    setFiles(p => [...p, ...valid]);
  };

  const handleSubmit = async () => {
    if (!validate()) { toast.error("Please fill in all required fields"); return; }
    setSubmitting(true);
    try {
      let res: Response;
      if (files.length > 0) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
        files.forEach(f => fd.append("attachments", f));
        res = await fetch("/api/tickets", { method: "POST", credentials: "include", body: fd });
      } else {
        res = await fetch("/api/tickets", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        const fieldErr = data.errors as Record<string, string[]> | undefined;
        if (fieldErr) {
          const mapped: Record<string, string> = {};
          Object.entries(fieldErr).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : String(v); });
          setErrors(mapped);
        }
        throw new Error(data.message || "Failed to create request");
      }
      toast.success("Service request created!");
      router.push(`/customer/tickets/${data.data?._id ?? ""}`);
    } catch (e: any) { toast.error(e.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <Link href="/customer/dashboard"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">New service request</h1>
          <p className="text-xs text-slate-400 mt-0.5">Tell us about your issue</p>
        </div>
      </div>

      {/* Title */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Issue title <span className="text-red-400">*</span>
          </label>
          <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
            placeholder="e.g. AC not cooling properly" maxLength={200} className={inputCls} />
          {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
          <p className="text-xs text-slate-400 mt-1 text-right">{form.title.length}/200</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="Describe the issue in detail — when it started, what you've tried, etc."
            rows={5} maxLength={5000}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition resize-none leading-relaxed" />
          {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
        </div>
      </div>

      {/* Category */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
          Category <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} type="button" onClick={() => set("category", cat)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-medium capitalize cursor-pointer transition
                ${form.category === cat
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300"
                }`}>
              {cat}
            </button>
          ))}
        </div>
        {errors.category && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
      </div>

      {/* Priority */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
          Urgency level
        </label>
        <div className="space-y-2">
          {PRIORITIES.map(p => (
            <button key={p} type="button" onClick={() => set("priority", p)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition
                ${form.priority === p
                  ? "bg-indigo-50 border-indigo-300"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}>
              <div className={`w-3 h-3 rounded-full shrink-0 border-2 flex items-center justify-center
                ${form.priority === p ? "border-indigo-600" : "border-slate-300"}`}>
                {form.priority === p && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </div>
              <div>
                <p className={`text-sm font-medium capitalize ${form.priority === p ? "text-indigo-700" : "text-slate-700"}`}>{p}</p>
                <p className="text-xs text-slate-400">{PRIORITY_DESC[p]}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
          Attachments <span className="text-slate-400 font-normal normal-case">(optional — photos help us understand the issue)</span>
        </label>

        <input ref={fileRef} type="file" multiple accept="image/*,.pdf" className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)} />

        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl py-6 text-center cursor-pointer transition">
          <CloudUpload className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs text-slate-500">Tap to add photos or documents</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Max 10MB each</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-1.5">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                <span className="text-xs text-slate-700 flex-1 truncate">{f.name}</span>
                <span className="text-[10px] text-slate-400">{(f.size / 1024).toFixed(0)}KB</span>
                <button onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))}
                  className="text-slate-400 hover:text-red-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={submitting}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition">
        {submitting
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
          : <><Send className="w-4 h-4" />Submit service request</>
        }
      </button>
    </div>
  );
}