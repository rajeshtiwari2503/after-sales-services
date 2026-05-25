 

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import toast from "react-hot-toast";
// import {
//   ArrowLeft, Edit, Trash2, Printer, Clock, Users,
//   Info, History, StickyNote, RefreshCw, AlertCircle,
//   CheckCircle, Ticket, Send,
// } from "lucide-react";

// // ─── Types ──────────────────────────────────────────────────────
// interface TicketDetail {
//   _id: string;
//   ticketNumber: string;
//   title: string;
//   description: string;
//   status: string;
//   priority: string;
//   category: string;
//   tenantId: string;
//   customerId: { _id: string; name: string; email: string; phone?: string } | null;
//   technicianId: { _id: string; name: string; email: string } | null;
//   notes: Note[];
//   timeline: TimelineEvent[];
//   sla?: { responseDeadline: Date; resolutionDeadline: Date; isResponseBreached: boolean; isResolutionBreached: boolean };
//   estimatedCompletionDate?: string;
//   actualCompletionDate?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Note {
//   _id: string;
//   content: string;
//   authorName: string;
//   isInternal: boolean;
//   createdAt: string;
// }

// interface TimelineEvent {
//   _id: string;
//   action: string;
//   description: string;
//   performedByName: string;
//   createdAt: string;
//   metadata?: any;
// }

// // ─── Constants ──────────────────────────────────────────────────
// const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
//   open: { label: "Open", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-800 border-blue-100" },
//   in_progress: { label: "In Progress", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800 border-amber-100" },
//   pending_parts: { label: "Pending Parts", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-800 border-violet-100" },
//   pending_customer: { label: "Pending Customer", dot: "bg-violet-400", badge: "bg-violet-50 text-violet-700 border-violet-100" },
//   resolved: { label: "Resolved", dot: "bg-green-500", badge: "bg-green-50 text-green-800 border-green-100" },
//   closed: { label: "Closed", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" },
//   cancelled: { label: "Cancelled", dot: "bg-red-400", badge: "bg-red-50 text-red-700 border-red-100" },
// };

// const PRIORITY_CONFIG: Record<string, string> = {
//   low: "bg-green-50 text-green-700 border-green-100",
//   medium: "bg-amber-50 text-amber-700 border-amber-100",
//   high: "bg-orange-50 text-orange-700 border-orange-100",
//   critical: "bg-red-50 text-red-700 border-red-100",
// };

// const TIMELINE_ICON: Record<string, { icon: React.ReactNode; bg: string }> = {
//   ticket_created: { icon: <Ticket className="w-3 h-3" />, bg: "bg-blue-50 border-blue-100 text-blue-600" },
//   status_changed: { icon: <RefreshCw className="w-3 h-3" />, bg: "bg-amber-50 border-amber-100 text-amber-600" },
//   note_added: { icon: <StickyNote className="w-3 h-3" />, bg: "bg-violet-50 border-violet-100 text-violet-600" },
//   ticket_updated: { icon: <Edit className="w-3 h-3" />, bg: "bg-slate-50 border-slate-200 text-slate-500" },
//   assigned: { icon: <Users className="w-3 h-3" />, bg: "bg-green-50 border-green-100 text-green-600" },
// };

// const ALL_STATUSES = [
//   "open", "in_progress", "pending_parts", "pending_customer", "resolved", "closed", "cancelled",
// ] as const;

// // ─── Helpers ────────────────────────────────────────────────────
// const initials = (name?: string) =>
//   (name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// const fmtDate = (iso?: string) =>
//   iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// const fmtDateTime = (iso?: string) =>
//   iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

// const slaPercent = (deadline?: string) => {
//   if (!deadline) return 0;
//   const now = Date.now();
//   const end = new Date(deadline).getTime();
//   const total = end - now;
//   if (total <= 0) return 100;
//   return Math.min(100, Math.round(((24 * 60 * 60 * 1000 - total) / (24 * 60 * 60 * 1000)) * 100));
// };

