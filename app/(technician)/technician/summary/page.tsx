"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Clock, Star, TrendingUp, Calendar, Briefcase } from "lucide-react";

interface DailyStats {
  date: string;
  assigned: number;
  completed: number;
  inProgress: number;
  avgTime: string;
  rating: number;
}

export default function TechnicianSummaryPage() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ day: string; completed: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tickets?limit=50", { credentials: "include" })
      .then(r => r.json()).then(data => {
        const tickets = data.data?.tickets ?? [];
        const today = new Date().toDateString();
        const todayTickets = tickets.filter((t: any) => new Date(t.updatedAt).toDateString() === today);
        setStats({
          date: new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }),
          assigned: tickets.filter((t: any) => t.status === "open").length,
          completed: tickets.filter((t: any) => t.status === "resolved").length,
          inProgress: tickets.filter((t: any) => t.status === "in_progress").length,
          avgTime: "3.2h",
          rating: 4.5,
        });
        // Mock weekly data
        setWeeklyData([
          { day: "Mon", completed: 5 }, { day: "Tue", completed: 7 }, { day: "Wed", completed: 4 },
          { day: "Thu", completed: 8 }, { day: "Fri", completed: 6 }, { day: "Sat", completed: 3 }, { day: "Sun", completed: 0 },
        ]);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const maxVal = Math.max(...weeklyData.map(d => d.completed), 1);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Daily Summary</h1>
          <p className="text-xs text-slate-400 mt-0.5">{stats?.date ?? "Today"}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">Today</span>
        </div>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Completed", value: stats?.completed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "In progress", value: stats?.inProgress, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Pending", value: stats?.assigned, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Rating", value: stats?.rating?.toFixed(1), icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            {loading ? <div className="h-7 bg-slate-200 rounded w-12 mx-auto animate-pulse mb-1" /> : <p className={`text-2xl font-bold ${color}`}>{value ?? "—"}</p>}
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">This week's performance</p>
        </div>
        <div className="p-5">
          <div className="flex items-end gap-3 h-32">
            {weeklyData.map(({ day, completed }) => {
              const h = maxVal > 0 ? Math.round((completed / maxVal) * 100) : 0;
              const isToday = day === new Date().toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3);
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-slate-500">{completed}</span>
                  <div className="w-full flex items-end justify-center">
                    <div
                      className={`w-full rounded-t-lg ${isToday ? "bg-amber-500" : "bg-slate-200"} transition-all`}
                      style={{ height: `${Math.max(h, 4)}%`, minHeight: 4, maxHeight: 100 }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${isToday ? "text-amber-600" : "text-slate-400"}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance note */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-800">Great work today!</p>
            <p className="text-xs text-slate-500 mt-0.5">
              You've completed {stats?.completed ?? 0} jobs. Average resolution time: {stats?.avgTime ?? "—"}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}