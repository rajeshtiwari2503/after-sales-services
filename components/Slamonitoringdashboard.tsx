"use client";
import { useState, useEffect, useCallback } from "react";

interface SLATicket {
  id: string;
  ticketNumber: string;
  priority: string;
  slaDueAt: string;
  isBreached: boolean;
  minutesRemaining: number | null;
}

interface SLAData {
  total: number;
  onTrack: number;
  atRisk: number;
  breached: number;
  byPriority: Record<string, { total: number; breached: number }>;
  atRiskTickets: SLATicket[];
  complianceRate: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700", low: "bg-gray-100 text-gray-600",
};

function formatTimeLeft(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 0) return `${Math.abs(minutes)}m overdue`;
  if (minutes < 60) return `${minutes}m left`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m left`;
}

export default function SLAMonitoringDashboard() {
  const [data, setData] = useState<SLAData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSLA = useCallback(async () => {
    try {
      const res = await fetch("/api/sla");
      const d = await res.json();
      if (d.success) setData(d.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSLA();
    const iv = setInterval(fetchSLA, 60000); // refresh every minute
    return () => clearInterval(iv);
  }, [fetchSLA]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading SLA data...</div>;
  if (!data) return null;

  const compliancePct = parseFloat(data.complianceRate);
  const complianceColor =
    compliancePct >= 90 ? "text-green-600" : compliancePct >= 75 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-4">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Compliance Rate</p>
          <p className={`text-2xl font-bold ${complianceColor}`}>{data.complianceRate}%</p>
        </div>
        {[
          { label: "On Track", value: data.onTrack, color: "text-green-600", bg: "bg-green-50" },
          { label: "At Risk", value: data.atRisk, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Breached", value: data.breached, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 mb-3">SLA by Priority</h3>
        <div className="space-y-3">
          {Object.entries(data.byPriority).map(([priority, stats]) => {
            const breachPct = stats.total > 0 ? (stats.breached / stats.total) * 100 : 0;
            return (
              <div key={priority}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[priority]}`}>
                    {priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    {stats.breached}/{stats.total} breached
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${breachPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* At Risk / Breached Tickets Table */}
      {data.atRiskTickets.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">
              🚨 Attention Required ({data.atRiskTickets.length})
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left">Ticket #</th>
                <th className="px-4 py-2 text-left">Priority</th>
                <th className="px-4 py-2 text-left">SLA Due</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.atRiskTickets.map((t) => (
                <tr key={t.id} className={t.isBreached ? "bg-red-50" : "bg-yellow-50"}>
                  <td className="px-4 py-3 font-medium text-blue-600">#{t.ticketNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_COLORS[t.priority]}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {t.slaDueAt ? new Date(t.slaDueAt).toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {t.isBreached ? (
                      <span className="text-red-600 font-medium text-xs">
                        ❌ {formatTimeLeft(t.minutesRemaining)}
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium text-xs">
                        ⚠️ {formatTimeLeft(t.minutesRemaining)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/dashboard/tickets/${t.id}`} className="text-blue-600 hover:underline text-xs">
                      View →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}