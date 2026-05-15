"use client";
import { useState, useEffect } from "react";

interface Transaction {
  type: "credit" | "debit" | "withdrawal";
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

interface WalletData {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingAmount: number;
  bankDetails?: { accountHolder: string; accountNumber: string; ifscCode: string; bankName: string };
  upiId?: string;
  transactions: Transaction[];
  totalTransactions: number;
  page: number;
  totalPages: number;
}

const TYPE_STYLES: Record<string, string> = {
  credit: "text-green-600",
  debit: "text-red-600",
  withdrawal: "text-orange-600",
};
const TYPE_SIGNS: Record<string, string> = {
  credit: "+", debit: "-", withdrawal: "−",
};

export default function WalletDashboard({ ownerType }: { ownerType: "service_center" | "technician" }) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"bank" | "upi">("bank");
  const [withdrawing, setWithdrawing] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolder: "", accountNumber: "", ifscCode: "", bankName: "",
  });
  const [upiId, setUpiId] = useState("");
  const [page, setPage] = useState(1);

  const fetchWallet = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wallet?ownerType=${ownerType}&page=${p}`);
      const data = await res.json();
      if (data.success) setWallet(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(page); }, [page]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return alert("Enter valid amount");
    setWithdrawing(true);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method: withdrawMethod }),
      });
      const data = await res.json();
      alert(data.message || data.error);
      if (data.success) { setWithdrawAmount(""); fetchWallet(); }
    } finally {
      setWithdrawing(false);
    }
  };

  const saveBankDetails = async () => {
    const res = await fetch("/api/wallet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankDetails: bankForm, upiId }),
    });
    const data = await res.json();
    if (data.success) { setShowBankForm(false); fetchWallet(); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading wallet...</div>;
  if (!wallet) return null;

  return (
    <div className="space-y-4">
      {/* Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Available Balance", value: wallet.balance, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Earned", value: wallet.totalEarned, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending Payout", value: wallet.pendingAmount, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Total Withdrawn", value: wallet.totalWithdrawn, color: "text-gray-600", bg: "bg-gray-50" },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>
              ₹{card.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Withdrawal Request */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-800">Withdraw Funds</h3>
          <input
            type="number"
            placeholder="Amount (₹)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            max={wallet.balance}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setWithdrawMethod("bank")}
              className={`flex-1 py-2 rounded-lg text-sm border ${withdrawMethod === "bank" ? "border-blue-500 bg-blue-50 text-blue-700" : "text-gray-500"}`}
            >
              🏦 Bank
            </button>
            <button
              onClick={() => setWithdrawMethod("upi")}
              className={`flex-1 py-2 rounded-lg text-sm border ${withdrawMethod === "upi" ? "border-blue-500 bg-blue-50 text-blue-700" : "text-gray-500"}`}
            >
              📱 UPI
            </button>
          </div>
          {!wallet.bankDetails && !wallet.upiId && (
            <p className="text-xs text-orange-600">
              ⚠️ Add bank/UPI details first
            </p>
          )}
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !withdrawAmount || (!wallet.bankDetails && !wallet.upiId)}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {withdrawing ? "Processing..." : "Request Withdrawal"}
          </button>
          <button
            onClick={() => setShowBankForm((v) => !v)}
            className="w-full text-sm text-blue-600 hover:underline"
          >
            {wallet.bankDetails ? "Update bank/UPI details" : "+ Add bank/UPI details"}
          </button>

          {showBankForm && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {["accountHolder", "accountNumber", "ifscCode", "bankName"].map((field) => (
                <input
                  key={field}
                  placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                  value={bankForm[field as keyof typeof bankForm]}
                  onChange={(e) =>
                    setBankForm((f) => ({ ...f, [field]: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              ))}
              <input
                placeholder="UPI ID (e.g. name@upi)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <button onClick={saveBankDetails} className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm">
                Save Details
              </button>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between">
            <span className="font-semibold text-gray-800">Transaction History</span>
            <span className="text-sm text-gray-400">{wallet.totalTransactions} total</span>
          </div>
          <div className="divide-y divide-gray-100">
            {wallet.transactions.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No transactions yet</div>
            ) : (
              wallet.transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg
                      ${tx.type === "credit" ? "bg-green-100" : tx.type === "withdrawal" ? "bg-orange-100" : "bg-red-100"}`}>
                      {tx.type === "credit" ? "↓" : tx.type === "withdrawal" ? "⇄" : "↑"}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{tx.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN")} · Balance after: ₹{tx.balanceAfter.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${TYPE_STYLES[tx.type]}`}>
                    {TYPE_SIGNS[tx.type]}₹{tx.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            )}
          </div>
          {wallet.totalPages > 1 && (
            <div className="p-3 border-t border-gray-100 flex justify-between text-sm">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-blue-600 disabled:opacity-40">← Prev</button>
              <span className="text-gray-400">Page {page}/{wallet.totalPages}</span>
              <button disabled={page >= wallet.totalPages} onClick={() => setPage((p) => p + 1)} className="text-blue-600 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}