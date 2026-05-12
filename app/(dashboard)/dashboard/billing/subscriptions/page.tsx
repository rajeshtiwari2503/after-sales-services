"use client";
import { useEffect, useState } from "react";
import PaymentHistory from "@/components/billing/PaymentHistory";
export default function SubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    useEffect(() => {
        fetchSubscriptions();
    }, []);
    const fetchSubscriptions = async () => {
        const res = await fetch("/api/billing/subscriptions");
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
    };
    return (
        <div className="p-6">
            <PaymentHistory
            //  subscriptions={subscriptions} 
             />
        </div>
    );
}
