"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Ticket, Flag, Paperclip, User, Info, Send,
  X, ArrowLeft, Clock, CloudUpload, AlertTriangle,
  ArrowUp, ArrowDown, Minus,
} from "lucide-react";

type Priority = "low" | "medium" | "high" | "critical";
type Category = "hardware" | "software" | "installation" | "maintenance" | "warranty" | "consultation" | "other";

interface TicketForm {
  title: string;
  description: string;
  category: Category | "";
  priority: Priority;
  customerId: string;
  technicianId: string;
  estimatedCompletionDate: string;
}

const PRIORITIES: { value: Priority; label: string; icon: React.ReactNode; sla: string; activeClass: string }[] = [
  { value: "low", label: "Low", icon: <ArrowDown className="w-4 h-4" />, sla: "Response 48h · Resolution 5 days", activeClass: "border-green-600 bg-green-50 text-green-700" },
  { value: "medium", label: "Medium", icon: <Minus className="w-4 h-4" />, sla: "Response 4h · Resolution 24h", activeClass: "border-amber-500 bg-amber-50 text-amber-700" },
  { value: "high", label: "High", icon: <ArrowUp className="w-4 h-4" />, sla: "Response 1h · Resolution 8h", activeClass: "border-orange-500 bg-orange-50 text-orange-700" },
  { value: "critical", label: "Critical", icon: <AlertTriangle className="w-4 h-4" />, sla: "Response 15m · Resolution 2h", activeClass: "border-red-500 bg-red-50 text-red-700" },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "installation", label: "Installation" },
  { value: "maintenance", label: "Maintenance" },
  { value: "warranty", label: "Warranty" },
  { value: "consultation", label: "Consultation" },
  { value: "other", label: "Other" },
];

// Mock customers/technicians — replace with API fetch
const CUSTOMERS = [
  { id: "cust1", name: "Priya Sharma" },
  { id: "cust2", name: "Anil Kumar" },
  { id: "cust3", name: "Meena Rao" },
];

const TECHNICIANS = [
  { id: "", name: "Auto-assign" },
  { id: "tech1", name: "Amit Kumar" },
  { id: "tech2", name: "Rohit Mehta" },
];

const inputClass =
  "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition";

const selectClass =
  "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition cursor-pointer appearance-none";

const labelClass = "block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5";

