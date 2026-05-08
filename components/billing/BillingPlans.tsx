"use client";

export default function BillingPlans() {
  const plans = [
    {
      name: "FREE",
      price: "₹0",
    },

    {
      name: "PRO",
      price: "₹4999",
    },

    {
      name:
        "ENTERPRISE",
      price: "Custom",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map(
        (plan) => (
          <div
            key={plan.name}
            className="bg-white rounded-[30px] border border-slate-200 p-8"
          >
            <h2 className="text-3xl font-black">
              {plan.name}
            </h2>

            <p className="text-5xl font-black mt-6">
              {plan.price}
            </p>

            <button className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold mt-8">
              Choose Plan
            </button>
          </div>
        )
      )}
    </div>
  );
}