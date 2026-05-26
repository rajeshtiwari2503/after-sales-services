"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Truck, Package, Check, X, RefreshCw, Plus, Send, Inbox,
} from "lucide-react";
import toast from "react-hot-toast";

interface Transfer {
  _id: string;
  transferNumber: string;
  kind: "dispatch" | "request";
  status: string;
  serviceCenterId: string;
  serviceCenterName?: string;
  items: { name: string; sku: string; quantity: number }[];
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
}

interface SC {
  _id: string;
  name: string;
  code: string;
}

interface InvItem {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

const STATUS_CLS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  in_transit: "bg-blue-50 text-blue-700 border-blue-100",
  received: "bg-green-50 text-green-700 border-green-100",
  rejected: "bg-red-50 text-red-600 border-red-100",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

type Props = {
  role: "admin" | "manager" | "service_center";
};

export default function InventoryTransfersPanel({ role }: Props) {
  const canDispatch = role === "admin" || role === "manager";
  const canRequest = role === "service_center";
  const canReceive = role === "service_center";

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<SC[]>([]);
  const [stock, setStock] = useState<InvItem[]>([]);

  const [showDispatch, setShowDispatch] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [scId, setScId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<{ inventoryId: string; name: string; sku: string; quantity: number; max: number }[]>([]);
  const [reqLines, setReqLines] = useState([{ name: "", sku: "", quantity: 1 }]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/transfers", { credentials: "include" });
      const data = await res.json();
      setTransfers(data.data?.transfers ?? []);
    } catch {
      toast.error("Failed to load transfers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (canDispatch) {
      fetch("/api/service-centers", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setCenters(d.data ?? []));
      fetch("/api/inventory?warehouse=central&limit=100", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setStock(d.data?.inventory ?? []));
    }
  }, [canDispatch, load]);

  const patchTransfer = async (id: string, action: string, extra?: Record<string, string>) => {
    const res = await fetch(`/api/inventory/transfers/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Action failed");
    toast.success(data.message || "Updated");
    load();
  };

  const submitDispatch = async () => {
    if (!scId || lines.length === 0) {
      toast.error("Select service center and at least one item");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/inventory/transfers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "dispatch",
          serviceCenterId: scId,
          notes,
          items: lines.map((l) => ({
            inventoryId: l.inventoryId,
            name: l.name,
            sku: l.sku,
            quantity: l.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Parts dispatched");
      setShowDispatch(false);
      setLines([]);
      setNotes("");
      load();
      if (canDispatch) {
        fetch("/api/inventory?warehouse=central&limit=100", { credentials: "include" })
          .then((r) => r.json())
          .then((d) => setStock(d.data?.inventory ?? []));
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Dispatch failed");
    } finally {
      setSaving(false);
    }
  };

  const submitRequest = async () => {
    const valid = reqLines.filter((l) => l.name && l.quantity > 0);
    if (!valid.length) {
      toast.error("Add at least one part");
      return;
    }
    let myScId = scId;
    if (!myScId && typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        myScId = u.serviceCenterId ?? "";
      } catch { /* ignore */ }
    }
    if (!myScId) {
      toast.error("Service center not linked to your account");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/inventory/transfers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "request",
          serviceCenterId: myScId,
          notes,
          items: valid.map((l) => ({
            name: l.name,
            sku: l.sku || `REQ-${l.name.slice(0, 8).toUpperCase()}`,
            quantity: Number(l.quantity),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Request submitted to brand");
      setShowRequest(false);
      setReqLines([{ name: "", sku: "", quantity: 1 }]);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (canRequest && !scId) {
      fetch("/api/service-centers", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          const list = d.data ?? [];
          setCenters(list);
          if (list[0]) setScId(list[0]._id);
        });
    }
  }, [canRequest, scId]);

  const addLineFromStock = (item: InvItem) => {
    if (lines.some((l) => l.inventoryId === item._id)) return;
    setLines((p) => [
      ...p,
      { inventoryId: item._id, name: item.name, sku: item.sku, quantity: 1, max: item.quantity },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Send spare parts to service centers or review incoming requests.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {canDispatch && (
            <button
              type="button"
              onClick={() => setShowDispatch(true)}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Dispatch to SC
            </button>
          )}
          {canRequest && (
            <button
              type="button"
              onClick={() => setShowRequest(true)}
              className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
            >
              <Inbox className="w-4 h-4" /> Request parts
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading transfers…</div>
      ) : transfers.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
          <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No transfers yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((t) => (
            <div
              key={t._id}
              className="bg-white border border-slate-200/80 rounded-xl p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-xs text-slate-500">{t.transferNumber}</span>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {t.serviceCenterName ?? "Service center"} · {t.kind === "request" ? "Request" : "Dispatch"}
                  </h3>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${STATUS_CLS[t.status] ?? STATUS_CLS.pending}`}>
                  {t.status.replace(/_/g, " ")}
                </span>
              </div>
              <ul className="text-xs text-slate-600 space-y-0.5 mb-3">
                {t.items.map((it, i) => (
                  <li key={i}>
                    {it.name} ({it.sku}) × {it.quantity}
                  </li>
                ))}
              </ul>
              {t.rejectionReason && (
                <p className="text-xs text-red-600 mb-2">Rejected: {t.rejectionReason}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {canDispatch && t.kind === "request" && t.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => patchTransfer(t._id, "approve")}
                      className="h-8 px-3 bg-green-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve & ship
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt("Rejection reason (optional)") ?? "";
                        patchTransfer(t._id, "reject", { reason }).catch((e) =>
                          toast.error(e instanceof Error ? e.message : "Failed")
                        );
                      }}
                      className="h-8 px-3 border border-red-200 text-red-600 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                {canReceive && t.status === "in_transit" && (
                  <button
                    type="button"
                    onClick={() =>
                      patchTransfer(t._id, "receive").catch((e) =>
                        toast.error(e instanceof Error ? e.message : "Failed")
                      )
                    }
                    className="h-8 px-3 bg-indigo-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Package className="w-3.5 h-3.5" /> Confirm received
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDispatch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">Dispatch to service center</h2>
              <button type="button" onClick={() => setShowDispatch(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Service center</label>
              <select className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm" value={scId} onChange={(e) => setScId(e.target.value)}>
                <option value="">Select…</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Central warehouse stock</label>
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg divide-y">
                {stock.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => addLineFromStock(item)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex justify-between"
                  >
                    <span>{item.name} · {item.sku}</span>
                    <span className="text-slate-400">Qty {item.quantity}</span>
                  </button>
                ))}
              </div>
            </div>
            {lines.length > 0 && (
              <div className="space-y-2">
                {lines.map((l, i) => (
                  <div key={l.inventoryId} className="flex gap-2 items-center text-sm">
                    <span className="flex-1 truncate">{l.name}</span>
                    <input
                      type="number"
                      min={1}
                      max={l.max}
                      className="w-16 h-8 border rounded px-2"
                      value={l.quantity}
                      onChange={(e) => {
                        const q = Math.min(l.max, Math.max(1, Number(e.target.value)));
                        setLines((prev) => prev.map((x, j) => (j === i ? { ...x, quantity: q } : x)));
                      }}
                    />
                    <button type="button" onClick={() => setLines((p) => p.filter((_, j) => j !== i))}><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                ))}
              </div>
            )}
            <textarea className="w-full border rounded-lg p-2 text-sm" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            <button type="button" disabled={saving} onClick={submitDispatch} className="w-full h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? "Sending…" : "Dispatch shipment"}
            </button>
          </div>
        </div>
      )}

      {showRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">Request spare parts</h2>
              <button type="button" onClick={() => setShowRequest(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {reqLines.map((l, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <input className="col-span-2 h-9 border rounded-lg px-2 text-sm" placeholder="Part name" value={l.name} onChange={(e) => setReqLines((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                <input type="number" min={1} className="h-9 border rounded-lg px-2 text-sm" value={l.quantity} onChange={(e) => setReqLines((p) => p.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value) } : x))} />
              </div>
            ))}
            <button type="button" onClick={() => setReqLines((p) => [...p, { name: "", sku: "", quantity: 1 }])} className="text-xs text-indigo-600 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add line
            </button>
            <button type="button" disabled={saving} onClick={submitRequest} className="w-full h-10 bg-teal-600 text-white rounded-lg text-sm font-medium">
              {saving ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
