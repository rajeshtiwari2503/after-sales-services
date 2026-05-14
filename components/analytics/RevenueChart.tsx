"use client";

import { useEffect, useRef } from "react";

interface TimelinePoint {
  _id: string; // date string YYYY-MM-DD
  created: number;
  resolved: number;
}

interface Props {
  data: TimelinePoint[];
  loading: boolean;
}

export default function RevenueChart({ data, loading }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const pad = { top: 16, right: 16, bottom: 32, left: 32 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const maxVal = Math.max(...data.map((d) => Math.max(d.created, d.resolved)), 1);

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "rgba(148,163,184,0.15)";
    ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      const y = pad.top + chartH * (1 - t);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
    });

    const barW = chartW / data.length;
    const barPad = barW * 0.15;
    const singleW = (barW - barPad * 2 - 4) / 2;

    data.forEach((point, i) => {
      const x = pad.left + i * barW + barPad;

      // Created bar
      const h1 = (point.created / maxVal) * chartH;
      ctx.fillStyle = "#378ADD";
      ctx.beginPath();
      ctx.roundRect(x, pad.top + chartH - h1, singleW, h1, [3, 3, 0, 0]);
      ctx.fill();

      // Resolved bar
      const h2 = (point.resolved / maxVal) * chartH;
      ctx.fillStyle = "#639922";
      ctx.beginPath();
      ctx.roundRect(x + singleW + 4, pad.top + chartH - h2, singleW, h2, [3, 3, 0, 0]);
      ctx.fill();

      // X label — every 3rd
      if (i % 3 === 0) {
        const date = new Date(point._id);
        const label = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        ctx.fillStyle = "rgba(148,163,184,0.8)";
        ctx.font = "9px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(label, x + singleW + 2, H - 8);
      }
    });
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-800">Tickets over time</p>
          <p className="text-xs text-slate-400">Created vs resolved</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />Created
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-600 inline-block" />Resolved
          </span>
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="h-48 bg-slate-50 rounded-lg animate-pulse" />
        ) : data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data for this period</div>
        ) : (
          <canvas ref={canvasRef} className="w-full" style={{ height: 192 }} />
        )}
      </div>
    </div>
  );
}