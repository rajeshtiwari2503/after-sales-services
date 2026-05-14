"use client";

import { Wrench, Trophy } from "lucide-react";

interface TechStat {
  _id: string;
  name: string;
  total: number;
  resolved: number;
  rate: number;
}

interface Props {
  data: TechStat[];
  loading: boolean;
}

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const RANK_COLORS = ["text-amber-500", "text-slate-400", "text-orange-600"];

export default function TechnicianPerformance({ data, loading }: Props) {
  const max = Math.max(...data.map((d) => d.resolved), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Wrench className="w-4 h-4 text-indigo-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Technician performance</p>
          <p className="text-xs text-slate-400">Ranked by tickets resolved</p>
        </div>
      </div>

      {loading ? (
        <div className="p-5 space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-2 bg-slate-100 rounded w-full" />
              </div>
              <div className="w-10 h-3 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
          No technician data
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {data.map((tech, i) => (
            <div key={tech._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
              {/* Rank */}
              <div className="w-5 text-center shrink-0">
                {i < 3
                  ? <Trophy className={`w-3.5 h-3.5 ${RANK_COLORS[i]}`} />
                  : <span className="text-xs text-slate-400">{i + 1}</span>
                }
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                {initials(tech.name ?? "?")}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{tech.name ?? "Unknown"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${(tech.resolved / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{tech.resolved}/{tech.total}</span>
                </div>
              </div>

              {/* Rate */}
              <div className="text-right shrink-0">
                <span className={`text-sm font-bold ${
                  tech.rate >= 80 ? "text-green-600" : tech.rate >= 60 ? "text-amber-600" : "text-red-500"
                }`}>
                  {tech.rate}%
                </span>
                <p className="text-[10px] text-slate-400">rate</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}