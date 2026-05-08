"use client";

import BillingPlans from "@/components/billing/BillingPlans";

import InvoicesTable from "@/components/billing/InvoicesTable";

import SubscriptionCard from "@/components/billing/SubscriptionCard";

import PaymentHistory from "@/components/billing/PaymentHistory";

export default function BillingPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <SubscriptionCard />

      <BillingPlans />

      <InvoicesTable />

      <PaymentHistory />
    </div>
  );
}