// // ─── Sub-components ─────────────────────────────────────────────
// function StatusBadge({ status }: { status: string }) {
//   const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
//   return (
//     <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
//       <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
//       {cfg.label}
//     </span>
//   );
// }

// function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
//   return (
//     <div className={`bg-white rounded-xl border border-slate-200/80 overflow-hidden ${className}`}>
//       {children}
//     </div>
//   );
// }

// function CardHead({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
//   return (
//     <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
//       <div className="flex items-center gap-2.5">
//         {icon}
//         <div>
//           <p className="text-sm font-semibold text-slate-800">{title}</p>
//           {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
//         </div>
//       </div>
//       {action}
//     </div>
//   );
// }

// // ─── Main Page ───────────────────────────────────────────────────
// export default function TicketDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();

//   const [ticket, setTicket] = useState<TicketDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [statusLoading, setStatusLoading] = useState(false);
//   const [noteContent, setNoteContent] = useState("");
//   const [isInternal, setIsInternal] = useState(false);
//   const [noteLoading, setNoteLoading] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const noteRef = useRef<HTMLTextAreaElement>(null);

//   // ── Fetch ──
//   const fetchTicket = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/tickets/${id}`, { credentials: "include" });
//       if (!res.ok) throw new Error("Ticket not found");
//       const data = await res.json();
//       setTicket(data.data ?? data);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchTicket(); }, [id]);

//   // ── Status change ──
//   const handleStatusChange = async (status: string) => {
//     if (ticket?.status === status) return;
//     setStatusLoading(true);
//     try {
//       const res = await fetch(`/api/tickets/${id}/status`, {
//         method: "PATCH",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status }),
//       });
//       if (!res.ok) throw new Error("Status update failed");
//       const data = await res.json();
//       setTicket(data.data ?? data);
//       toast.success(`Status changed to ${STATUS_CONFIG[status]?.label ?? status}`);
//     } catch {
//       toast.error("Failed to update status");
//     } finally {
//       setStatusLoading(false);
//     }
//   };

//   // ── Add note ──
//   const handleAddNote = async () => {
//     if (!noteContent.trim()) return;
//     setNoteLoading(true);
//     try {
//       const res = await fetch(`/api/tickets/${id}/notes`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: noteContent, isInternal }),
//       });
//       if (!res.ok) throw new Error("Failed to add note");
//       const data = await res.json();
//       setTicket(data.data ?? data);
//       setNoteContent("");
//       setIsInternal(false);
//       toast.success("Note added");
//     } catch {
//       toast.error("Failed to add note");
//     } finally {
//       setNoteLoading(false);
//     }
//   };

//   // ── Delete ──
//   const handleDelete = async () => {
//     if (!confirm("Permanently delete this ticket?")) return;
//     setDeleting(true);
//     try {
//       const res = await fetch(`/api/tickets/${id}`, { method: "DELETE", credentials: "include" });
//       if (!res.ok) throw new Error("Delete failed");
//       toast.success("Ticket deleted");
//       router.push("/dashboard/tickets");
//     } catch {
//       toast.error("Failed to delete ticket");
//       setDeleting(false);
//     }
//   };

//   // ── Loading ──
//   if (loading) {
//     return (
//       <div className="max-w-6xl mx-auto space-y-5 animate-pulse">
//         <div className="h-8 bg-slate-200 rounded w-1/3" />
//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
//           <div className="space-y-5">
//             {[200, 300, 250].map((h, i) => (
//               <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
//                 <div className="h-12 bg-slate-100" />
//                 <div className="p-5 space-y-3">
//                   <div className="h-4 bg-slate-200 rounded w-3/4" />
//                   <div className="h-3 bg-slate-100 rounded w-full" />
//                   <div className="h-3 bg-slate-100 rounded w-5/6" />
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="space-y-5">
//             {[150, 180, 120].map((h, i) => (
//               <div key={i} className="bg-white rounded-xl border border-slate-200 h-36 animate-pulse" />
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !ticket) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96 gap-4">
//         <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
//           <AlertCircle className="w-6 h-6 text-red-500" />
//         </div>
//         <p className="text-slate-700 font-semibold">{error ?? "Ticket not found"}</p>
//         <button onClick={fetchTicket} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm cursor-pointer">
//           <RefreshCw className="w-4 h-4" /> Retry
//         </button>
//       </div>
//     );
//   }

