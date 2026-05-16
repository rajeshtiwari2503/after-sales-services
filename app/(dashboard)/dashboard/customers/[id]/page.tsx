"use client";
 
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function CustomerDetailsPage() {
const params = useParams();
const [customer, setCustomer] = useState<any>(null);

useEffect(() => {
if (params?.id) {
fetchCustomer();
}
}, [params?.id]);
const fetchCustomer = async () => {
const res = await fetch(`/api/customers/${params.id}`);
const data = await res.json();
setCustomer(data.customer);
};
if (!customer) return <div className="p-6">Loading...</div>;
return (
<div className="p-6 space-y-4">
<h1 className="text-3xl font-bold">{customer.name}</h1>
<p>{customer.email}</p>
<p>{customer.phone}</p>
</div>
);
}
