 
 "use client";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {   useCallback  } from "react";
import Link from "next/link";
import {
   RefreshCw, Eye, X, ChevronLeft, ChevronRight,
  Ticket, Plus 
} from "lucide-react";
 
import { useState, useEffect, useRef } from "react";
import {
   Check, Building2, Wrench, Zap, Package, Tag,
  Search, UserPlus, User, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
/* ─── Types ──────────────────────────────────────────────────────────────── */
interface TicketItem {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  faultName?: string;
  customerId: { name: string } | null;
  productId: { name: string; modelNumber: string } | null;
  categoryId: { name: string } | null;
  serviceCenterId: { name: string; code: string } | null;
  technicianId: { name: string } | null;
  createdAt: string;
}
interface Category { _id: string; name: string; slug: string; faults: Fault[] }
interface Fault { _id: string; name: string; severity: string }
interface Product { _id: string; name: string; modelNumber: string; categoryId: { _id: string; name: string; faults: Fault[] } | null }
interface SC { _id: string; name: string; code: string }
interface Tech { _id: string; userId: { name: string }; serviceCenterId: { _id: string; name: string } | null }

/* ─── Config ─────────────────────────────────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  open:              { label: "Open",       dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-800 border-blue-100" },
  in_progress:       { label: "In Progress",dot: "bg-amber-500",  badge: "bg-amber-50 text-amber-800 border-amber-100" },
  pending_parts:     { label: "Pending",    dot: "bg-orange-500", badge: "bg-orange-50 text-orange-800 border-orange-100" },
  pending_customer:  { label: "Pending",    dot: "bg-orange-500", badge: "bg-orange-50 text-orange-800 border-orange-100" },
  resolved:          { label: "Resolved",   dot: "bg-green-500",  badge: "bg-green-50 text-green-800 border-green-100" },
  closed:            { label: "Closed",     dot: "bg-slate-400",  badge: "bg-slate-100 text-slate-600 border-slate-200" },
};
const PRIORITY_CFG: Record<string, string> = {
  low:      "bg-green-50 text-green-700 border-green-100",
  medium:   "bg-amber-50 text-amber-700 border-amber-100",
  high:     "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};
const inputCls = "w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition text-slate-800";
const LIMIT = 10;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/* ─── Create Ticket Modal ────────────────────────────────────────────────── */


// ─── Drop-in replacement for the CreateTicketModal function ───────────────────
// Fixes:
//   1. Title auto-fill: value controlled properly (no empty-string override)
//   2. Step 2 — Customer section: search existing customers OR create new inline
//   3. All required fields validated before API call
//   4. customerId sent to API when existing customer selected
// ─────────────────────────────────────────────────────────────────────────────



/* ─── Types (copy from your existing types) ──────────────────────────────── */
interface Fault    { _id: string; name: string; severity: string }
interface Category { _id: string; name: string; slug: string; faults: Fault[] }
interface Product  { _id: string; name: string; modelNumber: string; categoryId: { _id: string; name: string; faults: Fault[] } | null }
interface SC       { _id: string; name: string; code: string }
interface Tech     { _id: string; userId: { name: string }; serviceCenterId: { _id: string; name: string } | null }
interface Customer { _id: string; name: string; email: string; phone?: string }

 
/* ─── Component ──────────────────────────────────────────────────────────── */
export function CreateTicketModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  /* ── Step 1 state ── */
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [products,     setProducts]     = useState<Product[]>([]);
  const [selectedCat,  setSelectedCat]  = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFault,   setSelectedFault]   = useState<Fault | null>(null);

  /* ── Step 2 state ── */
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [priority,    setPriority]    = useState("medium");

  // Customer — toggle between "existing" search and "new" inline form
  const [customerMode,     setCustomerMode]     = useState<"existing" | "new">("existing");
  const [customerSearch,   setCustomerSearch]   = useState("");
  const [customerResults,  setCustomerResults]  = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [searchingCust,    setSearchingCust]    = useState(false);
  const [newCustomer,      setNewCustomer]      = useState({ name: "", email: "", phone: "" });
  const custTimer = useRef<NodeJS.Timeout | null>(null);
  const custDropRef = useRef<HTMLDivElement>(null);

  /* ── Step 3 state ── */
  const [scs,         setScs]         = useState<SC[]>([]);
  const [techs,       setTechs]       = useState<Tech[]>([]);
  const [assignMode,  setAssignMode]  = useState<"sc" | "tech">("sc");
  const [selectedSC,  setSelectedSC]  = useState("");
  const [selectedTech,setSelectedTech] = useState("");

  /* ── Load reference data ── */
  useEffect(() => {
    Promise.all([
      fetch("/api/categories",    { credentials: "include" }).then(r => r.json()),
      fetch("/api/products",      { credentials: "include" }).then(r => r.json()),
      fetch("/api/service-centers", { credentials: "include" }).then(r => r.json()),
      fetch("/api/technicians",   { credentials: "include" }).then(r => r.json()),
    ]).then(([catD, prodD, scD, techD]) => {
      setCategories(catD.data ?? []);
      setProducts(prodD.data ?? []);
      setScs(scD.data ?? []);
      setTechs(techD.data ?? []);
    });
  }, []);

  /* ── Close customer dropdown on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (custDropRef.current && !custDropRef.current.contains(e.target as Node)) {
        setShowCustomerDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Auto-fill title when fault selected (only if user hasn't typed yet) ── */
  useEffect(() => {
    if (selectedFault && !title) {
      const autoTitle = selectedProduct
        ? `${selectedFault.name} - ${selectedProduct.name}`
        : selectedFault.name;
      setTitle(autoTitle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFault, selectedProduct]);

  /* ── Customer search (debounced 300ms) ── */
  const searchCustomers = (q: string) => {
    setCustomerSearch(q);
    setSelectedCustomer(null);
    if (!q.trim()) { setCustomerResults([]); setShowCustomerDrop(false); return; }
    if (custTimer.current) clearTimeout(custTimer.current);
    custTimer.current = setTimeout(async () => {
      setSearchingCust(true);
      try {
        const res = await fetch(
          `/api/users?role=customer&search=${encodeURIComponent(q)}&limit=10`,
          { credentials: "include" }
        );
        const data = await res.json();
        setCustomerResults(data.data?.users ?? []);
        setShowCustomerDrop(true);
      } catch {} finally { setSearchingCust(false); }
    }, 300);
  };

  /* ── Derived ── */
  const productsForCat  = selectedCat
    ? products.filter(p => p.categoryId?._id === selectedCat._id)
    : products;

  const faults: Fault[] = selectedProduct?.categoryId?.faults ?? selectedCat?.faults ?? [];

  const techsForSC = selectedSC
    ? techs.filter(t => (t.serviceCenterId as any)?._id === selectedSC)
    : techs;

  /* ── Step validation ── */
  const canProceedStep1 = !!selectedCat;

  const canProceedStep2 = () => {
    if (!title.trim() || title.trim().length < 5)        return false;
    if (!description.trim() || description.trim().length < 10) return false;
    if (customerMode === "existing" && !selectedCustomer)  return false;
    if (customerMode === "new") {
      if (!newCustomer.name.trim())  return false;
      if (!newCustomer.email.trim()) return false;
    }
    return true;
  };

  /* ── Submit ── */
  const handleCreate = async () => {
    if (!title.trim() || title.trim().length < 5) {
      toast.error("Title must be at least 5 characters"); return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Description must be at least 10 characters"); return;
    }
    if (!selectedCat) {
      toast.error("Select a category"); return;
    }
    if (customerMode === "existing" && !selectedCustomer) {
      toast.error("Select an existing customer or switch to 'New Customer'"); return;
    }
    if (customerMode === "new") {
      if (!newCustomer.name.trim())  { toast.error("Customer name is required"); return; }
      if (!newCustomer.email.trim()) { toast.error("Customer email is required"); return; }
    }

    setSaving(true);
    try {
      // If new customer → register them first
      let customerId: string | undefined;
      if (customerMode === "new") {
        const custRes = await fetch("/api/users", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:     newCustomer.name.trim(),
            email:    newCustomer.email.trim(),
            phone:    newCustomer.phone.trim() || undefined,
            role:     "customer",
            password: "Customer@123",   // default, user should reset
          }),
        });
        const custData = await custRes.json();
        if (!custRes.ok) throw new Error(custData.error ?? custData.message ?? "Failed to create customer");
        customerId = custData.data?._id ?? custData.data?.user?._id;
      } else {
        customerId = selectedCustomer!._id;
      }

      // Build ticket body
      const body: Record<string, any> = {
        title:       title.trim(),
        description: description.trim(),
        priority,
        category:    selectedCat.slug,
        categoryId:  selectedCat._id,
        customerId,
      };
      if (selectedProduct) { body.productId = selectedProduct._id; }
      if (selectedFault)   { body.faultId = selectedFault._id; body.faultName = selectedFault.name; }
      if (assignMode === "sc"   && selectedSC)   body.serviceCenterId = selectedSC;
      if (assignMode === "tech" && selectedTech) body.technicianId    = selectedTech;

      const res = await fetch("/api/tickets", {
        method:  "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Failed to create ticket");

      toast.success("Ticket created successfully");
      onCreated();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to create ticket");
    } finally {
      setSaving(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Create ticket</h2>
            <p className="text-xs text-slate-400 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { n: 1, label: "Category & Product" },
            { n: 2, label: "Ticket Details"     },
            { n: 3, label: "Assignment"          },
          ].map(({ n, label }) => (
            <div
              key={n}
              onClick={() => { if (n < step) setStep(n as any); }}
              className={`flex-1 flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
                step === n ? "border-blue-600 text-blue-600 bg-blue-50/40 cursor-default" :
                step > n  ? "border-green-500 text-green-600 cursor-pointer" :
                "border-transparent text-slate-400 cursor-not-allowed"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                step > n  ? "bg-green-500 text-white" :
                step === n ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {step > n ? "✓" : n}
              </span>
              {label}
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* ══════════════════════════════ STEP 1 ══════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Category grid */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                    No categories found. Go to Products → Categories to create some.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setSelectedCat(cat);
                          setSelectedProduct(null);
                          setSelectedFault(null);
                          setTitle("");   // reset title when category changes
                        }}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          selectedCat?._id === cat._id
                            ? "border-blue-400 bg-blue-50 ring-1 ring-blue-400/30"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-800 truncate">{cat.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{cat.faults.length} fault types</p>
                        {selectedCat?._id === cat._id && (
                          <Check className="w-3.5 h-3.5 text-blue-600 mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product dropdown */}
              {selectedCat && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Product <span className="text-slate-400 normal-case font-normal">(optional)</span>
                  </label>
                  <select
                    className={inputCls}
                    value={selectedProduct?._id ?? ""}
                    onChange={e => {
                      const p = products.find(x => x._id === e.target.value) ?? null;
                      setSelectedProduct(p);
                      setSelectedFault(null);
                      setTitle("");   // reset title when product changes
                    }}
                  >
                    <option value="">— No specific product —</option>
                    {productsForCat.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.modelNumber})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fault picker */}
              {faults.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Reported fault <span className="text-slate-400 normal-case font-normal">(optional)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {faults.map(f => (
                      <button
                        key={f._id}
                        onClick={() => setSelectedFault(selectedFault?._id === f._id ? null : f)}
                        className={`flex items-start gap-2 p-3 rounded-xl border text-left transition cursor-pointer ${
                          selectedFault?._id === f._id
                            ? "border-amber-400 bg-amber-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">{f.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{f.severity} severity</p>
                        </div>
                        {selectedFault?._id === f._id && (
                          <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════ STEP 2 ══════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">

              {/* Step 1 summary chips */}
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {selectedCat && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-full text-xs">
                    <Tag className="w-3 h-3" /> {selectedCat.name}
                  </span>
                )}
                {selectedProduct && (
                  <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-full text-xs">
                    <Package className="w-3 h-3" /> {selectedProduct.name}
                  </span>
                )}
                {selectedFault && (
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-full text-xs">
                    <Zap className="w-3 h-3" /> {selectedFault.name}
                  </span>
                )}
              </div>

              {/* ── Customer section ──────────────────────────────────────────── */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {/* Toggle */}
                <div className="flex border-b border-slate-100">
                  {(["existing", "new"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        setCustomerMode(m);
                        setSelectedCustomer(null);
                        setCustomerSearch("");
                        setCustomerResults([]);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition cursor-pointer ${
                        customerMode === m
                          ? "bg-blue-600 text-white"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {m === "existing"
                        ? <><User className="w-3.5 h-3.5" /> Existing customer</>
                        : <><UserPlus className="w-3.5 h-3.5" /> New customer</>}
                    </button>
                  ))}
                </div>

                <div className="p-3 space-y-3">
                  {customerMode === "existing" ? (
                    /* ── Search existing ── */
                    <div ref={custDropRef} className="relative">
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                        Search customer <span className="text-red-400">*</span>
                      </label>

                      {selectedCustomer ? (
                        /* Selected customer chip */
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-7 h-7 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {selectedCustomer.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-green-800 truncate">{selectedCustomer.name}</p>
                            <p className="text-[10px] text-green-600 truncate">{selectedCustomer.email}</p>
                            {selectedCustomer.phone && (
                              <p className="text-[10px] text-green-500">{selectedCustomer.phone}</p>
                            )}
                          </div>
                          <button
                            onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }}
                            className="text-green-600 hover:text-red-500 cursor-pointer shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        /* Search input */
                        <div className="relative">
                          <div className="flex items-center gap-2 h-10 border border-slate-200 rounded-lg px-3 bg-slate-50 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/10 transition">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              placeholder="Type name or email to search..."
                              value={customerSearch}
                              onChange={e => searchCustomers(e.target.value)}
                              onFocus={() => customerResults.length > 0 && setShowCustomerDrop(true)}
                              className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                            />
                            {searchingCust && (
                              <span className="w-3.5 h-3.5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin shrink-0" />
                            )}
                          </div>

                          {/* Dropdown results */}
                          {showCustomerDrop && customerResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                              {customerResults.map(c => (
                                <button
                                  key={c._id}
                                  onClick={() => {
                                    setSelectedCustomer(c);
                                    setCustomerSearch(c.name);
                                    setShowCustomerDrop(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition cursor-pointer"
                                >
                                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {c.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{c.email}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {showCustomerDrop && customerResults.length === 0 && customerSearch.length >= 2 && !searchingCust && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 px-3 py-3">
                              <p className="text-xs text-slate-400">No customers found for "{customerSearch}"</p>
                              <button
                                onClick={() => { setCustomerMode("new"); setNewCustomer(p => ({ ...p, name: customerSearch })); }}
                                className="mt-1.5 text-xs text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <UserPlus className="w-3 h-3" /> Create new customer instead
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── New customer form ── */
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                        New customer details
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          className={inputCls}
                          placeholder="Full name *"
                          value={newCustomer.name}
                          onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                        />
                        <input
                          type="email"
                          className={inputCls}
                          placeholder="Email address *"
                          value={newCustomer.email}
                          onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                        />
                        <input
                          type="tel"
                          className={inputCls}
                          placeholder="Phone number (optional)"
                          value={newCustomer.phone}
                          onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        A customer account will be created with a default password (Customer@123).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Title ── */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Ticket title <span className="text-red-400">*</span>
                  {selectedFault && !title && (
                    <span className="text-slate-400 normal-case font-normal ml-1">(auto-filled from fault)</span>
                  )}
                </label>
                <input
                  className={inputCls}
                  placeholder="Describe the issue in one line (min 5 chars)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                {title.length > 0 && title.length < 5 && (
                  <p className="text-[10px] text-red-400 mt-1">{5 - title.length} more characters needed</p>
                )}
              </div>

              {/* ── Description ── */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition text-slate-800 resize-none placeholder:text-slate-400"
                  rows={4}
                  placeholder="Describe the issue in detail (min 10 characters)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                {description.length > 0 && description.length < 10 && (
                  <p className="text-[10px] text-red-400 mt-1">{10 - description.length} more characters needed</p>
                )}
              </div>

              {/* ── Priority ── */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {["low", "medium", "high", "critical"].map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`h-9 rounded-lg border text-xs font-semibold capitalize cursor-pointer transition ${
                        priority === p ? PRIORITY_CFG[p] : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════ STEP 3 ══════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Optionally assign now — or skip and assign later from the ticket detail page.
              </p>

              {/* Mode toggle */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
                {(["sc", "tech"] as const).map((m, i) => (
                  <button
                    key={m}
                    onClick={() => setAssignMode(m)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 cursor-pointer transition ${
                      i === 1 ? "border-l border-slate-200" : ""
                    } ${assignMode === m ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    {m === "sc"
                      ? <><Building2 className="w-3.5 h-3.5" /> Service Center</>
                      : <><Wrench className="w-3.5 h-3.5" /> Technician</>}
                  </button>
                ))}
              </div>

              {/* SC list */}
              {assignMode === "sc" && (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {scs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                      No service centers found.
                    </p>
                  ) : scs.map(sc => (
                    <label
                      key={sc._id}
                      onClick={() => setSelectedSC(selectedSC === sc._id ? "" : sc._id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        selectedSC === sc._id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">{sc.name}</p>
                        <p className="text-[10px] text-slate-400">{sc.code}</p>
                      </div>
                      {selectedSC === sc._id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </label>
                  ))}
                </div>
              )}

              {/* Tech list */}
              {assignMode === "tech" && (
                <div className="space-y-3">
                  <select
                    className={inputCls}
                    value={selectedSC}
                    onChange={e => { setSelectedSC(e.target.value); setSelectedTech(""); }}
                  >
                    <option value="">All service centers</option>
                    {scs.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                  </select>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {techsForSC.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                        No technicians found.
                      </p>
                    ) : techsForSC.map(t => (
                      <label
                        key={t._id}
                        onClick={() => setSelectedTech(selectedTech === t._id ? "" : t._id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          selectedTech === t._id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {t.userId?.name?.split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-700">{t.userId?.name}</p>
                          {t.serviceCenterId && (
                            <p className="text-[10px] text-slate-400">{(t.serviceCenterId as any).name}</p>
                          )}
                        </div>
                        {selectedTech === t._id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={() => step > 1 ? setStep((step - 1) as any) : onClose()}
            className="h-9 px-4 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !canProceedStep1) { toast.error("Select a category first"); return; }
                if (step === 2 && !canProceedStep2()) {
                  if (!title.trim() || title.length < 5)            { toast.error("Title must be at least 5 characters"); return; }
                  if (!description.trim() || description.length < 10){ toast.error("Description must be at least 10 characters"); return; }
                  if (customerMode === "existing" && !selectedCustomer){ toast.error("Select a customer"); return; }
                  if (customerMode === "new" && !newCustomer.name)   { toast.error("Customer name is required"); return; }
                  if (customerMode === "new" && !newCustomer.email)  { toast.error("Customer email is required"); return; }
                  return;
                }
                setStep((step + 1) as any);
              }}
              className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer transition"
            >
              Next →
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="h-9 px-4 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium cursor-pointer transition"
              >
                {saving ? "Creating..." : "Create without assignment"}
              </button>
              {(selectedSC || selectedTech) && (
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="h-9 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 transition"
                >
                  {saving
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Check className="w-4 h-4" />}
                  Create & Assign
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Tickets Content (main list) ────────────────────────────────────────── */
function BrandTicketsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const page = parseInt(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };
  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      const res = await fetch(`/api/tickets?${params}`, { credentials: "include" });
      const data = await res.json();
      setTickets(data.data?.tickets ?? []);
      setTotal(data.data?.total ?? 0);
    } catch {} finally { setLoading(false); }
  }, [page, search, status, priority]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tickets</h1>
          <p className="text-xs text-slate-400 mt-0.5">{total} total service requests</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer transition">
          <Plus className="w-4 h-4" /> New ticket
        </button>
      </div>

      {showCreate && (
        <CreateTicketModal onClose={() => setShowCreate(false)} onCreated={fetchTickets} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input type="text" placeholder="Search tickets..." defaultValue={search}
            onChange={e => {
              const val = e.target.value;
              if (searchTimer.current) clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(() => setParam("search", val), 400);
            }}
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
        </div>
        <select value={status} onChange={e => setParam("status", e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
          <option value="">All status</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={priority} onChange={e => setParam("priority", e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
          <option value="">All priority</option>
          {["low", "medium", "high", "critical"].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
        </select>
        {(search || status || priority) && (
          <button onClick={() => router.push(pathname)}
            className="flex items-center gap-1 h-9 px-3 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        <button onClick={fetchTickets}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Ticket", "Category / Fault", "Product", "Status", "Priority", "Assigned to", "Customer", "Date", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? Array(6).fill(0).map((_, i) => (
                <tr key={i}>{Array(9).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>
                ))}</tr>
              )) : tickets.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Ticket className="w-10 h-10 text-slate-300" />
                    <p className="text-slate-500 text-sm">No tickets found</p>
                    <button onClick={() => setShowCreate(true)} className="text-xs text-blue-600 hover:underline cursor-pointer">Create first ticket</button>
                  </div>
                </td></tr>
              ) : tickets.map(ticket => {
                const sCfg = STATUS_CFG[ticket.status] ?? STATUS_CFG.open;
                return (
                  <tr key={ticket._id} className="hover:bg-slate-50 transition group">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/tickets/${ticket._id}`}
                        className="text-sm font-medium text-slate-800 hover:text-blue-600 transition block">
                        {ticket.title}
                      </Link>
                      <span className="font-mono text-[10px] text-slate-400">{ticket.ticketNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      {ticket.categoryId && <p className="text-xs text-blue-600 font-medium">{ticket.categoryId.name}</p>}
                      {ticket.faultName && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 mt-0.5">
                          <Zap className="w-2.5 h-2.5" /> {ticket.faultName}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {ticket.productId ? (
                        <div>
                          <p className="font-medium">{ticket.productId.name}</p>
                          <p className="text-slate-400 font-mono text-[10px]">{ticket.productId.modelNumber}</p>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border ${sCfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border capitalize ${PRIORITY_CFG[ticket.priority] ?? ""}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {ticket.serviceCenterId ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {ticket.serviceCenterId.name}
                        </span>
                      ) : ticket.technicianId ? (
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-slate-400" />
                          {ticket.technicianId.name}
                        </span>
                      ) : <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{ticket.customerId?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(ticket.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/tickets/${ticket._id}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(page - 1)} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <span key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-400 text-xs px-1">…</span>}
                    <button onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium cursor-pointer transition ${p === page ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {p}
                    </button>
                  </span>
                ))}
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrandTicketsPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />}>
      <BrandTicketsContent />
    </Suspense>
  );
}