//   const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
//   const pct = slaPercent(ticket.sla?.resolutionDeadline?.toString());

//   return (
//     <div className="max-w-6xl mx-auto space-y-5">

//       {/* ── Top bar ── */}
//       <div className="flex items-start justify-between gap-4 flex-wrap">
//         <div className="flex items-center gap-3 flex-wrap">
//           <Link href="/dashboard/tickets"
//             className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer">
//             <ArrowLeft className="w-4 h-4" />
//           </Link>
//           <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
//             {ticket.ticketNumber}
//           </span>
//           <StatusBadge status={ticket.status} />
//           <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${PRIORITY_CONFIG[ticket.priority] ?? ""}`}>
//             {ticket.priority}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => window.print()}
//             className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
//           >
//             <Printer className="w-3.5 h-3.5" /> Print
//           </button>
//           <Link
//             href={`/dashboard/tickets/${id}/edit`}
//             className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
//           >
//             <Edit className="w-3.5 h-3.5" /> Edit
//           </Link>
//           <button
//             onClick={handleDelete}
//             disabled={deleting}
//             className="flex items-center gap-1.5 h-8 px-3 border border-red-200 bg-red-50 rounded-lg text-xs text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-60"
//           >
//             {deleting
//               ? <span className="w-3.5 h-3.5 border border-red-300 border-t-red-600 rounded-full animate-spin" />
//               : <Trash2 className="w-3.5 h-3.5" />
//             }
//             Delete
//           </button>
//         </div>
//       </div>

//       {/* ── Main grid ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

//         {/* ─ Left column ─ */}
//         <div className="space-y-5">

//           {/* Details card */}
//           <Card>
//             <CardHead
//               icon={<div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Ticket className="w-4 h-4 text-indigo-500" /></div>}
//               title="Ticket details"
//               subtitle={`Created ${fmtDate(ticket.createdAt)}`}
//             />
//             <div className="p-5">
//               <h2 className="text-lg font-bold text-slate-800 mb-4 leading-snug">{ticket.title}</h2>
//               <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
//                 {ticket.description}
//               </div>
//             </div>
//           </Card>

//           {/* Timeline */}
//           <Card>
//             <CardHead
//               icon={<div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><History className="w-4 h-4 text-green-600" /></div>}
//               title="Timeline"
//               subtitle={`${ticket.timeline.length} events`}
//             />
//             <div className="p-5">
//               {ticket.timeline.length === 0 ? (
//                 <p className="text-sm text-slate-400 text-center py-6">No timeline events yet</p>
//               ) : (
//                 <div className="space-y-0">
//                   {[...ticket.timeline].reverse().map((event, i) => {
//                     const cfg = TIMELINE_ICON[event.action] ?? TIMELINE_ICON.ticket_updated;
//                     const isLast = i === ticket.timeline.length - 1;
//                     return (
//                       <div key={event._id ?? i} className="flex gap-3 pb-4 relative">
//                         {!isLast && (
//                           <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-100" />
//                         )}
//                         <div className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center shrink-0 ${cfg.bg}`}>
//                           {cfg.icon}
//                         </div>
//                         <div className="flex-1 min-w-0 pt-0.5">
//                           <p className="text-sm font-medium text-slate-700">{event.description}</p>
//                           <p className="text-xs text-slate-400 mt-0.5">
//                             {event.performedByName} · {fmtDateTime(event.createdAt)}
//                           </p>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </Card>

