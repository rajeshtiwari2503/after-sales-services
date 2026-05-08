"use client";

export default function SubscriptionCard() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[30px] text-white p-8">
      <p className="text-lg">
        Current Plan
      </p>

      <h2 className="text-5xl font-black mt-4">
        PRO
      </h2>

      <p className="mt-4 text-blue-100">
        Active subscription with enterprise features
      </p>
    </div>
  );
}