export default function CreateTicketPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<TicketForm>({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    customerId: "",
    technicianId: "",
    estimatedCompletionDate: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TicketForm, string>>>({});

  // CreateTicketPage mein add karo
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Customers fetch karo
    fetch("/api/users?role=customer", { credentials: "include" })
      .then(r => r.json())
      .then(d => setCustomers(
        (d.data || d.users || []).map((u: any) => ({ id: u._id, name: u.name }))
      ))
      .catch(() => { });

    // Technicians fetch karo
    fetch("/api/users?role=technician", { credentials: "include" })
      .then(r => r.json())
      .then(d => setTechnicians([
        { id: "", name: "Auto-assign" },
        ...(d.data || d.users || []).map((u: any) => ({ id: u._id, name: u.name }))
      ]))
      .catch(() => { });
  }, []);



  const set = (key: keyof TicketForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.length > 200) e.title = "Max 200 characters";
    if (!form.description.trim()) e.description = "Description is required";
    else if (form.description.length > 5000) e.description = "Max 5000 characters";
    if (!form.category) e.category = "Category is required";
    if (!form.customerId) e.customerId = "Customer is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).filter((f) => f.size <= 10 * 1024 * 1024);
    setFiles((p) => [...p, ...newFiles]);
  };

  const removeFile = (i: number) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const onSubmit = async () => {
    if (!validate()) { toast.error("Please fix the errors"); return; }
    setSubmitting(true);
    try {
      let res: Response;

      if (files.length > 0) {
        // Files hain — FormData
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
        files.forEach((f) => formData.append("attachments", f));
        res = await fetch("/api/tickets", { method: "POST", credentials: "include", body: formData });
      } else {
        // ✅ No files — JSON bhejo
        res = await fetch("/api/tickets", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create ticket");
      toast.success(`Ticket ${data.data?.ticketNumber || ""} created!`);
      router.push("/dashboard/tickets");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const currentPriority = PRIORITIES.find((p) => p.value === form.priority)!;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tickets"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">New Service Ticket</h1>
            <p className="text-xs text-slate-400 mt-0.5">Fill in details to create a service request</p>
          </div>
        </div>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Ticket details */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Ticket details</p>
                <p className="text-xs text-slate-400">Basic service request information</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className={labelClass}>
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. AC unit not cooling properly"
                  maxLength={200}
                  className={`${inputClass} ${errors.title ? "border-red-300 focus:border-red-400 focus:ring-red-400/10" : ""}`}
                />
                <div className="flex justify-between mt-1">
                  {errors.title
                    ? <p className="text-red-500 text-xs">{errors.title}</p>
                    : <span />
                  }
                  <span className="text-xs text-slate-400">{form.title.length}/200</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the issue in detail — when it started, symptoms, steps already tried..."
                  maxLength={5000}
                  rows={5}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-none transition leading-relaxed
                     ${errors.description
                      ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
                      : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/10"
                    }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description
                    ? <p className="text-red-500 text-xs">{errors.description}</p>
                    : <span />
                  }
                  <span className="text-xs text-slate-400">{form.description.length}/5000</span>
                </div>
              </div>

              {/* Category + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className={`${selectClass} ${errors.category ? "border-red-300" : ""}`}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className={labelClass}>Estimated completion</label>
                  <input
                    type="date"
                    value={form.estimatedCompletionDate}
                    onChange={(e) => set("estimatedCompletionDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Flag className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Priority & SLA</p>
                <p className="text-xs text-slate-400">SLA deadlines are set automatically</p>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set("priority", p.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer
                       ${form.priority === p.value
                        ? p.activeClass
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>

              {/* SLA info */}
              <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  SLA — {currentPriority.sla}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Attachments</p>
                <p className="text-xs text-slate-400">Optional — photos, docs, videos (max 10MB each)</p>
              </div>
            </div>

            <div className="p-5">
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,.pdf,.mp4,.mov"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-lg py-8 px-4 text-center cursor-pointer transition-all
                   ${dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}
              >
                <CloudUpload className={`w-7 h-7 mx-auto mb-2 ${dragging ? "text-indigo-500" : "text-slate-300"}`} />
                <p className="text-sm text-slate-600 font-medium">
                  Drop files here or <span className="text-indigo-600">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF, MP4 supported</p>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-700 flex-1 truncate">{f.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Assignment */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Assignment</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className={labelClass}>
                  Customer <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.customerId}
                  onChange={(e) => set("customerId", e.target.value)}
                  className={`${selectClass} ${errors.customerId ? "border-red-300" : ""}`}
                >
                  <option value="">Select customer</option>
                  {customers.length > 0
                    ? customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                    : <option value="">No customers found</option>
                  }
                </select>
                {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>}
              </div>

              <div>
                <label className={labelClass}>Technician</label>
                <select
                  value={form.technicianId}
                  onChange={(e) => set("technicianId", e.target.value)}
                  className={selectClass}
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ticket info */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Info className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Ticket info</p>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { label: "Ticket ID", value: "Auto-generated", muted: true },
                { label: "Status", value: "Open", badge: "bg-blue-50 text-blue-700 border-blue-100" },
                { label: "Created by", value: "Rahul Sharma" },
                { label: "Tenant", value: "default" },
              ].map(({ label, value, muted, badge }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-500">{label}</span>
                  {badge ? (
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${badge}`}>
                      {value}
                    </span>
                  ) : (
                    <span className={`text-xs font-medium ${muted ? "text-slate-400" : "text-slate-700"}`}>
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
              ) : (
                <><Send className="w-4 h-4" />Submit ticket</>
              )}
            </button>

            <Link
              href="/dashboard/tickets"
              className="w-full h-10 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}