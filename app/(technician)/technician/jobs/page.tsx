"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, Play, Pause, CheckCircle, MessageSquare, Camera, Clock, Filter } from "lucide-react";
import toast from "react-hot-toast";

interface Job {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  customerId: { name: string; phone?: string } | null;
  createdAt: string;
  sla?: { resolutionDeadline: string; isResolutionBreached: boolean };
}

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: "Not started", color: "text-blue-600" },
  in_progress: { label: "In progress", color: "text-amber-600" },
  pending_customer: { label: "Waiting", color: "text-violet-600" },
  resolved: { label: "Completed", color: "text-green-600" },
};

export default function TechnicianJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const statusFilter = filter === "active" ? "open,in_progress" : filter === "completed" ? "resolved,closed" : "";
      const res = await fetch(`/api/tickets?${statusFilter ? `status=${statusFilter}` : ""}&limit=50`, { credentials: "include" });
      const data = await res.json();
      setJobs(data.data?.tickets ?? []);
    } catch { toast.error("Failed to load jobs"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Job status updated");
      fetchJobs();
    } catch { toast.error("Failed to update status"); }
    finally { setUpdating(null); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Jobs</h1>
        <p className="text-xs text-slate-400 mt-0.5">{jobs.length} jobs</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg w-fit">
        {[
          { key: "active", label: "Active" },
          { key: "completed", label: "Completed" },
          { key: "", label: "All" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`h-8 px-4 rounded-md text-xs font-medium transition cursor-pointer
              ${filter === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Job list */}
      <div className="space-y-3">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="flex gap-2 mt-3"><div className="h-8 bg-slate-200 rounded w-20" /><div className="h-8 bg-slate-200 rounded w-20" /></div>
          </div>
        )) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 py-16 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No {filter || ""} jobs</p>
          </div>
        ) : jobs.map(job => {
          const statusCfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.open;
          const isActive = !["resolved", "closed", "cancelled"].includes(job.status);
          return (
            <div key={job._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-amber-200 transition">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-slate-400">{job.ticketNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_BADGE[job.priority] ?? ""}`}>{job.priority}</span>
                    <span className={`text-xs font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">{job.title}</h3>
                  {job.customerId?.name && (
                    <p className="text-xs text-slate-500 mt-0.5">Customer: {job.customerId.name}</p>
                  )}
                </div>
                {job.sla?.isResolutionBreached && (
                  <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-full font-semibold shrink-0">SLA Breached</span>
                )}
              </div>

              {/* Actions */}
              {isActive && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  {job.status === "open" && (
                    <button onClick={() => updateStatus(job._id, "in_progress")} disabled={updating === job._id}
                      className="flex items-center gap-1.5 h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer">
                      {updating === job._id ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      Start job
                    </button>
                  )}
                  {job.status === "in_progress" && (
                    <>
                      <button onClick={() => updateStatus(job._id, "pending_customer")} disabled={updating === job._id}
                        className="flex items-center gap-1.5 h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium cursor-pointer">
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </button>
                      <button onClick={() => updateStatus(job._id, "resolved")} disabled={updating === job._id}
                        className="flex items-center gap-1.5 h-8 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium cursor-pointer">
                        <CheckCircle className="w-3.5 h-3.5" /> Complete
                      </button>
                    </>
                  )}
                  {job.status === "pending_customer" && (
                    <button onClick={() => updateStatus(job._id, "in_progress")} disabled={updating === job._id}
                      className="flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer">
                      <Play className="w-3.5 h-3.5" /> Resume
                    </button>
                  )}
                  <Link href={`/technician/chat/${job._id}`}
                    className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </Link>
                  <Link href={`/technician/photos/${job._id}`}
                    className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer">
                    <Camera className="w-3.5 h-3.5" /> Photos
                  </Link>
                  <Link href={`/technician/jobs/${job._id}`}
                    className="ml-auto text-xs text-indigo-600 hover:underline cursor-pointer">
                    View details →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}