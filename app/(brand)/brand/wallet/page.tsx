"use client";
// app/(brand)/brand/wallet/page.tsx  — NEW FILE
// Brand manager wallet: earnings from resolved tickets across all SCs

import { useState, useEffect, useCallback } from "react";
import {
  Wallet, TrendingUp, TrendingDown, Clock, CheckCircle,
  XCircle, ArrowUpRight, ArrowDownLeft, RefreshCw,
  Building2, CreditCard, Smartphone, Edit2, Check,
  AlertCircle, ChevronLeft, ChevronRight, Download,
} from "lucide-react";
import toast from "react-hot-toast";

interface WalletData {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingAmount: number;
  ticketRate: number;
  bankDetails?: { accountHolder: string; accountNumber: string; ifscCode: string; bankName: string };
  upiId?: string;
  pendingWithdrawals: number;
  transactions: Tx[];
  totalTransactions: number;
  page: number;
  totalPages: number;
}
interface Tx {
  _id: string;
  type: string;
  amount: number;
  description: string;
  ticketNumber?: string;
  balanceAfter: number;
  createdAt: string;
}
interface WithdrawalReq {
  _id: string; amount: number; method: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string; rejectionReason?: string;
}

const fmtAmt  = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:false });

const inputCls = "w-full h-10 border border-slate-200 rounded-xl px-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition text-slate-800";

