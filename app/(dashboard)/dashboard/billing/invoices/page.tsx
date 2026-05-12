"use client";
import { useEffect, useState } from "react";
import InvoicesTable from "@/components/billing/InvoicesTable";
export default function InvoicesPage() {
const [invoices, setInvoices] = useState([]);
useEffect(() => {
fetchInvoices();
}, []);
const fetchInvoices = async () => {
const res = await fetch("/api/billing/invoices");
const data = await res.json();
setInvoices(data.invoices || []);
};
return (
<div className="p-6">
<InvoicesTable 
// invoices={invoices} 
/>
</div>
);
}
