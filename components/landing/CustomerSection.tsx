 "use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  productId: string;
  categoryId: string;
  faultName: string;
  servicePincode: string;
  street: string;
  city: string;
  state: string;
  priority: "low" | "medium" | "high" | "critical";
}

interface TicketResult {
  ticketNumber: string;
  otp: string;
  slaResolutionDue: string;
  priority: string;
}

interface FieldError {
  [key: string]: string;
}

// ─── Constants ───────────────────────────────────────────────
const EMPTY_FORM: FormData = {
  name: "", email: "", phone: "",
  title: "", description: "",
  productId: "", categoryId: "", faultName: "",
  servicePincode: "", street: "", city: "", state: "",
  priority: "medium",
};

const PRODUCTS = [
  { value: "ac",      label: "Air Conditioner" },
  { value: "fridge",  label: "Refrigerator" },
  { value: "tv",      label: "Smart TV" },
  { value: "wm",      label: "Washing Machine" },
  { value: "mw",      label: "Microwave" },
];

const CATEGORIES: Record<string, { value: string; label: string }[]> = {
  ac:     [{ value: "cooling", label: "Not Cooling" }, { value: "noise", label: "Noise Problem" }, { value: "water", label: "Water Leaking" }, { value: "remote", label: "Remote Issue" }],
  fridge: [{ value: "cooling", label: "Not Cooling" }, { value: "noise", label: "Noise Problem" }, { value: "door",  label: "Door Issue" },   { value: "water", label: "Water Leaking" }],
  tv:     [{ value: "display", label: "Display Issue" }, { value: "sound", label: "No Sound" },    { value: "wifi",  label: "Wi-Fi Issue" },   { value: "power", label: "No Power" }],
  wm:     [{ value: "drum",    label: "Drum Not Spinning" }, { value: "water", label: "Water Not Draining" }, { value: "noise", label: "Noise Problem" }, { value: "power", label: "No Power" }],
  mw:     [{ value: "heat",    label: "Not Heating" }, { value: "display", label: "Display Issue" }, { value: "door", label: "Door Not Closing" }, { value: "noise", label: "Noise Problem" }],
};

// ─── Validators ───────────────────────────────────────────────
function validate(form: FormData): FieldError {
  const errors: FieldError = {};
  if (!form.name.trim() || form.name.trim().length < 2)
    errors.name = "Full name is required (min 2 characters)";
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Valid email address is required";
  if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Valid 10-digit Indian mobile number required";
  if (!form.productId)
    errors.productId = "Please select a product";
  if (!form.categoryId)
    errors.categoryId = "Please select a category";
  if (!form.title.trim() || form.title.trim().length < 5)
    errors.title = "Issue title is required (min 5 characters)";
  if (!form.description.trim() || form.description.trim().length < 10)
    errors.description = "Please describe the issue (min 10 characters)";
  if (!form.street.trim())
    errors.street = "Street address is required";
  if (!form.city.trim())
    errors.city = "City is required";
  if (!form.state.trim())
    errors.state = "State is required";
  if (!form.servicePincode.trim() || !/^\d{6}$/.test(form.servicePincode))
    errors.servicePincode = "Valid 6-digit pincode required";
  return errors;
}

