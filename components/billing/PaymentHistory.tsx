"use client";

export default function PaymentHistory() {
  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <h2 className="text-2xl font-black mb-6">
        Payment History
      </h2>

      <div className="space-y-4">
        <div className="border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold">
              Subscription Payment
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              12 May 2026
            </p>
          </div>

          <div className="font-black text-xl">
            ₹4999
          </div>
        </div>
      </div>
    </div>
  );
}