//           {/* Notes */}
//           <Card>
//             <CardHead
//               icon={<div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><StickyNote className="w-4 h-4 text-violet-500" /></div>}
//               title="Notes"
//               subtitle={`${ticket.notes.length} notes`}
//             />

//             {/* Existing notes */}
//             {ticket.notes.length > 0 && (
//               <div className="divide-y divide-slate-100">
//                 {ticket.notes.map((note, i) => (
//                   <div key={note._id ?? i} className="px-5 py-4">
//                     <div className="flex items-center gap-2 mb-2">
//                       <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
//                         {initials(note.authorName)}
//                       </div>
//                       <span className="text-xs font-semibold text-slate-700">{note.authorName}</span>
//                       {note.isInternal && (
//                         <span className="text-[10px] bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-full border border-violet-100 font-medium">
//                           Internal
//                         </span>
//                       )}
//                       <span className="text-xs text-slate-400 ml-auto">{fmtDateTime(note.createdAt)}</span>
//                     </div>
//                     <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Add note */}
//             <div className="p-5 border-t border-slate-100">
//               <div className="border border-slate-200 rounded-lg overflow-hidden">
//                 <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border-b border-slate-200">
//                   <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
//                     RS
//                   </div>
//                   <span className="text-xs text-slate-500">Add a note or update</span>
//                 </div>
//                 <textarea
//                   ref={noteRef}
//                   value={noteContent}
//                   onChange={(e) => setNoteContent(e.target.value)}
//                   placeholder="Write a note, update, or internal comment..."
//                   rows={3}
//                   className="w-full px-4 py-3 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
//                 />
//                 <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-t border-slate-200">
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={isInternal}
//                       onChange={(e) => setIsInternal(e.target.checked)}
//                       className="cursor-pointer"
//                     />
//                     <span className="text-xs text-slate-500">Internal only</span>
//                   </label>
//                   <button
//                     onClick={handleAddNote}
//                     disabled={noteLoading || !noteContent.trim()}
//                     className="flex items-center gap-1.5 h-8 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition cursor-pointer"
//                   >
//                     {noteLoading
//                       ? <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
//                       : <Send className="w-3.5 h-3.5" />
//                     }
//                     Add note
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </Card>
//         </div>

//         {/* ─ Right column ─ */}
//         <div className="space-y-4">

//           {/* Status change */}
//           <Card>
//             <CardHead
//               icon={<div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><RefreshCw className="w-4 h-4 text-amber-600" /></div>}
//               title="Status"
//             />
//             <div className="p-4 grid grid-cols-2 gap-2">
//               {ALL_STATUSES.map((s) => {
//                 const cfg = STATUS_CONFIG[s];
//                 const isActive = ticket.status === s;
//                 return (
//                   <button
//                     key={s}
//                     onClick={() => handleStatusChange(s)}
//                     disabled={statusLoading}
//                     className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[11px] font-medium transition cursor-pointer
//                       ${isActive
//                         ? `${cfg.badge} border-current`
//                         : "border-slate-200 text-slate-500 hover:bg-slate-50 bg-slate-50/50"
//                       } ${statusLoading ? "opacity-60 cursor-not-allowed" : ""}`}
//                   >
//                     <span className={`w-1.5 h-1.5 rounded-full ${isActive ? cfg.dot : "bg-slate-300"}`} />
//                     {cfg.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </Card>

//           {/* Details */}
//           <Card>
//             <CardHead
//               icon={<div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Info className="w-4 h-4 text-slate-500" /></div>}
//               title="Details"
//             />
//             <div className="divide-y divide-slate-100">
//               {[
//                 { label: "Category", value: ticket.category },
//                 { label: "Priority", value: <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_CONFIG[ticket.priority]}`}>{ticket.priority}</span> },
//                 { label: "Tenant", value: ticket.tenantId },
//                 { label: "Created", value: fmtDate(ticket.createdAt) },
//                 { label: "Updated", value: fmtDate(ticket.updatedAt) },
//                 { label: "Est. complete", value: fmtDate(ticket.estimatedCompletionDate) },
//                 ...(ticket.actualCompletionDate ? [{ label: "Completed", value: fmtDate(ticket.actualCompletionDate) }] : []),
//               ].map(({ label, value }) => (
//                 <div key={label} className="flex items-center justify-between px-4 py-2.5">
//                   <span className="text-xs text-slate-400">{label}</span>
//                   <span className="text-xs font-medium text-slate-700 capitalize">{value}</span>
//                 </div>
//               ))}
//             </div>
//           </Card>