export default function BrandWalletPage() {
  const [wallet,      setWallet]      = useState<WalletData | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalReq[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState<'overview' | 'transactions' | 'withdraw' | 'settings'>('overview');
  const [txFilter,    setTxFilter]    = useState('');
  const [page,        setPage]        = useState(1);
  const [wdAmount,    setWdAmount]    = useState('');
  const [wdMethod,    setWdMethod]    = useState<'bank' | 'upi'>('bank');
  const [wdLoading,   setWdLoading]   = useState(false);
  const [editPay,     setEditPay]     = useState(false);
  const [bankForm,    setBankForm]    = useState({ accountHolder:'', accountNumber:'', ifscCode:'', bankName:'' });
  const [upiId,       setUpiId]       = useState('');
  const [savingPay,   setSavingPay]   = useState(false);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, wrRes] = await Promise.all([
        fetch(`/api/wallet?page=${page}&limit=15&ownerType=brand${txFilter ? `&type=${txFilter}` : ''}`, { credentials:'include' }),
        fetch('/api/wallet/withdrawal', { credentials:'include' }),
      ]);
      const [wData, wrData] = await Promise.all([wRes.json(), wrRes.json()]);
      setWallet(wData.data);
      setWithdrawals(wrData.data?.requests ?? []);
      if (wData.data?.bankDetails) setBankForm(wData.data.bankDetails);
      if (wData.data?.upiId) setUpiId(wData.data.upiId);
    } catch { toast.error('Failed to load wallet'); }
    finally { setLoading(false); }
  }, [page, txFilter]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const handleWithdraw = async () => {
    const amt = Number(wdAmount);
    if (!amt || amt < 100) { toast.error('Minimum withdrawal is ₹100'); return; }
    if (!wallet || amt > wallet.balance) { toast.error('Insufficient balance'); return; }
    setWdLoading(true);
    try {
      const res = await fetch('/api/wallet/withdrawal', {
        method:'POST', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ amount: amt, method: wdMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'Failed');
      toast.success('Withdrawal request submitted!');
      setWdAmount('');
      fetchWallet();
      setTab('overview');
    } catch (e:any) { toast.error(e.message || 'Failed'); }
    finally { setWdLoading(false); }
  };

  const handleSavePay = async () => {
    setSavingPay(true);
    try {
      const res = await fetch('/api/wallet', {
        method:'PATCH', credentials:'include',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ bankDetails: bankForm, upiId }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Payment details saved');
      setEditPay(false);
      fetchWallet();
    } catch { toast.error('Failed to save'); }
    finally { setSavingPay(false); }
  };

  const exportCSV = () => {
    if (!wallet) return;
    const rows = [
      ['Date','Type','Description','Ticket','Amount','Balance After'],
      ...wallet.transactions.map(t => [fmtDate(t.createdAt), t.type, t.description, t.ticketNumber ?? '', t.amount, t.balanceAfter]),
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type:'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `brand-wallet-${new Date().toISOString().slice(0,10)}.csv`,
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const w = wallet;

  if (loading && !w) return (
    <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
      <div className="h-48 bg-white rounded-2xl border border-slate-200" />
      <div className="grid grid-cols-3 gap-4">
        {Array(3).fill(0).map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white translate-x-24 -translate-y-24" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white -translate-x-20 translate-y-20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 opacity-80" />
            <p className="text-sm font-medium opacity-80">Brand Wallet</p>
            {w?.pendingWithdrawals ? (
              <span className="ml-auto flex items-center gap-1 bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> {w.pendingWithdrawals} pending
              </span>
            ) : null}
          </div>
          <p className="text-5xl font-bold tracking-tight">{fmtAmt(w?.balance ?? 0)}</p>
          <p className="text-sm opacity-70 mt-1">Available balance</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full">₹{w?.ticketRate ?? 500}/ticket</span>
            {w?.pendingAmount ? <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full">{fmtAmt(w.pendingAmount)} pending</span> : null}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setTab('withdraw')}
              className="flex items-center gap-2 h-9 px-4 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 cursor-pointer transition">
              <ArrowUpRight className="w-4 h-4 rotate-90" /> Withdraw
            </button>
            <button onClick={() => setTab('transactions')}
              className="flex items-center gap-2 h-9 px-4 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 cursor-pointer transition">
              History
            </button>
            <button onClick={() => setTab('settings')}
              className="flex items-center gap-2 h-9 px-4 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 cursor-pointer transition">
              <CreditCard className="w-4 h-4" /> Payment
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Total Earned',    value: fmtAmt(w?.totalEarned    ?? 0), color:'green' },
          { label:'Total Withdrawn', value: fmtAmt(w?.totalWithdrawn ?? 0), color:'red'   },
          { label:'Pending',         value: fmtAmt(w?.pendingAmount  ?? 0), color:'amber' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center">
            <p className={`text-2xl font-bold ${color==='green'?'text-green-600':color==='red'?'text-red-500':'text-amber-600'}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {(['overview','transactions','withdraw','settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition cursor-pointer ${tab===t?'bg-white text-blue-700 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {withdrawals.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">Withdrawal Requests</p>
              </div>
              <div className="divide-y divide-slate-100">
                {withdrawals.slice(0,5).map(wr => (
                  <div key={wr._id} className="flex items-center gap-3 px-5 py-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${wr.status==='approved'?'bg-green-50 text-green-600':wr.status==='rejected'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-600'}`}>
                      {wr.status==='approved'?<CheckCircle className="w-4 h-4"/>:wr.status==='rejected'?<XCircle className="w-4 h-4"/>:<Clock className="w-4 h-4"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{fmtAmt(wr.amount)} via {wr.method.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400">{fmtDate(wr.requestedAt)}</p>
                      {wr.rejectionReason && <p className="text-[10px] text-red-500">{wr.rejectionReason}</p>}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${wr.status==='approved'?'bg-green-50 text-green-700':wr.status==='rejected'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-700'}`}>{wr.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-800">Recent Transactions</p>
              <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-blue-600 cursor-pointer"><Download className="w-3.5 h-3.5"/>Export</button>
            </div>
            <TxList txs={w?.transactions ?? []} loading={loading} />
          </div>
        </div>
      )}

      {/* TRANSACTIONS */}
      {tab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 flex-wrap">
            <p className="text-sm font-bold text-slate-800 flex-1">All ({w?.totalTransactions ?? 0})</p>
            <div className="flex gap-1.5 flex-wrap">
              {['','credit','debit','withdrawal','refund'].map(f => (
                <button key={f} onClick={() => { setTxFilter(f); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize cursor-pointer transition ${txFilter===f?'bg-blue-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {f || 'All'}
                </button>
              ))}
            </div>
            <button onClick={exportCSV} className="flex items-center gap-1 text-xs text-blue-600 cursor-pointer"><Download className="w-3.5 h-3.5"/>CSV</button>
          </div>
          <TxList txs={w?.transactions ?? []} loading={loading} />
          {(w?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Page {page} of {w?.totalPages}</p>
              <div className="flex gap-1.5">
                <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
                <button onClick={() => setPage(p=>Math.min(w?.totalPages??1,p+1))} disabled={page===(w?.totalPages??1)} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WITHDRAW */}
      {tab === 'withdraw' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">Request Withdrawal</h2>
            <p className="text-xs text-slate-400 mt-0.5">Available: <strong className="text-blue-700">{fmtAmt(w?.balance ?? 0)}</strong></p>
          </div>
          {!w?.bankDetails?.accountNumber && !w?.upiId && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
              <p>Add payment details in <button onClick={() => setTab('settings')} className="font-semibold underline cursor-pointer">Settings</button> first.</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Amount (₹)</label>
            <input type="number" className={inputCls} placeholder="Min ₹100" value={wdAmount} onChange={e => setWdAmount(e.target.value)}/>
            <div className="flex gap-2 mt-2">
              {[500,1000,2000,5000].map(v => (
                <button key={v} onClick={() => setWdAmount(String(Math.min(v, w?.balance??0)))}
                  className="flex-1 h-8 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer">{fmtAmt(v)}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Method</label>
            <div className="grid grid-cols-2 gap-3">
              {(['bank','upi'] as const).map(m => (
                <label key={m} onClick={() => setWdMethod(m)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${wdMethod===m?'border-blue-400 bg-blue-50':'border-slate-200 hover:border-slate-300'}`}>
                  {m==='bank'?<Building2 className="w-5 h-5 text-blue-600"/>:<Smartphone className="w-5 h-5 text-blue-600"/>}
                  <div>
                    <p className="text-sm font-semibold text-slate-800 uppercase">{m}</p>
                    <p className="text-[10px] text-slate-400">{m==='bank'?(w?.bankDetails?.accountNumber?`****${w.bankDetails.accountNumber.slice(-4)}`:'Not set'):(w?.upiId??'Not set')}</p>
                  </div>
                  {wdMethod===m && <Check className="w-4 h-4 text-blue-600 ml-auto"/>}
                </label>
              ))}
            </div>
          </div>
          <button onClick={handleWithdraw} disabled={wdLoading || !wdAmount || Number(wdAmount)<100}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold cursor-pointer transition flex items-center justify-center gap-2">
            {wdLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <ArrowUpRight className="w-4 h-4 rotate-90"/>}
            {wdLoading ? 'Submitting...' : 'Request Withdrawal'}
          </button>
          <p className="text-[10px] text-slate-400 text-center">Processed in 2-3 business days after admin approval</p>
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Payment Settings</h2>
            {!editPay && <button onClick={() => setEditPay(true)} className="flex items-center gap-1.5 text-xs text-blue-600 cursor-pointer"><Edit2 className="w-3.5 h-3.5"/>Edit</button>}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bank Account</p>
            {[
              {label:'Account Holder',key:'accountHolder',ph:'Full name as per bank'},
              {label:'Account Number',key:'accountNumber',ph:'12-16 digit account number'},
              {label:'IFSC Code',key:'ifscCode',ph:'e.g. SBIN0001234'},
              {label:'Bank Name',key:'bankName',ph:'e.g. State Bank of India'},
            ].map(({label,key,ph}) => (
              <div key={key}>
                <label className="block text-xs text-slate-500 mb-1">{label}</label>
                <input className={`${inputCls} ${!editPay?'cursor-default bg-slate-100 border-transparent':''}`} readOnly={!editPay}
                  placeholder={ph} value={(bankForm as any)[key]} onChange={e => setBankForm(p => ({...p,[key]:e.target.value}))}/>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">UPI ID</p>
              <input className={`${inputCls} ${!editPay?'cursor-default bg-slate-100 border-transparent':''}`} readOnly={!editPay}
                placeholder="e.g. name@upi" value={upiId} onChange={e => setUpiId(e.target.value)}/>
            </div>
          </div>
          {editPay && (
            <div className="flex gap-2">
              <button onClick={() => setEditPay(false)} className="flex-1 h-10 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={handleSavePay} disabled={savingPay} className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2">
                {savingPay?<RefreshCw className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>} Save
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TxList({ txs, loading }: { txs: Tx[]; loading: boolean }) {
  const fmtAmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtD   = (d: string) => new Date(d).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false});
  const SIGN: Record<string,string> = { credit:'+', debit:'-', withdrawal:'−', refund:'+' };
  const CLS:  Record<string,string> = { credit:'text-green-600', debit:'text-red-500', withdrawal:'text-orange-500', refund:'text-blue-500' };

  if (loading) return <div className="divide-y divide-slate-100">{Array(5).fill(0).map((_,i) => <div key={i} className="flex gap-3 px-5 py-3 animate-pulse"><div className="w-9 h-9 bg-slate-200 rounded-xl"/><div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded w-2/3"/><div className="h-2.5 bg-slate-100 rounded w-1/3"/></div><div className="h-4 bg-slate-200 rounded w-16"/></div>)}</div>;
  if (!txs.length) return <div className="py-12 flex flex-col items-center gap-2 text-slate-400"><Wallet className="w-10 h-10 opacity-20"/><p className="text-sm">No transactions yet</p></div>;

  return (
    <div className="divide-y divide-slate-100">
      {txs.map((t,i) => (
        <div key={t._id??i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${t.type==='credit'||t.type==='refund'?'bg-green-50 text-green-700':t.type==='withdrawal'?'bg-orange-50 text-orange-600':'bg-red-50 text-red-500'}`}>{SIGN[t.type]??''}₹</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{t.description}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
              <span className="capitalize">{t.type}</span>
              {t.ticketNumber && <><span>·</span><span className="font-mono">{t.ticketNumber}</span></>}
              <span>·</span><span>{fmtD(t.createdAt)}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${CLS[t.type]??'text-slate-700'}`}>{SIGN[t.type]??''}{fmtAmt(t.amount)}</p>
            <p className="text-[10px] text-slate-400">Bal: {fmtAmt(t.balanceAfter)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}