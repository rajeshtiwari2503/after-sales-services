// "use client";

// import BillingPlans from "@/components/billing/BillingPlans";
// import InvoicesTable from "@/components/billing/InvoicesTable";
// import PaymentHistory from "@/components/billing/PaymentHistory";
// import SubscriptionCard from "@/components/billing/SubscriptionCard";

 

// export default function BillingPage() {
//   return (
//     <div className="p-6 bg-slate-50 min-h-screen space-y-6">
//       <SubscriptionCard />

//       <BillingPlans />

//       <InvoicesTable />

//       <PaymentHistory />
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import BillingPlans from "@/components/billing/BillingPlans";
import SubscriptionCard from "@/components/billing/SubscriptionCard";
export default function BillingPage() {
const [plans, setPlans] = useState([]);
useEffect(() => {
fetchPlans();
}, []);
const fetchPlans = async () => {
const res = await fetch("/api/billing/plans");
const data = await res.json();
setPlans(data.plans || []);
};
return (
<div className="space-y-6 p-6">
<SubscriptionCard />
<BillingPlans plans={plans} />
</div>
);
}