//           {/* People */}
//           <Card>
//             <CardHead
//               icon={<div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div>}
//               title="People"
//             />
//             <div className="divide-y divide-slate-100">
//               <div className="flex items-center justify-between px-4 py-3">
//                 <span className="text-xs text-slate-400">Customer</span>
//                 {ticket.customerId ? (
//                   <div className="flex items-center gap-2">
//                     <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
//                       {initials(ticket.customerId.name)}
//                     </div>
//                     <div className="text-right">
//                       <p className="text-xs font-medium text-slate-700">{ticket.customerId.name}</p>
//                       <p className="text-[10px] text-slate-400">{ticket.customerId.email}</p>
//                     </div>
//                   </div>
//                 ) : <span className="text-xs text-slate-400">—</span>}
//               </div>
//               <div className="flex items-center justify-between px-4 py-3">
//                 <span className="text-xs text-slate-400">Technician</span>
//                 {ticket.technicianId ? (
//                   <div className="flex items-center gap-2">
//                     <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold">
//                       {initials(ticket.technicianId.name)}
//                     </div>
//                     <p className="text-xs font-medium text-slate-700">{ticket.technicianId.name}</p>
//                   </div>
//                 ) : <span className="text-xs text-slate-400">Unassigned</span>}
//               </div>
//             </div>
//           </Card>

//           {/* SLA */}
//           {ticket.sla && (
//             <Card>
//               <CardHead
//                 icon={<div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-600" /></div>}
//                 title="SLA"
//               />
//               <div className="p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-slate-400">Response</span>
//                   <span className={`text-xs font-medium flex items-center gap-1 ${ticket.sla.isResponseBreached ? "text-red-600" : "text-green-600"}`}>
//                     {ticket.sla.isResponseBreached
//                       ? <><AlertCircle className="w-3 h-3" /> Breached</>
//                       : <><CheckCircle className="w-3 h-3" /> Met</>
//                     }
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-slate-400">Resolution deadline</span>
//                   <span className="text-xs font-medium text-slate-700">
//                     {fmtDateTime(ticket.sla.resolutionDeadline?.toString())}
//                   </span>
//                 </div>
//                 <div>
//                   <div className="flex justify-between text-xs text-slate-400 mb-1.5">
//                     <span>Time elapsed</span>
//                     <span>{pct}%</span>
//                   </div>
//                   <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                     <div
//                       className={`h-full rounded-full transition-all ${pct < 60 ? "bg-blue-500" : pct < 85 ? "bg-amber-500" : "bg-red-500"}`}
//                       style={{ width: `${pct}%` }}
//                     />
//                   </div>
//                   {ticket.sla.isResolutionBreached && (
//                     <p className="text-[10px] text-red-600 mt-1.5 flex items-center gap-1">
//                       <AlertCircle className="w-3 h-3" /> Resolution SLA breached
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertCircle, RefreshCw, Info, Calendar } from "lucide-react";

import TicketHeader from "@/components/tickets/TicketHeader";
import TicketCustomerInfo from "@/components/tickets/TicketCustomerInfo";
import TicketTimeline from "@/components/tickets/TicketTimeline";
import TicketNotes from "@/components/tickets/TicketNotes";
import TicketAssignment from "@/components/tickets/TicketAssignment";
import TicketStatusWorkflow from "@/components/tickets/TicketStatusWorkflow";
import TicketAttachments from "@/components/tickets/TicketAttachments";
import TicketSLA from "@/components/tickets/TicketSLA";
import TicketParts from "@/components/tickets/TicketParts";

