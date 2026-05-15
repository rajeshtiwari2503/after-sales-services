"use client";
import { useState, useEffect } from "react";

interface TrackingStep {
  status: string;
  label: string;
  description: string;
  completedAt?: string;
  isActive: boolean;
  isDone: boolean;
}

interface TechnicianInfo {
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  jobsCompleted: number;
}

interface TicketTracking {
  ticketNumber: string;
  product: string;
  issueDescription: string;
  currentStatus: string;
  slaDueAt?: string;
  technician?: TechnicianInfo;
  estimatedArrival?: string;
  timeline: { status: string; changedAt: string; note?: string }[];
  totalCharge?: number;
  partsUsed?: { partName: string; quantity: number }[];
}

const TRACKING_STEPS = [
  { status: "open", label: "Request Received", description: "Your service request has been logged" },
  { status: "assigned", label: "Technician Assigned", description: "A technician has been assigned to your request" },
  { status: "on_the_way", label: "On the Way", description: "Technician is heading to your location" },
  { status: "reached", label: "Technician Arrived", description: "Technician has reached your location" },
  { status: "started", label: "Work in Progress", description: "Technician is working on your device" },
  { status: "completed", label: "Job Completed", description: "Service has been completed successfully" },
];

const STATUS_ORDER = TRACKING_STEPS.map((s) => s.status);

export default function LiveTicketTracker({ ticketId }: { ticketId: string }) {
  const [tracking, setTracking] = useState<TicketTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(`/api/tickets/${ticketId}/timeline`);
        const data = await res.json();
        if (data.success) setTracking(data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
    const iv = setInterval(fetchTracking, 30000); // poll every 30s
    return () => clearInterval(iv);
  }, [ticketId]);

  const submitRating = async () => {
    await fetch(`/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, rating, review }),
    });
    setSubmitted(true);
    setShowRating(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading tracking info...</div>;
  if (!tracking) return <div className="p-8 text-center text-gray-400">Ticket not found</div>;

  const currentIdx = STATUS_ORDER.indexOf(tracking.currentStatus);
  const steps: TrackingStep[] = TRACKING_STEPS.map((step, i) => ({
    ...step,
    isActive: i === currentIdx,
    isDone: i < currentIdx || tracking.currentStatus === "completed",
    completedAt: tracking.timeline.find((t) => t.status === step.status)?.changedAt,
  }));

  const slaTime = tracking.slaDueAt ? new Date(tracking.slaDueAt) : null;
  const now = new Date();
  const slaOk = slaTime ? slaTime > now : true;

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Ticket Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400">Ticket #{tracking.ticketNumber}</p>
            <h2 className="font-semibold text-gray-800 text-lg mt-0.5">{tracking.product}</h2>
            <p className="text-sm text-gray-500 mt-1">{tracking.issueDescription}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${slaOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {tracking.currentStatus === "completed" ? "✓ Completed" : "In Progress"}
          </span>
        </div>
        {slaTime && tracking.currentStatus !== "completed" && (
          <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${slaOk ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
            {slaOk ? "⏱ Expected completion by" : "⚠️ SLA breached — was due"}
            {" "}{slaTime.toLocaleString("en-IN")}
          </div>
        )}
      </div>

      {/* Technician Card */}
      {tracking.technician && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700 text-lg">
              {tracking.technician.name[0]}
            </div>
            <div>
              <p className="font-medium text-gray-800">{tracking.technician.name}</p>
              <p className="text-xs text-gray-500">
                ⭐ {tracking.technician.rating} · {tracking.technician.jobsCompleted} jobs
              </p>
            </div>
          </div>
          <a
            href={`tel:${tracking.technician.phone}`}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            📞 Call
          </a>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Live Status</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 relative">
                {/* Step circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-sm
                    ${step.isDone ? "bg-green-500 text-white" : step.isActive ? "bg-blue-500 text-white ring-4 ring-blue-100" : "bg-gray-200 text-gray-400"}`}
                >
                  {step.isDone ? "✓" : step.isActive ? "●" : i + 1}
                </div>
                {/* Content */}
                <div className={`pb-2 ${step.isActive ? "opacity-100" : step.isDone ? "opacity-80" : "opacity-40"}`}>
                  <p className={`font-medium text-sm ${step.isActive ? "text-blue-700" : step.isDone ? "text-gray-800" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                  {step.completedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(step.completedAt).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charges */}
      {tracking.totalCharge !== undefined && tracking.currentStatus === "completed" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Service Summary</h3>
          {tracking.partsUsed?.map((p, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-600 py-1">
              <span>{p.partName} × {p.quantity}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-semibold">
            <span>Total Charged</span>
            <span>₹{tracking.totalCharge.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      {/* Rating */}
      {tracking.currentStatus === "completed" && !submitted && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
          {!showRating ? (
            <div className="text-center">
              <p className="text-blue-800 font-medium mb-2">How was your experience?</p>
              <button onClick={() => setShowRating(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm">
                Rate Service
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-medium text-blue-800">Rate your experience</p>
              <div className="flex gap-2 justify-center text-3xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className={star <= rating ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review (optional)..."
                rows={3}
                className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
              />
              <button
                onClick={submitRating}
                disabled={!rating}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                Submit Review
              </button>
            </div>
          )}
        </div>
      )}
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center text-green-700 font-medium">
          ✓ Thank you for your feedback!
        </div>
      )}
    </div>
  );
}