"use client";
// app/(dashboard)/dashboard/contact/page.tsx  — NEW FILE
// Admin views all landing page contact form submissions
// Features: filter by status, search, mark read/replied/closed, reply modal, stats

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mail, Search, X, RefreshCw, Eye, CheckCheck,
  MessageSquare, Clock, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Building2, Phone,
  Users, Tag, Filter, Send, AlertCircle, Inbox,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  teamSize?: string;
  inquiryType?: string;
  message: string;
  referenceId: string;
  status: "new" | "read" | "replied" | "closed";
  notes?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Config ─────────────────────────────────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; badge: string; dot: string }> = {
  new:     { label: "New",     badge: "bg-blue-50 text-blue-700 border-blue-100",    dot: "bg-blue-500"   },
  read:    { label: "Read",    badge: "bg-slate-100 text-slate-600 border-slate-200",dot: "bg-slate-400"  },
  replied: { label: "Replied", badge: "bg-green-50 text-green-700 border-green-100", dot: "bg-green-500"  },
  closed:  { label: "Closed",  badge: "bg-red-50 text-red-600 border-red-100",       dot: "bg-red-400"    },
};

const INQUIRY_CFG: Record<string, string> = {
  "Product demo":      "bg-indigo-50 text-indigo-700",
  "Pricing & plans":   "bg-amber-50 text-amber-700",
  "Technical support": "bg-red-50 text-red-600",
  "Partnership":       "bg-purple-50 text-purple-700",
  "Other":             "bg-slate-100 text-slate-600",
};

const fmtDate     = (d: string) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
const fmtDateTime = (d: string) => new Date(d).toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:false });
const timeAgo     = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition text-slate-800";