import { TicketStatus } from "@/types/ticket";

interface TicketDetail {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  tenantId: string;
  customerId: { _id: string; name: string; email: string; phone?: string } | null;
  technicianId: { _id: string; name: string; email: string } | null;
  serviceCenterId: { _id: string; name: string; address?: string } | null;
  notes: any[];
  timeline: any[];
  attachments: any[];
  sla?: any;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

function SkeletonPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-pulse">
      <div className="h-10 bg-slate-200 rounded w-2/5" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-5">
          {[180, 280, 240].map((h, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="h-12 bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[150, 200, 160].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-36" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Ticket not found");
      const data = await res.json();
      setTicket(data.data ?? data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const handleStatusChange = async (status: TicketStatus) => {
    if (ticket?.status === status) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTicket(data.data ?? data);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this ticket? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Ticket deleted");
      router.push("/dashboard/tickets");
    } catch {
      toast.error("Failed to delete ticket");
      setDeleting(false);
    }
  };

  if (loading) return <SkeletonPage />;

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-slate-700 font-semibold">{error ?? "Ticket not found"}</p>
        <button
          onClick={fetchTicket}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Header ── */}
      <TicketHeader
        ticketId={ticket._id}
        ticketNumber={ticket.ticketNumber}
        title={ticket.title}
        status={ticket.status}
        priority={ticket.priority}
        deleting={deleting}
        onDelete={handleDelete}
        onRefresh={fetchTicket}
        onEscalated={fetchTicket}
      />

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

        {/* ─ Left column ─ */}
        <div className="space-y-5">

          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Info className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Description</p>
                <p className="text-xs text-slate-400 capitalize">{ticket.category} · {ticket.priority} priority</p>
              </div>
            </div>
            <div className="p-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-[10px] font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full capitalize border border-slate-200">
                  {ticket.category}
                </span>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border capitalize ${PRIORITY_BADGE[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                {ticket.estimatedCompletionDate && (
                  <span className="text-[10px] font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    Est. {fmtDate(ticket.estimatedCompletionDate)}
                  </span>
                )}
                {ticket.actualCompletionDate && (
                  <span className="text-[10px] font-medium px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    Completed {fmtDate(ticket.actualCompletionDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <TicketAttachments
            ticketId={ticket._id}
            attachments={ticket.attachments ?? []}
            onUpdate={fetchTicket}
          />

          {/* Parts Used */}
          <TicketParts ticketId={ticket._id} />

          {/* Timeline */}
          <TicketTimeline timeline={ticket.timeline ?? []} />

          {/* Notes */}
          <TicketNotes
            ticketId={ticket._id}
            notes={ticket.notes ?? []}
            onUpdate={fetchTicket}
          />
        </div>

        {/* ─ Right column ─ */}
        <div className="space-y-4">

          {/* Status workflow */}
          <TicketStatusWorkflow
            currentStatus={ticket.status}
            loading={statusLoading}
            onStatusChange={handleStatusChange}
          />

          {/* Customer info */}
          <TicketCustomerInfo
            customer={ticket.customerId}
            serviceCenter={ticket.serviceCenterId  as any}
          />

          {/* Assignment */}
          <TicketAssignment
            ticketId={ticket._id}
            currentTechnicianId={ticket.technicianId?._id}
            currentServiceCenterId={ticket.serviceCenterId?._id}
            onUpdate={fetchTicket}
          />

          {/* SLA */}
          <TicketSLA sla={ticket.sla} />

          {/* Ticket meta */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Info className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Details</p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { label: "Ticket ID", value: ticket.ticketNumber, mono: true },
                { label: "Tenant", value: ticket.tenantId },
                { label: "Created", value: fmtDate(ticket.createdAt) },
                { label: "Updated", value: fmtDate(ticket.updatedAt) },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className={`text-xs font-medium text-slate-700 ${mono ? "font-mono" : ""}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}