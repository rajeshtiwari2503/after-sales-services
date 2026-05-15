"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle, Clock, Play, Pause, Camera, MessageSquare, CheckSquare } from "lucide-react";

interface Job {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  customerId: { name: string } | null;
  createdAt: string;
}

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

const STATUS_ACTIONS: Record<string, { label: string; next: string; color: string }> = {
  open: { label: "Start", next: "in_progress", color: "bg-indigo-600 hover:bg-indigo-700 text-white" },
  in_progress: { label: "Pause", next: "pending_customer", color: "bg-amber-500 hover:bg-amber-600 text-white" },
  pending_customer: { label: "Resume", next: "in_progress", color: "bg-blue-600 hover:bg-blue-700 text-white" },
};

export default function TechnicianDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/tickets?limit=10&technicianId=me", { credentials: "include" });
      const data = await res.json();
      const ticketList: Job[] = data.data?.tickets ?? [];
      setJobs(ticketList);
      setStats({
        assigned: ticketList.filter(t => t.status === 'open').length,
        inProgress: ticketList.filter(t => t.status === 'in_progress').length,
        completed: ticketList.filter(t => t.status === 'resolved').length,
      });
    } catch {}
  };

  useEffect(() => { fetchJobs().finally(() => setLoading(false)); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/tickets/${id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchJobs();
    } catch {} finally { setUpdating(null); }
  };

  const completeJob = async (id: string) => {
    await updateStatus(id, 'resolved');
  };

  const activeJobs = jobs.filter(j => !['resolved', 'closed', 'cancelled'].includes(j.status));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Jobs</h1>
          <p className="text-xs text-slate-400 mt-0.5">Today's task summary</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
          <Briefcase className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">Technician</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Assigned", value: stats.assigned, icon: Briefcase, color: "text-blue-600" },
          { label: "In progress", value: stats.inProgress, icon: Clock, color: "text-amber-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-slate-800">{loading ? "—" : value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Active job list */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Active jobs ({activeJobs.length})</p>
          <Link href="/technician/jobs" className="text-xs text-indigo-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="px-5 py-4 animate-pulse flex gap-3">
              <div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded w-3/4" /><div className="h-2.5 bg-slate-100 rounded w-1/2" /></div>
              <div className="w-16 h-7 bg-slate-200 rounded" />
            </div>
          )) : activeJobs.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
              All jobs completed!
            </div>
          ) : activeJobs.map((job) => {
            const action = STATUS_ACTIONS[job.status];
            return (
              <div key={job._id} className="flex items-center gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/technician/jobs/${job._id}`}>
                    <p className="text-sm font-medium text-slate-800 truncate hover:text-indigo-600 transition">{job.title}</p>
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {job.ticketNumber} · {job.customerId?.name ?? "—"}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${PRIORITY_BADGE[job.priority] ?? ""}`}>
                  {job.priority}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {action && (
                    <button onClick={() => updateStatus(job._id, action.next)}
                      disabled={updating === job._id}
                      className={`flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${action.color}`}>
                      {updating === job._id
                        ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        : action.label === "Start" ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />
                      }
                      {action.label}
                    </button>
                  )}
                  {job.status === 'in_progress' && (
                    <button onClick={() => completeJob(job._id)}
                      disabled={updating === job._id}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition cursor-pointer">
                      <CheckCircle className="w-3 h-3" /> Done
                    </button>
                  )}
                  <Link href={`/technician/chat/${job._id}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Link>
                  <Link href={`/technician/photos/${job._id}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily summary link */}
      <Link href="/technician/summary"
        className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 hover:border-amber-200 transition">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Daily summary</p>
            <p className="text-xs text-slate-400">View today's performance report</p>
          </div>
        </div>
        <span className="text-xs text-slate-400">→</span>
      </Link>
    </div>
  );
}