// ─── Component ────────────────────────────────────────────────
export default function CustomerLandingPage() {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState<TicketResult | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    // Reset category when product changes
    if (name === "productId") setFormData((prev) => ({ ...prev, productId: value, categoryId: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async () => {
    // Client-side validation
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      document.querySelector(`[name="${firstErrorKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const payload = {
        name:        formData.name.trim(),
        email:       formData.email.trim().toLowerCase(),
        phone:       formData.phone.replace(/\s/g, ""),
        tenantId:    "TENANT-001",
        title:       formData.title.trim(),
        description: formData.description.trim(),
        priority:    formData.priority,
        productId:   formData.productId,
        categoryId:  formData.categoryId,
        faultName:   formData.faultName.trim(),
        servicePincode: formData.servicePincode.trim(),
        serviceAddress: {
          street:     formData.street.trim(),
          city:       formData.city.trim(),
          state:      formData.state.trim(),
          postalCode: formData.servicePincode.trim(),
        },
      };

      const response = await fetch("/api/customer/tickets/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.message || "Something went wrong. Please try again.");
        return;
      }

      // Success
      setResult({
        ticketNumber:     data.ticketNumber,
        otp:              data.otp,
        slaResolutionDue: data.slaResolutionDue,
        priority:         data.priority,
      });
      setFormData(EMPTY_FORM);
      setErrors({});

      // Scroll to top to show success
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: unknown) {
      setApiError(
        error instanceof Error ? error.message : "Network error. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Input component ──────────────────────────────────────
  const inputCls = (field: string) =>
    `w-full rounded-2xl border px-5 py-4 outline-none transition text-sm ${
      errors[field]
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-slate-200 bg-white focus:border-pink-400"
    }`;

  const FieldErr = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        {errors[field]}
      </p>
    ) : null;

  const steps = [
    { number: "01", icon: "📝", title: "Describe the issue", desc: "Tell us what's wrong — choose your product, category, and describe the fault." },
    { number: "02", icon: "🔍", title: "We assign a technician", desc: "Our system matches you with the nearest certified technician." },
    { number: "03", icon: "📍", title: "Track it live", desc: "Watch ticket status in real-time and get ETA updates." },
    { number: "04", icon: "✅", title: "Problem solved", desc: "Rate your experience and track warranty automatically." },
  ];

  // ─── Success screen ───────────────────────────────────────
  if (result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-pink-50/40 to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="rounded-[32px] border border-white/50 bg-white/80 p-10 shadow-2xl backdrop-blur-xl text-center">
            {/* Animated checkmark */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl font-black text-slate-900">Request Submitted!</h2>
            <p className="mt-2 text-slate-500 text-sm">
              Your service request has been logged successfully.
            </p>

            {/* Ticket details card */}
            <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-left text-white space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs text-slate-400 uppercase tracking-widest">Ticket Number</span>
                <span className="text-lg font-black text-pink-400">{result.ticketNumber}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Your OTP</span>
                <span className="font-mono text-xl font-black tracking-[0.3em] text-emerald-400">
                  {result.otp}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Share this OTP with the technician when they arrive to start the job.
              </p>

              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs text-slate-400">Expected Resolution</span>
                <span className="text-xs font-semibold text-slate-200">
                  {new Date(result.slaResolutionDue).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Priority</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                  result.priority === "critical" ? "bg-red-500/20 text-red-400"
                  : result.priority === "high"   ? "bg-orange-500/20 text-orange-400"
                  : result.priority === "medium" ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-gray-500/20 text-gray-400"
                }`}>
                  {result.priority}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4 text-left text-sm text-blue-700">
              📱 <strong>Check your phone & email</strong> — we've sent a confirmation with your OTP and ticket details.
            </div>

            <button
              onClick={() => setResult(null)}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 py-4 text-sm font-bold text-white shadow-lg shadow-pink-200 hover:scale-[1.01] transition"
            >
              Raise Another Request
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ─── Main form ────────────────────────────────────────────
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-pink-50/40 to-blue-50 text-slate-900">
      <section className="relative px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">

          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex justify-center items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-5 py-2 shadow-sm backdrop-blur-xl">
              <span className="h-2 w-2 animate-pulse rounded-full bg-pink-500" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-pink-600">
                Customer Support Portal
              </span>
            </div>
          </div>

          {/* Hero row */}
          <div className="grid items-center gap-16 lg:grid-cols-2 mt-0">
            <div>
              <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
                Your appliance
                <span className="bg-gradient-to-r from-pink-500 via-violet-500 to-blue-600 bg-clip-text text-transparent">
                  {" "}broken?
                </span>
                <br />We'll fix it.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600">
                Raise a service request in under 2 minutes. Track it live. Get it resolved by certified technicians near you.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-1 md:mt-14 grid items-center gap-10 lg:grid-cols-2">
              {[["4.8★", "Customer Rating"], ["<4h", "Response Time"], ["98%", "SLA Compliance"], ["500+", "Technicians"]].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/50 bg-white/70 p-5 text-center shadow-sm backdrop-blur-xl">
                  <h3 className="text-2xl font-black text-slate-900">{value}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid items-center gap-16 lg:grid-cols-2">
            {/* ── FORM ────────────────────────────────────── */}
            <div>
              <div className="rounded-[32px] border border-white/50 bg-white/70 p-8 shadow-xl backdrop-blur-xl sm:p-10">
                <div className="inline-flex rounded-full bg-pink-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
                  Quick Service Request
                </div>
                <h2 className="mt-6 text-4xl font-black text-slate-900">
                  Tell us what needs fixing
                </h2>

                {/* API error banner */}
                {apiError && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                  </div>
                )}

                <div className="mt-8 grid gap-5">
                  {/* Name + Phone */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <input name="name" value={formData.name} onChange={handleChange}
                        placeholder="Full Name *" className={inputCls("name")} />
                      <FieldErr field="name" />
                    </div>
                    <div>
                      <input name="phone" value={formData.phone} onChange={handleChange}
                        placeholder="Phone Number * (10 digit)" className={inputCls("phone")}
                        maxLength={10} inputMode="numeric" />
                      <FieldErr field="phone" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <input name="email" value={formData.email} onChange={handleChange}
                      placeholder="Email Address *" className={inputCls("email")} type="email" />
                    <FieldErr field="email" />
                  </div>

                  {/* Product + Category */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <select name="productId" value={formData.productId} onChange={handleChange}
                        className={inputCls("productId")}>
                        <option value="">Select Product *</option>
                        {PRODUCTS.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                      <FieldErr field="productId" />
                    </div>
                    <div>
                      <select name="categoryId" value={formData.categoryId} onChange={handleChange}
                        className={inputCls("categoryId")}
                        disabled={!formData.productId}>
                        <option value="">
                          {formData.productId ? "Select Category *" : "Select product first"}
                        </option>
                        {(CATEGORIES[formData.productId] || []).map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <FieldErr field="categoryId" />
                    </div>
                  </div>

                  {/* Issue title */}
                  <div>
                    <input name="title" value={formData.title} onChange={handleChange}
                      placeholder="Issue Title * (e.g. AC not cooling since morning)"
                      className={inputCls("title")} />
                    <FieldErr field="title" />
                  </div>

                  {/* Description */}
                  <div>
                    <textarea rows={4} name="description" value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the issue in detail * (model number, error codes, when it started...)"
                      className={inputCls("description") + " resize-none"} />
                    <FieldErr field="description" />
                  </div>

                  {/* Street */}
                  <div>
                    <input name="street" value={formData.street} onChange={handleChange}
                      placeholder="Street Address *" className={inputCls("street")} />
                    <FieldErr field="street" />
                  </div>

                  {/* City, State, Pincode */}
                  <div className="grid gap-5 sm:grid-cols-3">
                    <div>
                      <input name="city" value={formData.city} onChange={handleChange}
                        placeholder="City *" className={inputCls("city")} />
                      <FieldErr field="city" />
                    </div>
                    <div>
                      <input name="state" value={formData.state} onChange={handleChange}
                        placeholder="State *" className={inputCls("state")} />
                      <FieldErr field="state" />
                    </div>
                    <div>
                      <input name="servicePincode" value={formData.servicePincode}
                        onChange={handleChange} placeholder="Pincode *"
                        className={inputCls("servicePincode")} maxLength={6} inputMode="numeric" />
                      <FieldErr field="servicePincode" />
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Priority</p>
                    <div className="grid grid-cols-4 gap-2">
                      {(["low", "medium", "high", "critical"] as const).map((p) => (
                        <button key={p} type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                          className={`py-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                            formData.priority === p
                              ? p === "critical" ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                                : p === "high"   ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                                : p === "medium" ? "border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm"
                                :                  "border-slate-400 bg-slate-50 text-slate-700 shadow-sm"
                              : "border-slate-200 text-slate-400 hover:border-slate-300"
                          }`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button onClick={handleSubmit} disabled={loading}
                    className="mt-2 flex items-center cursor-pointer justify-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-8 py-5 text-sm font-bold text-white shadow-xl shadow-pink-500/20 transition hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" />Submitting...</>
                    ) : (
                      <>Submit Service Request <ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>
                </div>
              </div>

              {/* Feature pills */}
              <div className="grid gap-5 sm:grid-cols-2 mt-10">
                {[
                  ["📱", "No app needed", "Works perfectly on any device"],
                  ["🔔", "Instant confirmation", "Get your ticket number immediately"],
                  ["👨‍🔧", "Certified technicians", "Only verified professionals handle repairs"],
                  ["💰", "Warranty? No charge", "Claims processed automatically"],
                ].map(([icon, title, desc]) => (
                  <div key={title as string}
                    className="rounded-[28px] border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-xl hover:-translate-y-1 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-5">
                      <div className="text-4xl">{icon}</div>
                      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    </div>
                    <p className="mt-3 text-slate-600 text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT COLUMN ─────────────────────────────── */}
            <div className="relative pt-5">
              {/* Live ticket mock */}
              <div className="rounded-[32px] border border-white/40 bg-white/70 p-5 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div>
                      <p className="text-sm text-slate-400">Live Ticket</p>
                      <h3 className="mt-2 text-xl md:text-2xl font-bold">
                        Refrigerator Not Cooling
                      </h3>
                    </div>
                    <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300">
                      🟢 LIVE TRACKING
                    </div>
                  </div>
                  <div className="mt-8 space-y-5">
                    {["Ticket Created", "Technician Assigned", "Technician On The Way", "Issue Resolved"].map((item, i) => (
                      <div key={item} className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
                        <div className={`h-4 w-4 rounded-full ${i < 3 ? "bg-emerald-400" : "bg-white/20"}`} />
                        <p className="text-sm text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="mt-8">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-black sm:text-5xl">
                    Simple. Fast.
                    <span className="bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
                      {" "}Transparent.
                    </span>
                  </h2>
                  <p className="mt-4 text-lg text-slate-600">
                    A modern after-sales workflow built for customer convenience.
                  </p>
                </div>
                <div className="grid gap-5">
                  {steps.map((step) => (
                    <div key={step.number}
                      className="rounded-[28px] border border-white/50 bg-white/70 p-8 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{step.icon}</span>
                        <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                        <span className="text-sm font-bold text-pink-500">{step.number}</span>
                      </div>
                      <p className="mt-4 leading-5 text-slate-600">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}