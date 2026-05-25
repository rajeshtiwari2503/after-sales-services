"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Plus, Trash2, AlertTriangle, RefreshCw, X, Check, Search } from "lucide-react";
import toast from "react-hot-toast";

interface PartEntry {
  _id: string;
  partName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  loggedAt: string;
  notes?: string;
  loggedBy?: { name: string } | null;
}

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

interface Props {
  ticketId: string;
  readonly?: boolean;
  onPartsChange?: (totalCost: number) => void;
}

export default function TicketParts({ ticketId, readonly = false, onPartsChange }: Props) {
  const [parts,        setParts]        = useState<PartEntry[]>([]);
  const [totalCost,    setTotalCost]    = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [showDialog,   setShowDialog]   = useState(false);
  const [inventory,    setInventory]    = useState<InventoryItem[]>([]);
  const [invLoading,   setInvLoading]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState<InventoryItem | null>(null);
  const [qty,          setQty]          = useState(1);
  const [notes,        setNotes]        = useState("");
  const [logging,      setLogging]      = useState(false);

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/tickets/${ticketId}/parts`, { credentials: "include" });
      const data = await res.json();
      setParts(data.data?.partsUsed ?? []);
      setTotalCost(data.data?.totalPartsCost ?? 0);
      onPartsChange?.(data.data?.totalPartsCost ?? 0);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [ticketId, onPartsChange]);

  useEffect(() => { fetchParts(); }, [fetchParts]);

  const fetchInventory = async (q = "") => {
    setInvLoading(true);
    try {
      const res  = await fetch(`/api/inventory?limit=50&search=${encodeURIComponent(q)}`, { credentials: "include" });
      const data = await res.json();
      setInventory(data.data?.inventory ?? []);
    } catch { /* silent */ }
    finally { setInvLoading(false); }
  };

  const openDialog = () => {
    setSelected(null); setQty(1); setNotes(""); setSearch("");
    setShowDialog(true);
    fetchInventory();
  };

  useEffect(() => {
    if (!showDialog) return;
    const t = setTimeout(() => fetchInventory(search), 300);
    return () => clearTimeout(t);
  }, [search, showDialog]);

  const handleLogPart = async () => {
    if (!selected) return;
    setLogging(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/parts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId: selected._id, quantity: qty, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${selected.name} logged. Stock: ${data.data?.remainingStock}`);
      setShowDialog(false);
      fetchParts();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to log part");
    } finally {
      setLogging(false);
    }
  };

  const handleRemove = async (partId: string, partName: string) => {
    if (!confirm(`Remove "${partName}" from this ticket? Stock will be restored.`)) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/parts/${partId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Part removed, stock restored");
      fetchParts();
    } catch {
      toast.error("Failed to remove part");
    }
  };

  const fmtINR  = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Package className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Parts Used</p>
            <p className="text-xs text-slate-400">
              {parts.length} part{parts.length !== 1 ? "s" : ""} · Total: {fmtINR(totalCost)}
            </p>
          </div>
        </div>
        {!readonly && (
          <button onClick={openDialog}
            className="flex items-center gap-1.5 h-8 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium cursor-pointer transition">
            <Plus className="w-3.5 h-3.5" /> Log Part
          </button>
        )}
      </div>

      {/* Parts list */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-5 text-center text-slate-400 text-sm animate-pulse">Loading parts…</div>
        ) : parts.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-8 h-8 mx-auto text-slate-200 mb-2" />
            <p className="text-sm text-slate-400">No parts logged yet</p>
            {!readonly && (
              <button onClick={openDialog} className="text-xs text-indigo-600 hover:underline mt-1 cursor-pointer">
                Log first part
              </button>
            )}
          </div>
        ) : (
          parts.map(part => (
            <div key={part._id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{part.partName}</p>
                  {part.sku && <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{part.sku}</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
                  <span>Qty: <strong className="text-slate-600">{part.quantity}</strong></span>
                  <span>@ {fmtINR(part.unitPrice)}</span>
                  {part.loggedBy && <span>by {(part.loggedBy as any).name ?? "Staff"}</span>}
                  <span>{fmtDate(part.loggedAt)}</span>
                  {part.notes && <span className="italic">"{part.notes}"</span>}
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 tabular-nums">{fmtINR(part.total)}</span>
              {!readonly && (
                <button onClick={() => handleRemove(part._id, part.partName)}
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 cursor-pointer transition ml-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        )}

        {/* Total row */}
        {parts.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Parts Cost</span>
            <span className="text-base font-bold text-slate-800">{fmtINR(totalCost)}</span>
          </div>
        )}
      </div>

      {/* ── Log Part Dialog ── */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Log Part Usage</h3>
              <button onClick={() => setShowDialog(false)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Search inventory */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Search Inventory</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or SKU..."
                    className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>

              {/* Inventory list */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                {invLoading ? (
                  <div className="p-4 text-center text-slate-400 text-sm animate-pulse">Loading…</div>
                ) : inventory.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">No items found</div>
                ) : inventory.map(inv => (
                  <button key={inv._id} onClick={() => setSelected(inv)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer text-left transition ${selected?._id === inv._id ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{inv.name}</p>
                      <p className="text-[10px] text-slate-400">{inv.sku} · Stock: {inv.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">₹{inv.unitPrice.toLocaleString("en-IN")}</p>
                      {inv.quantity === 0 && (
                        <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Out of stock</span>
                      )}
                      {selected?._id === inv._id && <Check className="w-4 h-4 text-indigo-600 ml-auto mt-0.5" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Qty + Notes */}
              {selected && (
                <>
                  <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-indigo-800">{selected.name}</p>
                      <p className="text-[10px] text-indigo-500">Available: {selected.quantity} · {fmtINR(selected.unitPrice)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-700">{fmtINR(selected.unitPrice * qty)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1.5">Quantity *</label>
                      <input type="number" min={1} max={selected.quantity} value={qty}
                        onChange={e => setQty(Math.max(1, Math.min(selected.quantity, +e.target.value)))}
                        className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1.5">Notes (optional)</label>
                      <input value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="e.g. replaced faulty screen"
                        className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setShowDialog(false)} className="h-9 px-4 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition">
                Cancel
              </button>
              <button onClick={handleLogPart} disabled={logging || !selected || selected.quantity === 0}
                className="flex items-center gap-2 h-9 px-5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium cursor-pointer transition disabled:opacity-60">
                {logging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                Log Part
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
