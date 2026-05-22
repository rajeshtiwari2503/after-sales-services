"use client";
// app/(dashboard)/dashboard/wallet/page.tsx  — NEW FILE (admin)
// Full admin control: all wallets, withdrawal approvals, manual credit/debit, ticket rate settings

import { useState, useEffect, useCallback } from "react";
import {
  Wallet, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle,
  RefreshCw, Search, X, ChevronDown, Plus, Minus, Check,
  Building2, AlertCircle, Download, Edit2,
} from "lucide-react";
import toast from "react-hot-toast";

interface WalletRow {
  _id: string;
  ownerId: string;
  ownerType: 'service_center' | 'brand';
  tenantId: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingAmount: number;
  ticketRate: number;
  withdrawalRequests: WR[];
  transactions: Tx[];
}
interface WR {
  _id: string; amount: number; method: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string; rejectionReason?: string;
  upiId?: string;
  bankDetails?: { accountHolder: string; accountNumber: string; ifscCode: string; bankName: string };
}
interface Tx { _id: string; type: string; amount: number; description: string; balanceAfter: number; createdAt: string; }
interface Summary { totalWallets: number; totalBalance: number; totalEarned: number; totalWithdrawn: number; pendingWithdrawals: number; pendingAmount: number; }

const fmtAmt  = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit', hour12:false });

const inputCls = "w-full h-10 border border-slate-200 rounded-xl px-3 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition text-slate-800";

