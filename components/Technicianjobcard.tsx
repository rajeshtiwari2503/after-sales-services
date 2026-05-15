"use client";
import { useState } from "react";

type JobStatus = "assigned" | "on_the_way" | "reached" | "started" | "paused" | "completed" | "cancelled";

interface Job {
  id: string;
  ticketId: { ticketNumber: string; product: string; customerName: string; address: string };
  status: JobStatus;
  priority: "low" | "medium" | "high" | "critical";
  scheduledAt: string;
  startedAt?: string;
  pausedDuration: number;
  photos: { url: string; stage: string; caption?: string }[];
  laborCharge: number;
  partsUsed: { partName: string; quantity: number; unitPrice: number }[];
  technicianNotes?: string;
}

const STATUS_LABELS: Record<JobStatus, string> = {
  assigned: "Assigned", on_the_way: "On the Way", reached: "Reached",
  started: "In Progress", paused: "Paused", completed: "Completed", cancelled: "Cancelled",
};
const STATUS_COLORS: Record<JobStatus, string> = {
  assigned: "bg-gray-100 text-gray-700", on_the_way: "bg-blue-100 text-blue-700",
  reached: "bg-purple-100 text-purple-700", started: "bg-yellow-100 text-yellow-700",
  paused: "bg-orange-100 text-orange-700", completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700",
};
const NEXT_ACTION: Record<JobStatus, { label: string; next: JobStatus; color: string } | null> = {
  assigned: { label: "🚗 On the Way", next: "on_the_way", color: "bg-blue-600 text-white" },
  on_the_way: { label: "📍 Reached", next: "reached", color: "bg-purple-600 text-white" },
  reached: { label: "▶️ Start Job", next: "started", color: "bg-yellow-500 text-white" },
  started: { label: "⏸ Pause", next: "paused", color: "bg-orange-500 text-white" },
  paused: { label: "▶️ Resume", next: "started", color: "bg-yellow-500 text-white" },
  completed: null, cancelled: null,
};

export default function TechnicianJobCard({ job: initialJob }: { job: Job }) {
  const [job, setJob] = useState(initialJob);
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [note, setNote] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [laborCharge, setLaborCharge] = useState(job.laborCharge);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const updateStatus = async (nextStatus: JobStatus, extraBody = {}) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/technician-jobs/${job.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, note, otp, ...extraBody }),
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
        setNote("");
        setOtp("");
        if (nextStatus === "started" && !timerInterval) {
          const iv = setInterval(() => setTimer((t) => t + 1), 60000);
          setTimerInterval(iv);
        }
        if (["paused", "completed", "cancelled"].includes(nextStatus) && timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
      } else {
        alert(data.error || "Update failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNextAction = () => {
    const action = NEXT_ACTION[job.status];
    if (!action) return;
    // OTP required before starting
    if (action.next === "started" && job.status === "reached") {
      setShowOTP(true);
      return;
    }
    if (action.next === "paused" || action.next === "started") {
      // Resume from pause, or auto-action
    }
    updateStatus(action.next);
  };

  const handleComplete = () => {
    updateStatus("completed", { laborCharge });
    setShowComplete(false);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>, stage: "before" | "during" | "after") => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingPhoto(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("photos", f));
    fd.append("stage", stage);
    try {
      const res = await fetch(`/api/technician-jobs/${job.id}/photos`, {
        method: "POST", body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setJob((prev) => ({ ...prev, photos: [...prev.photos, ...data.data] }));
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const action = NEXT_ACTION[job.status];
  const totalParts = job.partsUsed.reduce((s, p) => s + p.quantity * p.unitPrice, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">#{job.ticketId.ticketNumber}</p>
            <h3 className="font-semibold text-gray-800">{job.ticketId.product}</h3>
            <p className="text-sm text-gray-500 mt-0.5">👤 {job.ticketId.customerName}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[job.status]}`}>
              {STATUS_LABELS[job.status]}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_COLORS[job.priority]}`}>
              {job.priority}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">📍 {job.ticketId.address}</p>
        <p className="text-xs text-gray-400">
          📅 {new Date(job.scheduledAt).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Timer (when in progress) */}
      {job.status === "started" && (
        <div className="bg-yellow-50 px-4 py-2 flex justify-between text-sm">
          <span className="text-yellow-700 font-medium">⏱ Job in progress</span>
          <span className="text-yellow-600">{timer + Math.floor((Date.now() - new Date(job.startedAt!).getTime()) / 60000)} min</span>
        </div>
      )}

      {/* Photos */}
      {["started", "paused", "completed"].includes(job.status) && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Job Photos ({job.photos.length})</span>
            <div className="flex gap-2">
              {(["before", "during", "after"] as const).map((stage) => (
                <label key={stage} className="cursor-pointer text-xs border rounded px-2 py-1 text-blue-600 hover:bg-blue-50">
                  {uploadingPhoto ? "..." : `+ ${stage}`}
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => uploadPhoto(e, stage)} disabled={uploadingPhoto} />
                </label>
              ))}
            </div>
          </div>
          {job.photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {job.photos.map((p, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img src={p.url} alt={p.caption || ""} className="w-16 h-16 object-cover rounded-lg border" />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 rounded-b-lg">
                    {p.stage}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {!["completed", "cancelled"].includes(job.status) && (
        <div className="px-4 py-3 border-b border-gray-100">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            rows={2}
            className="w-full text-sm border rounded-lg px-3 py-2 resize-none"
          />
        </div>
      )}

      {/* OTP Modal */}
      {showOTP && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <p className="text-sm font-medium text-blue-800 mb-2">Enter customer OTP to start job</p>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="4-digit OTP"
              className="border rounded-lg px-3 py-2 text-sm w-32 tracking-widest font-mono"
            />
            <button
              onClick={() => { updateStatus("started"); setShowOTP(false); }}
              disabled={otp.length !== 4 || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              Verify & Start
            </button>
            <button onClick={() => setShowOTP(false)} className="text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showComplete && (
        <div className="px-4 py-3 bg-green-50 border-b border-green-100 space-y-3">
          <p className="text-sm font-medium text-green-800">Complete Job Details</p>
          <div>
            <label className="text-xs text-gray-500">Labour Charge (₹)</label>
            <input
              type="number"
              value={laborCharge}
              onChange={(e) => setLaborCharge(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm w-full mt-1"
            />
          </div>
          {job.partsUsed.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Parts Used</p>
              {job.partsUsed.map((p, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-600">
                  <span>{p.partName} × {p.quantity}</span>
                  <span>₹{p.quantity * p.unitPrice}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between font-medium text-sm">
            <span>Total</span>
            <span>₹{laborCharge + totalParts}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex-1"
            >
              {loading ? "Completing..." : "Mark Complete ✓"}
            </button>
            <button onClick={() => setShowComplete(false)} className="text-sm text-gray-500 px-3">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex gap-2">
        {action && (
          <button
            onClick={handleNextAction}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${action.color} disabled:opacity-50`}
          >
            {loading ? "Updating..." : action.label}
          </button>
        )}
        {job.status === "started" && (
          <button
            onClick={() => setShowComplete(true)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-green-600 text-white"
          >
            ✓ Complete
          </button>
        )}
        {job.status === "completed" && (
          <div className="flex-1 py-2.5 rounded-xl text-center text-sm font-medium bg-green-50 text-green-700">
            ✓ Completed — ₹{(laborCharge + totalParts).toLocaleString("en-IN")}
          </div>
        )}
      </div>
    </div>
  );
}