 "use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

interface TimelinePoint {
  _id: string;
  created: number;
  resolved: number;
}

interface Props {
  data: TimelinePoint[];
  loading: boolean;
}

export default function RevenueChart({ data, loading }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number;
    point: TimelinePoint;
  } | null>(null);

  const draw = () => {
    if (!data.length || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = containerRef.current.offsetWidth;
    const H = 220;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const pad = { top: 20, right: 16, bottom: 36, left: 36 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;
    const maxVal = Math.max(...data.map((d) => Math.max(d.created, d.resolved)), 1);

    ctx.clearRect(0, 0, W, H);

    // Y grid lines + labels
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = pad.top + (cH / steps) * i;
      const val = Math.round(maxVal * (1 - i / steps));
      ctx.beginPath();
      ctx.strokeStyle = "rgba(148,163,184,0.12)";
      ctx.lineWidth = 1;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(148,163,184,0.7)";
      ctx.font = `${9 * window.devicePixelRatio / window.devicePixelRatio}px system-ui`;
      ctx.textAlign = "right";
      ctx.fillText(String(val), pad.left - 5, y + 3);
    }

    const barW = cW / data.length;
    const barPad = Math.max(barW * 0.12, 2);
    const singleW = Math.max((barW - barPad * 2 - 3) / 2, 4);

    // Draw bars
    data.forEach((point, i) => {
      const x = pad.left + i * barW + barPad;

      // Created
      const h1 = (point.created / maxVal) * cH;
      ctx.fillStyle = "#4F8EF0";
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, pad.top + cH - h1, singleW, h1, [3, 3, 0, 0]);
      } else {
        ctx.rect(x, pad.top + cH - h1, singleW, h1);
      }
      ctx.fill();

      // Resolved
      const h2 = (point.resolved / maxVal) * cH;
      ctx.fillStyle = "#4CAF7D";
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x + singleW + 3, pad.top + cH - h2, singleW, h2, [3, 3, 0, 0]);
      } else {
        ctx.rect(x + singleW + 3, pad.top + cH - h2, singleW, h2);
      }
      ctx.fill();

      // X labels — every ~4th
      const step = Math.ceil(data.length / 8);
      if (i % step === 0) {
        const date = new Date(point._id);
        const label = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        ctx.fillStyle = "rgba(148,163,184,0.8)";
        ctx.font = "9px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(label, x + singleW + 1.5, H - 8);
      }
    });
  };

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(() => draw());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [data]);

  // Hover handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !containerRef.current || !data.length) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const W = containerRef.current.offsetWidth;
    const pad = { left: 36, right: 16 };
    const cW = W - pad.left - pad.right;
    const barW = cW / data.length;
    const idx = Math.floor((x - pad.left) / barW);
    if (idx >= 0 && idx < data.length) {
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, point: data[idx] });
    } else {
      setTooltip(null);
    }
  };

  // Summary stats
  const totalCreated = data.reduce((s, d) => s + d.created, 0);
  const totalResolved = data.reduce((s, d) => s + d.resolved, 0);
  const resRate = totalCreated > 0 ? Math.round((totalResolved / totalCreated) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Tickets over time</p>
            <p className="text-xs text-slate-400">Created vs resolved</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          {/* Summary pills */}
          {!loading && data.length > 0 && (
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <span className="text-slate-500">
                Created: <span className="font-semibold text-slate-800">{totalCreated}</span>
              </span>
              <span className="text-slate-500">
                Resolved: <span className="font-semibold text-slate-800">{totalResolved}</span>
              </span>
              <span className={`font-semibold ${resRate >= 70 ? "text-green-600" : "text-amber-600"}`}>
                {resRate}% rate
              </span>
            </div>
          )}
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
              Created
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />
              Resolved
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 relative" ref={containerRef}>
        {loading ? (
          <div className="h-[220px] bg-slate-50 rounded-lg animate-pulse flex items-center justify-center">
            <div className="space-y-2 w-full px-8">
              {[60, 80, 45, 70, 55, 90, 65].map((h, i) => (
                <div key={i} className="flex gap-1 items-end" style={{ height: 24 }}>
                  <div className="flex-1 bg-slate-200 rounded" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 gap-2">
            <TrendingUp className="w-8 h-8 opacity-30" />
            <p className="text-sm">No data for this period</p>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTooltip(null)}
            />
            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute pointer-events-none bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10"
                style={{
                  left: Math.min(tooltip.x + 12, (containerRef.current?.offsetWidth ?? 300) - 130),
                  top: Math.max(tooltip.y - 60, 0),
                }}
              >
                <p className="font-medium mb-1 text-slate-300">
                  {new Date(tooltip.point._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />
                    Created: <span className="font-semibold">{tooltip.point.created}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-green-400 inline-block" />
                    Resolved: <span className="font-semibold">{tooltip.point.resolved}</span>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}