/* ─── Detail Modal ───────────────────────────────────────────────────────── */
function DetailModal({
  contact,
  onClose,
  onUpdate,
}: {
  contact: Contact;
  onClose: () => void;
  onUpdate: (id: string, status: string, notes?: string) => Promise<void>;
}) {
  const [status,  setStatus]  = useState(contact.status);
  const [notes,   setNotes]   = useState(contact.notes ?? "");
  const [saving,  setSaving]  = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(contact._id, status, notes);
      toast.success("Contact updated");
      onClose();
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  const cfg = STATUS_CFG[contact.status];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Contact Inquiry</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{contact.referenceId}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Sender info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Name</p>
              <p className="text-sm font-semibold text-slate-800">{contact.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Email</p>
              <a href={`mailto:${contact.email}`} className="text-sm text-indigo-600 hover:underline">{contact.email}</a>
            </div>
            {contact.phone && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Phone</p>
                <a href={`tel:${contact.phone}`} className="text-sm text-slate-700">{contact.phone}</a>
              </div>
            )}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Company</p>
              <p className="text-sm font-semibold text-slate-800">{contact.company}</p>
            </div>
            {contact.teamSize && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Team size</p>
                <p className="text-sm text-slate-600">{contact.teamSize}</p>
              </div>
            )}
            {contact.inquiryType && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Inquiry type</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${INQUIRY_CFG[contact.inquiryType] ?? "bg-slate-100 text-slate-600"}`}>
                  {contact.inquiryType}
                </span>
              </div>
            )}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Received</p>
              <p className="text-sm text-slate-600">{fmtDateTime(contact.createdAt)}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Message</p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>

          {/* Update status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Update status</label>
              <div className="grid grid-cols-2 gap-2">
                {(["new","read","replied","closed"] as const).map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`h-8 rounded-lg border text-xs font-semibold capitalize cursor-pointer transition ${
                      status === s
                        ? STATUS_CFG[s].badge
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}>
                    {STATUS_CFG[s].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick actions</label>
              <div className="flex flex-col gap-2">
                <a href={`mailto:${contact.email}?subject=Re: Your inquiry (${contact.referenceId})&body=Hi ${contact.name},%0D%0A%0D%0AThank you for reaching out to Techify.%0D%0A%0D%0A`}
                  target="_blank" rel="noopener"
                  className="flex items-center gap-2 h-8 px-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer">
                  <Send className="w-3.5 h-3.5" /> Reply via email
                </a>
                {contact.phone && (
                  <a href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 h-8 px-3 bg-green-50 border border-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition cursor-pointer">
                    <Phone className="w-3.5 h-3.5" /> Call now
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Internal notes</label>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition text-slate-800 resize-none"
              rows={3}
              placeholder="Add notes for your team (not visible to the contact)..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose}
            className="flex-1 h-10 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-semibold cursor-pointer transition flex items-center justify-center gap-2">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function AdminContactPage() {
  const [contacts,    setContacts]    = useState<Contact[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("");
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [newCount,    setNewCount]    = useState(0);
  const [selected,    setSelected]    = useState<Contact | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const LIMIT = 15;

  /* ── Fetch contacts ── */
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page",  String(page));
      params.set("limit", String(LIMIT));
      if (statusFilter) params.set("status", statusFilter);
      if (search)       params.set("search", search);

      const res  = await fetch(`/api/contact?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed");
      setContacts(data.data?.contacts ?? []);
      setTotal(data.data?.total ?? 0);
      setTotalPages(data.data?.totalPages ?? 1);
      setNewCount(data.data?.newCount ?? 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  /* ── Update contact ── */
  const handleUpdate = async (id: string, status: string, notes?: string) => {
    const res = await fetch("/api/contact", {
      method:  "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, status, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Failed");
    fetchContacts();
  };

  /* ── Quick status change ── */
  const quickStatus = async (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await handleUpdate(id, status);
      toast.success(`Marked as ${status}`);
    } catch { toast.error("Failed"); }
  };

  /* ── Search debounce ── */
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  /* ─── Stats row ── */
  const statuses = ["new", "read", "replied", "closed"] as const;
  const statsData = [
    { label: "Total",    value: total,    color: "text-slate-800",  icon: <Inbox      className="w-4 h-4" /> },
    { label: "New",      value: newCount, color: "text-blue-600",   icon: <Mail       className="w-4 h-4" /> },
    { label: "Pending",  value: contacts.filter(c => c.status === "read").length,    color: "text-amber-600", icon: <Clock      className="w-4 h-4" /> },
    { label: "Replied",  value: contacts.filter(c => c.status === "replied").length, color: "text-green-600", icon: <CheckCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Contact Inquiries</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Landing page submissions · {total} total
            {newCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {newCount} new
              </span>
            )}
          </p>
        </div>
        <button onClick={fetchContacts}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statsData.map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 ${color}`}>
              {icon}
            </div>
            <div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 focus-within:border-indigo-400 transition">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, company, reference ID..."
            defaultValue={search}
            onChange={e => {
              const val = e.target.value;
              if (searchTimer.current) clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(() => handleSearch(val), 350);
            }}
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => { handleSearch(""); (document.querySelector("input[placeholder*='Search']") as HTMLInputElement).value = ""; }}>
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[{ val: "", label: "All" }, ...statuses.map(s => ({ val: s, label: STATUS_CFG[s].label }))].map(({ val, label }) => (
            <button key={val} onClick={() => { setStatusFilter(val); setPage(1); }}
              className={`h-9 px-3 rounded-lg border text-xs font-medium cursor-pointer transition ${
                statusFilter === val
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {label}
              {val === "new" && newCount > 0 && (
                <span className="ml-1.5 bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Reference","Contact","Company","Inquiry","Message","Status","Received","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-slate-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Mail className="w-7 h-7 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium text-sm">No contact inquiries found</p>
                      {(search || statusFilter) && (
                        <button onClick={() => { setSearch(""); setStatusFilter(""); }}
                          className="text-xs text-indigo-600 hover:underline cursor-pointer">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : contacts.map(contact => {
                const cfg = STATUS_CFG[contact.status];
                const isNew = contact.status === "new";
                return (
                  <tr
                    key={contact._id}
                    onClick={() => setSelected(contact)}
                    className={`hover:bg-slate-50 transition cursor-pointer group ${isNew ? "bg-blue-50/30" : ""}`}
                  >
                    {/* Reference */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isNew && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                        <span className="font-mono text-[11px] text-slate-500">{contact.referenceId}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-semibold text-slate-800">{contact.name}</p>
                      <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()}
                        className="text-xs text-indigo-600 hover:underline">{contact.email}</a>
                      {contact.phone && (
                        <p className="text-[10px] text-slate-400">{contact.phone}</p>
                      )}
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-700">{contact.company}</span>
                      </div>
                      {contact.teamSize && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] text-slate-400">{contact.teamSize}</span>
                        </div>
                      )}
                    </td>

                    {/* Inquiry type */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {contact.inquiryType ? (
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${INQUIRY_CFG[contact.inquiryType] ?? "bg-slate-100 text-slate-600"}`}>
                          {contact.inquiryType}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Message preview */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-xs text-slate-600 truncate">{contact.message}</p>
                      {contact.notes && (
                        <p className="text-[10px] text-indigo-500 mt-0.5 flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" /> Has notes
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border inline-flex items-center gap-1.5 ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs text-slate-600">{fmtDate(contact.createdAt)}</p>
                      <p className="text-[10px] text-slate-400">{timeAgo(contact.createdAt)}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(contact); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer transition"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {contact.status === "new" && (
                          <button
                            onClick={e => quickStatus(contact._id, "read", e)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-green-50 hover:text-green-600 hover:border-green-200 cursor-pointer transition"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {contact.status !== "closed" && (
                          <button
                            onClick={e => quickStatus(contact._id, "closed", e)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer transition"
                            title="Close"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <a
                          href={`mailto:${contact.email}?subject=Re: Your inquiry (${contact.referenceId})`}
                          onClick={e => e.stopPropagation()}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer transition"
                          title="Reply via email"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center border rounded-lg text-xs font-medium cursor-pointer transition ${
                    p === page ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          contact={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}