export default function AdminWalletPage() {
  const [wallets,     setWallets]     = useState<WalletRow[]>([]);
  const [summary,     setSummary]     = useState<Summary | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState('');
  const [tab,         setTab]         = useState<'wallets' | 'withdrawals' | 'credit'>('wallets');
  const [selected,    setSelected]    = useState<WalletRow | null>(null);

  // Rate edit
  const [editRate,    setEditRate]    = useState<{ walletId: string; rate: string } | null>(null);
  const [savingRate,  setSavingRate]  = useState(false);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<{ walletId: string; reqId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing,   setProcessing]   = useState(false);

  // Manual credit form
  const [creditForm, setCreditForm] = useState({ ownerId:'', ownerType:'service_center', tenantId:'', amount:'', type:'credit', note:'' });
  const [crediting,  setCrediting]  = useState(false);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set('ownerType', filterType);
      const res  = await fetch(`/api/wallet/admin?${params}`, { credentials:'include' });
      const data = await res.json();
      setWallets(data.data?.wallets ?? []);
      setSummary(data.data?.summary ?? null);
    } catch { toast.error('Failed to load wallets'); }
    finally { setLoading(false); }
  }, [filterType]);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);

  /* ── Approve withdrawal ── */
  const handleApprove = async (walletId: string, reqId: string) => {
    if (!confirm('Approve this withdrawal?')) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/wallet/admin', {
        method:'PATCH', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ action:'approve', walletId, requestId: reqId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed');
      toast.success('Withdrawal approved');
      fetchWallets();
    } catch (e:any) { toast.error(e.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  /* ── Reject withdrawal ── */
  const handleReject = async () => {
    if (!rejectTarget) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/wallet/admin', {
        method:'PATCH', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ action:'reject', walletId: rejectTarget.walletId, requestId: rejectTarget.reqId, reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed');
      toast.success('Withdrawal rejected, amount refunded');
      setRejectTarget(null); setRejectReason('');
      fetchWallets();
    } catch (e:any) { toast.error(e.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  /* ── Save ticket rate ── */
  const handleSaveRate = async () => {
    if (!editRate) return;
    setSavingRate(true);
    try {
      const res = await fetch('/api/wallet/admin', {
        method:'PATCH', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ action:'set_rate', walletId: editRate.walletId, ticketRate: Number(editRate.rate) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed');
      toast.success(`Ticket rate updated to ₹${editRate.rate}`);
      setEditRate(null);
      fetchWallets();
    } catch (e:any) { toast.error(e.message || 'Failed'); }
    finally { setSavingRate(false); }
  };

  /* ── Manual credit/debit ── */
  const handleManualCredit = async () => {
    if (!creditForm.ownerId || !creditForm.amount) { toast.error('Fill all fields'); return; }
    setCrediting(true);
    try {
      const res = await fetch('/api/wallet/credit', {
        method:'POST', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          ownerId:   creditForm.ownerId,
          ownerType: creditForm.ownerType,
          tenantId:  creditForm.tenantId,
          amount:    Number(creditForm.amount),
          type:      creditForm.type,
          note:      creditForm.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed');
      toast.success(`₹${creditForm.amount} ${creditForm.type}ed successfully`);
      setCreditForm({ ownerId:'', ownerType:'service_center', tenantId:'', amount:'', type:'credit', note:'' });
      fetchWallets();
    } catch (e:any) { toast.error(e.message || 'Failed'); }
    finally { setCrediting(false); }
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [
      ['Wallet ID','Owner ID','Type','Tenant','Balance','Total Earned','Total Withdrawn','Pending','Ticket Rate'],
      ...wallets.map(w => [w._id, w.ownerId, w.ownerType, w.tenantId, w.balance, w.totalEarned, w.totalWithdrawn, w.pendingAmount, w.ticketRate]),
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type:'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download:`wallets-${new Date().toISOString().slice(0,10)}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  /* ── Pending withdrawals across all wallets ── */
  const allPending = wallets.flatMap(w =>
    (w.withdrawalRequests ?? [])
      .filter(r => r.status === 'pending')
      .map(r => ({ ...r, walletId: w._id, tenantId: w.tenantId, ownerType: w.ownerType }))
  ).sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const filtered = wallets.filter(w =>
    !search ||
    w.tenantId?.toLowerCase().includes(search.toLowerCase()) ||
    w.ownerType?.toLowerCase().includes(search.toLowerCase()) ||
    w.ownerId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Wallet Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Admin control — all brands & service centers</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchWallets} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white">
            <RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/>
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium cursor-pointer">
            <Download className="w-3.5 h-3.5"/> Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label:'Total Wallets',   value: summary.totalWallets,                  color:'indigo' },
            { label:'Total Balance',   value: fmtAmt(summary.totalBalance),           color:'green'  },
            { label:'Total Earned',    value: fmtAmt(summary.totalEarned),            color:'blue'   },
            { label:'Total Withdrawn', value: fmtAmt(summary.totalWithdrawn),         color:'slate'  },
            { label:'Pending Requests',value: summary.pendingWithdrawals,             color:'amber'  },
            { label:'Pending Amount',  value: fmtAmt(summary.pendingAmount),          color:'red'    },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-4">
              <p className={`text-lg font-bold ${
                color==='indigo'?'text-indigo-600':color==='green'?'text-green-600':
                color==='blue'?'text-blue-600':color==='amber'?'text-amber-600':
                color==='red'?'text-red-500':'text-slate-700'
              }`}>{value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {([
          { key:'wallets',     label:`Wallets (${wallets.length})`                 },
          { key:'withdrawals', label:`Pending Withdrawals (${allPending.length})`  },
          { key:'credit',      label:'Manual Credit / Debit'                       },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition cursor-pointer ${tab===key?'bg-white text-indigo-700 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ WALLETS TAB ══ */}
      {tab === 'wallets' && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[180px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0"/>
              <input type="text" placeholder="Search by tenant, type, owner ID..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"/>
              {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-slate-400"/></button>}
            </div>
            {['','service_center','brand'].map(f => (
              <button key={f} onClick={() => setFilterType(f)}
                className={`h-9 px-3 rounded-lg border text-xs font-medium capitalize cursor-pointer transition ${filterType===f?'bg-indigo-600 border-indigo-600 text-white':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {f||'All'}
              </button>
            ))}
          </div>

          {/* Wallet table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Tenant / Type','Balance','Total Earned','Total Withdrawn','Pending','Ticket Rate','Pending Reqs','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? Array(5).fill(0).map((_,i) => (
                    <tr key={i}>{Array(8).fill(0).map((_,j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse"/></td>)}</tr>
                  )) : filtered.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-400">No wallets found</td></tr>
                  ) : filtered.map(w => {
                    const pendingReqs = (w.withdrawalRequests??[]).filter(r => r.status==='pending').length;
                    return (
                      <tr key={w._id} className="hover:bg-slate-50 transition group">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-800">{w.tenantId}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${w.ownerType==='brand'?'bg-blue-50 text-blue-700':'bg-teal-50 text-teal-700'}`}>
                            {w.ownerType.replace('_',' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-green-700">{fmtAmt(w.balance)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{fmtAmt(w.totalEarned)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{fmtAmt(w.totalWithdrawn)}</td>
                        <td className="px-4 py-3 text-sm text-amber-600 font-medium">{fmtAmt(w.pendingAmount)}</td>
                        <td className="px-4 py-3">
                          {editRate?.walletId === w._id ? (
                            <div className="flex items-center gap-1.5">
                              <input type="number" className="w-20 h-8 border border-slate-200 rounded-lg px-2 text-xs focus:outline-none focus:border-indigo-400"
                                value={editRate.rate} onChange={e => setEditRate({ walletId: w._id, rate: e.target.value })}/>
                              <button onClick={handleSaveRate} disabled={savingRate}
                                className="w-7 h-7 flex items-center justify-center bg-indigo-600 text-white rounded-lg cursor-pointer">
                                {savingRate ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>}
                              </button>
                              <button onClick={() => setEditRate(null)} className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg cursor-pointer">
                                <X className="w-3 h-3 text-slate-500"/>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-indigo-700">{fmtAmt(w.ticketRate)}</span>
                              <button onClick={() => setEditRate({ walletId: w._id, rate: String(w.ticketRate) })}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-500 hover:bg-slate-100 cursor-pointer transition">
                                <Edit2 className="w-3 h-3"/>
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {pendingReqs > 0 ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                              <Clock className="w-3.5 h-3.5"/> {pendingReqs}
                            </span>
                          ) : <span className="text-xs text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setSelected(w); setCreditForm(p => ({ ...p, ownerId: w.ownerId, ownerType: w.ownerType, tenantId: w.tenantId })); setTab('credit'); }}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                            Credit/Debit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ WITHDRAWALS TAB ══ */}
      {tab === 'withdrawals' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Pending Withdrawal Requests ({allPending.length})</h2>
            <p className="text-xs text-slate-400 mt-0.5">Approve or reject — rejected amounts are refunded automatically</p>
          </div>

          {allPending.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <CheckCircle className="w-10 h-10 opacity-20"/>
              <p className="text-sm">No pending withdrawal requests</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allPending.map(req => (
                <div key={req._id} className="flex items-start gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800">{fmtAmt(req.amount)}</p>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{req.method.toUpperCase()}</span>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{req.tenantId}</span>
                      <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full capitalize">{req.ownerType?.replace('_',' ')}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Requested: {fmtDateTime(req.requestedAt)}</p>
                    {req.method === 'bank' && req.bankDetails && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {req.bankDetails.bankName} · {req.bankDetails.accountHolder} · ****{req.bankDetails.accountNumber?.slice(-4)} · {req.bankDetails.ifscCode}
                      </p>
                    )}
                    {req.method === 'upi' && req.upiId && (
                      <p className="text-xs text-slate-400 mt-0.5">UPI: {req.upiId}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(req.walletId, req._id)}
                      disabled={processing}
                      className="flex items-center gap-1.5 h-9 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-60 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5"/> Approve
                    </button>
                    <button
                      onClick={() => { setRejectTarget({ walletId: req.walletId, reqId: req._id }); setRejectReason(''); }}
                      disabled={processing}
                      className="flex items-center gap-1.5 h-9 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-60 transition"
                    >
                      <XCircle className="w-3.5 h-3.5"/> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ CREDIT/DEBIT TAB ══ */}
      {tab === 'credit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Manual Credit / Debit</h2>
              <p className="text-xs text-slate-400 mt-0.5">Directly adjust any wallet balance</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Select Wallet</label>
              <select className={inputCls} value={creditForm.ownerId}
                onChange={e => {
                  const w = wallets.find(x => x.ownerId === e.target.value);
                  setCreditForm(p => ({ ...p, ownerId: e.target.value, ownerType: w?.ownerType ?? 'service_center', tenantId: w?.tenantId ?? '' }));
                }}>
                <option value="">— Select wallet —</option>
                {wallets.map(w => (
                  <option key={w._id} value={w.ownerId}>
                    {w.tenantId} ({w.ownerType.replace('_',' ')}) — {fmtAmt(w.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Type</label>
              <div className="grid grid-cols-2 gap-3">
                {(['credit','debit'] as const).map(t => (
                  <label key={t} onClick={() => setCreditForm(p => ({ ...p, type: t }))}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${creditForm.type===t?(t==='credit'?'border-green-400 bg-green-50':'border-red-400 bg-red-50'):'border-slate-200 hover:border-slate-300'}`}>
                    {t==='credit' ? <Plus className="w-4 h-4 text-green-600"/> : <Minus className="w-4 h-4 text-red-500"/>}
                    <p className={`text-sm font-semibold capitalize ${t==='credit'?'text-green-700':'text-red-600'}`}>{t}</p>
                    {creditForm.type===t && <Check className="w-4 h-4 ml-auto text-indigo-600"/>}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Amount (₹)</label>
              <input type="number" className={inputCls} placeholder="Enter amount" value={creditForm.amount}
                onChange={e => setCreditForm(p => ({ ...p, amount: e.target.value }))}/>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Note / Reason</label>
              <input className={inputCls} placeholder="e.g. Bonus for Diwali, Penalty for SLA breach"
                value={creditForm.note} onChange={e => setCreditForm(p => ({ ...p, note: e.target.value }))}/>
            </div>

            {creditForm.ownerId && creditForm.amount && (
              <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs ${
                creditForm.type==='credit'?'bg-green-50 border-green-100 text-green-800':'bg-red-50 border-red-100 text-red-800'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0"/>
                {creditForm.type==='credit'?'Credit':'Debit'} {fmtAmt(Number(creditForm.amount))} from {creditForm.tenantId || 'selected wallet'}
              </div>
            )}

            <button onClick={handleManualCredit} disabled={crediting || !creditForm.ownerId || !creditForm.amount}
              className={`w-full h-11 text-white rounded-xl text-sm font-semibold cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-60 ${
                creditForm.type==='credit'?'bg-green-600 hover:bg-green-700':'bg-red-600 hover:bg-red-700'
              }`}>
              {crediting ? <RefreshCw className="w-4 h-4 animate-spin"/> : creditForm.type==='credit'?<Plus className="w-4 h-4"/>:<Minus className="w-4 h-4"/>}
              {crediting ? 'Processing...' : `Confirm ${creditForm.type}`}
            </button>
          </div>

          {/* Recent manual transactions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">All Wallet Balances</h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
              {wallets.map(w => (
                <div key={w._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => setCreditForm(p => ({ ...p, ownerId: w.ownerId, ownerType: w.ownerType, tenantId: w.tenantId }))}>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-indigo-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{w.tenantId}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{w.ownerType.replace('_',' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-700">{fmtAmt(w.balance)}</p>
                    <p className="text-[10px] text-slate-400">₹{w.ticketRate}/ticket</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Reject modal ── */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800">Reject Withdrawal</h2>
            <p className="text-sm text-slate-500">Amount will be refunded back to wallet.</p>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Reason (optional)</label>
              <input className={inputCls} placeholder="e.g. Incorrect bank details" value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}/>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRejectTarget(null)} className="flex-1 h-10 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={handleReject} disabled={processing}
                className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2">
                {processing?<RefreshCw className="w-4 h-4 animate-spin"/>:<XCircle className="w-4 h-4"/>}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}