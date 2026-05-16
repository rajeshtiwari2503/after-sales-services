"use client";
import { useState, useEffect } from "react";
import { FileText, Download, BarChart2, TrendingUp, Clock, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

type Range = "7" | "30" | "90";

export default function SCReportsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("30");
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, techRes] = await Promise.all([
        fetch(`/api/analytics/overview?range=${range}`, { credentials: "include" }),
        fetch("/api/technicians", { credentials: "include" }),
      ]);
      const [analyticsData, techData] = await Promise.all([analyticsRes.json(), techRes.json()]);
      setAnalytics({
        ...analyticsData.data,
        technicians: techData.data ?? [],
      });
    } catch { toast.error("Failed to load report data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [range]);

  const handleExport = async (type: "csv" | "pdf") => {
    setExporting(true);
    try {
      await new Promise(r => setTimeout(r, 1000)); // mock export
      toast.success(`Report exported as ${type.toUpperCase()}`);
    } catch { toast.error("Export failed"); }
    finally { setExporting(false); }
  };

  const kpis = analytics?.kpis;

  const summaryRows = kpis ? [
    { label: "Total tickets", value: kpis.totalTickets },
    { label: "Resolved tickets", value: kpis.resolvedTickets },
    { label: "Resolution rate", value: `${kpis.resolutionRate}%` },
    { label: "Open tickets", value: kpis.openTickets },
    { label: "In progress", value: kpis.inProgressTickets },
    { label: "Pending", value: kpis.pendingTickets },
    { label: "SLA compliance", value: `${kpis.slaComplianceRate}%` },
    { label: "Avg resolution time", value: `${kpis.avgResolutionHours}h` },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">Performance insights & exports</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {(["7", "30", "90"] as Range[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`h-7 px-3 rounded-md text-xs font-medium transition cursor-pointer
                  ${range === r ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {r === "7" ? "7 days" : r === "30" ? "30 days" : "90 days"}
              </button>
            ))}
          </div>
          <button onClick={fetchData}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3">
        {[
          { label: "Export CSV", type: "csv" as const, icon: FileText },
          { label: "Export PDF", type: "pdf" as const, icon: Download },
        ].map(({ label, type, icon: Icon }) => (
          <button key={type} onClick={() => handleExport(type)} disabled={exporting}
            className="flex items-center gap-2 h-9 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium cursor-pointer transition disabled:opacity-60">
            <Icon className="w-4 h-4" />
            {exporting ? "Exporting..." : label}
          </button>
        ))}
      </div>

      {/* Summary metrics */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Performance summary</p>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-32" />
              <div className="h-4 bg-slate-200 rounded w-16" />
            </div>
          )) : summaryRows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-slate-600">{label}</span>
              <span className="text-sm font-semibold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technician report */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Technician performance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Technician", "Employee ID", "Total tickets", "Completed", "Rating", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? Array(4).fill(0).map((_, i) => (
                <tr key={i}>{Array(6).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>
                ))}</tr>
              )) : (analytics?.technicians ?? []).length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">No technicians found</td></tr>
              ) : (analytics?.technicians ?? []).map((tech: any) => (
                <tr key={tech._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {tech.userId?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "T"}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{tech.userId?.name ?? "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{tech.employeeId}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{tech.totalTickets ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{tech.completedTickets ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-amber-600">{tech.rating?.toFixed(1) ?? "—"}</span>
                      <span className="text-amber-400">★</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${tech.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {tech.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}